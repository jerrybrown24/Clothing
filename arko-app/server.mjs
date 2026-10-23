// ARKO web app server. No dependencies; Node 20+.
// Customer site at /, owner dashboard at /admin (token login), JSON API under /api.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const env = k => process.env[k];
const PORT = +env('PORT') || 3000;
const DATA_DIR = env('DATA_DIR') || path.join(ROOT, 'data');
const F = n => path.join(DATA_DIR, n);
const CFG = { supportName: env('SUPPORT_NAME') || 'Ajinkya', supportPhone: env('SUPPORT_PHONE') || '+971586352359' };
const ADMIN_TOKEN = env('ADMIN_TOKEN') || '';
const WEBHOOK = env('LEAD_WEBHOOK_URL') || '';
const RETENTION = { events: +env('EVENT_RETENTION_DAYS') || 90, leads: +env('LEAD_RETENTION_DAYS') || 180 };
const MAX_BODY = 10 * 1024;
fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------- small helpers ---------- */
const now = () => Date.now();
const clean = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const safeEq = (a, b) => { a = Buffer.from(String(a)); b = Buffer.from(String(b)); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const readLines = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : [];
const writeAtomic = (f, data) => { const t = f + '.tmp'; fs.writeFileSync(t, data); fs.renameSync(t, f); };
const limiter = (max, windowMs) => { const m = new Map(); return key => { const t = now(), a = (m.get(key) || []).filter(x => t - x < windowMs); if (a.length >= max) { m.set(key, a); return false; } a.push(t); m.set(key, a); return true; }; };
const rl = { lead: limiter(5, 3600e3), bid: limiter(10, 3600e3), event: limiter(900, 3600e3), authFail: limiter(10, 900e3) };

/* ---------- monitoring (in memory since boot) ---------- */
const metrics = { since: now(), routes: new Map(), errors: [] };
function record(route, ms, status, err) {
  const r = metrics.routes.get(route) || { n: 0, err: 0, ms: 0, max: 0 };
  r.n++; r.ms += ms; r.max = Math.max(r.max, ms); if (status >= 500) r.err++; metrics.routes.set(route, r);
  if (err) { metrics.errors.push({ at: new Date().toISOString(), route, message: clean(err, 200) }); if (metrics.errors.length > 50) metrics.errors.shift(); }
}

/* ---------- leads ---------- */
export function validateLead(b) {
  const e = [], s = (v, n) => typeof v === 'string' && v.trim().length <= n;
  if (!b || typeof b !== 'object') return ['body'];
  if (!s(b.name, 80) || b.name.trim().length < 2) e.push('name');
  const digits = typeof b.phone === 'string' ? b.phone.replace(/\D/g, '') : '';
  if (!/^[+\d][\d\s()+-]{5,24}$/.test(b.phone || '') || digits.length < 7 || digits.length > 15) e.push('phone');
  if (!['call', 'meet'].includes(b.kind)) e.push('kind');
  if (b.consent !== true) e.push('consent');
  for (const k of ['when', 'home', 'goal']) if (b[k] != null && !s(b[k], 120)) e.push(k);
  if (b.budget != null && !(Number.isFinite(b.budget) && b.budget >= 0 && b.budget < 1e10)) e.push('budget');
  return e;
}
const leadStatus = () => { try { return JSON.parse(fs.readFileSync(F('lead-status.json'), 'utf8')); } catch { return {}; } };
async function notify(text) { if (WEBHOOK) fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }).catch(() => console.error('webhook failed')); }
async function saveLead(b) {
  const rec = { id: crypto.randomUUID(), at: new Date().toISOString(), kind: b.kind, name: clean(b.name, 80), phone: clean(b.phone, 25), when: clean(b.when, 120), home: clean(b.home, 120), goal: clean(b.goal, 40), budget: b.budget || 0, consent: true };
  fs.appendFileSync(F('leads.jsonl'), JSON.stringify(rec) + '\n');
  notify(`ARKO ${rec.kind === 'call' ? 'call back' : 'meeting'} request: ${rec.name}, ${rec.phone}, ${rec.when}${rec.home ? ', about ' + rec.home : ''}`);
  return rec;
}

