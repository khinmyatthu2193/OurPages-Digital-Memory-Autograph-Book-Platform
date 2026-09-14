# OurPages

OurPages is a digital memory and autograph book. A registered owner shares a personal link such as `/u/khin`; friends can leave a memory without creating an account, and the owner can privately organize what they receive.

This repository currently contains the project foundation, not the complete product. The visual direction is warm, personal, nostalgic, mobile-first, and modern.

## Planned core features

- Account registration and secure sign-in
- A shareable public memory-book page
- Guest memory submission without an account
- Owner controls to favorite, pin, hide, or delete memories
- Optional prompts and photo attachments

## Stack

- React, Vite, React Router, Tailwind CSS
- Node.js, Express, REST
- PostgreSQL and Prisma ORM
- npm workspaces, ESLint, Prettier, Vitest

## Repository

```text
client/          React application
server/          Express API and Prisma schema
docs/            Product and engineering documentation
tests/           Reserved for cross-workspace/integration tests
```

Unit tests live beside each workspace's source code. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system shape.

## Local setup

Prerequisites: Node.js 20.19+, npm 10+, and PostgreSQL 15+.

```bash
npm install
cp .env.example server/.env
npm run prisma:generate -w server
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example server/.env` in place of `cp`. Create the PostgreSQL database named in `DATABASE_URL`; database migrations are intentionally not included in this initialization.

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

Copy `.env.example` to `server/.env` and replace placeholders locally. Never commit `.env`. `AUTH_SECRET` is reserved for the authentication implementation and must be a strong random value in deployed environments.

## Status and roadmap

Project initialization is complete: workspace tooling, route placeholders, API health handling, documentation, and the initial Prisma schema are present. Next, implement authentication as a cohesive vertical slice, followed by public profiles and memory submission/management. See [docs/PRD.md](docs/PRD.md) for the bounded MVP.
