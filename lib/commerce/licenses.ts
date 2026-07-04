import { createHash, randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";

import { getCommerceServerConfig } from "./env";
import { recordLicenseEvent } from "./events";
import {
  DEFAULT_PRODUCT_KEY,
  PUBLIC_LICENSE_ID_PREFIX,
  UNLOCK_CODE_GROUP_COUNT,
  UNLOCK_CODE_GROUP_LENGTH,
  type BillingEmail,
  type LicenseOwnerEmail,
  type PublicLicenseId,
  type ShopifyCustomerId,
  type ShopifyOrderId,
  type UnlockCode,
} from "./types";
import {
  validateBillingEmail,
  validateLicenseOwnerEmail,
  validateProductKey,
  validatePublicLicenseId,
  validateShopifyCustomerId,
  validateShopifyOrderId,
  validateUnlockCode,
} from "./validation";

type ShopifyOrderLicenseInput = {
  billingEmail: string | null;
  licenseOwnerEmail: string;
  purchaseDate: string | null;
  shopifyCustomerId: string | null;
  shopifyOrderId: string;
};

type LicenseCreationResult =
  | {
      licenseId: string;
      publicLicenseId: PublicLicenseId;
      status: "created";
      unlockCode: UnlockCode;
    }
  | {
      licenseId: string | null;
      publicLicenseId: PublicLicenseId | null;
      status: "already_exists";
    };

type InsertedLicenseRow = {
  id: string;
  public_license_id: string;
};

const LICENSE_ID_RANDOM_LENGTH = 10;
const MAX_LICENSE_INSERT_ATTEMPTS = 5;
const HUMAN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export class ShopifyLicensePayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyLicensePayloadError";
  }
}

function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error("Commerce license creation can only run on the server.");
  }
}

