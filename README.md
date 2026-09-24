# Chopal Unfiltered

**आपकी भाषा में, आपकी आवाज़**

A Hindi-first digital newsroom built with native Next.js App Router, TypeScript, MySQL, Prisma, Tailwind CSS and TipTap. The supplied logo is preserved without redesign.

This is a full application source package, not a PHP theme or a static HTML export. It has not been deployed to a public server. Read `docs/VALIDATION.md` for exactly what was and was not tested.

## What is included

- Responsive Hindi homepage: leading story, latest news, category sections, ground reports, local stories, opinion, video, explainers, fact checks and newsletter interest form.
- Category, state, city, author and tag pages; search across stories, categories, authors, locations and tags; pagination.
- Full article pages with author, actual publication/modification dates, image captions, share/copy/print, related stories, moderated comments, fact-check fields and video support.
- Editorial CMS at `/admin`: article creation, editing, deletion, review, publication, scheduling and archival. TipTap editor, SEO controls, image metadata, taxonomy, version conflict detection and revision snapshots.
- Five roles, database-backed sessions, scrypt password hashes, same-origin mutation checks, input validation, sanitized HTML, upload validation and persistent request counters.
- Category/subcategory, author, tag, state/city, breaking-news, ad, user, policy/settings, comments, reader-message and newsletter-interest management screens.
- Secure image uploads converted to optimized WebP and thumbnail sizes. Images are stored in a persistent directory; metadata is in MySQL.
- Per-article metadata, canonical URLs, OG/X cards using the article image, JSON-LD, sitemap, robots and RSS. Demo articles are excluded from sitemap/RSS and marked noindex.
- Aggregate page-view counts and status statistics. Views do not modify article editorial timestamps.
- Prisma schema, initial MySQL migration, seed script, admin creation script, scheduled-publication/cleanup job and tests.

## Requirements

- Node.js **22.x**, or a supported 24.x runtime. Validation here used Node.js 24.19.0; validate again on the actual Node 22 host.
- pnpm **11.19.0** (the version used to create this lockfile).
- MySQL **8.0+**, a database user with migration privileges, and a separate application database. Prisma's MySQL connector also supports MariaDB; migration SQL was tested using MariaDB 10.11.7.
- A Node.js application hosting service or VPS, HTTPS, a persistent upload directory, and a scheduler/cron facility for background jobs.
- Approximately 3 GB RAM / 2 CPU can be used as a starting deployment target. Actual performance and memory use must be measured with your traffic and data. No Lighthouse score is claimed.

## 1. Install

```bash
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env
```

If Corepack is not included by your host, use its documented pnpm installation method. Approved dependency build scripts are explicitly listed in `pnpm-workspace.yaml`.

Edit `.env` locally or through your hosting provider's secret/environment settings:

```dotenv
DATABASE_URL="mysql://YOUR_USER:URL_ENCODED_PASSWORD@YOUR_DB_HOST:3306/YOUR_DB_NAME?connection_limit=5"
NEXT_PUBLIC_SITE_URL="https://YOUR_DOMAIN"
DEMO_MODE="false"
UPLOAD_DIR="/absolute/persistent/path/chopal-uploads"
```

Do not commit `.env` or paste credentials into chat. URL-encode special characters in the database password. Set the final `NEXT_PUBLIC_SITE_URL` **before building**; it is also used for origin checks and secure-cookie configuration. The request Origin must exactly match this value. Put `www` redirects in front of the app so there is one canonical origin.

## 2. Database and administrator

Create an empty MySQL database with `utf8mb4` character encoding using your hosting panel. Then:

```bash
pnpm db:generate
pnpm db:migrate
```

For a new **empty production installation**, temporarily set `ADMIN_EMAIL`, `ADMIN_NAME` and a unique `ADMIN_PASSWORD` of at least 14 characters in `.env`, then:

```bash
pnpm admin:create
```

There are no default credentials. This command creates a SUPER_ADMIN and its linked author profile. It refuses to overwrite an existing account. Remove `ADMIN_PASSWORD` from `.env` after account creation.

For a **demonstration/staging database**, set the same admin fields and use this alternative:

```bash
pnpm db:seed
```

The seed is idempotent and does not replace an existing administrator's password. It inserts:

| Record                                       | Count |
| -------------------------------------------- | ----: |
| Categories                                   |    10 |
| Authors                                      |    10 |
| Articles                                     |    30 |
| Tags                                         |    10 |
| States                                       |     5 |
| Cities                                       |    10 |
| Video records (within the 30 articles)       |     5 |
| Opinion articles (within the 30 articles)    |     5 |
| Fact-check articles (within the 30 articles) |     5 |
| Breaking-news records                        |     5 |

All seeded articles are explicitly marked **डेमो**. Seed publication dates are the actual seed time. The video examples contain no invented video URL; upload/paste real editorial video URLs in the CMS. Images are attributed on `/credits` and in `docs/IMAGE-CREDITS.md`.

## 3. Run locally

```bash
pnpm dev -- --host 0.0.0.0 --port 3000
```

