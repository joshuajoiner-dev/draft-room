# Draft Room Deployment Guide

## 1. Push To GitHub

1. Confirm `.env.local` is not tracked.
2. Create a GitHub repository for Draft Room.
3. Add the GitHub remote:

```bash
git remote add origin https://github.com/YOUR-USERNAME/draft-room.git
git branch -M main
git push -u origin main
```

## 2. Import Project Into Vercel

1. Open Vercel.
2. Choose Add New Project.
3. Import the GitHub repository.
4. Use the default Next.js framework preset.

Recommended build settings:

```txt
Framework Preset: Next.js
Build Command: pnpm build
Install Command: pnpm install
Output Directory: .next
Node.js Version: 22.x (see `.nvmrc`)
```

## 3. Configure Environment Variables

Add these variables in Vercel Project Settings -> Environment Variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Use the values from Supabase Project Settings -> API.

## 4. Apply Supabase Schema

If the production Supabase database is new:

1. Open Supabase SQL Editor.
2. Copy `supabase/schema.sql`.
3. Run the SQL against the production project.

## 5. Deploy

1. Trigger the first Vercel deployment.
2. Confirm the build succeeds.
3. Open the production URL.

## 6. Verify Production

Manual checklist:

- Create a room.
- Confirm the admin page opens.
- Confirm the room code is visible and copies.
- Confirm the join link is visible and copies.
- Confirm the QR code renders.
- Join as a player.
- Import multiple players as admin.
- Generate Quick Random teams.
- Create Balanced Teams.
- Set up and begin Captain Draft.
- Make a Captain Draft pick.
- Use admin override controls.

## 7. Troubleshooting

- Missing Supabase config: confirm both Vercel environment variables are set for Production.
- Database errors: confirm `supabase/schema.sql` was applied to the same Supabase project used by Vercel.
- QR code does not render: confirm browser JavaScript is enabled and the page has loaded fully.
- Join link uses the wrong host: confirm the deployed app is opened from the intended Vercel production domain.
- Build fails on Vercel: confirm Vercel uses Node.js 22.x (see `.nvmrc`) and installs with `pnpm install`.
