-- 1. Custom Types (Enums)
CREATE TYPE public.role AS ENUM ('admin', 'staff', 'client');
CREATE TYPE public.file_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.report_status AS ENUM ('draft', 'final');

-- 2. Tables Creation

-- organizations Table
CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying NOT NULL,
    description text,
    industry character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- profiles Table
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email character varying NOT NULL UNIQUE,
    full_name text,
    role public.role DEFAULT 'client'::public.role NOT NULL,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
    phone character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX profiles_email_idx ON public.profiles USING btree (email);
CREATE INDEX profiles_organization_id_idx ON public.profiles USING btree (organization_id);

-- financial_records Table
CREATE TABLE public.financial_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id),
    file_name character varying NOT NULL,
    file_path character varying NOT NULL,
    file_type character varying NOT NULL,
    file_size bigint NOT NULL,
    status public.file_status DEFAULT 'pending'::public.file_status NOT NULL,
    analysis_results jsonb,
    risk_flags jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX financial_records_organization_id_idx ON public.financial_records USING btree (organization_id);
CREATE INDEX financial_records_created_at_idx ON public.financial_records USING btree (created_at);

-- audit_reports Table
CREATE TABLE public.audit_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    generated_by uuid NOT NULL REFERENCES auth.users(id),
    title character varying NOT NULL,
    report_data jsonb NOT NULL,
    recommendations text,
    status public.report_status DEFAULT 'draft'::public.report_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX audit_reports_organization_id_idx ON public.audit_reports USING btree (organization_id);

-- activities Table
CREATE TABLE public.activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    action text NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE INDEX activities_organization_id_idx ON public.activities USING btree (organization_id);
CREATE INDEX activities_user_id_idx ON public.activities USING btree (user_id);

-- 3. Row Level Security (RLS) Policies

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid) RETURNS public.role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE;

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id uuid) RETURNS uuid AS $$
  SELECT organization_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE;

-- RLS for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS for organizations
CREATE POLICY "Admins can view all organizations" ON public.organizations FOR SELECT USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users can view their own organization" ON public.organizations FOR SELECT USING (id = get_user_organization_id(auth.uid()));

-- RLS for financial_records
CREATE POLICY "Users can access records from their own organization" ON public.financial_records FOR ALL USING (organization_id = get_user_organization_id(auth.uid()));

-- RLS for audit_reports
CREATE POLICY "Users can access reports from their own organization" ON public.audit_reports FOR ALL USING (organization_id = get_user_organization_id(auth.uid()));

-- RLS for activities
CREATE POLICY "Users can view activities from their own organization" ON public.activities FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

-- 4. Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('financial-records', 'financial-records', false, 52428800, ARRAY['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload to their organization's folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'financial-records'
    AND (storage.folder_name(name))[1] = get_user_organization_id(auth.uid())::text
);

CREATE POLICY "Users can view files in their organization's folder"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'financial-records'
    AND (storage.folder_name(name))[1] = get_user_organization_id(auth.uid())::text
);

CREATE POLICY "Users can delete files in their organization's folder"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'financial-records'
    AND (storage.folder_name(name))[1] = get_user_organization_id(auth.uid())::text
);


-- 5. Database Functions & Triggers

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER on_profile_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create a new organization for the user
  INSERT INTO public.organizations (name)
  VALUES (new.raw_user_meta_data->>'organization_name')
  RETURNING id INTO new_org_id;

  -- Insert a new profile for the user
  INSERT INTO public.profiles (id, email, full_name, role, organization_id, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'role')::public.role,
    new_org_id,
    new.raw_user_meta_data->>'phone'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users table
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- We must disable the old logic in `auth.ts` that creates a profile.
-- The trigger now handles both organization and profile creation atomically.
-- The user will need to remove the profile insertion logic from the `signup` server action.

-- Override the default user creation logic in `auth.ts`.
-- With this trigger, `auth.ts` no longer needs to insert into `profiles`.
-- The user should modify the `signup` function to remove the `supabase.from('profiles').insert(...)` call.
-- This trigger makes the process atomic and handles organization creation.
-- The original `auth.ts` had a potential race condition and failure mode if profile creation failed after user creation. This trigger solves that.