Use `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for this local environment. Open `/login` to sign in, then `/admin`.

For a read-only visual demonstration without a database, set `DEMO_MODE=true`. This uses bundled **clearly labelled demo fixtures**, disables writes and admin login, and blocks search indexing. It is **not** the production data path. With `DEMO_MODE=false`, public pages query MySQL and do not silently fall back to fixtures if the database fails.

## 4. Editorial workflow

1. An administrator creates the user in **Users**, then creates/updates an **Author** profile linked to that user.
2. REPORTER and AUTHOR can create their own drafts, upload images and submit for review. They cannot publish, schedule or edit other users' work.
3. EDITOR, ADMIN and SUPER_ADMIN can review, approve, reject, publish, schedule, archive and delete articles.
4. Use **Media** to upload a JPEG/PNG/WebP of at most 5 MB with descriptive alt text, then copy its URL into the article form.
5. Scheduled publishing uses the date/time shown in the editor's local device time zone and stores it as a UTC instant.
6. Public content is rendered dynamically. A published CMS article appears on the corresponding public pages without a rebuild.
7. Concurrent article edits use a version check. Reload a stale article before editing the newer version.
8. SUPER_ADMIN / ADMIN manage users, settings, advertisements, subscribers and audit logs. An administrator cannot promote a user to SUPER_ADMIN unless the acting user is also SUPER_ADMIN. The last active SUPER_ADMIN is protected.
9. User changes invalidate that user's active sessions. Self-account changes are intentionally disallowed in this management screen to avoid accidental lockout; another SUPER_ADMIN can manage the account.

Each mutation verifies authorization on the server; hiding a button is not the security boundary. Database-backed eight-hour sessions use HttpOnly, SameSite cookies and Secure cookies when the configured origin is HTTPS.

## 5. Production deployment

This project requires a **Node.js server and MySQL**. Uploading it to a PHP-only `public_html` folder will not run it.

1. Upload source without `node_modules`, `.next`, local `.env`, or development data.
2. Configure the environment and MySQL connection through your hosting panel.
3. Install with `pnpm install --frozen-lockfile`.
4. Apply `pnpm db:migrate` before starting the new release. Back up the database before future schema changes. Never use `prisma migrate reset` in production.
5. Create the initial administrator as described above.
6. Run `pnpm build` with the final domain and `DEMO_MODE=false`.
7. Start `pnpm start` under your host's process manager. Set its `PORT` if needed.
8. Terminate HTTPS at the hosting proxy. Preserve the intended Host/Origin. Limit request bodies to 6 MB at the proxy.
9. Set `TRUST_PROXY=true` **only if** a trusted reverse proxy replaces incoming `X-Forwarded-For` headers. Otherwise leave it false; request-rate limits are shared across clients in that conservative configuration.
10. Store uploads outside the release directory using absolute `UPLOAD_DIR`, with write access only for the application process. Back up MySQL and this directory together.
11. Run `pnpm jobs` every minute using your hosting scheduler from the project directory. The command publishes due stories and clears expired sessions/rate-limit counters. Public reads also publish due stories as a fallback; without cron, no-traffic sites publish on the next read.
12. Complete the staging checklist in `docs/VALIDATION.md` before making the domain public.

For standalone hosting, `next.config.ts` also produces `.next/standalone/server.js`. Copy `public/` and `.next/static/` into the corresponding standalone directories, configure all environment variables, and run that server with your process manager. Keep uploads in the persistent path rather than inside `.next`.

Example standalone preparation:

```bash
cp -R public .next/standalone/public
mkdir -p .next/standalone/.next
cp -R .next/static .next/standalone/.next/static
# Set environment variables in the hosting panel/process manager first.
node .next/standalone/server.js
```

## 6. Tests and checks

```bash
pnpm typecheck
pnpm test
pnpm audit --prod
pnpm build
```

A separate real-database integration test is supplied but **was not run in the creation environment**, because persistent database sockets were unavailable. To run it on a host with MySQL:

1. Create a disposable database whose name ends in `_test`.
2. Copy `.env.test.example` to `.env.test` and configure it.
3. Apply the included migration to that **test** database using `DATABASE_URL` pointed to it.
4. Run `pnpm test:db`.

The integration test refuses a database name that does not end in `_test`, creates isolated test records, checks draft visibility, dynamic reads, edits, archive and scheduling, and removes its records. Do not use a production database for tests.

## Operational limits and launch content

- Email signup records interest in MySQL. No email delivery provider, campaign sender, double opt-in or unsubscribe email workflow is connected. The UI accurately says that delivery starts later. Contact messages are stored for the editorial team; no outbound email is sent.
- Weather and e-paper feeds are not connected because none were supplied; no fabricated weather or dead e-paper controls are shown.
- Add the real organization owner, contact details, team bios, social profiles and reviewed policies before launch. Policy copy is a starting template, editable in Settings.
- Seed photos are illustrative file images, not evidence of the fictional demo stories. Demo data is not eligible for NewsArticle indexing.
- RSS contains the latest 50 real published stories. The initial sitemap is appropriate for a small newsroom; split into indexed sitemap files before reaching 50,000 URLs. Search uses MySQL substring matching and is suitable for the requested lightweight initial deployment.
- Analytics are page-view counters, not unique people or audited readership. No external tracking service is configured.
- A security audit/penetration test, accessibility audit, mobile-device visual QA, load test and measured Lighthouse report remain launch-stage work. Build/unit-test success alone is not a claim of production certification.
- Dependency overrides patch security advisories in Prisma's configuration dependencies. Review them when upgrading Prisma; the schema, generation and production build were checked with these overrides.

## Project map

```text
app/                     Public routes, admin routes, API handlers and styles
components/              News cards, header/footer, forms and editorial UI
lib/                     Database, content queries, auth, permissions and validation
prisma/schema.prisma     Complete MySQL model
prisma/migrations/       Initial executable SQL migration
prisma/seed.ts           Explicitly labelled Hindi demo content
scripts/                 Administrator creation and scheduled jobs
public/images/           Original logo and licensed editorial demo photographs
tests/                   Security tests and optional real-database integration test
docs/                    Validation, credits and deployment notes
```
