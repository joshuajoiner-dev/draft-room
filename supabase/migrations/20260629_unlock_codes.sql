create table if not exists unlock_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  is_active boolean not null default true,
  redeemed_at timestamptz null,
  created_at timestamptz not null default now()
);

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
