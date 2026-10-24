/* ---------- catalogue (data/catalog.json, injected by the server) and market data ---------- */
const readJSON = id => { try { const d = JSON.parse(document.getElementById(id).textContent); return d; } catch (e) { return null; } };
const CATALOG = readJSON('catalog') || { projects: [], listings: [] };
const PROJECTS = CATALOG.projects;
const LISTINGS = CATALOG.listings.map(l => ({ ...l, id: l.ref }));
PROJECTS.forEach(p => { p.from = p.from || Math.round(p.types[0][1] * p.ppsf / 1e4) * 1e4; p.hy = +String(p.ho).slice(-4); });
const projectById = id => PROJECTS.find(p => p.id === id);
const listingByRef = ref => LISTINGS.find(l => l.ref === ref);
/* a 3D/scene-ready "project" for any listing (ready buildings get a generic shape) */
function sceneOf(l) {
  if (l.project) return projectById(l.project);
  return { id: l.ref, name: l.building, area: l.area, lat: l.lat, lng: l.lng, kind: l.kind, set: l.set, mood: l.mood, seed: l.seed, floors: l.kind === 'tower' ? Math.max(l.floor + 6, 30) : 8, blocks: 2, units: l.kind === 'tower' ? 300 : 120, ho: 'Ready since ' + l.built, amen: l.features, blurb: '' };
}
const DLD = readJSON('dld'); const MARKET = readJSON('market');
const dldOf = x => DLD && DLD.areas && DLD.areas[x.area];
const AREAS = [...new Set([...PROJECTS.map(p => p.area), ...LISTINGS.map(l => l.area)])].sort();

/* real places, approximate coordinates */
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
const CATCOL0 = { metro: '#E23D3D', mall: '#7A4FD6', beach: '#1C8FC7', school: '#E2A02B', hospital: '#0E9C6B', air: '#3B4A5A', city: '#0A2A2E' };
const km = (a, b) => { const r = Math.PI / 180, d1 = (b.lat - a.lat) * r, d2 = (b.lng - a.lng) * r, x = Math.sin(d1 / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(d2 / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
const bearing = (a, b) => Math.atan2((b.lng - a.lng) * Math.cos(a.lat * Math.PI / 180), b.lat - a.lat);
const travel = d => d < 1.2 ? { mode: 'walk', min: Math.max(2, Math.round(d * 1.3 / 5 * 60)) } : { mode: 'drive', min: Math.max(3, Math.round(d * 1.35 / 38 * 60)) };
function nearby(L) { const out = {}; PLACES.forEach(p => { const d = km(L, p); if (!out[p.cat] || d < out[p.cat].d) out[p.cat] = { ...p, d, t: travel(d), b: bearing(L, p) }; }); return Object.keys(CAT).map(c => out[c]).filter(Boolean); }

const PLANS = {
  '60/40': [['Booking', 0, 10], ['SPA signing', 1, 10], ['During construction', .35, 10], ['During construction', .6, 10], ['During construction', .8, 10], ['During construction', .95, 10], ['On handover', 1, 40]],
  '70/30': [['Booking', 0, 10], ['SPA signing', 1, 10], ['During construction', .25, 10], ['During construction', .45, 10], ['During construction', .6, 10], ['During construction', .75, 10], ['During construction', .9, 10], ['On handover', 1, 30]],
  '50/50': [['Booking', 0, 10], ['SPA signing', 1, 10], ['During construction', .4, 10], ['During construction', .7, 10], ['During construction', .9, 10], ['On handover', 1, 10], ['After handover', 1.25, 20], ['After handover', 1.5, 20]],
  '80/20': [['Booking', 0, 20], ['SPA signing', 1, 10], ['During construction', .3, 10], ['During construction', .5, 10], ['During construction', .7, 15], ['During construction', .9, 15], ['On handover', 1, 20]]
};
function schedule(p, price) { return PLANS[p.plan].map(([n, f, pc]) => ({ n, m: n === 'SPA signing' ? 1 : Math.round(f * p.hm), pc, amt: price * pc / 100 })); }
const fees = (price, ready) => ({ dld: price * .04, trustee: 4000 * 1.05, admin: 580, agency: ready ? price * .02 * 1.05 : 0 });
const totalCost = (price, ready) => { const f = fees(price, ready); return price + f.dld + f.trustee + f.admin + f.agency; };
const pmt = (L, r, n) => r ? L * (r / 12) / (1 - Math.pow(1 + r / 12, -n * 12)) : L / (n * 12);

/* matching for the 3-question start */
function match(l, a) {
  if (!a) return null;
  const p = l.project ? projectById(l.project) : null, yld = l.rentEst / l.price * 100; let s = 60;
  if (a.goal === 'invest') s += (yld - 6) * 9;
  if (a.goal === 'live') s += (l.beds >= 2 ? 8 : 2) + (l.set === 'park' ? 4 : 2);
  if (a.bud) s += l.price <= a.bud ? 10 : -Math.min(45, (l.price - a.bud) / a.bud * 80);
  if (a.when) s += !p ? 8 : p.hy <= a.when ? 10 : -Math.min(20, (p.hy - a.when) * 9);
  const d = dldOf(l); const ref = d && (l.status === 'off' ? d.offMed : d.readyMed); if (ref) s += clamp((ref - l.ppsf) / ref * 50, -6, 6);
  return clamp(Math.round(s), 30, 98);
}
function vsArea(l) { const d = dldOf(l), ref = d && (l.status === 'off' ? d.offMed : d.readyMed); return ref ? { ref, pct: (l.ppsf / ref - 1) * 100, label: l.status === 'off' ? 'off-plan' : 'ready' } : null; }
