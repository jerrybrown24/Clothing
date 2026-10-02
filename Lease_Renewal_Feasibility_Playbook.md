# Cotton On Lease Renewal Feasibility: Report Playbook

Give this file to Claude (or another analyst) together with the store's Excel files. It describes exactly how to build a lease renewal feasibility report for any Cotton On store in the UAE / GCC. The output is a single standalone HTML report, in the same format as the Circle Mall report (`circle_mall_feasibility/` in this repository).

> **How to use:** fill in the *Store inputs* block below, attach the two workbooks, and say:
> "Follow `Lease_Renewal_Feasibility_Playbook.md` and build the report for this store."
> If something in the inputs block is missing, the analyst must ask for it before starting. They must not guess.

---

## 1. Store inputs (fill in before starting)

```yaml
store_name:            "Adults - <Mall name>"        # as it appears in the P&L workbook
mall:                  "<Mall name>, <Area>, <City>"
loc_id:                "C??"                         # LOC_ID in the sales/footfall file (BRAND_ID = COT)
store_location_name:   "<STORE_LOCATION value>"      # e.g. CIRCLE MALL
gla_sqft:              0000
opening_date:          "YYYY-MM-DD"

# Current (old) lease
old_rent_basis:        "turnover"                    # turnover | fixed | mixed
old_turnover_pct:      0.14                          # if turnover rent
lease_anniversary:     "08-08"                       # lease years run from this day to the day before, next year

# New rent being offered (gross = base + service charge + marketing levy, AED per sq ft per year)
new_base_psf:          190
new_sc_psf:            41
new_mkt_psf:           15
renewal_term_years:    1                             # e.g. 1-year renewal
renewal_start:         "2026-08-08"
turnover_rent_clause:  0.12                          # "higher of base or X% of sales", if any; null if none
projection_years:      5
rent_growth_pa:        0.05                          # assumed growth on GROSS rent for projected years

# Market evidence (provided and verified by the user, never invented)
market_rent_comps:     "Apparel Group new rentals at <Mall>: AED 230-240 per sq ft gross"

# Other settings
tax_rate_for_pat:      0.09                          # UAE corporate tax, applied at store level
data_cutoff_month:     "YYYY-MM"                     # last COMPLETE month; drop any partial month after it
```

## 2. Input files and what to read from them

### 2a. Store P&L workbook (e.g. `<Store>_002.xlsx`)
Typical sheets (names can vary slightly, so confirm by opening the file):

