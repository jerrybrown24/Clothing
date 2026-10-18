/* ---------- ready-home flow: viewing, bidding, cash or loan, payment, DLD ---------- */
const RF0 = { step: 0, mode: 'In person', day: 0, time: 0, booked: false, bid: .97, round: 0, log: [], accepted: false, final: 0, counter: 0, pay: null, bank: null, docs: {}, ms: 0, valued: false, loanAmt: 0, loan: null, paid: false, sig: false };
let RF = {}, RF_POLL = 0;
const BANKS = ['Gulfstream Bank', 'Falcon Commercial', 'Oasis Islamic Bank', 'Meridian National'];
const LDOCS = ['Emirates ID and passport', 'Salary certificate', 'Last 6 months bank statements', 'Liability letter', 'Signed offer on the property'];
const rkeys = () => ['view', 'bid', 'mode', ...(RF.pay === 'loan' ? ['loan'] : []), 'pay', 'sign'];
const RNAME = { view: 'Viewing', bid: 'Bidding', mode: 'Cash or loan', loan: 'Mortgage', pay: 'Initial payment', sign: 'Sign and register' };
const dayLabels = () => [...Array(5)].map((_, i) => new Date(Date.now() + (i + 1) * 864e5).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
const TIMES = ['10:00', '12:30', '16:00', '18:30'];

function openViewing() {
  clearInterval(RF_POLL);
  RF = JSON.parse(JSON.stringify(RF0)); RF.docs = {}; RF.log = [];
  go('reserve', renderReady);
}
function renderReady() {
  const p = byId(S.pid), keys = rkeys(), k = keys[RF.step], el = V.reserve, ask = p.price; track('ready_step', p.id + ':' + k);
  const fp = RF.final || ask, f = feesOf(p, fp);
  const side = `<aside class="rs-side"><div class="rs-img"><img alt="" src="${imgFor(p)}"></div><h3>${p.name}</h3><p>${p.unit} · ${p.area}</p><div class="ln"><span>Asking price</span>${px(ask)}</div>${RF.accepted ? `<div class="ln"><span>Agreed price</span><b>${px(RF.final)}</b></div>` : ''}${RF.pay ? `<div class="ln"><span>Payment</span><b>${RF.pay === 'loan' ? 'Bank loan' : 'Cash'}</b></div>` : ''}<p class="mini">${ICON.lock} Deposit and transfer go through a DLD trustee office.</p></aside>`;
  const bar = `<ol class="stepper">${keys.map((s, i) => `<li class="${i < RF.step ? 'done' : i === RF.step ? 'cur' : ''}"><i>${i < RF.step ? ICON.check : i + 1}</i><span>${RNAME[s]}</span></li>`).join('')}</ol>`;
  const chips = (id, arr, sel) => `<div class="chipset" id="${id}">${arr.map((x, i) => `<button class="chip" aria-pressed="${i === sel}" data-i="${i}">${x}</button>`).join('')}</div>`;
  let panel = '', nextLbl = 'Continue', ok = false, noNext = false;
  if (k === 'view') {
    ok = RF.booked; nextLbl = 'Continue to bidding';
    panel = `<h2>Book a viewing</h2><p class="sub">See it in person or on a live video call. Free to cancel.</p>
     <div class="seg" id="vmode"><button data-v="In person" aria-selected="${RF.mode === 'In person'}">In person</button><button data-v="Live video" aria-selected="${RF.mode === 'Live video'}">Live video</button><span class="thumb"></span></div>
     <p class="mini mt">Day</p>${chips('vday', dayLabels(), RF.day)}<p class="mini mt">Time</p>${chips('vtime', TIMES, RF.time)}
     ${RF.booked ? `<div class="vf-res"><div class="okc">${ICON.check}</div><b>Viewing booked</b><span>${RF.mode}, ${dayLabels()[RF.day]} at ${TIMES[RF.time]}. (Demo) Continue once you have viewed the home.</span></div>` : `<button class="btn btn-primary mt" id="vBook">Book viewing</button>`}`;
  } else if (k === 'bid' && LIVE) {
    ok = RF.accepted; nextLbl = 'Continue';
    const st = RF.bidStatus, bubbles = (RF.bidLog || []).map(l => `<div class="bub ${l.by === 'buyer' ? 'me' : 'seller'}">${l.text}${l.amount ? ': ' + money(l.amount, true) : ''}</div>`).join('');
    const slider = `<div class="bid"><div class="big" id="bidV"></div><input type="range" id="bid" min="90" max="100" step="0.5" value="${(RF.bid * 100).toFixed(1)}"></div>`;
    const who = `<label class="fld">Your name<input id="bdName" autocomplete="name" maxlength="80" value="${RF.bname || ''}"></label><label class="fld">Mobile number<input id="bdPhone" type="tel" autocomplete="tel" maxlength="20" placeholder="+971 50 000 0000" value="${RF.bphone || ''}"></label><input id="bdWeb" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="chk"><input type="checkbox" id="bdOk"><span>I agree that ARKO may contact me about this offer and store my details for that purpose.</span></label>`;
    let body;
    if (!RF.bidId) body = `${slider}${who}<p class="err" id="bdErr" role="alert" hidden></p><button class="btn btn-primary mt" id="bdSend" disabled>Send offer to the seller</button>`;
    else if (st === 'pending') body = `<div class="vf-res"><div class="spin"></div><b>Offer sent: ${money(RF.bidAmount, true)}</b><span>Waiting for the seller. You can keep this page open. It updates by itself.</span></div><div class="bubs">${bubbles}</div>`;
    else if (st === 'countered') body = `<div class="bubs">${bubbles}</div><div class="card-s"><b>The seller counters at ${money(RF.bidCounter, true)}</b></div><div class="row l"><button class="btn btn-primary" id="bdAcc">Accept ${money(RF.bidCounter, true)}</button></div><h4 class="mt">Or send a new offer</h4>${slider}<button class="btn btn-ghost" id="bdNew">Send new offer</button>`;
    else if (st === 'rejected') body = `<div class="bubs">${bubbles}</div><div class="card-s"><b>The seller declined that offer.</b><p class="mini">You can send a new offer closer to the asking price.</p></div>${slider}<button class="btn btn-primary mt" id="bdNew">Send new offer</button>`;
    else body = `<div class="bubs">${bubbles}</div><div class="vf-res"><div class="okc">${ICON.check}</div><b>Deal closed at ${px(RF.final)}</b><span>Offer accepted by the seller.</span></div>`;
    panel = `<h2>Make your offer</h2><p class="sub">Asking price ${px(ask)}. Your offer goes to the seller, who accepts, counters or declines.</p>${body}`;
  } else if (k === 'bid') {
    ok = RF.accepted; nextLbl = 'Continue';
    const bubbles = RF.log.map(l => `<div class="bub ${l[0]}">${l[1]}</div>`).join('');
    panel = `<h2>Make your offer</h2><p class="sub">Asking price ${px(ask)}. Sellers often accept within 3% of asking (demo).</p>
     <div class="bid"><div class="big" id="bidV"></div><input type="range" id="bid" min="90" max="100" step="0.5" value="${(RF.bid * 100).toFixed(1)}" ${RF.accepted ? 'disabled' : ''}></div>
     <div class="bubs">${bubbles}</div>
     ${RF.accepted ? `<div class="vf-res"><div class="okc">${ICON.check}</div><b>Deal closed at ${px(RF.final)}</b><span>Offer accepted by the seller.</span></div>` : RF.counter ? `<div class="row l"><button class="btn btn-primary" id="acc">Accept ${px(RF.counter)}</button><button class="btn btn-ghost" id="bidGo">Send a new offer</button></div>` : `<button class="btn btn-primary mt" id="bidGo">Send offer</button>`}`;
  } else if (k === 'mode') {
    ok = !!RF.pay;
    panel = `<h2>How will you pay?</h2><p class="sub">Deal closed at ${px(RF.final)}. Choose cash or a bank loan.</p><div class="opts two" id="pm"><button class="opt ${RF.pay === 'cash' ? 'sel' : ''}" data-v="cash"><b>Cash</b><span>Go straight to the initial payment</span></button><button class="opt ${RF.pay === 'loan' ? 'sel' : ''}" data-v="loan"><b>Bank loan</b><span>Connect a bank, share documents, get approval</span></button></div>`;
  } else if (k === 'loan') {
    const rows = ['Connect your bank', 'Share your documents', 'Bank valuation', 'Pre-approval', 'Loan approval'], ms = RF.ms, ltv = fp <= 5e6 ? .8 : .7, maxL = Math.round(fp * ltv / 1e4) * 1e4;
    ok = ms >= 5; nextLbl = 'Continue to initial payment';
    let act = '';
    if (ms === 0) act = `<p class="mini">Choose your bank (demo banks)</p><div class="opts two" id="bk">${BANKS.map(b => `<button class="opt" data-v="${b}"><b>${b}</b></button>`).join('')}</div>`;
    else if (ms === 1) { const n = Object.keys(RF.docs).length; act = `<p class="mini">Upload each document (demo: one tap each)</p><ul class="docs" id="ld">${LDOCS.map((d, i) => `<li class="${RF.docs[i] ? 'on' : ''}" data-i="${i}">${ICON.doc}<span>${d}</span><em>${RF.docs[i] ? 'Uploaded' : 'Upload'}</em></li>`).join('')}</ul><button class="btn btn-primary mt" id="ldGo" ${n < LDOCS.length ? 'disabled' : ''}>Send to ${RF.bank}</button>`; }
    else if (ms === 2) act = `<div class="vf-res"><div class="spin"></div><b>${RF.bank} is valuing the home…</b></div>`;
    else if (ms === 3) { if (!RF.loanAmt) RF.loanAmt = maxL; act = `<div class="vf-res"><b>Valued at ${px(fp)}</b><span>Pre-approved up to ${px(maxL)} (${(ltv * 100).toFixed(0)}% of value, demo)</span></div><label class="fld">Loan amount <b id="laV">${px(RF.loanAmt)}</b><input type="range" id="la" min="${Math.round(fp * .4 / 1e4) * 1e4}" max="${maxL}" step="10000" value="${RF.loanAmt}"></label><button class="btn btn-primary mt" id="paGo">Accept pre-approval</button>`; }
    else if (ms === 4) { const r = .048, t = 25, pm = pmt(RF.loanAmt, r, t); act = `<div class="card-s"><div class="ln"><span>Loan</span><b>${px(RF.loanAmt)}</b></div><div class="ln"><span>Rate (fixed 3 years, demo)</span><b>4.8%</b></div><div class="ln"><span>Term</span><b>${t} years</b></div><div class="ln"><span>Monthly instalment</span><b>${px(pm)}</b></div></div><button class="btn btn-primary mt" id="lnGo">Accept final offer</button>`; }
    else act = `<div class="vf-res"><div class="okc">${ICON.check}</div><b>Loan approved</b><span>${RF.bank}: ${px(RF.loan.amount)} over ${RF.loan.term} years.</span></div>`;
    panel = `<h2>Get your mortgage</h2><p class="sub">Five steps with your bank. Your progress is saved.</p><ol class="mini-st big-st">${rows.map((r, i) => `<li class="${i < ms ? 'on' : i === ms ? 'cur' : ''}"><i></i>${r}</li>`).join('')}</ol>${act}`;
  } else if (k === 'pay') {
    const loan = RF.loan ? RF.loan.amount : 0, fee2 = loan ? loan * .0025 + 290 : 0, dep = fp * .1, ch = f.dld + f.trustee + f.admin + f.agency + fee2;
    ok = RF.paid; nextLbl = 'Continue';
    panel = `<h2>Initial payment and charges</h2><p class="sub">Pay the 10% deposit now. The balance moves at the DLD trustee office on transfer day.</p>
     <div class="card-s"><div class="ln"><span>Initial payment (10% deposit)</span><b>${px(dep)}</b></div><div class="ln"><span>DLD transfer fee (4%)</span>${px(f.dld)}</div><div class="ln"><span>Trustee fee + VAT</span>${px(f.trustee)}</div><div class="ln"><span>Agency fee (2% + VAT)</span>${px(f.agency)}</div>${loan ? `<div class="ln"><span>Mortgage registration (0.25% + AED 290)</span>${px(fee2)}</div>` : ''}<div class="ln"><span><b>Total payable on transfer day, besides the deposit</b></span><b>${px(ch)}</b></div></div>
     <p class="mini">${loan ? `Bank pays ${money(loan)} at transfer. Your balance then is ${money(fp * .9 - loan)}.` : `Balance at transfer: ${money(fp * .9)}.`} Fee amounts are indicative.</p>
     ${RF.paid ? `<div class="vf-res"><div class="okc">${ICON.check}</div><b>Deposit received</b><span>Held by the trustee office for the seller. (Demo)</span></div>` : `<button class="btn btn-primary mt" id="depGo">Pay ${money(dep, true)} deposit</button><div class="spin" id="spin" hidden></div>`}`;
  } else {
    ok = RF.sig; nextLbl = 'Complete and register at DLD';
    panel = `<h2>Sign the sale contract</h2><p class="sub">Sign the contract (Form F). We then book the DLD transfer for you.</p><div class="sig"><canvas id="sig" height="170"></canvas><button class="btn btn-ghost sm" id="sigClr">Clear</button></div>`;
  }
  const foot = `<div class="rs-foot"><button class="btn btn-ghost" id="rsBack">${ICON.back} Back</button><button class="btn btn-primary" id="rsNext" ${ok ? '' : 'disabled'}>${nextLbl} ${ICON.arrow}</button></div>`;
  el.innerHTML = `<div class="wrap rs"><div class="rs-main">${bar}<div class="rs-panel">${panel}${foot}</div></div>${side}</div>`;
  refreshPrices(el); reveal(el);
  const re = () => renderReady();
  $('#rsBack').onclick = () => { if (RF.step === 0) go('project'); else { RF.step--; re(); } };
  $('#rsNext').onclick = () => { if (k === 'sign') return finishReady(); RF.step++; re(); };
  if (k === 'view') {
    initSeg($('#vmode'), v => RF.mode = v);
    ['vday', 'vtime'].forEach(id => { const b = $('#' + id); b.onclick = e => { const c = e.target.closest('.chip'); if (!c) return; $$('.chip', b).forEach(x => x.setAttribute('aria-pressed', String(x === c))); RF[id === 'vday' ? 'day' : 'time'] = +c.dataset.i; }; });
    const bk = $('#vBook'); if (bk) bk.onclick = () => { RF.booked = true; toast('Viewing booked'); re(); };
  }
  clearInterval(RF_POLL);
  if (k === 'bid' && LIVE) {
    const sl = $('#bid'), show = () => { $('#bidV').innerHTML = px(ask * sl.value / 100, true); refreshPrices($('#bidV')); };
    if (sl) { show(); sl.oninput = () => { RF.bid = sl.value / 100; show(); }; }
    const sync = d => { RF.bidStatus = d.status; RF.bidAmount = d.amount; RF.bidCounter = d.counter; RF.bidLog = d.log; RF.bidUpd = d.updated; if (d.status === 'accepted') { RF.accepted = true; RF.final = d.amount; } };
    const call = async (u, opt) => { const r = await fetch(u, { ...opt, headers: { 'Content-Type': 'application/json' } }); if (!r.ok) throw new Error(r.status); return r.json(); };
    const snd = $('#bdSend');
    if (snd) {
      const chk = () => { snd.disabled = !($('#bdName').value.trim().length >= 2 && $('#bdPhone').value.replace(/\D/g, '').length >= 7 && $('#bdOk').checked); };
      ['bdName', 'bdPhone', 'bdOk'].forEach(i => $('#' + i).addEventListener('input', chk));
      snd.onclick = async () => {
        snd.disabled = true; snd.textContent = 'Sending…'; RF.bname = $('#bdName').value.trim(); RF.bphone = $('#bdPhone').value.trim();
        try { const d = await call('/api/bids', { method: 'POST', body: JSON.stringify({ homeId: p.id, homeName: p.name, ask, amount: ask * RF.bid, name: RF.bname, phone: RF.bphone, consent: true, website: $('#bdWeb').value }) }); RF.bidId = d.id; RF.bidToken = d.token; sync(d); track('bid', p.id); re(); }
        catch (e) { snd.disabled = false; snd.textContent = 'Send offer to the seller'; const er = $('#bdErr'); er.textContent = 'We could not send the offer. Please check the details, or call ' + SUPPORT.name + ' on ' + fmtPhone(SUPPORT.phone) + '.'; er.hidden = false; }
      };
    }
    const nw = $('#bdNew'); if (nw) nw.onclick = async () => { nw.disabled = true; try { sync(await call('/api/bids/' + RF.bidId + '/respond', { method: 'POST', body: JSON.stringify({ token: RF.bidToken, action: 'offer', amount: ask * RF.bid }) })); re(); } catch (e) { nw.disabled = false; toast('Could not send the offer', 'info'); } };
    const ac = $('#bdAcc'); if (ac) ac.onclick = async () => { ac.disabled = true; try { sync(await call('/api/bids/' + RF.bidId + '/respond', { method: 'POST', body: JSON.stringify({ token: RF.bidToken, action: 'accept_counter' }) })); re(); } catch (e) { ac.disabled = false; toast('Could not accept', 'info'); } };
    if (RF.bidId && (RF.bidStatus === 'pending')) RF_POLL = setInterval(async () => {
      if (curView !== 'reserve' || rkeys()[RF.step] !== 'bid') return clearInterval(RF_POLL);
      try { const d = await call('/api/bids/' + RF.bidId + '?token=' + RF.bidToken); if (d.updated !== RF.bidUpd) { sync(d); toast(d.status === 'accepted' ? 'The seller accepted your offer' : 'The seller replied', 'ok'); re(); } } catch (e) { /* keep trying */ }
    }, 4000);
  } else if (k === 'bid') {
    const sl = $('#bid'), show = () => { $('#bidV').innerHTML = px(ask * sl.value / 100, true); refreshPrices($('#bidV')); };
    show(); sl.oninput = () => { RF.bid = sl.value / 100; show(); };
    const send = $('#bidGo'); if (send) send.onclick = () => bidRound(ask, re);
    const acc = $('#acc'); if (acc) acc.onclick = () => { RF.accepted = true; RF.final = RF.counter; RF.log.push(['me', 'I accept your price.'], ['seller', 'Great. Deal closed.']); re(); };
  }
  if (k === 'mode') $('#pm').onclick = e => { const b = e.target.closest('.opt'); if (!b) return; RF.pay = b.dataset.v; re(); };
  if (k === 'loan') {
    const ms = RF.ms;
    if (ms === 0) $('#bk').onclick = e => { const b = e.target.closest('.opt'); if (!b) return; RF.bank = b.dataset.v; RF.ms = 1; toast('Connected to ' + RF.bank); re(); };
    if (ms === 1) { $('#ld').onclick = e => { const li = e.target.closest('li'); if (!li) return; RF.docs[li.dataset.i] = 1; re(); }; $('#ldGo').onclick = () => { RF.ms = 2; re(); }; }
    if (ms === 2) setTimeout(() => { if (curView === 'reserve' && RF.ms === 2) { RF.ms = 3; re(); } }, RM ? 100 : 2000);
    if (ms === 3) { const la = $('#la'); la.oninput = () => { RF.loanAmt = +la.value; $('#laV').innerHTML = px(RF.loanAmt); refreshPrices($('#laV')); }; $('#paGo').onclick = () => { RF.ms = 4; re(); }; }
    if (ms === 4) $('#lnGo').onclick = () => { RF.loan = { amount: RF.loanAmt, rate: .048, term: 25, bank: RF.bank, pmt: pmt(RF.loanAmt, .048, 25) }; RF.ms = 5; toast('Loan approved'); re(); };
  }
  if (k === 'pay') { const d = $('#depGo'); if (d) d.onclick = () => { d.hidden = true; $('#spin').hidden = false; setTimeout(() => { RF.paid = true; toast('Deposit received'); re(); }, RM ? 100 : 1500); }; }
  if (k === 'sign') {
    const cv = $('#sig'); cv.width = cv.clientWidth; const c = cv.getContext('2d'); c.lineWidth = 2.6; c.lineCap = 'round'; c.strokeStyle = '#0A2A2E'; let d = false;
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.onpointerdown = e => { d = true; cv.setPointerCapture(e.pointerId); const [x, y] = pt(e); c.beginPath(); c.moveTo(x, y); };
    cv.onpointermove = e => { if (!d) return; const [x, y] = pt(e); c.lineTo(x, y); c.stroke(); if (!RF.sig) { RF.sig = true; $('#rsNext').disabled = false; } };
    cv.onpointerup = () => d = false;
    $('#sigClr').onclick = () => { c.clearRect(0, 0, cv.width, cv.height); RF.sig = false; $('#rsNext').disabled = true; };
  }
  scrollTo(0, 0);
}
function bidRound(ask, re) {
  RF.round++; RF.counter = 0; const bid = Math.round(ask * RF.bid / 5000) * 5000, ratio = bid / ask;
  RF.log.push(['me', 'My offer: ' + money(bid, true)]);
  if (ratio >= .97) { RF.accepted = true; RF.final = bid; RF.log.push(['seller', 'Accepted. Deal closed.']); }
  else if (ratio >= .93 || RF.round >= 3) { RF.counter = RF.round >= 3 ? Math.round(ask * .985 / 5000) * 5000 : Math.round((bid + ask * .985) / 2 / 5000) * 5000; RF.log.push(['seller', (RF.round >= 3 ? 'My final price: ' : 'I can do ') + money(RF.counter, true)]); }
  else { RF.counter = 0; RF.log.push(['seller', 'Too far below what I need. Please come closer to the asking price.']); }
  re();
}
function finishReady() {
  const p = byId(S.pid), ref = 'ARK-' + (hash(p.id + RF.final) % 900000 + 100000);
  S.res = { kind: 'res', pid: p.id, price: RF.final, loan: RF.loan, ref };
  const el = V.reserve;
  el.innerHTML = `<div class="wrap fin"><canvas id="cf"></canvas><div class="okc big">${ICON.check}</div><h1>${p.name} is nearly yours</h1><p class="lead">Contract signed at ${px(RF.final)}. Reference <b>${ref}</b>.</p>
   <ol class="next"><li><b>This week</b><span>We book your appointment at the DLD trustee office.</span></li><li><b>Transfer day</b><span>${RF.loan ? 'The bank pays the loan amount and you pay your balance. ' : 'You pay the balance. '}Fees are settled at the trustee office.</span></li><li><b>After transfer</b><span>Title deed in your name, then ${RF.loan ? 'mortgage instalment reminders' : 'service charge reminders'}.</span></li></ol>${feedbackHTML()}
   <div class="row"><button class="btn btn-primary" id="toTrack" data-magnetic>Track my purchase ${ICON.arrow}</button><button class="btn btn-ghost" id="toHome">Keep browsing</button></div></div>`;
  $('#toTrack').onclick = () => goTracker(); $('#toHome').onclick = () => go('home');
  confetti($('#cf')); bindFeedback(el); toast('Contract signed');
}
