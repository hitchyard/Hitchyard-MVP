-- 1. Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('freight-documents', 'freight-documents', true)
on conflict (id) do nothing;

-- 2. Allow public read access to BOLs
create policy "Public Access to BOLs"
on storage.objects for select
using ( bucket_id = 'freight-documents' );

-- 3. Allow authenticated uploads (from your processFreightPayment action)
create policy "Authenticated Uploads"
on storage.objects for insert
with check ( bucket_id = 'freight-documents' AND auth.role() = 'authenticated' );
