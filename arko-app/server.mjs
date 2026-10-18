// ARKO web app server. No dependencies; Node 20+.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = +process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const LEADS = path.join(DATA_DIR, 'leads.jsonl');
const CFG = {
  supportName: process.env.SUPPORT_NAME || 'Ajinkya',
  supportPhone: process.env.SUPPORT_PHONE || '+971586352359',
};
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const WEBHOOK = process.env.LEAD_WEBHOOK_URL || '';
const MAX_BODY = 10 * 1024, RATE_MAX = 5, RATE_WINDOW = 3600e3;
const hits = new Map();

const rateOk = ip => {
  const now = Date.now(), a = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (a.length >= RATE_MAX) { hits.set(ip, a); return false; }
  a.push(now); hits.set(ip, a); return true;
};

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

const clean = v => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();

async function saveLead(b, ip) {
  const rec = { id: crypto.randomUUID(), at: new Date().toISOString(), kind: b.kind, name: clean(b.name), phone: clean(b.phone), when: clean(b.when), home: clean(b.home), goal: clean(b.goal), budget: b.budget || 0, consent: true, ipHash: crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'arko')).digest('hex').slice(0, 12) };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(LEADS, JSON.stringify(rec) + '\n');
  if (WEBHOOK) {
    const text = `ARKO ${rec.kind === 'call' ? 'call back' : 'meeting'} request: ${rec.name}, ${rec.phone}, ${rec.when}${rec.home ? ', about ' + rec.home : ''}`;
    fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }).catch(() => console.error('webhook failed'));
  }
  return rec;
}

const SEC = {
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'",
};
const send = (res, code, body, type = 'application/json', extra = {}) => { res.writeHead(code, { 'Content-Type': type, ...SEC, ...extra }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };

let pageCache = { m: 0, d: 0, html: '' };
function page() {
  const pf = path.join(ROOT, 'public/index.html'), df = path.join(DATA_DIR, 'dld-area-stats.json');
  const pm = fs.statSync(pf).mtimeMs, dm = fs.existsSync(df) ? fs.statSync(df).mtimeMs : 0;
  if (pm !== pageCache.m || dm !== pageCache.d) {
    let html = fs.readFileSync(pf, 'utf8');
    if (dm) { try { const j = JSON.stringify(JSON.parse(fs.readFileSync(df, 'utf8'))).replace(/</g, '\\u003c'); html = html.replace('id="dld">null<', 'id="dld">' + j + '<'); } catch { console.error('bad dld-area-stats.json, serving demo data'); } }
    pageCache = { m: pm, d: dm, html };
  }
  return pageCache.html;
}

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x'), ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) return send(res, 200, page(), 'text/html; charset=utf-8', { 'Cache-Control': 'no-cache' });
    if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true });
    if (req.method === 'GET' && url.pathname === '/api/config') return send(res, 200, CFG, 'application/json', { 'Cache-Control': 'no-cache' });
    if (req.method === 'GET' && url.pathname === '/api/stats') { const f = path.join(DATA_DIR, 'dld-area-stats.json'); return fs.existsSync(f) ? send(res, 200, fs.readFileSync(f), 'application/json') : send(res, 404, { error: 'no data' }); }
    if (req.method === 'GET' && url.pathname === '/api/leads') {
      const t = (req.headers.authorization || '').replace(/^Bearer /, '');
      if (!ADMIN_TOKEN || t.length !== ADMIN_TOKEN.length || !crypto.timingSafeEqual(Buffer.from(t), Buffer.from(ADMIN_TOKEN))) return send(res, 404, { error: 'not found' });
      const rows = fs.existsSync(LEADS) ? fs.readFileSync(LEADS, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
      return send(res, 200, rows);
    }
    if (req.method === 'POST' && url.pathname === '/api/lead') {
      if (!/^application\/json/.test(req.headers['content-type'] || '')) return send(res, 415, { error: 'json only' });
      let size = 0; const chunks = [];
      for await (const c of req) { size += c.length; if (size > MAX_BODY) return send(res, 413, { error: 'too large' }); chunks.push(c); }
      let b; try { b = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(res, 400, { error: 'bad json' }); }
      if (b && b.website) return send(res, 200, { ok: true });            // honeypot: pretend success
      if (!rateOk(ip)) return send(res, 429, { error: 'too many requests' });
      const bad = validateLead(b); if (bad.length) return send(res, 400, { error: 'invalid', fields: bad });
      const rec = await saveLead(b, ip);
      return send(res, 200, { ok: true, id: rec.id });
    }
    send(res, 404, { error: 'not found' });
  } catch (e) { console.error(e.message); send(res, 500, { error: 'server error' }); }
});

if (import.meta.url === `file://${process.argv[1]}`) server.listen(PORT, () => console.log(`ARKO on http://localhost:${PORT}`));
