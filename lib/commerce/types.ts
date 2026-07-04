export type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export const LICENSE_STATUSES = [
  "pending",
  "active",
  "refunded",
  "revoked",
  "transferred",
  "archived",
] as const;

export const LICENSE_ORIGINS = [
  "shopify",
  "manual",
  "organization",
  "complimentary",
  "test",
] as const;

export const WEBHOOK_EVENT_STATUSES = [
  "received",
  "processed",
  "ignored_duplicate",
  "failed",
] as const;

export const DEFAULT_PRODUCT_KEY = "complete_v1";
export const PUBLIC_LICENSE_ID_PREFIX = "JDP-L";
export const UNLOCK_CODE_GROUP_LENGTH = 4;
export const UNLOCK_CODE_GROUP_COUNT = 4;

export type LicenseStatus = (typeof LICENSE_STATUSES)[number];
export type LicenseOrigin = (typeof LICENSE_ORIGINS)[number];
export type WebhookEventStatus = (typeof WEBHOOK_EVENT_STATUSES)[number];

export type PublicLicenseId = Brand<string, "PublicLicenseId">;
export type LicenseOwnerEmail = Brand<string, "LicenseOwnerEmail">;
export type BillingEmail = Brand<string, "BillingEmail">;
export type UnlockCode = Brand<string, "UnlockCode">;
export type ProductKey = Brand<string, "ProductKey">;
export type ShopifyOrderId = Brand<string, "ShopifyOrderId">;
export type ShopifyCustomerId = Brand<string, "ShopifyCustomerId">;

export type License = {
  id: string;
  publicLicenseId: PublicLicenseId;
  licenseOwnerEmail: LicenseOwnerEmail;
  billingEmail: BillingEmail | null;
  unlockCodeHash: string;
  licenseOrigin: LicenseOrigin;
  purchaseDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  activatedAt: Date | null;
  status: LicenseStatus;
  lastUsedAt: Date | null;
  recoveryEnabled: boolean;
  version: number;
  notes: string | null;
  shopifyOrderId: ShopifyOrderId | null;
  shopifyCustomerId: ShopifyCustomerId | null;
  productKey: ProductKey;
};

export type LicenseEvent = {
  id: string;
  licenseId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export type WebhookEvent = {
  id: string;
  provider: string;
  webhookId: string;
  topic: string | null;
  shopifyOrderId: ShopifyOrderId | null;
  status: WebhookEventStatus;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  processedAt: Date | null;
};
