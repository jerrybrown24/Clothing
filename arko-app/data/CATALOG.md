# Putting real property details into ARKO

All listings live in `data/catalog.json`. Edit it (or replace it) and reload the page. No rebuild needed when running the server.

## Projects (off-plan developments): `projects[]`
| Field | Example | Notes |
|---|---|---|
| id | `solace-marina` | lowercase, unique, used in links |
| name, dev, area, sub | `Solace Marina`, `Tidewater Developments`, `Dubai Marina`, `Marina Promenade` | `area` must match a DLD area name to get market data |
| lat, lng | `25.0838`, `55.1417` | from Google Maps (right-click the location) |
| kind, set, mood | `tower` / `twin` / `lowrise`, `water` / `park`, `day` / `dusk` / `dawn` | shapes the 3D model and illustrations |
| floors, blocks, units, sold | `48`, `3`, `356`, `62` | sold is % |
| launch, ho, hm | `2025-09`, `Q4 2028`, `25` | hm = months from now to handover |
| plan | `60/40`, `70/30`, `50/50`, `80/20` | payment plan |
| ppsf, svc, yld | `2590`, `18`, `6.4` | AED per sqft, service charge AED/sqft/yr, est. gross yield % |
| types | `[["1 bedroom", 790, 1]]` | label, sqft, bedrooms |
| rera, amen, blurb | | RERA project number, amenity list, one-line description |

## Listings (units for sale): `listings[]`
`ref`, `status` (`off` or `ready`), `project` (off-plan only, the project id), `title`, `type`, `beds`, `baths`, `size` (sqft), `price` (AED), `ppsf`, `floor`, `view`, `furnish`, `parking`, `area`, `sub`, `lat`, `lng`, `building`, `developer`, `svc`, `rentEst` (AED/yr), `ownership`, `permit` (Trakheesi), `rera`, `verified`, `added` (YYYY-MM-DD), `features[]`, and for ready homes `built` and `tenancy`. `seed`, `kind`, `set`, `mood` drive the illustrations.

Send me brochures, price lists or screenshots and I can fill this file for you.
