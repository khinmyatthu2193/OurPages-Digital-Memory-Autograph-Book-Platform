# Changelog

All notable project changes will be recorded here, following Keep a Changelog conventions before the first release.

## [Unreleased]

### Added

- Supabase Auth client, registration/login/logout flows, session restoration, and protected dashboard routing.
- Supabase migration for profiles, memories, prompts, constraints, indexes, triggers, and RLS policies.
- Validated and rate-limited Express public memory-submission foundation.
- Safe development prompt seed and Phase 2 security/auth/database tests.

- Initial npm-workspaces repository structure.
- React/Vite client with Tailwind CSS and foundational routes.
- Express API foundation with security middleware, CORS, health check, and centralized errors.
- PostgreSQL/Prisma schema for users, memories, and prompts.
- Product, architecture, database, API, security, and development documentation.

### Changed

- Replaced the initialization-era Prisma/custom-password direction with Supabase PostgreSQL and Supabase Auth.
