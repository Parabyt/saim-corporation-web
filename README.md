# Saim Corporation — Angular + PHP + MySQL

The existing Angular 17 storefront and admin UI now use a PHP REST API. MySQL stores catalog text, relationships, slider content, company/social settings, admin accounts, and contact/inquiry submissions. Optimized WebP files live on the web host; the database stores their paths. There is no Firebase SDK in the Angular runtime and no development authentication bypass.

The storefront routes, catalog filters, slider, product galleries, contact channels, `/admin`, and `/customize` remain. `/admin/login` supplies password authentication. Custom theme editing remains browser-local, as before. The earlier implementation notes are preserved in [docs/legacy-project-history.md](docs/legacy-project-history.md); their Firebase instructions are historical and must not be used for this backend.

## Architecture and behavior

- `src/app/core/ports/backend.port.ts`: backend-neutral content, authentication, media, and submission repositories.
- `PhpBackendService`: the HTTP adapter. Change the repository providers in `app.config.ts` to use another backend.
- `ContentStoreService`: reactive storefront state. Successful server snapshots replace the cache, including empty lists. Existing browser data is preserved; a separate `saim.api.snapshot` cache is used. Cached/default content can display during a read failure; admin routes require a fresh server read.
- `AdminCatalogService`: applies server responses only after successful writes. Failed edits retain the current catalog and editor form. Additional product gallery images survive cover replacement.
- `backend/src`: validated PDO queries, transactions, sessions, media optimization and cleanup. No Composer packages are required.
- Contact and inquiry submissions are stored in MySQL; they are not emailed automatically. A failed request is shown as a failure, never as “saved locally.” Admins can retrieve the most recent 200 submissions using `GET /api/submissions`; full history is in the database backup.

## Requirements

Node 20 for this Angular 17 project; PHP 8.3+ with `pdo_mysql`, `gd` (WebP/JPEG support), `fileinfo`, `curl`, `session`, and JSON; MySQL 8.4 (or compatible MariaDB 10.6+). Only MySQL 8.4 is covered by the local integration checks. Use HTTPS in production.

## Local setup

### Docker option

```sh
npm ci
docker compose up --build -d
# Fresh schema and current checked-in storefront content:
docker compose exec api php bin/console.php migrate
docker compose exec api php bin/console.php import seed.json
# Hidden password prompt; the secret does not enter shell history.
bash -c 'read -rsp "Admin password: " SAIM_ADMIN_PASSWORD; echo; printf "%s" "$SAIM_ADMIN_PASSWORD" | docker compose exec -T api php bin/console.php create-admin admin@example.com; unset SAIM_ADMIN_PASSWORD'
npm start
```

Open `http://localhost:4200`. MySQL and the API ports bind only to loopback. Development credentials in Compose are local-only. Database/media volumes persist across container recreation. Do not use `docker compose down -v` unless intentionally discarding those development volumes.

### Native PHP + MySQL option

1. Install the requirements. On macOS: `brew install php@8.3 mysql@8.4`; add their `bin` folders to `PATH`. Start a local MySQL instance, create database `saim` with `utf8mb4`, and a dedicated database user with privileges on that database only. Secure the local MySQL root account after installation.
2. Copy `backend/config.example.php` to `backend/config.local.php`. Set the DSN and database credentials. This private file is ignored by Git. Keep `origin` as `http://localhost:4200` and `secure_cookie=false` only for local HTTP.
3. Run:

```sh
npm ci
php backend/bin/console.php migrate
php backend/bin/console.php import backend/seed.json
bash -c 'read -rsp "Admin password: " SAIM_ADMIN_PASSWORD; echo; printf "%s" "$SAIM_ADMIN_PASSWORD" | php backend/bin/console.php create-admin admin@example.com; unset SAIM_ADMIN_PASSWORD'
npm run api:serve
# In another terminal:
npm start
```