function getCommerceSupabaseClient() {
  assertServerOnly();

  const config = getCommerceServerConfig();

  if (!config.commerceEnabled) {
    throw new Error("Commerce license creation is disabled.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!supabaseUrl) {
    throw new Error("Missing required commerce environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  return {
    config,
    supabase: createClient(supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    }),
  };
}

function generateAlphabetToken(length: number): string {
  const bytes = randomBytes(length);
  let token = "";

  for (const byte of bytes) {
    token += HUMAN_CODE_ALPHABET[byte % HUMAN_CODE_ALPHABET.length];
  }

  return token;
}

function generatePublicLicenseId(): PublicLicenseId {
  const candidate = `${PUBLIC_LICENSE_ID_PREFIX}-${generateAlphabetToken(LICENSE_ID_RANDOM_LENGTH)}`;
  const validation = validatePublicLicenseId(candidate);

  if (!validation.ok) {
    throw new Error("Generated public license ID failed validation.");
  }

  return validation.value;
}

function generateUnlockCode(): UnlockCode {
  const candidate = generateAlphabetToken(UNLOCK_CODE_GROUP_COUNT * UNLOCK_CODE_GROUP_LENGTH);
  const validation = validateUnlockCode(candidate);

  if (!validation.ok) {
    throw new Error("Generated unlock code failed validation.");
  }

  return validation.value;
}

function hashUnlockCode(unlockCode: UnlockCode, pepper: string): string {
  return createHash("sha256").update(`${pepper}:${unlockCode}`).digest("hex");
}

function parseRequiredEmail(value: string): LicenseOwnerEmail {
  const validation = validateLicenseOwnerEmail(value);

  if (!validation.ok) {
    throw new ShopifyLicensePayloadError("Shopify order is missing a valid license owner email.");
  }

  return validation.value;
}

function parseBillingEmail(value: string | null): BillingEmail | null {
  const validation = validateBillingEmail(value);

  if (!validation.ok) {
    throw new ShopifyLicensePayloadError("Shopify order has an invalid billing email.");
  }

  return validation.value;
}

function parseRequiredShopifyOrderId(value: string): ShopifyOrderId {
  const validation = validateShopifyOrderId(value);

  if (!validation.ok || !validation.value) {
    throw new ShopifyLicensePayloadError("Shopify order is missing a valid order ID.");
  }

  return validation.value;
}

function parseShopifyCustomerId(value: string | null): ShopifyCustomerId | null {
  const validation = validateShopifyCustomerId(value);

  if (!validation.ok) {
    throw new ShopifyLicensePayloadError("Shopify order has an invalid customer ID.");
  }

  return validation.value;
}

function parsePurchaseDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ShopifyLicensePayloadError("Shopify order has an invalid purchase date.");
  }

  return date.toISOString();
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function findLicenseByShopifyOrderId(shopifyOrderId: ShopifyOrderId): Promise<{
  licenseId: string | null;
  publicLicenseId: PublicLicenseId | null;
}> {
  const { supabase } = getCommerceSupabaseClient();
  const { data, error } = await supabase
    .from("licenses")
    .select("id,public_license_id")
    .eq("shopify_order_id", shopifyOrderId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to look up existing Shopify license: ${error.message}`);
  }

  const publicLicenseIdValidation =
    typeof data?.public_license_id === "string"
      ? validatePublicLicenseId(data.public_license_id)
      : null;

  return {
    licenseId: typeof data?.id === "string" ? data.id : null,
    publicLicenseId: publicLicenseIdValidation?.ok ? publicLicenseIdValidation.value : null,
  };
}

export async function createLicenseFromShopifyOrder(
  input: ShopifyOrderLicenseInput,
): Promise<LicenseCreationResult> {
  const licenseOwnerEmail = parseRequiredEmail(input.licenseOwnerEmail);
  const billingEmail = parseBillingEmail(input.billingEmail);
  const shopifyOrderId = parseRequiredShopifyOrderId(input.shopifyOrderId);
  const shopifyCustomerId = parseShopifyCustomerId(input.shopifyCustomerId);
  const purchaseDate = parsePurchaseDate(input.purchaseDate);
  const productKeyValidation = validateProductKey(DEFAULT_PRODUCT_KEY);

  if (!productKeyValidation.ok) {
    throw new Error("Default commerce product key failed validation.");
  }

  const existingLicense = await findLicenseByShopifyOrderId(shopifyOrderId);

  if (existingLicense.licenseId || existingLicense.publicLicenseId) {
    return {
      ...existingLicense,
      status: "already_exists",
    };
  }

  for (let attempt = 0; attempt < MAX_LICENSE_INSERT_ATTEMPTS; attempt += 1) {
    const publicLicenseId = generatePublicLicenseId();
    const unlockCode = generateUnlockCode();
    const { config, supabase } = getCommerceSupabaseClient();
    const unlockCodeHash = hashUnlockCode(unlockCode, config.licenseCodePepper);
    const { data, error } = await supabase
      .from("licenses")
      .insert({
        billing_email: billingEmail,
        license_origin: "shopify",
        license_owner_email: licenseOwnerEmail,
        product_key: productKeyValidation.value,
        public_license_id: publicLicenseId,
        purchase_date: purchaseDate,
        shopify_customer_id: shopifyCustomerId,
        shopify_order_id: shopifyOrderId,
        status: "active",
        unlock_code_hash: unlockCodeHash,
      })
      .select("id,public_license_id")
      .single<InsertedLicenseRow>();

    if (!error && data) {
      await recordLicenseEvent({
        eventType: "license_created",
        licenseId: data.id,
        metadata: {
          licenseOrigin: "shopify",
          productKey: productKeyValidation.value,
          shopifyOrderId,
        },
      });

      await recordLicenseEvent({
        eventType: "unlock_code_generated",
        licenseId: data.id,
        metadata: {
          deliveryPending: true,
          productKey: productKeyValidation.value,
        },
      });

      return {
        licenseId: data.id,
        publicLicenseId,
        status: "created",
        unlockCode,
      };
    }

    if (isUniqueConstraintError(error)) {
      const existingLicense = await findLicenseByShopifyOrderId(shopifyOrderId);

      if (existingLicense.licenseId || existingLicense.publicLicenseId) {
        return {
          ...existingLicense,
          status: "already_exists",
        };
      }

      continue;
    }

    throw new Error(`Failed to create Shopify license: ${error?.message ?? "unknown error"}`);
  }

  throw new Error("Failed to create Shopify license after retrying unique ID generation.");
}
