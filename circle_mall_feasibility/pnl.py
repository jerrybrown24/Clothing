"""Monthly P&L engine (Jan-25 .. Jul-29) for each rent option and sales scenario, aggregated to
calendar years (FY'25-27) and lease years (Aug-Jul). Sources:
  * FY'25: 'P & L' sheet actuals (costs spread evenly by month, sales by the COG monthly shape)
  * Jan-Jul 26: 'YR'26' sheet monthly actuals
  * Aug-Dec 26: 'P & L' sheet 'Aug to DEC' cost estimates; sales = Aug actual + forecast
  * 2027-29: 'P & L 5 Yrs' Yr'27/28/29 cost lines (spread evenly); sales = forecast
Lease years run 8 Aug .. 7 Aug: each August is split 7/31 (old lease year) and 24/31 (new).
Rent: earlier 14% turnover rent until 7 Aug 2026, then the chosen option from 8 Aug 2026."""
import json
import openpyxl
import pandas as pd
R = json.load(open("results.json"))
SQFT = 3598
TOR = 0.12
KEYS = ["Employee expense", "Advertising & marketing", "Other opex", "Shared common", "Shared others"]
M = pd.period_range("2025-01", "2031-08", freq="M")
NY = 5                                            # lease years projected (year 1 = the 1-year renewal)
# rent options (Scenario / Circle Mall Rent sheets). base, SC, MKT per sqft per lease year
GROWTH = 0.05                                     # assumed rental growth, every year, on gross rent
OPTIONS = {
    "New · 246":       dict(label="New rent, +5% a year", psf=[tuple(round(c * (1 + GROWTH) ** k, 4) for c in (190, 41, 15)) for k in range(NY)]),
    "Earlier · 14%":   dict(label="Earlier turnover rent", tor_only=0.14),
}
CAPEX = 2_000_000; CAPEX_LIFE = 5

# ---------------- cost inputs ----------------
FY25 = dict(sales=3635846.29, gm=2505247.92, ni=2235204.25, rent=509018.48, dep=259318.77, fin=0.0,
            **dict(zip(KEYS, [246033.86, 33418.94, 278611.63, 183849.07, 86106.41])))
ws = openpyxl.load_workbook("Circle_Mall_002.xlsx", data_only=True)["YR'26"]
rows = {r[2]: list(r[3:10]) for r in ws.iter_rows(min_row=3, max_row=17, values_only=True)}
Y26 = dict(sales=rows["Sales"], gm=rows["Gross Margin"], ni=rows["Net Income"], rent=rows["Rent"],
           dep=rows["Depreciation"], fin=rows["Finance & Extrdnry"],
           **dict(zip(KEYS, [rows["emp.Exp"], rows["Adv &Mktg Exp"], rows["Other Admin"],
                             rows["Shared Cost Emp"], rows["Shared Cost Others"]])))
AUGDEC26 = dict(sales=2209715.49, gm=1635655.72, ni=1415861.99, dep=0.0, fin=1115.0,
                **dict(zip(KEYS, [151647.0, 31481.69, 110781.10, 74543.30, 30687.36])))
YR = {2027: [382176.05, 91379.44, 280819.93, 203661.90, 93040.68],
      2030: [405568.28, 96972.60, 298008.36, 216127.63, 98735.52],
      2031: [413679.65, 98912.05, 303968.53, 220450.18, 100710.23],
      2028: [389819.57, 93207.03, 286436.33, 207735.13, 94901.50],
      2029: [397615.96, 95071.17, 292165.06, 211889.84, 96799.53]}
DEPFIN = {2027: (15213.98, 4878.21), 2028: (0, 0), 2029: (0, 0), 2030: (0, 0), 2031: (0, 0)}
GM_PCT = 3377686.51 / 4564441.23          # 74.0%  (P&L Yr'27+)
NI_PCT = 2921242.39 / 4564441.23          # 64.0%

# ---------------- monthly sales ----------------
act = pd.Series(R["actual"], index=pd.PeriodIndex(R["months"], freq="M"))
ens = pd.Series(R["ensemble"]["forecast"], index=pd.PeriodIndex(R["fut_months"], freq="M"))
ens_ly = R["ensemble"]["lease_years"]
fy25_scale = FY25["sales"] / act["2025-01":"2025-12"].sum()     # align COG months to reported FY'25
AUG26 = pd.Period("2026-08", "M")
PRE, POST = 7 / 31, 24 / 31                       # August split around the 8 Aug lease anniversary

