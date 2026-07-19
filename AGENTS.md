# JoinDraftPick — Agent Operating Instructions

Primary operating guide for Cursor, Codex, and future coding agents.

Read this file and the relevant docs in `docs/` before modifying the repository.

---

## Product Identity

| Field | Value |
| --- | --- |
| Public product name | **JoinDraftPick** |
| Historical repository/package name | **draft-room** |
| Public URL | **joindraftpick.com** |
| Product category | Lightweight team-creation and live draft environment |
| Primary users | Teachers, coaches, recreation leaders, event organizers, group facilitators |
| Product promise | Move people from waiting to playing in seconds |

Some UI surfaces still use **Draft Room** as a working label. Treat it as the same product unless a task explicitly requires renaming.

**JoinDraftPick Lite** is free. **JoinDraftPick Complete** unlocks additional draft modes through purchase and browser unlock.

Founding context: [docs/FOUNDING.md](docs/FOUNDING.md). Vision: [docs/VISION_2027.md](docs/VISION_2027.md).

---

## Product Principle

JoinDraftPick removes organizational friction so people can begin participating sooner.

The product should feel less like administrative software and more like entering a real future gym where an event is about to begin.

Technology should quietly support play rather than demand attention.

Central shorthand: **One Organizer. One Device. One Minute.**

---

## Core Modes

Document and preserve these established modes. Do not invent new modes without explicit scope.

| Mode | UI label | Tier | Behavior |
| --- | --- | --- | --- |
| **Quick Random** | Quick Random | Complete | Fully random team assignment for the fastest split. |
| **Balanced Random** | Create Balanced Teams | Lite | Even team sizes from the current player pool. |
| **Captain Draft** | Captain Draft | Complete | Captains on own teams; round-based picking with admin override. |

**Established limits:**

- Up to **50 participants** per room.
- Up to **25 teams** per generation (enforced in `lib/room/actions.ts` and form inputs).

Mode details and known limitations: [RELEASE_v1.0.md](RELEASE_v1.0.md).

When modifying modes, preserve the organizer sequence: add participants → select mode → create teams → invite → begin activity.

---

## Experience Standards

The product should communicate:

- Movement
- Anticipation
- Fairness
- Readiness
- Confidence
- Organization

Avoid:

- Generic enterprise SaaS
- Spreadsheet aesthetics
- Dense administrative dashboards
- Gratuitous science-fiction effects
- Excessive glow
- Decorative motion that slows task completion
- Visual complexity that competes with the draft

**Future gym** means operationally advanced, spatially clear, responsive, and venue-like — not neon decoration.

Arena design direction: [docs/design/ARENA_FUTURE_GYM_DIRECTION.md](docs/design/ARENA_FUTURE_GYM_DIRECTION.md).

---

## Workflow Protection

Never allow visual effects, sponsor placements, secondary controls, or promotional elements to obstruct or delay:

1. Creating a room
2. Joining a room
3. Adding participants
4. Selecting a draft mode
5. Creating teams
6. Conducting Captain Draft
7. Reviewing teams
8. Printing teams
9. Sharing results

These paths are production-critical. Do not refactor them unless the task explicitly requires it.

Regression references: [DEPLOY.md](DEPLOY.md) Section 6, [docs/verification/Commerce_Verification_Checklist_v1.md](docs/verification/Commerce_Verification_Checklist_v1.md) (Existing App Regression Test).

---

## Sponsorship Standards

Treat sponsorship as **venue architecture**, not interruptive advertising.

Appropriate patterns may include:

- Scoreboard partner
- Arena header ribbon
- Courtside or sidewall LED ribbon
- Event presentation partner
- Results presentation
- Equipment or hydration partner
- Restrained waiting-state placement

Sponsors must never:

- Interrupt a workflow
- Create modal advertising
- Introduce countdown delays
- Obscure participants or teams
- Compete with primary calls to action
- Compromise fairness
- Resemble low-quality banner advertising
- Create accidental clicks

Presentation slots live in `components/presentation/`. Inactive slots must render nothing.

**Canonical detailed source:** [docs/SPONSORSHIP_FRAMEWORK.md](docs/SPONSORSHIP_FRAMEWORK.md). Do not create conflicting sponsorship policy elsewhere.

