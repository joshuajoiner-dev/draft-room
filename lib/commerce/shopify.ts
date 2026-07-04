import { createHmac, randomUUID, timingSafeEqual } from "crypto";

import { getCommerceServerConfig } from "./env";
import { recordWebhookEventOnce } from "./events";
import type { ShopifyOrderId } from "./types";
import { validateShopifyOrderId } from "./validation";

type ShopifyWebhookHeaders = {
  hmac: string | null;
  shopDomain: string | null;
  topic: string | null;
  webhookId: string | null;
};

type ShopifyWebhookResult = {
  body: {
    correlationId: string;
    duplicate?: boolean;
    error?: string;
    ok: boolean;
  };
  status: number;
};

type SafeWebhookMetadata = {
  correlationId: string;
  hasPayloadId: boolean;
  shopDomain: string | null;
  topic: string | null;
};

type ShopifyPayloadShape = {
  admin_graphql_api_id?: unknown;
  id?: unknown;
};

const SHOPIFY_HMAC_HEADER = "x-shopify-hmac-sha256";
const SHOPIFY_WEBHOOK_ID_HEADER = "x-shopify-webhook-id";
const SHOPIFY_TOPIC_HEADER = "x-shopify-topic";
const SHOPIFY_SHOP_DOMAIN_HEADER = "x-shopify-shop-domain";

function logShopifyWebhook(
  level: "info" | "warn" | "error",
  message: string,
  details: Record<string, string | number | boolean | null | undefined>,
): void {
  console[level](
    JSON.stringify({
      component: "shopify_webhook",
      message,
      ...details,
    }),
  );
}

function readShopifyHeaders(headers: Headers): ShopifyWebhookHeaders {
  return {
    hmac: headers.get(SHOPIFY_HMAC_HEADER),
    shopDomain: headers.get(SHOPIFY_SHOP_DOMAIN_HEADER),
    topic: headers.get(SHOPIFY_TOPIC_HEADER),
    webhookId: headers.get(SHOPIFY_WEBHOOK_ID_HEADER),
  };
}

function verifyShopifyHmac(rawBody: string, receivedHmac: string | null, secret: string): boolean {
  if (!receivedHmac) {
    return false;
  }

  const expectedHmac = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const expectedBuffer = Buffer.from(expectedHmac, "utf8");
  const receivedBuffer = Buffer.from(receivedHmac, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

function parseVerifiedJsonPayload(rawBody: string): unknown {
  return JSON.parse(rawBody) as unknown;
}

function isPayloadRecord(payload: unknown): payload is ShopifyPayloadShape {
  return typeof payload === "object" && payload !== null && !Array.isArray(payload);
}

function extractShopifyOrderId(payload: unknown): ShopifyOrderId | null {
  if (!isPayloadRecord(payload)) {
    return null;
  }

  const rawOrderId = payload.admin_graphql_api_id ?? payload.id;

  if (typeof rawOrderId !== "string" && typeof rawOrderId !== "number") {
    return null;
  }

  const validation = validateShopifyOrderId(String(rawOrderId));

  return validation.ok ? validation.value : null;
}

function buildSafeMetadata(
  headers: ShopifyWebhookHeaders,
  payload: unknown,
  correlationId: string,
): SafeWebhookMetadata {
  return {
    correlationId,
    hasPayloadId: isPayloadRecord(payload) && "id" in payload,
    shopDomain: headers.shopDomain,
    topic: headers.topic,
  };
}

function buildMalformedPayloadMetadata(
  headers: ShopifyWebhookHeaders,
  correlationId: string,
): SafeWebhookMetadata {
  return {
    correlationId,
    hasPayloadId: false,
    shopDomain: headers.shopDomain,
    topic: headers.topic,
  };
}

async function recordVerifiedWebhookEvent(input: {
  correlationId: string;
  errorMessage?: string | null;
  headers: ShopifyWebhookHeaders;
  payload: unknown;
  status: "received" | "failed";
}): Promise<"recorded" | "duplicate"> {
  const webhookId = input.headers.webhookId ?? input.correlationId;
  const shopifyOrderId = extractShopifyOrderId(input.payload);
  const result = await recordWebhookEventOnce({
    errorMessage: input.errorMessage ?? null,
    metadata: buildSafeMetadata(input.headers, input.payload, input.correlationId),
    provider: "shopify",
    shopifyOrderId,
    status: input.status,
    topic: input.headers.topic,
    webhookId,
  });

  return result.status;
}

async function recordMalformedVerifiedWebhookEvent(input: {
  correlationId: string;
  headers: ShopifyWebhookHeaders;
}): Promise<"recorded" | "duplicate"> {
  const webhookId = input.headers.webhookId ?? input.correlationId;
  const result = await recordWebhookEventOnce({
    errorMessage: "Malformed verified Shopify webhook payload.",
    metadata: buildMalformedPayloadMetadata(input.headers, input.correlationId),
    provider: "shopify",
    status: "failed",
    topic: input.headers.topic,
    webhookId,
  });

  return result.status;
}

export async function handleShopifyWebhook(request: Request): Promise<ShopifyWebhookResult> {
  const correlationId = randomUUID();
  const headers = readShopifyHeaders(request.headers);
  const rawBody = await request.text();

  try {
    const config = getCommerceServerConfig();

    if (!config.commerceEnabled) {
      logShopifyWebhook("warn", "Commerce disabled", {
        correlationId,
        topic: headers.topic,
      });

      return {
        body: {
          correlationId,
          error: "Commerce is disabled.",
          ok: false,
        },
        status: 503,
      };
    }

    if (!verifyShopifyHmac(rawBody, headers.hmac, config.shopifyWebhookSecret)) {
      logShopifyWebhook("warn", "Invalid Shopify webhook signature", {
        correlationId,
        topic: headers.topic,
      });

      return {
        body: {
          correlationId,
          error: "Invalid webhook signature.",
          ok: false,
        },
        status: 401,
      };
    }

    let payload: unknown;

    try {
      payload = parseVerifiedJsonPayload(rawBody);
    } catch {
      const recordStatus = await recordMalformedVerifiedWebhookEvent({
        correlationId,
        headers,
      });

      logShopifyWebhook("warn", "Malformed verified Shopify webhook payload", {
        correlationId,
        duplicate: recordStatus === "duplicate",
        topic: headers.topic,
      });

      return {
        body: {
          correlationId,
          duplicate: recordStatus === "duplicate",
          error: "Malformed verified webhook payload.",
          ok: false,
        },
        status: recordStatus === "duplicate" ? 200 : 400,
      };
    }

    const recordStatus = await recordVerifiedWebhookEvent({
      correlationId,
      headers,
      payload,
      status: "received",
    });

    if (recordStatus === "duplicate") {
      logShopifyWebhook("info", "Duplicate Shopify webhook ignored", {
        correlationId,
        topic: headers.topic,
      });

      return {
        body: {
          correlationId,
          duplicate: true,
          ok: true,
        },
        status: 200,
      };
    }

    logShopifyWebhook("info", "Shopify webhook verified and recorded", {
      correlationId,
      topic: headers.topic,
    });

    return {
      body: {
        correlationId,
        ok: true,
      },
      status: 200,
    };
  } catch (error) {
    logShopifyWebhook("error", "Shopify webhook handling failed", {
      correlationId,
      errorName: error instanceof Error ? error.name : "UnknownError",
      topic: headers.topic,
    });

    return {
      body: {
        correlationId,
        error: "Webhook could not be processed.",
        ok: false,
      },
      status: 500,
    };
  }
}
