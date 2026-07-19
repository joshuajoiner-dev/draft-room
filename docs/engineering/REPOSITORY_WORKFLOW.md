# Repository Workflow

Engineering standards for JoinDraftPick.

This document defines how we work in the repository. For product philosophy, see [docs/product/PRODUCT_NORTH_STAR.md](../product/PRODUCT_NORTH_STAR.md). For agent operating rules, see [AGENTS.md](../../AGENTS.md).

---

## Repository Structure

```
JoinDraftPick/
├── app/                          Next.js App Router
│   ├── page.tsx                  Homepage
│   ├── layout.tsx                Root layout
│   ├── globals.css               Design tokens and Arena styles
│   ├── room/                     Room pages (new, join, admin, draft, view)
│   └── api/                      API routes (Shopify webhook, commerce health)
├── components/
│   ├── layout/                   AppFrame and shell components
│   ├── room/                     Room workflow components
│   └── presentation/             Reserved sponsor/presentation slots
├── lib/
│   ├── room/                     Queries, actions, validation
│   ├── commerce/                 Licensing, Shopify, email, events
│   └── db/                       Supabase client
├── supabase/
│   └── schema.sql                Database schema
├── docs/
│   ├── product/                  Product philosophy
│   ├── design/                   Design direction
│   ├── architecture/             System architecture
│   ├── verification/             Release and commerce checklists
│   └── engineering/              Engineering standards (this document)
├── ROADMAP.md                    Sprint plan
├── DEPLOY.md                     Production deployment
├── RELEASE_v1.0.md               v1.0 scope and limitations
├── SETUP.md                      Local development setup
└── AGENTS.md                     AI agent operating instructions
```

**Stack:** Next.js 14, React 18, TypeScript, Supabase, pnpm, Vercel.

**Key boundaries:**

- `components/room/` owns room UI and organizer workflow.
- `lib/room/` owns server actions and queries for gameplay tables.
- `lib/commerce/` owns licensing, webhooks, and email — server-side only.
- `components/presentation/` owns reserved sponsor slots — inactive by default.
- `app/api/` owns webhook and health endpoints.

Do not blur these boundaries without explicit architectural reason.

---

## Preferred Workflow

1. **Read before writing.** Inspect relevant docs, then the code you will modify.
2. **Understand the workflow.** Know which protected path your change affects (see [AGENTS.md](../../AGENTS.md), Core Workflow Protection).
3. **Plan the smallest correct change.** One concern per branch when possible.
4. **Implement.** Match existing patterns, naming, and types.
5. **Verify.** Run lint, manual regression on affected workflows, and commerce checks if applicable.
6. **Document.** Update or cross-reference docs when behavior changes.
7. **Commit.** Small, coherent commits with clear messages.
8. **Review.** PR or session review before production merge.

Inspect before editing. Understand before changing.

---

## Branch Strategy

- **`main`** is production. It deploys to Vercel.
- **Feature branches** carry focused work. Name descriptively: `feature/`, `fix/`, `docs/`, or session-specific names.
- **Stay on the assigned branch** unless the task requires otherwise.
- **Do not merge, rebase, reset, squash, or rewrite history** unless explicitly requested.
- **Do not force-push to `main`.**

One branch, one concern. Avoid long-lived branches that accumulate unrelated changes.

---

## Commit Philosophy

- **Small coherent commits.** Each commit should represent one logical change.
- **Explain why, not just what.** A commit message should make sense in six months.
- **Never solve unrelated problems** in the same commit.
- **Never commit secrets.** `.env.local`, API keys, webhook secrets, and service role keys stay local.
- **Stage intentionally.** Only include files relevant to the change.
- **Do not commit unless asked.** AI sessions commit only when explicitly instructed.

Example:

```
docs: establish repository governance foundation
```

Not:

```
fix stuff and also update docs and refactor timer
```

---

## Code Review Expectations

Every change should be reviewable by a future maintainer who has read [AGENTS.md](../../AGENTS.md).

Reviewers check:

1. Does the change serve a stated goal?
2. Are protected workflows preserved?
3. Is the diff scoped and readable?
4. Does it follow product principles (participation speed, simplicity, venue authenticity)?
5. Are commerce changes compliant with [Commerce_Architecture_v1.md](../architecture/Commerce_Architecture_v1.md)?
6. Are sponsor changes compliant with [SPONSORSHIP_FRAMEWORK.md](../SPONSORSHIP_FRAMEWORK.md)?
7. Are Arena UI changes compliant with [ARENA_DESIGN_DIRECTION.md](../design/ARENA_DESIGN_DIRECTION.md)?
8. Are secrets excluded?
9. Is documentation updated or cross-referenced?

