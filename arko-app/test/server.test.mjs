import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arko-'));
process.env.DATA_DIR = tmp; process.env.ADMIN_TOKEN = 'secret-token-123';
fs.copyFileSync(new URL('../data/dld-area-stats.json', import.meta.url), path.join(tmp, 'dld-area-stats.json'));
const { server, validateLead } = await import('../server.mjs');
let base;
before(async () => { await new Promise(r => server.listen(0, r)); base = 'http://localhost:' + server.address().port; });
after(() => server.close());
const post = (b, h = {}) => fetch(base + '/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json', ...h }, body: JSON.stringify(b) });
const good = { kind: 'call', name: 'Test User', phone: '+971 50 123 4567', when: 'This evening', consent: true };

test('page is served with DLD data injected', async () => {
  const t = await (await fetch(base + '/')).text();
  assert.match(t, /<title>ARKO<\/title>/); assert.match(t, /"areas"/); assert.match(t, /\+971 58 635 2359/);
});
test('config returns support number', async () => assert.equal((await (await fetch(base + '/api/config')).json()).supportPhone, '+971586352359'));
test('valid lead is stored', async () => {
  const r = await post(good); assert.equal(r.status, 200);
  const rows = await (await fetch(base + '/api/leads', { headers: { Authorization: 'Bearer secret-token-123' } })).json();
  assert.equal(rows.length, 1); assert.equal(rows[0].name, 'Test User'); assert.ok(!('ip' in rows[0]));
});
test('leads endpoint needs the token', async () => assert.equal((await fetch(base + '/api/leads')).status, 401));
test('missing consent, bad phone and bad kind are rejected', () => {
  assert.deepEqual(validateLead({ ...good, consent: false }), ['consent']);
  assert.deepEqual(validateLead({ ...good, phone: '12' }), ['phone']);
  assert.deepEqual(validateLead({ ...good, kind: 'x' }), ['kind']);
});
test('honeypot gets fake success and is not stored', async () => {
  const before = fs.readFileSync(path.join(tmp, 'leads.jsonl'), 'utf8').split('\n').length;
  assert.equal((await post({ ...good, website: 'spam' })).status, 200);
  assert.equal(fs.readFileSync(path.join(tmp, 'leads.jsonl'), 'utf8').split('\n').length, before);
});
test('non-json and oversize bodies are refused', async () => {
  assert.equal((await fetch(base + '/api/lead', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'x' })).status, 415);
  assert.equal((await post({ ...good, note: 'x'.repeat(20000) })).status, 413);
});
test('rate limit kicks in after 5 leads from one address', async () => {
  const codes = []; for (let i = 0; i < 6; i++) codes.push((await post(good)).status);
  assert.ok(codes.includes(429), codes.join());
});

