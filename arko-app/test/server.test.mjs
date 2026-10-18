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
test('leads endpoint needs the token', async () => assert.equal((await fetch(base + '/api/leads')).status, 404));
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
