# Development Guide

## Prerequisites

- Node.js 20.19+ and npm 10+
- A Supabase project, or Supabase CLI plus Docker for the local stack

## Configure

Install dependencies with `npm install`. Copy the client-safe values from `.env.example` into `client/.env.local`, and the server values into `server/.env`.

Use the project URL and anon/publishable key for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`. Put the service-role/secret key only in `server/.env` as `SUPABASE_SERVICE_ROLE_KEY`. Never commit either local environment file. Configure the Supabase Auth site URL as `http://localhost:5173` for local development and add deployed redirect URLs before release.

## Database setup

For a linked hosted project, review the SQL then run:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

For the local Supabase stack:

```bash
npx supabase start
npx supabase db reset
npx supabase test db
```

`db reset` is destructive and is only for the disposable local database. It applies `supabase/migrations` and then `supabase/seed.sql`. `test db` runs the pgTAP ownership/RLS integration checks under authenticated and anonymous roles. Do not run reset against shared or production data. Review migrations before pushing. Email confirmation behavior is controlled in Supabase Auth settings; when enabled, registration asks the user to confirm before a session exists.

## Run and verify

```bash
npm run dev
npm test
npm run lint
npm run format:check
npm run build
```

The client runs at `http://localhost:5173`, Express at `http://localhost:3000`, and Vite proxies `/api`. A live Supabase project is required for manual end-to-end registration and login. Unit tests mock external Auth calls and inspect the migration boundary, so they do not require real credentials. Full RLS integration can be exercised against local Supabase after `npx supabase db reset`.

## Phase 2 manual smoke test

1. Register a valid non-reserved username and confirm email if required.
2. Log in and confirm `/dashboard` displays the Auth email.
3. Log out and confirm `/dashboard` redirects to `/login`.
4. Request `/api/public/<username>` and verify no email or memory content is returned.
5. POST a guest message to an open book; close/private the book and verify submission is rejected.
