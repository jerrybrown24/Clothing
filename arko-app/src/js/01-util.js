/* ---------- utilities and shared state ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const RATES = { AED: 1, USD: 1 / 3.6725, GBP: 0.204, INR: 22.8 };
const SYM = { AED: 'AED ', USD: '$', GBP: '£', INR: '₹' };
const store = {
  get(k, d) { try { const v = localStorage.getItem('arko.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('arko.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
};
const S = {
  cur: store.get('cur', 'AED'),
  answers: store.get('answers', null),          /* {goal, bud, when} */
  short: store.get('short', []),                 /* shortlisted listing ids */
  pick: {},                                      /* listing id -> {type, plan} */
  booking: store.get('booking', null),           /* confirmed booking */
  filters: { area: '', beds: '', sort: 'match' }
};
function money(aed, full) {
  const v = aed * RATES[S.cur];
  if (S.cur === 'INR') return full ? '₹' + Math.round(v).toLocaleString('en-IN') : v >= 1e7 ? '₹' + (v / 1e7).toFixed(2) + ' Cr' : '₹' + (v / 1e5).toFixed(1) + ' L';
  if (full) return SYM[S.cur] + Math.round(v).toLocaleString('en-US');
  if (v >= 1e6) return SYM[S.cur] + (v / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  return SYM[S.cur] + Math.round(v / 1e3) + 'K';
}
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function R(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const MONTH0 = new Date(2026, 10, 1);
const monthLabel = m => new Date(MONTH0.getFullYear(), MONTH0.getMonth() + m, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
const SUPPORT = { name: 'Ajinkya', phone: '+971586352359' };
const fmtPhone = p => p.replace(/^\+971(\d{2})(\d{3})(\d{4})$/, '+971 $1 $2 $3');

const I = (d, w = 20) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  heart: I('<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 18), arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>', 18), back: I('<path d="M19 12H5M11 6l-6 6 6 6"/>', 18),
  x: I('<path d="M6 6l12 12M18 6L6 18"/>', 18), phone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>', 18),
  shield: I('<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M8.8 12.2l2.3 2.3 4.2-4.6"/>', 16), doc: I('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M9.5 13h6M9.5 17h6"/>'),
  lock: I('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>', 16), play: I('<path d="M7 4l13 8-13 8z"/>', 18), pause: I('<path d="M8 5v14M16 5v14"/>', 18),
  metro: I('<rect x="6" y="3" width="12" height="14" rx="3"/><path d="M6 11h12M9 21l1.5-4M15 21l-1.5-4"/>', 18), mall: I('<path d="M5 8h14l-1 13H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>', 18),
  beach: I('<path d="M3 20c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1"/><path d="M12 15V5M5 9a7 7 0 0 1 14 0z"/>', 18), school: I('<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c3 2 7 2 10 0v-4.5"/>', 18),
  hospital: I('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>', 18), plane: I('<path d="M10 14l-6 2 1-3 5-2V5a2 2 0 0 1 4 0v6l5 2 1 3-6-2v4l2 2h-6l2-2z"/>', 18),
  city: I('<path d="M4 21V9l5-3v15M9 21V3l6 3v15M15 21v-9l5 2v7M2 21h20"/>', 18), cube: I('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9"/>', 18),
  grid: I('<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>', 18),
  walk: I('<circle cx="13" cy="4" r="2"/><path d="M10 21l2-6 3 3v3M8 12l2-4 4 1 2 3M12 15l-1-6"/>', 18), film: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>', 18),
  img: I('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 8"/>', 18)
};
function toast(msg, kind = 'ok') {
  const t = document.createElement('div'); t.className = 'toast ' + kind; t.setAttribute('role', 'status');
  t.innerHTML = (kind === 'ok' ? ICON.check : '') + '<span>' + esc(msg) + '</span>';
  $('#toasts').appendChild(t); setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2600);
}
