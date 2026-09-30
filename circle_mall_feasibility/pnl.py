"""Lease-year P&L (Aug-Jul) for each rent option, using the cost base of the existing
'P & L 5 Yrs' sheet (Yr'27/28/29 lines) and the sales forecast from forecast.py."""
import json
import pandas as pd
R = json.load(open("results.json"))
SQFT = 3598
# cost base carried unchanged from the P&L ('P & L 5 Yrs', Yr'27, Yr'28, Yr'29)
GM_PCT = 3377686.51 / 4564441.23          # 74.0%
NI_PCT = 2921242.39 / 4564441.23          # 64.0%  (Net Income after margin deductions)
COSTS = {
    "Employee expense":    [382176.05, 389819.57, 397615.96],
    "Advertising & marketing": [91379.44, 93207.03, 95071.17],
    "Other opex":          [280819.93, 286436.33, 292165.06],
    "Shared common":       [203661.90, 207735.13, 211889.84],
    "Shared others":       [93040.68, 94901.50, 96799.53],
}
DEP_PNL = [15213.98, 0, 0]
FIN_PNL = [4878.21, 0, 0]
TOR = 0.12
# rent options (Scenario / Circle Mall Rent sheets). base, SC, MKT per sqft per lease year
OPTIONS = {
    "New · 246":       dict(label="New rent (P&L basis)", psf=[(190, 41, 15), (199.5, 41, 15), (209.48, 41, 15)]),
    "Earlier · 14%":   dict(label="Earlier turnover rent", tor_only=0.14),
    "A · 296":         dict(label="Landlord's first ask", psf=[(240, 41, 15), (252, 41, 15), (264.6, 42.02, 15)]),
    "B · 256":         dict(label="Option B", psf=[(200, 41, 15), (210, 41, 15), (220.5, 42.02, 15)]),
    "C · 236":         dict(label="Option C", psf=[(180, 41, 15), (189, 41, 15), (198.45, 42.02, 15)]),
    "D · 226":         dict(label="Option D", psf=[(170, 41, 15), (178.5, 41, 15), (187.43, 42.02, 15)]),
}
CAPEX = 2_000_000; CAPEX_LIFE = 5

def rent(opt, sales):
    out = []
    if "tor_only" in OPTIONS[opt]:           # earlier lease: all-in rent = 14% of sales
        t = OPTIONS[opt]["tor_only"]
        return [dict(base=t * s, sc=0.0, mkt=0.0, total=t * s, tor_binding=True, psf=t * s / SQFT) for s in sales]
    for (b, sc, mk), s in zip(OPTIONS[opt]["psf"], sales):
        base = max(b * SQFT, TOR * s)        # higher of fixed base rent or 12% turnover rent
        out.append(dict(base=base, sc=sc * SQFT, mkt=mk * SQFT, total=base + (sc + mk) * SQFT,
                        tor_binding=TOR * s > b * SQFT, psf=b + sc + mk))
    return out

def pnl(opt, sales, capex=False):
    r = rent(opt, sales)
    yrs = []
    for i, s in enumerate(sales):
        gm = s * GM_PCT; ni = s * NI_PCT
        costs = {k: v[i] for k, v in COSTS.items()}
        rt = r[i]["total"]
        tot = sum(costs.values()) + rt
        sp = ni - tot
        dep = DEP_PNL[i] + (CAPEX / CAPEX_LIFE if capex else 0)
        np_ = sp - dep - FIN_PNL[i]
        yrs.append(dict(sales=s, gm=gm, ni=ni, **costs, rent=rt, rent_base=r[i]["base"], rent_sc=r[i]["sc"],
                        rent_mkt=r[i]["mkt"], tor_binding=r[i]["tor_binding"], rent_psf=r[i]["psf"],
                        total_exp=tot, store_profit=sp, dep=dep, fin=FIN_PNL[i], net=np_,
                        rent_to_sales=rt / s, rent_to_ni=rt / ni, rent_to_gm=rt / gm))
    return yrs

