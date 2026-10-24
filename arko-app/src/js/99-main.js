/* ---------- boot ---------- */
fetch('/api/config').then(r => r.ok ? r.json() : null).then(c => { trackReady(!!(c && c.supportPhone)); if (c && c.supportPhone) { SUPPORT.name = c.supportName || SUPPORT.name; SUPPORT.phone = c.supportPhone; $$('.sup-num').forEach(x => x.textContent = fmtPhone(SUPPORT.phone)); } }).catch(() => trackReady(false));
(function () {
  const cur = $('#cur'); cur.value = S.cur;
  cur.onchange = () => { S.cur = cur.value; store.set('cur', S.cur); track('currency', S.cur); route(); };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#talkBtn')) openTalk(null);
    const nav = e.target.closest('.hd nav a[data-s]'); if (nav) { S.q.status = nav.dataset.s; S.q.loc = ''; if (location.hash === '#search') { e.preventDefault(); route(); } }
    const n = e.target.closest('#notesBtn'); if (n) { const on = document.body.classList.toggle('notes'); n.setAttribute('aria-pressed', String(on)); toast(on ? 'Showing where each integration plugs in' : 'Integration notes hidden', 'info'); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
  addEventListener('hashchange', route);
  $$('.sup-num').forEach(x => x.textContent = fmtPhone(SUPPORT.phone));
  route();
})();
