#!/usr/bin/env python3
"""Turn DLD open-data files into the stats ARKO shows.

usage: python3 dld-ingest.py Transactions.csv dld-area-stats.json [residential_sale_index.csv]

Transactions.csv columns (DLD open data): INSTANCE_DATE, GROUP_EN, PROP_SB_TYPE_EN, AREA_EN,
TRANS_VALUE, ACTUAL_AREA (sq m), IS_OFFPLAN_EN, TRANSACTION_NUMBER.
Rules, so the numbers can be defended:
 - only GROUP_EN == Sales, residential Flat units;
 - only transactions with exactly one unit row (a multi-unit deal carries one total value);
 - price per sqft outside 300..40000 is dropped as a data error;
 - an area needs MIN_N sales for a median.
No area growth figure is produced: a few months of sales mix off-plan and ready, big and small units, so a
median that moves says little about price change. Growth needs 12+ months of like-for-like data or the DLD index.
"""
import csv, json, sys, collections, statistics as st
from datetime import datetime

SQM_TO_SQFT = 10.7639
MIN_N = 30
# ARKO area -> DLD AREA_EN (upper case). Confirm with someone who knows the districts.
AREA_MAP = {
    'Dubai Marina': 'DUBAI MARINA', 'Downtown Dubai': 'BURJ KHALIFA', 'Palm Jumeirah': 'PALM JUMEIRAH',
    'Dubai Hills Estate': 'DUBAI HILLS', 'Business Bay': 'BUSINESS BAY',
    'Jumeirah Village Circle': 'JUMEIRAH VILLAGE CIRCLE', 'Dubai Creek Harbour': 'DUBAI CREEK HARBOUR',
    'MBR City': 'MEYDAN ONE', 'Al Furjan': 'AL FURJAN', 'Jumeirah Lake Towers': 'JUMEIRAH LAKES TOWERS',
}  # The Springs is villas, so it has no flat figure.

def pdate(s): return datetime.strptime(s.strip()[:10], '%d-%m-%Y')

def area_stats(path):
    tx = collections.defaultdict(list)
    with open(path, newline='', encoding='utf-8-sig') as fh:
        for r in csv.DictReader(fh):
            if r['GROUP_EN'] == 'Sales' and r['USAGE_EN'] == 'Residential': tx[r['TRANSACTION_NUMBER']].append(r)
    rows, lo, hi = [], None, None
    for rs in tx.values():
        if len(rs) != 1 or rs[0]['PROP_SB_TYPE_EN'] != 'Flat': continue
        r = rs[0]
        try: p = float(r['TRANS_VALUE']) / (float(r['ACTUAL_AREA']) * SQM_TO_SQFT); d = pdate(r['INSTANCE_DATE'])
        except (ValueError, ZeroDivisionError): continue
        if 300 < p < 40000:
            rows.append((r['AREA_EN'].upper(), d, p, 'off' in r['IS_OFFPLAN_EN'].lower()))
            lo, hi = min(lo or d, d), max(hi or d, d)
    if not rows: raise SystemExit('no usable sales rows')
    out = {}
    for ours, theirs in AREA_MAP.items():
        m = [r for r in rows if r[0] == theirs]
        if len(m) < MIN_N: continue
        off = [r[2] for r in m if r[3]]; rdy = [r[2] for r in m if not r[3]]
        out[ours] = {'dldArea': theirs, 'n': len(m), 'medPpsf': round(st.median(r[2] for r in m)),
                     'offMed': round(st.median(off)) if len(off) >= MIN_N else None,
                     'readyMed': round(st.median(rdy)) if len(rdy) >= MIN_N else None,
                     'offShare': round(len(off) / len(m) * 100)}
    return out, lo, hi, len(rows)

def city_index(path):
    rows = sorted(csv.DictReader(open(path, newline='', encoding='utf-8-sig')), key=lambda r: r['first_date_of_month'])
    rows = [r for r in rows if r['flat_monthly_price_index']]
    last = rows[-1]; by = {r['first_date_of_month']: float(r['flat_monthly_price_index']) for r in rows}
    y, m = int(last['first_date_of_month'][:4]), int(last['first_date_of_month'][5:7])
    def back(n):
        yy, mm = y - (n // 12), m
        return by.get(f'{yy}-{mm:02d}-01')
    now = float(last['flat_monthly_price_index'])
    g = lambda n: round((now / back(n) - 1) * 100, 1) if back(n) else None
    return {'asOf': last['first_date_of_month'][:7], 'flat12m': g(12), 'flat3y': g(36), 'note': 'Dubai-wide flat price index, DLD'}

if __name__ == '__main__':
    if len(sys.argv) < 3: raise SystemExit(__doc__)
    areas, lo, hi, n = area_stats(sys.argv[1])
    res = {'source': 'Dubai Land Department open data', 'from': lo.strftime('%Y-%m-%d'), 'asOf': hi.strftime('%Y-%m-%d'), 'rows': n, 'areas': areas}
    if len(sys.argv) > 3: res['city'] = city_index(sys.argv[3])
    json.dump(res, open(sys.argv[2], 'w'), indent=1)
    print(f'{n} single-unit flat sales {res["from"]} to {res["asOf"]}; {len(areas)}/{len(AREA_MAP)} areas', res.get('city'))
