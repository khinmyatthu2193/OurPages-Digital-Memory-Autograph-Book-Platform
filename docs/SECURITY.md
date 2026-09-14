# Security Strategy

This is the required baseline for feature implementation; initialization does not yet implement authentication or uploads.

- **Passwords:** hash with Argon2id using reviewed parameters and a maintained library. Enforce length, permit password managers, never log or return credentials, and use generic authentication failures.
- **Authentication:** use high-entropy, expiring, revocable sessions where practical. Rotate identifiers after authentication and sensitive changes. Do not store bearer tokens in local/session storage.
- **Cookies:** authentication cookies are `HttpOnly`, `Secure` in production, `SameSite=Lax`, narrowly scoped, and explicitly expired on logout. Cookie-authenticated mutations use CSRF tokens or a comparably robust origin-based defense.
- **Authorization:** middleware establishes identity; every protected service scopes database operations to that user. Resource IDs alone never grant access.
- **CORS:** allow only the configured client origin, required methods/headers, and credentials. CORS is not authorization.
- **Validation:** validate and normalize params, queries, and bodies with allow-listed schemas. Bound string lengths and reject unexpected types/fields. Escape output by context.
- **Abuse prevention:** apply stricter IP/account rate limits to login and public submissions. Add progressive friction such as a honeypot or challenge based on observed abuse; avoid exposing whether accounts/emails exist.
- **Uploads:** permit a short image MIME/extension list, verify file signatures, cap dimensions and bytes, rename objects, store outside the app filesystem, strip metadata, and serve from a separate non-executable origin. Consider malware scanning before launch.
- **HTTP/application:** use TLS, Helmet security headers, limited JSON body sizes, parameterized Prisma queries, and dependency/security scanning. Define a restrictive Content Security Policy for deployment.
- **Errors/logging:** centralized handlers return stable public messages and correlation IDs while logs retain actionable context. Never expose stacks, SQL, secrets, cookies, or sensitive request bodies in production.
- **Secrets:** environment variables or a deployment secret manager hold database/auth credentials. Validate required configuration at startup, rotate compromised secrets, and commit only `.env.example`.
- **Common threats:** React's escaping plus contextual sanitization mitigates XSS; CSRF defenses cover cookie mutations; Prisma and validation reduce injection; rate limits address brute force; authorization tests cover IDOR; redirects and outbound URLs require allow lists.

Before production, complete threat modeling, privacy/retention rules, dependency review, backup/restore testing, secure proxy configuration, and incident-response ownership.
