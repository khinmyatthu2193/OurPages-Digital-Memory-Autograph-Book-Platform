# REST API Plan

All endpoints use JSON under `/api`. Successful resource responses return `{ "data": ... }`; errors use `{ "error": { "code": "...", "message": "...", "details": [] } }`. The health endpoint is the only current implementation; all other routes below are planned.

| Method | Path                             | Access               | Purpose                                      |
| ------ | -------------------------------- | -------------------- | -------------------------------------------- |
| GET    | `/api/health`                    | Public               | Service health                               |
| POST   | `/api/auth/register`             | Public               | Create an owner account and session          |
| POST   | `/api/auth/login`                | Public               | Authenticate and rotate/create session       |
| POST   | `/api/auth/logout`               | Authenticated        | Invalidate session and clear cookie          |
| GET    | `/api/auth/me`                   | Authenticated        | Return the current safe owner profile        |
| GET    | `/api/users/:username`           | Public               | Return allow-listed public profile data      |
| PATCH  | `/api/users/profile`             | Authenticated        | Update the current owner's public profile    |
| PATCH  | `/api/users/settings`            | Authenticated        | Update the current owner's settings          |
| GET    | `/api/memories`                  | Authenticated        | List memories belonging to current owner     |
| POST   | `/api/memories`                  | Authenticated        | Reserved owner-created memory endpoint       |
| PATCH  | `/api/memories/:id`              | Authenticated owner  | Favorite, pin, or hide an owned memory       |
| DELETE | `/api/memories/:id`              | Authenticated owner  | Delete an owned memory                       |
| GET    | `/api/public/:username`          | Public               | Fetch public book/profile and active prompts |
| POST   | `/api/public/:username/memories` | Public, rate-limited | Submit a guest memory to that owner          |

Authentication is cookie-based, so browser requests include credentials. State-changing authenticated endpoints will require a CSRF defense. `POST /api/public/:username/memories` is not owner-authenticated but requires input validation, rate limiting, and abuse controls.

## Representative payloads

Register/login accept only documented credential fields and never return password hashes. A public memory submission will accept `authorName`, `message`, `isAnonymous`, optional `promptId`, and optional upload metadata after the upload design is finalized. Memory updates allow-list only `isFavorite`, `isPinned`, and `isHidden`; ownership comes from the session.

Pagination will use bounded query parameters on memory lists before those endpoints are implemented. HTTP semantics: `201` create, `204` logout/delete where no body is needed, `400` malformed input, `401` no valid session, `403` authenticated but forbidden, `404` absent resource, `409` uniqueness conflict, and `429` rate limited.
