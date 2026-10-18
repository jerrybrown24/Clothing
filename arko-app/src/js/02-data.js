/* ---------- DUMMY DATA: fictional projects and developers; real Dubai communities only ---------- */
const PROJ = [
  { id: 'azure-reach', name: 'Azure Reach', dev: 'Tidewater Developments', area: 'Dubai Marina', mood: 'dusk', kind: 'tower', set: 'water', seed: 11,
    types: [['Studio', 430], ['1 BR', 760], ['2 BR', 1180], ['3 BR', 1750]], ppsf: 2650, med: 2480, yld: 6.4, ot: 92, plan: '60/40', ho: 'Q3 2029', hy: 2029, hm: 34, floors: 44, units: 312, sold: 64, metro: '6 min walk to metro', tags: ['Waterfront', 'Marina views'], rera: 'DEMO-2041', pc: 12,
    blurb: 'A slender glass tower on the Marina promenade, with sky pool, co-working lounge and direct walkway to the beach.' },
  { id: 'lumen-creek', name: 'Lumen Creek', dev: 'Aurum Built', area: 'Dubai Creek Harbour', mood: 'dawn', kind: 'twin', set: 'water', seed: 23,
    types: [['1 BR', 780], ['2 BR', 1240], ['3 BR', 1820]], ppsf: 2890, med: 2710, yld: 6.1, ot: 95, plan: '70/30', ho: 'Q2 2029', hy: 2029, hm: 32, floors: 52, units: 410, sold: 58, metro: 'Shuttle to metro', tags: ['Waterfront', 'Skyline views'], rera: 'DEMO-2077', pc: 9,
    blurb: 'Twin towers facing the creek and the downtown skyline, with a landscaped podium and a waterfront retail strip.' },
  { id: 'palm-meridian', name: 'Palm Meridian', dev: 'Corniche & Co', area: 'Palm Jumeirah', mood: 'day', kind: 'lowrise', set: 'water', seed: 37,
    types: [['2 BR', 1550], ['3 BR', 2300], ['4 BR', 3300]], ppsf: 5200, med: 4850, yld: 4.9, ot: 89, plan: '50/50', ho: 'Q4 2029', hy: 2029, hm: 35, floors: 14, units: 96, sold: 71, metro: 'Monorail 9 min', tags: ['Waterfront', 'Post-handover plan'], rera: 'DEMO-2113', pc: 6,
    blurb: 'Low-rise terraces stepping down to a private beach, with oversized balconies and a residents-only marina club.' },
  { id: 'hills-verdant', name: 'Hills Verdant', dev: 'Verdant Group', area: 'Dubai Hills Estate', mood: 'dawn', kind: 'lowrise', set: 'park', seed: 52,
    types: [['1 BR', 720], ['2 BR', 1160], ['3 BR', 1680]], ppsf: 2380, med: 2250, yld: 5.8, ot: 94, plan: '60/40', ho: 'Q4 2028', hy: 2028, hm: 26, floors: 9, units: 188, sold: 77, metro: 'Mall and park on your doorstep', tags: ['Family', 'Park views'], rera: 'DEMO-1988', pc: 31,
    blurb: 'Garden-terrace apartments around a green spine, close to the golf course, schools and the community mall.' },
  { id: 'halo-bay', name: 'Halo Bay', dev: 'Halo Properties', area: 'Business Bay', mood: 'dusk', kind: 'tower', set: 'water', seed: 64,
    types: [['Studio', 400], ['1 BR', 720], ['2 BR', 1120]], ppsf: 2410, med: 2300, yld: 6.7, ot: 90, plan: '60/40', ho: 'Q1 2029', hy: 2029, hm: 28, floors: 41, units: 270, sold: 52, metro: '4 min to metro', tags: ['Canal views', 'Highest rental demand'], rera: 'DEMO-2030', pc: 18,
    blurb: 'A canal-front tower a few minutes from Downtown, designed for investors with compact, efficient layouts.' },
  { id: 'jade-circle', name: 'Jade Circle', dev: 'Verdant Group', area: 'Jumeirah Village Circle', mood: 'day', kind: 'lowrise', set: 'park', seed: 71,
    types: [['Studio', 480], ['1 BR', 780], ['2 BR', 1240]], ppsf: 1480, med: 1390, yld: 7.4, ot: 88, plan: '50/50', ho: 'Q4 2028', hy: 2028, hm: 26, floors: 7, units: 150, sold: 83, metro: 'Community shuttle', tags: ['Post-handover plan', 'Entry price'], rera: 'DEMO-1952', pc: 36,
    blurb: 'Boutique low-rise with a central courtyard pool and an easy entry price for first-time investors.' },
  { id: 'meydan-gate', name: 'Meydan Gate', dev: 'Sandline Developments', area: 'MBR City', mood: 'dawn', kind: 'twin', set: 'park', seed: 88,
    types: [['1 BR', 760], ['2 BR', 1260], ['3 BR', 1900]], ppsf: 2260, med: 2120, yld: 5.9, ot: 93, plan: '70/30', ho: 'Q2 2029', hy: 2029, hm: 31, floors: 36, units: 340, sold: 47, metro: 'Shuttle to metro', tags: ['Lagoon access', 'Family'], rera: 'DEMO-2058', pc: 14,
    blurb: 'Twin residences beside a crystal lagoon, with a sports club, trails and a dedicated school drop-off.' },
  { id: 'furjan-courts', name: 'Furjan Courtyards', dev: 'Aurum Built', area: 'Al Furjan', mood: 'day', kind: 'lowrise', set: 'park', seed: 95,
    types: [['1 BR', 760], ['2 BR', 1180], ['3 BR', 1700]], ppsf: 1320, med: 1260, yld: 7.1, ot: 91, plan: '60/40', ho: 'Q1 2028', hy: 2028, hm: 17, floors: 6, units: 120, sold: 88, metro: '5 min to metro', tags: ['Nearly ready', 'Entry price'], rera: 'DEMO-1904', pc: 58,
    blurb: 'Courtyard-style blocks that are already more than half built, with the earliest handover of the collection.' }
];
PROJ.forEach(p => { p.type = 'off'; p.from = Math.round(p.types[0][1] * p.ppsf / 1e4) * 1e4; p.fromBeds = p.types[0][0] + ' to ' + p.types[p.types.length - 1][0]; });

