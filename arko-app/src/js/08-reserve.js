/* ---------- reserve flow ---------- */
const STEPS = ['EOI details', 'Verify you', 'Source of funds', 'Pay to escrow', 'Sign'];
const RS = { id: false, fund: '', method: 'bank', paid: false, sig: false };
let sigCleanup = null;

function openReserve() {
  const p = byId(S.pid); if (!p || !S.unit) return;
  Object.assign(RS, { id: false, fund: '', method: 'bank', paid: false, sig: false });
  S.step = 0;
  go('reserve', renderReserve, () => { });
}
function renderReserve() {
  const p = byId(S.pid), u = S.unit, el = V.reserve, k = S.step; track('eoi_step', p.id + ':' + k);
  const price = u.price, f = FEES(price);
  const side = `<aside class="rs-side"><div class="rs-img"><img alt="" src="${imgFor(p)}"></div><h3>${p.name}</h3><p>${u.type} · ${u.size} sqft · unit ${u.no}</p><div class="ln"><span>Price</span>${px(price)}</div><div class="ln"><span>Plan</span><b>${S.planKey}</b></div><div class="ln"><span>EOI amount</span>${px(DEP)}</div><p class="mini">${ICON.lock} Paid straight into the project escrow account.</p></aside>`;
  const bar = `<ol class="stepper">${STEPS.map((s, i) => `<li class="${i < k ? 'done' : i === k ? 'cur' : ''}"><i>${i < k ? ICON.check : i + 1}</i><span>${s}</span></li>`).join('')}</ol>`;
  const panels = [
    `<h2>Express your interest</h2><p class="sub">An EOI (expression of interest) holds this home while you do the paperwork. Nothing is final until the deal closes with the sale agreement.</p>
     <div class="card-s"><div class="ln"><span>Home</span><b>${p.name}, ${u.type}, unit ${u.no}</b></div><div class="ln"><span>Price</span>${px(price)}</div><div class="ln"><span>Cash to start (booking + fees)</span>${px(price * .1 + f.dld + f.trustee + f.admin)}</div><div class="ln"><span>Handover</span><b>${p.ho}</b></div></div>
     <label class="chk"><input type="checkbox" id="c1"><span>I understand that this is an EOI and the sale agreement (SPA) follows.</span></label>`,
    `<h2>Verify who you are</h2><p class="sub">Required by law for every property buyer. Takes about a minute in the real product.</p>
     <div class="vf" id="vf"><button class="btn btn-ghost" id="vUae">Continue with UAE Pass (demo)</button><button class="btn btn-ghost" id="vPass">Scan passport and take a selfie (demo)</button></div>
     <div class="vf-res" id="vfRes" hidden></div>`,
    `<h2>Where do the funds come from?</h2><p class="sub">Anti-money-laundering rules ask for this. It stays private.</p>
     <div class="opts two" id="fund">${['Salary and savings', 'Business income', 'Sale of another property', 'Gift or inheritance'].map(o => `<button class="opt" data-v="${o}"><b>${o}</b></button>`).join('')}</div>
     <h4 class="mt">How will you pay?</h4><div class="seg" id="mseg"><button aria-selected="true" data-v="bank">Bank transfer</button><button aria-selected="false" data-v="card">Card</button><span class="thumb"></span></div>
     <p class="mini">Funds must come from an account in your own name.</p>`,
    `<h2>Pay the EOI amount</h2><p class="sub">Your money goes to the regulated escrow account for ${p.name}, not to us.</p>
     <div class="pay-box"><div class="big">${px(DEP, true)}</div><div class="ln"><span>Pay to</span><b>${p.name} Escrow A/C ••••4821</b></div><div class="ln"><span>Bank</span><b>Regulated UAE escrow bank (demo)</b></div><div class="ln"><span>Refund</span><b>Full refund until the agreement is signed</b></div>
     <button class="btn btn-primary" id="payGo" data-magnetic>${RS.method === 'card' ? 'Pay by card' : 'Confirm transfer'} ${ICON.arrow}</button><div class="spin" id="spin" hidden></div></div>`,
    `<h2>Sign the EOI form</h2><p class="sub">Draw your signature. In the real product this is a legally binding e-signature.</p>
     <div class="sig"><canvas id="sig" height="170"></canvas><button class="btn btn-ghost sm" id="sigClr">Clear</button></div><p class="mini">By signing you agree to the EOI terms (demo text).</p>`
  ];
  const nextLbl = k === 4 ? 'Submit EOI' : 'Continue';
  const foot = k === 3 ? '' : `<div class="rs-foot"><button class="btn btn-ghost" id="rsBack">${ICON.back} Back</button><button class="btn btn-primary" id="rsNext" disabled>${nextLbl} ${ICON.arrow}</button></div>`;
  el.innerHTML = `<div class="wrap rs"><div class="rs-main">${bar}<div class="rs-panel" id="rsP">${panels[k]}${foot}</div></div>${side}</div>`;
  refreshPrices(el);
  const next = $('#rsNext'), ok = v => { if (next) next.disabled = !v; };
  $('#rsBack') && ($('#rsBack').onclick = () => { if (k === 0) { go('project'); } else { S.step--; renderReserve(); } });
  if (next) next.onclick = () => { if (k === 4) return finishReserve(); S.step++; renderReserve(); };
  if (k === 0) { $('#c1').onchange = e => ok(e.target.checked); }
  if (k === 1) {
    const run = label => {
      $('#vf').hidden = true; const r = $('#vfRes'); r.hidden = false;
      r.innerHTML = `<div class="scan"><i></i></div><p>Checking ${label}…</p>`;
      setTimeout(() => { r.innerHTML = `<div class="okc">${ICON.check}</div><b>Identity verified</b><span>Name matched, document in date, selfie matched. (Demo)</span>`; RS.id = true; ok(true); toast('Identity verified'); }, RM ? 100 : 1700);
    };
    $('#vUae').onclick = () => run('your UAE Pass'); $('#vPass').onclick = () => run('your passport and selfie');
    if (RS.id) { $('#vf').hidden = true; $('#vfRes').hidden = false; $('#vfRes').innerHTML = `<div class="okc">${ICON.check}</div><b>Identity verified</b>`; ok(true); }
  }
  if (k === 2) {
    initSeg($('#mseg'), v => RS.method = v);
    $('#fund').onclick = e => { const b = e.target.closest('.opt'); if (!b) return; $$('#fund .opt').forEach(x => x.classList.toggle('sel', x === b)); RS.fund = b.dataset.v; ok(true); };
    if (RS.fund) { $$('#fund .opt').forEach(x => x.classList.toggle('sel', x.dataset.v === RS.fund)); ok(true); }
  }
  if (k === 3) {
    $('#payGo').onclick = () => { $('#payGo').hidden = true; $('#spin').hidden = false; setTimeout(() => { RS.paid = true; toast('Payment received in escrow'); S.step++; renderReserve(); }, RM ? 100 : 1600); };
  }
  if (k === 4) {
    const cv = $('#sig'); cv.width = cv.clientWidth; const c = cv.getContext('2d'); c.lineWidth = 2.6; c.lineCap = 'round'; c.strokeStyle = '#0A2A2E'; let d = false;
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.onpointerdown = e => { d = true; cv.setPointerCapture(e.pointerId); const [x, y] = pt(e); c.beginPath(); c.moveTo(x, y); };
    cv.onpointermove = e => { if (!d) return; const [x, y] = pt(e); c.lineTo(x, y); c.stroke(); if (!RS.sig) { RS.sig = true; ok(true); } };
    cv.onpointerup = () => d = false;
    $('#sigClr').onclick = () => { c.clearRect(0, 0, cv.width, cv.height); RS.sig = false; ok(false); };
  }
  reveal(el);
  scrollTo(0, 0);
}
function finishReserve() {
  const p = byId(S.pid), u = S.unit, ref = 'ARK-' + (hash(p.id + u.no) % 900000 + 100000);
  S.res = { kind: 'off', pid: p.id, unit: u, planKey: S.planKey, ref };
  const el = V.reserve;
  el.innerHTML = `<div class="wrap fin"><canvas id="cf"></canvas><div class="okc big">${ICON.check}</div><h1>Your EOI for ${p.name} is in</h1><p class="lead">${u.type}, unit ${u.no} is held for you. Reference <b>${ref}</b>.</p>
    <ol class="next"><li><b>Today</b><span>Reservation money sits in the project escrow account.</span></li><li><b>Deal closed</b><span>Sign the sale agreement (SPA) and pay the rest of the 10% initial payment.</span></li><li><b>DLD registration</b><span>Your purchase is registered at DLD through Oqood, then instalment reminders begin.</span></li></ol>
    ${feedbackHTML()}<div class="row"><button class="btn btn-primary" id="toTrack" data-magnetic>Track my purchase ${ICON.arrow}</button><button class="btn btn-ghost" id="toHome">Keep browsing</button></div></div>`;
  $('#toTrack').onclick = () => goTracker(); $('#toHome').onclick = () => go('home');
  confetti($('#cf')); bindFeedback(el); toast('EOI submitted');
}

/* ----- test: quick feedback on a flow ----- */
function feedbackHTML() { return `<div class="fb"><span>Was this flow clear?</span><button class="btn btn-ghost sm" data-fb="clear">Clear</button><button class="btn btn-ghost sm" data-fb="confusing">Confusing</button></div>`; }
function bindFeedback(root) { const f = $('.fb', root); if (f) f.onclick = e => { const b = e.target.closest('[data-fb]'); if (!b) return; f.innerHTML = '<span>Thanks. That helps us improve the next version.</span>'; toast('Feedback noted', 'info'); }; }
