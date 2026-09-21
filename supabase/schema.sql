-- ALLMED operations schema
-- Run this in the Supabase SQL editor (once per project).

create table if not exists public.branches (
  id text primary key,
  name text not null,
  code text not null,
  location text not null,
  phone text not null,
  status text not null default 'Active'
);

create table if not exists public.staff (
  id text primary key,
  name text not null,
  role text not null,
  branch_id text not null references public.branches (id),
  phone text not null,
  email text unique
);

create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text not null,
  whatsapp_phone text,
  alternate_phone text,
  email text,
  address text not null default '',
  area text not null default '',
  addresses jsonb not null default '[]'::jsonb,
  preferred_contact text not null default 'Phone',
  total_orders integer not null default 0,
  last_order_date text,
  notes text,
  created_at text
);

create table if not exists public.prescriptions (
  id text primary key,
  customer_id text not null references public.customers (id) on delete cascade,
  doctor_name text not null,
  hospital text,
  prescribed_date text not null,
  valid_until text not null,
  status text not null,
  medicines jsonb not null default '[]'::jsonb,
  notes text,
  image_attached boolean default false
);

create table if not exists public.requirements (
  id text primary key,
  customer_id text not null,
  customer_name text not null,
  phone text not null,
  source text not null,
  items jsonb not null default '[]'::jsonb,
  status text not null,
  assigned_staff_id text,
  customer_notes text,
  prescription_attached boolean not null default false,
  urgency text not null,
  delivery_required boolean not null default false,
  requirement_delivery_type text not null,
  delivery_address_id text,
  courier_carrier text,
  pickup_branch_id text,
  preferred_delivery_time text,
  branch_id text not null,
  created_at text not null,
  updated_at text not null,
  timeline jsonb not null default '[]'::jsonb
);

create table if not exists public.orders (
  id text primary key,
  requirement_id text,
  customer_id text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null default '',
  customer_area text not null default '',
  customer_type text not null default 'Regular',
  preferred_contact text not null default 'Phone',
  items jsonb not null default '[]'::jsonb,
  source text not null,
  order_date text not null,
  delivery_type text not null,
  payment_method text not null,
  payment_status text not null,
  amount_collected numeric not null default 0,
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  delivery_charge numeric not null default 0,
  total numeric not null default 0,
  status text not null,
  branch_id text not null,
  assigned_staff_id text,
  delivery_required boolean not null default false,
  delivery_address text,
  preferred_delivery_time text,
  delivery_status text,
  delivery_person_id text,
  trip_id text,
  bill_number text,
  bill_value numeric,
  timeline jsonb not null default '[]'::jsonb,
  completed_at text,
  completed_by text
);

create table if not exists public.trips (
  id text primary key,
  branch_id text not null,
  delivery_person_id text not null,
  status text not null,
  stops jsonb not null default '[]'::jsonb,
  started_at text,
  completed_at text,
  timeline jsonb not null default '[]'::jsonb,
  created_at text not null
);

create table if not exists public.collections (
  id text primary key,
  order_id text not null,
  customer_id text not null,
  customer_name text not null,
  amount_due numeric not null default 0,
  amount_collected numeric not null default 0,
  balance numeric not null default 0,
  payment_method text not null,
  due_date text not null,
  status text not null,
  timeline jsonb not null default '[]'::jsonb
);

create table if not exists public.completed_records (
  id text primary key,
  order_id text not null,
  customer_id text not null,
  customer_name text not null,
  completed_date text not null,
  items jsonb not null default '[]'::jsonb,
  order_value numeric not null default 0,
  payment_method text not null,
  branch_id text not null,
  completed_by text not null,
  source text not null
);

create table if not exists public.enquiries (
  id text primary key,
  customer_id text not null,
  customer_name text not null,
  phone text not null,
  whatsapp_phone text,
  department text not null,
  query text not null,
  query_custom text,
  status text not null,
  branch_id text not null,
  requirement_id text,
  created_at text not null,
  updated_at text not null,
  closed_at text,
  timeline jsonb not null default '[]'::jsonb
);

alter table public.branches enable row level security;
alter table public.staff enable row level security;
alter table public.customers enable row level security;
alter table public.prescriptions enable row level security;
alter table public.requirements enable row level security;
alter table public.orders enable row level security;
alter table public.trips enable row level security;
alter table public.collections enable row level security;
alter table public.completed_records enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists authenticated_all on public.branches;
drop policy if exists authenticated_all on public.staff;
drop policy if exists authenticated_all on public.customers;
drop policy if exists authenticated_all on public.prescriptions;
drop policy if exists authenticated_all on public.requirements;
drop policy if exists authenticated_all on public.orders;
drop policy if exists authenticated_all on public.trips;
drop policy if exists authenticated_all on public.collections;
drop policy if exists authenticated_all on public.completed_records;
drop policy if exists authenticated_all on public.enquiries;

create policy authenticated_all on public.branches for all to authenticated using (true) with check (true);
create policy authenticated_all on public.staff for all to authenticated using (true) with check (true);
create policy authenticated_all on public.customers for all to authenticated using (true) with check (true);
create policy authenticated_all on public.prescriptions for all to authenticated using (true) with check (true);
create policy authenticated_all on public.requirements for all to authenticated using (true) with check (true);
create policy authenticated_all on public.orders for all to authenticated using (true) with check (true);
create policy authenticated_all on public.trips for all to authenticated using (true) with check (true);
create policy authenticated_all on public.collections for all to authenticated using (true) with check (true);
create policy authenticated_all on public.completed_records for all to authenticated using (true) with check (true);
create policy authenticated_all on public.enquiries for all to authenticated using (true) with check (true);
