/* ---------- status tracker (off-plan and ready) ---------- */
let trkTimer = null;
const pmt = (L, r, n) => L * r / 12 / (1 - Math.pow(1 + r / 12, -n * 12));
function goTracker() {
  if (!S.res) {  /* sample purchase so the tracker can always be explored */
    const p = PROJ[0], us = unitsFor(p, 22), u = us.find(x => x.st === 'avail') || us[0];
    S.res = { kind: 'off', pid: p.id, unit: u, planKey: p.plan, ref: 'ARK-' + (hash(p.id + u.no) % 900000 + 100000), demo: true };
  }
  go('tracker', buildTracker);
}
function trackerCfg(r) {
  const p = byId(r.pid);
  if (r.kind === 'res') {
    const price = r.price, loan = r.loan ? r.loan.amount : 0, f = feesOf(p, price), fees = f.dld + f.trustee + f.admin + f.agency + (loan ? loan * .0025 + 290 : 0);
    const stages = [['Viewing', 'You saw the home', 0], ['Deal closed', 'Offer accepted, contract signed', 0]];
    if (loan) stages.push(['Mortgage approved', 'The bank issued the final offer', 1]);
    stages.push(['Initial payment and charges', '10% deposit plus government fees', 2], ['Registered at DLD', 'Title transferred to you', 3], ['You are the owner', 'Title deed in your name', 4], ['Payments and follow-ups', loan ? 'Mortgage instalment reminders' : 'Service charge reminders', 5]);
    const pays = [{ n: 'Initial payment (10% deposit)', m: 2, amt: price * .1 }, { n: 'Charges: DLD, trustee, agency', m: 2, amt: fees }];
    if (loan) pays.push({ n: 'Bank pays loan amount', m: 3, amt: loan });
    pays.push({ n: 'Your balance at transfer', m: 3, amt: price * .9 - loan });
    if (loan) for (let k = 1; k <= 6; k++) pays.push({ n: 'Mortgage instalment ' + k, m: 5 + k, amt: r.loan.pmt });
    else [6, 9].forEach((m, k) => pays.push({ n: 'Service charge, quarter ' + (k + 1), m, amt: p.svc * p.size / 4 }));
    const docs = [['Viewing confirmation', 0], ['Accepted offer and contract (Form F)', 0]];
    if (loan) docs.push(['Mortgage pre-approval letter', 1], ['Final bank offer letter', 1]);
    docs.push(['Payment receipts', 2], ['Transfer forms signed at trustee', 3], ['Title deed', 4]); if (loan) docs.push(['Mortgage contract', 4]);
    const ev = [[0, 'Viewing done'], [0, 'Offer accepted, deal closed'], ...(loan ? [[1, 'Mortgage approved by ' + r.loan.bank]] : []), [2, 'Initial payment received'], [3, 'Transfer registered at DLD'], [4, 'Title deed issued'], [5, 'Utilities and keys handed over'], ...pays.filter(x => x.m >= 5).map(x => [x.m, x.n + ' due'])];
    return { p, res: true, price, ref: r.ref, maxM: 10, dm: 3, stages, pays, docs, ev, loan: r.loan, ownAt: 4, dldSteps: ['Initial payment', 'Forms signed at trustee', 'DLD review', 'Title transferred'], dldNo: 'Transfer reference', sub: p.unit + ' · ' + p.area, handover: 'Ready now', feeLabel: 'DLD transfer fee (4%)' };
  }
  const u = r.unit, price = u.price, sch = schedule(p, r.planKey);
  const stages = [['EOI submitted', 'Home held, EOI money in escrow', 0], ['Deal closed', 'Sale agreement signed, initial payment made', 1], ['Registered at DLD', 'Oqood certificate issued for your unit', 2], ['Under construction', 'Progress checked by RERA inspectors', 3], ['Handover and snagging', 'Inspect the unit, list any defects', p.hm], ['Title deed', 'Ownership recorded in your name', p.hm + 2]];
  const docs = [['EOI form', 0], ['EOI payment receipt', 0], ['Sale agreement (SPA)', 1], ['Oqood certificate', 2], ['Floor plan and unit specification', 1], ['Construction progress report', 6], ['Handover notice', p.hm], ['Title deed', p.hm + 2]];
  const pays = sch.map(x => ({ n: x.n, m: x.m, amt: price * x.pc / 100 }));
  const ev = [[0, 'EOI received in escrow'], [1, 'Sale agreement signed, deal closed'], [1, 'Initial payment made'], [2, 'Oqood registered at DLD'], [3, 'Construction started'], ...sch.filter(x => x.m > 1 && x.m <= p.hm).map(x => [x.m, x.n + ' due']), [Math.round(p.hm * .5), 'Mid-build inspection'], [p.hm, 'Handover invitation'], [p.hm + 2, 'Title deed issued']];
  return { p, res: false, price, ref: r.ref, maxM: p.hm + 3, dm: 2, stages, pays, docs, ev, ownAt: p.hm + 2, dldSteps: ['Booking paid', 'Sent to trustee', 'DLD review', 'Registered'], dldNo: 'Oqood number', sub: u.type + ' · unit ' + u.no + ' · ' + p.area, handover: p.ho, feeLabel: 'DLD fee (4%)' };
}
function buildTracker() {
  clearInterval(trkTimer); S.playing = false;
  const r = S.res, c = trackerCfg(r), p = c.p, price = c.price, maxM = c.maxM, dm = c.dm;
  const oq = (c.res ? 'TR-' : 'OQ-') + (hash(r.ref) % 9000000 + 1000000);
  const ag = S.agent ? `<span class="pill ok">${S.agent.mode === 'call' ? 'Call requested' : 'Meeting booked'}: ${S.agent.when}</span>` : '';
  const side = c.res ? `<section class="tc"><h3>Your home</h3><ul class="docs" id="home">${[['Funds confirmed', 3], ['Title transferred', 4], ['Utilities connected (DEWA)', 5], ['Keys received', 5]].map(d => `<li data-at="${d[1]}">${ICON.check}<span>${d[0]}</span><em></em></li>`).join('')}</ul></section>` :
    `<section class="tc"><h3>Project progress</h3><div class="prj"><canvas id="bld" width="220" height="200" aria-label="Building under construction"></canvas><div><div class="big" id="prog">0%</div><span class="mini">complete</span></div></div><div class="ln"><span>RERA project</span><b>${p.rera}</b></div><div class="ln"><span>Next inspection</span><b id="insp"></b></div></section>`;
  const money2 = c.res ? (c.loan ? `<section class="tc"><h3>Mortgage</h3><div class="ln"><span>Bank</span><b>${c.loan.bank}</b></div><div class="ln"><span>Loan</span><b>${px(c.loan.amount)}</b></div><div class="ln"><span>Rate and term</span><b>${(c.loan.rate * 100).toFixed(1)}% · ${c.loan.term} years</b></div><div class="ln"><span>Monthly instalment</span><b>${px(c.loan.pmt)}</b></div><div class="ln"><span>Balance left</span><b id="lnBal"></b></div><p class="mini">Demo rate and terms.</p></section>` : `<section class="tc"><h3>Payment summary</h3><div class="ln"><span>Price plus fees</span><b>${px(price + c.pays[1].amt)}</b></div><div class="ln"><span>Paid so far</span><b id="sPaid"></b></div><div class="ln"><span>Still to pay</span><b id="sLeft"></b></div></section>`)
    : `<section class="tc"><h3>Escrow</h3><div class="esc"><div class="esc-b"><i id="eRel"></i><i id="eHeld"></i></div></div><div class="ln"><span class="d d1"></span>Held for you<b id="eH"></b></div><div class="ln"><span class="d d2"></span>Released to developer<b id="eR"></b></div><p class="mini">Released only as certified construction milestones are reached. Illustrative split.</p></section>`;
  V.tracker.innerHTML = `<div class="wrap tk">
   <header class="tk-h"><div class="tk-id"><img alt="" src="${imgFor(p)}"><div><p class="eyebrow">Reference ${r.ref}${r.demo ? ' · sample purchase' : ''}</p><h1>${p.name}</h1><p>${c.sub}</p>${ag}</div></div>
    <div class="tk-sum"><div><small>Price</small><b>${px(price)}</b></div><div><small>Paid so far</small><b id="kPaid"></b></div><div><small>${c.res ? 'Status' : 'Handover'}</small><b>${c.handover}</b></div></div></header>
   <div class="tm"><button class="btn btn-ghost sm" id="tmPlay" aria-label="Play time machine">▶ Play</button><div class="tm-r"><label for="tm">Demo time machine: ${monthLabel(0)} to ${monthLabel(maxM)}</label><input id="tm" type="range" min="0" max="${maxM}" step="1" value="1"></div><b id="tmNow"></b></div>
   <div class="next-st" id="nextSt" aria-live="polite"></div>
   <div class="tk-grid">
    <section class="tc stg"><h3>Your journey</h3><ol id="stg">${c.stages.map(s => `<li data-at="${s[2]}"><i></i><div><b>${s[0]}</b><span>${s[1]}</span><em>${monthLabel(s[2])}</em></div></li>`).join('')}</ol></section>
    <section class="tc"><h3>DLD registration</h3><div class="pillrow"><span class="pill" id="dldPill"></span></div><div class="ln"><span>${c.dldNo}</span><b id="oqN">–</b></div><ol class="mini-st" id="dldSt">${c.dldSteps.map(s => `<li><i></i>${s}</li>`).join('')}</ol><div class="ln"><span>${c.feeLabel}</span><b id="dldFee"></b></div><p class="mini">${c.res ? 'The transfer is signed and paid at a DLD trustee office.' : 'Off-plan sales must be registered within 60 days of the agreement.'}</p></section>
    ${side}${money2}
    <section class="tc wide"><div class="tc-h"><h3>Payments and reminders</h3><button class="bell" id="bell" aria-pressed="true">${ICON.bell}<span>Reminders on</span></button></div><div id="pays">${c.pays.map(x => `<div class="py" data-m="${x.m}"><i></i><span>${x.n}<em>${monthLabel(x.m)}</em></span><b>${px(x.amt)}</b><u></u></div>`).join('')}</div></section>
    <section class="tc"><h3>Documents</h3><ul class="docs" id="docs">${c.docs.map(d => `<li data-at="${d[1]}">${ICON.doc}<span>${d[0]}</span><em></em></li>`).join('')}</ul></section>
    <section class="tc"><h3>Updates and follow-ups</h3><ul class="act" id="act"></ul></section>
   </div></div>`;
  const q = s => $(s, V.tracker), tm = q('#tm');
  let drawBld = () => { };
  if (!c.res) {
    const bld = q('#bld'), bc = bld.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2); bld.width = 220 * dpr; bld.height = 200 * dpr; bc.scale(dpr, dpr);
    drawBld = pc => {
      bc.clearRect(0, 0, 220, 200); const fl = Math.min(p.floors, 22), x0 = 60, w = 100, H0 = 175, fh = 150 / fl, done = Math.floor(fl * pc / 100);
      bc.fillStyle = '#E4EFEC'; bc.fillRect(10, H0, 200, 6);
      for (let i = 0; i < fl; i++) {
        const y = H0 - (i + 1) * fh;
        if (i < done) { bc.fillStyle = i % 2 ? '#6FB9B4' : '#0E7C79'; bc.fillRect(x0, y, w, fh - 1); bc.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 4; k++) bc.fillRect(x0 + 8 + k * 23, y + 3, 14, fh - 7); }
        else { bc.strokeStyle = 'rgba(10,42,46,.25)'; bc.setLineDash([3, 3]); bc.strokeRect(x0 + .5, y + .5, w - 1, fh - 2); bc.setLineDash([]); }
      }
      if (pc < 100) { const ty = H0 - 160; bc.strokeStyle = '#FF7A59'; bc.lineWidth = 2; bc.beginPath(); bc.moveTo(175, H0); bc.lineTo(175, ty); bc.moveTo(120, ty); bc.lineTo(205, ty); bc.moveTo(130, ty); bc.lineTo(130, ty + 22); bc.stroke(); bc.lineWidth = 1; }
    };
  }
  const upd = m => {
    S.month = m; q('#tmNow').textContent = monthLabel(m); tm.value = m;
    $$('#stg li', V.tracker).forEach((li, i, all) => { const at = +li.dataset.at, nx = all[i + 1] ? +all[i + 1].dataset.at : 1e9; li.className = m >= nx ? 'done' : m >= at ? 'now' : ''; $('i', li).innerHTML = m >= nx ? ICON.check : ''; });
    const left = dm - m, labels = ['Waiting for payment', 'Sent to trustee office', 'Under DLD review', 'Registered'];
    q('#dldPill').textContent = m >= dm ? 'Registered' : labels[left >= 2 ? 0 : 1]; q('#dldPill').className = 'pill ' + (m >= dm ? 'ok' : 'wait');
    $$('#dldSt li', V.tracker).forEach((li, i) => li.className = (m >= dm ? 4 : left >= 2 ? 1 : 2) > i ? 'on' : '');
    q('#oqN').textContent = m >= dm ? oq : 'Issued on registration'; q('#dldFee').innerHTML = m >= (c.res ? 2 : 1) ? 'Paid' : px(price * .04); refreshPrices(q('#dldFee'));
    let paid = 0, nextI = -1, cnt = 0; c.pays.forEach((x, i) => { if (x.m <= m) { paid += x.amt; if (/instalment/i.test(x.n)) cnt++; } else if (nextI < 0) nextI = i; });
    $$('.py', V.tracker).forEach((row, i) => { const x = c.pays[i], done = x.m <= m, d = x.m - m; row.className = 'py ' + (done ? 'paid' : i === nextI ? 'next' : ''); $('u', row).textContent = done ? 'Paid' : i === nextI ? (d <= 1 ? 'Due this month' : 'Due in ' + d + ' months') : 'Upcoming'; $('i', row).innerHTML = done ? ICON.check : ''; });
    q('#kPaid').innerHTML = px(paid);
    if (!c.res) {
      const pc = m < 3 ? 0 : Math.round(progressAt(p, m)); q('#prog').textContent = pc + '%'; drawBld(pc);
      q('#insp').textContent = m < 3 ? 'After launch' : m >= p.hm ? 'Completed' : monthLabel(Math.min(p.hm, Math.ceil((m + 1) / 3) * 3));
      const rel = paid * (pc / 100) * .95, held = paid - rel;
      q('#eRel').style.setProperty('--w', paid ? rel / paid * 100 : 0); q('#eHeld').style.setProperty('--w', paid ? held / paid * 100 : 0); q('#eH').innerHTML = px(held); q('#eR').innerHTML = px(rel);
    } else {
      $$('#home li', V.tracker).forEach(li => { const on = m >= +li.dataset.at; li.className = on ? 'on' : ''; $('em', li).textContent = on ? 'Done' : 'Pending'; });
      if (c.loan) { const rr = c.loan.rate / 12, n = c.loan.term * 12, bal = cnt ? c.loan.amount * (Math.pow(1 + rr, n) - Math.pow(1 + rr, cnt)) / (Math.pow(1 + rr, n) - 1) : c.loan.amount; q('#lnBal').innerHTML = px(m >= 3 ? bal : 0); }
      else { const core = c.pays.filter(x => !/Service/.test(x.n)), due = core.reduce((t, x) => t + x.amt, 0), pd = core.reduce((t, x) => t + (x.m <= m ? x.amt : 0), 0); q('#sPaid').innerHTML = px(pd); q('#sLeft').innerHTML = px(due - pd); }
    }
    $$('#docs li', V.tracker).forEach(li => { const on = m >= +li.dataset.at; li.className = on ? 'on' : ''; $('em', li).innerHTML = on ? 'Ready' : ICON.lock; });
    const past = c.ev.filter(e => e[0] <= m).sort((a, b) => b[0] - a[0]).slice(0, 4), up = c.ev.filter(e => e[0] > m).sort((a, b) => a[0] - b[0]).slice(0, 2);
    q('#act').innerHTML = up.reverse().map(e => `<li class="up"><i></i><span>${e[1]}</span><em>${monthLabel(e[0])}</em></li>`).join('') + past.map(e => `<li><i></i><span>${e[1]}</span><em>${monthLabel(e[0])}</em></li>`).join('');
    const nx = c.pays[nextI], ns = q('#nextSt');
    ns.innerHTML = nx ? `<b>Next</b><span>${nx.n}: ${px(nx.amt)} in ${Math.max(0, nx.m - m) <= 1 ? 'about a month' : (nx.m - m) + ' months'} (${monthLabel(nx.m)}). ${q('#bell').getAttribute('aria-pressed') === 'true' ? 'A reminder is set.' : 'Reminders are off.'}</span>` : `<b>All set</b><span>Everything due has been paid. We will keep following up on documents and handover.</span>`;
    refreshPrices(ns);
  };
  tm.oninput = () => upd(+tm.value);
  q('#bell').onclick = e => { const b = e.currentTarget, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); $('span', b).textContent = on ? 'Reminders on' : 'Reminders off'; toast(on ? 'You will get a reminder a week before each payment' : 'Reminders turned off', 'info'); upd(S.month); };
  q('#tmPlay').onclick = () => {
    const btn = q('#tmPlay'); if (S.playing) { clearInterval(trkTimer); S.playing = false; btn.textContent = '▶ Play'; return; }
    if (S.month >= maxM) upd(0);
    S.playing = true; btn.textContent = '❚❚ Pause';
    trkTimer = setInterval(() => { if (S.month >= maxM) { clearInterval(trkTimer); S.playing = false; btn.textContent = '▶ Play'; return; } upd(S.month + 1); }, 650);
  };
  upd(1); reveal(V.tracker);
}