/* ---------- bids ---------- */
let bids = (() => { try { return JSON.parse(fs.readFileSync(F('bids.json'), 'utf8')); } catch { return []; } })();
const saveBids = () => writeAtomic(F('bids.json'), JSON.stringify(bids));
const pub = b => ({ id: b.id, status: b.status, amount: b.amount, counter: b.counter || 0, ask: b.ask, updated: b.updated, log: b.log.map(l => ({ at: l.at, by: l.by, text: l.text, amount: l.amount })) });
export function validateBid(b) {
  const e = [];
  if (!b || typeof b !== 'object') return ['body'];
  if (!(Number.isFinite(b.ask) && b.ask > 0 && b.ask < 1e10)) e.push('ask');
  if (!(Number.isFinite(b.amount) && b.amount > 0 && b.ask > 0 && b.amount >= b.ask * .5 && b.amount <= b.ask * 1.1)) e.push('amount');
  if (typeof b.name !== 'string' || b.name.trim().length < 2 || b.name.trim().length > 80) e.push('name');
  const d = typeof b.phone === 'string' ? b.phone.replace(/\D/g, '') : '';
  if (!/^[+\d][\d\s()+-]{5,24}$/.test(b.phone || '') || d.length < 7 || d.length > 15) e.push('phone');
  if (b.consent !== true) e.push('consent');
  if (typeof b.homeId !== 'string' || !b.homeId || b.homeId.length > 40) e.push('homeId');
  return e;
}
const round5 = n => Math.round(n / 5000) * 5000;

