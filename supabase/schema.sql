-- Create the organizations table
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  description text,
  admin_id uuid not null,
  created_at timestamptz not null default now()
);

-- Create the profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('admin', 'staff', 'client')),
  organization_id uuid references public.organizations(id) on delete set null,
  organization_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create the financial_records table
create table public.financial_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  analysis_results jsonb,
  risk_flags jsonb,
  created_at timestamptz not null default now()
);

-- Create the audit_reports table
create table public.audit_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  generated_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  report_data jsonb not null,
  recommendations text,
  status text not null default 'draft' check (status in ('draft', 'final')),
  created_at timestamptz not null default now()
);

-- Create the activities table
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- Set up foreign key relationships
alter table public.organizations add constraint organizations_admin_id_fkey foreign key (admin_id) references public.profiles(id);

-- Set up Storage bucket for financial records
insert into storage.buckets (id, name, public)
values ('financial-records', 'financial-records', true);

-- Create policies for the storage bucket
create policy "Allow all access to public folder" on storage.objects for all using (bucket_id = 'financial-records' and (storage.foldername(name))[1] = 'public');

-- Function to create a profile for a new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, organization_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''), -- Use coalesce to handle null metadata
    'staff', -- Default role for new sign-ups
    coalesce(new.raw_user_meta_data->>'organization_name', '') -- Use coalesce to handle null metadata
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run the function when a new user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS and define policies for the profiles table
alter table public.profiles enable row level security;

create policy "Users can see their own profile"
on public.profiles for select
using ( auth.uid() = id );

create policy "Users can update their own profile"
on public.profiles for update
using ( auth.uid() = id );
