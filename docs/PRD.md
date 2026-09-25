# Product Requirements Document

## Product overview

OurPages is a digital version of a school autograph book. An account owner receives a unique public page, shares it with friends, and collects personal memories or farewell notes. Visitors do not need accounts. Owners use a private dashboard to manage received memories.

This document is the source of truth for product scope.

## Problem statement

Physical autograph books are meaningful but easy to lose, difficult to share across distance, and tied to a moment in time. Existing form and social products feel transactional or public. People need a simple, personal place to collect messages that remains under the recipient's control.

## Goals

- Make sharing a personal memory-book link effortless.
- Let a friend submit a thoughtful memory with minimal friction.
- Give the owner private, clear control over received content.
- Preserve a warm, nostalgic experience on mobile and desktop.
- Protect accounts and public forms with production-appropriate security.

## Target users

- Students and graduates collecting farewell messages
- Friends, classmates, and colleagues marking a transition
- Memory-book owners who want a durable digital collection
- Invited visitors who want to contribute without registering

## User roles

| Role    | Capabilities                                                                               |
| ------- | ------------------------------------------------------------------------------------------ |
| Visitor | View an owner's public page and submit a memory without an account                         |
| Owner   | Register, sign in, edit their profile, share their page, and view/manage memories they own |

Administrators are outside the MVP.

## Core user journeys

1. A new owner registers with a unique username, signs in, and receives `/u/:username`.
2. The owner shares that URL with friends.
3. A visitor opens the page, optionally selects a prompt, enters a name or chooses anonymity, writes a message, and submits it.
4. The owner opens the authenticated dashboard and reviews received memories.
5. The owner favorites, pins, hides, or deletes a memory.
6. The owner updates their public name, bio, or avatar.
7. The owner can optionally enable graduation/farewell mode, customize occasion details, and share the unchanged public URL by link, native share, or QR code.
8. A visitor can optionally preview and attach one photo to a message; the owner sees it with the same moderation controls.
9. The owner previews a keepsake version of their visible memory book and prints it or saves it as a PDF.

## Functional requirements

- Register, log in, log out, and restore an authenticated session.
- Enforce unique, stable usernames and unique normalized emails.
- Render a public profile for an existing username.
- Accept guest memories with author name, message, anonymous choice, an optional prompt, and one optional validated photo.
- List only the signed-in owner's memories in the dashboard.
- Allow only the owner to favorite, pin, hide, or delete their memories.
- Allow the owner to update profile and relevant privacy/settings values.
- Hide owner-hidden memories from public responses.
- Return clear validation and not-found errors without leaking sensitive data.
- Keep standard mode as the default while allowing owners to enable or disable graduation/farewell presentation.
- Generate share and QR content from the existing public URL only.
- Let an authenticated owner export a print-ready standard or graduation memory book containing public profile details, visible memories, prompts, and securely delivered photos.
- Exclude hidden and deleted memories from the Phase 8 public preservation export.

## Non-functional requirements

- Responsive, mobile-first, accessible UI targeting WCAG 2.2 AA practices.
- Secure password storage and Supabase-managed bearer-token sessions.
- Consistent validation, error handling, structured logs, and abuse controls.
- Fast public-page loads and reliable API behavior under normal MVP traffic.
- Maintainable modules with tests for security boundaries and core journeys.
- Supported current browsers and Node.js 20.19 or newer.

## MVP scope

The MVP includes the two roles and journeys above, message-first memories with one optional photo, optional prompts, owner moderation controls, profile editing, an optional graduation/farewell presentation mode, and owner-only print/PDF preservation. Phases 3–8 are implemented in code, including private photo storage and controlled signed delivery. Live verification requires a migrated Supabase project and server-only service key.

## Future scope

Possible post-MVP work includes a separately authorized private archive containing hidden memories, additional themes, and owner-controlled sharing options. Each requires separate discovery and approval. Payments, AI features, social feeds, and complex notifications are not planned.

## Privacy requirements

- Collect only data required for accounts, profiles, and memories.
- Do not reveal email, password hash, hidden memories, or internal moderation fields publicly.
- Treat visitor-supplied names, messages, and photos as personal content.
- Provide owner controls for visibility and deletion.
- Define retention, account deletion, and privacy-policy details before launch.
- Avoid logging secrets, passwords, authentication tokens, or full sensitive payloads.
- Require authentication and server-side ownership scoping for export data; never return storage paths or hidden memories in the standard export.

## Success criteria

- A new owner can reach a shareable page after registration.
- A visitor can submit a memory without an account on mobile or desktop.
- A submitted memory appears only to its owner until product visibility rules permit otherwise.
- Owner-only actions reject unauthenticated and cross-owner requests.
- Core journeys pass automated integration and accessibility checks before MVP release.
