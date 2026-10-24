# ARKO web app

A Dubai property portal with the full buying journey. Node 20+, no dependencies.

## Run it on your computer (localhost)
1. Install Node.js 20 or newer from nodejs.org.
2. Get the code: `git clone https://github.com/jerrybrown24/clothing.git && cd clothing && git checkout claude/inspiring-pasteur-6a0qsl && cd arko-app`
3. Start it: `ADMIN_TOKEN=pick-a-long-secret npm start` (Windows PowerShell: `$env:ADMIN_TOKEN="pick-a-long-secret"; npm start`)
4. Open http://localhost:3000 for the customer site and http://localhost:3000/admin for your dashboard (sign in with the token).

## What customers can do (`/`)
- **Home:** search by Off-plan / Ready, area or project, beds, price; new projects; popular areas with DLD prices; ready homes; the two buying paths.
- **Search:** filters (location, type, beds, price, handover, payment plan, checked only), sort, list or map view (drawn Dubai map with price pins).
- **Listing page:** gallery; price per sqft against the DLD area median; 3D model, block plan, street walk and demo film; property and validated information (permit, RERA, escrow); payment plan; total cost; mortgage calculator; return model; location map and travel times; DLD monthly prices and latest registered sales nearby; amenities; similar homes; call, WhatsApp or call-back with Ajinkya.
- **New projects, Market data** (real DLD sales by area and month), **Saved and Compare** (up to 4, 3D at the same scale), **Find my match** (3 questions).
- **Buying:** off-plan: video call, or EOI with identity check, escrow payment and signature. Ready: viewing, live offer to you, cash or mortgage steps, 10% deposit, Form F signature. Then **My purchase** tracks DLD, construction or transfer, payments and documents.

## Your dashboard (`/admin`)
Overview, Listings (per-listing opens, saves, compares, 3D, walks, films, bookings, conversion), Bids (accept, counter, decline), Leads, Live, Backend health, Integrations.

## Data
- `data/catalog.json`: projects and listings (demo). See `data/CATALOG.md` to add real ones. `npm run catalog` regenerates the demo set.
- `data/dld-area-stats.json`, `data/dld-market.json`: real DLD figures. Rebuild from new DLD files with `research/dld-ingest.py` and `tools/dld-market.py`.
- Runtime files (leads, events, bids) are written to `DATA_DIR` and are git-ignored.

## Settings (environment variables)
| Name | Purpose | Default |
|---|---|---|
| `PORT` | listen port | 3000 |
| `DATA_DIR` | where leads and the DLD file live | `./data` |
| `SUPPORT_NAME`, `SUPPORT_PHONE` | call support shown on the site | Ajinkya, +971586352359 |
| `ADMIN_TOKEN` | enables `/admin` and the owner APIs. Use a long random value | off |
| `EVENT_RETENTION_DAYS`, `LEAD_RETENTION_DAYS` | automatic deletion of old events and leads | 90, 180 |
| `LEAD_WEBHOOK_URL` | posts `{text}` to Slack or similar for each lead | off |
| `IP_SALT` | salt for the stored IP hash | `arko` |

## Deploy
Any host that runs a Docker container works (Render, Fly.io, Railway, a VPS).
1. Build from this folder with the `Dockerfile`.
2. Mount a persistent disk at `/data` (leads are lost without it).
3. Set `ADMIN_TOKEN` and, if wanted, `LEAD_WEBHOOK_URL` as secrets.
4. Put it behind HTTPS on your domain.
5. Open `https://your-domain/admin` and sign in with the token. Wrong tokens are rate limited.

## Before real users
- Collected names and phone numbers are personal data. Add a privacy notice that also covers the usage tracking, and set the retention days you are comfortable with.
- Keep the admin token secret, rotate it if anyone leaves, and only open `/admin` over HTTPS.
- Offers are not binding sales. Make the terms clear to buyers before you accept real offers.
- Anything that markets property to the public may need your RERA broker licence and permit numbers. Check with your licensing adviser.
- Listings and photos are fictional. Get permission from developers or a licensed feed before showing real ones.
- Leads are a flat file, fine for a pilot. Move to a database if volume grows.