const RES = [
  { id: 'r1', name: 'Marina Promenade', unit: '2 BR, floor 31', area: 'Dubai Marina', mood: 'day', kind: 'tower', set: 'water', seed: 141, size: 1280, price: 2650000, rent: 165000, svc: 16.5, beds: 2, view: 'Marina', tenant: true, built: 2016 },
  { id: 'r2', name: 'Downtown Terraces', unit: '1 BR, floor 18', area: 'Downtown Dubai', mood: 'dusk', kind: 'tower', set: 'water', seed: 152, size: 840, price: 2150000, rent: 125000, svc: 18.2, beds: 1, view: 'Fountain', tenant: false, built: 2014 },
  { id: 'r3', name: 'Springs Gardens', unit: '3 BR villa', area: 'The Springs', mood: 'dawn', kind: 'lowrise', set: 'park', seed: 163, size: 2450, price: 3350000, rent: 190000, svc: 7.5, beds: 3, view: 'Lake', tenant: true, built: 2008 },
  { id: 'r4', name: 'JLT Cluster Nine', unit: '1 BR, floor 22', area: 'Jumeirah Lake Towers', mood: 'day', kind: 'tower', set: 'water', seed: 174, size: 780, price: 1050000, rent: 78000, svc: 14.0, beds: 1, view: 'Lake', tenant: true, built: 2010 },
  { id: 'r5', name: 'Hills Park Residences', unit: '2 BR, floor 6', area: 'Dubai Hills Estate', mood: 'dawn', kind: 'lowrise', set: 'park', seed: 185, size: 1190, price: 2280000, rent: 138000, svc: 11.8, beds: 2, view: 'Park', tenant: false, built: 2021 },
  { id: 'r6', name: 'Bay Central', unit: 'Studio, floor 14', area: 'Business Bay', mood: 'dusk', kind: 'tower', set: 'water', seed: 196, size: 420, price: 780000, rent: 62000, svc: 15.4, beds: 0, view: 'Canal', tenant: true, built: 2018 }
];
RES.forEach(r => { r.type = 'res'; r.ppsf = Math.round(r.price / r.size); r.yld = +(r.rent / r.price * 100).toFixed(1); r.from = r.price; });

