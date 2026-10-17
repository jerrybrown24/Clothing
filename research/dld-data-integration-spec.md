# DLD Data Integration: Technical Specification

**Version:** 1.0 · **Researched:** October 2026 · **Scope:** Everything the property superapp must fetch or extract from the Dubai Land Department (DLD), how to get it, and how to build the pipeline.
**Companion to:** `property-superapp-knowledge-base.md` (concept background) and `Superapp_Brokerage_Launch_Roadmap.xlsx` (tasks 1.15, 2.04, 2.06).

---

## 0. Summary

1. **Most of the data you need is public and free.** DLD publishes nine open datasets (transactions, rents, projects, valuations, land, units, buildings, brokers, developers) as CSV downloads on its own site, with previous-year data on the Dubai Pulse portal (data.dubai). Dubai Pulse also offers an OAuth-protected API. **[V]**
2. **Live, per-listing and per-customer data is not open.** Permit validation, delisting, broker lookup, Ejari, Oqood and rental-index feeds come through the **DLD API Gateway**, which is built for registered businesses and sits behind a MyDLD login (UAE Pass). **[V]**
3. **The open data has no names and no unit link for sales.** Sale transactions carry area, project, property type, size, price, and the *number* of buyers and sellers, but no owner identity and no unit number. You can compute market insights from it; you cannot use it to verify a specific seller's title. **[V]**
4. **Recommended path.** Start with open CSV or Dubai Pulse API for the Insights module (no licence needed to begin), apply for **Trakheesi, Dubai Brokers and Rental Index** through the API Gateway as soon as the company has its DET trade licence (roadmap week 4 to 5), and treat Oqood, Ejari and service-charge data as phase 2 once you have confirmed access terms with DLD.
5. **Unknowns that need a call to DLD** (section 14): commercial reuse licence, rate limits, refresh frequency, exact API request formats, and gateway eligibility and fees. API documentation and registration terms are behind login and could not be read.

### Evidence tags used here
| Tag | Meaning |
|---|---|
| **[V]** | Read directly from an official DLD page (dubailand.gov.ae) during this research |
| **[B]** | From a third-party source (blog, aggregator, search snippet); indicative |
| **[A]** | Our proposal or assumption for the build |
| **[U]** | Unknown or unconfirmed; resolve before building on it |

---

## 1. What the product needs from DLD

| Superapp feature | Data needed | DLD source | Access |
|---|---|---|---|
| **Insights: price per sq ft trends** | Sale transactions: area, project, type, size, amount, date, off-plan or ready | Transactions dataset | Open CSV / Pulse API |
| **Insights: rental yield** | Rent contracts: area, size, annual amount; joined to sale prices | Rents dataset + Transactions | Open CSV / Pulse API |
| **Insights: supply pipeline** | Projects: status, % complete, start and end dates, number of units | Projects, Units, Buildings | Open CSV / Pulse API |
| **Insights: developer delivery record** | Projects per developer: planned end vs completion date, status | Projects + Developers | Open CSV / Pulse API |
| **Verify off-plan project** | Project number, developer, escrow account number, status, % complete | Projects | Open CSV / Pulse API |
| **Verify developer** | Licence number, type, status, expiry | Developers | Open CSV / Pulse API |
| **Verify agent / brokerage** | Broker number, licence dates, real-estate firm | Brokers | Open CSV, or Dubai Brokers API |
| **Verify listing permit (Trakheesi / Madmoun)** | Permit validity, advertiser, unit details | Trakheesi API; Madmoun QR page | Gateway / public QR |
| **Delist on sale or rent** | Delisting call | Trakheesi API | Gateway |
| **Valuation sanity check, Golden Visa threshold** | DLD valuation records by area and type | Valuations | Open CSV / Pulse API |
| **Rent increase check (renewals)** | Rental index by area and type | Rental Index API (or Dubai REST calculator) | Gateway |
| **Service charges per project** | Approved service-charge index | Mollak Service Charge Index (Dubai REST / DLD site) | Public lookup; bulk API for banks only |
| **Ejari registration for rentals** | Tenancy registration | Ejari API | Gateway (PMC or landlord) |
| **Oqood status and payment records** | Off-plan registration and trust-account payments | Oqood / TAS APIs | Gateway (developers, banks); buyer self-service only |

---

## 2. Access channels compared

