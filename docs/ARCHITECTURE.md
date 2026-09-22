# Architecture

## System overview

OurPages is an npm-workspaces application backed by Supabase.

```text
React/Vite â”€â”€ anon key + Supabase Auth â”€â”€> Supabase Auth
     â”‚                                      â”‚ creates
     â”‚ Bearer access token                  v
     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€> Express API â”€â”€â”€â”€â”€â”€> profiles / memories / prompts
                         â”‚                  PostgreSQL + RLS
                         â””â”€ server-only service role (guest inserts only)
```

Supabase provides PostgreSQL, authentication, session refresh/persistence, and the future storage foundation. React uses one configured client in `client/src/lib/supabase.js`. Express owns application-level validation and privileged guest writes; it does not store passwords or create a second session system.

## Authentication flow

Registration calls Supabase Auth with `display_name` and normalized `username` metadata. The `on_auth_user_created` database trigger inserts the matching profile using the Auth user UUID. Database constraints are the final authority for username format, reserved names, and uniqueness. Depending on the Supabase project's email-confirmation setting, registration either creates a session immediately or asks the owner to confirm email.

`AuthProvider` restores `getSession()`, subscribes to `onAuthStateChange`, and exposes register/login/logout/current-user state. Supabase persists and refreshes the browser session. `/dashboard` is guarded client-side. Protected Express calls send the Supabase access token as a Bearer token; middleware verifies it with Supabase Auth before using the user identity.

## Request flows

Public reads use `GET /api/public/:username`, which returns only allow-listed profile fields, active prompts, and memories where `is_hidden = false`. The owner ID is used to query memories and removed before responding. The endpoint uses the server-only client because browser roles deliberately have no memory-read policy; its select lists and visibility filter are the application boundary. The browser renders the mobile-first book at `/u/:username`; open books offer the no-login form, while closed books remain readable but omit it. Private profiles return the same not-found response as absent profiles. `GET /api/prompts` returns active prompt choices only, with `/api/public/prompts` retained as an alias.

Guest submissions use `POST /api/public/:username/memories`. Express applies a per-IP limit, rejects a honeypot field, validates/normalizes all input, verifies the target is open and the optional prompt is active, then inserts with the server-only service role. There is deliberately no anon or authenticated INSERT policy on `memories`.

Owner profile changes use an authenticated Supabase client carrying the user's token, so RLS remains active. The service role is isolated to backend services that require it and never appears in Vite code.

## Boundaries

- `controllers`: HTTP status/envelope handling
- `middleware`: authentication, rate limiting, and centralized errors
- `services`: database queries and business rules
- `validators`: boundary normalization and allow lists
- `supabase/migrations`: schema, triggers, constraints, indexes, and RLS

Storage buckets and upload policy are deferred until the photo-upload phase. Owner memory-management UI remains deferred; Phase 3 ships the public book and guest-submission experience only.
