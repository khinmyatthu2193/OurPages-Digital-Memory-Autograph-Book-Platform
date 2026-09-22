# REST API

All Express endpoints are under `/api`. Resource responses use `{ "data": ... }`; failures use `{ "error": { "code", "message", "details?" } }`.

## Implemented

| Method | Path                             | Access               | Purpose                                                              |
| ------ | -------------------------------- | -------------------- | -------------------------------------------------------------------- |
| GET    | `/api/health`                    | Public               | Service health                                                       |
| GET    | `/api/auth/me`                   | Bearer token         | Verified Auth identity and safe profile                              |
| PATCH  | `/api/profile/me`                | Bearer token         | Update own display name, bio, avatar URL, or book status through RLS |
| GET    | `/api/public/:username`          | Public               | Safe non-private profile, active prompts, and visible memories       |
| POST   | `/api/public/:username/memories` | Public, rate-limited | Validated guest memory submission to an open book                    |
| GET    | `/api/public/prompts`            | Public               | Active prompt IDs, text, and categories only                         |
| GET    | `/api/prompts`                   | Public               | Canonical Phase 3 route for active prompt choices                    |

Registration, login, logout, session persistence, and token refresh call Supabase Auth directly from the single browser client. They are intentionally not duplicated as Express endpoints. Passwords never reach the OurPages API.

`GET /api/public/:username` returns `{ data: { profile, prompts, memories } }`. Profile fields are allow-listed (`display_name`, `username`, `bio`, `avatar_url`, `memory_book_status`); the owner/Auth ID is used internally but omitted from the response. Memories contain public presentation fields only and exclude hidden entries. Private or unknown books return `404 BOOK_NOT_FOUND`. `GET /api/prompts` returns only active prompt `id`, `text`, and `category` values; `/api/public/prompts` remains as a compatibility alias.

`POST /api/public/:username/memories` accepts `authorName`, `message`, optional boolean `isAnonymous`, optional UUID `promptId`, and an empty `website` honeypot. It returns `{ data: { id, created_at } }` with `201`. Unexpected fields, invalid types, inactive prompt IDs, empty messages, names over 100 characters, and messages over 2,000 characters return `400`; malformed or unknown usernames return `404 BOOK_NOT_FOUND`; closed or private books reject submissions with `404 BOOK_NOT_OPEN`. `owner_id` and all moderation fields are server-derived and cannot be supplied. The current initial limit is 10 submission attempts per IP per 15 minutes; production deployments must configure trusted proxy handling correctly.

## Planned for a later phase

| Method | Path                | Purpose                                |
| ------ | ------------------- | -------------------------------------- |
| GET    | `/api/memories`     | Paginated owner memory list            |
| PATCH  | `/api/memories/:id` | Favorite, pin, or hide an owned memory |
| DELETE | `/api/memories/:id` | Delete an owned memory                 |

These owner-management endpoints and their final UI are not part of Phase 2.
