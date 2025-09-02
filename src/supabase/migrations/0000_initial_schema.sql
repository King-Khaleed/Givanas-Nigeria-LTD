
-- 1. Create custom types (enums)
create type public.user_role as enum ('admin', 'staff', 'client');
create type public.file_status as enum ('pending', 'processing', 'completed', 'failed');
create type public.report_status as enum ('draft', 'final', 'failed');

-- 2. Create organizations table
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone not null default now()
);
comment on table public.organizations is 'Stores organization data.';

-- 3. Create profiles table
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  "role" user_role not null default 'client',
  organization_id uuid references public.organizations (id) on delete set null,
  phone text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
comment on table public.profiles is 'Stores user profile data, linked to auth.users.';

-- 4. Create financial_records table
create table public.financial_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null,
  status file_status not null default 'pending',
  risk_level text,
  analysis_results jsonb,
  created_at timestamp with time zone not null default now()
);
comment on table public.financial_records is 'Stores metadata for uploaded financial documents.';

-- 5. Create audit_reports table
create table public.audit_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  generated_by uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  summary text,
  key_metrics text,
  top_risk_areas text,
  recommendations text,
  status report_status not null default 'draft',
  created_at timestamp with time zone not null default now()
);
comment on table public.audit_reports is 'Stores generated audit reports.';

-- 6. Create activities table
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  action text not null,
  details jsonb,
  created_at timestamp with time zone not null default now()
);
comment on table public.activities is 'Logs user actions within the platform.';

-- 7. Add Database Indexes
create index idx_profiles_email on public.profiles (email);
create index idx_profiles_organization_id on public.profiles (organization_id);
create index idx_financial_records_organization_id on public.financial_records (organization_id);
create index idx_audit_reports_organization_id on public.audit_reports (organization_id);
create index idx_activities_organization_id on public.activities (organization_id);
create index idx_activities_user_id on public.activities (user_id);
create index idx_activities_created_at on public.activities (created_at desc);

-- 8. Create a helper function to get a user's organization ID
create or replace function public.get_user_organization_id(user_id uuid)
returns uuid
language sql
security definer
as $$
  select organization_id
  from public.profiles
  where id = user_id;
$$;

-- 9. Create a helper function to check if a user is an admin
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

-- 10. Set up Row Level Security (RLS)
-- Enable RLS for all relevant tables
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.financial_records enable row level security;
alter table public.audit_reports enable row level security;
alter table public.activities enable row level security;

-- RLS Policies for `profiles` table
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins can view/manage all profiles" on public.profiles
  for all using (public.is_admin(auth.uid()));

-- RLS Policies for `organizations` table
create policy "Users can view their own organization" on public.organizations
  for select using (id = public.get_user_organization_id(auth.uid()));
create policy "Admins can view/manage all organizations" on public.organizations
  for all using (public.is_admin(auth.uid()));

-- RLS Policies for `financial_records` table
create policy "Users can view records in their own organization" on public.financial_records
  for select using (organization_id = public.get_user_organization_id(auth.uid()));
create policy "Users can insert records into their own organization" on public.financial_records
  for insert with check (organization_id = public.get_user_organization_id(auth.uid()));
create policy "Admins can manage all financial records" on public.financial_records
  for all using (public.is_admin(auth.uid()));

-- RLS Policies for `audit_reports` table
create policy "Users can view reports in their own organization" on public.audit_reports
  for select using (organization_id = public.get_user_organization_id(auth.uid()));
create policy "Users can insert reports into their own organization" on public.audit_reports
  for insert with check (organization_id = public.get_user_organization_id(auth.uid()));
create policy "Admins can manage all audit reports" on public.audit_reports
  for all using (public.is_admin(auth.uid()));

-- RLS Policies for `activities` table
create policy "Users can view activities in their own organization" on public.activities
  for select using (organization_id = public.get_user_organization_id(auth.uid()));
create policy "Admins can view all activities" on public.activities
  for select using (public.is_admin(auth.uid()));

-- 11. Create Supabase Storage Bucket
-- Note: This is illustrative. Bucket creation is best done via Supabase UI.
-- The RLS policies below are the crucial part.
insert into storage.buckets (id, name, public)
values ('financial-records', 'financial-records', false)
on conflict (id) do nothing;

-- 12. Corrected Storage RLS Policies
-- First, drop any existing (potentially broken) policies on the storage objects.
drop policy if exists "Users can upload to their organization's folder" on storage.objects;
drop policy if exists "Users can view files in their organization's folder" on storage.objects;
drop policy if exists "Users can delete files in their organization's folder" on storage.objects;

-- Add a generated column to extract the organization folder from the file path.
-- This is more performant than using functions in RLS policies.
alter table storage.objects
add column if not exists org_folder text
generated always as (split_part(name, '/', 1)) stored;

-- Add an index on the new generated column for faster lookups.
create index if not exists idx_storage_objects_org_folder
on storage.objects (org_folder);

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Create the fixed RLS policies using the generated column.
create policy "Users can upload to their organization's folder"
on storage.objects for insert
with check (
    bucket_id = 'financial-records'
    and org_folder = get_user_organization_id(auth.uid())::text
);

create policy "Users can view files in their organization's folder"
on storage.objects for select
using (
    bucket_id = 'financial-records'
    and org_folder = get_user_organization_id(auth.uid())::text
);

create policy "Users can delete files in their organization's folder"
on storage.objects for delete
using (
    bucket_id = 'financial-records'
    and org_folder = get_user_organization_id(auth.uid())::text
);


-- 13. Create Database Triggers
-- Function to auto-create profile and organization on new user signup
create or replace function public.on_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  user_role user_role;
begin
  -- Determine role, default to 'staff' if not provided
  user_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'staff');

  -- Create a new organization for the user
  insert into public.organizations (name)
  values (new.raw_user_meta_data->>'organization_name')
  returning id into new_org_id;

  -- Create a new profile for the user
  insert into public.profiles (id, email, full_name, role, organization_id, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    user_role,
    new_org_id,
    new.raw_user_meta_data->>'phone'
  );
  
  return new;
end;
$$;

-- Trigger to call the function after a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.on_auth_user_created();

-- Function to update the `updated_at` timestamp on profile changes
create or replace function public.handle_profile_update()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to call the function before a profile is updated
create trigger on_profile_update
  before update on public.profiles
  for each row execute procedure public.handle_profile_update();
