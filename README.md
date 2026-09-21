# ALLMED Pharmacy Operations

Vite + React ops desk. Product catalog stays in `public/data/products.json`. Operational data can run in the browser (`localStorage`) or on **Supabase**.

## Local demo (no backend)

```bash
npm install
npm run dev
```

Without `VITE_SUPABASE_URL`, the app keeps using localStorage.

## Supabase + Vercel

### 1. Create a Supabase project

Copy the project URL and anon key from **Project Settings → API**.

### 2. Apply the schema

In the Supabase SQL editor, run `supabase/schema.sql`.

Enable **Email** auth (Authentication → Providers). Create staff users whose emails match `staff.email` (demo seeds use `priya.nair@allmed.local`, `suresh.menon@allmed.local`, …). Confirm the emails or disable “Confirm email” while testing.

### 3. Local env

```bash
cp .env.example .env.local
```

Fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SEED_DEMO_DATA` — `true` seeds branches/staff/sample orders on an empty database. Set `false` for a clean production DB (you still need `branches` and `staff` rows).

Never put the **service role** key in the frontend.

### 4. Deploy on Vercel

- Import the Git repo
- Framework: Vite
- Build: `npm run build`
- Output: `dist`
- Environment variables: the same `VITE_*` values as local
- `vercel.json` rewrites unknown paths to `index.html` for React Router

After changing env vars, redeploy so Vite can bake them into the client bundle.

## Auth linking

Signed-in users must match a `staff.email` row. The sidebar shows that staff member; delivery executives are locked to themselves on `/agent`.
