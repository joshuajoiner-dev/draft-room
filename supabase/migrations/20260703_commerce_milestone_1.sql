create table if not exists licenses (
  id uuid primary key default gen_random_uuid(),
  public_license_id text unique not null,
  license_owner_email text not null,
  billing_email text null,
  unlock_code_hash text unique not null,
  license_origin text not null check (
    license_origin in ('shopify', 'manual', 'organization', 'complimentary', 'test')
  ),
  purchase_date timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  activated_at timestamptz null,
  status text not null check (
    status in ('pending', 'active', 'refunded', 'revoked', 'transferred', 'archived')
  ),
  last_used_at timestamptz null,
  recovery_enabled boolean not null default true,
  organization_id uuid null,
  license_pool_id uuid null,
  seat_id uuid null,
  assigned_organizer_email text null,
  version integer not null default 1,
  notes text null,
  shopify_order_id text unique null,
  shopify_customer_id text null,
  product_key text not null default 'complete_v1'
);

create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'shopify',
  webhook_id text not null unique,
  topic text null,
  shopify_order_id text null,
  status text not null check (
    status in ('received', 'processed', 'ignored_duplicate', 'failed')
  ),
  error_message text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz null
);

create table if not exists license_events (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references licenses(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists licenses_license_owner_email_idx
  on licenses (lower(license_owner_email));

create index if not exists licenses_status_idx on licenses (status);
create index if not exists licenses_shopify_customer_id_idx on licenses (shopify_customer_id);
create index if not exists licenses_product_key_idx on licenses (product_key);
create index if not exists webhook_events_shopify_order_id_idx on webhook_events (shopify_order_id);
create index if not exists webhook_events_status_idx on webhook_events (status);
create index if not exists license_events_license_id_idx on license_events (license_id);
create index if not exists license_events_event_type_idx on license_events (event_type);

alter table licenses enable row level security;
alter table webhook_events enable row level security;
alter table license_events enable row level security;
