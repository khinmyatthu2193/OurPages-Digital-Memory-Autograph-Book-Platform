# Changelog

All notable project changes will be recorded here, following Keep a Changelog conventions before the first release.

## [Unreleased]

### Added

- Phase 7 one-photo memory attachments with mobile preview/removal, honest upload state, and photo-aware success copy.
- Private Supabase `memory-photos` storage, signature/MIME/5 MB validation, controlled object paths, signed reads, failure cleanup, and idempotent retries.
- Lazy public/owner photo thumbnails, an accessible lightbox, print support, and upload/storage/privacy tests.

- Phase 6 optional graduation/farewell mode with customizable title, class/group, year, and message.
- Graduation-specific prompt data, public presentation, submission success copy, sharing metadata, and dashboard preview.
- Occasion-aware native sharing, copy fallback, accessible lazy-generated QR dialog with PNG download, and print-friendly public books.
- Authorization, migration-default, standard/graduation mode, prompt ordering, sharing URL, and QR payload tests.

- Phase 5 public memory-card expansion, prompt context, warm empty/closed/success states, native sharing, reusable toast feedback, dynamic safe metadata, and a minimal favicon.
- Focused tests for private-book non-disclosure, the 2,000-character form boundary, and accessible long-memory expansion.

- Phase 4 private owner dashboard with real statistics, recent memories, responsive navigation, public-page sharing, book-status control, and basic profile editing.
- Authenticated memory list, favorite, pin, visibility, and delete endpoints with explicit ownership checks and RLS enforcement.
- Owner memory search, filters, pinned-first sorting, mutation feedback, rollback behavior, delete confirmation, and useful empty/error/loading states.
- Phase 3 public `/u/:username` book with responsive profile, visible-memory cards, closed-book handling, and accessible no-login memory form.
- Safe public visible-memory and prompt retrieval endpoints, with hidden memories excluded from public responses.
- Guest message validation capped at 2,000 characters while owner-controlled fields remain server-derived.
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

- Unified design tokens, focus treatment, reduced-motion behavior, authentication styling, responsive card behavior, and user-facing action feedback across the client.
- Corrected visible landing-page character encoding and aligned product documentation with the text-only MVP.

- Completed the Phase 3 public response boundary, guest-form error and keyboard handling, and route/error states.
- Replaced the initialization-era Prisma/custom-password direction with Supabase PostgreSQL and Supabase Auth.
