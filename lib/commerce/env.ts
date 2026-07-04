type CommercePublicConfig = {
  appUrl: string;
  commerceEnabled: boolean;
  upgradeCheckoutUrl: string;
};

type EnabledCommerceServerConfig = CommercePublicConfig & {
  commerceEnabled: true;
  licenseCodePepper: string;
  postmarkFromEmail: string;
  postmarkMessageStream: string | null;
  postmarkServerToken: string;
  shopifyWebhookSecret: string;
  supabaseServiceRoleKey: string;
};

type DisabledCommerceServerConfig = CommercePublicConfig & {
  commerceEnabled: false;
};

export type CommerceServerConfig =
  | EnabledCommerceServerConfig
  | DisabledCommerceServerConfig;

export class CommerceEnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommerceEnvironmentError";
  }
}

const PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_UPGRADE_CHECKOUT_URL",
] as const;

const SERVER_ENV_KEYS = [
  "LICENSE_CODE_PEPPER",
  "POSTMARK_FROM_EMAIL",
  "POSTMARK_SERVER_TOKEN",
  "SHOPIFY_WEBHOOK_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function readRequiredEnv(key: string): string {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new CommerceEnvironmentError(`Missing required commerce environment variable: ${key}`);
  }

  return value;
}

function readOptionalEnv(key: string): string | null {
  return process.env[key]?.trim() || null;
}

function readCommerceEnabled(): boolean {
  const value = process.env.COMMERCE_ENABLED?.trim().toLowerCase();

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new CommerceEnvironmentError(
    "Missing or invalid commerce environment variable: COMMERCE_ENABLED must be true or false",
  );
}

function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new CommerceEnvironmentError(
      "Commerce server configuration can only be read from server-side code",
    );
  }
}

function readPublicConfig(): CommercePublicConfig {
  const commerceEnabled = readCommerceEnabled();

  return {
    appUrl: readRequiredEnv(PUBLIC_ENV_KEYS[0]),
    commerceEnabled,
    upgradeCheckoutUrl: readRequiredEnv(PUBLIC_ENV_KEYS[1]),
  };
}

export function getCommercePublicConfig(): CommercePublicConfig {
  return readPublicConfig();
}

export function getCommerceServerConfig(): CommerceServerConfig {
  assertServerOnly();

  const publicConfig = readPublicConfig();

  if (!publicConfig.commerceEnabled) {
    return {
      ...publicConfig,
      commerceEnabled: false,
    };
  }

  return {
    ...publicConfig,
    commerceEnabled: true,
    licenseCodePepper: readRequiredEnv(SERVER_ENV_KEYS[0]),
    postmarkFromEmail: readRequiredEnv(SERVER_ENV_KEYS[1]),
    postmarkMessageStream: readOptionalEnv("POSTMARK_MESSAGE_STREAM"),
    postmarkServerToken: readRequiredEnv(SERVER_ENV_KEYS[2]),
    shopifyWebhookSecret: readRequiredEnv(SERVER_ENV_KEYS[3]),
    supabaseServiceRoleKey: readRequiredEnv(SERVER_ENV_KEYS[4]),
  };
}
