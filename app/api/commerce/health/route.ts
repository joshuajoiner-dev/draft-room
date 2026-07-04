import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CommerceHealthResponse = {
  checks: {
    appUrl: boolean;
    commerceEnabled: boolean;
    licensePepper: boolean;
    postmarkFromEmail: boolean;
    postmarkToken: boolean;
    shopifySecret: boolean;
    supabase: boolean;
  };
  environment: string;
  status: "ok" | "error";
};

function hasEnvValue(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

async function checkSupabase(): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });
    const { error } = await supabase.from("licenses").select("id").limit(1);

    return !error;
  } catch {
    return false;
  }
}

export async function GET() {
  const checks: CommerceHealthResponse["checks"] = {
    appUrl: hasEnvValue("NEXT_PUBLIC_APP_URL"),
    commerceEnabled: process.env.COMMERCE_ENABLED?.trim().toLowerCase() === "true",
    licensePepper: hasEnvValue("LICENSE_CODE_PEPPER"),
    postmarkFromEmail: hasEnvValue("POSTMARK_FROM_EMAIL"),
    postmarkToken: hasEnvValue("POSTMARK_SERVER_TOKEN"),
    shopifySecret: hasEnvValue("SHOPIFY_WEBHOOK_SECRET"),
    supabase: await checkSupabase(),
  };
  const allChecksPassed = Object.values(checks).every(Boolean);
  const body: CommerceHealthResponse = {
    status: allChecksPassed ? "ok" : "error",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    checks,
  };

  return NextResponse.json(body, {
    status: allChecksPassed ? 200 : 500,
  });
}
