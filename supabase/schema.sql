-- Run this in your Supabase SQL Editor (fresh install)

-- Folders table (must exist before documents references it)
create table if not exists public.folders (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.folders enable row level security;

create policy "Authenticated users can read folders"
  on public.folders for select to authenticated using (true);

create policy "Authenticated users can insert folders"
  on public.folders for insert to authenticated
  with check (auth.uid() = created_by);

create policy "Authenticated users can update folders"
  on public.folders for update to authenticated
  using (true) with check (true);

create policy "Authenticated users can delete folders"
  on public.folders for delete to authenticated using (true);

-- Documents table (folder_id FK → folders)
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  display_name text,
  storage_path text not null,
  folder_id    uuid references public.folders(id) on delete set null,
  size         bigint not null,
  mime_type    text not null default 'application/octet-stream',
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Authenticated users can read documents"
  on public.documents for select to authenticated using (true);

create policy "Authenticated users can insert documents"
  on public.documents for insert to authenticated
  with check (auth.uid() = uploaded_by);

create policy "Authenticated users can update documents"
  on public.documents for update to authenticated
  using (true) with check (true);

create policy "Authenticated users can delete documents"
  on public.documents for delete to authenticated using (true);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents');

create policy "Authenticated users can read"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents');

create policy "Authenticated users can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents');


-- ============================================================
-- MIGRATION (run this if you already have the old schema)
-- ============================================================
--
-- Step 1: create folder rows for every distinct folder name in documents
-- insert into public.folders (name, created_at)
-- select distinct folder, now() from public.documents
-- where folder is not null
-- on conflict (name) do nothing;
--
-- Step 2: add the FK column
-- alter table public.documents
--   add column if not exists folder_id uuid references public.folders(id) on delete set null;
--
-- Step 3: populate it
-- update public.documents d
-- set folder_id = f.id
-- from public.folders f
-- where f.name = d.folder;
--
-- Step 4: drop the old text column
-- alter table public.documents drop column folder;
-- ============================================================
