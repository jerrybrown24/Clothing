/* ---------- utilities and shared state ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => 1 - Math.pow(1 - t, 4);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const RATES = { AED: 1, USD: 1 / 3.6725, GBP: 0.204, INR: 22.8 };
const SYM = { AED: 'AED ', USD: '$', GBP: '£', INR: '₹' };

const S = {
  cur: 'AED', market: 'off', filters: new Set(), sort: 'featured',
  saved: new Set(), compare: [],
  goal: null, bud: 0, intStep: 0, agent: null, pid: null, floor: 22, unit: null, planKey: null,
  res: null,            // confirmed reservation {pid, unit, planKey, dep}
  month: 12, playing: false, step: 0, quiz: {}
};

function money(aed, full) {
  const v = aed * RATES[S.cur];
  if (S.cur === 'INR') {
    if (full) return '₹' + Math.round(v).toLocaleString('en-IN');
    return v >= 1e7 ? '₹' + (v / 1e7).toFixed(2) + ' Cr' : '₹' + (v / 1e5).toFixed(1) + ' L';
  }
  if (full) return SYM[S.cur] + Math.round(v).toLocaleString('en-US');
  if (v >= 1e6) return SYM[S.cur] + (v / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  return SYM[S.cur] + Math.round(v / 1e3) + 'K';
}

/* animate a number inside an element (value is always in AED so currency switches count smoothly) */
function tween(el, to, fmt, dur = 750) {
  const from = el._v == null ? to : el._v;
  el._v = to;
  cancelAnimationFrame(el._raf);
  if (RM || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = now => {
    const k = clamp((now - t0) / dur, 0, 1);
    el.textContent = fmt(lerp(from, to, ease(k)));
    if (k < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}
function refreshPrices(root = document) {
  $$('.px', root).forEach(el => {
    const aed = +el.dataset.aed, full = el.dataset.full === '1';
    tween(el, aed, v => money(v, full));
  });
}

const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function R(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

const MONTH0 = new Date(2026, 10, 1);   /* demo "month 0" = November 2026 */
const monthLabel = m => new Date(MONTH0.getFullYear(), MONTH0.getMonth() + m, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

const ICON = {
  heart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M8.8 12.2l2.3 2.3 4.2-4.6"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  doc: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M9.5 13h6M9.5 17h6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
  cube: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

function toast(msg, kind = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.innerHTML = (kind === 'ok' ? ICON.check : ICON.bell) + '<span>' + msg + '</span>';
  $('#toasts').appendChild(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 500); }, 3600);
}
