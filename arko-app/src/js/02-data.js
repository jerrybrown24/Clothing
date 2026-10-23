/* ---------- DEMO LISTINGS: fictional projects and developers in real Dubai communities.
   Locations, landmarks and area market data (DLD) are real; prices are set close to the DLD off-plan median. ---------- */
const LISTINGS = [
  { id: 'solace-marina', name: 'Solace Marina', dev: 'Tidewater Developments', area: 'Dubai Marina', lat: 25.0838, lng: 55.1417, kind: 'tower', set: 'water', mood: 'dusk', seed: 11, floors: 48, units: 356, sold: 62, ho: 'Q4 2028', hm: 25, plan: '60/40', ppsf: 2590, svc: 18, yld: 6.4,
    types: [['1 bedroom', 790, 1], ['2 bedrooms', 1240, 2], ['3 bedrooms', 1830, 3]], rera: 'DEMO-2101',
    amen: ['Infinity pool on level 47', 'Marina walk access', 'Residents gym', 'Co-working lounge'], blurb: 'A slim glass tower on the marina edge with full-height windows and a sky pool.' },
  { id: 'canal-crest', name: 'Canal Crest', dev: 'Aurum Built', area: 'Business Bay', lat: 25.1849, lng: 55.2701, kind: 'tower', set: 'water', mood: 'day', seed: 23, floors: 42, units: 410, sold: 48, ho: 'Q2 2029', hm: 31, plan: '70/30', ppsf: 2560, svc: 17, yld: 6.8,
    types: [['Studio', 430, 0], ['1 bedroom', 760, 1], ['2 bedrooms', 1150, 2]], rera: 'DEMO-2114',
    amen: ['Canal-front promenade', 'Rooftop pool', 'Smart-home fit-out', 'Valet parking'], blurb: 'Compact, well-planned homes on the Dubai Water Canal, minutes from Downtown.' },
  { id: 'circle-gardens', name: 'Circle Gardens', dev: 'Verdant Group', area: 'Jumeirah Village Circle', lat: 25.0590, lng: 55.2085, kind: 'lowrise', set: 'park', mood: 'day', seed: 37, floors: 9, blocks: 4, units: 220, sold: 71, ho: 'Q4 2027', hm: 13, plan: '50/50', ppsf: 1495, svc: 13, yld: 7.6,
    types: [['Studio', 410, 0], ['1 bedroom', 720, 1], ['2 bedrooms', 1120, 2]], rera: 'DEMO-1988',
    amen: ['Courtyard pool', 'Kids play park', 'Jogging loop', 'Retail podium'], blurb: 'Garden blocks around a landscaped courtyard, the entry price of this collection.' },
  { id: 'harbour-lumen', name: 'Harbour Lumen', dev: 'Aurum Built', area: 'Dubai Creek Harbour', lat: 25.2003, lng: 55.3472, kind: 'twin', set: 'water', mood: 'dawn', seed: 52, floors: 45, units: 480, sold: 39, ho: 'Q3 2029', hm: 34, plan: '60/40', ppsf: 2410, svc: 16, yld: 6.1,
    types: [['1 bedroom', 780, 1], ['2 bedrooms', 1260, 2], ['3 bedrooms', 1790, 3]], rera: 'DEMO-2140',
    amen: ['Creek-view podium', 'Waterfront retail', 'Lap pool', 'Kids club'], blurb: 'Twin towers facing the creek and the Downtown skyline, next to the creek park.' },
  { id: 'hills-arbor', name: 'Hills Arbor', dev: 'Verdant Group', area: 'Dubai Hills Estate', lat: 25.1072, lng: 55.2468, kind: 'lowrise', set: 'park', mood: 'dawn', seed: 64, floors: 12, blocks: 3, units: 260, sold: 58, ho: 'Q2 2028', hm: 19, plan: '80/20', ppsf: 2380, svc: 15, yld: 5.8,
    types: [['1 bedroom', 760, 1], ['2 bedrooms', 1180, 2], ['3 bedrooms', 1690, 3]], rera: 'DEMO-2066',
    amen: ['Park-facing terraces', 'Walk to Dubai Hills Mall', 'Golf course views', 'Family pool'], blurb: 'Mid-rise blocks on the central park, a short walk from the mall and schools.' },
  { id: 'meydan-lagoon', name: 'Meydan Lagoon Residences', dev: 'Sandline Developments', area: 'MBR City', lat: 25.1590, lng: 55.3012, kind: 'twin', set: 'park', mood: 'day', seed: 71, floors: 32, units: 340, sold: 44, ho: 'Q1 2029', hm: 28, plan: '60/40', ppsf: 2190, svc: 14, yld: 6.0,
    types: [['1 bedroom', 760, 1], ['2 bedrooms', 1250, 2], ['3 bedrooms', 1880, 3]], rera: 'DEMO-2088',
    amen: ['Crystal lagoon beach', 'Cycling track', 'Sports club', 'School drop-off'], blurb: 'Twin residences beside a swimmable lagoon, between Downtown and Meydan.' },
  { id: 'furjan-grove', name: 'Furjan Grove', dev: 'Aurum Built', area: 'Al Furjan', lat: 25.0262, lng: 55.1488, kind: 'lowrise', set: 'park', mood: 'day', seed: 88, floors: 7, blocks: 5, units: 180, sold: 76, ho: 'Q3 2027', hm: 10, plan: '70/30', ppsf: 1460, svc: 12, yld: 7.2,
    types: [['1 bedroom', 770, 1], ['2 bedrooms', 1190, 2], ['3 bedrooms', 1720, 3]], rera: 'DEMO-1954',
    amen: ['Metro at the door', 'Courtyard gardens', 'Community retail', 'Covered parking'], blurb: 'Courtyard blocks next to Al Furjan metro, with the earliest handover here.' },
  { id: 'palm-azure', name: 'Palm Azure Terraces', dev: 'Corniche & Co', area: 'Palm Jumeirah', lat: 25.1124, lng: 55.1332, kind: 'lowrise', set: 'water', mood: 'day', seed: 95, floors: 10, blocks: 2, units: 96, sold: 67, ho: 'Q4 2028', hm: 25, plan: '50/50', ppsf: 5450, svc: 26, yld: 4.9,
    types: [['2 bedrooms', 1580, 2], ['3 bedrooms', 2350, 3], ['4 bedrooms', 3400, 4]], rera: 'DEMO-2122',
    amen: ['Private beach', 'Marina club', 'Spa and hammam', 'Sea-view terraces'], blurb: 'Low-rise terraces stepping down to a private beach on the Palm trunk.' },
  { id: 'boulevard-spire', name: 'Boulevard Spire', dev: 'Halo Properties', area: 'Downtown Dubai', lat: 25.1932, lng: 55.2766, kind: 'tower', set: 'park', mood: 'dusk', seed: 104, floors: 56, units: 390, sold: 53, ho: 'Q1 2030', hm: 40, plan: '60/40', ppsf: 3290, svc: 21, yld: 5.6,
    types: [['1 bedroom', 820, 1], ['2 bedrooms', 1330, 2], ['3 bedrooms', 2050, 3]], rera: 'DEMO-2163',
    amen: ['Burj Khalifa views', 'Boulevard retail', 'Sky lounge', 'Concierge'], blurb: 'A landmark tower on the boulevard with views of the Burj Khalifa and fountain.' }
];
LISTINGS.forEach(L => { L.from = Math.round(L.types[0][1] * L.ppsf / 1e4) * 1e4; L.hy = +L.ho.slice(-4); L.type = 'off'; });

