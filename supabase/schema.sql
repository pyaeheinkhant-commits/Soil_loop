-- Neighbourhood Soil Loop — Postgres schema for a future Supabase project.
-- The live hackathon demo currently persists in the browser so judges
-- can walk the loop without credentials. Run this when you attach Supabase.

create type user_role as enum ('resident', 'champion', 'collector', 'gardener', 'operator');
create type checkin_method as enum ('manual');
create type weight_method as enum ('calibrated_scale', 'estimated');
create type contamination_status as enum ('clean', 'minor', 'major', 'rejected');
create type collection_status as enum ('completed', 'missed', 'delayed');
create type batch_status as enum ('received', 'composting', 'ready', 'failed');
create type quality_status as enum ('pending', 'passed', 'failed');
create type bin_status as enum ('available', 'nearly_full', 'full', 'closed');

create table blocks (
  block_id text primary key,
  block_name text not null,
  precinct text not null,
  collection_schedule text not null,
  assigned_collector_id text,
  assigned_compost_site text not null
);

create table users (
  user_id text primary key,
  name text not null,
  role user_role not null,
  block_id text references blocks(block_id),
  email text unique not null,
  language text default 'English'
);

create table bins (
  bin_id text primary key,
  block_id text not null references blocks(block_id),
  location_text text not null,
  capacity_litres int not null,
  status bin_status not null default 'available',
  accepted_items text[] not null,
  ask_first_items text[] not null,
  rejected_items text[] not null
);

create table checkins (
  checkin_id text primary key,
  user_id text not null references users(user_id),
  block_id text not null references blocks(block_id),
  bin_id text not null references bins(bin_id),
  timestamp timestamptz not null default now(),
  checkin_method checkin_method not null default 'manual'
);

create table batches (
  batch_id text primary key,
  compost_site text not null,
  start_date date not null,
  input_weight_kg numeric not null default 0,
  source_block_ids text[] not null,
  composting_method text not null,
  expected_ready_date date,
  actual_ready_date date,
  output_compost_kg numeric,
  quality_status quality_status not null default 'pending',
  quality_notes text,
  batch_status batch_status not null default 'received'
);

create table collections (
  collection_id text primary key,
  block_id text not null references blocks(block_id),
  bin_id text not null references bins(bin_id),
  collector_id text not null references users(user_id),
  collection_datetime timestamptz not null,
  weight_kg numeric not null,
  weight_method weight_method not null,
  contamination_status contamination_status not null,
  contamination_notes text,
  destination text not null,
  batch_id text references batches(batch_id),
  status collection_status not null
);

create table gardens (
  garden_id text primary key,
  garden_name text not null,
  location text not null,
  gardener_id text references users(user_id)
);

create table compost_uses (
  use_id text primary key,
  garden_id text not null references gardens(garden_id),
  batch_id text not null references batches(batch_id),
  compost_used_kg numeric not null,
  usage_date date not null,
  garden_area text,
  update_notes text,
  photo_url text
);

create table champion_issues (
  issue_id text primary key,
  block_id text not null references blocks(block_id),
  bin_id text not null references bins(bin_id),
  reporter_id text not null references users(user_id),
  timestamp timestamptz not null default now(),
  kind text not null,
  notes text
);

alter table users enable row level security;
alter table blocks enable row level security;
alter table bins enable row level security;
alter table checkins enable row level security;
alter table collections enable row level security;
alter table batches enable row level security;
alter table gardens enable row level security;
alter table compost_uses enable row level security;
alter table champion_issues enable row level security;

-- Demo policies: authenticated users can read; writes stay role-scoped in the app.
create policy "read_all_demo" on users for select using (true);
create policy "read_blocks" on blocks for select using (true);
create policy "read_bins" on bins for select using (true);
create policy "read_checkins" on checkins for select using (true);
create policy "write_own_checkins" on checkins for insert with check (true);
create policy "read_collections" on collections for select using (true);
create policy "write_collections" on collections for insert with check (true);
create policy "read_batches" on batches for select using (true);
create policy "write_batches" on batches for update using (true);
create policy "read_gardens" on gardens for select using (true);
create policy "read_uses" on compost_uses for select using (true);
create policy "write_uses" on compost_uses for insert with check (true);
create policy "read_issues" on champion_issues for select using (true);
create policy "write_issues" on champion_issues for insert with check (true);
create policy "update_bins" on bins for update using (true);
