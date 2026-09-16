# OurPages

OurPages is a digital memory and autograph book. A registered owner shares a personal link such as `/u/khin`; friends can leave a memory without creating an account, and the owner can privately organize what they receive.

The repository currently contains the Supabase database and authentication foundation. The final memory-book experience is intentionally deferred.

## Planned core features

- Account registration and secure sign-in
- A shareable public memory-book page
- Guest memory submission without an account
- Owner controls to favorite, pin, hide, or delete memories
- Optional prompts and photo attachments

## Stack

- React, Vite, React Router, Tailwind CSS
- Node.js, Express, REST
- Supabase PostgreSQL, Auth, and `supabase-js`
- npm workspaces, ESLint, Prettier, Vitest

## Repository

```text
client/          React application
server/          Express validation and application API
supabase/        Database migrations and development seed
docs/            Product and engineering documentation
tests/           Reserved for cross-workspace/integration tests
```

Unit tests live beside each workspace's source code. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system shape.

## Local setup

Prerequisites: Node.js 20.19+, npm 10+, and a Supabase project (or Supabase CLI with Docker).

```bash
npm install
npx supabase db reset # local Supabase only; destroys the local database
npm run dev
```

Copy the client-safe values from `.env.example` to `client/.env.local` and the server values to `server/.env`. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for hosted-project and local Supabase setup.

## Commands

```bash
npm run dev           # client and API together
npm run build         # production builds
npm run lint          # all workspace linters
npm test              # all workspace tests
npm run format:check  # verify formatting
```

Client: `http://localhost:5173`. API health: `http://localhost:3000/api/health`.

## Environment

Copy the Vite values from `.env.example` to `client/.env.local` and server values to `server/.env`. Never commit credentials, and never expose `SUPABASE_SERVICE_ROLE_KEY` to Vite/browser code.

## Status and roadmap

Phase 2 is implemented: Supabase schema/RLS, Auth forms/session state, a protected dashboard placeholder, and the secured guest-submission API foundation. The final dashboard and memory-book UI remain future work. See [docs/PRD.md](docs/PRD.md) for the bounded MVP.