/* Real places, approximate coordinates (for the prototype). A live version would use a maps API. */
const PLACES = [
  ['metro', 'DMCC Metro', 25.0705, 55.1387], ['metro', 'Sobha Realty Metro', 25.0806, 55.1475], ['metro', 'Internet City Metro', 25.1020, 55.1734], ['metro', 'Mall of the Emirates Metro', 25.1212, 55.2003],
  ['metro', 'Business Bay Metro', 25.1913, 55.2603], ['metro', 'Burj Khalifa / Dubai Mall Metro', 25.2014, 55.2694], ['metro', 'Creek Metro', 25.2190, 55.3392], ['metro', 'Al Furjan Metro', 25.0290, 55.1390],
  ['metro', 'Ibn Battuta Metro', 25.0447, 55.1176], ['metro', 'Al Safa Metro', 25.1590, 55.2330],
  ['mall', 'Dubai Mall', 25.1972, 55.2796], ['mall', 'Mall of the Emirates', 25.1181, 55.2006], ['mall', 'Dubai Marina Mall', 25.0760, 55.1405], ['mall', 'Dubai Hills Mall', 25.1018, 55.2393],
  ['mall', 'Ibn Battuta Mall', 25.0443, 55.1172], ['mall', 'Nakheel Mall', 25.1125, 55.1390], ['mall', 'Circle Mall', 25.0600, 55.2130], ['mall', 'Dubai Festival City Mall', 25.2220, 55.3530],
  ['beach', 'JBR Beach', 25.0780, 55.1310], ['beach', 'Kite Beach', 25.1580, 55.1940], ['beach', 'Palm West Beach', 25.1060, 55.1290], ['beach', 'La Mer Beach', 25.2270, 55.2530],
  ['hospital', 'Mediclinic Parkview', 25.0670, 55.2440], ["hospital", "King's College Hospital", 25.1050, 55.2410], ['hospital', 'Saudi German Hospital', 25.0960, 55.1870], ['hospital', 'Mediclinic City Hospital', 25.2300, 55.3220], ['hospital', 'Emirates Hospital Jumeirah', 25.1690, 55.2240],
  ['school', 'GEMS Wellington International', 25.1035, 55.1780], ['school', 'Nord Anglia International School', 25.0690, 55.2270], ['school', 'Dubai British School Jumeirah Park', 25.0430, 55.1600], ['school', 'GEMS Wellington Academy Al Khail', 25.1360, 55.2550], ['school', 'Jumeira Baccalaureate School', 25.1880, 55.2470],
  ['air', 'DXB Airport', 25.2532, 55.3657], ['city', 'Burj Khalifa', 25.1972, 55.2744]
].map(([cat, name, lat, lng]) => ({ cat, name, lat, lng }));
const CAT = { metro: ['Metro', 'metro'], mall: ['Mall', 'mall'], beach: ['Beach', 'beach'], school: ['School', 'school'], hospital: ['Hospital', 'hospital'], air: ['Airport', 'plane'], city: ['Downtown', 'city'] };

