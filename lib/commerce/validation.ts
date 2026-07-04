import {
  DEFAULT_PRODUCT_KEY,
  LICENSE_ORIGINS,
  LICENSE_STATUSES,
  PUBLIC_LICENSE_ID_PREFIX,
  UNLOCK_CODE_GROUP_COUNT,
  UNLOCK_CODE_GROUP_LENGTH,
  WEBHOOK_EVENT_STATUSES,
  type BillingEmail,
  type LicenseOrigin,
  type LicenseOwnerEmail,
  type LicenseStatus,
  type ProductKey,
  type PublicLicenseId,
  type ShopifyCustomerId,
  type ShopifyOrderId,
  type UnlockCode,
  type WebhookEventStatus,
} from "./types";

type ValidationResult<TValue> =
  | {
      ok: true;
      value: TValue;
    }
  | {
      ok: false;
      error: string;
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRODUCT_KEY_PATTERN = /^[a-z][a-z0-9_]{2,63}$/;
const SHOPIFY_ID_PATTERN = /^[A-Za-z0-9:/.#_-]{3,128}$/;

const UNLOCK_CODE_ALLOWED_CHARACTERS = /^[A-Z0-9]+$/;
const PUBLIC_LICENSE_ID_PATTERN = new RegExp(
  `^${PUBLIC_LICENSE_ID_PREFIX}-[A-Z0-9]{6,16}$`,
);

export function isLicenseStatus(value: string): value is LicenseStatus {
  return LICENSE_STATUSES.includes(value as LicenseStatus);
}

export function isLicenseOrigin(value: string): value is LicenseOrigin {
  return LICENSE_ORIGINS.includes(value as LicenseOrigin);
}

export function isWebhookEventStatus(value: string): value is WebhookEventStatus {
  return WEBHOOK_EVENT_STATUSES.includes(value as WebhookEventStatus);
}

export function normalizePublicLicenseId(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeUnlockCode(value: string): string {
  return value.replace(/[\s-]+/g, "").trim().toUpperCase();
}

export function formatUnlockCode(value: UnlockCode): string {
  const groups = value.match(new RegExp(`.{1,${UNLOCK_CODE_GROUP_LENGTH}}`, "g"));

  return groups?.join("-") ?? value;
}

export function normalizeProductKey(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeShopifyId(value: string): string {
  return value.trim();
}

export function validatePublicLicenseId(value: string): ValidationResult<PublicLicenseId> {
  const normalized = normalizePublicLicenseId(value);

  if (!PUBLIC_LICENSE_ID_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: `public_license_id must look like ${PUBLIC_LICENSE_ID_PREFIX}-ABC123`,
    };
  }

  return {
    ok: true,
    value: normalized as PublicLicenseId,
  };
}

export function validateLicenseOwnerEmail(value: string): ValidationResult<LicenseOwnerEmail> {
  const normalized = normalizeEmail(value);

  if (!EMAIL_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "license_owner_email must be a valid email address",
    };
  }

  return {
    ok: true,
    value: normalized as LicenseOwnerEmail,
  };
}

export function validateBillingEmail(value: string | null): ValidationResult<BillingEmail | null> {
  if (value === null || value.trim() === "") {
    return {
      ok: true,
      value: null,
    };
  }

  const normalized = normalizeEmail(value);

  if (!EMAIL_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "billing_email must be a valid email address when provided",
    };
  }

  return {
    ok: true,
    value: normalized as BillingEmail,
  };
}

export function validateUnlockCode(value: string): ValidationResult<UnlockCode> {
  const normalized = normalizeUnlockCode(value);
  const expectedLength = UNLOCK_CODE_GROUP_COUNT * UNLOCK_CODE_GROUP_LENGTH;

  if (
    normalized.length !== expectedLength ||
    !UNLOCK_CODE_ALLOWED_CHARACTERS.test(normalized)
  ) {
    return {
      ok: false,
      error: `unlock_code must be ${expectedLength} letters or numbers`,
    };
  }

  return {
    ok: true,
    value: normalized as UnlockCode,
  };
}

export function validateProductKey(value: string): ValidationResult<ProductKey> {
  const normalized = normalizeProductKey(value || DEFAULT_PRODUCT_KEY);

  if (!PRODUCT_KEY_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "product_key must use lowercase letters, numbers, and underscores",
    };
  }

  return {
    ok: true,
    value: normalized as ProductKey,
  };
}

export function validateShopifyOrderId(
  value: string | null,
): ValidationResult<ShopifyOrderId | null> {
  if (value === null || value.trim() === "") {
    return {
      ok: true,
      value: null,
    };
  }

  const normalized = normalizeShopifyId(value);

  if (!SHOPIFY_ID_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "shopify_order_id contains unsupported characters",
    };
  }

  return {
    ok: true,
    value: normalized as ShopifyOrderId,
  };
}

export function validateShopifyCustomerId(
  value: string | null,
): ValidationResult<ShopifyCustomerId | null> {
  if (value === null || value.trim() === "") {
    return {
      ok: true,
      value: null,
    };
  }

  const normalized = normalizeShopifyId(value);

  if (!SHOPIFY_ID_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "shopify_customer_id contains unsupported characters",
    };
  }

  return {
    ok: true,
    value: normalized as ShopifyCustomerId,
  };
}
