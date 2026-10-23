# ARKO web app

Self-hosted version of the ARKO prototype. Node 20+, no dependencies.

Two views
- **Customers** use `/`. Journey: Start (3 questions) → Choose (ranked list, shortlist) → Explore (3D model, block plan, street walk, demo film, gallery, nearby places, DLD market data, unit and payment plan) → Compare (side by side, same-scale 3D) → Book (video call with Ajinkya, or EOI: KYC, escrow payment, signature) → Track (DLD/Oqood, construction, payments, documents).
- **You** use `/admin` (sign in with `ADMIN_TOKEN`). Tabs: Overview, Listings (opens, shortlists, compares, 3D, walks, films, unit picks, bookings and conversion per listing), Bids, Leads, Live, Backend, Integrations (where each data point comes from now and what replaces it). With no traffic yet, Overview offers a clearly labelled sample-data preview.

What is real: call support (Ajinkya, +971 58 635 2359), call-back and booking requests, usage analytics (no cookies or personal data), DLD area figures and the Dubai price index, real landmark locations.
What is demo: the 9 projects, developers, prices and units; renders and 3D models (generated in the browser); street walk surroundings; KYC, EOI payment, signature, Oqood status and reminders. The "Prototype notes" button on the site marks each integration point.

## Run
```
npm test            # 19 tests
npm start           # http://localhost:3000
npm run build       # rebuild public/index.html after editing src/ (needs python3)
python3 build.py artifact   # preview page for Claude artifacts (three.js from cdnjs)
```

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
