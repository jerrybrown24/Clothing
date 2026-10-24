// Builds data/catalog.json: the demo projects and listings ARKO shows.
// Edit data/catalog.json directly to use real details; re-running this script overwrites it.
import fs from 'node:fs';
const dld = JSON.parse(fs.readFileSync(new URL('../data/dld-area-stats.json', import.meta.url))).areas;
function R(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const r5 = n => Math.round(n / 5000) * 5000;

const projects = [
  { id: 'solace-marina', name: 'Solace Marina', dev: 'Tidewater Developments', area: 'Dubai Marina', sub: 'Marina Promenade', lat: 25.0838, lng: 55.1417, kind: 'tower', set: 'water', mood: 'dusk', seed: 11, floors: 48, units: 356, sold: 62, launch: '2025-09', ho: 'Q4 2028', hm: 25, plan: '60/40', ppsf: 2590, svc: 18, yld: 6.4, types: [['1 bedroom', 790, 1], ['2 bedrooms', 1240, 2], ['3 bedrooms', 1830, 3]], rera: 'DEMO-2101', amen: ['Infinity pool on level 47', 'Marina walk access', 'Residents gym', 'Co-working lounge', 'Concierge', 'Covered parking'], blurb: 'A slim glass tower on the marina edge with full-height windows and a sky pool.' },
  { id: 'canal-crest', name: 'Canal Crest', dev: 'Aurum Built', area: 'Business Bay', sub: 'Marasi Drive', lat: 25.1849, lng: 55.2701, kind: 'tower', set: 'water', mood: 'day', seed: 23, floors: 42, units: 410, sold: 48, launch: '2026-02', ho: 'Q2 2029', hm: 31, plan: '70/30', ppsf: 2560, svc: 17, yld: 6.8, types: [['Studio', 430, 0], ['1 bedroom', 760, 1], ['2 bedrooms', 1150, 2]], rera: 'DEMO-2114', amen: ['Canal-front promenade', 'Rooftop pool', 'Smart-home fit-out', 'Valet parking', 'Gym', 'Retail podium'], blurb: 'Compact, well-planned homes on the Dubai Water Canal, minutes from Downtown.' },
  { id: 'circle-gardens', name: 'Circle Gardens', dev: 'Verdant Group', area: 'Jumeirah Village Circle', sub: 'District 12', lat: 25.0590, lng: 55.2085, kind: 'lowrise', set: 'park', mood: 'day', seed: 37, floors: 9, blocks: 4, units: 220, sold: 71, launch: '2025-04', ho: 'Q4 2027', hm: 13, plan: '50/50', ppsf: 1495, svc: 13, yld: 7.6, types: [['Studio', 410, 0], ['1 bedroom', 720, 1], ['2 bedrooms', 1120, 2]], rera: 'DEMO-1988', amen: ['Courtyard pool', 'Kids play park', 'Jogging loop', 'Retail podium', 'BBQ area'], blurb: 'Garden blocks around a landscaped courtyard, the entry price of this collection.' },
  { id: 'harbour-lumen', name: 'Harbour Lumen', dev: 'Aurum Built', area: 'Dubai Creek Harbour', sub: 'Creek Beach', lat: 25.2003, lng: 55.3472, kind: 'twin', set: 'water', mood: 'dawn', seed: 52, floors: 45, units: 480, sold: 39, launch: '2026-05', ho: 'Q3 2029', hm: 34, plan: '60/40', ppsf: 2410, svc: 16, yld: 6.1, types: [['1 bedroom', 780, 1], ['2 bedrooms', 1260, 2], ['3 bedrooms', 1790, 3]], rera: 'DEMO-2140', amen: ['Creek-view podium', 'Waterfront retail', 'Lap pool', 'Kids club', 'Gym', 'Cycle paths'], blurb: 'Twin towers facing the creek and the Downtown skyline, next to the creek park.' },
  { id: 'hills-arbor', name: 'Hills Arbor', dev: 'Verdant Group', area: 'Dubai Hills Estate', sub: 'Park Heights', lat: 25.1072, lng: 55.2468, kind: 'lowrise', set: 'park', mood: 'dawn', seed: 64, floors: 12, blocks: 3, units: 260, sold: 58, launch: '2025-11', ho: 'Q2 2028', hm: 19, plan: '80/20', ppsf: 2380, svc: 15, yld: 5.8, types: [['1 bedroom', 760, 1], ['2 bedrooms', 1180, 2], ['3 bedrooms', 1690, 3]], rera: 'DEMO-2066', amen: ['Park-facing terraces', 'Walk to Dubai Hills Mall', 'Golf course views', 'Family pool', 'Tennis court'], blurb: 'Mid-rise blocks on the central park, a short walk from the mall and schools.' },
  { id: 'meydan-lagoon', name: 'Meydan Lagoon Residences', dev: 'Sandline Developments', area: 'MBR City', sub: 'District One', lat: 25.1590, lng: 55.3012, kind: 'twin', set: 'park', mood: 'day', seed: 71, floors: 32, units: 340, sold: 44, launch: '2026-01', ho: 'Q1 2029', hm: 28, plan: '60/40', ppsf: 2190, svc: 14, yld: 6.0, types: [['1 bedroom', 760, 1], ['2 bedrooms', 1250, 2], ['3 bedrooms', 1880, 3]], rera: 'DEMO-2088', amen: ['Crystal lagoon beach', 'Cycling track', 'Sports club', 'School drop-off', 'Pool'], blurb: 'Twin residences beside a swimmable lagoon, between Downtown and Meydan.' },
  { id: 'furjan-grove', name: 'Furjan Grove', dev: 'Aurum Built', area: 'Al Furjan', sub: 'Murano', lat: 25.0262, lng: 55.1488, kind: 'lowrise', set: 'park', mood: 'day', seed: 88, floors: 7, blocks: 5, units: 180, sold: 76, launch: '2024-12', ho: 'Q3 2027', hm: 10, plan: '70/30', ppsf: 1460, svc: 12, yld: 7.2, types: [['1 bedroom', 770, 1], ['2 bedrooms', 1190, 2], ['3 bedrooms', 1720, 3]], rera: 'DEMO-1954', amen: ['Metro at the door', 'Courtyard gardens', 'Community retail', 'Covered parking', 'Pool'], blurb: 'Courtyard blocks next to Al Furjan metro, with the earliest handover here.' },
  { id: 'palm-azure', name: 'Palm Azure Terraces', dev: 'Corniche & Co', area: 'Palm Jumeirah', sub: 'The Trunk', lat: 25.1124, lng: 55.1332, kind: 'lowrise', set: 'water', mood: 'day', seed: 95, floors: 10, blocks: 2, units: 96, sold: 67, launch: '2025-10', ho: 'Q4 2028', hm: 25, plan: '50/50', ppsf: 5450, svc: 26, yld: 4.9, types: [['2 bedrooms', 1580, 2], ['3 bedrooms', 2350, 3], ['4 bedrooms', 3400, 4]], rera: 'DEMO-2122', amen: ['Private beach', 'Marina club', 'Spa and hammam', 'Sea-view terraces', 'Concierge'], blurb: 'Low-rise terraces stepping down to a private beach on the Palm trunk.' },
  { id: 'boulevard-spire', name: 'Boulevard Spire', dev: 'Halo Properties', area: 'Downtown Dubai', sub: 'Mohammed Bin Rashid Boulevard', lat: 25.1932, lng: 55.2766, kind: 'tower', set: 'park', mood: 'dusk', seed: 104, floors: 56, units: 390, sold: 53, launch: '2026-04', ho: 'Q1 2030', hm: 40, plan: '60/40', ppsf: 3290, svc: 21, yld: 5.6, types: [['1 bedroom', 820, 1], ['2 bedrooms', 1330, 2], ['3 bedrooms', 2050, 3]], rera: 'DEMO-2163', amen: ['Burj Khalifa views', 'Boulevard retail', 'Sky lounge', 'Concierge', 'Pool', 'Gym'], blurb: 'A landmark tower on the boulevard with views of the Burj Khalifa and fountain.' }
];
const developers = {
  'Tidewater Developments': { since: 2009, delivered: 14, onTime: 92 }, 'Aurum Built': { since: 2012, delivered: 21, onTime: 95 }, 'Verdant Group': { since: 2015, delivered: 9, onTime: 94 },
  'Sandline Developments': { since: 2011, delivered: 11, onTime: 90 }, 'Corniche & Co': { since: 2006, delivered: 17, onTime: 89 }, 'Halo Properties': { since: 2014, delivered: 8, onTime: 91 }
};
const VIEWS = { water: ['Sea view', 'Marina view', 'Canal view', 'Creek view', 'City view'], park: ['Park view', 'Pool view', 'Community view', 'City view', 'Golf view'] };
const listings = [];
let n = 1;
const added = (r, max) => new Date(Date.UTC(2026, 9, 24) - Math.floor(r() * max) * 864e5).toISOString().slice(0, 10);
projects.forEach(p => {
  p.from = r5(p.types[0][1] * p.ppsf); p.dev_info = developers[p.dev];
  const r = R(p.seed * 13);
  p.types.forEach((t, ti) => {
    for (let k = 0; k < (ti === 1 ? 2 : 1); k++) {
      const floor = Math.max(2, Math.floor(r() * (p.floors - 2)) + 1), size = Math.round(t[1] * (.96 + r() * .1));
      const price = r5(size * p.ppsf * (1 + floor * .0012) * (.95 + r() * .07)), view = VIEWS[p.set][Math.floor(r() * 5)];
      listings.push({ ref: 'ARK-OP-' + String(1000 + n++), status: 'off', project: p.id, title: `${t[0] === 'Studio' ? 'Studio' : t[0].replace('bedroom', 'bed')} ${view.toLowerCase()} in ${p.name}`, type: t[2] >= 4 ? 'Penthouse' : 'Apartment',
        beds: t[2], baths: Math.max(1, t[2] + (t[2] >= 2 ? 1 : 0)), size, price, ppsf: Math.round(price / size), floor, view, furnish: 'Unfurnished', parking: t[2] >= 2 ? 2 : 1,
        area: p.area, sub: p.sub, lat: p.lat, lng: p.lng, building: p.name, developer: p.dev, handover: p.ho, plan: p.plan, svc: p.svc, rentEst: Math.round(price * p.yld / 100 / 1000) * 1000,
        ownership: 'Freehold', permit: 'DEMO-TRK-' + (71000 + n * 37), rera: p.rera, verified: r() > .25, added: added(r, 40),
        features: ['Balcony', 'Built-in wardrobes', 'Central A/C', ...(t[2] >= 2 ? ['Maid room'] : []), ...(floor > 20 ? ['High floor'] : [])], seed: p.seed + n, kind: p.kind, set: p.set, mood: p.mood });
    }
  });
});
const READY = [
  ['Marina Quay Tower', 'Dubai Marina', 'Marina Walk', 25.0805, 55.1395, 'tower', 'water', 2012], ['Jumeirah Bay Residence', 'Dubai Marina', 'JBR side', 25.0772, 55.1350, 'tower', 'water', 2016],
  ['Fountain View Suites', 'Downtown Dubai', 'Opera District', 25.1962, 55.2735, 'tower', 'park', 2015], ['Old Town Courtyard', 'Downtown Dubai', 'Old Town', 25.1935, 55.2730, 'lowrise', 'park', 2009],
  ['Bay Square Lofts', 'Business Bay', 'Bay Square', 25.1880, 55.2810, 'lowrise', 'park', 2014], ['Executive Canal Tower', 'Business Bay', 'Marasi Drive', 25.1830, 55.2640, 'tower', 'water', 2018],
  ['Circle Park Residences', 'Jumeirah Village Circle', 'District 15', 25.0630, 55.2050, 'lowrise', 'park', 2021], ['Lake View Cluster', 'Jumeirah Lake Towers', 'Cluster D', 25.0700, 55.1450, 'tower', 'water', 2010],
  ['Park Point Hills', 'Dubai Hills Estate', 'Park Point', 25.1040, 55.2440, 'lowrise', 'park', 2022], ['Creek Rise', 'Dubai Creek Harbour', 'Creek Island', 25.1990, 55.3440, 'tower', 'water', 2023],
  ['Shoreline Apartments', 'Palm Jumeirah', 'Shoreline', 25.1170, 55.1410, 'lowrise', 'water', 2007], ['Furjan Square', 'Al Furjan', 'Quortaj', 25.0300, 55.1500, 'lowrise', 'park', 2019]
];
READY.forEach(([b, area, sub, lat, lng, kind, set, built], i) => {
  const r = R(500 + i * 17), beds = [0, 1, 1, 2, 2, 3][Math.floor(r() * 6)], size = Math.round([450, 780, 1250, 1750][Math.min(beds, 3)] * (.92 + r() * .18));
  const med = (dld[area] && (dld[area].readyMed || dld[area].medPpsf)) || 1800, price = r5(size * med * (.93 + r() * .16)), tenanted = r() < .45, yld = 5.2 + r() * 2.2;
  const view = VIEWS[set][Math.floor(r() * 5)];
  listings.push({ ref: 'ARK-RS-' + String(2000 + i), status: 'ready', title: `${beds ? beds + ' bed' : 'Studio'} ${view.toLowerCase()} in ${b}`, type: 'Apartment', beds, baths: Math.max(1, beds + (beds >= 2 ? 1 : 0)), size, price, ppsf: Math.round(price / size),
    floor: 2 + Math.floor(r() * (kind === 'tower' ? 40 : 8)), view, furnish: r() < .4 ? 'Furnished' : 'Unfurnished', parking: beds >= 2 ? 2 : 1, area, sub, lat, lng, building: b, developer: 'Resale', built,
    svc: Math.round(12 + r() * 10), rentEst: Math.round(price * yld / 100 / 1000) * 1000, tenancy: tenanted ? 'Tenanted until ' + ['Mar 2027', 'Jun 2027', 'Dec 2026'][Math.floor(r() * 3)] : 'Vacant on transfer',
    ownership: 'Freehold', permit: 'DEMO-TRK-' + (82000 + i * 41), verified: r() > .3, added: added(r, 30), features: ['Balcony', 'Central A/C', 'Built-in wardrobes', ...(r() < .5 ? ['Upgraded kitchen'] : []), ...(tenanted ? [] : ['Ready to move in'])],
    seed: 700 + i * 9, kind, set, mood: ['day', 'dawn', 'dusk'][i % 3] });
});
const out = { note: 'Demo catalogue. Projects, developers, buildings, prices and permit numbers are fictional. Areas and coordinates are real places.', generated: new Date().toISOString().slice(0, 10), projects, listings };
fs.writeFileSync(new URL('../data/catalog.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(projects.length, 'projects,', listings.filter(l => l.status === 'off').length, 'off-plan and', listings.filter(l => l.status === 'ready').length, 'ready listings');
