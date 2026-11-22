#!/usr/bin/env python3
"""ARKO property price index from DLD open-data sales (data/dld-market.json).

Mix-adjusted: each month's city level is the area median AED/sqft weighted by
each area's share of all sales in the period (fixed weights), so a month with
more Palm sales doesn't look like a price jump. First month = 100.
Usage: python3 tools/dld-index.py  -> writes data/dld-index.json
"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
mk = json.loads((root / "data/dld-market.json").read_text())
areas = mk["areas"]
months = sorted({r["m"] for a in areas.values() for r in a["monthly"]})
tot = {k: sum(r["n"] for r in a["monthly"]) for k, a in areas.items()}
W = sum(tot.values())
med = {k: {r["m"]: r for r in a["monthly"]} for k, a in areas.items()}

def level(m):
    num = den = 0
    for k in areas:
        r = med[k].get(m)
        if r and r["med"]:
            num += tot[k] / W * r["med"]; den += tot[k] / W
    return num / den if den else None

lv = {m: level(m) for m in months}
base = lv[months[0]]
city = [{"m": m, "index": round(lv[m] / base * 100, 1), "ppsf": round(lv[m]),
         "sales": sum(med[k][m]["n"] for k in areas if m in med[k])} for m in months]
per = {}
for k in areas:
    ms = [m for m in months if m in med[k]]
    b = med[k][ms[0]]["med"]
    per[k] = [{"m": m, "index": round(med[k][m]["med"] / b * 100, 1),
               "ppsf": med[k][m]["med"], "sales": med[k][m]["n"]} for m in ms]
last_full = city[-2] if mk["asOf"][8:] < "25" else city[-1]   # last month may be partial
out = {"source": mk["source"], "method": "fixed-weight median AED/sqft, base " + months[0] + " = 100",
       "asOf": mk["asOf"], "partialLastMonth": city[-1]["m"] if last_full is not city[-1] else None,
       "city": city, "areas": per}
(root / "data/dld-index.json").write_text(json.dumps(out, indent=1))
print(f"{'month':8} {'index':>6} {'AED/sqft':>9} {'sales':>6}")
for r in city: print(f"{r['m']:8} {r['index']:6} {r['ppsf']:9,} {r['sales']:6,}")
f, l = city[0], last_full
print(f"\nJan -> {l['m']}: {l['index']-100:+.1f}%  (last month {city[-1]['m']} is partial to {mk['asOf']})")
print(f"\n{'area':26} {'Jan':>6} {l['m']:>8} {'change':>7}")
for k, s in sorted(per.items(), key=lambda kv: -next(r['index'] for r in kv[1] if r['m']==l['m'])):
    e = next(r for r in s if r['m'] == l['m'])
    print(f"{k:26} {s[0]['ppsf']:6,} {e['ppsf']:8,} {e['index']-100:+6.1f}%")
