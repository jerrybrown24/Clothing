/* ---------- boot ---------- */
fetch('/api/config').then(r => r.ok ? r.json() : null).then(c => { trackReady(!!(c && c.supportPhone)); if (c && c.supportPhone) { SUPPORT.name = c.supportName || SUPPORT.name; SUPPORT.phone = c.supportPhone; $$('.sup-num').forEach(x => x.textContent = fmtPhone(SUPPORT.phone)); } }).catch(() => trackReady(false));
(function () {
  const cur = $('#cur'); cur.value = S.cur;
  cur.onchange = () => { S.cur = cur.value; store.set('cur', S.cur); track('currency', S.cur); refreshPrices(); if (document.body.dataset.view === 'start') renderQ(); if (document.body.dataset.view === 'list') viewList(); updateShortBar(); };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#talkBtn')) openTalk(null);
    const n = e.target.closest('#notesBtn'); if (n) { const on = document.body.classList.toggle('notes'); n.setAttribute('aria-pressed', String(on)); toast(on ? 'Showing where each integration plugs in' : 'Integration notes hidden', 'info'); }
    const st = e.target.closest('#steps li'); if (st) { const k = st.dataset.s; if (k === 'p' || k === 'book') { const id = S.short[0] || LISTINGS[0].id; go((k === 'p' ? 'p-' : 'book-') + id); } else go(k); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
  addEventListener('hashchange', route);
  $$('.sup-num').forEach(x => x.textContent = fmtPhone(SUPPORT.phone));
  route();
})();
