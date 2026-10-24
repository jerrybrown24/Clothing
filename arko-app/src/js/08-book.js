/* ---------- booking: off-plan (call or EOI) and ready (viewing, offer, finance, deposit, transfer) ---------- */
const EOI = 40000;
const OFF_PATH = [['Talk or reserve', 'Video call, or reserve online'], ['Verify you', 'UAE Pass or passport'], ['Pay the EOI', 'Into the project escrow'], ['Sign the EOI', 'Online signature'], ['Deal closed', 'Sign the SPA'], ['Initial payment', 'Rest of the first instalment'], ['DLD registration', 'Oqood in your name'], ['Instalments', 'Reminders to handover']];
const READY_PATH = [['Viewing', 'In person or video'], ['Offer', 'Seller accepts, counters or declines'], ['Cash or mortgage', 'Bank approval if needed'], ['Deposit', '10% to the trustee'], ['Sign Form F', 'Sale contract'], ['DLD transfer', 'At the trustee office'], ['Keys', 'Title deed in your name']];
let BK = null, BK_POLL = 0;
async function postJSON(url, body) { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(r.status); return r.json(); }
const days = () => [...Array(5)].map((_, i) => new Date(Date.now() + (i + 1) * 864e5).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
const chipset = (id, arr, sel = 0) => `<div class="chips" id="${id}">${arr.map((x, i) => `<button type="button" class="chip" aria-pressed="${i === sel}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>`;
const chosen = id => ($('#' + id + ' .chip[aria-pressed=true]') || {}).dataset.v;
const contact = p => `<div class="two"><label class="fld">Your name<input id="${p}Name" autocomplete="name" maxlength="80" value="${esc(BK && BK.c ? BK.c.name : '')}"></label><label class="fld">Mobile number<input id="${p}Phone" type="tel" autocomplete="tel" placeholder="+971 50 000 0000" maxlength="20" value="${esc(BK && BK.c ? BK.c.phone : '')}"></label></div><input id="${p}Web" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="chk"><input type="checkbox" id="${p}Ok" ${BK && BK.c ? 'checked' : ''}><span>ARKO may contact me about this and keep my details for that purpose.</span></label>`;
const cOk = p => $('#' + p + 'Name').value.trim().length >= 2 && $('#' + p + 'Phone').value.replace(/\D/g, '').length >= 7 && $('#' + p + 'Ok').checked;
const cGet = p => (BK.c = { name: $('#' + p + 'Name').value.trim(), phone: $('#' + p + 'Phone').value.trim() });
function chipsIn(root) { root.addEventListener('click', e => { const c = e.target.closest('.chips[id] .chip'); if (c) $$('.chip', c.parentNode).forEach(x => x.setAttribute('aria-pressed', String(x === c))); }); }
const pathHTML = (P, cur) => `<ol class="path">${P.map(([t, d], i) => `<li class="${i < cur ? 'done' : i === cur ? 'cur' : ''}"><i>${i < cur ? ICON.check : i + 1}</i><div><b>${t}</b><small>${d}</small></div></li>`).join('')}</ol>`;
const preview = () => LIVE ? '' : ' <em class="muted">(Preview: nothing was sent.)</em>';

function viewBook(l) {
  clearInterval(BK_POLL);
  const mode = S.bookMode; S.bookMode = null;
  BK = { l, off: l.status === 'off', step: l.status === 'off' ? (mode === 'call' ? 'call' : 'how') : (mode === 'offer' ? 'offer' : 'view'), c: BK && BK.c, bid: .97, log: [] };
  renderBook();
}
function renderBook() {
  clearInterval(BK_POLL);
  const { l, off } = BK, p = l.project && projectById(l.project), step = BK.step;
  const cur = off ? { how: 0, call: 0, called: 0, kyc: 1, pay: 2, sign: 3, done: 4 }[step] : { view: 0, viewed: 0, offer: 1, fin: 2, mort: 2, dep: 3, sign: 4, done: 5 }[step];
  const side = `<aside class="b-side"><img src="${imgFor({ ...sceneOf(l), id: l.ref, seed: l.seed })}" alt=""><h3>${esc(l.title)}</h3><p class="muted">${esc(l.sub)}, ${esc(l.area)}</p><div class="ln"><span>Price</span>${px(l.price)}</div>${BK.final ? `<div class="ln"><span>Agreed price</span><b>${px(BK.final)}</b></div>` : ''}<div class="ln"><span>${off ? 'Handover' : 'Status'}</span><b>${off ? p.ho : 'Ready'}</b></div>${pathHTML(off ? OFF_PATH : READY_PATH, cur)}</aside>`;
  const back = (to, l2 = 'Back') => `<button class="btn btn-ghost" data-go="${to}">${ICON.back} ${l2}</button>`;
  let m = '';
  /* off-plan */
  if (step === 'how') m = `<h1>How would you like to go ahead?</h1><p class="lead">Most buyers talk to us first. You can also reserve now: the EOI is refundable until you sign the sale agreement (demo terms).</p><div class="how2"><button class="opt lg" data-go="call">${ICON.phone}<b>Book a video call</b><span>${SUPPORT.name} walks you through the project, this home and the payment plan. 30 minutes.</span></button><button class="opt lg" data-go="kyc">${ICON.lock}<b>Reserve now with an EOI</b><span>Verify your identity and pay ${money(EOI, true)} into the project escrow account. About 5 minutes.</span></button></div><div class="b-foot"><a class="btn btn-ghost" href="#l-${l.ref}">${ICON.back} Back to home</a><span></span></div>`;
  if (step === 'call') m = `<h1>Book a video call</h1><p class="lead">Pick a time. ${SUPPORT.name} calls you on WhatsApp video or phone.</p><p class="lbl">Day</p>${chipset('cDay', days())}<p class="lbl">Time (Dubai)</p>${chipset('cTime', ['10:00', '12:30', '16:00', '18:30'])}${contact('c')}<p class="err" id="cErr" role="alert" hidden></p><div class="b-foot">${back('how')}<button class="btn btn-primary" id="cGo" disabled${int('ARKO backend: lead saved, owner alerted')}>Confirm call</button></div>`;
  if (step === 'called') m = `<div class="ok-big">${ICON.check}</div><h1>Your call is booked</h1><p class="lead">${esc(BK.when)}. ${SUPPORT.name} will call you about ${esc(l.building)}. If something comes up, call <a href="tel:${SUPPORT.phone}">${fmtPhone(SUPPORT.phone)}</a>.${preview()}</p><div class="b-foot"><a class="btn btn-ghost" href="#search">Keep browsing</a><button class="btn btn-primary" data-go="kyc">Reserve now instead</button></div>`;
  if (step === 'kyc') m = `<h1>Verify who you are</h1><p class="lead">Required for every property buyer in the UAE. About a minute.</p><div class="how2"${int('UAE Pass / passport KYC provider (simulated)')}><button class="opt lg" data-kyc="UAE Pass"><b>Continue with UAE Pass</b><span>For UAE residents</span></button><button class="opt lg" data-kyc="passport"><b>Passport and selfie</b><span>For buyers outside the UAE</span></button></div><div id="kycRes"></div><div class="b-foot">${back('how')}<button class="btn btn-primary" data-go="pay" id="kGo" ${BK.kyc ? '' : 'disabled'}>Continue ${ICON.arrow}</button></div>`;
  if (step === 'pay') m = `<h1>Pay the EOI into escrow</h1><p class="lead">This holds the home for you and counts towards the first payment.</p><div class="paybox"${int('Payment gateway + project escrow bank (simulated)')}><div class="big">${money(EOI, true)}</div><div class="ln"><span>Paid to</span><b>${esc(p.name)} escrow account ••••4821 (demo)</b></div><div class="ln"><span>Refund</span><b>Full refund until the SPA is signed (demo)</b></div></div><div class="b-foot">${back('kyc')}<button class="btn btn-primary" id="pGo">${BK.paid ? 'Paid. Continue' : 'Pay ' + money(EOI, true)}</button></div>`;
  /* ready */
  if (step === 'view') m = `<h1>Book a viewing</h1><p class="lead">See it in person, or on a live video call with ${SUPPORT.name}.</p><div class="seg" id="vMode"><button data-v="In person" aria-selected="true">In person</button><button data-v="Video" aria-selected="false">Live video</button></div><p class="lbl">Day</p>${chipset('vDay', days())}<p class="lbl">Time</p>${chipset('vTime', ['10:00', '12:30', '16:00', '18:30'])}${contact('v')}<p class="err" id="vErr" role="alert" hidden></p><div class="b-foot"><a class="btn btn-ghost" href="#l-${l.ref}">${ICON.back} Back to home</a><button class="btn btn-primary" id="vGo" disabled>Confirm viewing</button></div>`;
  if (step === 'viewed') m = `<div class="ok-big">${ICON.check}</div><h1>Viewing booked</h1><p class="lead">${esc(BK.when)}. After you've seen it, come back and make an offer.${preview()}</p><div class="b-foot"><a class="btn btn-ghost" href="#search">Keep browsing</a><button class="btn btn-primary" data-go="offer">I've viewed it: make an offer</button></div>`;
  if (step === 'offer') {
    const bub = (BK.log || []).map(x => `<div class="bub ${x.by === 'buyer' ? 'me' : 'them'}">${esc(x.text)}${x.amount ? ': ' + money(x.amount, true) : ''}</div>`).join('');
    const slider = `<div class="bid"><b class="big" id="bidV"></b><input type="range" id="bid" min="90" max="100" step=".5" value="${(BK.bid * 100).toFixed(1)}" aria-label="Offer as a share of the asking price"><small class="muted">Asking ${money(l.price, true)}</small></div>`;
    let body;
    if (BK.accepted) body = `<div class="bubs">${bub}</div><div class="okrow ok">${ICON.check} Offer accepted at ${money(BK.final, true)}. Deal agreed.</div>`;
    else if (!BK.bidId && !BK.simStarted) body = `${slider}${LIVE ? contact('o') : ''}<p class="err" id="oErr" role="alert" hidden></p><button class="btn btn-primary" id="oSend" ${LIVE && !(BK.c) ? 'disabled' : ''}>Send offer to the seller</button>`;
    else if (BK.status === 'pending') body = `<div class="bubs">${bub}</div><div class="okrow"><span class="spin"></span> Waiting for the seller. This page updates by itself.</div>`;
    else if (BK.status === 'countered') body = `<div class="bubs">${bub}</div><div class="row"><button class="btn btn-primary" id="oAcc">Accept ${money(BK.counter, true)}</button></div><p class="lbl">Or send a new offer</p>${slider}<button class="btn btn-ghost" id="oNew">Send new offer</button>`;
    else body = `<div class="bubs">${bub}</div><p class="muted">The seller declined. Try an offer closer to the asking price.</p>${slider}<button class="btn btn-primary" id="oNew">Send new offer</button>`;
    m = `<h1>Make an offer</h1><p class="lead">Your offer goes to the seller through ${SUPPORT.name}. They accept, counter or decline.</p><div${int(LIVE ? 'ARKO backend: offer goes to the owner dashboard (live)' : 'Seller response simulated in preview')}>${body}</div><div class="b-foot">${back('view', 'Viewing')}<button class="btn btn-primary" data-go="fin" ${BK.accepted ? '' : 'disabled'}>Continue ${ICON.arrow}</button></div>`;
  }
  if (step === 'fin') m = `<h1>How will you pay?</h1><p class="lead">Agreed at ${money(BK.final, true)}.</p><div class="how2"><button class="opt lg ${BK.pay === 'cash' ? 'sel' : ''}" data-pay="cash"><b>Cash</b><span>Go straight to the deposit</span></button><button class="opt lg ${BK.pay === 'loan' ? 'sel' : ''}" data-pay="loan"><b>Mortgage</b><span>Connect a bank, share documents, get approval</span></button></div><div class="b-foot">${back('offer')}<button class="btn btn-primary" data-go="${BK.pay === 'loan' ? 'mort' : 'dep'}" ${BK.pay ? '' : 'disabled'}>Continue ${ICON.arrow}</button></div>`;
  if (step === 'mort') {
    const rows = ['Connect your bank', 'Share documents', 'Bank valuation', 'Pre-approval', 'Final offer'], ms = BK.ms || 0, ltv = BK.final <= 5e6 ? .8 : .7;
    let act = '';
    if (ms === 0) act = `<div class="opts">${['Gulfstream Bank', 'Falcon Commercial', 'Oasis Islamic', 'Meridian National'].map(b => `<button class="opt" data-bank="${b}"><b>${b}</b><span>Demo bank</span></button>`).join('')}</div>`;
    if (ms === 1) act = `<ul class="docs">${['Emirates ID or passport', 'Salary certificate', '6 months bank statements', 'Liability letter'].map((d, i) => `<li class="${BK.docs && BK.docs[i] ? 'ok' : ''}"><span>${d}</span><button class="btn btn-ghost sm" data-doc="${i}">${BK.docs && BK.docs[i] ? 'Uploaded' : 'Upload'}</button></li>`).join('')}</ul><button class="btn btn-primary" data-ms="2" ${BK.docs && Object.keys(BK.docs).length === 4 ? '' : 'disabled'}>Send to ${esc(BK.bank)}</button>`;
    if (ms === 2) act = `<div class="okrow"><span class="spin"></span> ${esc(BK.bank)} is valuing the home…</div>`;
    if (ms === 3) act = `<div class="okrow ok">${ICON.check} Valued at ${money(BK.final, true)}. Pre-approved up to ${money(BK.final * ltv, true)} (${ltv * 100}%).</div><button class="btn btn-primary" data-ms="4">Accept pre-approval</button>`;
    if (ms === 4) { BK.loan = Math.round(BK.final * ltv / 1e4) * 1e4; act = `<div class="paybox"><div class="ln"><span>Loan</span><b>${money(BK.loan, true)}</b></div><div class="ln"><span>Rate</span><b>4.5% fixed 3 years (demo)</b></div><div class="ln"><span>Term</span><b>25 years</b></div><div class="ln"><span>Monthly</span><b>${money(pmt(BK.loan, .045, 25), true)}</b></div></div><button class="btn btn-primary" data-ms="5">Accept final offer</button>`; }
    if (ms === 5) act = `<div class="okrow ok">${ICON.check} Mortgage approved by ${esc(BK.bank)}.</div>`;
    m = `<h1>Get your mortgage</h1><ol class="ms"${int('Bank mortgage APIs (simulated)')}>${rows.map((r, i) => `<li class="${i < ms ? 'done' : i === ms ? 'cur' : ''}">${r}</li>`).join('')}</ol>${act}<div class="b-foot">${back('fin')}<button class="btn btn-primary" data-go="dep" ${ms >= 5 ? '' : 'disabled'}>Continue ${ICON.arrow}</button></div>`;
  }
  if (step === 'dep') { const f = fees(BK.final, true), mr = BK.pay === 'loan' ? BK.loan * .0025 + 290 : 0;
    m = `<h1>Pay the 10% deposit</h1><p class="lead">Held by the trustee for the seller until transfer day.</p><div class="paybox"${int('Payment gateway / manager cheque (simulated)')}><div class="big">${money(BK.final * .1, true)}</div><div class="ln"><span>DLD transfer fee (4%)</span>${px(f.dld)}</div><div class="ln"><span>Trustee fee + VAT</span>${px(f.trustee)}</div><div class="ln"><span>Agency fee (2% + VAT)</span>${px(f.agency)}</div>${mr ? `<div class="ln"><span>Mortgage registration</span>${px(mr)}</div>` : ''}<div class="ln tot"><span>Due on transfer day</span>${px(BK.final * .9 - (BK.loan || 0) + f.dld + f.trustee + f.agency + mr)}</div></div><div class="b-foot">${back(BK.pay === 'loan' ? 'mort' : 'fin')}<button class="btn btn-primary" id="dGo">${BK.paid ? 'Paid. Continue' : 'Pay deposit'}</button></div>`; }
  /* shared signature and done */
  if (step === 'sign') m = `<h1>${off ? 'Sign the EOI' : 'Sign the sale contract (Form F)'}</h1><p class="lead">Draw your signature below.</p><div class="sig"${int('E-signature provider (simulated)')}><canvas id="sig" height="170" aria-label="Signature pad"></canvas><button class="btn btn-ghost sm" id="sClr">Clear</button></div><div class="b-foot">${back(off ? 'pay' : 'dep')}<button class="btn btn-primary" id="sGo" disabled>${off ? 'Submit EOI' : 'Sign and book the transfer'}</button></div>`;
  if (step === 'done') m = `<div class="ok-big">${ICON.check}</div><h1>${off ? 'Reserved for you' : 'Transfer booked'}</h1><p class="lead">Reference <b>${esc(S.booking.ref)}</b>. ${off ? 'The developer now sends the sale agreement. Signing it closes the deal.' : 'We book your DLD trustee appointment. On the day, the title moves to you.'}</p><div class="fb"><span>Was this easy?</span><button class="btn btn-ghost sm" data-fb="easy">Yes</button><button class="btn btn-ghost sm" data-fb="hard">Not really</button></div><div class="b-foot"><span></span><a class="btn btn-primary" href="#track">Track my purchase ${ICON.arrow}</a></div>`;
  view().innerHTML = `<section class="wrap book"><div class="b-main">${m}</div>${side}</section>`;
  refreshPrices(view()); track(off ? 'eoi_step' : 'ready_step', (l.project || l.ref) + ':' + step);
  const root = view(); chipsIn(root);
  root.onclick = async e => {
    const g = e.target.closest('[data-go]'); if (g && !g.disabled) { BK.step = g.dataset.go; if (['call', 'kyc'].includes(BK.step)) track('book', l.project || l.ref, { mode: BK.step === 'call' ? 'call' : 'eoi' }); renderBook(); return; }
    const k = e.target.closest('[data-kyc]'); if (k) { $('#kycRes').innerHTML = `<div class="okrow"><span class="spin"></span>Checking your ${esc(k.dataset.kyc)}…</div>`; await sleep(RM ? 50 : 1200); BK.kyc = k.dataset.kyc; $('#kycRes').innerHTML = `<div class="okrow ok">${ICON.check} Identity verified (demo)</div>`; $('#kGo').disabled = false; }
    const py = e.target.closest('[data-pay]'); if (py) { BK.pay = py.dataset.pay; renderBook(); }
    const bk = e.target.closest('[data-bank]'); if (bk) { BK.bank = bk.dataset.bank; BK.ms = 1; renderBook(); }
    const dc = e.target.closest('[data-doc]'); if (dc) { BK.docs = BK.docs || {}; BK.docs[dc.dataset.doc] = 1; renderBook(); }
    const ms = e.target.closest('[data-ms]'); if (ms && !ms.disabled) { BK.ms = +ms.dataset.ms; renderBook(); if (BK.ms === 2) { await sleep(RM ? 50 : 1800); if (BK.step === 'mort') { BK.ms = 3; renderBook(); } } }
    const fb = e.target.closest('[data-fb]'); if (fb) { track('click', 'feedback:' + fb.dataset.fb); fb.parentNode.innerHTML = '<span>Thanks, that helps.</span>'; }
  };
  const form = (p, btnId, after) => { const b = $('#' + btnId); const chk = () => b.disabled = !cOk(p); ['Name', 'Phone', 'Ok'].forEach(x => $('#' + p + x).addEventListener('input', chk)); chk(); b.onclick = after; };
  if (step === 'call') form('c', 'cGo', async () => { BK.when = chosen('cDay') + ' at ' + chosen('cTime'); const b = $('#cGo'); b.disabled = true; b.textContent = 'Booking…'; cGet('c');
    try { if (LIVE) await postJSON('/api/lead', { kind: 'call', ...BK.c, when: BK.when, home: l.title + ' · ' + l.ref, goal: S.answers ? S.answers.goal : '', consent: true, website: $('#cWeb').value }); track('lead', 'call'); BK.step = 'called'; renderBook(); }
    catch (er) { b.disabled = false; b.textContent = 'Confirm call'; $('#cErr').textContent = `We could not book that. Please call ${SUPPORT.name} on ${fmtPhone(SUPPORT.phone)}.`; $('#cErr').hidden = false; } });
  if (step === 'view') { $('#vMode').onclick = e => { const b = e.target.closest('button'); if (b) $$('#vMode button').forEach(x => x.setAttribute('aria-selected', String(x === b))); };
    form('v', 'vGo', async () => { const md = $('#vMode [aria-selected=true]').dataset.v; BK.when = md + ', ' + chosen('vDay') + ' at ' + chosen('vTime'); const b = $('#vGo'); b.disabled = true; b.textContent = 'Booking…'; cGet('v');
      try { if (LIVE) await postJSON('/api/lead', { kind: 'meet', ...BK.c, when: 'Viewing: ' + BK.when, home: l.title + ' · ' + l.ref, consent: true, website: $('#vWeb').value }); track('lead', 'viewing'); track('book', l.ref, { mode: 'viewing' }); BK.step = 'viewed'; renderBook(); }
      catch (er) { b.disabled = false; b.textContent = 'Confirm viewing'; $('#vErr').textContent = `We could not book that. Please call ${SUPPORT.name} on ${fmtPhone(SUPPORT.phone)}.`; $('#vErr').hidden = false; } }); }
  if (step === 'offer') offerBind(l);
  if (step === 'pay') $('#pGo').onclick = async () => { const b = $('#pGo'); if (!BK.paid) { b.disabled = true; b.innerHTML = '<span class="spin"></span> Processing'; await sleep(RM ? 50 : 1300); BK.paid = true; toast('Payment received in escrow (demo)'); } BK.step = 'sign'; renderBook(); };
  if (step === 'dep') $('#dGo').onclick = async () => { const b = $('#dGo'); if (!BK.paid) { b.disabled = true; b.innerHTML = '<span class="spin"></span> Processing'; await sleep(RM ? 50 : 1300); BK.paid = true; toast('Deposit received (demo)'); } BK.step = 'sign'; renderBook(); };
  if (step === 'sign') {
    const cv = $('#sig'); cv.width = cv.clientWidth; const c = cv.getContext('2d'); c.lineWidth = 2.6; c.lineCap = 'round'; c.strokeStyle = '#0A2A2E'; let d = false;
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.onpointerdown = e => { d = true; cv.setPointerCapture(e.pointerId); const [x, y] = pt(e); c.beginPath(); c.moveTo(x, y); };
    cv.onpointermove = e => { if (!d) return; const [x, y] = pt(e); c.lineTo(x, y); c.stroke(); $('#sGo').disabled = false; };
    cv.onpointerup = () => d = false; $('#sClr').onclick = () => { c.clearRect(0, 0, cv.width, cv.height); $('#sGo').disabled = true; };
    $('#sGo').onclick = () => { S.booking = { ref: 'ARK-' + (hash(l.ref + Date.now()) % 900000 + 100000), lref: l.ref, kind: off ? 'off' : 'ready', price: BK.final || l.price, loan: BK.loan || 0, bank: BK.bank || '', at: Date.now() }; store.set('booking', S.booking); track('book', l.project || l.ref, { mode: off ? 'eoi_done' : 'transfer_done' }); BK.step = 'done'; renderBook(); };
  }
}
function offerBind(l) {
  const sl = $('#bid'), show = () => { $('#bidV').textContent = money(l.price * sl.value / 100, true); };
  if (sl) { show(); sl.oninput = () => { BK.bid = sl.value / 100; show(); }; }
  const sync = d => { BK.status = d.status; BK.counter = d.counter; BK.log = d.log; BK.upd = d.updated; if (d.status === 'accepted') { BK.accepted = true; BK.final = d.amount; } };
  const call = async (u, o) => { const r = await fetch(u, { ...o, headers: { 'Content-Type': 'application/json' } }); if (!r.ok) throw new Error(r.status); return r.json(); };
  const send = $('#oSend');
  if (send && LIVE) { const chk = () => send.disabled = !cOk('o'); ['Name', 'Phone', 'Ok'].forEach(x => $('#o' + x).addEventListener('input', chk)); chk(); }
  if (send) send.onclick = async () => {
    const amount = l.price * BK.bid;
    if (!LIVE) { BK.simStarted = true; simOffer(l, amount); return; }
    send.disabled = true; send.textContent = 'Sending…'; cGet('o');
    try { const d = await call('/api/bids', { method: 'POST', body: JSON.stringify({ homeId: l.ref, homeName: l.title, ask: l.price, amount, ...BK.c, consent: true, website: $('#oWeb').value }) }); BK.bidId = d.id; BK.token = d.token; sync(d); track('bid', l.ref); renderBook(); }
    catch (e) { send.disabled = false; send.textContent = 'Send offer to the seller'; $('#oErr').textContent = `We could not send the offer. Please call ${SUPPORT.name} on ${fmtPhone(SUPPORT.phone)}.`; $('#oErr').hidden = false; }
  };
  const nw = $('#oNew'); if (nw) nw.onclick = async () => { const amount = l.price * BK.bid; if (!LIVE) return simOffer(l, amount); try { sync(await call('/api/bids/' + BK.bidId + '/respond', { method: 'POST', body: JSON.stringify({ token: BK.token, action: 'offer', amount }) })); renderBook(); } catch (e) { toast('Could not send the offer', 'info'); } };
  const ac = $('#oAcc'); if (ac) ac.onclick = async () => { if (!LIVE) { BK.accepted = true; BK.final = BK.counter; BK.log.push({ by: 'buyer', text: 'I accept' }); renderBook(); return; } try { sync(await call('/api/bids/' + BK.bidId + '/respond', { method: 'POST', body: JSON.stringify({ token: BK.token, action: 'accept_counter' }) })); renderBook(); } catch (e) { toast('Could not accept', 'info'); } };
  if (LIVE && BK.bidId && BK.status === 'pending') BK_POLL = setInterval(async () => { if (BK.step !== 'offer' || !location.hash.startsWith('#book-')) return clearInterval(BK_POLL); try { const d = await call('/api/bids/' + BK.bidId + '?token=' + BK.token); if (d.updated !== BK.upd) { sync(d); toast(d.status === 'accepted' ? 'The seller accepted' : 'The seller replied'); renderBook(); } } catch (e) { /* retry */ } }, 4000);
}
function simOffer(l, amount) { /* preview without a server: a simple simulated seller */
  const a = Math.round(amount / 5000) * 5000, r = a / l.price; BK.round = (BK.round || 0) + 1; BK.log.push({ by: 'buyer', text: 'My offer', amount: a });
  if (r >= .97) { BK.accepted = true; BK.final = a; BK.status = 'accepted'; BK.log.push({ by: 'seller', text: 'Accepted' }); }
  else if (r >= .93 || BK.round >= 3) { BK.status = 'countered'; BK.counter = Math.round((BK.round >= 3 ? l.price * .985 : (a + l.price * .985) / 2) / 5000) * 5000; BK.log.push({ by: 'seller', text: 'I can do', amount: BK.counter }); }
  else { BK.status = 'rejected'; BK.log.push({ by: 'seller', text: 'Too low, please come closer to the asking price' }); }
  renderBook();
}

/* ----- talk to us ----- */
function openTalk(l) {
  track('agent', l ? (l.project || l.ref) : 'header');
  const m = $('#modal'); BK = BK || {};
  m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="tTitle"><button class="x" data-close aria-label="Close">${ICON.x}</button><h2 id="tTitle">Talk to ${SUPPORT.name}</h2><p class="muted">Your ARKO property adviser${l ? ', about ' + esc(l.building) : ''}.</p>
    <div class="callcard"><div><small>Call support</small><b>${fmtPhone(SUPPORT.phone)}</b></div><div class="row"><a class="btn btn-primary" href="tel:${SUPPORT.phone}">${ICON.phone} Call</a><a class="btn btn-wa" href="${WA()}" target="_blank" rel="noopener">${ICON.chat} WhatsApp</a></div></div>
    <h3>Or ask us to call you</h3>${chipset('tWhen', ['As soon as possible', 'This evening', 'Tomorrow morning'])}${contact('t')}<p class="err" id="tErr" role="alert" hidden></p><button class="btn btn-primary" id="tGo" disabled>Request a call back</button></div>`;
  m.hidden = false; requestAnimationFrame(() => m.classList.add('on')); chipsIn(m);
  const go = $('#tGo'), chk = () => go.disabled = !cOk('t'); ['Name', 'Phone', 'Ok'].forEach(x => $('#t' + x).addEventListener('input', chk)); chk();
  go.onclick = async () => { go.disabled = true; go.textContent = 'Sending…'; cGet('t');
    try { if (LIVE) await postJSON('/api/lead', { kind: 'call', ...BK.c, when: chosen('tWhen'), home: l ? l.title + ' · ' + l.ref : '', consent: true, website: $('#tWeb').value }); track('lead', 'callback');
      $('.sheet', m).innerHTML = `<button class="x" data-close aria-label="Close">${ICON.x}</button><div class="ok-big">${ICON.check}</div><h2>We'll call you</h2><p class="muted">${esc(chosen('tWhen') || 'Soon')}. If it's urgent, call ${SUPPORT.name} on ${fmtPhone(SUPPORT.phone)}.${preview()}</p><button class="btn btn-primary" data-close>Done</button>`; }
    catch (e) { go.disabled = false; go.textContent = 'Request a call back'; $('#tErr').textContent = `We could not send that. Please call ${SUPPORT.name} on ${fmtPhone(SUPPORT.phone)}.`; $('#tErr').hidden = false; } };
  setTimeout(() => { const a = $('.sheet a', m); a && a.focus(); }, 50);
}
function closeModal() { const m = $('#modal'); m.classList.remove('on'); setTimeout(() => { m.hidden = true; m.innerHTML = ''; }, 250); }

/* ----- tracker ----- */
function viewTrack() {
  const b = S.booking;
  if (!b) { view().innerHTML = `<section class="wrap empty-state"><h1>Track your purchase</h1><p class="lead">After you reserve or buy, every step shows here: DLD registration, construction or transfer, payments and documents.</p><div class="row"><a class="btn btn-primary" href="#search">Find a home</a><button class="btn btn-ghost" id="dOff">Sample: off-plan</button><button class="btn btn-ghost" id="dRd">Sample: ready</button></div></section>`;
    $('#dOff').onclick = () => { const l = LISTINGS.find(x => x.status === 'off'); S.booking = { ref: 'ARK-DEMO01', lref: l.ref, kind: 'off', price: l.price, demo: true }; viewTrack(); };
    $('#dRd').onclick = () => { const l = LISTINGS.find(x => x.status === 'ready'); S.booking = { ref: 'ARK-DEMO02', lref: l.ref, kind: 'ready', price: l.price, loan: Math.round(l.price * .7 / 1e4) * 1e4, bank: 'Gulfstream Bank', demo: true }; viewTrack(); }; return; }
  const l = listingByRef(b.lref), off = b.kind === 'off', p = l.project && projectById(l.project);
  const pays = off ? schedule(p, b.price).map(s => ({ n: s.n, m: s.m, amt: s.amt })) : [{ n: 'Deposit (10%)', m: 0, amt: b.price * .1 }, { n: 'Balance and fees at transfer', m: 1, amt: b.price * .9 - (b.loan || 0) + b.price * .04 }, ...(b.loan ? [...Array(6)].map((_, i) => ({ n: 'Mortgage payment ' + (i + 1), m: 2 + i, amt: pmt(b.loan, .045, 25) })) : [])];
  const ST = off ? [['EOI submitted', 'Held, EOI in escrow', 0], ['Deal closed', 'SPA signed', 1], ['Initial payment', 'First instalment paid', 1], ['DLD registration', 'Oqood in your name', 2], ['Construction', 'RERA inspections', 3], ['Handover', 'Keys and snagging', p.hm], ['Title deed', 'Ownership in your name', p.hm + 2]]
    : [['Offer agreed', 'Form F signed', 0], ['Deposit paid', 'Held by the trustee', 0], ...(b.loan ? [['Mortgage funded', b.bank, 1]] : []), ['DLD transfer', 'At the trustee office', 1], ['Title deed', 'In your name', 1], ['Keys and utilities', 'DEWA connected', 2], ['Owning', b.loan ? 'Mortgage reminders' : 'Service charge reminders', 3]];
  const DOCS = off ? [['EOI form and receipt', 0], ['Sale agreement (SPA)', 1], ['Oqood certificate', 2], ['Payment receipts', 2], ['Construction report', 6], ['Handover notice', p.hm], ['Title deed', p.hm + 2]] : [['Form F contract', 0], ['Deposit receipt', 0], ...(b.loan ? [['Mortgage offer letter', 1]] : []), ['Transfer receipt', 1], ['Title deed', 1], ['DEWA account', 2]];
  const maxM = off ? p.hm + 3 : 8, oq = (off ? 'OQ-' : 'TD-') + (hash(b.ref) % 9000000 + 1000000);
  view().innerHTML = `<section class="wrap trk"><div class="t-head"><img src="${imgFor({ ...sceneOf(l), id: l.ref, seed: l.seed })}" alt=""><div><p class="eyebrow">Reference ${esc(b.ref)}${b.demo ? ' · sample' : ''}</p><h1>${esc(l.title)}</h1><p class="muted">${esc(l.area)} · ${px(b.price)}</p></div></div>
    <div class="tm"><label for="tm">Demo: move through time</label><input id="tm" type="range" min="0" max="${maxM}" value="1"><b id="tmL"></b></div><div class="next" id="next"></div>
    <div class="t-grid"><section class="tc"><h3>Your journey</h3><ol class="stages" id="stg">${ST.map(s => `<li data-at="${s[2]}"><i></i><div><b>${s[0]}</b><small>${esc(s[1])}</small></div></li>`).join('')}</ol></section>
      <section class="tc"${int('DLD API gateway (simulated)')}><h3>DLD</h3><p class="pill" id="dPill"></p><div class="ln"><span>${off ? 'Oqood number' : 'Title deed number'}</span><b id="oq"></b></div>${off ? `<h3 class="mt">Construction</h3><div class="meter"><i id="prog"></i></div><p class="muted" id="progT"></p>` : `<div class="ln"><span>Transfer fee (4%)</span><b>${money(b.price * .04)}</b></div>`}</section>
      <section class="tc wide"${int('Reminders by WhatsApp, SMS and email (simulated)')}><h3>Payments and reminders</h3><div id="pays"></div></section>
      <section class="tc"><h3>Documents</h3><ul class="docs" id="docs">${DOCS.map(d => `<li data-at="${d[1]}">${ICON.doc}<span>${d[0]}</span><em></em></li>`).join('')}</ul></section></div></section>`;
  const reg = off ? 2 : 1;
  const upd = m => {
    $('#tmL').textContent = monthLabel(m);
    $$('#stg li').forEach((li, i, all) => { const at = +li.dataset.at, nx = all[i + 1] ? +all[i + 1].dataset.at : 1e9; li.className = m >= nx ? 'done' : m >= at ? 'now' : ''; $('i', li).innerHTML = m >= nx ? ICON.check : ''; });
    $('#dPill').textContent = m >= reg ? 'Registered' : 'In progress'; $('#dPill').className = 'pill ' + (m >= reg ? 'ok' : 'wait'); $('#oq').textContent = m >= reg ? oq : 'Issued on registration';
    if (off) { const pc = m < 3 ? 0 : m >= p.hm ? 100 : Math.round(15 + (m - 3) / (p.hm - 3) * 85); $('#prog').style.width = pc + '%'; $('#progT').textContent = pc + '% complete'; }
    const ni = pays.findIndex(s => s.m > m);
    $('#pays').innerHTML = pays.map((s, i) => `<div class="py ${s.m <= m ? 'paid' : i === ni ? 'due' : ''}"><i>${s.m <= m ? ICON.check : ''}</i><span>${s.n}<small>${monthLabel(s.m)}</small></span><b>${px(s.amt)}</b><em>${s.m <= m ? 'Paid' : i === ni ? (s.m - m <= 1 ? 'Due this month' : 'Due in ' + (s.m - m) + ' months') : 'Upcoming'}</em></div>`).join('');
    $$('#docs li').forEach(li => { const ok = m >= +li.dataset.at; li.className = ok ? 'ok' : ''; $('em', li).textContent = ok ? 'Ready' : 'Later'; });
    const nx = pays[ni]; $('#next').innerHTML = nx ? `<b>Next</b><span>${nx.n}: ${px(nx.amt)} on ${monthLabel(nx.m)}. We remind you a week before.</span>` : '<b>All paid</b><span>We keep following up until everything is in your name.</span>';
  };
  $('#tm').oninput = e => upd(+e.target.value); upd(1);
}
