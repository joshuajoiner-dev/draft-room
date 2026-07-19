# JoinDraftPick Recovery Guide

This guide helps a trusted collaborator—or the founder on a replacement machine—restore and run JoinDraftPick using only:

- access to GitHub
- required environment-variable values (names listed below; never commit values)
- deployment-provider access (Vercel)

GitHub is the canonical source-code backup. Environment variables, Supabase data, commerce provider settings, and DNS must be recovered separately.

---

## Repository

| Item | Value |
| --- | --- |
| **Canonical GitHub repository** | `https://github.com/joshuajoiner-dev/draft-room` |
| **Clone URL (HTTPS)** | `https://github.com/joshuajoiner-dev/draft-room.git` |
| **Default branch** | `main` |
| **Production branch** | `main` (documented in `docs/engineering/REPOSITORY_WORKFLOW.md`) |
| **Known local project path (founder machine)** | `/Volumes/WD_BLACK/Projects/JoinDraftPick` |

The repository directory name on disk is commonly `draft-room` after clone. The local folder may be renamed (for example `JoinDraftPick`).

---

## Prerequisites

Assumes macOS or Linux with network access.

| Tool | Requirement |
| --- | --- |
| **Git** | Required |
| **Node.js** | **20.x** (see `.nvmrc`; also documented in `DEPLOY.md`) |
| **pnpm** | **11.15.0** (declared in `package.json` → `packageManager`) |
| **Corepack** | Recommended. Run `corepack enable` to install the pinned pnpm version automatically |

Use nvm or similar to match the checked-in Node version:

```bash
nvm install
nvm use
```

---

## Fresh Clone

```bash
git clone https://github.com/joshuajoiner-dev/draft-room.git
cd draft-room
git fetch --all --prune
git branch -vv
```

To work on the current Arena development line:

```bash
git checkout codex/court-grid-layout-experiment
```

To match production:

```bash
git checkout main
git pull origin main
```

---

## Install

Use the repository lockfile. Prefer a frozen install in recovery scenarios:

```bash
corepack enable
pnpm install --frozen-lockfile
```

If pnpm is not installed globally, Corepack reads the pinned version from `package.json`:

```bash
corepack enable
corepack prepare pnpm@11.15.0 --activate
pnpm install --frozen-lockfile
```

**Documented Vercel install command:** `pnpm install` (`DEPLOY.md`)

---

## Environment

Create `.env.local` in the project root. This file is gitignored and must be restored from a secure backup or provider dashboard.

**Never commit `.env.local`, `.env`, or `.env.*.local`.**

### Required for Lite gameplay (local, preview, production)

| Variable | Required | Environments | Documented |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | dev, preview, production | `.env.example`, `SETUP.md`, `DEPLOY.md` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | dev, preview, production | `.env.example`, `SETUP.md`, `DEPLOY.md` |

### Commerce / Complete (when `COMMERCE_ENABLED=true`)

| Variable | Required | Environments | Documented |
| --- | --- | --- | --- |
| `COMMERCE_ENABLED` | Yes | all | `.env.example` |
| `NEXT_PUBLIC_APP_URL` | Yes (when commerce enabled) | all | `.env.example` |
| `NEXT_PUBLIC_UPGRADE_CHECKOUT_URL` | Yes (when commerce enabled) | all | `.env.example` |
| `LICENSE_CODE_PEPPER` | Yes (when commerce enabled) | server only | `.env.example` |
| `POSTMARK_FROM_EMAIL` | Yes (when commerce enabled) | server only | `.env.example` |
| `POSTMARK_SERVER_TOKEN` | Yes (when commerce enabled) | server only | `.env.example` |
| `SHOPIFY_WEBHOOK_SECRET` | Yes (when commerce enabled) | server only | `.env.example` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (when commerce enabled) | server only | `.env.example` |
| `POSTMARK_MESSAGE_STREAM` | Optional | server only | `.env.example` |

For local Lite-only development, set:

```txt
COMMERCE_ENABLED=false
```

and provide the two Supabase public variables.

### Provider-injected (do not set manually unless instructed)

| Variable | Notes |
| --- | --- |
| `VERCEL_ENV` | Set by Vercel (`production`, `preview`, `development`) |

### Supabase schema

If the database is new or empty, apply `supabase/schema.sql` in the Supabase SQL Editor (`SETUP.md`, `DEPLOY.md`).

---

## Validate

```bash
pnpm lint
pnpm build
```

This repository does not define a separate `test` script in `package.json` as of this guide.

Continuous integration runs on GitHub Actions (`.github/workflows/ci.yml`): frozen lockfile install, `pnpm lint`, and `pnpm build` on Node 20. No GitHub Secrets are required for CI — the build completes without environment variables.

Optional manual QA assets exist under `docs/design/qa/`.

---

## Start Development Server

```bash
npm run dev
```

Equivalent:

```bash
pnpm dev
```

Expected local URL:

```txt
http://localhost:3000
```

