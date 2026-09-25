# Development Guide

## Prerequisites

- Node.js 20.19+ and npm 10+
- A Supabase project, or Supabase CLI plus Docker for the local stack

## Configure

Install dependencies with `npm install`. Copy the client-safe values from `.env.example` into `client/.env.local`, and the server values into `server/.env`.

Use the project URL and anon/publishable key for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`. Put the service-role/secret key only in `server/.env` as `SUPABASE_SERVICE_ROLE_KEY`. Never commit either local environment file. Configure the Supabase Auth site URL as `http://localhost:5173` for local development and add deployed redirect URLs before release.

## Database setup

For a linked hosted project, review the SQL then run:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

For the local Supabase stack:

```bash
npx supabase start
npx supabase db reset
npx supabase test db
```

`db reset` is destructive and is only for the disposable local database. It applies `supabase/migrations` and then `supabase/seed.sql`. `test db` runs the pgTAP ownership/RLS integration checks under authenticated and anonymous roles. Do not run reset against shared or production data. Review migrations before pushing. Email confirmation behavior is controlled in Supabase Auth settings; when enabled, registration asks the user to confirm before a session exists.

The Phase 7 migration creates the private `memory-photos` bucket; no additional environment variables are required. Hosted projects must receive this migration with `npx supabase db push` before photo-capable server code is started. The service-role key remains server-only.

Phase 8 has no migration, environment variable, or new dependency. Export uses
the existing service-role storage signer only after bearer-token authentication
and owner-scoped database queries. PDF output is provided by the browser's print
dialog rather than a server PDF runtime.

## Run and verify

```bash
npm run dev
npm test
npm run lint
npm run format:check
npm run build
```

The client runs at `http://localhost:5173`, Express at `http://localhost:3000`, and Vite proxies `/api`. A live Supabase project is required for manual end-to-end registration and login. Unit tests mock external Auth calls and inspect the migration boundary, so they do not require real credentials. Full RLS integration can be exercised against local Supabase after `npx supabase db reset`.

## Phase 8 manual smoke test

1. Register a valid non-reserved username and confirm email if required.
2. Submit at least two guest memories, then log in and confirm `/dashboard` shows their real statistics.
3. Search and filter `/dashboard/memories`; favorite, pin, hide, and unhide an owned memory.
4. Confirm a hidden memory is absent from `/u/<username>` but remains visible to its owner.
5. Delete an owned memory through the confirmation UI and verify it no longer appears.
6. Close the memory book from the dashboard and verify public submission is rejected; reopen it and verify submission succeeds.
7. Edit the display name and bio, copy the public link, and open the public page.
8. Log out and confirm all `/dashboard` routes redirect to `/login`.
9. With a second account, verify another owner's memory IDs return `404` for update and delete operations.
10. At 320, 375, 390, 414, 768, 1024, and 1440 px, verify public pages, forms, cards, dashboard navigation, and dialogs have no horizontal overflow or clipped controls.
11. Submit a 2,000-character memory, expand it publicly, and verify its optional prompt context remains readable.
12. Enable reduced motion at the OS/browser level and verify feedback remains immediate without noticeable movement.
13. Confirm the public page title/description use only the public display name and reset after navigating away.
14. In Settings, enable graduation/farewell mode, save optional title/class/year/message values, and confirm the public header and My Page preview update.
15. Confirm graduation prompts appear first while standard prompts and the no-prompt choice remain available.
16. Submit a farewell memory without logging in and confirm the graduation-specific success state appears.
17. Copy and natively share the public URL where supported; in a browser without Web Share, confirm Copy Link remains and Share is absent.
18. Open the QR dialog by keyboard, scan or decode the QR to confirm it contains only the absolute `/u/<username>` URL, download the PNG, and close with Escape.
19. Print-preview a public standard book and a graduation book; confirm navigation/buttons are hidden and complete long memories remain readable.
20. Return to standard mode and confirm the original public language and presentation return without deleting saved graduation details.
21. Submit text-only, anonymous-photo, and named-photo memories using JPG, PNG, and WebP files; confirm previews and success copy.
22. Reject an SVG/renamed non-image and a file over 5 MB, then confirm no memory or object was created.
23. Open a public photo by keyboard, close with Escape and the backdrop, and verify portrait/landscape images at all listed widths.
24. Hide a photo memory and confirm it and its URL are absent from a fresh public API response while remaining visible to the owner.
25. Delete a photo memory and verify its row and `memory-photos` object are removed.
26. Open **Export** from the dashboard and confirm `/dashboard/export` shows a cover, all visible memories, prompt text, and the correct attached photos.
27. Hide a memory, reload the export, and confirm neither its content nor photo appears. Confirm an unauthenticated visit redirects to login.
28. Check both standard and graduation modes, including custom title, class/year, farewell message, and the no-memories state.
29. At 320, 375, 390, 414, 768, 1024, and 1440 px, confirm the preview has no horizontal overflow and both actions remain keyboard accessible.
30. Use Print / Save as PDF with A4 paper. Confirm the toolbar is absent, the cover occupies its own page, memory cards do not split unnecessarily, long messages remain readable, and photos preserve their aspect ratio.
