/* ---------- journey map (design thinking) ---------- */
function renderJourney() {
  const J = [['Discover', 'What can I afford, and where?', 'Many portals, unclear total cost', 'Three questions, ranked matches'], ['Options', 'Off-plan or ready?', 'Mixed listings, old data', 'One toggle, same clear cards'], ['See in 3D', 'Is this my exact home?', 'Brochure renders only', 'Pick floor and unit, look around'], ['Analyse', 'Is it a good deal?', 'No cost or return view', 'Area returns, yield, total cost, model'], ['Advice', 'Do I need an agent?', 'Pushy or absent', 'Call or meet, only if you want'], ['Deal', 'How do I secure it?', 'Unclear EOI, bids by phone', 'EOI online, or viewing and bidding'], ['Pay and register', 'Where does my money go?', 'Bank paperwork, hidden fees', 'Escrow, loan steps, DLD status'], ['Own', 'What happens next?', 'Missed instalments, lost files', 'Reminders, vault, follow-ups']];
  const W = 1600, pts = a => a.map((v, i) => [((i + .5) / 8 * W).toFixed(0), (110 - v * 100).toFixed(0)]), line = a => pts(a).map((p, i) => (i ? 'L' : 'M') + p.join(',')).join(' ');
  const wo = [.55, .42, .5, .3, .26, .36, .2, .5], wi = [.62, .66, .8, .76, .8, .76, .72, .92];
  $('#jm').innerHTML = `<svg viewBox="0 0 ${W} 120" preserveAspectRatio="none" class="curve" role="img" aria-label="Buyer confidence across stages, higher with ARKO"><path d="${line(wo)}" class="c0" pathLength="1"/><path d="${line(wi)}" class="c1" pathLength="1"/></svg>
   <div class="legend2"><span><i class="l0"></i>Typical journey</span><span><i class="l1"></i>With ARKO</span><span class="mini">Buyer confidence, illustrative</span></div>
   <div class="jm-cols">${J.map((s, i) => `<div class="jc"><h4>${s[0]}</h4><small>You ask</small><p>${s[1]}</p><small>Usual friction</small><p>${s[2]}</p><small>ARKO answer</small><p class="ans">${s[3]}</p></div>`).join('')}</div>`;
  reveal($('#jm'));
}
(function () {
  initHome(); renderJourney();
  const cs = $('#curSeg'); initSeg(cs, v => { S.cur = v; S.drawBud && S.drawBud(); refreshPrices(); S.renderIntent(); if (S.compare.length >= 2 && !$('#modal').hidden) compareModal(); });
  document.addEventListener('click', e => {
    const n = e.target.closest('[data-nav]'); if (n) { if (n.dataset.nav === 'tracker') goTracker(); else goHome(); return; }
    const s = e.target.closest('[data-scroll]'); if (s) { e.preventDefault(); goHome(s.dataset.scroll); return; }
    if (e.target.closest('#talkBtn,#talkBtn2')) { openAgent(); return; }
    if (e.target.closest('[data-close]')) closeModal();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
  initCursor(); initTrail(); initHeroGL();
  initRotator(); split($('#l1')); $('#l1').classList.add('in'); weightField($('#l1'));
  initMarquee(); initMicro(); reveal(V.home);
  const hd = $('.hd'); addEventListener('scroll', () => hd.classList.toggle('sc', scrollY > 20), { passive: true });
  document.body.dataset.view = 'home'; document.body.classList.add('ready');
})();