/* ---------- owner dashboard, events, bids ---------- */
const { summarize, prune } = await import('../server.mjs');
const H = { Authorization: 'Bearer secret-token-123' };
const get = (u, h = H) => fetch(base + u, { headers: h });
const evt = (b, ip = '9.9.9.9') => fetch(base + '/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip, 'User-Agent': 'iPhone Mobile' }, body: JSON.stringify(b) });

test('admin page is served, noindex, and needs no data to load', async () => {
  const r = await fetch(base + '/admin'); assert.equal(r.status, 200); assert.match(r.headers.get('x-robots-tag'), /noindex/);
  assert.match(await r.text(), /ARKO Owner/);
});
test('admin APIs reject missing and wrong tokens', async () => {
  assert.equal((await get('/api/admin/summary', {})).status, 401);
  assert.equal((await get('/api/admin/summary', { Authorization: 'Bearer nope' })).status, 401);
  assert.equal((await get('/api/admin/summary')).status, 200);
});
test('events are stored without personal data and summarised', async () => {
  assert.equal((await evt({ sid: 'abcdefgh12', type: 'view', name: 'home' })).status, 204);
  assert.equal((await evt({ sid: 'abcdefgh12', type: 'intent', name: 'invest / 2500000 / off' })).status, 204);
  assert.equal((await evt({ sid: 'abcdefgh12', type: 'home', name: 'azure-reach' })).status, 204);
  assert.equal((await evt({ sid: 'abcdefgh12', type: 'click', name: 'card:azure-reach' })).status, 204);
  assert.equal((await evt({ sid: 'zzzzzzzz99', type: 'view', name: 'home', ref: 'google.com' })).status, 204);
  assert.equal((await evt({ sid: 'bad sid!', type: 'view' })).status, 400);
  assert.equal((await evt({ sid: 'abcdefgh12', type: 'hack' })).status, 400);
  const s = await (await get('/api/admin/summary?days=1')).json();
  assert.equal(s.visitors, 2); assert.equal(s.funnel[2].visitors, 1); assert.equal(s.topClicks[0].name, 'card:azure-reach'); assert.equal(s.topHomes[0].name, 'azure-reach'); assert.equal(s.devices.mobile, 2); assert.equal(s.referrers[0].name, 'google.com');
  const raw = fs.readFileSync(path.join(tmp, 'events.jsonl'), 'utf8'); assert.ok(!/\b9\.9\.9\.9\b/.test(raw), 'ip must not be stored');
});
test('summarize ignores events outside the window', () => {
  const old = { t: new Date(Date.now() - 40 * 864e5).toISOString(), sid: 'oldsid1234', type: 'view', name: 'home', dev: 'desktop' };
  assert.equal(summarize([old], 7).visitors, 0); assert.equal(summarize([old], 90).visitors, 1);
});
test('bid lifecycle: send, poll, owner counters, buyer accepts', async () => {
  const mk = (o = {}) => fetch(base + '/api/bids', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '8.8.8.8' }, body: JSON.stringify({ homeId: 'r1', homeName: 'Marina Promenade', ask: 2650000, amount: 2500000, name: 'Buyer One', phone: '+971 50 111 2222', consent: true, ...o }) });
  const bad = await mk({ amount: 100 }); assert.equal(bad.status, 400);
  assert.equal((await mk({ consent: false })).status, 400);
  const r = await mk(); assert.equal(r.status, 200); const b = await r.json(); assert.ok(b.token && b.id);
  assert.equal((await fetch(`${base}/api/bids/${b.id}?token=wrong`)).status, 404);
  assert.equal((await (await fetch(`${base}/api/bids/${b.id}?token=${b.token}`)).json()).status, 'pending');
  assert.ok(!JSON.stringify(await (await fetch(`${base}/api/bids/${b.id}?token=${b.token}`)).json()).includes('111 2222'), 'buyer view has no phone');
  const list = await (await get('/api/admin/bids')).json(); assert.equal(list[0].phone, '+971 50 111 2222');
  const ad = (a) => fetch(`${base}/api/admin/bids/${b.id}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify(a) });
  assert.equal((await fetch(`${base}/api/admin/bids/${b.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"action":"accept"}' })).status, 401);
  assert.equal((await ad({ action: 'counter', counter: 2580000 })).status, 200);
  const c = await (await fetch(`${base}/api/bids/${b.id}?token=${b.token}`)).json(); assert.equal(c.status, 'countered'); assert.equal(c.counter, 2580000);
  assert.equal((await ad({ action: 'accept' })).status, 409, 'cannot accept after countering');
  const acc = await fetch(`${base}/api/bids/${b.id}/respond`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: b.token, action: 'accept_counter' }) });
  const f = await acc.json(); assert.equal(f.status, 'accepted'); assert.equal(f.amount, 2580000);
});
test('owner can accept and decline offers; buyer sees the result', async () => {
  const mk = async (amt) => (await (await fetch(base + '/api/bids', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '7.7.7.7' }, body: JSON.stringify({ homeId: 'r2', homeName: 'Downtown Terraces', ask: 2150000, amount: amt, name: 'Buyer Two', phone: '+971 55 333 4444', consent: true }) })).json());
  const a = await mk(2100000), d = await mk(1900000);
  const act = (id, action) => fetch(`${base}/api/admin/bids/${id}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
  await act(a.id, 'accept'); await act(d.id, 'reject');
  assert.equal((await (await fetch(`${base}/api/bids/${a.id}?token=${a.token}`)).json()).status, 'accepted');
  assert.equal((await (await fetch(`${base}/api/bids/${d.id}?token=${d.token}`)).json()).status, 'rejected');
});
test('lead status can be changed by the owner', async () => {
  const l = (await (await get('/api/admin/leads')).json())[0];
  const r = await fetch(`${base}/api/admin/leads/${l.id}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'contacted' }) });
  assert.equal(r.status, 200); assert.equal((await (await get('/api/admin/leads')).json()).find(x => x.id === l.id).status, 'contacted');
});
test('health reports routes, files and errors', async () => {
  const h = await (await get('/api/admin/health')).json();
  assert.equal(h.ok, true); assert.ok(h.routes.find(r => r.route === 'POST /api/event').n >= 5); assert.ok(h.counts.bids >= 3); assert.equal(typeof h.memoryMb, 'number');
});
test('retention prunes old events', () => {
  const f = path.join(tmp, 'events.jsonl'), keep = fs.readFileSync(f, 'utf8');
  fs.appendFileSync(f, JSON.stringify({ t: new Date(Date.now() - 400 * 864e5).toISOString(), sid: 'veryold123', type: 'view', name: 'home' }) + '\n');
  prune(); const after = fs.readFileSync(f, 'utf8'); assert.ok(!after.includes('veryold123')); assert.equal(after.split('\n').length, keep.split('\n').length);
});
test('owner counter outside a sensible range is refused', async () => {
  const b = await (await fetch(base + '/api/bids', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '6.6.6.6' }, body: JSON.stringify({ homeId: 'r3', homeName: 'Springs Gardens', ask: 3350000, amount: 3200000, name: 'Buyer Three', phone: '+971 52 000 1111', consent: true }) })).json();
  const ad = c => fetch(`${base}/api/admin/bids/${b.id}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'counter', counter: c }) });
  assert.equal((await ad(33500000)).status, 409); assert.equal((await ad(3300000)).status, 200);
});
test('per-listing analytics count opens, shortlists and conversions once per person', () => {
  const t = new Date().toISOString(), e = (sid, type, name, props) => ({ t, sid, type, name, props, dev: 'desktop' });
  const s = summarize([e('aaaaaaaa11', 'home', 'solace-marina', { n: 'Solace Marina' }), e('aaaaaaaa11', 'shortlist', 'solace-marina', { on: true, n: 'Solace Marina' }), e('aaaaaaaa11', 'eoi_step', 'solace-marina:called'), e('aaaaaaaa11', 'book', 'solace-marina', { mode: 'eoi_done' }),
    e('bbbbbbbb22', 'home', 'solace-marina', { n: 'Solace Marina' }), e('bbbbbbbb22', 'shortlist', 'canal-crest', { on: true, n: 'Canal Crest' })], 7);
  const sm = s.listings.find(x => x.id === 'solace-marina'), cc = s.listings.find(x => x.id === 'canal-crest');
  assert.equal(sm.opens, 2); assert.equal(sm.people, 2); assert.equal(sm.calls, 1); assert.equal(sm.eois, 1); assert.equal(sm.conversion, 50); assert.equal(cc.name, 'Canal Crest'); assert.equal(cc.shortlisted, 1);
});