| # | Channel | What it gives | Format | Auth | Fit | Tag |
|---|---|---|---|---|---|---|
| A | **DLD Open Data page** (`dubailand.gov.ae/en/open-data/real-estate-data/`) | Current-period data for nine record types, filter by date, type, area and more | "Download as CSV" per dataset; on-screen table | Web form, **mandatory date range** and **reCAPTCHA** | Manual or semi-manual pulls; not for automation | [V] |
| B | **Dubai Pulse / data.dubai** (`dubaipulse.gov.ae/organisation/dld`) | Previous years and full history; dataset pages including `dld_transactions-open` (CSV) and `dld_transactions-open-api` (API) | CSV and REST API (CKAN-based) | API key and secret exchanged for an expiring bearer token | **Primary programmatic source** | [V]/[B] |
| C | **DLD API Gateway** (`dubailand.gov.ae/en/eservices/api-gateway`) | 13 official integrations (section 5) | REST APIs (specifications behind login) | MyDLD account via **UAE Pass**; business registration; some require prior system membership | Compliance and live data | [V] |
| D | **Dubai REST app and DLD website lookups** | Consumer lookups: transactions, broker and listing checks, service charge index, Ejari | Mobile app and web | Public or UAE Pass | Manual verification only; no programmatic access found | [V]/[B] |
| E | **Third-party aggregators** (for example Bayut's transactions API on RapidAPI) | JSON of DLD-registered records, simple key | JSON | Static API key | Fast prototype only; unofficial, depends on the vendor | [B] |

**Rules of thumb**
- Build production on **B** for open data and **C** for live data. Use **A** for manual cross-checks. Use **E** only as a prototype or fallback, and never as the sole source for a verification feature.
- **Do not automate channel A.** It is protected by reCAPTCHA; circumventing it would breach the site's controls and puts the licence application at risk. Use channel B instead.

---

## 3. Official open datasets and field lists (channel A, mirrored on B)

All nine are listed on DLD's Real Estate Data page with the column sets below. **[V]** Dubai Pulse dataset pages are expected to expose the same record types; confirm field-for-field after you get access **[U]**.

Common conventions to expect: bilingual text (English and Arabic) in some fields, areas stored as **DLD area names** (not marketing community names), sizes in **square metres**, amounts in **AED**.

### 3.1 Transactions
**Filters on the page:** From date and To date (required); Transaction type = All, **Sales**, **Mortgages**, **Gifts**; Registration type = All, **Ready**, **Off Plan**; Is Free Hold (Yes or No); Area; Usage = Residential, Commercial, Other; Property type = Land, Building, Unit.

| Column | Notes |
|---|---|
| Transaction Number | **Natural key** for deduplication |
| Transaction Date | |
| Transaction Type | Sales, Mortgages, Gifts |
| Transaction sub type | |
| Registration type | Ready or Off Plan (maps to our two journeys) |
| Is Free Hold? | Foreign-ownership relevance |
| Usage | Residential, Commercial, Other |
| Area | DLD area name |
| Property Type, Property Sub Type | Land, Building, Unit; sub types such as flat or villa |
| Amount | Transaction value in AED |
| Transaction Size (sq.m) | Size used in the transaction |
| Property Size (sq.m) | Size of the property |
| Room(s) | Text such as "1 B/R", "Studio" |
| Parking | |
| Nearest Metro, Nearest Mall, Nearest Landmark | Text |
| No. of Buyer, No. of Seller | **Counts only; no names** |
| Master Project, Project | Text names; **no project ID on the row** |

### 3.2 Rents (Ejari-registered contracts)
**Filters:** Date basis = Registration date, Start date or End date; date range (required); Is Free Hold; Version = **New** or **Renew**; Area; Usage; Property type.

| Column |
|---|
| Registration Date, Start Date, End Date, Version |
| Area, Master Project, Project |
| Contract Amount, Annual Amount |
| Is Free Hold?, Usage |
| Property Size (sq.m), Property Type, Property Sub Type, Number of Rooms, Parking |
| Nearest Metro, Nearest Mall, Nearest Landmark |
| No of Units |

Note: **no contract ID** is listed, so a stable key must be built (section 8).

### 3.3 Projects (developer projects, including escrow)
**Filters:** date range with a choice of Start date, End date, Adoption date or Completion date; Area; **Project status** = Freezed, Under Reviewing, Under Cancellation Decision, Cancelled, Finished, Active, Conditional Activating, Under Cancellation Notification.

| Column | Use in the product |
|---|---|
| Project Number | **Key**; join to Units, Buildings, Land |
| Project Name | Display; join from Transactions by name |
| Developer Number, Developer Name | Join to Developers |
| Start Date, End Date, Adoption Date | Planned schedule |
| Project Type, Project Value | |
| **Escrow Account Number** | Shown to buyers to verify where money goes |
| **Project Status**, **Completed (%)** | Project verification and progress tracker |
| Inspection Date, Completion Date | Delivery record and delay calculation |
| Description, Area, Zone Authority | |
| Total Lands, Total Buildings, Total Villas, Total Units | Supply sizing |
| Master Project | |

### 3.4 Valuations
**Filters:** Area; Property type.

| Column |
|---|
| Property Total Value, Area, Property Size (sq.m) |
| Procedure Year, Procedure Number, Transaction Date |
| Amount, Transaction Size (sq.m), Property Type, Property Sub Type |

### 3.5 Land
**Filters:** Project, Land type (Residential, Agricultural, Industrial, Commercial, Public Facilities, Government Authority), Area, Is Free Hold, Zone (Deira or Dubai).

| Column |
|---|
| Land Type, Property Sub Type, Property Size (sq.m) |
| Registration type, Pre registration Number, Is Free Hold?, Zip Code |
| Master Project, Project Number, Project Name, Area, Zone |

### 3.6 Units
**Filters:** Area; Zone; creation date range; Is Free Hold; Is Lease Hold; Registration type (Completed or Off Plan).

| Column |
|---|
| Unit Number, Property Sub Type, Property Size (sq.m) |
| Balcony Area, Common Area, Actual Common Area, Floor |
| Room Type, Parking, Parking Allocatin Type (spelled as published) |
| Creation Date, Registration type, Pre registration Number |
| Is Free Hold?, Is Lease Hold |
| Building Number, Building Name, Land Number, Land Sub Number, Land Type |
| Zip Code, Municipality Number |
| Master Project, Project Number, Project Name, Area, Zone |

### 3.7 Buildings
| Column |
|---|
| Property Sub Type, Property Size (sq.m), Common Area, Actual Common Area, Built Up Area |
| Buidling Levels (spelled as published), Shops, Flats, Offices, Swimming Pools, Elevators |
| Creation Date, Registration type, Pre registration Number |
| Is Free Hold?, Is Lease Hold, Floors, Room(s), Parking |
| Land Number, Land Sub Number, Land Type |
| Master Project, Project Number, Project Name, Area, Zone |

### 3.8 Brokers
**Filter:** Gender.

| Column |
|---|
| Broker Number (the BRN), Broker Name, Gender |
| License Start Date, License End Date |
| Website, Phone, Fax |
| Real Estate Number, Real Estate Name (the brokerage firm) |

### 3.9 Developers
**Filters:** Developer name; registration date range.

| Column |
|---|
| Developer Number, Developer Name, Registration Date |
| License Source, License Type, Legal Status |
| Website, Phone, Fax |
| License Number, License Issue Date, License Expiry Date, Chamber of Commerce No. |

### 3.10 Related Dubai Pulse datasets seen in search results **[B]**
`dld_transactions-open` (CSV; listed update 24 Apr 2024), `dld_transactions-open-api` (API; listed update 12 Jan 2024), `dld_lkp_areas-open` (area lookup), `dld_residential_sale_index-open` (a residential sales price index built with Property Finder), `dld_real_estate_licenses-open`, `dld_free_zone_companies_licensing-open-api`. The listed dates are old; check the portal for current versions and for the exact current dataset IDs **[U]**.

---

## 4. What the open data does not contain

| Gap | Consequence | Alternative |
|---|---|---|
| Owner and buyer names, passport or ID | Cannot verify a seller from open data | Seller verification through title deed and Dubai REST property status, or trustee centre, with the user's consent |
| Unit number on sale transactions | Cannot price one exact unit from comps; only area, project and size | Match comps on project, sub type, rooms and size band |
| Project ID on transaction rows | Join to Projects only by name | Fuzzy name matching with a review queue (section 9) |
| Contract ID on rents | No stable key | Build a composite hash key (section 8) |
| Live availability and developer price lists | DLD does not hold unsold inventory | Developer feeds and portal listing feeds |
| Service charge per unit | Not in the nine datasets | Mollak Service Charge Index (Dubai REST or DLD site); bulk API is bank-only |
| Individual buyer's off-plan payment status | Not public | Oqood and trust account integrations are for developers and banks; the buyer's own view is via their Oqood account; confirm whether any consented-data route exists **[U]** |
| Title deed contents, mortgage terms | Restricted | Certificates through DLD services with the owner's consent |
| Market-wide "listing quality" | Not DLD data | Trakheesi permits, Madmoun QR checks |

---

## 5. DLD API Gateway catalogue (channel C)

The gateway lists **13 APIs**. Registration links use `api-gateway-registration?appId=<n>` and **redirect to a MyDLD login (Business User or Individual, UAE Pass)**, so request schemas, prices and terms are not public **[V]**.

| appId | API | Purpose (as listed) | Relevant to us? |
|---|---|---|---|
| 3 | **Trakheesi** | Licensing and real estate permit services; listing validation, delisting and broker info by BRN reported by third parties **[B]** | **Yes, required** for listing permits and delisting |
| 6 | **Dubai Brokers** | Real-time access to broker data for end users (description truncated on the page) | **Yes**: verify agents and brokerages |
| 15 | **Rental Index** | Real-time rental price data | **Yes**: renewal rent-increase checks, rent benchmarks |
| 2 | **Ejari** | Property management companies and landlords manage tenancy contracts; requires being an active Ejari-registered management company **[B]** | Later (rentals and S3 property management) |
| 4 | **Oqood** | Integration with the Oqood and trust account system; compliance prerequisites listed | Later; likely developer or partner-level |
| 1 | **Mollak** | Integrate and sync service-charge data points | Later, as property manager |
| 5 | **Mollak Budget** | Approved service-charge rates; **Mollak-registered banks only**, RERA approval prerequisite **[B]** | No |
| 20 | Mollak Virtual Account | Approved banks | No |
| 21 | Mollak Budget Supplier | RERA-approved supplier details for banks | No |
| 22 | Mollak Authorized Signatory | Signatory updates for banks | No |
| 14 | Token Sale | Bulk sale of property tokens | Not now (tokenisation) |
| 24 | Trust Account Bulk Inflow, Developers | Registered developers submit payment records to the trust account system | No (developers only) |
| 27 | Oqood, TAS Bank Integration APIs | Participating banks | No |

**Eligibility and cost reported by third parties (unconfirmed) [B]/[U]:** you must be associated with a real estate management company registered in Ejari (for Ejari); a registered, active firm with a **Dubai office and valid Dubai trade licence**; one registration page displayed **AED 30,000 + 5% VAT per year** (which API it applied to is unclear). Treat as placeholders; ask DLD.

**Support contact shown on DLD pages:** info@dubailand.gov.ae · +971 8004488 **[V]**.

---

## 6. Authentication and call specification (Dubai Pulse API, channel B)

What is known **[B]** from a Dubai Pulse dataset page:
1. The first time a user is granted a dataset, buys a commercial dataset or buys an API package, they receive an **API Key** and an **API Secret** in two separate emails.
2. The key and secret are sent to an OAuth **client-credentials** endpoint: `https://api.dubaipulse.gov.ae/oauth/client_credential/accesstoken?grant_type=client_credentials`. The token is read from the `access_token` field of the response.
3. The token is sent on every call in the header `Authorization: Bearer <token>`.
4. Tokens **expire** (the example lifetime on the page is about 30 minutes).
5. Calls can request the full dataset (subject to a maximum result size) or a subset.

**Unknown, confirm in the dataset documentation after registering [U]:** how the key and secret are presented to the token endpoint (basic auth header or form fields), the exact dataset query URL pattern, the filter and pagination parameters, the maximum rows per call, and rate limits.

**Client requirements [A]:**
- Token manager that caches the token, refreshes at 80% of its lifetime, and retries once on 401.
- Exponential backoff with jitter on 429 and 5xx; respect any `Retry-After`.
- Pagination loop with an explicit checkpoint (last offset or last date) stored per dataset.
- Never log secrets; keep key and secret in a secrets manager; rotate on staff changes.
- Prefer **incremental pulls by date** (for example the last 7 days with overlap) over full reloads; do a full reload monthly to catch corrections.

---

## 7. Ingestion architecture and non-functional specification

### 7.1 Pipeline stages [A]
1. **Scheduler:** daily job per dataset at an off-peak hour (Gulf Standard Time, UTC+4); weekly for Developers and Brokers; monthly full reload.
2. **Extract:** Dubai Pulse API or CSV; save the raw response unchanged to object storage, partitioned by dataset and extract date, with a checksum and row count.
3. **Load raw:** into `raw_*` tables with every column as text plus `_extracted_at` and `_source_file`.
4. **Transform:** type casting, trimming, standardising names, unit conversion, deduplication (section 9).
5. **Model:** build `dim_*` and `fact_*` tables and the derived metrics (section 10).
6. **Quality gates:** automated tests (section 7.3); a failed gate blocks publishing, keeps yesterday's data live, and alerts.
7. **Serve:** metrics tables behind a cached API for the app; no direct app queries on raw data.

### 7.2 Volume and performance estimates [E]
- Dubai recorded about 270,000 transactions of all kinds in 2025 and about 1.38 million Ejari contracts; one aggregator claims over 4.2 million rental contracts since 1997 **[B]**. A full history is therefore on the order of **millions of rows and a few gigabytes**, small enough for a single managed Postgres or a small warehouse.
- Daily increments: roughly **700 to 1,000 sale and mortgage rows**, **3,500 to 4,000 rent rows** (annual figures divided by 365).
- Targets [A]: nightly pipeline completes in under 30 minutes; app queries at p95 under 500 ms from pre-aggregated tables; data freshness shown to users (for example "Updated 2 days ago").

### 7.3 Data quality tests [A]
| Test | Rule |
|---|---|
| Uniqueness | `transaction_number` unique in `fact_transaction` |
| Not null | transaction date, area, amount (for sales), project (for off-plan) |
| Range | amount > 0; size > 0; transaction date not in the future; price per sq ft within plausible bounds per area (flag outliers for review, do not silently drop) |
| Volume | row count within ±40% of the trailing 4-week same-weekday average |
| Freshness | latest transaction date within 5 days of today |
| Referential | every `project_number` in Units, Buildings and Land exists in Projects |
| Reconciliation | monthly totals compared with DLD's published monthly or half-year totals (for example H1 2026: AED 419.94bn over 112,850 transactions) **[V]** |

### 7.4 Security and operations [A]
Secrets in a managed vault; separate dev and prod credentials; least-privilege database roles; immutable raw storage with a retention policy; audit log of every pull; alerts on failed jobs; documented runbook; backups with a tested restore.

---

## 8. Logical data model [A]

Types are inferred from the field names, not taken from a DLD schema.

```sql
-- Dimensions
CREATE TABLE dim_area (
  area_id            SERIAL PRIMARY KEY,
  dld_area_name      TEXT UNIQUE NOT NULL,       -- as published by DLD
  community_name     TEXT,                       -- marketing name mapping (manual table)
  zone               TEXT                        -- Deira or Dubai
);
CREATE TABLE dim_developer (
  developer_number   TEXT PRIMARY KEY,
  developer_name     TEXT NOT NULL,
  registration_date  DATE,
  license_number     TEXT, license_type TEXT, legal_status TEXT,
  license_issue_date DATE, license_expiry_date DATE
);
CREATE TABLE dim_project (
  project_number     TEXT PRIMARY KEY,
  project_name       TEXT NOT NULL,
  master_project     TEXT,
  developer_number   TEXT REFERENCES dim_developer,
  area_id            INT REFERENCES dim_area,
  project_type       TEXT, project_value NUMERIC,
  escrow_account_no  TEXT,
  status             TEXT,                       -- Active, Finished, Cancelled, ...
  completed_pct      NUMERIC,
  start_date DATE, end_date DATE, adoption_date DATE,
  inspection_date DATE, completion_date DATE,
  total_units INT, total_buildings INT, total_villas INT, total_lands INT
);
CREATE TABLE dim_broker (
  broker_number      TEXT PRIMARY KEY,           -- BRN
  broker_name        TEXT, license_start DATE, license_end DATE,
  real_estate_number TEXT, real_estate_name TEXT
);

-- Facts
CREATE TABLE fact_transaction (
  transaction_number TEXT PRIMARY KEY,
  transaction_date   DATE NOT NULL,
  txn_type           TEXT,                       -- Sales, Mortgages, Gifts
  txn_sub_type       TEXT,
  registration_type  TEXT,                       -- Ready, Off Plan
  is_freehold        BOOLEAN,
  usage              TEXT,
  area_id            INT REFERENCES dim_area,
  property_type      TEXT, property_sub_type TEXT,
  amount_aed         NUMERIC,
  txn_size_sqm       NUMERIC, property_size_sqm NUMERIC,
  rooms              TEXT, parking TEXT,
  nearest_metro TEXT, nearest_mall TEXT, nearest_landmark TEXT,
  buyers INT, sellers INT,
  master_project TEXT, project_name TEXT,
  project_number     TEXT                        -- resolved by name match, nullable
);
CREATE TABLE fact_rent (
  rent_key           TEXT PRIMARY KEY,           -- hash of natural columns (below)
  registration_date  DATE, start_date DATE, end_date DATE,
  version            TEXT,                       -- New or Renew
  area_id INT, master_project TEXT, project_name TEXT, project_number TEXT,
  contract_amount NUMERIC, annual_amount NUMERIC,
  is_freehold BOOLEAN, usage TEXT,
  property_size_sqm NUMERIC, property_type TEXT, property_sub_type TEXT,
  rooms TEXT, parking TEXT, units_count INT
);
CREATE TABLE dim_unit (
  unit_key           TEXT PRIMARY KEY,           -- project_number|building_number|land_number|unit_number
  project_number TEXT, building_number TEXT, building_name TEXT,
  land_number TEXT, land_sub_number TEXT, unit_number TEXT,
  property_sub_type TEXT, size_sqm NUMERIC, balcony_sqm NUMERIC,
  floor TEXT, room_type TEXT, parking TEXT, registration_type TEXT
);
CREATE TABLE fact_valuation (
  procedure_year INT, procedure_number TEXT,
  transaction_date DATE, area_id INT, property_type TEXT, property_sub_type TEXT,
  amount_aed NUMERIC, property_total_value NUMERIC,
  txn_size_sqm NUMERIC, property_size_sqm NUMERIC,
  PRIMARY KEY (procedure_year, procedure_number)
);
```

**Rent key (no contract ID published):** `rent_key = sha256(registration_date | start_date | end_date | version | area | project_name | contract_amount | annual_amount | property_size_sqm | rooms | units_count)`. Expect rare collisions from identical rows; keep a `duplicate_count` if you see them and review **[A]**.

---

## 9. Normalisation and entity resolution rules [A]

| Rule | Detail |
|---|---|
| Text | Trim, collapse whitespace, upper-case for matching, remove diacritics; keep the original for display. DLD area lists mix upper and title case (for example "BUSINESS BAY" and "Business Bay"), so normalise before joining |
| Area to community | DLD area names (for example "Marsa Dubai", "Burj Khalifa", "Al Barsha South Fourth") differ from the community names buyers search ("Dubai Marina", "Downtown Dubai", "Jumeirah Village Circle"). Maintain a **manual mapping table** and review new areas monthly |
| Units | Convert square metres to square feet: `sqft = sqm × 10.7639` |
| Rooms | Parse text (Studio, 1 B/R, 2 B/R, ...) into integer bedrooms plus a studio flag |
| Booleans | Is Free Hold and Is Lease Hold as true or false |
| Transaction to project | Match `project_name` and `master_project` to `dim_project` by exact normalised match first, then trigram similarity (for example `pg_trgm` ≥ 0.80), then a **manual review queue** for the rest; store `match_method` and `match_score` |
| Units to project | By `project_number` (exact) |
| Developer to project | By `developer_number` (exact) |
| Broker to firm | By `real_estate_number` (exact) |
| Sales filter for price analytics | Use `txn_type = 'Sales'` only; exclude Mortgages and Gifts; flag Off Plan and Ready separately |
| Outliers | Flag, do not delete; publish medians and interquartile ranges, not just means |
| Corrections | If a transaction number reappears with changed values, keep the latest and log the change |

---

## 10. Derived metrics (definitions the Insights module will use) [A]

```sql
-- Price per sq ft (sales only)
price_per_sqft = amount_aed / (txn_size_sqm * 10.7639)

-- Median price per sq ft by area, property sub type, bedrooms, trailing 12 months
SELECT area_id, property_sub_type, bedrooms,
       percentile_cont(0.5) WITHIN GROUP (ORDER BY price_per_sqft) AS median_ppsf,
       count(*) AS n
FROM v_sales_clean
WHERE transaction_date >= current_date - interval '12 months'
GROUP BY 1,2,3 HAVING count(*) >= 10;       -- suppress thin cells

-- Gross rental yield (same area, sub type, bedrooms)
gross_yield = median_annual_rent / median_sale_price

-- Off-plan versus ready share and volume by quarter
-- Developer delivery record (finished projects)
on_time_pct   = share of projects with completion_date <= end_date
avg_delay_days = avg(completion_date - end_date) over finished projects
-- Active pipeline: projects with status 'Active' grouped by area with total_units and completed_pct
-- Project verification card: project_number, developer, escrow_account_no, status, completed_pct, last inspection date
```

Publish every metric with **sample size, date range, source and refresh date**; suppress cells with fewer than 10 observations **[A]**. Note that DLD "end date" and "completion date" semantics should be confirmed with DLD before using them as a delay measure **[U]**.

---

## 11. Verified-listing flow (what the Trakheesi and Madmoun integration must do) [A]

1. **On listing creation:** require a Trakheesi permit number; call the **Listing Validation API** (permit, advertiser, property) **[B]**; reject on mismatch.
2. **Advertiser check:** confirm the agent's BRN is active (Dubai Brokers dataset or API) and belongs to a registered firm; store licence end date and alert before expiry.
3. **Madmoun QR:** require and display the QR on every ad; link to the DLD verification page.
4. **On Form F signed or Ejari registered:** call the **Delisting API** automatically; DLD requires removal of unavailable properties within **3 working days** **[V]**.
5. **Nightly re-validation:** re-check all live permits; auto-hide listings whose permit lapsed.
6. **Audit log:** store each validation response for inspection by RERA.

---

## 12. Legal and compliance for using DLD data

| Topic | Position |
|---|---|
| Legal basis | Dubai Law No. 26 of 2015 (Dubai Data): public bodies classify data as Open, Shared and so on; Open data can be used and reused; third-party IP needs consent; commercial data may be provided for a fee **[B]** |
| Commercial reuse licence | The exact licence on Dubai Pulse datasets was **not found**; one third party shows an attribution line "© Dubai Land Department, made available through Dubai Pulse Open Data" **[B]**. **Confirm commercial and redistribution rights in writing** before showing derived data to customers or selling reports **[U]** |
| Attribution | Credit DLD and Dubai Pulse on every insight screen and report **[A]** |
| Personal data | Open sets carry business contacts for brokers and developers (phone, fax, website) but not owner identity. Treat any personal data under the UAE personal data protection law (Federal Decree-Law 45 of 2021) and your privacy policy **[U]** |
| Access controls | Do not bypass reCAPTCHA or other controls; do not scrape pages that prohibit it; use the official API and CSV |
| Gateway use | API Gateway terms apply once registered; keep access limited to authorised staff; uses must match the registered purpose **[U]** |
| Accuracy | Show data dates; do not present market statistics as valuations or advice; add a disclaimer **[A]** |
| Resale of data | Do not resell raw DLD data; sell your analysis, not their dataset, unless the licence allows **[A]** |

---

## 13. Onboarding steps and timeline [A]

| Week | Step | Owner |
|---|---|---|
| 1 | Create UAE Pass accounts for the founders; create a Dubai Pulse account; request API key and secret for the DLD datasets | Co-founder and CTO |
| 1 to 2 | Download a sample from the DLD Open Data page by hand (small date range) to validate the field list against Dubai Pulse | Data Analyst |
| 1 to 3 | Email info@dubailand.gov.ae and ask the questions in section 14 | Founder and CEO, Legal Counsel |
| 2 to 3 | Build the prototype pipeline (extract, raw load, transform, five insight cards) | Data Analyst, CTO |
| 4 to 5 | **After the DET trade licence is issued:** create the MyDLD business account; start the API Gateway applications for **Trakheesi, Dubai Brokers and Rental Index** | Broker-Manager, Business Setup Consultant |
| 5 to 8 | Wire Trakheesi validation and delisting into the listing workflow; test in the dry run | CTO, Broker-Manager |
| After pilot | Apply for Ejari (if managing rentals) and discuss Oqood-level access with DLD | Founder and CEO |

**Roadmap fit:** this supports tasks 2.04 (Insights v0) and 1.15 (Trakheesi and Madmoun workflow). The roadmap budgeted AED 10,000 for a data licence; because the core datasets are open, that line may fall, but gateway subscription fees (reported at AED 30,000 per year for one API **[B]/[U]**) may add cost. Revisit the budget after DLD replies.

---

## 14. Questions to put to DLD (or the Dubai Pulse team)

1. Which licence governs commercial use and redistribution of the open real estate datasets? Is attribution wording prescribed?
2. What are the rate limits, maximum rows per call, and refresh frequency of `dld_transactions` and the other open datasets?
3. Do Dubai Pulse datasets match the nine record types and columns on the DLD Real Estate Data page? Is a data dictionary available, including definitions of "Transaction Size", "Amount", "End Date" and "Completion Date"?
4. Is there a stable contract identifier for the rents dataset, and a project identifier on transaction rows?
5. For the API Gateway: what are the eligibility rules, documents, annual fees and service levels for **Trakheesi, Dubai Brokers and Rental Index**? Can a newly licensed brokerage subscribe in its first year?
6. Is there a sandbox environment and API documentation for each gateway API?
7. Can a brokerage obtain a customer's Oqood and payment status with the customer's consent (for example through UAE Pass), so the tracker can show instalments and registrations?
8. How should Mollak service-charge index data be accessed programmatically by a non-bank?
9. Is there a partner programme for proptech companies?

---

## 15. Build effort and phasing [E]

| Phase | Scope | Effort |
|---|---|---|
| **1: Open-data pipeline** | Extract, raw load, transform, area mapping, five insight cards, quality tests | About 3 to 4 weeks for one data engineer plus the analyst |
| **2: Verification layer** | Projects, developers and brokers verification screens; Trakheesi validation and delisting | About 2 to 3 weeks after gateway access |
| **3: Rental index and renewals** | Rental Index API, renewal reminders with rent-increase check | About 1 to 2 weeks |
| **4: Consented customer data** | Oqood and payment status, Ejari, Mollak (if access allows) | Depends on DLD; start discussions early |

---

## 16. Risks and fallbacks

| Risk | Mitigation |
|---|---|
| Gateway access refused or slow | Pilot with open data plus manual Dubai REST checks; use the partner-brokerage fallback for Trakheesi until the licence is active |
| Open data schema or dataset IDs change | Contract tests on column names; keep raw files; version the transformations |
| Licence disallows commercial reuse | Negotiate a partnership; show only derived analytics; or buy a licensed feed |
| Poor project-name matching | Review queue; prefer project number when DLD adds it; keep match scores |
| Reliance on a third-party aggregator | Use only for prototypes; track divergence from official data monthly |
| Stale data shown as live | Show "last updated" everywhere; freshness alerts |

---

## 17. Sources

**Official (read directly in this research) [V]**
- DLD, Real Estate Data (open data page with CSV downloads and column sets): `https://dubailand.gov.ae/en/open-data/real-estate-data/`
- DLD, API Gateway (catalogue of 13 APIs): `https://dubailand.gov.ae/en/eservices/api-gateway`
- DLD, API Gateway registration pages (redirect to MyDLD login via UAE Pass): `https://dubailand.gov.ae/en/eservices/api-gateway-registration?appId=<n>`
- DLD, Dubai REST service page: `https://dubailand.gov.ae/en/eservices/dubai-rest/`
- Dubai Pulse, DLD organisation and datasets: `https://www.dubaipulse.gov.ae/organisation/dld` (dataset page and API token endpoint details came from search excerpts)

**Third-party (indicative) [B]**
- BayutAPI blog, "Dubai Land Department (DLD) Data: What It Is and How to Access It via API" (access routes; token expiry; aggregator)
- Dubai Pulse dataset pages for `dld_transactions-open`, `dld_transactions-open-api`, `dld_lkp_areas-open`, `dld_residential_sale_index-open` (seen in search results)
- Search-result summaries of the DLD gateway registration pages (eligibility and a AED 30,000 + VAT subscription figure, unconfirmed)
- Mondaq, Gulf News and Data Protection Report on Dubai Law No. 26 of 2015 (Dubai Data classification)
- Arabian Business and Construction Week reports that DLD made real estate data public (2022)

**Not readable in this research:** API specifications, registration terms and fees (behind login); Dubai Pulse API documentation; the open-data licence text.

---

## Appendix A: Example code (illustrative; verify endpoints and parameters first)

```python
# token_client.py: Dubai Pulse client-credentials flow (parameters marked [U] must be confirmed)
import time, requests

TOKEN_URL = "https://api.dubaipulse.gov.ae/oauth/client_credential/accesstoken"

class PulseToken:
    def __init__(self, key, secret):
        self.key, self.secret = key, secret
        self.token, self.expires_at = None, 0

    def get(self):
        if self.token and time.time() < self.expires_at - 120:   # refresh early
            return self.token
        r = requests.post(
            TOKEN_URL,
            params={"grant_type": "client_credentials"},
            data={"client_id": self.key, "client_secret": self.secret},  # [U] may be basic auth instead
            timeout=30,
        )
        r.raise_for_status()
        body = r.json()
        self.token = body["access_token"]
        self.expires_at = time.time() + int(body.get("expires_in", 1800))  # about 30 minutes
        return self.token

def auth_headers(tok):
    return {"Authorization": f"Bearer {tok.get()}"}
```

```python
# ingest_transactions.py: idempotent upsert keyed on Transaction Number (column names per DLD open-data page)
import csv, hashlib

def clean_row(r):
    return {
        "transaction_number": r["Transaction Number"].strip(),
        "transaction_date": r["Transaction Date"],
        "txn_type": r["Transaction Type"],
        "registration_type": r["Registration type"],
        "area": r["Area"].strip().upper(),
        "amount_aed": float(r["Amount"] or 0),
        "txn_size_sqm": float(r["Transaction Size (sq.m)"] or 0),
        # ... remaining columns
    }

def rent_key(r):
    parts = [r["Registration Date"], r["Start Date"], r["End Date"], r["Version"], r["Area"],
             r["Project"], r["Contract Amount"], r["Annual Amount"], r["Property Size (sq.m)"],
             r["Number of Rooms"], r["No of Units"]]
    return hashlib.sha256("|".join(p.strip() for p in parts).encode()).hexdigest()

# INSERT ... ON CONFLICT (transaction_number) DO UPDATE SET ... WHERE excluded.* IS DISTINCT FROM ...
```

---

*This document is technical research, not legal advice. Access terms, fees and schemas change; confirm with DLD and your lawyer before building on any item tagged [B], [A] or [U].*