Reject changes that solve unrelated problems, introduce player authentication without scope, or weaken Lite-tier access.

---

## Testing Expectations

JoinDraftPick does not yet have a comprehensive automated test suite. Manual verification is required.

**Always verify when touching:**

- Room creation and admin page load
- Player join (link and QR)
- Player import with duplicate handling
- Balanced Teams generation
- Quick Random and Captain Draft (Complete)
- Captain Draft picking, undo, and admin override
- Team display and print
- Commerce unlock flow (if commerce files changed)

Use checklists:

- [DEPLOY.md](../../DEPLOY.md) — Production verification (Section 6)
- [SETUP.md](../../SETUP.md) — Local manual test checklist
- [Commerce_Verification_Checklist_v1.md](../verification/Commerce_Verification_Checklist_v1.md) — Full commerce regression

Run `pnpm lint` before committing code changes.

When automated tests are added, they should cover protected workflows first — not trivial assertions.

---

## Documentation Expectations

Documentation is part of the product.

- **Product philosophy** lives in `docs/product/` and `docs/VISION_2027.md`.
- **Design direction** lives in `docs/design/`.
- **Architecture** lives in `docs/architecture/`.
- **Verification checklists** live in `docs/verification/`.
- **Engineering standards** live in `docs/engineering/` and `AGENTS.md`.
- **Sprint plans** live in `ROADMAP.md`.

When changing behavior:

- Update the relevant doc if the change affects documented behavior.
- Cross-reference existing docs instead of duplicating content.
- Keep writing professional, timeless, and evergreen. No buzzwords. No filler.

Documentation-only changes do not require application code changes.

---

## Production Safety

JoinDraftPick is live. Production safety is non-negotiable.

**Before deploying:**

1. Confirm the build passes (`pnpm build`).
2. Confirm lint passes (`pnpm lint`).
3. Run the manual regression checklist for affected workflows.
4. Confirm environment variables are set in Vercel (see [DEPLOY.md](../../DEPLOY.md)).
5. Confirm Supabase schema matches `supabase/schema.sql` for any migration.

**Commerce safety:**

- Webhook HMAC verification uses raw request body.
- Webhook processing is idempotent.
- No plaintext unlock codes in database or logs.
- Commerce tables use restrictive RLS — server-side only.
- `COMMERCE_ENABLED` can disable commerce without breaking Lite gameplay.

**Rollback:**

- Set `COMMERCE_ENABLED=false` to disable commerce features.
- Use git tags as restore points (see commerce verification checklist).
- Preserve database rows before destructive changes.

See [Commerce_Architecture_v1.md](../architecture/Commerce_Architecture_v1.md) for failure modes and recovery paths.

---

## Supabase Migration Policy

Database changes require deliberate handling.

**Gameplay tables** (rooms, players, teams, assignments, captain picks, undo):

- Schema lives in `supabase/schema.sql`.
- Apply changes to production via Supabase SQL Editor.
- Test locally before applying to production.
- Gameplay table RLS may be permissive — a future security sprint will review separately.

**Commerce tables** (licenses, license_events, webhook_events):

- Must use restrictive RLS from day one.
- No public select, insert, update, or delete.
- Server-side access only via service role in API routes and server actions.
- Follow [Commerce_Architecture_v1.md](../architecture/Commerce_Architecture_v1.md).

**Migration rules:**

1. Write the SQL change in `supabase/schema.sql` first.
2. Test against a local or staging Supabase project.
3. Apply to production during a low-traffic window.
4. Verify with the commerce or gameplay checklist as appropriate.
5. Never drop production data without explicit approval and backup.

**Sponsor tables:** Do not create sponsor database migrations until UX is proven. See [SPONSORSHIP_FRAMEWORK.md](../SPONSORSHIP_FRAMEWORK.md), Recommended Rollout Sequence.

---

## Definition of Complete Work

Work is complete when all of the following are true:

1. **Goal met.** The stated objective is achieved.
2. **Workflows intact.** Protected paths function correctly, or regressions are documented and accepted.
3. **Build clean.** `pnpm build` and `pnpm lint` pass.
4. **Manually verified.** Affected workflows tested per the checklists above.
5. **Scoped diff.** No unrelated changes included.
6. **Docs current.** Behavior changes reflected in or cross-referenced from relevant docs.
7. **No secrets.** Working tree contains no committed credentials.
8. **Repository improved.** Code left cleaner than found, within scope.

Leave the repository better than you found it.

---

## Core Engineering Principles

These bear repeating:

- Inspect before editing.
- Understand before changing.
- Small coherent commits.
- Never solve unrelated problems.
- Leave the repository better than you found it.

When engineering principles conflict with product principles, product principles win.

More Play. Less Waiting.
