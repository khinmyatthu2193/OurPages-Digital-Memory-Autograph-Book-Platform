# REST API

All Express endpoints are under `/api`. Resource responses use `{ "data": ... }`; failures use `{ "error": { "code", "message", "details?" } }`.

## Implemented

| Method | Path                             | Access               | Purpose                                                            |
| ------ | -------------------------------- | -------------------- | ------------------------------------------------------------------ |
| GET    | `/api/health`                    | Public               | Service health                                                     |
| GET    | `/api/auth/me`                   | Bearer token         | Verified Auth identity and safe profile                            |
| PATCH  | `/api/profile/me`                | Bearer token         | Update own public profile, book status, mode, and farewell details |
| GET    | `/api/public/:username`          | Public               | Safe non-private profile, active prompts, and visible memories     |
| POST   | `/api/public/:username/memories` | Public, rate-limited | Validated guest memory submission to an open book                  |
| GET    | `/api/public/prompts`            | Public               | Active prompt IDs, text, and categories only                       |
| GET    | `/api/prompts`                   | Public               | Canonical Phase 3 route for active prompt choices                  |
| GET    | `/api/memories`                  | Bearer token         | All memories owned by the current user, pinned first               |
| PATCH  | `/api/memories/:id`              | Bearer token         | Favorite, pin, or hide a memory owned by the current user          |
| DELETE | `/api/memories/:id`              | Bearer token         | Permanently delete a memory owned by the current user              |

Registration, login, logout, session persistence, and token refresh call Supabase Auth directly from the single browser client. They are intentionally not duplicated as Express endpoints. Passwords never reach the OurPages API.

`GET /api/public/:username` returns `{ data: { profile, prompts, memories } }`. Profile fields are allow-listed (`display_name`, `username`, `bio`, `avatar_url`, `memory_book_status`, `memory_book_mode`, and the four optional graduation display fields); the owner/Auth ID is used internally but omitted from the response. Memories contain public presentation fields only and exclude hidden entries. Private or unknown books return `404 BOOK_NOT_FOUND`. `GET /api/prompts` returns only active prompt `id`, `text`, and `category` values; `/api/public/prompts` remains as a compatibility alias.

`POST /api/public/:username/memories` accepts `multipart/form-data` fields `authorName`, `message`, optional boolean `isAnonymous`, optional UUID `promptId`, optional UUID `submissionId`, an empty `website` honeypot, and at most one optional `photo`. Photos must be genuine JPEG, PNG, or WebP files no larger than 5 MB. It returns `{ data: { id, created_at } }` with `201`. Text-only JSON remains accepted for compatibility. Invalid input returns `400`; storage failure returns `502 PHOTO_UPLOAD_FAILED` with safe retry copy; malformed/unknown usernames return `404 BOOK_NOT_FOUND`; closed/private books return `404 BOOK_NOT_OPEN`. The owner, bucket, path, and moderation fields are server-derived. The current limit remains 10 attempts per IP per 15 minutes.

Phase 5 made no API shape changes. Phase 6 extends the allow-listed profile fields on the existing read/update endpoints; it adds no new route. The client maps prompt IDs to active prompt text and continues to treat private and missing books identically.

## Owner memory management

All owner memory routes require `Authorization: Bearer <Supabase access token>`. `GET /api/memories` returns the authenticated owner's complete memory records without accepting an owner ID from the client. Results are ordered by `is_pinned desc`, then `created_at desc`.

`PATCH /api/memories/:id` accepts one or more boolean fields from `is_favorite`, `is_pinned`, and `is_hidden`. Other fields and non-boolean values return `400 VALIDATION_ERROR`. Unknown, malformed, or other-owner IDs return `404 MEMORY_NOT_FOUND`. `DELETE /api/memories/:id` uses the same ownership boundary, returns `204`, and attempts private-object cleanup after the database deletion.

Public and owner memory responses may include `photo_url`, a ten-minute signed URL. They never include the private `photo_path` or submission token. Public signing occurs only for rows already filtered with `is_hidden = false`; private books return no public memory data.

`PATCH /api/profile/me` accepts supported profile fields including `display_name`, `bio`, `memory_book_status`, `memory_book_mode`, `graduation_title`, `graduation_class`, `graduation_year`, and `graduation_message`. Mode is `standard | graduation`; optional text is trimmed and length-limited, and year is null or an integer from 1900–2200. The authenticated user ID always comes from the verified bearer token. Username remains immutable.
