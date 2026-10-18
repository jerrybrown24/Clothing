#!/usr/bin/env python3
"""Turn the DLD open-data Transactions CSV into per-area stats for ARKO.

usage: python3 dld-ingest.py Transactions.csv dld-area-stats.json [Rent_Contracts.csv]

Download the CSV yourself from dubailand.gov.ae/en/open-data/real-estate-data (or Dubai Pulse,
dataset "DLD Transactions"). Column names differ between the two, so each field has aliases.
Nothing here is invented: an area with fewer than MIN_N sales in a window gets no value for it.
"""
import csv, json, sys, statistics as st
from datetime import datetime, timedelta

SQM_TO_SQFT = 10.7639
MIN_N = 15
ALIASES = {
    'date': ['Transaction Date', 'INSTANCE_DATE', 'instance_date'],
    'type': ['Transaction Type', 'GROUP_EN', 'TRANS_GROUP_EN', 'trans_group_en'],
    'reg': ['Registration type', 'PROCEDURE_EN', 'reg_type_en'],
    'usage': ['Usage', 'USAGE_EN', 'property_usage_en'],
    'area': ['Area', 'AREA_EN', 'area_name_en'],
    'ptype': ['Property Type', 'PROP_TYPE_EN', 'property_type_en'],
    'amount': ['Amount', 'TRANS_VALUE', 'actual_worth'],
    'size': ['Property Size (sq.m)', 'ACTUAL_AREA', 'procedure_area', 'Property Size'],
}
# ARKO area name -> DLD area name. Verify each against the "Area" values in your file.
AREA_MAP = {
    'Dubai Marina': 'Marsa Dubai', 'Downtown Dubai': 'Burj Khalifa', 'Palm Jumeirah': 'Palm Jumeirah',
    'Dubai Hills Estate': 'Hadaeq Sheikh Mohammed Bin Rashid', 'Business Bay': 'Business Bay',
    'Jumeirah Village Circle': 'Jumeirah Village Circle', 'Dubai Creek Harbour': 'Dubai Creek Harbour',
    'MBR City': 'Meydan One', 'Al Furjan': 'Al Furjan', 'Jumeirah Lake Towers': 'Jumeirah Lakes Towers',
    'The Springs': 'Al Thanyah Fifth',
}

def pick(header, key):
    for a in ALIASES[key]:
        if a in header: return a
    raise SystemExit(f'column for {key!r} not found; header was {header}')

def parse_date(s):
    for f in ('%d-%m-%Y', '%Y-%m-%d', '%d/%m/%Y', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S'):
        try: return datetime.strptime(s.strip()[:len(datetime.now().strftime(f))], f)
        except ValueError: pass
    return None

def main(src, out):
    rows = []
    with open(src, newline='', encoding='utf-8-sig') as fh:
        rd = csv.DictReader(fh); c = {k: pick(rd.fieldnames, k) for k in ALIASES}
        for r in rd:
            if 'sale' not in r[c['type']].lower(): continue
            if 'resid' not in r[c['usage']].lower() or 'unit' not in r[c['ptype']].lower(): continue
            try: amt, sz = float(r[c['amount']]), float(r[c['size']])
            except ValueError: continue
            d = parse_date(r[c['date']])
            if d and amt > 0 and sz > 0: rows.append((r[c['area']].strip(), d, amt / (sz * SQM_TO_SQFT), 'off' in r[c['reg']].lower()))
    if not rows: raise SystemExit('no usable sales rows')
    end = max(r[1] for r in rows); win = lambda a, b: (end - timedelta(days=b), end - timedelta(days=a))
    res = {}
    for ours, theirs in AREA_MAP.items():
        mine = [r for r in rows if r[0].lower() == theirs.lower()]
        def med(a, b):
            lo, hi = win(a, b); v = [r[2] for r in mine if lo < r[1] <= hi]
            return st.median(v) if len(v) >= MIN_N else None
        m12, p12, m36 = med(0, 365), med(365, 730), med(1095, 1460)
        n12 = sum(1 for r in mine if r[1] > end - timedelta(days=365))
        if m12 is None: continue
        res[ours] = {'dldArea': theirs, 'medPpsf': round(m12), 'n12': n12,
                     'g1': round((m12 / p12 - 1) * 100, 1) if p12 else None,
                     'g3': round((m12 / m36 - 1) * 100) if m36 else None,
                     'offplanShare': round(sum(1 for r in mine if r[1] > end - timedelta(days=365) and r[3]) / max(n12, 1) * 100)}
    json.dump({'source': 'Dubai Land Department open data', 'asOf': end.strftime('%Y-%m-%d'), 'rows': len(rows), 'areas': res}, open(out, 'w'), indent=1)
    print(f'{len(rows)} sales rows to {end:%Y-%m-%d}; {len(res)}/{len(AREA_MAP)} areas written')

if __name__ == '__main__':
    if len(sys.argv) < 3: raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
