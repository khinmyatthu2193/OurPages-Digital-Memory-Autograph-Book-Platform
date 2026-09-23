# Security Strategy

## Authentication and secrets

Supabase Auth exclusively handles registration, password verification, login, logout, session persistence, refresh, and user identity. OurPages never stores passwords. The browser receives only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; the anon key is not a secret and relies on RLS.

`SUPABASE_SERVICE_ROLE_KEY` is server-only, bypasses RLS, and must never use a `VITE_` prefix, enter client code, logs, bundles, or source control. Rotate it immediately if exposed. Express verifies Bearer tokens with Supabase before trusting an identity. Production secrets belong in the deployment platform's secret manager.

## Data authorization

RLS is enabled for profiles, memories, and prompts. Anonymous profile reads also have column-level grants that exclude the Auth user ID. Owners can update only their profile and read/update/delete only memories whose `owner_id` equals `auth.uid()`. No policy makes memories publicly readable. Browser roles cannot insert memories. Even when the server uses its privileged client for a guest submission, it explicitly resolves the owner by normalized username and requires an `open` status.

Every dashboard API requires a verified Supabase Bearer token. Express derives the owner ID from that token, ignores client ownership claims, applies the owner ID to every memory query or mutation, and then executes through the authenticated Supabase client so RLS remains active. Missing and other-owner memory IDs share the same `404 MEMORY_NOT_FOUND` response. Profile changes are similarly scoped to the authenticated user ID.

## Public submissions

The implemented boundary includes strict field allow-listing, type/length checks, trimming, UUID validation, active-prompt verification, open-book verification, a honeypot, request limits, and per-IP rate limiting. Messages are capped at 2,000 characters and names at 100. Photo uploads are limited to one 5 MB in-memory part and must match both an allowed MIME type and JPEG/PNG/WebP binary signature. Guests cannot choose owner IDs, bucket names, paths, or moderation flags. Original filenames are not used in storage paths.

The `memory-photos` bucket is private and has no anon/authenticated object policy. Only the server service role uploads, signs, and removes objects. Public memory queries filter `is_hidden = false` before signing and strip internal paths; owner queries require bearer authentication and owner RLS. Signed URLs expire after ten minutes, bounding access if a visible memory is subsequently hidden. Deletion performs best-effort object cleanup, and failed database inserts trigger compensating cleanup. Phase 7 stores originals without image transcoding, so EXIF stripping and derived thumbnails remain future hardening/performance work.

Rate limiting is process-local in Phase 2. Before horizontally scaled production, use a shared rate-limit store and configure Express `trust proxy` only for the known proxy topology. Add telemetry, progressive bot friction, privacy/retention rules, and incident-response ownership before launch.

## Public metadata

Public-page titles and descriptions are derived only from the allow-listed public display name. Memory text, author names, hidden content, counts, and private profiles are never used in metadata. Private books continue to return the same response as unknown books.

Graduation metadata adds only the public mode label to that display-name-based copy; it does not use memories, email, owner IDs, or hidden content. Graduation settings use the existing authenticated profile endpoint and owner RLS policy. Guest memory payload allow-listing is unchanged, so guests cannot set profile mode/details. Generated QR images contain only the absolute public `/u/:username` URL and are produced locally in the owner's browser.

## HTTP and errors

Helmet security headers and an allow-listed `CLIENT_ORIGIN` CORS configuration remain enabled. Public errors do not expose database details, secrets, or stack traces. Private profile lookups intentionally resemble missing books. Logs must exclude access/refresh tokens and submitted personal content.
