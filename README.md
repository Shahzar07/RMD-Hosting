# RMDHost website

A complete responsive hosting site built with Next.js 16, React 19 and TypeScript. It deploys to **Vercel** and stores enquiries and admin settings in a **Turso** (libSQL / SQLite) database.

## Deploy on Vercel

1. In Vercel, click **Add New → Project** and import this GitHub repository. The Next.js preset and default build settings work as is.
2. Create a free database at [turso.tech](https://turso.tech) (or add Turso from the Vercel Marketplace), then copy its database URL and an auth token.
3. In **Project → Settings → Environment Variables**, add:

   | Variable | Required | Purpose |
   | --- | --- | --- |
   | `TURSO_DATABASE_URL` | for forms/admin | e.g. `libsql://rmdhost-yourname.turso.io` |
   | `TURSO_AUTH_TOKEN` | for forms/admin | Turso database token |
   | `ADMIN_PASSWORD` | for `/admin` | Password for the admin area |
   | `NEXT_PUBLIC_SITE_URL` | optional | Your custom domain, e.g. `https://rmdhost.com` (defaults to the Vercel production domain) |
   | `ADMIN_SESSION_SECRET` | optional | Extra random string used to sign admin sessions |

4. Deploy (or redeploy after adding variables). Database tables are created automatically on first use.

Without the database variables the public site still works with the default catalogue; contact/order forms show a "could not save" message and the admin cannot save changes.

## Local development

```bash
npm install
cp .env.example .env.local   # optional; without it a ./local.db SQLite file is used
npm run dev                  # http://localhost:3000
npm test                     # validation tests
npm run build                # production build
```

## Design

The supplied 47-second ChinaFY concept guided the split hero, neutral sans typography, lavender/yellow palette, restrained rounded controls, 3D laptop composition, floating cards, plan panels, conversational form and oversized footer. All product content and branding are RMDHost. The laptop is a responsive CSS 3D object with a custom SVG screen illustration, pointer movement, slow continuous motion and three manually selectable scenes. It is not a captured video. The precise original font, textures and animation source were not supplied; Arial/Helvetica system fonts and rebuilt motion approximate them.

All motion respects reduced-motion preferences. Hero slides can be paused, menus support Escape and focus trapping, and content remains visible without JavaScript. USD/GBP, theme and cookie choices persist locally. There are no third party analytics or marketing scripts.

## Catalogue and admin

Open `/admin` and sign in with `ADMIN_PASSWORD`. Catalogue overrides, settings, published reviews/notices and submitted enquiries are stored in the database. Add products/plans, edit specifications, update GBP/USD prices and order URLs, set the client portal link, export/import JSON and update enquiry statuses. The admin API validates all updates. Initial catalogue defaults are in `lib/catalog.ts`; database overrides take precedence. Default GBP specifications/prices were checked against DigitalBerg on 8 October 2026. Source URLs are recorded per product. Confirm RMDHost availability and terms before commercial launch. No fake reviews, live status or unverified certifications are included.

AI VPS, macOS VPS, macOS Dedicated and Game Server products use quotation configurations as requested. Their exact hardware and prices are not invented. USD estimates use the editable default multiplier 1.30; enter confirmed USD values per plan to override it. Yearly totals are 12 monthly charges without a fabricated discount.

## Access boundary

The admin area and admin API require a signed, HTTP-only session cookie created by signing in with `ADMIN_PASSWORD`. If the variable is not set, the admin area is disabled. Use a long, unique password. Client hosting account access is separate and uses the configured HTTPS portal URL.

## Functional integration boundaries

Contact, order and support forms save real database records and return a request reference. They do not email the team, charge payment or provision servers. Order links redirect to the configured external billing portal; blank links use an enquiry flow. Set real order URLs and a client portal before enabling paid ordering. Email delivery, billing, WHMCS/provisioning and automated monitoring require operator integration credentials. The site does not simulate them. Network status explicitly says monitoring is unconnected and displays manually published notices.

Policy pages describe current website behaviour. Final controller contact, retention periods, service contracts, licence costs, taxes, SLA and acceptable use must be reviewed by RMDHost before a public commercial launch.

## Development notes

`npx tsc --noEmit` validates types. Run `npm run db:generate` after changing `db/schema.ts` and commit the generated migrations; also update the `CREATE TABLE IF NOT EXISTS` statements in `db/index.ts`. The frontend uses client islands for interactions with server-rendered pages for SEO. `/sitemap.xml` includes current catalogue routes and `/robots.txt` excludes admin/API paths.