If port 3000 is occupied, Next.js selects the next available port. Read the terminal output for the actual URL.

---

## Production Build

Local production simulation:

```bash
pnpm build
pnpm start
```

Default start URL is usually `http://localhost:3000`.

---

## Deployment

| Item | Confirmed fact |
| --- | --- |
| **Provider** | **Vercel** (verified via `server: Vercel` response headers) |
| **Connected project name** | `TO VERIFY` in Vercel dashboard (no local `.vercel/project.json` in repository checkout) |
| **Production branch** | `main` |
| **Production URL** | `https://www.joindraftpick.com` (`https://joindraftpick.com` redirects to www) |
| **Alternate Vercel URL** | `https://draft-room.vercel.app` responds on Vercel but appears to serve a different build artifact than the custom domain |
| **Auto-preview on push** | `TO VERIFY` in Vercel project settings (GitHub integration expected) |
| **Auto-production on merge to main** | Documented expectation (`docs/engineering/REPOSITORY_WORKFLOW.md`); `TO VERIFY` in Vercel dashboard |
| **Deployment protection** | `TO VERIFY` in Vercel dashboard |
| **Environment configuration location** | Vercel Project Settings → Environment Variables |

### Build settings documented in `DEPLOY.md`

```txt
Framework Preset: Next.js
Build Command: pnpm build
Install Command: pnpm install
Output Directory: .next
Node.js Version: 20.x (see `.nvmrc`)
```

### Production health check (no secrets returned)

```bash
curl -sSL https://www.joindraftpick.com/api/commerce/health
```

When healthy, this endpoint reports `"status": "ok"` and boolean checks for configured environment groups.

### Current deployment note (audit snapshot)

Production on `main` was at commit `3ecd442` during the July 2026 audit. Arena work on `codex/court-grid-layout-experiment` (`1979cd7`) was **not** confirmed deployed to production.

---

## Recovery Verification Checklist

- [ ] Clone succeeds from GitHub
- [ ] `pnpm install --frozen-lockfile` succeeds
- [ ] `.env.local` restored with required variable names
- [ ] Supabase schema applied if database is new
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] Development server launches (`npm run dev` or `pnpm dev`)
- [ ] Preview deployment succeeds after push (`TO VERIFY` URL in Vercel)
- [ ] Production domain responds (`https://www.joindraftpick.com`)
- [ ] Latest expected commit is deployed to production (`git rev-parse origin/main` vs Vercel deployment commit)

---

## Git Safety

Routine integrity checks:

```bash
git fetch --all --prune
git status
git branch -vv
git fsck --full
```

**Dangling trees or commits** reported by `git fsck` are not automatically corruption. They are often leftover objects from rebases or amended commits. Do not panic; avoid aggressive cleanup unless you understand the impact.

### Avoid unless consequences are understood and backups exist

- `git reset --hard`
- force pushes (`git push --force`)
- deleting branches without confirming they are merged or backed up on GitHub
- aggressive garbage collection on a machine that may hold the only copy of unpushed work

### Safe recovery patterns

- restore from GitHub (`git clone`, `git fetch`, checkout known branch)
- open a pull request instead of pushing directly to `main`
- redeploy a known-good Vercel deployment from the Vercel dashboard
- create a recovery branch from a known-good tag or commit hash

---

## Emergency Rollback

### Identify a known-good commit

```bash
git fetch --all --prune
git log --oneline --decorate --graph --all -30
git tag -l
```

Known release tags in repository history:

- `v0.9.0-commerce-foundation`
- `v0.9.1-commerce-verified`

Production `main` tip during audit: `3ecd442`.

### Preferred rollback actions (non-destructive)

1. **Revert via pull request** — create a branch from `main`, revert the bad commit(s), merge through PR.
2. **Redeploy prior Vercel deployment** — use Vercel dashboard → Deployments → Promote to Production on a known-good deployment.
3. **Recovery branch** — `git checkout -b recovery/YYYY-MM-DD <known-good-sha>` for investigation; do not force-push `main`.

Do **not** use destructive history rewrite on `main` as the default rollback method.

---

## External Backups

| Asset | Backup location |
| --- | --- |
| **Source code** | GitHub (`joshuajoiner-dev/draft-room`) |
| **Environment variables** | Secure password manager + Vercel project settings |
| **Supabase database** | Supabase project backups / point-in-time recovery (`TO VERIFY` plan settings) |
| **Commerce providers** | Shopify, Postmark account configuration |
| **DNS / custom domain** | Domain registrar + Vercel domain settings |
| **Local working copy** | `/Volumes/WD_BLACK/Projects/JoinDraftPick` (non-canonical; GitHub is source of truth) |

---

## Related Documentation

- `SETUP.md` — local Supabase setup
- `DEPLOY.md` — Vercel deployment steps
- `docs/engineering/REPOSITORY_WORKFLOW.md` — branch, commit, and deployment policy
- `docs/verification/Commerce_Verification_Checklist_v1.md` — commerce environment verification
- `AGENTS.md` — product and engineering operating rules
