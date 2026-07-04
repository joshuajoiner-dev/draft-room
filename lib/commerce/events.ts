import { createClient } from "@supabase/supabase-js";

import { getCommerceServerConfig } from "./env";
import type { WebhookEventStatus } from "./types";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type EventMetadata = Record<string, unknown>;
type SafeEventMetadata = Record<string, JsonValue>;

type LicenseEventInput = {
  licenseId: string;
  eventType: string;
  metadata?: EventMetadata;
};

type WebhookEventInput = {
  webhookId: string;
  status: WebhookEventStatus;
  errorMessage?: string | null;
  metadata?: EventMetadata;
  processedAt?: string | null;
  provider?: string;
  shopifyOrderId?: string | null;
  topic?: string | null;
};

type RecordWebhookEventResult =
  | {
      status: "recorded";
    }
  | {
      status: "duplicate";
    };

const SENSITIVE_KEY_PARTS = [
  "authorization",
  "card",
  "codehash",
  "code_hash",
  "cvv",
  "cvc",
  "licensecode",
  "license_code",
  "number",
  "pan",
  "password",
  "secret",
  "token",
  "unlockcode",
  "unlock_code",
] as const;

const REDACTED = "[REDACTED]";
const MAX_METADATA_DEPTH = 8;

function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error("Commerce event logging can only run on the server.");
  }
}

function getCommerceSupabaseClient() {
  assertServerOnly();

  const config = getCommerceServerConfig();

  if (!config.commerceEnabled) {
    throw new Error("Commerce event logging is disabled.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!supabaseUrl) {
    throw new Error("Missing required commerce environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  return createClient(supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

function normalizeMetadataKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function isSensitiveKey(key: string): boolean {
  const normalizedKey = normalizeMetadataKey(key);

  return SENSITIVE_KEY_PARTS.some((part) => normalizedKey.includes(part));
}

function looksLikeUnlockCode(value: string): boolean {
  const normalized = value.replace(/[\s-]+/g, "").toUpperCase();

  return /^[A-Z0-9]{16}$/.test(normalized);
}

function looksLikePaymentCard(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function sanitizeMetadataValue(value: unknown, depth: number): JsonValue {
  if (depth > MAX_METADATA_DEPTH) {
    return "[MAX_DEPTH]";
  }

  if (value === null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    if (looksLikeUnlockCode(value) || looksLikePaymentCard(value)) {
      return REDACTED;
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMetadataValue(item, depth + 1));
  }

  if (typeof value === "object") {
    const safeObject: SafeEventMetadata = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      safeObject[key] = isSensitiveKey(key)
        ? REDACTED
        : sanitizeMetadataValue(nestedValue, depth + 1);
    }

    return safeObject;
  }

  return String(value);
}

export function sanitizeCommerceEventMetadata(metadata: EventMetadata = {}): SafeEventMetadata {
  return sanitizeMetadataValue(metadata, 0) as SafeEventMetadata;
}

export async function recordLicenseEvent(input: LicenseEventInput): Promise<void> {
  const supabase = getCommerceSupabaseClient();
  const { error } = await supabase.from("license_events").insert({
    event_type: input.eventType,
    license_id: input.licenseId,
    metadata: sanitizeCommerceEventMetadata(input.metadata),
  });

  if (error) {
    throw new Error(`Failed to record license event: ${error.message}`);
  }
}

export async function recordWebhookEvent(input: WebhookEventInput): Promise<void> {
  const result = await recordWebhookEventOnce(input);

  if (result.status === "duplicate") {
    throw new Error(`Failed to record webhook event: duplicate webhook_id ${input.webhookId}`);
  }
}

export async function recordWebhookEventOnce(
  input: WebhookEventInput,
): Promise<RecordWebhookEventResult> {
  const supabase = getCommerceSupabaseClient();
  const { error } = await supabase.from("webhook_events").insert({
    error_message: input.errorMessage ?? null,
    metadata: sanitizeCommerceEventMetadata(input.metadata),
    processed_at: input.processedAt ?? null,
    provider: input.provider ?? "shopify",
    shopify_order_id: input.shopifyOrderId ?? null,
    status: input.status,
    topic: input.topic ?? null,
    webhook_id: input.webhookId,
  });

  if (error) {
    if ("code" in error && error.code === "23505") {
      return {
        status: "duplicate",
      };
    }

    throw new Error(`Failed to record webhook event: ${error.message}`);
  }

  return {
    status: "recorded",
  };
}