def lease_idx(p, after_8th):
    """-2: before 8 Aug 2025, -1: 8 Aug 2025..7 Aug 2026, 0,1,2: new term years (3 = after term)."""
    y = p.year if (p.month > 8 or (p.month == 8 and after_8th)) else p.year - 1
    return y - 2026

def monthly_sales(scen):
    tgt = R["scenarios"][scen]; out = {}
    f = [(tgt[0] - POST * act[AUG26]) / (ens_ly[0] - POST * act[AUG26]), tgt[1] / ens_ly[1], tgt[2] / ens_ly[2]]
    for p in M:
        k = lease_idx(p, True)
        if p.year == 2025: out[p] = act[p] * fy25_scale
        elif p <= AUG26: out[p] = act[p]
        elif k <= 2 and p in ens.index: out[p] = ens[p] * f[min(k, 2)]
        else: out[p] = out[p - 12] * tgt[min(k, NY - 1)] / tgt[min(k, NY - 1) - 1]   # same month last year x growth
    return out

def ly_rent(opt, ly_sales):
    o = OPTIONS[opt]
    if "tor_only" in o:
        return None
    out = []
    for (b, sc, mk), s in zip(o["psf"], ly_sales):
        base = max(b * SQFT, TOR * s)        # higher of fixed base rent or 12% turnover rent
        out.append(dict(base=base, sc=sc * SQFT, mkt=mk * SQFT, psf=b + sc + mk))
    return out

def segments():
    for p in M:
        if p.month == 8: yield p, PRE, lease_idx(p, False); yield p, POST, lease_idx(p, True)
        else: yield p, 1.0, lease_idx(p, True)

def monthly_pnl(scen, opt, capex):
    sales = monthly_sales(scen)
    segs = list(segments())
    ly_s = [sum(sales[p] * w for p, w, k in segs if k == j) for j in range(NY)]
    lr = ly_rent(opt, ly_s)
    rows = []
    for p, w, k in segs:
        s = sales[p] * w
        r = dict(p=p, k=k, sales=s)
        if p.year == 2025:
            r.update(gm=s * FY25["gm"] / FY25["sales"], ni=s * FY25["ni"] / FY25["sales"],
                     dep=FY25["dep"] / 12 * w, fin=0.0, **{c: FY25[c] / 12 * w for c in KEYS})
        elif p < AUG26:
            i = p.month - 1
            r.update(gm=Y26["gm"][i], ni=Y26["ni"][i], dep=Y26["dep"][i], fin=Y26["fin"][i],
                     **{c: Y26[c][i] for c in KEYS})
        elif p.year == 2026:
            r.update(gm=s * AUGDEC26["gm"] / AUGDEC26["sales"], ni=s * AUGDEC26["ni"] / AUGDEC26["sales"],
                     dep=0.0, fin=AUGDEC26["fin"] / 5 * w, **{c: AUGDEC26[c] / 5 * w for c in KEYS})
        else:
            r.update(gm=s * GM_PCT, ni=s * NI_PCT, dep=DEPFIN[p.year][0] / 12 * w, fin=DEPFIN[p.year][1] / 12 * w,
                     **{c: v / 12 * w for c, v in zip(KEYS, YR[p.year])})
        if k < 0:                                   # old lease: turnover rent
            rent = Y26["rent"][p.month - 1] if (p.year == 2026 and p < AUG26) else s * FY25["rent"] / FY25["sales"]
            r.update(rent_base=rent, rent_sc=0.0, rent_mkt=0.0)
        else:
            j = min(k, NY - 1)
            if lr is None:
                r.update(rent_base=OPTIONS[opt]["tor_only"] * s, rent_sc=0.0, rent_mkt=0.0)
            else:
                r.update(rent_base=lr[j]["base"] / 12 * w, rent_sc=lr[j]["sc"] / 12 * w, rent_mkt=lr[j]["mkt"] / 12 * w)
            if capex: r["dep"] += CAPEX / CAPEX_LIFE / 12 * w
        rows.append(r)
    return rows, lr

SUMK = ["sales", "gm", "ni", *KEYS, "rent_base", "rent_sc", "rent_mkt", "dep", "fin"]
def agg(rows, pick, psf=None):
    sel = [r for r in rows if pick(r)]
    d = {c: float(sum(r[c] for r in sel)) for c in SUMK}
    d["rent"] = d["rent_base"] + d["rent_sc"] + d["rent_mkt"]
    d["total_exp"] = sum(d[c] for c in KEYS) + d["rent"]
    d["store_profit"] = d["ni"] - d["total_exp"]
    d["net"] = d["store_profit"] - d["dep"] - d["fin"]
    d["rent_psf"] = psf if psf is not None else d["rent"] / SQFT
    d["rent_to_sales"] = d["rent"] / d["sales"]; d["rent_to_ni"] = d["rent"] / d["ni"]; d["rent_to_gm"] = d["rent"] / d["gm"]
    d["dep_to_sales"] = d["dep"] / d["sales"]
    return d

