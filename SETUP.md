# Family Docs — Setup Guide

## 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy your **Project URL** and **anon public key** from **Settings → API**.
3. Paste them into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 2. Database & Storage Setup

In your Supabase dashboard, go to **SQL Editor** and run the contents of `supabase/schema.sql`.

This creates:
- `documents` table with RLS (only authenticated users can access)
- `documents` storage bucket (private, authenticated access only)

## 3. Add Family Members (no self-signup)

Users must be added manually — there is no public signup page.

**Option A — Supabase Dashboard:**
1. Go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter their email and set a password
4. Share credentials with your family member

**Option B — SQL:**
```sql
-- Supabase handles this through the Auth API, use Option A
```

## 4. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Deploy (Vercel)

```bash
npx vercel
```

Set the two env vars in Vercel's project settings.

---

## Folder Categories

Documents are organized into: `general`, `medical`, `legal`, `financial`, `school`, `insurance`, `tax`, `other`
