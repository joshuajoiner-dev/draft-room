# Draft Room Setup

## 1. Create The Supabase Project

1. Go to https://supabase.com.
2. Create a new project.
3. Choose a project name, password, and region.
4. Wait for the project to finish provisioning.

## 2. Create `.env.local`

Create a `.env.local` file in the project root:

```txt
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## 3. Find The Project URL And Publishable Key

In Supabase:

1. Open the project.
2. Go to Project Settings.
3. Open API.
4. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
5. Copy the publishable key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## 4. Apply The Database Schema

1. In Supabase, open SQL Editor.
2. Create a new query.
3. Copy the contents of `supabase/schema.sql`.
4. Run the query.

This creates the room, player, team, assignment, captain pick, and undo tables needed by the app.

## 5. Run The App Locally

Install dependencies:

```bash
pnpm install
```

Start the local app:

```bash
pnpm dev
```

Open the local URL shown in the terminal, usually:

```txt
http://localhost:3000
```

## 6. Manual Test Checklist

- Create a room from the home page.
- Confirm the admin page opens after room creation.
- Confirm the join link is visible.
- Confirm the QR code is visible.
- Open the join page and join as a player.
- Return to the admin page and add a player manually.
- Confirm the player list updates with both players.
