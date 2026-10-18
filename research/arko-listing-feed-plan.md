# ARKO: getting real listings and photos legally

Status: plan only. The prototype still runs on fictional demo data and illustrated renders.

## What I found (17 Oct 2026)
- **bayutapi.com / docs.bayutapi.com** is titled "Bayut API (Unofficial)" and is sold on RapidAPI as "data scraping made easy". It is a third-party scraper, not a Bayut product. Using it does not give ARKO a licence to Bayut's data or to agents' photos, so it is not the licensed route.
- **Bayut's own terms** restrict automated scraping. I did not crawl Bayut.
- **DLD open data** (dubailand.gov.ae/en/open-data/real-estate-data and Dubai Pulse) publishes transactions, units, buildings, brokers and developers as downloadable CSV. This is official and free, but it has no listing photos or live asking prices.

## Licensed routes, in the order I would try
1. **Bayut / dubizzle group partnership.** Ask the business team for a listings data licence or an affiliate/lead-partner arrangement. Get in writing: which fields, photo display rights, caching rules, attribution, rate limits, fees.
2. **Property Finder partner programme.** Same questions. They list partner integrations on Digital Dubai's partners portal.
3. **Developer feeds.** For off-plan, developers (Emaar, Damac and others) can supply price lists, unit inventory, payment plans and approved marketing images under a sales agreement. This is the best fit for ARKO's off-plan focus.
4. **DLD open data** for area returns, price per sqft and yield. Use it now.

## Rules the product should follow
- Show only what the licence allows. Photos need a per-image licence field; the adapter rejects listings without one.
- Do not show an off-plan project without a RERA project number.
- Keep any API key on a server. The artifact page cannot call other sites or load outside images, so real photos need ARKO hosted on its own domain with a small backend.
- Cache within the terms, show "last updated", and drop listings when the source removes them.

## Next steps
1. Email the three sources above with the question list.
2. Load DLD CSVs into ARKO's analysis (area growth, median price per sqft, yield).
3. When a feed exists, fill the field map in `arko-feed-adapter.mjs` and run its self-test.
