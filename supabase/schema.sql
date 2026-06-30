create extension if not exists pgcrypto;

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  status text not null default 'setup' check (status in ('setup', 'drafting', 'finalized')),
  team_creation_mode text check (
    team_creation_mode in ('captain_draft', 'random_teams', 'balanced_random')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  name text not null,
  joined_at timestamptz not null default now(),
  created_by_admin boolean not null default false
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  name text not null,
  captain_player_id uuid references players(id) on delete set null,
  draft_order integer,
  created_at timestamptz not null default now()
);

create table if not exists team_assignments (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (room_id, player_id)
);

create table if not exists captain_picks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  pick_number integer not null,
  round_number integer not null,
  created_at timestamptz not null default now(),
  unique (room_id, player_id),
  unique (room_id, pick_number)
);

create table if not exists undo_stack (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  action_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists unlock_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  is_active boolean not null default true,
  redeemed_at timestamptz null,
  created_at timestamptz not null default now()
);

create unique index if not exists teams_room_draft_order_idx
  on teams (room_id, draft_order)
  where draft_order is not null;

create index if not exists players_room_id_idx on players (room_id);
create index if not exists teams_room_id_idx on teams (room_id);
create index if not exists team_assignments_room_id_idx on team_assignments (room_id);
create index if not exists captain_picks_room_id_idx on captain_picks (room_id);

alter table rooms enable row level security;
alter table players enable row level security;
alter table teams enable row level security;
alter table team_assignments enable row level security;
alter table captain_picks enable row level security;
alter table undo_stack enable row level security;
alter table unlock_codes enable row level security;

create or replace function redeem_unlock_code(input_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  matching_code_id uuid;
begin
  select id
  into matching_code_id
  from unlock_codes
  where code = input_code
    and is_active = true
  limit 1;

  if matching_code_id is null then
    return false;
  end if;

  update unlock_codes
  set redeemed_at = now()
  where id = matching_code_id
    and redeemed_at is null;

  return true;
end;
$$;

grant execute on function redeem_unlock_code(text) to anon;

create policy "rooms are publicly readable" on rooms for select using (true);
create policy "rooms can be created" on rooms for insert with check (true);
create policy "rooms can be updated" on rooms for update using (true);

create policy "players are publicly readable" on players for select using (true);
create policy "players can be created" on players for insert with check (true);
create policy "players can be updated" on players for update using (true);

create policy "teams are publicly readable" on teams for select using (true);
create policy "teams can be created" on teams for insert with check (true);
create policy "teams can be updated" on teams for update using (true);

create policy "team assignments are publicly readable" on team_assignments for select using (true);
create policy "team assignments can be created" on team_assignments for insert with check (true);
create policy "team assignments can be updated" on team_assignments for update using (true);
create policy "team assignments can be deleted" on team_assignments for delete using (true);

create policy "captain picks are publicly readable" on captain_picks for select using (true);
create policy "captain picks can be created" on captain_picks for insert with check (true);
create policy "captain picks can be deleted" on captain_picks for delete using (true);

create policy "undo stack is publicly readable" on undo_stack for select using (true);
create policy "undo stack can be created" on undo_stack for insert with check (true);
create policy "undo stack can be deleted" on undo_stack for delete using (true);