`proxy.conf.json` proxies `/api` and `/media` to `127.0.0.1:8080`. Use the Angular origin consistently: do not mix `localhost` and `127.0.0.1` in the browser. Direct writes to port 8080 from another browser origin are deliberately rejected. `api:serve` sets upload/memory limits explicitly. Docker sets the same limits in PHP INI.

## Migration and recovery from Firebase

No migration command connects to or deletes Firebase data. The old Firebase rules, project metadata, and historical seed script remain as reference only. Firebase packages and deployment/seed npm shortcuts have been removed. A deleted Firebase project cannot be reconstructed by this code.

Before switching a live site, preserve all available Firestore/Storage exports, downloaded assets, and browser data. Do not clear browser storage or overwrite the previous site before exporting it. To recover the original browser cache, run this in that site's browser console and save the download privately:

```js
const read = key => JSON.parse(localStorage.getItem(key) || 'null');
const recovered = {
  categories: read('saim.categories'),
  subcategories: read('saim.subcategories'),
  products: read('saim.products'),
  home: read('saim.homeContent'),
  company: read('saim.companyProfile')
};
const url = URL.createObjectURL(new Blob([JSON.stringify(recovered, null, 2)], {type:'application/json'}));
const a = document.createElement('a'); a.href = url; a.download = 'saim-recovered.json'; a.click();
URL.revokeObjectURL(url);
```

Inspect the recovery file before import. Fields that are `null` were never cached: fill them from a verified export or the corresponding defaults in `backend/seed.json`. Retain IDs, slugs, `categoryId`, `subcategoryId`, product galleries, slide order, and enabled social flags. Firestore exports need conversion to the same JSON shape; automatic Firestore export parsing is not included. Preserve original exports separately.

Import into a **fresh content database**:

```sh
php backend/bin/console.php migrate
php backend/bin/console.php import /private/path/saim-recovered.json
```

The importer validates the complete catalog, home, and company data in one transaction and refuses to overwrite any nonempty content tables. Account creation is independent. Seed data is an explicit starting option, not recovered production data; `npm run seed:export` regenerates `backend/seed.json` from the existing checked-in Angular defaults.

Existing HTTPS image URLs are retained as references. Deleted Firebase Storage URLs will remain broken until the original files are recovered and re-uploaded through the admin UI. New uploads are decoded, resized to at most 1600px (1920px for slides), re-encoded to WebP and limited to 800KB. Original filenames/metadata are discarded. SVG and non-image uploads are rejected; input is limited to 5MB and 16 megapixels. External images are never downloaded or deleted by cleanup.

Save an entity after uploading its replacement. Upload alone never removes its previous image. Only after a successful database transaction does the server check all catalog/gallery/slider/home-block/inquiry references and delete a replaced, unreferenced managed file. Shared images are protected. A failed save leaves the old image intact. Unattached uploads can be removed after seven days with `php backend/bin/console.php cleanup-media`; run during a maintenance window so abandoned long-lived editor forms cannot reference a cleaned upload.

The customization console's Kumas import adds/updates matching IDs transactionally and never deletes unrelated records. Duplicate slugs or invalid relationships reject the entire import. Use the CLI fresh-database importer for a full recovery.

## Authentication and validation

Passwords are hashed using PHP `password_hash` and verified on the server. Admin accounts are created only through the private CLI; there is no public registration or browser email allowlist. Passwords must be 12–72 bytes. Disable an account with `UPDATE admins SET active=0 WHERE email=...` in a trusted database console; subsequent authenticated requests are rejected. There is no public password-reset endpoint. For recovery, disable the old account and create a new administrator through the CLI.

Sessions use strict IDs, HTTP-only SameSite=Strict cookies, Secure in production, ID rotation on login, 30-minute inactivity expiry and an 8-hour absolute expiry. All writes, including login, logout, uploads and public submissions, require the session CSRF token; supplied browser origins must match configuration. Authentication/authorization is rechecked on every protected operation. SQL-backed login and public upload/submission throttles survive new sessions. PHP session files must use a private directory writable only by the hosting account.