out, fy, ly0 = {}, {}, None
for scen in ("base",):
    out[scen], fy[scen] = {}, {}
    for o in OPTIONS:
        out[scen][o], fy[scen][o] = {}, {}
        for case, cx in (("s1", False), ("s2", True)):
            rows, lr = monthly_pnl(scen, o, cx)
            out[scen][o][case] = [agg(rows, lambda r, j=j: r["k"] == j, lr[j]["psf"] if lr else None) for j in range(NY)]
            fy[scen][o][case] = [agg(rows, lambda r, y=y: r["p"].year == y) for y in (2025, 2026, 2027)]
            if ly0 is None: ly0 = agg(rows, lambda r: r["k"] == -1)

# breakeven: max gross rent/sqft (LY1) for store profit = 0 / 10% of sales, and rent-to-sales 18/20%
be = {}
for scen in ("base",):
    y = out[scen]["New · 246"]["s1"][0]
    s = y["sales"]; head_room = y["store_profit"] + y["rent"]      # store profit before rent
    be[scen] = dict(sales=s, zero=head_room / SQFT, ten=(head_room - 0.10 * s) / SQFT,
                    capex_zero=(head_room - CAPEX / CAPEX_LIFE - y["dep"] - y["fin"]) / SQFT,
                    rts20=0.20 * s / SQFT, rts18=0.18 * s / SQFT)
# benchmarks from the notes sheet + TTM sales (Sep-25..Aug-26) from the COG file
bench = [
    dict(store="Dubai Hills Mall", sqft=3803, psf=335.10, ttm=R["ttm"]["Dubai Hills"]),
    dict(store="Dubai Mall", sqft=3401, psf=474.13, ttm=R["ttm"]["DUBAI MALL"]),
    dict(store="Mirdif City Centre", sqft=6757, psf=261.78, ttm=R["ttm"]["MIRDIFF CITY CENTRE"]),
    dict(store="Circle Mall · earlier (14% TOR)", sqft=3598, psf=0.14 * R["ttm"]["CIRCLE MALL"] / 3598, ttm=R["ttm"]["CIRCLE MALL"]),
    dict(store="Circle Mall · new rent", sqft=3598, psf=246.00, ttm=R["ttm"]["CIRCLE MALL"]),
]
for b in bench:
    b["rent"] = b["sqft"] * b["psf"]; b["sales_psf"] = b["ttm"] / b["sqft"]; b["rts"] = b["rent"] / b["ttm"]

# term totals + simple NPV @10% of store-profit cash flows (capex at t0 for scenario 2)
def npv(cfs, r=0.10): return sum(c / (1 + r) ** (i + 1) for i, c in enumerate(cfs))
summary = {}
for scen in out:
    summary[scen] = {}
    for o, d in out[scen].items():
        sp = [y["store_profit"] for y in d["s1"]]
        summary[scen][o] = dict(sp3=sum(sp), net3_s1=sum(y["net"] for y in d["s1"]), net3_s2=sum(y["net"] for y in d["s2"]),
                                npv_s1=npv(sp), npv_s2=npv(sp) - CAPEX,
                                rts_avg=sum(y["rent"] for y in d["s1"]) / sum(y["sales"] for y in d["s1"]))
_ms = monthly_sales("base")
R["fut_months_ext"] = [str(p) for p in M if p > AUG26]
R["forecast_monthly"] = [float(_ms[p]) for p in M if p > AUG26]   # final forecast by month, Sep-26 .. Aug-31
R.update(pnl=out, breakeven=be, bench=bench, summary=summary,
         options={k: v["label"] for k, v in OPTIONS.items()},
         option_psf={k: [a + b + c for a, b, c in v["psf"]] if "psf" in v else None for k, v in OPTIONS.items()},
         fy=fy, ly0=ly0,
         consts=dict(sqft=SQFT, gm_pct=GM_PCT, ni_pct=NI_PCT, tor=TOR, capex=CAPEX, capex_life=CAPEX_LIFE))
json.dump(R, open("results.json", "w"), indent=1)
for y in out["base"]["New · 246"]["s1"]:
    print(f"sales {y['sales']:>12,.0f} rent {y['rent']:>10,.0f} psf {y['rent_psf']:6.2f} RtS {y['rent_to_sales']:.1%} store {y['store_profit']:>10,.0f} net {y['net']:>10,.0f}")
