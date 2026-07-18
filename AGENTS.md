# JoinDraftPick — Agent Operating Instructions

This document is the first reference for every Cursor, Codex, and AI engineering session in this repository.

Read it before modifying code. When guidance conflicts, product philosophy wins over convenience.

---

## Product Identity

**JoinDraftPick** is a live team-creation room for classrooms, sports, camps, clubs, and community events.

The product helps one organizer on one device get people into teams quickly — without accounts, without setup friction, and without turning organization into a software project.

The public brand is **JoinDraftPick**. Some UI surfaces still use **Draft Room** as a working name. Treat them as the same product unless a task explicitly requires renaming.

**JoinDraftPick Lite** is always free. **JoinDraftPick Complete** unlocks the fuller organizer toolkit through a simple purchase-and-unlock flow.

For founding context, see [docs/FOUNDING.md](docs/FOUNDING.md).

---

## Product Purpose

JoinDraftPick removes organizational friction so people begin playing sooner.

Organizers should spend less time configuring software and more time leading the activity they came for. Players should join by name, see teams form, and participate — not navigate accounts, permissions, or administrative complexity.

The central promise:

**One Organizer. One Device. One Minute.**

For the full founder philosophy, see [docs/product/PRODUCT_NORTH_STAR.md](docs/product/PRODUCT_NORTH_STAR.md).

---

## Product Principles

These principles govern every engineering decision:

1. **More Play. Less Waiting.** Success is measured by how quickly people begin participating — not by time spent inside the app.
2. **Participation over complexity.** Remove steps before adding features.
3. **Simplicity over feature bloat.** The Lite experience must remain genuinely useful.
4. **Speed over unnecessary customization.** Defaults should work for most organizers on first use.
5. **Clarity over cleverness.** One obvious next action beats many optional paths.
6. **Calm confidence over loud marketing.** The product should feel ready, not sold.
7. **Software should disappear.** Only the activity should remain.

Technology quietly supports play. Technology never competes with play.

For enduring vision language, see [docs/VISION_2027.md](docs/VISION_2027.md).

---

## Product Experience Standards

Every change should preserve these experience standards:

- **Fast loading.** No heavy dependencies or blocking assets on critical paths.
- **Minimal decisions.** Reduce choices during room setup and team creation.
- **One obvious next action.** The organizer should always know what to do next.
- **Large, readable typography.** Rooms are used in gyms, classrooms, and outdoor settings.
- **Mobile-first reliability.** Organizers often run rooms from a phone or tablet.
- **Motion with purpose.** Animation only when it improves understanding — never for decoration.
- **Every pixel has a purpose.** Visual noise is organizational friction.

The room experience — the **Arena** — should feel like entering a real future gym where an event is about to begin. Not science fiction. Not enterprise SaaS. Not a spreadsheet.

For Arena-specific design direction, see [docs/design/ARENA_DESIGN_DIRECTION.md](docs/design/ARENA_DESIGN_DIRECTION.md).

---

## Supported Draft Modes

JoinDraftPick supports three team-creation modes:

| Mode | Tier | Purpose |
| --- | --- | --- |
| **Balanced Teams** | Lite (free) | Even team sizes from the player pool. The default path for most organizers. |
| **Quick Random** | Complete | Fully random assignment for the fastest possible team split. |
| **Captain Draft** | Complete | Captains assigned to their own teams; players picked by round with admin override support. |

Mode behavior is documented in [RELEASE_v1.0.md](RELEASE_v1.0.md).

When modifying draft modes:

- Preserve the organizer workflow: import players → choose format → generate teams → invite → begin.
- Do not add mode-specific complexity that slows first-time setup.
- Complete-gated modes must degrade gracefully when locked.
- Captain Draft admin overrides and finalized-room lock behavior are protected workflows.

---

## Core Workflow Protection

These workflows are production-critical. Treat them as protected:

1. **Room creation** — Home → create room → admin page opens with code, link, and QR.
2. **Player joining** — Join link or QR → enter name → appear in live player list.
3. **Player import** — Admin paste (line, comma, or tab-separated) with duplicate skipping.
4. **Balanced Teams** — Generate even teams from current player pool.
5. **Quick Random** — Instant random team assignment (Complete).
6. **Captain Draft** — Setup, picking, undo, admin override, finalized lock.
7. **Team display and print** — Generated teams visible and printable.
8. **Commerce unlock** — Shopify purchase → webhook → license → email → browser unlock.

Before merging changes that touch these paths, run the regression checks in [docs/verification/Commerce_Verification_Checklist_v1.md](docs/verification/Commerce_Verification_Checklist_v1.md) (Existing App Regression Test section) and the manual checklist in [DEPLOY.md](DEPLOY.md).

Do not refactor protected workflows unless the task explicitly requires it.

---

## Sponsorship Philosophy

Sponsors belong to the venue — not the workflow.

Sponsorship in JoinDraftPick should feel like signage at a well-run sporting venue: scoreboard ribbons, gym banners, roster footers, tournament programs. It should never feel like web advertising.

Hard rules:

- No popups, interstitials, autoplay video, or flashing animation.
- No sponsor content in organizer setup or decision flows.
- No sponsor content that blocks joining, drafting, printing, or unlocking.
- Sponsor presence must remain secondary to players, teams, timer, and draft action.

Presentation slots exist in `components/presentation/`. Sponsor components must render nothing when inactive.

For placement rankings, data model guidance, and rollout sequence, see [docs/SPONSORSHIP_FRAMEWORK.md](docs/SPONSORSHIP_FRAMEWORK.md).

---

## Visual Philosophy

The Arena aesthetic communicates:

- Movement
- Anticipation
- Confidence
- Fairness
- Energy
- Organization
- Readiness

Visual direction:

- Dark, athletic venue atmosphere with restrained accent color.
- Scoreboard-inspired hierarchy for live event state.
- Glass-line surfaces and venue haze — not flat enterprise panels.
- Accessible contrast on all interactive and readable elements.
- Sponsor treatments as ribbons, footers, and small logo marks — never ad boxes.

**Arena design test:** Would this belong in a premium athletic venue? Does it help people begin playing faster? If either answer is no, it probably does not belong.

CSS design tokens live in `app/globals.css`. Extend existing tokens before introducing new ones.

---

## Engineering Rules

1. **Inspect before editing.** Read surrounding code and relevant docs first.
2. **Understand before changing.** Know which workflow a file serves before modifying it.
3. **Minimize scope.** The smallest correct diff wins. Do not solve unrelated problems.
4. **Match existing conventions.** Follow patterns in `app/`, `components/`, and `lib/`.
5. **Server-side truth.** Database is source of truth. Browser storage is convenience only.
6. **Commerce security.** Follow [docs/architecture/Commerce_Architecture_v1.md](docs/architecture/Commerce_Architecture_v1.md) — no plaintext unlock codes, no public commerce table access, idempotent webhooks.
7. **No player accounts.** Players join by name. Do not introduce authentication for players unless explicitly scoped.
8. **Preserve Lite access.** Free tier features must remain fully functional without purchase.
9. **Leave the repository better than you found it.** Fix obvious issues in files you touch, within scope.

Stack: Next.js 14 (App Router), React 18, TypeScript, Supabase, pnpm.

For workflow standards, see [docs/engineering/REPOSITORY_WORKFLOW.md](docs/engineering/REPOSITORY_WORKFLOW.md).

---

## Git Rules

- Work on the branch assigned by the session. Do not switch branches unless necessary.
- Do not merge, rebase, reset, squash, or rewrite history unless explicitly requested.
- Do not force-push to `main`.
- Never commit secrets (`.env.local`, API keys, webhook secrets, service role keys).
- Stage only files relevant to the task.
- Write commit messages that explain why, not just what.
- Do not commit unless explicitly asked.

---

## Repository Conventions

```
app/                    Next.js App Router pages and API routes
components/layout/      App shell and frame components
components/room/        Room workflow components (admin, draft, teams)
components/presentation/ Reserved sponsor/presentation slots
lib/room/               Room queries, actions, validation
lib/commerce/           Licensing, Shopify, email, validation
lib/db/                 Supabase client
supabase/               Database schema
docs/                   Product, design, architecture, verification docs
```

Key documents:

| Document | Purpose |
| --- | --- |
| [ROADMAP.md](ROADMAP.md) | Sprint plan and build sequence |
| [docs/VISION_2027.md](docs/VISION_2027.md) | Enduring product vision |
| [docs/product/PRODUCT_NORTH_STAR.md](docs/product/PRODUCT_NORTH_STAR.md) | Founder philosophy and north star |
| [docs/design/ARENA_DESIGN_DIRECTION.md](docs/design/ARENA_DESIGN_DIRECTION.md) | Arena experience design |
| [docs/engineering/REPOSITORY_WORKFLOW.md](docs/engineering/REPOSITORY_WORKFLOW.md) | Engineering standards |
| [docs/SPONSORSHIP_FRAMEWORK.md](docs/SPONSORSHIP_FRAMEWORK.md) | Sponsorship placement and rules |
| [docs/architecture/Commerce_Architecture_v1.md](docs/architecture/Commerce_Architecture_v1.md) | Commerce and licensing architecture |
| [DEPLOY.md](DEPLOY.md) | Production deployment guide |
| [RELEASE_v1.0.md](RELEASE_v1.0.md) | v1.0 feature scope and limitations |

Package manager: **pnpm**. Node.js 20.x or newer.

---

## Definition of Done

Work is complete when:

1. The change serves a stated product or engineering goal.
2. Protected workflows still function (or regressions are documented and accepted).
3. No secrets are committed.
4. New behavior matches product principles and Arena design direction.
5. Sponsorship changes comply with the sponsorship framework.
6. Commerce changes comply with commerce architecture and verification checklist.
7. The diff is scoped, readable, and follows repository conventions.
8. Relevant documentation is updated or cross-referenced when behavior changes.
9. The repository is left in a clean, buildable state.

When in doubt: favor participation speed, workflow clarity, and venue authenticity over feature count.