const km = (a, b) => { const r = Math.PI / 180, d1 = (b.lat - a.lat) * r, d2 = (b.lng - a.lng) * r, x = Math.sin(d1 / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(d2 / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
const bearing = (a, b) => Math.atan2((b.lng - a.lng) * Math.cos(a.lat * Math.PI / 180), b.lat - a.lat);
/* travel time estimate: walk under 1.2 km, else drive with a road factor */
const travel = d => d < 1.2 ? { mode: 'walk', min: Math.max(2, Math.round(d * 1.3 / 5 * 60)) } : { mode: 'drive', min: Math.max(3, Math.round(d * 1.35 / 38 * 60)) };
function nearby(L) {
  const out = {};
  PLACES.forEach(p => { const d = km(L, p); if (!out[p.cat] || d < out[p.cat].d) out[p.cat] = { ...p, d, t: travel(d), b: bearing(L, p) }; });
  return Object.keys(CAT).map(c => out[c]).filter(Boolean);
}

/* payment plans: [label, month after booking (scaled to handover), % of price]; post = after handover */
const PLANS = {
  '60/40': [['Booking', 0, 10], ['SPA signing', 1, 10], ['During construction', .35, 10], ['During construction', .6, 10], ['During construction', .8, 10], ['During construction', .95, 10], ['On handover', 1, 40]],
  '70/30': [['Booking', 0, 10], ['SPA signing', 1, 10], ['During construction', .25, 10], ['During construction', .45, 10], ['During construction', .6, 10], ['During construction', .75, 10], ['During construction', .9, 10], ['On handover', 1, 30]],
  '50/50': [['Booking', 0, 10], ['SPA signing', 1, 10], ['During construction', .4, 10], ['During construction', .7, 10], ['During construction', .9, 10], ['On handover', 1, 10], ['After handover', 1.25, 20], ['After handover', 1.5, 20]],
  '80/20': [['Booking', 0, 20], ['SPA signing', 1, 10], ['During construction', .3, 10], ['During construction', .5, 10], ['During construction', .7, 15], ['During construction', .9, 15], ['On handover', 1, 20]]
};
function schedule(L, price) {
  return PLANS[L.plan].map(([n, f, pc]) => ({ n, m: f === 1 && n === 'SPA signing' ? 1 : Math.round(f * L.hm), pc, amt: price * pc / 100 }));
}
const fees = price => ({ dld: price * .04, trustee: 4000 * 1.05, admin: 580 });
const unitPrice = (L, t) => Math.round(L.types[t][1] * L.ppsf * (1 + t * .02) / 5000) * 5000;

/* DLD area data, injected by the server (or baked into the preview) */
const DLD = (() => { try { const d = JSON.parse(document.getElementById('dld').textContent); return d && d.areas ? d : null; } catch (e) { return null; } })();
const dldOf = L => DLD && DLD.areas[L.area];

/* matching: 3-question start */
function match(L, a) {
  if (!a) return null;
  let s = 60;
  if (a.goal === 'invest') s += (L.yld - 6) * 9 + (nearby(L).find(p => p.cat === 'metro').d < 1.5 ? 6 : 0);
  if (a.goal === 'live') s += (L.set === 'park' ? 8 : 4) + (L.types.some(t => t[2] >= 2) ? 4 : 0) + (nearby(L).find(p => p.cat === 'school').d < 3 ? 6 : 0);
  if (a.bud) s += L.from <= a.bud ? 10 : -Math.min(45, (L.from - a.bud) / a.bud * 80);
  if (a.when) s += L.hy <= a.when ? 10 : -Math.min(20, (L.hy - a.when) * 9);
  const d = dldOf(L); if (d && d.offMed) s += clamp((d.offMed - L.ppsf) / d.offMed * 60, -6, 6);
  return clamp(Math.round(s), 30, 98);
}
/* value proposition, derived from the data above */
function whyThis(L) {
  const out = [], d = dldOf(L), n = nearby(L), metro = n.find(p => p.cat === 'metro');
  if (d && d.offMed) { const v = (L.ppsf / d.offMed - 1) * 100; out.push(v <= 0 ? `${Math.abs(v).toFixed(0)}% below the area's off-plan median price per sqft (DLD)` : `${v.toFixed(0)}% above the area off-plan median, for ${L.amen[0].toLowerCase()}`); }
  out.push(`${metro.t.min} min ${metro.t.mode} to ${metro.name}`);
  out.push(`${L.plan} payment plan, handover ${L.ho}`);
  if (L.yld >= 6.5) out.push(`About ${L.yld}% gross rental yield (estimate)`);
  return out.slice(0, 4);
}
const byId = id => LISTINGS.find(L => L.id === id);