All catalog writes validate server-side: lengths, URL schemes, slug uniqueness, parent existence and subcategory ownership. Database foreign keys enforce cascading category/subcategory deletion. A subcategory containing products cannot be moved to another category until its products are moved/removed. External image/social links require HTTPS. Public inquiries may only attach reference images uploaded by their current session.

Contact reCAPTCHA is verified by PHP, including the configured production hostname. Configure a real site key in `environment.prod.ts` and the matching secret/hostname in the private PHP config. Production intentionally ships with an empty site key and rejects the test secret until configured. Local development uses Google's test pair. Inquiry upload/submission protection uses CSRF, size limits, ownership checks and rate limiting.

## REST surface

All paths are relative to `/api`. JSON errors have `{ "error": "message" }`; cookies carry authentication. JSON mutations require `Content-Type: application/json` and `X-CSRF-Token` from `GET /auth/session`. Upload uses multipart form data with `file` and `folder`.

| Routes | Methods | Access |
| --- | --- | --- |
| `/content` | GET | Public complete snapshot |
| `/categories`, `/subcategories`, `/products` | GET, POST | Public reads; admin writes |
| `/categories/:id`, `/subcategories/:id`, `/products/:id` | GET, PUT, DELETE | Public reads; admin writes |
| `/home`, `/company` | GET, PUT | Public reads; admin writes |
| `/slides`, `/social-links` | GET, PUT | Public reads; admin replace/reorder lists (`slides` / `socials` property) |
| `/catalog/import` | POST | Admin atomic additive import |
| `/auth/session`, `/auth/login`, `/auth/logout` | GET, POST, POST | Session/login/logout |
| `/media` | POST | Admin for catalog/home; public rate-limited `requirements` uploads |
| `/requirements`, `/contact-messages` | POST | Validated public submissions |
| `/submissions` | GET | Admin only |

Catalog POST/PUT accepts the complete Angular model including a stable ID and slug. Successful catalog/home/company writes return the committed content snapshot. Media deletion is exclusively server-managed; there is no arbitrary file-delete endpoint.

## Hostinger deployment (manual; nothing auto-deploys)

