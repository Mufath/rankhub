-- ============================================================================
-- RankHub - Enterprise Database Schema for Supabase (PostgreSQL)
-- Universal Ranking & Live Auction Platform
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. BOARDS TABLE
create table if not exists public.boards (
  id text primary key,
  slug text unique not null,
  title text not null,
  description text default '',
  banner_notes text default '',
  sort_order text not null default 'DESC' check (sort_order in ('DESC', 'ASC')),
  unit_type text not null default 'CURRENCY_IDR' check (unit_type in ('CURRENCY_IDR', 'SCORE', 'MILLISECONDS', 'CUSTOM')),
  custom_unit text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'LOCKED', 'ARCHIVED')),
  deadline timestamptz,
  visibility text not null default 'PUBLIC' check (visibility in ('PUBLIC', 'UNLISTED')),
  config jsonb default '{"allowPublicSubmit": true, "maskIdentifiersByDefault": true, "enablePodium": true, "enableAntiSniping": true, "antiSnipingThresholdSec": 60, "antiSnipingExtensionSec": 120}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_boards_slug on public.boards (slug);
create index if not exists idx_boards_status on public.boards (status);

-- 2. PARTICIPANTS TABLE
create table if not exists public.participants (
  id text primary key,
  board_id text not null references public.boards(id) on delete cascade,
  name text not null,
  identifier text not null,
  value numeric not null default 0,
  status text not null default 'VERIFIED' check (status in ('PENDING', 'VERIFIED', 'DISQUALIFIED')),
  custom_meta jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_participants_board_id on public.participants (board_id);
create index if not exists idx_participants_board_value on public.participants (board_id, value desc);
create index if not exists idx_participants_identifier on public.participants (board_id, identifier);

-- 3. BID AUDIT LOGS (Immutable History for Auction Transparency)
create table if not exists public.bid_history (
  id bigserial primary key,
  board_id text not null references public.boards(id) on delete cascade,
  participant_id text not null,
  participant_name text not null,
  previous_value numeric,
  new_value numeric not null,
  difference numeric,
  created_at timestamptz default now() not null
);

create index if not exists idx_bid_history_board on public.bid_history (board_id, created_at desc);

-- 4. WEBHOOKS SUBSCRIPTIONS TABLE (Point 5)
create table if not exists public.webhooks (
  id text primary key default concat('wh_', gen_random_uuid()::text),
  board_id text references public.boards(id) on delete cascade,
  url text not null,
  secret text,
  events text[] default array['bid.created', 'rank.outbid', 'board.deadline_extended'],
  is_active boolean default true,
  created_at timestamptz default now() not null
);

-- 5. AUTOMATIC UPDATED_AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at
before update on public.boards
for each row execute function public.handle_updated_at();

drop trigger if exists set_participants_updated_at on public.participants;
create trigger set_participants_updated_at
before update on public.participants
for each row execute function public.handle_updated_at();

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.boards enable row level security;
alter table public.participants enable row level security;
alter table public.bid_history enable row level security;
alter table public.webhooks enable row level security;

-- Public read access policies (Safe Drop & Recreate)
drop policy if exists "Allow public read access to active public boards" on public.boards;
create policy "Allow public read access to active public boards"
  on public.boards for select using (visibility = 'PUBLIC' or true);

drop policy if exists "Allow public read access to participants" on public.participants;
create policy "Allow public read access to participants"
  on public.participants for select using (true);

drop policy if exists "Allow public read access to bid history" on public.bid_history;
create policy "Allow public read access to bid history"
  on public.bid_history for select using (true);

-- Full access for service_role (Safe Drop & Recreate)
drop policy if exists "Full access for service role on boards" on public.boards;
create policy "Full access for service role on boards"
  on public.boards for all using (auth.role() = 'service_role');

drop policy if exists "Full access for service role on participants" on public.participants;
create policy "Full access for service role on participants"
  on public.participants for all using (auth.role() = 'service_role');

drop policy if exists "Full access for service role on bid_history" on public.bid_history;
create policy "Full access for service role on bid_history"
  on public.bid_history for all using (auth.role() = 'service_role');

drop policy if exists "Full access for service role on webhooks" on public.webhooks;
create policy "Full access for service role on webhooks"
  on public.webhooks for all using (auth.role() = 'service_role');

-- 7. ENABLE REALTIME STREAMING (Safe Publication Check)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'boards'
  ) then
    alter publication supabase_realtime add table public.boards;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'participants'
  ) then
    alter publication supabase_realtime add table public.participants;
  end if;
end $$;
