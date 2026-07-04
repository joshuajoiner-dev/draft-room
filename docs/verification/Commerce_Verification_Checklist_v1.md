# Commerce Verification Checklist v1

## Context

- [ ] Sprint 009B Milestone 1 completed.
- [ ] Git tag: `v0.9.0-commerce-foundation`.
- [ ] Commerce architecture reviewed: `docs/architecture/Commerce_Architecture_v1.md`.

## Pre-flight Checklist

- [ ] Git working tree is clean.
- [ ] Latest code is pushed.
- [ ] Vercel deployment is ready.
- [ ] Supabase migration is applied.
- [ ] Commerce table exists: `licenses`.
- [ ] Commerce table exists: `license_events`.
- [ ] Commerce table exists: `webhook_events`.
- [ ] `COMMERCE_ENABLED` is intentionally set.
- [ ] Required environment variables are configured.

## Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `NEXT_PUBLIC_UPGRADE_CHECKOUT_URL`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `COMMERCE_ENABLED`
- [ ] `SHOPIFY_WEBHOOK_SECRET`
- [ ] `POSTMARK_SERVER_TOKEN`
- [ ] `POSTMARK_FROM_EMAIL`
- [ ] `POSTMARK_MESSAGE_STREAM` optional
- [ ] `LICENSE_CODE_PEPPER`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

## Supabase Verification

- [ ] `licenses` table exists.
- [ ] `license_events` table exists.
- [ ] `webhook_events` table exists.
- [ ] RLS is enabled on commerce tables.
- [ ] No public commerce table access exists.
- [ ] Service role remains server-only.

## Shopify Verification

- [ ] Complete product exists.
- [ ] Checkout URL exists.
- [ ] Webhook destination points to `/api/shopify/webhook`.
- [ ] Webhook secret matches Vercel environment variable.
- [ ] Test purchase can be completed.

## Webhook Verification

- [ ] Valid webhook returns success.
- [ ] Invalid HMAC returns `401`.
- [ ] Duplicate webhook returns `200`.
- [ ] Duplicate webhook does not create a duplicate license.
- [ ] `webhook_events` row is created.

## License Verification

- [ ] License row is created.
- [ ] `public_license_id` is generated.
- [ ] `license_owner_email` is populated.
- [ ] `billing_email` is populated if available.
- [ ] `unlock_code_hash` is populated.
- [ ] Plaintext unlock code is not stored.
- [ ] `license_origin = shopify`.
- [ ] `status = active`.
- [ ] `product_key = complete_v1`.
- [ ] `activated_at` is null before unlock.
- [ ] `last_used_at` is null before unlock.

## License Events Verification

- [ ] `license_created` is recorded.
- [ ] `unlock_code_generated` is recorded.
- [ ] `email_sent` is recorded.
- [ ] `email_failed` is recorded if email fails.
- [ ] No raw unlock code exists in metadata.
- [ ] No secrets exist in metadata.

## Email Verification

- [ ] Email is received.
- [ ] Subject is correct.
- [ ] Unlock code is visible.
- [ ] Public license ID is visible.
- [ ] JoinDraftPick link works.
- [ ] Email copy is clear.
- [ ] Email is not in spam, if possible.

## Unlock Verification

- [ ] Valid unlock code succeeds.
- [ ] Invalid unlock code fails generically.
- [ ] `activated_at` is set on first successful unlock.
- [ ] `last_used_at` is updated.
- [ ] Browser unlock state is stored.
- [ ] Existing gated features unlock.

## Browser Storage Verification

Local storage key:

```text
draft-room-complete-unlocked
```

Allowed fields:

- [ ] `unlocked`
- [ ] `licenseId`
- [ ] `publicLicenseId`
- [ ] `productKey`
- [ ] `unlockedAt`
- [ ] `lastVerifiedAt`

Forbidden fields:

- [ ] Unlock code is not stored.
- [ ] Unlock hash is not stored.
- [ ] Email is not stored.
- [ ] Payment details are not stored.
- [ ] Shopify IDs are not stored.
- [ ] Secrets are not stored.

## Existing App Regression Test

- [ ] Create room.
- [ ] QR join.
- [ ] Player list refresh.
- [ ] Balanced Random.
- [ ] Captain Draft.
- [ ] Undo Pick.
- [ ] Print Teams.
- [ ] Admin Quick Guide.
- [ ] Manual Timer.

## Failure Mode Tests

- [ ] Wrong unlock code.
- [ ] Duplicate webhook.
- [ ] Invalid webhook.
- [ ] Missing Postmark token.
- [ ] Missing service role key.
- [ ] `COMMERCE_ENABLED=false`.
- [ ] Email failure after license creation.

## Rollback Plan

- [ ] Set `COMMERCE_ENABLED=false`.
- [ ] Revert most recent commerce commit if needed.
- [ ] Use Git tag `v0.9.0-commerce-foundation` as restore point.
- [ ] Preserve database rows before destructive changes.

## Final Sign-off

- Date:
- Tester:
- Environment:
- Commit hash:
- Vercel deployment URL:
- Shopify test order ID:
- Public license ID:
- Result: Pass / Fail
- Notes:
