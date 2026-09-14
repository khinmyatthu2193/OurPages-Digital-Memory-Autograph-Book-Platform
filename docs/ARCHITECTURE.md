# Architecture

## System overview

OurPages is a two-workspace monorepo with a browser client, a stateless REST API, and PostgreSQL persistence.

```text
Browser (React/Vite)
        |
        | HTTPS + JSON; secure cookie for authenticated calls
        v
Express REST API
        |
        | Prisma Client
        v
PostgreSQL
```

## Frontend

`client/src` is organized by pages, shared components, layouts, context, hooks, services, and utilities. React Router owns client-side navigation. API calls belong in `services`, session state in an authentication context when implemented, and presentation remains in components. Tailwind CSS v4 supplies styling through its Vite plugin.

Initial routes are `/`, `/login`, `/register`, `/dashboard`, and `/u/:username`. They are architectural placeholders only. The dashboard route will receive an authentication guard with the authentication slice.

## Backend

`server/src/app.js` composes Express and is importable without opening a socket, which makes it testable. `server/src/server.js` loads configuration and starts the process. Routes delegate to controllers; controllers handle HTTP concerns; services contain business and database operations; validators define boundary validation. Central not-found and error middleware produce a consistent JSON envelope.

## API communication

The client calls versionless `/api` routes over HTTPS. In development, Vite proxies `/api` to Express. JSON is the default payload. Cookie-bearing cross-origin requests use `credentials: 'include'`; CORS is restricted to `CLIENT_ORIGIN`.

## Authentication flow

The planned implementation hashes passwords with Argon2id and establishes a server-verifiable session or short-lived signed token in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie. Registration/login rotates the session identifier. `/api/auth/me` resolves the owner, and logout invalidates the server-side session where sessions are used before clearing the cookie. State-changing cookie-authenticated requests require CSRF protection. Exact session persistence will be selected during the authentication milestone; secrets never enter browser storage.

## Request flows

```text
Public visitor: /u/:username -> GET public profile -> fill form
                -> POST memory -> validate/rate-limit -> Prisma -> PostgreSQL

Owner: login -> secure cookie -> protected dashboard request
       -> authenticate -> authorize ownership -> service -> Prisma -> PostgreSQL
```

Public responses use allow-listed fields. Owner routes derive owner identity from authentication, never request parameters. Hidden content and internal account fields are excluded from public queries.

## Database interaction

Only backend services use Prisma Client. Controllers do not issue queries directly. The initial relational schema is described in [DATABASE.md](DATABASE.md). Migrations are reviewed and applied through Prisma commands; production deployment uses `prisma migrate deploy`, never development migration commands.

## Deployment

The client builds to static assets for a CDN/static host. The Express service runs behind TLS termination and a trusted reverse proxy. It connects to managed PostgreSQL using an encrypted connection and least-privileged credentials. Client and API should share a site where practical to simplify secure cookies. CI installs from the lockfile, lints, tests, builds, and validates the Prisma schema before deployment.

## Decisions

- **Monorepo/npm workspaces:** simple coordinated development without extra orchestration.
- **JavaScript/ES modules:** matches the requested default; JSDoc and tests can provide lightweight contracts.
- **REST/Express:** direct fit for the bounded resource model.
- **PostgreSQL/Prisma:** relational constraints suit ownership and moderation state.
- **Cookie authentication:** reduces exposure to token theft through browser JavaScript.
- **Single API service:** sufficient for MVP; no microservices or queues.
- **Service boundary:** adds a clear home for ownership checks and database work without premature abstraction.
