#!/usr/bin/env python3
"""Real DLD sales for the ARKO market pages: monthly volume and median price per sqft by area,
plus the most recent single-unit flat sales per area.
usage: python3 -I tools/dld-market.py Transactions.csv data/dld-market.json"""
import csv, json, sys, statistics as st, collections
from datetime import datetime
AREAS = {'Dubai Marina': 'DUBAI MARINA', 'Downtown Dubai': 'BURJ KHALIFA', 'Palm Jumeirah': 'PALM JUMEIRAH', 'Dubai Hills Estate': 'DUBAI HILLS',
         'Business Bay': 'BUSINESS BAY', 'Jumeirah Village Circle': 'JUMEIRAH VILLAGE CIRCLE', 'Dubai Creek Harbour': 'DUBAI CREEK HARBOUR',
         'MBR City': 'MEYDAN ONE', 'Al Furjan': 'AL FURJAN', 'Jumeirah Lake Towers': 'JUMEIRAH LAKES TOWERS'}
REV = {v: k for k, v in AREAS.items()}
tx = collections.defaultdict(list)
with open(sys.argv[1], newline='', encoding='utf-8-sig') as fh:
    for r in csv.DictReader(fh):
        if r['GROUP_EN'] == 'Sales' and r['USAGE_EN'] == 'Residential' and r['AREA_EN'].upper() in REV: tx[r['TRANSACTION_NUMBER']].append(r)
rows = []
for rs in tx.values():
    if len(rs) != 1 or rs[0]['PROP_SB_TYPE_EN'] != 'Flat': continue
    r = rs[0]
    try:
        v, a = float(r['TRANS_VALUE']), float(r['ACTUAL_AREA']) * 10.7639; d = datetime.strptime(r['INSTANCE_DATE'][:10], '%d-%m-%Y')
    except ValueError: continue
    if a <= 0 or not (300 < v / a < 40000): continue
    rows.append({'area': REV[r['AREA_EN'].upper()], 'd': d.strftime('%Y-%m-%d'), 'project': (r['PROJECT_EN'] or r['MASTER_PROJECT_EN'] or '').title()[:48],
                 'rooms': r['ROOMS_EN'].replace('B/R', 'bed'), 'sqft': round(a), 'price': round(v), 'ppsf': round(v / a), 'off': 'off' in r['IS_OFFPLAN_EN'].lower()})
out = {'source': 'Dubai Land Department open data', 'from': min(x['d'] for x in rows), 'asOf': max(x['d'] for x in rows), 'areas': {}}
for area in AREAS:
    m = [x for x in rows if x['area'] == area]
    by = collections.defaultdict(list)
    for x in m: by[x['d'][:7]].append(x)
    monthly = [{'m': k, 'n': len(v), 'med': round(st.median(y['ppsf'] for y in v)), 'off': sum(y['off'] for y in v)} for k, v in sorted(by.items()) if len(v) >= 10]
    recent = [{k: v for k, v in x.items() if k != 'area'} for x in sorted(m, key=lambda x: x['d'], reverse=True)[:30]]
    out['areas'][area] = {'monthly': monthly, 'recent': recent}
json.dump(out, open(sys.argv[2], 'w'), separators=(',', ':'))
print(len(rows), 'rows;', {k: len(v['monthly']) for k, v in out['areas'].items()})
