# Security Strategy

## Authentication and secrets

Supabase Auth exclusively handles registration, password verification, login, logout, session persistence, refresh, and user identity. OurPages never stores passwords. The browser receives only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; the anon key is not a secret and relies on RLS.

`SUPABASE_SERVICE_ROLE_KEY` is server-only, bypasses RLS, and must never use a `VITE_` prefix, enter client code, logs, bundles, or source control. Rotate it immediately if exposed. Express verifies Bearer tokens with Supabase before trusting an identity. Production secrets belong in the deployment platform's secret manager.

## Data authorization

RLS is enabled for profiles, memories, and prompts. Owners can update only their profile and read/update/delete only memories whose `owner_id` equals `auth.uid()`. No policy makes memories publicly readable. Browser roles cannot insert memories. Even when the server uses its privileged client for a guest submission, it explicitly resolves the owner by normalized username and requires an `open` status.

## Public submissions

The implemented boundary includes strict field allow-listing, type/length checks, trimming, UUID validation, active-prompt verification, open-book verification, a honeypot, a 100 KB JSON limit, and per-IP rate limiting. Messages are capped at 2,000 characters and names at 100. Public reads have a separate allow-list and explicitly filter `is_hidden = false`; they never return owner IDs or moderation flags. React renders content as text, never visitor HTML. Do not add photo writes without a separate storage validation/policy design.

Rate limiting is process-local in Phase 2. Before horizontally scaled production, use a shared rate-limit store and configure Express `trust proxy` only for the known proxy topology. Add telemetry, progressive bot friction, privacy/retention rules, and incident-response ownership before launch.

## HTTP and errors

Helmet security headers and an allow-listed `CLIENT_ORIGIN` CORS configuration remain enabled. Public errors do not expose database details, secrets, or stack traces. Private profile lookups intentionally resemble missing books. Logs must exclude access/refresh tokens and submitted personal content.