/* payment plans: [name, rawMonth (scaled to the project's handover), % of price] */
const PLANS = {
  '60/40': { pre: [['Booking', 0, 10], ['SPA signing', 1, 10], ['Instalment 1', 6, 10], ['Instalment 2', 12, 10], ['Instalment 3', 18, 10], ['Instalment 4', 24, 10]], hand: 40, post: [] },
  '70/30': { pre: [['Booking', 0, 10], ['SPA signing', 1, 10], ['Instalment 1', 6, 10], ['Instalment 2', 12, 10], ['Instalment 3', 18, 10], ['Instalment 4', 24, 10], ['Instalment 5', 27, 10]], hand: 30, post: [] },
  '50/50': { pre: [['Booking', 0, 10], ['SPA signing', 1, 10], ['Instalment 1', 6, 10], ['Instalment 2', 12, 10], ['Instalment 3', 18, 10]], hand: 10, post: [['Post-handover 1', 6, 10], ['Post-handover 2', 12, 10], ['Post-handover 3', 18, 10], ['Post-handover 4', 24, 10]] }
};
function schedule(p, key) {
  const pl = PLANS[key || p.plan], s = p.hm / 30, out = [];
  pl.pre.forEach(([n, m, pc]) => out.push({ n, m: Math.round(m * s), pc }));
  out.push({ n: 'On handover', m: p.hm, pc: pl.hand });
  pl.post.forEach(([n, m, pc]) => out.push({ n, m: p.hm + m, pc }));
  return out;
}
/* construction progress (percent) by month, scaled to handover */
function progressAt(p, m) {
  const s = p.hm / 30, pts = [[0, p.pc], [6 * s, 20 + p.pc * .3], [12 * s, 41], [18 * s, 62], [24 * s, 83], [p.hm, 100]];
  if (m >= p.hm) return 100;
  for (let i = 1; i < pts.length; i++) if (m <= pts[i][0]) { const [a, b] = [pts[i - 1], pts[i]]; return lerp(a[1], b[1], (m - a[0]) / Math.max(.001, b[0] - a[0])); }
  return 100;
}
/* units for a floor: deterministic */
function unitsFor(p, floor) {
  const r = R(hash(p.id + floor)), views = p.set === 'water' ? ['Sea', 'Marina', 'City', 'Skyline'] : ['Park', 'Garden', 'Lagoon', 'City'], out = [];
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const t = p.types[Math.floor(r() * p.types.length)], size = Math.round(t[1] * (.94 + r() * .14));
    const price = Math.round(size * p.ppsf * (1 + floor * .0045) / 5e3) * 5e3, q = r();
    out.push({ no: floor * 100 + i + 1, type: t[0], size, view: views[Math.floor(r() * views.length)], price, st: q < .2 ? 'sold' : q < .32 ? 'held' : 'avail' });
  }
  return out;
}
const AREAS = [...new Set([...PROJ, ...RES].map(x => x.area))].sort();
const byId = id => PROJ.find(p => p.id === id) || RES.find(p => p.id === id);
