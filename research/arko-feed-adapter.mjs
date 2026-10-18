// ARKO listing-feed adapter (source-agnostic).
// A licensed provider's response is mapped into one normalised Listing, which is then
// converted into the shape the ARKO prototype renders (PROJ / RES in 02-data.js).
// The field map below is a placeholder: fill it in from the provider's contract and schema.

export const LISTING_FIELDS = ['id', 'source', 'kind', 'title', 'developer', 'area', 'priceAed', 'sizeSqft', 'beds', 'handover', 'paymentPlan', 'reraNo', 'photos', 'updatedAt'];

/** Provider adapters receive raw JSON and return Listing[]. Keep keys server-side. */
export function makeAdapter({ source, map }) {
  return raw => (raw.items || []).map(r => {
    const l = { source, ...Object.fromEntries(Object.entries(map).map(([k, f]) => [k, typeof f === 'function' ? f(r) : r[f]])) };
    const bad = validate(l);
    return bad.length ? { ...l, _invalid: bad } : l;
  });
}

export function validate(l) {
  const bad = [];
  if (!l.id) bad.push('id');
  if (!['off', 'res'].includes(l.kind)) bad.push('kind');
  if (!(l.priceAed > 0)) bad.push('priceAed');
  if (!l.area) bad.push('area');
  if (l.kind === 'off' && !l.reraNo) bad.push('reraNo');           // show no off-plan project without a RERA number
  if (!Array.isArray(l.photos) || !l.photos.every(p => p.url && p.licence)) bad.push('photos.licence');
  return bad;
}

/** Listing -> prototype card shape. Fields the feed lacks stay undefined so the UI can hide them. */
export function toCard(l) {
  const base = { id: l.id, name: l.title, area: l.area, type: l.kind, from: l.priceAed, photos: l.photos };
  return l.kind === 'off'
    ? { ...base, dev: l.developer, ho: l.handover, plan: l.paymentPlan, rera: l.reraNo }
    : { ...base, unit: l.title, size: l.sizeSqft, beds: l.beds, price: l.priceAed, ppsf: Math.round(l.priceAed / l.sizeSqft) };
}

// --- self-test with mock data (run: node arko-feed-adapter.mjs) ---
if (import.meta.url === `file://${process.argv[1]}`) {
  const adapt = makeAdapter({ source: 'mock', map: { id: 'ref', kind: 'type', title: 'name', developer: 'dev', area: 'loc', priceAed: 'price', sizeSqft: 'sqft', beds: 'beds', handover: 'handover', paymentPlan: 'plan', reraNo: 'rera', photos: r => (r.imgs || []).map(url => ({ url, licence: 'mock-licence' })), updatedAt: 'ts' } });
  const out = adapt({ items: [
    { ref: 'a1', type: 'off', name: 'Test Tower', dev: 'Dev Co', loc: 'Dubai Marina', price: 1200000, handover: 'Q4 2029', plan: '60/40', rera: '1234', imgs: ['https://example.test/1.jpg'] },
    { ref: 'a2', type: 'res', name: 'Studio 14', loc: 'Business Bay', price: 780000, sqft: 420, beds: 0, imgs: [] }] });
  console.log(out.map(l => ({ id: l.id, invalid: l._invalid || null })));
  console.log(toCard(out[0]));
}
