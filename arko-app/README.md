# ARKO web app

Self-hosted version of the ARKO prototype. Node 20+, no dependencies.

What is real here
- **Call support**: Ajinkya, +971 58 635 2359, as a tap-to-call button and in the footer.
- **Call-back and meeting requests** are saved to `data/leads.jsonl` (name, phone, preferred time, home, consent, hashed IP). Optional Slack-style webhook.
- **DLD figures** come from `data/dld-area-stats.json`, injected into the page at request time. Replace the file and reload; no rebuild.

What is still demo: listings, photos, project prices, yields, EOI, escrow, mortgage and tracker steps.

## Run
```
npm test            # 8 tests
npm start           # http://localhost:3000
npm run build       # only if you edit src/ (needs python3)
```

## Settings (environment variables)
| Name | Purpose | Default |
|---|---|---|
| `PORT` | listen port | 3000 |
| `DATA_DIR` | where leads and the DLD file live | `./data` |
| `SUPPORT_NAME`, `SUPPORT_PHONE` | call support shown on the site | Ajinkya, +971586352359 |
| `ADMIN_TOKEN` | enables `GET /api/leads` (send `Authorization: Bearer <token>`) | off |
| `LEAD_WEBHOOK_URL` | posts `{text}` to Slack or similar for each lead | off |
| `IP_SALT` | salt for the stored IP hash | `arko` |

## Deploy
Any host that runs a Docker container works (Render, Fly.io, Railway, a VPS).
1. Build from this folder with the `Dockerfile`.
2. Mount a persistent disk at `/data` (leads are lost without it).
3. Set `ADMIN_TOKEN` and, if wanted, `LEAD_WEBHOOK_URL` as secrets.
4. Put it behind HTTPS on your domain.
5. Read leads: `curl -H "Authorization: Bearer $ADMIN_TOKEN" https://your-domain/api/leads`

## Before real users
- Collected phone numbers are personal data. Add a privacy notice and keep a retention rule (delete old leads).
- Anything that markets property to the public may need your RERA broker licence and permit numbers. Check with your licensing adviser.
- Listings and photos are fictional. Get permission from developers or a licensed feed before showing real ones.
- Leads are a flat file, fine for a pilot. Move to a database if volume grows.