out = {}
for scen in ("bear", "base", "bull"):
    sales = R["scenarios"][scen]
    out[scen] = {o: dict(s1=pnl(o, sales), s2=pnl(o, sales, capex=True)) for o in OPTIONS}

# breakeven: max gross rent/sqft (LY1) for (a) store profit = 0, (b) store profit = 10% of sales,
# (c) rent-to-sales 20%, under each scenario
be = {}
for scen in ("bear", "base", "bull"):
    s = R["scenarios"][scen][0]
    fixed = sum(v[0] for v in COSTS.values())
    ni = s * NI_PCT
    be[scen] = dict(sales=s, zero=(ni - fixed) / SQFT, ten=(ni - fixed - 0.10 * s) / SQFT,
                    capex_zero=(ni - fixed - CAPEX / CAPEX_LIFE - DEP_PNL[0]) / SQFT,
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

# last year (FY'25, calendar 2025) as reported in the 'P & L' sheet at the earlier rent,
# and the same year restated at the new AED 246/sq ft gross rent
FY25 = dict(sales=3635846.29, gm=2505247.92, ni=2235204.25, **{"Employee expense": 246033.86,
            "Advertising & marketing": 33418.94, "Other opex": 278611.63, "Shared common": 183849.07,
            "Shared others": 86106.41}, rent=509018.48, dep=259318.77, fin=0.0)
def restate(d, rent):
    d = dict(d, rent=rent)
    d["total_exp"] = sum(d[k] for k in COSTS) + rent
    d["store_profit"] = d["ni"] - d["total_exp"]; d["net"] = d["store_profit"] - d["dep"] - d["fin"]
    d["rent_psf"] = rent / SQFT
    d["rent_to_sales"] = rent / d["sales"]; d["rent_to_ni"] = rent / d["ni"]; d["rent_to_gm"] = rent / d["gm"]
    return d
LAST_YEAR = dict(earlier=restate(FY25, FY25["rent"]), new=restate(FY25, 246 * SQFT))

# 3-year totals + simple NPV @10% of store-profit cash flows (capex at t0 for scenario 2)
def npv(cfs, r=0.10): return sum(c / (1 + r) ** (i + 1) for i, c in enumerate(cfs))
summary = {}
for scen in out:
    summary[scen] = {}
    for o, d in out[scen].items():
        sp = [y["store_profit"] for y in d["s1"]]
        summary[scen][o] = dict(sp3=sum(sp), net3_s1=sum(y["net"] for y in d["s1"]), net3_s2=sum(y["net"] for y in d["s2"]),
                                npv_s1=npv(sp), npv_s2=npv(sp) - CAPEX,
                                rts_avg=sum(y["rent"] for y in d["s1"]) / sum(y["sales"] for y in d["s1"]))
R.update(pnl=out, breakeven=be, bench=bench, summary=summary,
         options={k: v["label"] for k, v in OPTIONS.items()},
         option_psf={k: [a + b + c for a, b, c in v["psf"]] if "psf" in v else None for k, v in OPTIONS.items()},
         last_year=LAST_YEAR,
         consts=dict(sqft=SQFT, gm_pct=GM_PCT, ni_pct=NI_PCT, tor=TOR, capex=CAPEX, capex_life=CAPEX_LIFE))
json.dump(R, open("results.json", "w"), indent=1)
for scen in out:
    print("==", scen)
    for o, d in out[scen].items():
        y = d["s1"]
        print(f"{o:14s} rent {[round(v['rent']/1e3) for v in y]} RtS {[round(v['rent_to_sales']*100,1) for v in y]} RtNI {[round(v['rent_to_ni']*100,1) for v in y]} SP {[round(v['store_profit']/1e3) for v in y]} NP-s2 {[round(v['net']/1e3) for v in d['s2']]} npv1 {summary[scen][o]['npv_s1']/1e3:.0f} npv2 {summary[scen][o]['npv_s2']/1e3:.0f}")
print(be)
for b in bench: print(b["store"], round(b["sales_psf"]), round(b["rts"]*100,1))