| Sheet | Use |
|---|---|
| `P & L` | FY actual (e.g. Fy'25), current-year estimate, the "Till July" and "Aug to DEC" split columns, sq ft, rent per sq ft |
| `P & L 5 Yrs` | Forward cost lines Yr'27 … Yr'31: employee, advertising and marketing, other opex, shared common, shared others, depreciation, finance. Also forward gross margin % and Net Income %. |
| `YR'26` (current year) | Monthly actuals Jan–Jul: Sales, Gross Margin, Net Income, emp.Exp, Rent, Adv & Mktg, Other Admin, Shared Cost Emp, Shared Cost Others, Depreciation, Finance |
| `Sheet1 (2)` / history | Lease-year sales and rent history (start/end dates, rent %, rent per sq ft) |
| `notes` | Rent benchmarks for other Cotton On stores (size, base, SC, CW, MKT, gross per sq ft), mall footfall, lease-year sales history |
| `Scenario` / `<Mall> Rent` | Landlord rent offers. Use only the rent the user confirms as the new rent. |

Line mapping used in the P&L: `Other Admin` = Other opex, `Shared Cost Emp` = Shared common, `Shared Cost Others` = Shared others.

### 2b. Group sales and footfall file (e.g. `COG_month-loc_salesfootfall_from_2024.xlsx`)
- Sheets `sales` and `footfall`. Header row is row 2. Columns: `MONTH_ID` (YYYYMM), `MONTH_ID_NAME`, `BRAND_ID`, `LOC_ID`, `STORE_LOCATION`, `NET_SALES` / `FOOTFALL`.
- Filter `BRAND_ID == "COT"`. Exclude non-store channels from the store panel: `COG Online Store`, `Namshi Cotton On Marketplace`, `COG Sharjah Expo`, `Sharjah Expo`. Keep them aside for the competition section.
- Drop any month after `data_cutoff_month`, because the last month is usually partial.
- **Like-for-like peers** are the Cotton On stores (other than the target) with sales in every month of the window. The like-for-like chain total is the sum of those peers.
- Check that the target store's monthly sales in this file match the `YR'xx` sheet. They should match to the dirham.

## 3. Method

Reference implementation: `circle_mall_feasibility/forecast.py`, `pnl.py`, `template.html`, `build.py`. If you have this repository, adapt those files (change the inputs) instead of rewriting from scratch.

### 3a. Sales forecast (Section 2)
1. Use the target store's monthly sales series (typically 30+ months).
2. **Backtest:** train on data up to December of last year and test on the months since (for example Jan–Aug). Measure MAPE on the hold-out months.
3. Run these eight methods:
   - Seasonal naive × trailing-12-month growth (baseline)
   - Holt-Winters (additive damped trend, multiplicative seasonality, period 12)
   - SARIMA (1,0,0)(0,1,0)12 on log sales, with drift
   - Ridge regression on log sales with a trend and 11 month dummies
   - Random Forest on a pooled panel of like-for-like stores. Target is year-on-year log growth. Features are the lag-12 log, store level, month, a target-store flag and chain momentum.
   - Gradient Boosting on the same panel
   - Chain-share: Holt-Winters on the like-for-like chain × the store's seasonal share, carrying forward half of the store's recent share drift
   - Footfall × sales-per-visitor: Holt-Winters on footfall × the latest sales per visitor for each calendar month
4. **Ensemble:** weight each method by 1/MAPE, normalised. Give zero weight to any method with MAPE above 25%.
5. **Growth by year:**
   - Year 1 = the ensemble on its own.
   - Years 2–3 = 50% the ensemble's own year-on-year trend + 50% external growth.
   - Years 4–5 = external growth only, because roughly 30 months of history cannot support model trends further out.
6. **External growth** = a weighted sum of drivers minus adjustments. Research **current** figures and cite every source.
   - Drivers: regional apparel market CAGR (weight 30%), target segment / city population growth (30%), local catchment development (40%).
   - Adjustments: competition / online cannibalisation (about −1.5 pp) and store maturity / chain like-for-like softness (about −0.8 pp).
7. Show **one forecast only**. No bear or bull scenarios.

### 3b. Lease years
- Lease years run from the anniversary day to the day before, a year later (for example 8 Aug – 7 Aug).
- Split the anniversary month by days. With an 8 Aug anniversary, 1–7 Aug (7/31) belongs to the earlier lease year and 8–31 Aug (24/31) to the new one. Apply this split to sales, costs and rent.
- Check the actual last lease year's sales against the `notes` / history sheet. It should be within about 0.1%.

### 3c. Monthly P&L engine (Section 3)
Build the P&L month by month, from January of the last actual financial year to the end of projection year 5. Then add it up both by financial year (Jan–Dec) and by lease year, so the two views reconcile.

| Period | Source |
|---|---|
| Last FY (e.g. 2025) | `P & L` FY actual. Spread costs evenly by month and day. Sales follow the group file's monthly shape, scaled so the FY total matches the reported figure. Gross margin % and Net Income % as reported. |
| Current year Jan–Jul | `YR'xx` monthly actuals, line by line (including actual rent) |
| Current year Aug–Dec | The P&L's "Aug to DEC" cost column ÷ 5 per month. Gross margin % and Net Income % from that column. Sales = actual months, then the forecast. |
| Following years | `P & L 5 Yrs` Yr'xx cost lines ÷ 12, with that year's depreciation and finance. Gross margin % and Net Income % from the forward P&L (e.g. 74.0% / 64.0%). |

Rent:
- **Before the renewal start:** actual rent where it exists. Otherwise the old basis, for example 14% of sales.
- **From the renewal start:** gross rent = (base + SC + MKT) × sq ft for year 1. Projected years grow the **gross** rent by `rent_growth_pa` (e.g. 246 → 258.3 → 271.2 → 284.8 → 299.0).
- If a turnover clause exists, base rent = the higher of (base × sq ft) and (clause % × lease-year sales). State whether it ever applies.

Only sales and rent change. Every other line is the store's own P&L. Say so in the report.

### 3d. Definitions (use these labels everywhere)
| Term | Definition |
|---|---|
| Income | P&L **Net Income** (sales after gross margin and margin deductions) |
| Expense | All store operating costs **including rent** (P&L "Total Exp.") |
| Cash profit / Store profit | Income − Expense (before depreciation and finance) |
| PAT | (Store profit − Depreciation − Finance) × (1 − tax rate) if positive, otherwise unchanged |
| Rent-to-sales | Gross rent ÷ Net sales. Bands: ≤20% healthy, 20–24% stretched, >24% high |
| Rent-to-income | Gross rent ÷ Net Income. Bands: ≤32% healthy, 32–38% stretched, >38% high |
| "Same sales" | A past period's actual sales and costs with only the rent changed, which isolates the effect of the rent |

### 3e. Reconciliation checks (must pass before writing)
- Current FY rent and total expenses reproduce the P&L's own figures when rent switches on the P&L's assumed date.
- The last FY reproduces the reported store profit and net profit exactly.
- Lease-year sales in Section 2 equal the lease-year sales used in Section 3 (use the P&L engine's totals in both).
- Every figure that appears in more than one place has the same value everywhere.

## 4. Report layout (final, in this order)

**Header**
- Eyebrow: "Lease renewal feasibility · Cotton On Adults · Store <LOC_ID>". Title: "<Mall> Lease Renewal".
- Meta line: area, GLA, **"Renewal: <N> year(s) only, <start> – <end>"** in bold, "Projection: 5 years to <date>, rent +5% a year", data cut-off, AED.
- **Before / after summary** (first thing under the title). Two columns: *Before: last lease year, actual, old rent* and *After: renewal year, forecast, new rent*, plus a change column. Rows: Rent, Sales, Income, Expense (incl. rent), **PAT** (highlighted), Rent-to-sales, Rent-to-income. Add a one-line definition note. On phones, stack the change value under each row.
- **Verdict banner:** a short tag (for example "Renew 1 year · seek market rent") and 3–5 sentences. Cover: the renewal term and rent, the rent change (AED and %), same-sales PAT impact, the market comparison, and the recommended ask.
- Sticky nav: 1 · Rent & ratios | Competition | 2 · Sales forecast | 3 · P&L & recommendation.

**Section 1 · Rent, rent-to-sales and rent-to-income**
- Lead paragraph: rent components, year-1 rent, year-5 rent if renewed each year, what the old rent basis would cost on the same sales, and whether the turnover clause ever applies.
- **Rent schedule table, 5-year projection.** First row: last lease year, old lease (grey). Then 5 rows tagged **"Renewal"** (year 1) or **"Projected"** (years 2–5). Columns: Base/SC/MKT, gross per sq ft, gross rent, sales, rent-to-sales, rent-to-income, rent/GM, and a total row. Put the ratio definitions and bands in a note under it.
- Two blocks side by side:
  - **Rent history** (lease years from the history sheet), plus the new rent on last year's sales.
  - **Benchmark: other Cotton On stores** (sq ft, gross per sq ft, trailing-12-month sales, sales per sq ft, rent-to-sales) from `notes` and the group file.
- **What the store can afford** (renewal year): rent per sq ft for 18% and 20% rent-to-sales, for 10% store profit, and for break-even, with the offered rent highlighted.

**Competition and market rent** (short section)
- Lead paragraph using only the user-verified comparables. Use the exact wording the user gives, for example "Apparel Group's new rentals at <Mall> are AED 230–240 per sq ft gross". State the premium per sq ft, the annual rent difference, the PAT difference, and the rent-to-sales ratio at the comparable rent.
- **Other competitive pressures** (bullets drawn from data):
  - Online channels (COG online store, Namshi marketplace monthly sales from the group file)
  - Destination vs community malls (peer year-on-year)
  - Local new retail (already in the forecast adjustment)
  - Sales per sq ft vs other Cotton On stores
- Never invent competitor names or rents.

**Section 2 · Sales forecast**
- Lead paragraph: data span, eight methods, backtest window, how years 2–3 and 4–5 are grown.
- Monthly chart: actual line and dashed forecast line to the end of year 5, with shaded lease-year bands labelled "Renewal", "Y2" … "Y5".
- Method cards (8), giving the family and a one-line description of each.
- Backtest table (MAPE, weight bar, each model's output for years 1–3, ensemble row), with a backtest chart (actual, ensemble, faint individual models).
- Two blocks side by side: **store vs chain** year-to-date growth (diverging bars, store highlighted) and **footfall and conversion** (trailing-12-month footfall, sales per visitor, share of mall traffic, year-on-year change in footfall and sales per visitor, small footfall chart).
- **External growth drivers** table (driver, growth, weight, contribution, cited basis; adjustments; total) and a note explaining the year 1 / 2–3 / 4–5 logic.
- **Forecast by lease year:** bars (actual history grey, forecast orange) and a table of lease year, Actual / Forecast · renewal year / Forecast · projected, sales, growth, and the 5-year total.

**Section 3 · Full P&L and recommendation**
- Lead paragraph: monthly build, sources, "only sales and rent change", renewal date.
- **Financial years table:** last FY actual, current FY (actual + forecast), next FY forecast. Full P&L lines with % of sales, rent split (base or turnover / SC / MKT), rent per sq ft, rent-to-sales and rent-to-income pills. Add a note if the current-year plan in the P&L differs from the forecast, kept factual and short.
- **Lease-year comparison:** last lease year (old rent) vs renewal year (new rent), with Change and Change % columns. Note any difference between the booked rent and the history sheet.
- **5-year projection table:** a highlighted box saying *only year 1 is the renewal; years 2–5 assume a renewal each year with gross rent +5% a year*. Columns are headed "Renewal / Projected" with dates, plus a 5-year total.
- **What the new rent does to profit:** PAT at old rent vs PAT at new rent. First row is the last lease year at the same sales. Then the renewal year and projected years (labelled with their rent per sq ft) against last year's PAT, with change pills.
- **Recommendation:** written in prose, then a numbered action list. See section 5.

**Footer:** sources (file names, and every external source with its figure), the model libraries used, and the scripts used to reproduce the numbers.

## 5. Recommendation rules (important)
- **Be reasonable and balanced.** Still being profitable is not, on its own, a reason to recommend accepting a rent. Lead with the **same-sales** PAT impact, the effect of the rent alone, not the forecast-flattered figure. Then show how much the forecast narrows it, and say that the narrowing depends on sales growth that may not happen.
- Cover all of these:
  1. What is being committed (the renewal term only; projected years are not a commitment).
  2. How severe the rent increase is (AED, %, rent-to-sales before and after, same-sales PAT change).
  3. Rent growing faster than sales across the projection, and what PAT does if sales stay flat.
  4. Market evidence (user-verified comparables) and the premium being asked.
  5. Why closing is or isn't justified (renewal-year PAT, the sales drop that would cause a loss, the store's trend against the chain).
- **Action list:**
  - Ask for parity with the market comparables (state the range, the saving and the resulting rent-to-sales).
  - Keep the term short or add a break option. For any extension, ask for increases linked to sales, with turnover rent as an alternative.
  - Don't go above the offered rent (say what every AED 10 per sq ft costs in PAT).
  - Budget renewal-year sales at the forecast, track them monthly, and start the next renewal talks about six months before expiry.
- Present one recommendation, written as a single connected argument, not a list of disconnected points.

## 6. Do NOT include (decided during the Circle Mall review)
- Bear / bull / multiple sales scenarios, or scenario toggles.
- Alternative landlord rent options (A, B, C, D…) once the user has confirmed the new rent.
- Capex / renovation scenarios, unless the user explicitly asks.
- A rent simulator or other interactive what-if tools.
- A separate "rent ratios by lease year" chart section (the ratios are already in the rent schedule table).
- A "check the P&L sales plan" warning box.
- An FY-basis row in the PAT impact table (use the lease-year basis).
- The word **"renewed"**. Always write **"renewal"** ("Renewal" tag, "the renewal is for one year only", "a renewal each year").
- Lines telling the business to refuse the assumed escalation (for example "don't agree to 5% yearly increases"), when the user has set that escalation as the projection assumption.
- Invented facts: competitor names, rents or figures that the user or the data didn't provide.

## 7. Writing style
- Plain, direct sentences. Write AED amounts as `AED 885k` / `AED 4.16M` in prose and in full (`885,108`) in tables.
- Every claim is backed by a number from the data or a cited source.
- Use lease-year dates in full ("8 Aug 2026 – 7 Aug 2027"). Never "LY1" alone in prose.
- Label actuals vs forecast vs projected everywhere.

## 8. Design and technical requirements
- **One standalone HTML file** (`<Store>_Lease_Feasibility.html`) with `<!doctype html>`, a head and a body, that opens in any browser. All data is embedded as JSON, and there are no external JS libraries. Draw charts with hand-written inline SVG: tooltips on hover, a 20% / 32% reference line on ratio charts, labels coloured from theme tokens.
- Fonts from Google Fonts, with system fallbacks (for example Archivo for display, Source Sans 3 for body, IBM Plex Mono for labels and numbers).
- Define colours as CSS tokens with light and dark themes (`prefers-color-scheme` plus `[data-theme]`) and an explicit body background. Status pills (good / warn / bad) also carry a shape (●, ▲, ■), so meaning doesn't rely on colour alone.
- Responsive down to 400px wide. No horizontal page scroll; wide tables scroll inside their own container. Use tabular numbers.
- If publishing as a claude.ai artifact, publish the body version too, and keep the standalone file as the deliverable.

## 9. QA checklist before delivering
- [ ] Reconciliation checks in 3e pass.
- [ ] Before/after summary, verdict, Section 1 schedule, Section 3 tables and recommendation all show identical figures.
- [ ] The text contains no forbidden items from section 6 (search for "renewed", "bear", "bull", "Option A", "simulator").
- [ ] The renewal term is stated in the header meta, the summary, the verdict, the rent schedule note and the 5-year table box.
- [ ] Rendered and checked at desktop and phone width, in light and dark themes, with no console errors and no page-level horizontal scroll.
- [ ] Every external figure has a source in the footer.

## 10. Questions to ask if not provided
1. Which rent is the confirmed new rent (base, SC and MKT per sq ft), and what are the renewal term and start date?
2. What is the lease anniversary date (the day lease years start)?
3. What rent growth should the projection assume, and over how many years?
4. Is there verified market rent evidence for comparable apparel tenants in the same mall? What exactly is it, and how should it be named?
5. Should PAT use 9% UAE corporate tax at store level, or should it be shown before tax?
6. Which month is the last complete month of data?
