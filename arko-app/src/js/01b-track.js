/* ---------- usage tracking: no cookies, no names, no phone numbers ---------- */
let LIVE = null;                       /* null until /api/config answers; false when there is no backend */
const TQ = [];
const SID = (() => { try { let s = sessionStorage.getItem('arkoSid'); if (!s) { s = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); sessionStorage.setItem('arkoSid', s); } return s; } catch (e) { return 'x' + Math.random().toString(36).slice(2, 12); } })();
const DNT = navigator.doNotTrack === '1' || window.doNotTrack === '1';
const REF = (() => { try { return document.referrer ? new URL(document.referrer).host : ''; } catch (e) { return ''; } })();
let refSent = false;
function sendEvent(e) {
  const body = JSON.stringify(e);
  try { if (navigator.sendBeacon && navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }))) return; } catch (x) { /* fall through */ }
  fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => { });
}
function track(type, name = '', props) {
  if (DNT || LIVE === false) return;
  const e = { sid: SID, type, name: String(name).slice(0, 80), view: document.body ? document.body.dataset.view || '' : '' };
  if (props) e.props = props;
  if (!refSent && REF) { e.ref = REF; refSent = true; }
  if (LIVE === null) { TQ.push(e); return; }
  sendEvent(e);
}
function trackReady(on) { LIVE = on; if (on) TQ.splice(0).forEach(sendEvent); else TQ.length = 0; }
function clickName(el) {
  if (el.dataset.track) return el.dataset.track;
  if (el.classList.contains('heart')) return 'heart:' + (el.closest('.card') || {dataset: {}}).dataset.id;
  if (el.getAttribute('href')) return 'link:' + el.getAttribute('href').slice(0, 40);
  if (el.id) return '#' + el.id;
  for (const k of ['m', 'drop', 'go', 't', 'kyc', 'beds', 'rm', 'v', 'w', 'fb', 'talk']) if (el.dataset[k] != null) return k + ':' + el.dataset[k];
  if (el.classList.contains('save')) return 'save';
  return (el.getAttribute('aria-label') || el.textContent || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 40);
}
document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('button,a,[role=button],.opt,.chip'); if (el && !el.closest('#toasts')) track('click', clickName(el)); }, true);
