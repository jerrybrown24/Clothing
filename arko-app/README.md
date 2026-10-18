# ARKO web app

Self-hosted version of the ARKO prototype. Node 20+, no dependencies.

Two views
- **Customers** use `/`. Browsing, 3D view, analysis, call support, call-back and meeting requests, and offers on ready homes.
- **You** use `/admin` (sign in with `ADMIN_TOKEN`). Tabs: Overview (visitors, funnel, what people click, homes opened), Bids (accept, counter or decline), Leads (status and CSV export), Live (activity feed), Backend (uptime, memory, disk, request timings, errors, DLD data date).

What is real here
- **Call support**: Ajinkya, +971 58 635 2359, as a tap-to-call button and in the footer.
- **Offers on ready homes** are sent to you. The buyer sees accepted, countered or declined on their screen within seconds. A buyer can accept your counter or send a new offer.
- **Call-back and meeting requests** are saved (name, phone, preferred time, home, consent). Optional Slack-style alert for each lead and bid.
- **Usage tracking** records page views and clicks with a random per-tab ID. No cookies, no names, no phone numbers, no IP addresses. Visitors who send "Do Not Track" are not tracked.
- **DLD figures** come from `data/dld-area-stats.json`, injected into the page at request time.

What is still demo: listings and photos (the offers go to you, but the homes are fictional), project prices, yields, EOI, escrow, mortgage and tracker steps. Without the server (for example in the Claude preview) the page falls back to a simulated seller and records nothing.

## Run
```
npm test            # 18 tests
npm start           # http://localhost:3000
npm run build       # only if you edit src/ (needs python3)
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
