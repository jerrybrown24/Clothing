/* ---------- booking (call or EOI), talk modal, tracker ---------- */
const EOI = 40000;
const PATH = [['Choose unit', 'Type and payment plan'], ['Talk or reserve', 'Video call, or EOI online'], ['EOI and KYC', 'Verify you, pay into escrow'], ['Deal closed', 'Sign the sale agreement (SPA)'], ['Initial payment', 'Rest of the 10% booking'], ['DLD registration', 'Oqood issued in your name'], ['Instalments', 'Reminders until handover']];
let BK = null;   /* in-progress booking */
async function postJSON(url, body) { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(r.status); return r.json(); }
const pathHTML = cur => `<ol class="path">${PATH.map(([t, d], i) => `<li class="${i < cur ? 'done' : i === cur ? 'cur' : ''}"><i>${i < cur ? ICON.check : i + 1}</i><div><b>${t}</b><small>${d}</small></div></li>`).join('')}</ol>`;
const days = () => [...Array(5)].map((_, i) => new Date(Date.now() + (i + 1) * 864e5).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
const chipset = (id, arr, sel = 0) => `<div class="chips" id="${id}">${arr.map((x, i) => `<button type="button" class="chip" aria-pressed="${i === sel}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>`;
const chosen = id => ($('#' + id + ' .chip[aria-pressed=true]') || {}).dataset.v;
const contactFields = p => `<label class="fld">Your name<input id="${p}Name" autocomplete="name" maxlength="80"></label><label class="fld">Mobile number<input id="${p}Phone" type="tel" autocomplete="tel" placeholder="+971 50 000 0000" maxlength="20"></label><input id="${p}Web" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="chk"><input type="checkbox" id="${p}Ok"><span>ARKO may contact me about this enquiry and keep my details for that purpose.</span></label>`;
const contactOk = p => $('#' + p + 'Name').value.trim().length >= 2 && $('#' + p + 'Phone').value.replace(/\D/g, '').length >= 7 && $('#' + p + 'Ok').checked;
function bindChips(root) { root.addEventListener('click', e => { const c = e.target.closest('.chips .chip'); if (c && !c.closest('[data-beds]') && c.parentNode.id) $$('.chip', c.parentNode).forEach(x => x.setAttribute('aria-pressed', String(x === c))); }); }

function viewBook(L) {
  S.pick[L.id] = S.pick[L.id] || { t: 0 };
  BK = { L, step: 'choose' };
  renderBook();
}
function renderBook() {
  const { L } = BK, t = S.pick[L.id].t, price = unitPrice(L, t), cur = { choose: 0, how: 1, call: 1, kyc: 2, pay: 2, sign: 2, done: 3, called: 1 }[BK.step];
  const side = `<aside class="b-side"><img src="${imgFor(L)}" alt=""><h3>${esc(L.name)}</h3><p class="muted">${esc(L.area)}</p><div class="ln"><span>Home</span><b>${L.types[t][0]}, ${L.types[t][1]} sqft</b></div><div class="ln"><span>Price</span>${px(price)}</div><div class="ln"><span>Plan</span><b>${L.plan}</b></div><div class="ln"><span>Handover</span><b>${L.ho}</b></div>${pathHTML(cur)}</aside>`;
  let main = '';
  if (BK.step === 'choose') main = `<h1>Which home would you like?</h1><div class="opts">${L.types.map((x, i) => `<button class="opt ${i === t ? 'sel' : ''}" data-t="${i}"><b>${x[0]}</b><span>${x[1]} sqft · ${money(unitPrice(L, i))}</span></button>`).join('')}</div><div class="b-foot"><a class="btn btn-ghost" href="#p-${L.id}">${ICON.back} Back</a><button class="btn btn-primary" data-go="how">Continue ${ICON.arrow}</button></div>`;
  if (BK.step === 'how') main = `<h1>How would you like to go ahead?</h1><p class="lead">Most buyers talk to us first. You can also reserve now. The EOI is refundable until you sign the sale agreement (demo terms).</p>
    <div class="how2"><button class="opt lg" data-go="call">${ICON.phone}<b>Book a video call</b><span>${SUPPORT.name} walks you through the project, the unit and the payment plan. 30 minutes.</span></button>
    <button class="opt lg" data-go="kyc">${ICON.lock}<b>Reserve now with an EOI</b><span>Verify your identity and pay ${money(EOI, true)} into the project escrow account. About 5 minutes.</span></button></div>
    <div class="b-foot"><button class="btn btn-ghost" data-go="choose">${ICON.back} Back</button><span></span></div>`;
  if (BK.step === 'call') main = `<h1>Book a video call</h1><p class="lead">Pick a time. ${SUPPORT.name} will call you on WhatsApp video or a phone call.</p><p class="lbl">Day</p>${chipset('cDay', days())}<p class="lbl">Time (Dubai)</p>${chipset('cTime', ['10:00', '12:30', '16:00', '18:30'])}${contactFields('c')}<p class="err" id="cErr" role="alert" hidden></p>
    <div class="b-foot"><button class="btn btn-ghost" data-go="how">${ICON.back} Back</button><button class="btn btn-primary" id="cGo" disabled${int('ARKO backend: lead saved, owner alerted (live on hosted site)')}>Confirm call</button></div>`;
  if (BK.step === 'called') main = `<div class="ok-big">${ICON.check}</div><h1>Your call is booked</h1><p class="lead">${esc(BK.when)}. ${SUPPORT.name} will call you about ${esc(L.name)}. If something comes up, call him on <a href="tel:${SUPPORT.phone}">${fmtPhone(SUPPORT.phone)}</a>.${LIVE ? '' : ' <em class="muted">(Preview: nothing was sent.)</em>'}</p><div class="b-foot"><a class="btn btn-ghost" href="#compare">Compare more homes</a><button class="btn btn-primary" data-go="kyc">Reserve now instead</button></div>`;
  if (BK.step === 'kyc') main = `<h1>Verify who you are</h1><p class="lead">Required for every property buyer in the UAE. It takes about a minute.</p>
    <div class="how2"${int('UAE Pass / passport KYC provider (simulated)')}><button class="opt lg" data-kyc="UAE Pass"><b>Continue with UAE Pass</b><span>For UAE residents</span></button><button class="opt lg" data-kyc="passport"><b>Passport and selfie</b><span>For buyers outside the UAE</span></button></div><div id="kycRes"></div>
    <div class="b-foot"><button class="btn btn-ghost" data-go="how">${ICON.back} Back</button><button class="btn btn-primary" data-go="pay" id="kGo" ${BK.kyc ? '' : 'disabled'}>Continue ${ICON.arrow}</button></div>`;
  if (BK.step === 'pay') main = `<h1>Pay the EOI into escrow</h1><p class="lead">This holds your home. It counts towards the 10% booking payment.</p>
    <div class="paybox"${int('Payment gateway + project escrow bank (simulated)')}><div class="big">${money(EOI, true)}</div><div class="ln"><span>Paid to</span><b>${esc(L.name)} escrow account ••••4821 (demo)</b></div><div class="ln"><span>Refund</span><b>Full refund until the SPA is signed (demo terms)</b></div><div class="ln"><span>Method</span><b>Card or bank transfer</b></div></div>
    <div class="b-foot"><button class="btn btn-ghost" data-go="kyc">${ICON.back} Back</button><button class="btn btn-primary" id="pGo">${BK.paid ? 'Paid. Continue' : 'Pay ' + money(EOI, true)}</button></div>`;
  if (BK.step === 'sign') main = `<h1>Sign the EOI form</h1><p class="lead">Draw your signature below. The sale agreement (SPA) follows from the developer.</p><div class="sig"${int('E-signature provider (simulated)')}><canvas id="sig" height="170" aria-label="Signature pad"></canvas><button class="btn btn-ghost sm" id="sClr">Clear</button></div>
    <div class="b-foot"><button class="btn btn-ghost" data-go="pay">${ICON.back} Back</button><button class="btn btn-primary" id="sGo" disabled>Submit EOI</button></div>`;
  if (BK.step === 'done') main = `<div class="ok-big">${ICON.check}</div><h1>${esc(L.name)} is reserved for you</h1><p class="lead">${L.types[t][0]}, reference <b>${esc(S.booking.ref)}</b>. Next, the developer sends the sale agreement. Signing it closes the deal.</p>
    <div class="fb"><span>Was booking easy?</span><button class="btn btn-ghost sm" data-fb="easy">Yes</button><button class="btn btn-ghost sm" data-fb="hard">Not really</button></div><div class="b-foot"><span></span><a class="btn btn-primary" href="#track">Track my purchase ${ICON.arrow}</a></div>`;
  view().innerHTML = `<section class="wrap book"><div class="b-main">${main}</div>${side}</section>`;
  track('eoi_step', L.id + ':' + BK.step);
  const root = view(); bindChips(root);
  root.onclick = async e => {
    const g = e.target.closest('[data-go]'); if (g && !g.disabled) { BK.step = g.dataset.go; if (BK.step === 'call' || BK.step === 'kyc') track('book', L.id, { mode: BK.step === 'call' ? 'call' : 'eoi' }); renderBook(); return; }
    const o = e.target.closest('[data-t]'); if (o) { S.pick[L.id].t = +o.dataset.t; renderBook(); return; }
    const k = e.target.closest('[data-kyc]'); if (k) { $('#kycRes').innerHTML = `<div class="okrow"><span class="spin"></span>Checking your ${esc(k.dataset.kyc)}…</div>`; await sleep(RM ? 50 : 1300); BK.kyc = k.dataset.kyc; $('#kycRes').innerHTML = `<div class="okrow ok">${ICON.check} Identity verified (demo)</div>`; $('#kGo').disabled = false; toast('Identity verified'); }
    const f = e.target.closest('[data-fb]'); if (f) { track('click', 'feedback:' + f.dataset.fb); f.parentNode.innerHTML = '<span>Thanks, that helps us improve.</span>'; }
  };
  if (BK.step === 'call') {
    const btn = $('#cGo'), chk = () => btn.disabled = !contactOk('c');
    ['cName', 'cPhone', 'cOk'].forEach(i => $('#' + i).addEventListener('input', chk));
    btn.onclick = async () => {
      BK.when = chosen('cDay') + ' at ' + chosen('cTime'); btn.disabled = true; btn.textContent = 'Booking…';
      try { if (LIVE) await postJSON('/api/lead', { kind: 'call', name: $('#cName').value.trim(), phone: $('#cPhone').value.trim(), when: BK.when, home: L.name + ' · ' + L.types[S.pick[L.id].t][0], goal: S.answers ? S.answers.goal : '', budget: S.answers ? S.answers.bud || 0 : 0, consent: true, website: $('#cWeb').value }); track('lead', 'call'); BK.step = 'called'; renderBook(); }
      catch (er) { btn.disabled = false; btn.textContent = 'Confirm call'; const x = $('#cErr'); x.textContent = `We could not book that. Please call ${SUPPORT.name} on ${fmtPhone(SUPPORT.phone)}.`; x.hidden = false; }
    };
  }
  if (BK.step === 'pay') $('#pGo').onclick = async () => { const b = $('#pGo'); if (!BK.paid) { b.disabled = true; b.innerHTML = '<span class="spin"></span> Processing'; await sleep(RM ? 50 : 1400); BK.paid = true; toast('Payment received in escrow (demo)'); } BK.step = 'sign'; renderBook(); };
  if (BK.step === 'sign') {
    const cv = $('#sig'); cv.width = cv.clientWidth; const c = cv.getContext('2d'); c.lineWidth = 2.6; c.lineCap = 'round'; c.strokeStyle = '#0A2A2E'; let d = false;
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.onpointerdown = e => { d = true; cv.setPointerCapture(e.pointerId); const [x, y] = pt(e); c.beginPath(); c.moveTo(x, y); };
    cv.onpointermove = e => { if (!d) return; const [x, y] = pt(e); c.lineTo(x, y); c.stroke(); $('#sGo').disabled = false; };
    cv.onpointerup = () => d = false;
    $('#sClr').onclick = () => { c.clearRect(0, 0, cv.width, cv.height); $('#sGo').disabled = true; };
    $('#sGo').onclick = () => { const t = S.pick[L.id].t; S.booking = { id: L.id, t, price: unitPrice(L, t), ref: 'ARK-' + (hash(L.id + Date.now()) % 900000 + 100000), at: Date.now() }; store.set('booking', S.booking); track('book', L.id, { mode: 'eoi_done' }); BK.step = 'done'; renderBook(); };
  }
  refreshPrices(root);
}

/* ----- talk to us ----- */
function openTalk(L) {
  track('agent', L ? L.id : 'header');
  const m = $('#modal');
  m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="tTitle"><button class="x" data-close aria-label="Close">${ICON.x}</button>
    <h2 id="tTitle">Talk to ${SUPPORT.name}</h2><p class="muted">Your ARKO property adviser.</p>
    <div class="callcard"><div><small>Call support</small><b>${fmtPhone(SUPPORT.phone)}</b></div><a class="btn btn-primary" href="tel:${SUPPORT.phone}">${ICON.phone} Call now</a></div>
    <h3>Or ask us to call you</h3>${chipset('tWhen', ['As soon as possible', 'This evening', 'Tomorrow morning'])}${contactFields('t')}<p class="err" id="tErr" role="alert" hidden></p><button class="btn btn-primary" id="tGo" disabled>Request a call back</button></div>`;
  m.hidden = false; requestAnimationFrame(() => m.classList.add('on')); bindChips(m);
  const go = $('#tGo'); ['tName', 'tPhone', 'tOk'].forEach(i => $('#' + i).addEventListener('input', () => go.disabled = !contactOk('t')));
  go.onclick = async () => {
    go.disabled = true; go.textContent = 'Sending…';
    try { if (LIVE) await postJSON('/api/lead', { kind: 'call', name: $('#tName').value.trim(), phone: $('#tPhone').value.trim(), when: chosen('tWhen'), home: L ? L.name : '', consent: true, website: $('#tWeb').value }); track('lead', 'callback');
      $('.sheet', m).innerHTML = `<button class="x" data-close aria-label="Close">${ICON.x}</button><div class="ok-big">${ICON.check}</div><h2>We'll call you</h2><p class="muted">${esc(chosen('tWhen') || 'Soon')}. If it's urgent, call ${SUPPORT.name} on ${fmtPhone(SUPPORT.phone)}.${LIVE ? '' : ' (Preview: nothing was sent.)'}</p><button class="btn btn-primary" data-close>Done</button>`; }
    catch (e) { go.disabled = false; go.textContent = 'Request a call back'; $('#tErr').textContent = `We could not send that. Please call ${SUPPORT.name} on ${fmtPhone(SUPPORT.phone)}.`; $('#tErr').hidden = false; }
  };
  setTimeout(() => $('.sheet a', m).focus(), 50);
}
function closeModal() { const m = $('#modal'); m.classList.remove('on'); setTimeout(() => { m.hidden = true; m.innerHTML = ''; }, 250); }

/* ----- tracker ----- */
function viewTrack() {
  const b = S.booking;
  if (!b) { view().innerHTML = `<section class="wrap empty-state"><h1>Track your purchase</h1><p class="lead">After you reserve a home, every step shows here: DLD registration, construction, payments and documents.</p><div class="row"><a class="btn btn-primary" href="#list">Find a home</a><button class="btn btn-ghost" id="demoB">See a sample</button></div></section>`;
    $('#demoB').onclick = () => { S.booking = { id: 'solace-marina', t: 1, price: unitPrice(byId('solace-marina'), 1), ref: 'ARK-DEMO01', at: Date.now(), demo: true }; viewTrack(); }; return; }
  const L = byId(b.id), sch = schedule(L, b.price), maxM = L.hm + 3, oq = 'OQ-' + (hash(b.ref) % 9000000 + 1000000);
  const ST = [['EOI submitted', 'Home held, EOI in escrow', 0], ['Deal closed', 'Sale agreement (SPA) signed', 1], ['Initial payment', 'Rest of the 10% booking paid', 1], ['DLD registration', 'Oqood issued in your name', 2], ['Construction', 'Checked by RERA inspectors', 3], ['Handover', 'Keys and snagging', L.hm], ['Title deed', 'Ownership in your name', L.hm + 2]];
  const DOCS = [['EOI form and receipt', 0], ['Sale agreement (SPA)', 1], ['Oqood certificate', 2], ['Payment receipts', 2], ['Construction progress report', 6], ['Handover notice', L.hm], ['Title deed', L.hm + 2]];
  view().innerHTML = `<section class="wrap trk"><div class="t-head"><img src="${imgFor(L)}" alt=""><div><p class="eyebrow">Reference ${esc(b.ref)}${b.demo ? ' · sample' : ''}</p><h1>${esc(L.name)}</h1><p class="muted">${L.types[b.t][0]} · ${esc(L.area)} · ${px(b.price)}</p></div></div>
    <div class="tm"><label for="tm">Demo: move through time</label><input id="tm" type="range" min="0" max="${maxM}" value="1"><b id="tmL"></b></div>
    <div class="next" id="next"></div>
    <div class="t-grid">
      <section class="tc"><h3>Your journey</h3><ol class="stages" id="stg">${ST.map(s => `<li data-at="${s[2]}"><i></i><div><b>${s[0]}</b><small>${s[1]}</small></div></li>`).join('')}</ol></section>
      <section class="tc"${int('DLD API gateway: Oqood status (simulated)')}><h3>DLD registration</h3><p class="pill" id="dPill"></p><div class="ln"><span>Oqood number</span><b id="oq"></b></div><div class="ln"><span>DLD fee (4%)</span><b id="dFee"></b></div><h3 class="mt">Construction</h3><div class="meter"><i id="prog"></i></div><p class="muted" id="progT"></p></section>
      <section class="tc wide"${int('Reminders by WhatsApp, SMS and email (simulated)')}><h3>Payments and reminders</h3><div id="pays"></div></section>
      <section class="tc"><h3>Documents</h3><ul class="docs" id="docs">${DOCS.map(d => `<li data-at="${d[1]}">${ICON.doc}<span>${d[0]}</span><em></em></li>`).join('')}</ul></section>
    </div></section>`;
  const upd = m => {
    $('#tmL').textContent = monthLabel(m);
    $$('#stg li').forEach((li, i, all) => { const at = +li.dataset.at, nx = all[i + 1] ? +all[i + 1].dataset.at : 1e9; li.className = m >= nx ? 'done' : m >= at ? 'now' : ''; $('i', li).innerHTML = m >= nx ? ICON.check : ''; });
    const reg = m >= 2; $('#dPill').textContent = reg ? 'Registered' : m >= 1 ? 'Sent to DLD trustee' : 'Waiting for SPA'; $('#dPill').className = 'pill ' + (reg ? 'ok' : 'wait');
    $('#oq').textContent = reg ? oq : 'Issued on registration'; $('#dFee').textContent = m >= 1 ? 'Paid' : money(b.price * .04);
    const pc = m < 3 ? 0 : m >= L.hm ? 100 : Math.round(15 + (m - 3) / (L.hm - 3) * 85); $('#prog').style.width = pc + '%'; $('#progT').textContent = pc + '% complete' + (pc && pc < 100 ? ', next inspection ' + monthLabel(Math.min(L.hm, m + 3)) : '');
    let nextI = sch.findIndex(s => s.m > m);
    $('#pays').innerHTML = sch.map((s, i) => `<div class="py ${s.m <= m ? 'paid' : i === nextI ? 'due' : ''}"><i>${s.m <= m ? ICON.check : ''}</i><span>${s.n}<small>${monthLabel(s.m)}</small></span><b>${px(s.amt)}</b><em>${s.m <= m ? 'Paid' : i === nextI ? (s.m - m <= 1 ? 'Due this month' : 'Due in ' + (s.m - m) + ' months') : 'Upcoming'}</em></div>`).join('');
    $$('#docs li').forEach(li => { const ok = m >= +li.dataset.at; li.className = ok ? 'ok' : ''; $('em', li).textContent = ok ? 'Ready' : 'Later'; });
    const nx = sch[nextI]; $('#next').innerHTML = nx ? `<b>Next</b><span>${nx.n}: ${px(nx.amt)} on ${monthLabel(nx.m)}. We remind you a week before.</span>` : '<b>All paid</b><span>We keep following up on handover and your title deed.</span>';
  };
  $('#tm').oninput = e => upd(+e.target.value); upd(1);
}