/* ---------- events ---------- */
const EVT = new Set(['view', 'click', 'home', 'intent', 'start', 'lead', 'bid', 'eoi_step', 'ready_step', 'agent', 'market', 'currency', 'shortlist', 'compare', 'view3d', 'walk', 'video', 'unit', 'book']);
function saveEvent(b, ua) {
  const rec = { t: new Date().toISOString(), sid: b.sid, type: b.type, name: clean(b.name, 80), view: clean(b.view, 20), dev: /Mobi|Android|iPhone/i.test(ua || '') ? 'mobile' : 'desktop' };
  if (b.ref) rec.ref = clean(b.ref, 60);
  if (b.props && typeof b.props === 'object') { const p = JSON.stringify(b.props); if (p.length <= 300) rec.props = JSON.parse(p); }
  fs.appendFileSync(F('events.jsonl'), JSON.stringify(rec) + '\n');
}
export function summarize(events, days) {
  const since = now() - days * 864e5, ev = events.filter(e => Date.parse(e.t) >= since);
  const sids = s => new Set(ev.filter(s).map(e => e.sid));
  const all = sids(() => true);
  const stage = [['Visited', all], ['Answered the 3 questions', sids(e => e.type === 'start' || e.type === 'intent')], ['Opened a home', sids(e => e.type === 'home')], ['Shortlisted', sids(e => e.type === 'shortlist')], ['Compared', sids(e => e.type === 'compare')], ['Started booking', sids(e => e.type === 'book' || e.type === 'eoi_step')], ['Booked a call or sent a lead', sids(e => e.type === 'lead' || e.type === 'bid')], ['Reserved with EOI', sids(e => e.type === 'book' && e.props && e.props.mode === 'eoi_done')]];
  const count = (f, key) => { const m = new Map(); ev.filter(f).forEach(e => m.set(key(e), (m.get(key(e)) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]); };
  const homes = new Map(); ev.filter(e => e.type === 'home').forEach(e => { const h = homes.get(e.name) || { name: (e.props && e.props.n) || e.name, views: 0, sids: new Set() }; h.views++; h.sids.add(e.sid); homes.set(e.name, h); });
  const perDay = {}; ev.forEach(e => { const d = e.t.slice(0, 10); (perDay[d] ||= new Set()).add(e.sid); });
  const series = []; for (let i = days - 1; i >= 0; i--) { const d = new Date(now() - i * 864e5).toISOString().slice(0, 10); series.push({ day: d, visitors: perDay[d] ? perDay[d].size : 0 }); }
  const dev = { mobile: 0, desktop: 0 }; const seenDev = new Set(); ev.forEach(e => { if (!seenDev.has(e.sid)) { seenDev.add(e.sid); dev[e.dev] = (dev[e.dev] || 0) + 1; } });
  const L = new Map(), get = id => { if (!L.has(id)) L.set(id, { id, name: id, conv: new Set(), opens: 0, people: new Set(), shortlisted: 0, unshortlisted: 0, compared: 0, model3d: 0, walks: 0, films: 0, units: 0, bookStarts: 0, calls: 0, eois: 0 }); return L.get(id); };
  ev.forEach(e => {
    if (e.props && e.props.n && ['home', 'shortlist'].includes(e.type)) get(e.name).name = e.props.n;
    if (e.type === 'home') { const x = get(e.name); x.opens++; x.people.add(e.sid); if (e.props && e.props.n) x.name = e.props.n; }
    else if (e.type === 'shortlist') { const x = get(e.name); e.props && e.props.on === false ? x.unshortlisted++ : x.shortlisted++; }
    else if (e.type === 'compare') String(e.name).split(',').filter(Boolean).forEach(id => get(id).compared++);
    else if (e.type === 'view3d' && e.props && e.props.mode === 'model') get(e.name).model3d++;
    else if (e.type === 'walk') get(e.name).walks++;
    else if (e.type === 'video') get(e.name).films++;
    else if (e.type === 'unit') get(e.name).units++;
    else if (e.type === 'book') { const x = get(e.name), m = e.props && e.props.mode; if (m === 'call') x.bookStarts++; else if (m === 'eoi') x.bookStarts++; else if (m === 'eoi_done') { x.eois++; x.conv.add(e.sid); } }
    else if (e.type === 'eoi_step' && /:called$/.test(e.name)) { const x = get(e.name.split(':')[0]); x.calls++; x.conv.add(e.sid); }
  });
  const listings = [...L.values()].filter(x => x.opens || x.shortlisted).map(({ conv, ...x }) => ({ ...x, people: x.people.size, conversion: x.people.size ? Math.min(100, Math.round(conv.size / x.people.size * 100)) : 0 })).sort((a, b) => b.opens - a.opens);
  return { listings, days, visitors: all.size, events: ev.length, pageviews: ev.filter(e => e.type === 'view').length, funnel: stage.map(([label, s]) => ({ label, visitors: s.size })), topClicks: count(e => e.type === 'click', e => e.name).slice(0, 15).map(([name, n]) => ({ name, n })), topHomes: [...homes.values()].sort((a, b) => b.views - a.views).slice(0, 10).map(h => ({ name: h.name, views: h.views, visitors: h.sids.size })), referrers: count(e => e.ref, e => e.ref).slice(0, 8).map(([name, n]) => ({ name, n })), devices: dev, series };
}
function prune() {
  const cut = (days) => now() - days * 864e5;
  for (const [f, days] of [['events.jsonl', RETENTION.events], ['leads.jsonl', RETENTION.leads]]) {
    const rows = readLines(F(f)); const keep = rows.filter(r => Date.parse(r.t || r.at) >= cut(days));
    if (keep.length !== rows.length) writeAtomic(F(f), keep.map(r => JSON.stringify(r)).join('\n') + (keep.length ? '\n' : ''));
  }
}
export { prune };

/* ---------- http plumbing ---------- */
const SEC = {
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'",
};
const send = (res, code, body, type = 'application/json', extra = {}) => { res.writeHead(code, { 'Content-Type': type, ...SEC, ...extra }); res.end(code === 204 ? undefined : typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
async function json(req, res) {
  if (!/^application\/json/.test(req.headers['content-type'] || '')) { send(res, 415, { error: 'json only' }); return null; }
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > MAX_BODY) { send(res, 413, { error: 'too large' }); return null; } chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { send(res, 400, { error: 'bad json' }); return null; }
}
function admin(req, res, ip) {
  if (!ADMIN_TOKEN) { send(res, 404, { error: 'not found' }); return false; }
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!t || !safeEq(t, ADMIN_TOKEN)) { if (!rl.authFail(ip)) send(res, 429, { error: 'too many attempts' }); else send(res, 401, { error: 'unauthorised' }); return false; }
  return true;
}
let pageCache = { m: 0, d: 0, html: '' };
function page() {
  const pf = path.join(ROOT, 'public/index.html'), df = F('dld-area-stats.json');
  const pm = fs.statSync(pf).mtimeMs, dm = fs.existsSync(df) ? fs.statSync(df).mtimeMs : 0;
  if (pm !== pageCache.m || dm !== pageCache.d) {
    let html = fs.readFileSync(pf, 'utf8');
    if (dm) { try { const j = JSON.stringify(JSON.parse(fs.readFileSync(df, 'utf8'))).replace(/</g, '\\u003c'); html = html.replace('id="dld">null<', 'id="dld">' + j + '<'); } catch { console.error('bad dld-area-stats.json, serving demo data'); } }
    pageCache = { m: pm, d: dm, html };
  }
  return pageCache.html;
}
function health() {
  const files = {}; for (const n of ['events.jsonl', 'leads.jsonl', 'bids.json']) { try { const s = fs.statSync(F(n)); files[n] = { kb: Math.round(s.size / 1024), modified: s.mtime.toISOString() }; } catch { files[n] = null; } }
  let disk = null; try { const s = fs.statfsSync(DATA_DIR); disk = { freeMb: Math.round(s.bavail * s.bsize / 1048576), totalMb: Math.round(s.blocks * s.bsize / 1048576) }; } catch { /* older node */ }
  let dld = null; try { const d = JSON.parse(fs.readFileSync(F('dld-area-stats.json'), 'utf8')); dld = { asOf: d.asOf, areas: Object.keys(d.areas || {}).length }; } catch { /* none */ }
  const routes = [...metrics.routes].map(([route, r]) => ({ route, n: r.n, errors: r.err, avgMs: +(r.ms / r.n).toFixed(1), maxMs: Math.round(r.max) })).sort((a, b) => b.n - a.n);
  const mem = process.memoryUsage();
  return { ok: true, node: process.version, uptimeMin: Math.round(process.uptime() / 60), since: new Date(metrics.since).toISOString(), memoryMb: Math.round(mem.rss / 1048576), files, disk, dld, webhook: !!WEBHOOK, retentionDays: RETENTION, routes, errors: metrics.errors.slice().reverse(), counts: { bids: bids.length, pending: bids.filter(b => b.status === 'pending').length } };
}

export const server = http.createServer(async (req, res) => {
  const t0 = performance.now(), url = new URL(req.url, 'http://x'), p = url.pathname, m = req.method;
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  let routeName = m + ' ' + p.replace(/\/[0-9a-f-]{36}/g, '/:id'), err = null;
  res.on('finish', () => record(routeName, performance.now() - t0, res.statusCode, err));
  try {
    if (m === 'GET' && (p === '/' || p === '/index.html')) return send(res, 200, page(), 'text/html; charset=utf-8', { 'Cache-Control': 'no-cache' });
    if (m === 'GET' && p === '/admin') return send(res, 200, fs.readFileSync(path.join(ROOT, 'public/admin.html')), 'text/html; charset=utf-8', { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    if (m === 'GET' && p === '/robots.txt') return send(res, 200, 'User-agent: *\nDisallow: /admin\nDisallow: /api/\n', 'text/plain');
    if (m === 'GET' && p === '/favicon.ico') return send(res, 204);
    if (m === 'GET' && p === '/vendor/three.min.js') return send(res, 200, fs.readFileSync(path.join(ROOT, 'public/vendor/three.min.js')), 'text/javascript; charset=utf-8', { 'Cache-Control': 'public, max-age=604800' });
    if (m === 'GET' && p === '/health') return send(res, 200, { ok: true });
    if (m === 'GET' && p === '/api/config') return send(res, 200, CFG, 'application/json', { 'Cache-Control': 'no-cache' });
    if (m === 'GET' && p === '/api/stats') { const f = F('dld-area-stats.json'); return fs.existsSync(f) ? send(res, 200, fs.readFileSync(f)) : send(res, 404, { error: 'no data' }); }

    /* customer: events */
    if (m === 'POST' && p === '/api/event') {
      const b = await json(req, res); if (!b) return;
      if (!rl.event(ip)) return send(res, 429, { error: 'slow down' });
      if (!/^[a-z0-9]{8,32}$/.test(b.sid || '') || !EVT.has(b.type)) return send(res, 400, { error: 'invalid' });
      saveEvent(b, req.headers['user-agent']); return send(res, 204);
    }
    /* customer: leads */
    if (m === 'POST' && p === '/api/lead') {
      const b = await json(req, res); if (!b) return;
      if (b.website) return send(res, 200, { ok: true });
      if (!rl.lead(ip)) return send(res, 429, { error: 'too many requests' });
      const bad = validateLead(b); if (bad.length) return send(res, 400, { error: 'invalid', fields: bad });
      return send(res, 200, { ok: true, id: (await saveLead(b)).id });
    }
    /* customer: bids */
    if (m === 'POST' && p === '/api/bids') {
      const b = await json(req, res); if (!b) return;
      if (b.website) return send(res, 200, { id: 'x', token: 'x' });
      if (!rl.bid(ip)) return send(res, 429, { error: 'too many requests' });
      const bad = validateBid(b); if (bad.length) return send(res, 400, { error: 'invalid', fields: bad });
      const bid = { id: crypto.randomUUID(), token: crypto.randomBytes(16).toString('hex'), at: new Date().toISOString(), updated: new Date().toISOString(), homeId: clean(b.homeId, 40), homeName: clean(b.homeName, 80), ask: b.ask, amount: round5(b.amount), name: clean(b.name, 80), phone: clean(b.phone, 25), status: 'pending', counter: 0, log: [] };
      bid.log.push({ at: bid.at, by: 'buyer', text: 'Offer sent', amount: bid.amount }); bids.push(bid); saveBids();
      notify(`ARKO new offer: ${bid.name} offers AED ${bid.amount.toLocaleString('en-US')} on ${bid.homeName} (asking ${bid.ask.toLocaleString('en-US')}). Open /admin to respond.`);
      return send(res, 200, { id: bid.id, token: bid.token, ...pub(bid) });
    }
    const bm = p.match(/^\/api\/bids\/([0-9a-f-]{36})(\/respond)?$/);
    if (bm) {
      const bid = bids.find(x => x.id === bm[1]);
      if (m === 'GET' && !bm[2]) { return bid && safeEq(url.searchParams.get('token') || '', bid.token) ? send(res, 200, pub(bid), 'application/json', { 'Cache-Control': 'no-store' }) : send(res, 404, { error: 'not found' }); }
      if (m === 'POST' && bm[2]) {
        const b = await json(req, res); if (!b) return;
        if (!bid || !safeEq(b.token || '', bid.token)) return send(res, 404, { error: 'not found' });
        const t = new Date().toISOString();
        if (b.action === 'accept_counter' && bid.status === 'countered') { bid.amount = bid.counter; bid.status = 'accepted'; bid.log.push({ at: t, by: 'buyer', text: 'Accepted the counter offer', amount: bid.amount }); notify(`ARKO: ${bid.name} accepted your counter of AED ${bid.amount.toLocaleString('en-US')} on ${bid.homeName}.`); }
        else if (b.action === 'offer' && ['countered', 'rejected', 'pending'].includes(bid.status) && Number.isFinite(b.amount) && b.amount >= bid.ask * .5 && b.amount <= bid.ask * 1.1) { bid.amount = round5(b.amount); bid.status = 'pending'; bid.counter = 0; bid.log.push({ at: t, by: 'buyer', text: 'New offer', amount: bid.amount }); notify(`ARKO: ${bid.name} sent a new offer of AED ${bid.amount.toLocaleString('en-US')} on ${bid.homeName}.`); }
        else return send(res, 409, { error: 'not allowed in this state' });
        bid.updated = t; saveBids(); return send(res, 200, pub(bid));
      }
    }

    /* owner: everything below needs the token */
    if (p.startsWith('/api/admin/') || p === '/api/leads') {
      if (!admin(req, res, ip)) return;
      if (m === 'GET' && p === '/api/admin/summary') return send(res, 200, summarize(readLines(F('events.jsonl')), Math.min(Math.max(+url.searchParams.get('days') || 7, 1), 365)), 'application/json', { 'Cache-Control': 'no-store' });
      if (m === 'GET' && p === '/api/admin/events') { const ev = readLines(F('events.jsonl')); return send(res, 200, ev.slice(-Math.min(+url.searchParams.get('limit') || 100, 500)).reverse(), 'application/json', { 'Cache-Control': 'no-store' }); }
      if (m === 'GET' && (p === '/api/admin/leads' || p === '/api/leads')) { const st = leadStatus(); return send(res, 200, readLines(F('leads.jsonl')).map(l => ({ ...l, status: st[l.id] || 'new' })).reverse(), 'application/json', { 'Cache-Control': 'no-store' }); }
      if (m === 'GET' && p === '/api/admin/bids') return send(res, 200, bids.slice().reverse().map(b => ({ ...pub(b), homeId: b.homeId, homeName: b.homeName, name: b.name, phone: b.phone, at: b.at })), 'application/json', { 'Cache-Control': 'no-store' });
      if (m === 'GET' && p === '/api/admin/health') return send(res, 200, health(), 'application/json', { 'Cache-Control': 'no-store' });
      let am = p.match(/^\/api\/admin\/leads\/([0-9a-f-]{36})$/);
      if (am && m === 'POST') { const b = await json(req, res); if (!b) return; if (!['new', 'contacted', 'closed'].includes(b.status)) return send(res, 400, { error: 'status' }); const st = leadStatus(); st[am[1]] = b.status; writeAtomic(F('lead-status.json'), JSON.stringify(st)); return send(res, 200, { ok: true }); }
      am = p.match(/^\/api\/admin\/bids\/([0-9a-f-]{36})$/);
      if (am && m === 'POST') {
        const b = await json(req, res); if (!b) return; const bid = bids.find(x => x.id === am[1]); if (!bid) return send(res, 404, { error: 'not found' });
        const t = new Date().toISOString(), note = clean(b.note, 140);
        if (b.action === 'accept' && bid.status === 'pending') { bid.status = 'accepted'; bid.log.push({ at: t, by: 'owner', text: note || 'Offer accepted', amount: bid.amount }); }
        else if (b.action === 'reject' && bid.status === 'pending') { bid.status = 'rejected'; bid.log.push({ at: t, by: 'owner', text: note || 'Offer declined' }); }
        else if (b.action === 'counter' && bid.status === 'pending' && Number.isFinite(b.counter) && b.counter >= bid.ask * .5 && b.counter <= bid.ask * 1.2) { bid.status = 'countered'; bid.counter = round5(b.counter); bid.log.push({ at: t, by: 'owner', text: note || 'Counter offer', amount: bid.counter }); }
        else return send(res, 409, { error: 'not allowed in this state' });
        bid.updated = t; saveBids(); return send(res, 200, { ok: true, status: bid.status });
      }
    }
    send(res, 404, { error: 'not found' });
  } catch (e) { err = e.message; console.error(e.message); send(res, 500, { error: 'server error' }); }
});

if (import.meta.url === `file://${process.argv[1]}`) {
  prune(); setInterval(prune, 864e5).unref();
  if (!ADMIN_TOKEN) console.warn('ADMIN_TOKEN is not set: /admin and owner APIs are disabled.');
  server.listen(PORT, () => console.log(`ARKO on http://localhost:${PORT}`));
}