---

## Visual System

Inspect `app/globals.css` before changing styles. Extend existing CSS custom properties; do not introduce a parallel design system.

**Current implementation tokens** (`:root` in `app/globals.css`):

| Token | Value | Typical use |
| --- | --- | --- |
| `--background` | `#000000` | Page background |
| `--surface` | `#2b2b2b` | Card and panel surfaces |
| `--surface-soft` | `#171717` | Nested surfaces |
| `--text` | `#ffffff` | Primary text |
| `--muted` | `#a3a3a3` | Secondary text |
| `--accent` | `#61ef62` | Primary actions, live state |
| `--upgrade` | `#ff8a1f` | Complete / upgrade actions |
| `--output` | `#ffd84d` | Output highlights |
| `--danger` | `#d94a38` | Destructive actions |
| `--scoreboard` / `--scoreboard-lit` | `#061006` / `#9cff8f` | Scoreboard treatments |
| `--arena-*` | blue, pink, cyan, amber, red | Restrained venue accents |
| `--glass-line` / `--venue-haze` | rgba whites | Surface borders, atmosphere |

**Typography:** Atkinson Hyperlegible (400, 700) with system-ui fallbacks.

**Layout patterns:** `.app-shell`, `.app-main`, `.stack`, `.stack-tight`, `.card`, `.button` (+ variants), `.event-control-layout` (three-column Arena).

**Component conventions:** Room workflow in `components/room/`, shell in `components/layout/AppFrame.tsx`, presentation slots in `components/presentation/PresentationSlot.tsx`.

Do not prescribe new tokens or fonts unless explicitly requested.

---

## Engineering Rules

- **Inspect before editing.** Read surrounding code and relevant docs first.
- **Preserve existing architecture.** Follow patterns in `app/`, `components/`, and `lib/`.
- **Make the smallest coherent change.** Do not modify unrelated files.
- **Never expose secrets** from `.env.local`.
- **Do not commit:** `.env.local`, `node_modules`, `.next`, temporary files, swap files, screenshots, logs, or generated artifacts unless explicitly required.
- **Use the existing package manager and lockfile.** This repository uses **pnpm** (`pnpm-lock.yaml`).
- **Inspect `package.json` before running commands.** Available scripts: `dev`, `build`, `start`, `lint`. Do not invent scripts.
- **Run commands that exist:** `pnpm lint`, `pnpm build` when applicable. No separate type-check or test script is defined.
- **Preserve Supabase migration history.** Never rewrite an applied migration.
- **Protect production data.** No destructive database operations without explicit approval.
- **Do not alter commerce or licensing behavior** without reading [docs/architecture/Commerce_Architecture_v1.md](docs/architecture/Commerce_Architecture_v1.md) and [docs/verification/Commerce_Verification_Checklist_v1.md](docs/verification/Commerce_Verification_Checklist_v1.md).

Stack: Next.js 14 (App Router), React 18, TypeScript, Supabase, Vercel.

Engineering workflow: [docs/engineering/REPOSITORY_WORKFLOW.md](docs/engineering/REPOSITORY_WORKFLOW.md).

---

## Git Rules

- Run `git status` before and after work.
- Inspect the active branch and upstream (`git branch -vv`).
- Never reset or discard uncommitted work unless explicitly instructed.
- Never force-push.
- Never amend unrelated commits.
- Stage only intended files.
- Use descriptive conventional commits (`docs:`, `feat:`, `fix:`, etc.).
- Report commit hash and push result when committing.
- Do not merge into `main` unless explicitly instructed.
- Do not rebase, squash, or rewrite history unless explicitly requested.

---

## Definition of Done

A feature is not done until:

1. Implementation matches product intent.
2. Primary workflow remains fast.
3. Desktop and supported mobile widths are checked.
4. Loading, empty, success, and error states are considered.
5. Accessibility is preserved.
6. Lint and build pass where applicable (`pnpm lint`, `pnpm build`).
7. No unrelated regressions are introduced.
8. Git diff contains only intended changes.
9. Relevant documentation is updated or cross-referenced when behavior changes.

When in doubt, favor participation speed and workflow clarity over feature count.
