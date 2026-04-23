# Family Docs

A private document vault for your family. Upload, organise, view, and share files — accessible from any device.

## Features

- **Invite-only access** — no public sign-up; accounts are created directly in Supabase
- **Folder management** — create, rename, and delete folders from the sidebar
- **Document names** — give files a human-readable name separate from the filename
- **View & download** — open files inline or download; tokens never appear in the URL
- **Native sharing** — share files via WhatsApp, AirDrop, Messages, or any app available on the device
- **Camera upload** — take a photo directly from your phone and upload it
- **Search** — filter documents by name across all folders
- **Light / dark mode** — follows the system preference, togglable in the header

## Tech stack

- **Next.js 16** (App Router, Server Actions)
- **Supabase** — auth, Postgres database, file storage
- **Tailwind CSS v4**
- **next-themes** — dark/light mode

## Local setup

### 1. Clone and install

```bash
git clone <repo>
cd fam-docs
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, then copy the **Project URL** and **anon public key** from **Settings → API**.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The anon key is safe to expose — all access is protected by Row Level Security policies.

### 4. Run the database schema

In the Supabase dashboard go to **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).

This creates:
- `folders` table with RLS
- `documents` table with a `folder_id` foreign key and RLS
- A private `documents` storage bucket with RLS

### 5. Add family members

There is no sign-up page. Add users directly in Supabase:

**Dashboard → Authentication → Users → Add user → Create new user**

Enter their email and a password, then share the credentials with them.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

```bash
npx vercel
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project environment variables.

## Schema overview

```
folders
  id           uuid  PK
  name         text  UNIQUE
  created_by   uuid  → auth.users
  created_at   timestamptz

documents
  id           uuid  PK
  name         text          (original filename)
  display_name text          (user-set label, optional)
  storage_path text          (path inside the storage bucket)
  folder_id    uuid  → folders(id) ON DELETE SET NULL
  size         bigint
  mime_type    text
  uploaded_by  uuid  → auth.users
  created_at   timestamptz
```

Renaming a folder only updates one row in `folders` — documents reference it by `folder_id`, not by name.

## Project structure

```
app/
  actions/
    auth.ts          login, logout
    documents.ts     upload, delete, rename
    folders.ts       create, rename, delete
  api/documents/[id]/
    route.ts         proxy file delivery (no tokens in URLs)
  login/page.tsx
  page.tsx           server component — fetches docs + folders
components/
  DocumentsView.tsx  main layout, sidebar, search
  DocumentCard.tsx   per-file card with view / download / share / rename
  UploadModal.tsx    drag-drop + camera capture + folder picker
  Logo.tsx           SVG logo mark
  ThemeProvider.tsx
  ThemeToggle.tsx
lib/supabase/
  client.ts          browser client
  server.ts          server client (cookies)
middleware.ts → proxy.ts  auth guard on all routes
supabase/
  schema.sql         full schema + migration notes
```
