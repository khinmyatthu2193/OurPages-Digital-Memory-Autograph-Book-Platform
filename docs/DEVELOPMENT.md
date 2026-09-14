# Development Guide

## Prerequisites

- Node.js 20.19 or later and npm 10 or later
- PostgreSQL 15 or later
- Git

## Install and configure

```bash
git clone <repository-url>
cd OurPages
npm install
cp .env.example server/.env
```

PowerShell users can run `Copy-Item .env.example server/.env`. Create an empty `ourpages` PostgreSQL database or change `DATABASE_URL`. Replace `AUTH_SECRET` before authentication work; it is currently reserved.

## Prisma/database

```bash
npm run prisma:format -w server
npm run prisma:validate -w server
npm run prisma:generate -w server
npm run prisma:migrate -w server -- --name init
npm run prisma:studio -w server
```

The first three commands do not modify database data. `prisma:migrate` creates/applies a development migration and requires a disposable local database. Review generated SQL before committing it. Production uses `npx prisma migrate deploy` in a controlled deployment step.

## Run

```bash
npm run dev             # both workspaces
npm run dev -w client   # http://localhost:5173
npm run dev -w server   # http://localhost:3000
```

Vite proxies `/api` to port 3000 during development. Override the API port and matching proxy target together if needed.

## Quality and builds

```bash
npm test
npm run lint
npm run format:check
npm run build
```

Tests run once in CI. Workspace-specific variants use `-w client` or `-w server`. Client production output is `client/dist`; the server build validates syntax because the JavaScript API runs directly in Node.

## Working agreements

Create feature branches, keep changes scoped, include tests for behavior, and update documentation when contracts change. Never commit local `.env`, credentials, uploads, generated output, or production data. Database access belongs in services and external input must be validated at the boundary.
