# Architecture

## System overview

OurPages is an npm-workspaces application backed by Supabase.

```text
React/Vite -- anon key + Supabase Auth --> Supabase Auth
     |                                      | creates
     | Bearer access token                  v
     +-----------------> Express API ------> profiles / memories / prompts
                         |                  PostgreSQL + RLS
                         +-- server-only service role (guest inserts/storage)
                                            |
                                            +--> private memory-photos bucket
```

Supabase provides PostgreSQL, authentication, session refresh/persistence, and private photo storage. React uses one configured client in `client/src/lib/supabase.js`. Express owns application-level validation and privileged guest writes; it does not store passwords or create a second session system.

## Authentication flow

Registration calls Supabase Auth with `display_name` and normalized `username` metadata. The `on_auth_user_created` database trigger inserts the matching profile using the Auth user UUID. Database constraints are the final authority for username format, reserved names, and uniqueness. Depending on the Supabase project's email-confirmation setting, registration either creates a session immediately or asks the owner to confirm email.

`AuthProvider` restores `getSession()`, subscribes to `onAuthStateChange`, and exposes register/login/logout/current-user state. Supabase persists and refreshes the browser session. `/dashboard` is guarded client-side. Protected Express calls send the Supabase access token as a Bearer token; middleware verifies it with Supabase Auth before using the user identity.

## Request flows

Public reads use `GET /api/public/:username`, which returns only allow-listed profile fields, active prompts, and memories where `is_hidden = false`. The owner ID is used to query memories and removed before responding. The endpoint uses the server-only client because browser roles deliberately have no memory-read policy; its select lists and visibility filter are the application boundary. The browser renders the mobile-first book at `/u/:username`; open books offer the no-login form, while closed books remain readable but omit it. Private profiles return the same not-found response as absent profiles. `GET /api/prompts` returns active prompt choices only, with `/api/public/prompts` retained as an alias.

Graduation/farewell mode is an optional profile presentation flag. It changes public header/copy, prompt ordering, metadata, and sharing language while continuing to use the same URL, prompt records, and memory table. The existing authenticated profile update flow owns all mode/detail changes. QR generation is client-only, lazy-loaded when its dialog opens, and encodes only the absolute public `/u/:username` URL.

Guest submissions use `POST /api/public/:username/memories`. Express applies a per-IP limit, rejects a honeypot field, validates/normalizes all input, verifies the target is open and the optional prompt is active, then inserts with the server-only service role. There is deliberately no anon or authenticated INSERT policy on `memories`.

Photo submissions use the same multipart endpoint and remain message-first. Express keeps at most one 5 MB file in memory, verifies its MIME type and binary signature, generates the memory ID and storage path, uploads to the private `memory-photos` bucket, then inserts the memory. It removes the object if insertion fails. A client submission UUID makes response-loss retries idempotent. Public reads sign paths only after filtering hidden memories; owner reads sign paths only after authenticated ownership checks. Internal paths are removed from API responses, and signed links expire after ten minutes.

Owner profile changes use an authenticated Supabase client carrying the user's token, so RLS remains active. The service role is isolated to backend services that require it and never appears in Vite code.

The protected dashboard has overview, memories, My Page, and settings routes. It sends the current Supabase access token to Express, which verifies the user before listing or changing memories. Memory services add an explicit `owner_id = authenticated user ID` condition while RLS independently enforces the same boundary. The browser calculates overview statistics from the securely returned owner collection, performs client-side search and filters, and rolls back optimistic memory changes when the API fails. A small client-only toast provider announces meaningful owner actions without changing the API boundary.

## Boundaries

- `controllers`: HTTP status/envelope handling
- `middleware`: authentication, rate limiting, multipart limits, and centralized errors
- `services`: database queries and business rules
- `validators`: boundary normalization and allow lists
- `supabase/migrations`: schema, triggers, constraints, indexes, and RLS

The `memory-photos` bucket has no browser-role object policies. All upload, signing, and cleanup operations use the server-only client after application authorization. Phase 7 does not add galleries, replacement, video, image transformation, or export generation.