1. In hPanel, create a MySQL database/user. Enable PHP 8.3+ and the required extensions for the website ([Hostinger extension settings](https://www.hostinger.com/support/4667515-how-to-manage-php-extensions-and-options-in-hostinger/)). Enable SSL, set `upload_max_filesize=5M`, `post_max_size=6M`, `memory_limit=256M`, `display_errors=Off`, and `log_errors=On`.
2. Build locally with `npm ci && npm run build`. Upload only `dist/saim-corporation-web/browser/` contents into `public_html`. Copy `deployment/hostinger.htaccess` to `public_html/.htaccess` to preserve Angular deep links and HTTPS. The deployment assumes the domain root, not a subdirectory.
3. Put the backend folder in a private sibling such as `domains/example.com/saim-backend/`, **outside** `public_html`. Do not upload `.git`, `node_modules`, database dumps, secrets, or development tooling to the web root.
4. Create `public_html/api/`. Copy `backend/public/api/.htaccess` there. Its `index.php` should be a thin wrapper with the correct private path:

   ```php
   <?php
   require dirname(__DIR__, 2) . '/saim-backend/public/api/index.php';
   ```

5. Create `public_html/media/`, copy `backend/public/media/.htaccess` there, and allow the hosting account to write it (normally directories 755/files 644; never 777). Only generated `.webp` filenames are served. Confirm the host honors the uploaded `.htaccess` files before opening admin access.
6. Create the private `saim-backend/config.local.php`: production environment, exact HTTPS origin, MySQL credentials from hPanel, `secure_cookie=true`, `media_dir` set to the absolute `public_html/media` path, and real reCAPTCHA secret/hostname. Restrict the config file to the hosting account (600 when supported). Do not expose it through an HTTP alias.
7. Via SSH, run the private CLI `migrate`, then `import` with the reviewed migration file, and `create-admin`. If SSH is unavailable, import `schema.sql` through phpMyAdmin and prepare the data/account in a private local database, then restore its reviewed SQL dump through phpMyAdmin. Never create a publicly reachable setup script.
8. Verify `/api/content`, store routes/deep links, login/logout, category/subcategory filters, product galleries, slider ordering, contact/social settings, reCAPTCHA submissions, and one upload/replacement. Confirm anonymous writes fail and `/api/missing` is a JSON error, not Angular HTML. Remove any temporary testing accounts/files. The PHP development server is not used on Hostinger.

For session settings, see [PHP's session-security guidance](https://www.php.net/manual/en/session.security.ini.php). No CORS wildcard or cross-site credential sharing is required: Angular and PHP use the same origin.

## Backup and restoration

A recoverable backup needs **both** the database and managed media, plus a protected copy of private configuration and the deployed frontend version. `console.php export` exports public content only; it is not a full backup (it excludes accounts, submissions and the media registry).

Pause admin edits, public submissions/uploads, and scheduled cleanup using a maintenance page or host-level access restriction while taking a paired backup. Store backups outside `public_html`, encrypt them at rest, restrict access, retain multiple dated versions, and keep an off-host copy.

```sh
# Use a protected MySQL option file or the interactive password prompt; never put a password in the command.
mysqldump --defaults-extra-file=/private/path/mysql-client.cnf --single-transaction --no-tablespaces --set-gtid-purged=OFF DATABASE > /private/backups/database.sql
tar -czf /private/backups/media.tar.gz -C /absolute/public_html media
sha256sum /private/backups/database.sql /private/backups/media.tar.gz > /private/backups/SHA256SUMS
```

phpMyAdmin SQL export and hPanel file backups are alternatives. Back up all tables, including `media`, `admins`, `settings`, `slides`, `social_links`, `product_images`, and `submissions`. Database text alone cannot restore image binaries.

To restore: keep maintenance mode on, verify backup checksums, create a **new empty database**, import the SQL dump, and restore `media/` from the matching backup while preserving its protective `.htaccess`. Restore private config with the new DSN/user and correct absolute media directory; deploy the matching frontend build. Do not run the seed importer over restored content. Invalidate old sessions (clear only this application's session storage or change `session_name` during the restore), verify foreign-key relationships, image files, login, storefront routes, and settings, then switch traffic. Keep the previous database/files intact for rollback until verification completes. Test this restoration process periodically in an isolated environment.

## Verification

```sh
npm run build
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test -- --watch=false --browsers=ChromeHeadless
find backend -name '*.php' -exec php -l {} \;
```

For HTTP/MySQL integration tests, create a dedicated database whose name contains `_test` or `integration`; point a private `SAIM_CONFIG` file at it, migrate and import the seed, then start the API with that same configuration on localhost. Tests refuse remote URLs and non-test database names. They create temporary fixture records/accounts and restore content settings afterward.

```sh
SAIM_CONFIG=/private/path/test-config.php php backend/bin/console.php migrate
SAIM_CONFIG=/private/path/test-config.php php backend/bin/console.php import backend/seed.json
SAIM_CONFIG=/private/path/test-config.php npm run api:serve
# In another terminal, with the same config:
SAIM_CONFIG=/private/path/test-config.php SAIM_TEST_ALLOW_WRITES=1 npm run api:test
```

`PHP_BIN` can name a non-default PHP executable; `SAIM_TEST_URL` can override the localhost API URL. The suite covers session/CSRF rotation, unauthorized writes, origin checks, account disabling, rate limits, MIME rejection/WebP output, relationship validation, rollback, shared/gallery/slider image cleanup, cascade deletion, company/social persistence, empty lists, and inquiry ownership. Google network verification and Hostinger's Apache/LiteSpeed configuration require separate environment checks before deployment.
