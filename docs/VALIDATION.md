# Validation and staging checklist

Creation date: 23 September 2026.

## Completed

- Native Next.js production compilation and TypeScript checking.
- Prisma schema validation and client generation.
- Generated initial MySQL migration SQL successfully executed against a local MariaDB 10.11.7 data directory in bootstrap mode.
- Six passing tests: password hashing/verification; reporter/author role boundaries; HTML XSS sanitization; unsafe URL and embed rejection; safe JSON-LD escaping; scheduling/required-alt-text validation.
- Production dependency audit: no known vulnerabilities after updating sharp and overriding affected configuration dependencies.
- Browser inspection: desktop homepage, original logo, correct Hindi tagline, article page, explicit demo disclosure, and a search for “पानी” returning two matching sample articles.
- Read-only demonstration mode has no CMS write capability and is explicitly marked noindex.

## Not completed here

The environment did not permit a persistent database server socket. Consequently, live Prisma/MySQL queries, the seed script, authenticated CMS actions, file uploads and background jobs could not be exercised end-to-end against a running database. The SQL migration test does not substitute for these checks.

No public deployment, domain binding, email delivery, mobile-device browser run, accessibility audit, load test or Lighthouse score is claimed. Node.js 24.19.0 was available for build validation; the requested Node.js 22 deployment needs its own staging run.

## Required on the target staging host

1. Install dependencies, apply migrations, create administrator, and run the optional `_test` database integration test.
2. Sign in and sign out; verify HttpOnly/Secure/SameSite cookies over HTTPS and expiry/revocation.
3. Create a REPORTER with a linked author profile. Save a draft and submit it for review. Try unauthorized publication and editing another reporter's article; both must be rejected by the API.
4. As EDITOR, review/publish a draft and confirm it appears on the homepage, category, article and search pages. Update it and verify the public page changes. Archive/delete it and confirm it disappears.
5. Schedule a story a few minutes ahead, run the scheduler, and confirm the actual publication timestamp. Check that view increments do not alter editorial updatedAt.
6. Test stale concurrent edit rejection with two open article forms.
7. Upload valid JPEG/PNG/WebP files; verify thumbnail, alt text and caption. Reject SVG, oversized files and invalid image bytes. Confirm images persist across a release/restart.
8. Create/schedule/disable breaking news and ads for every configured slot. Confirm start/end boundaries and sponsored labels.
9. Submit a comment and a contact message. Confirm moderation prevents immediate public comments and that email is never exposed publicly.
10. Check category/subcategory and city/state consistency, user-role changes, session revocation and last-SUPER_ADMIN protection.
11. Check canonical, OG/X, RSS, robots and sitemap at the final HTTPS origin. Publish at least one non-demo article to verify structured data and discovery feeds. Keep demo content excluded.
12. Test navigation, forms and reading at 360/390/768/1280 px, 200% text zoom and keyboard-only use. Run Lighthouse against production with representative real images.
13. Replace policy templates and demo content; add the operator's real public details. Configure email delivery separately if required.
14. Back up and restore both MySQL and the persistent upload directory before launch.
