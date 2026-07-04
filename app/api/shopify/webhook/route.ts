import { NextResponse } from "next/server";

import { handleShopifyWebhook } from "@/lib/commerce/shopify";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const result = await handleShopifyWebhook(request);

  return NextResponse.json(result.body, {
    status: result.status,
  });
}
