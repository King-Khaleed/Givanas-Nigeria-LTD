-- 12. Corrected Storage RLS Policies
drop policy if exists "Users can upload to their organization's folder" on storage.objects;
drop policy if exists "Users can view files in their organization's folder" on storage.objects;
drop policy if exists "Users can delete files in their organization's folder" on storage.objects;

alter table storage.objects enable row level security;

create policy "Users can upload to their organization's folder"
on storage.objects for insert
with check (
    bucket_id = 'financial-records'
    and split_part(name, '/', 1) = get_user_organization_id(auth.uid())::text
);

create policy "Users can view files in their organization's folder"
on storage.objects for select
using (
    bucket_id = 'financial-records'
    and split_part(name, '/', 1) = get_user_organization_id(auth.uid())::text
);

create policy "Users can delete files in their organization's folder"
on storage.objects for delete
using (
    bucket_id = 'financial-records'
    and split_part(name, '/', 1) = get_user_organization_id(auth.uid())::text
);
