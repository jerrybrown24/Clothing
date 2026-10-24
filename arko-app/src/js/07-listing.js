/* ---------- listing page, project page, 3D explorer ---------- */
const MODES = [['model', '3D model', 'cube'], ['plan', 'Block plan', 'grid'], ['walk', 'Street walk', 'walk'], ['video', 'Demo film', 'film']];
const WA = () => 'https://wa.me/' + SUPPORT.phone.replace(/\D/g, '');
function explorerHTML() { return `<div class="viewer" id="explorer"><div class="vtabs" role="tablist">${MODES.map(([k, l, ic], i) => `<button role="tab" data-m="${k}" aria-selected="${i === 0}">${ICON[ic]}<span>${l}</span></button>`).join('')}</div><div class="stage"${int('Developer 3D / BIM model and Street View (procedural in prototype)')}><div id="s3host" class="s3host"></div><div id="overlay" class="overlay"></div></div></div>`; }
function startExplorer(sc, trackId) {
  const set = m => setMode(sc, m, trackId);
  $('#explorer .vtabs').onclick = e => { const t = e.target.closest('button'); if (t) set(t.dataset.m); };
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); if (!scene3) set('model'); } }, { rootMargin: '200px' }); io.observe($('#explorer'));
  return set;
}
function setMode(L, m, tid) {
  $$('#explorer .vtabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.m === m)));
  const host = $('#s3host'), ov = $('#overlay'); track('view3d', tid, { mode: m });
  if (!scene3) { host.innerHTML = ''; scene3 = Scene3D(host, L, { onPick: p => { const c = $('#pickInfo'); if (c) c.innerHTML = `<b>${esc(p.block)}</b> · floor ${p.floor}`; }, onCaption: (txt, f) => { const c = $('#cap'); if (c) { if (c.textContent !== txt) c.textContent = txt; $('#prog').style.width = (f * 100) + '%'; } }, onWalk: walkHud, onDrop: () => walkUI(L, true, tid) }); }
  scene3.setMode(m);
  if (m === 'model') ov.innerHTML = `<p class="hint">Drag to turn · scroll or pinch to zoom · tap a floor</p><p class="pick" id="pickInfo"></p>`;
  if (m === 'plan') ov.innerHTML = `<p class="hint">Top view of the plot. Tap a block.</p><div class="blocks">${planBlocks(L)}</div><p class="pick" id="pickInfo"></p>`;
  if (m === 'walk') walkUI(L, false, tid);
  if (m === 'video') { track('video', tid); ov.innerHTML = `<div class="film"><p id="cap" class="cap">${esc(L.name)}</p><div class="fbar"><button class="fbtn" id="fPlay" aria-label="Pause">${ICON.pause}</button><div class="ftrack"><i id="prog"></i></div></div></div>`; $('#fPlay').onclick = e => { const p = scene3.playing(); p ? scene3.pause() : scene3.play(); e.currentTarget.innerHTML = p ? ICON.play : ICON.pause; e.currentTarget.setAttribute('aria-label', p ? 'Play' : 'Pause'); }; }
}
function planBlocks(L) {
  const r = R(L.seed + 9), names = L.kind === 'tower' ? ['Tower'] : L.kind === 'twin' ? ['Tower A', 'Tower B'] : [...Array(L.blocks || 2)].map((_, i) => 'Block ' + String.fromCharCode(65 + i));
  return names.map(n => `<div><b>${n}</b><span>${L.sold != null ? Math.round(L.units / names.length * (100 - L.sold) / 100 * (.7 + r() * .6)) + ' homes available' : 'Resale building'}</span></div>`).join('');
}
function walkUI(L, dropped, tid) {
  const ov = $('#overlay');
  if (!dropped) { ov.innerHTML = `<div class="drop"><p><b>Drop in and look around.</b> Tap any street on the map, or start at:</p><div class="row">${[['entrance', 'Main entrance'], ['pool', 'Pool deck'], ['boulevard', 'Boulevard']].map(([k, l]) => `<button class="btn btn-ghost sm" data-drop="${k}">${l}</button>`).join('')}</div></div>`;
    ov.onclick = e => { const b = e.target.closest('[data-drop]'); if (b) { scene3.dropAt(b.dataset.drop); track('walk', tid, { at: b.dataset.drop }); } }; return; }
  ov.onclick = null;
  ov.innerHTML = `<div class="hud" id="hud"></div><div class="pad" aria-label="Walk controls"><button data-w="f" aria-label="Walk forward">▲</button><button data-w="tl" aria-label="Turn left">⟲</button><button data-w="b" aria-label="Walk back">▼</button><button data-w="tr" aria-label="Turn right">⟳</button></div><button class="btn btn-ghost sm exit" id="wExit">Exit walk</button><p class="hint">Drag to look · arrows to walk</p>`;
  let hold = null; const act = k => { if (k === 'tl') scene3.turn(.18); else if (k === 'tr') scene3.turn(-.18); else scene3.move(k, 2.2); };
  $$('.pad button', ov).forEach(b => { b.onpointerdown = e => { e.preventDefault(); act(b.dataset.w); clearInterval(hold); hold = setInterval(() => act(b.dataset.w), 90); }; b.onpointerup = b.onpointerleave = () => clearInterval(hold); });
  $('#wExit').onclick = () => { scene3.exitWalk(); walkUI(L, false, tid); };
  const c = $('#s3host canvas'); c && c.focus({ preventScroll: true });
}
function walkHud(items) { const h = $('#hud'); if (h) h.innerHTML = items.sort((a, b) => a.d - b.d).slice(0, 4).map(i => `<div><span class="arr" style="transform:rotate(${(-i.turn).toFixed(0)}deg)">↑</span><b>${esc(i.name)}</b><small>${i.d.toFixed(1)} km · ${i.t.min} min</small></div>`).join(''); }

function nearbyHTML(x) {
  return `<ul class="places"${int('Maps and places API (approximate coordinates in prototype)')}>${nearby(x).map(p => `<li><span class="pi" style="--c:${CATCOL[p.cat]}">${ICON[CAT[p.cat][1]]}</span><div><small>${CAT[p.cat][0]}</small><b>${esc(p.name)}</b></div><div class="pd"><b>${p.t.min} min</b><small>${p.t.mode} · ${p.d.toFixed(1)} km</small></div></li>`).join('')}</ul>`;
}
function marketHTML(x, ppsf, status) {
  const d = dldOf(x), A = MARKET && MARKET.areas[x.area]; if (!d) return '<p class="muted">No DLD figures for this area yet.</p>';
  const ref = status === 'off' ? d.offMed : d.readyMed, max = Math.max(ppsf, d.offMed || 0, d.readyMed || 0) * 1.1, bar = (l, v, c) => `<div class="hb ${c || ''}"><span>${l}</span><div><i style="width:${(v / max * 100).toFixed(1)}%"></i></div><b>AED ${Math.round(v).toLocaleString('en-US')}</b></div>`;
  const vs = ref ? (ppsf / ref - 1) * 100 : 0, mm = A ? A.monthly : [], mn = Math.min(...mm.map(m => m.med)) * .95, mxx = Math.max(...mm.map(m => m.med)) * 1.03;
  const spark = mm.length ? `<svg viewBox="0 0 300 90" class="line" role="img" aria-label="Monthly median price per sqft"><path d="${mm.map((m, i) => (i ? 'L' : 'M') + (10 + i / (mm.length - 1) * 280).toFixed(1) + ',' + (75 - (m.med - mn) / (mxx - mn) * 60).toFixed(1)).join('')}"/>${mm.map((m, i) => `<circle cx="${(10 + i / (mm.length - 1) * 280).toFixed(1)}" cy="${(75 - (m.med - mn) / (mxx - mn) * 60).toFixed(1)}" r="2.6"><title>${m.m}: AED ${m.med}/sqft, ${m.n} sales</title></circle>`).join('')}<text x="10" y="88">${mm[0].m}</text><text x="290" y="88" text-anchor="end">${mm[mm.length - 1].m}</text></svg>` : '';
  return `<div class="mkt"${int('DLD open data (live)')}><div class="card-s"><h4>Price per sqft against ${esc(x.area)}</h4>${bar('This home', ppsf, 'hi')}${d.offMed ? bar('Off-plan median', d.offMed) : ''}${d.readyMed ? bar('Ready median', d.readyMed, 'lo') : ''}<p class="mini">${Math.abs(vs).toFixed(1)}% ${vs <= 0 ? 'below' : 'above'} the median for ${status === 'off' ? 'off-plan' : 'ready'} flats sold here this year (${d.n.toLocaleString('en-US')} sales, DLD).</p></div>
    <div class="card-s"><h4>Monthly median, ${esc(x.area)}</h4>${spark}<p class="mini">Median AED per sqft of single-unit flat sales by month, DLD open data.</p></div>
    ${A ? `<div class="card-s wide"><h4>Latest registered sales nearby</h4><div class="scroll"><table class="tx"><thead><tr><th>Date</th><th>Project or building</th><th>Type</th><th>Size</th><th>Price</th><th>Per sqft</th></tr></thead><tbody>${A.recent.slice(0, 6).map(t => `<tr><td>${t.d}</td><td>${esc(t.project || '–')}</td><td>${esc(t.rooms)}</td><td>${t.sqft.toLocaleString('en-US')}</td><td>${px(t.price, true)}</td><td>${t.ppsf.toLocaleString('en-US')}</td></tr>`).join('')}</tbody></table></div><a class="link" href="#market" data-marea="${esc(x.area)}">All ${esc(x.area)} market data</a></div>` : ''}</div>`;
}
/* returns model: what you put in, rent after costs, sale value, profit */
function model(l, o) {
  const p = l.project && projectById(l.project), price = l.price, f = fees(price, l.status === 'ready'), feesT = f.dld + f.trustee + f.admin + f.agency;
  const start = p ? p.hm / 12 : 0, rate = .045, loan = price * o.ltv, equity = price - loan + feesT; let net = 0; const prof = [];
  for (let y = 1; y <= o.yrs; y++) { const act = clamp(y - start, 0, 1), rent = l.rentEst * Math.pow(1 + o.rg, Math.max(0, y - 1 - start)), svc = l.svc * l.size * Math.pow(1.03, y - 1); net += act * (rent - svc - pmt(loan, rate, 25) * 12); prof.push(net + price * Math.pow(1 + o.g, y) * .98 - price - feesT); }
  const profit = prof[prof.length - 1], roi = profit / equity; return { equity, net, exit: price * Math.pow(1 + o.g, o.yrs), profit, roi, ann: roi > -1 ? Math.pow(1 + roi, 1 / o.yrs) - 1 : -1, prof, netY: (l.rentEst - l.svc * l.size) / price * 100 };
}
function modelHTML(l) {
  return `<div class="mdl"${int('Financial model (ARKO, demo assumptions)')}><div class="mdl-in"><label>Hold for <b id="vY"></b><input type="range" id="mY" min="3" max="10" value="5"></label><label>Price growth a year <b id="vG"></b><input type="range" id="mG" min="0" max="10" step=".5" value="4"></label><label>Rent growth a year <b id="vR"></b><input type="range" id="mR" min="0" max="6" step=".5" value="2"></label><label>Mortgage <b id="vL"></b><input type="range" id="mL" min="0" max="${l.status === 'off' ? 50 : 80}" step="5" value="0"></label><p class="mini">Mortgage at 4.5% over 25 years${l.status === 'off' ? ', from handover' : ''}. Selling costs 2%. Service charge grows 3% a year.</p></div><div class="mdl-out" id="mOut"></div></div>`;
}
function bindModel(l) {
  const run = () => { const o = { yrs: +$('#mY').value, g: +$('#mG').value / 100, rg: +$('#mR').value / 100, ltv: +$('#mL').value / 100 }; $('#vY').textContent = o.yrs + ' years'; $('#vG').textContent = (o.g * 100).toFixed(1) + '%'; $('#vR').textContent = (o.rg * 100).toFixed(1) + '%'; $('#vL').textContent = (o.ltv * 100).toFixed(0) + '%';
    const m = model(l, o), mx = Math.max(...m.prof.map(Math.abs), 1);
    $('#mOut').innerHTML = `<div class="mo"><div><small>Cash you put in</small><b>${px(m.equity)}</b></div><div><small>Rent after costs</small><b>${px(m.net)}</b></div><div><small>Sale value</small><b>${px(m.exit)}</b></div><div class="${m.profit >= 0 ? 'pos' : 'neg'}"><small>Profit after selling</small><b>${px(m.profit)}</b></div></div><p class="roi"><b class="${m.roi >= 0 ? 'pos' : 'neg'}">${(m.roi * 100).toFixed(0)}%</b> total return on your cash, about ${(m.ann * 100).toFixed(1)}% a year. Net rental yield ${m.netY.toFixed(1)}%.</p><div class="bars">${m.prof.map((v, i) => `<div class="${v < 0 ? 'n' : ''}"><i style="height:${Math.max(3, Math.abs(v) / mx * 100).toFixed(0)}%"></i><span>Y${i + 1}</span></div>`).join('')}</div>`; };
  ['mY', 'mG', 'mR', 'mL'].forEach(id => $('#' + id).oninput = run); run();
}
function mortgageHTML(l) { return `<div class="mort"><label>Down payment <b id="dpV"></b><input type="range" id="dp" min="20" max="80" step="5" value="${l.status === 'off' ? 50 : 20}"></label><label>Interest rate <b id="irV"></b><input type="range" id="ir" min="3" max="7" step=".1" value="4.5"></label><label>Years <b id="yrV"></b><input type="range" id="yr" min="5" max="25" value="25"></label><div class="mort-out" id="mortOut"></div><p class="mini">UAE banks usually lend up to 80% to residents buying a first home under AED 5M, less for off-plan. Indicative only.</p></div>`; }
function bindMortgage(l) { const run = () => { const dp = +$('#dp').value, ir = +$('#ir').value, yr = +$('#yr').value, loan = l.price * (1 - dp / 100); $('#dpV').textContent = dp + '% · ' + money(l.price * dp / 100); $('#irV').textContent = ir.toFixed(1) + '%'; $('#yrV').textContent = yr + ' years'; $('#mortOut').innerHTML = `<small>Monthly payment</small><b>${px(pmt(loan, ir / 100, yr), true)}</b><span>Loan ${money(loan)}</span>`; }; ['dp', 'ir', 'yr'].forEach(id => $('#' + id).oninput = run); run(); }

function viewListing(l) {
  const p = l.project && projectById(l.project), sc = { ...sceneOf(l), id: l.project || l.ref }, off = l.status === 'off', tid = l.project || l.ref;
  track('home', tid, { n: p ? p.name : l.building, ref: l.ref });
  const f = fees(l.price, !off), info = [['Type', l.type], ['Purpose', 'For sale'], ['Reference', l.ref], ['Completion', off ? 'Off-plan' : 'Ready'], [off ? 'Handover' : 'Built', off ? p.ho : l.built], ['Furnishing', l.furnish], ['Ownership', l.ownership], ['View', l.view], ['Floor', l.floor], ['Parking', l.parking + ' space' + (l.parking > 1 ? 's' : '')], ['Service charge', `AED ${l.svc}/sqft a year (about ${money(l.svc * l.size)})`], ['Added on', new Date(l.added).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })], ...(off ? [] : [['Tenancy', l.tenancy]])];
  const sim = LISTINGS.filter(x => x.ref !== l.ref && (x.area === l.area || x.status === l.status) && Math.abs(x.price - l.price) / l.price < .6).slice(0, 4);
  view().innerHTML = `<section class="wrap lpage">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a><span>›</span><a href="#search" data-loc="${esc(l.area)}">${esc(l.area)}</a><span>›</span><span>${esc(l.building)}</span></nav>
    <div class="gal"><button class="g0" data-gm="photos"><img src="${imgFor(sc, 'ext')}" alt="Illustration of ${esc(l.building)}"></button><button class="g1" data-gm="photos"><img src="${imgFor(sc, 'dusk')}" alt=""></button><button class="g2" data-gm="photos"><img src="${imgFor(sc, 'int')}" alt=""></button>
      <div class="g-acts"><button class="btn btn-light sm" data-jump="model">${ICON.cube}3D model</button><button class="btn btn-light sm" data-jump="walk">${ICON.walk}Street walk</button><button class="btn btn-light sm" data-jump="video">${ICON.film}Demo film</button></div><span class="g-note">Illustrations</span></div>
    <div class="lgrid"><div class="lmain">
      <div class="lhead"><div class="lh-badges">${badges(l)}</div><div class="lh-price">${px(l.price)}<span class="lh-sub">AED ${l.ppsf.toLocaleString('en-US')} per sqft</span></div><h1>${esc(l.title)}</h1><p class="loc">${ICON.pin}${esc(l.sub)}, ${esc(l.area)}, Dubai</p>${specs(l)}
        <div class="lh-acts"><button class="btn btn-ghost sm" data-save="${l.ref}" aria-pressed="${isSaved(l.ref)}">${ICON.heart}Save</button><button class="btn btn-ghost sm" id="share">${ICON.share}Copy link</button><a class="btn btn-ghost sm" href="#saved">${ICON.scale}Compare</a></div></div>
      ${(() => { const va = vsArea(l); return va ? `<div class="insight"${int('DLD open data (live)')}><b>${Math.abs(va.pct).toFixed(1)}% ${va.pct <= 0 ? 'below' : 'above'}</b> the ${esc(l.area)} ${va.label} median of AED ${va.ref.toLocaleString('en-US')}/sqft (DLD, ${DLD.from.slice(0, 7)} to ${DLD.asOf.slice(0, 7)}).</div>` : ''; })()}
      <section class="lsec"><h2>Explore in 3D</h2><p class="muted">Turn the model, see the block plan, walk the street outside, or watch the film.</p>${explorerHTML()}</section>
      <section class="lsec"><h2>Property information</h2><dl class="info">${info.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>
      <section class="lsec"><h2>Validated information</h2><dl class="info"${int('Trakheesi permit, RERA and DLD title checks (demo numbers)')}><div><dt>Advertising permit</dt><dd>${esc(l.permit)}</dd></div>${off ? `<div><dt>RERA project number</dt><dd>${esc(l.rera)}</dd></div><div><dt>Escrow account</dt><dd>Project escrow, regulated bank (demo)</dd></div>` : `<div><dt>Title</dt><dd>Checked against DLD (demo)</dd></div><div><dt>Mortgage on unit</dt><dd>None registered (demo)</dd></div>`}<div><dt>ARKO check</dt><dd>${l.verified ? ICON.verified + ' Details and photos checked' : 'Not yet checked'}</dd></div></dl></section>
      ${off ? `<section class="lsec"><h2>Payment plan · ${p.plan}</h2><div class="pp">${payPlanHTML(p, l.price)}</div></section>
        <section class="lsec"><h2>About ${esc(p.name)}</h2><p>${esc(p.blurb)}</p><dl class="info mt"><div><dt>Developer</dt><dd>${esc(p.dev)}</dd></div><div><dt>Developer since</dt><dd>${p.dev_info ? p.dev_info.since : '–'}</dd></div><div><dt>Projects delivered</dt><dd>${p.dev_info ? p.dev_info.delivered : '–'}</dd></div><div><dt>Delivered on time</dt><dd>${p.dev_info ? p.dev_info.onTime + '%' : '–'}</dd></div><div><dt>Launched</dt><dd>${p.launch}</dd></div><div><dt>Homes</dt><dd>${p.units} · ${p.sold}% sold</dd></div></dl><a class="link" href="#pr-${p.id}">See all homes in ${esc(p.name)}</a></section>` : ''}
      <section class="lsec"><h2>Costs and returns</h2><div class="costs"><div class="card-s"><h4>Total cost to buy</h4><div class="ln"><span>Price</span>${px(l.price)}</div><div class="ln"><span>DLD fee (4%)</span>${px(f.dld)}</div><div class="ln"><span>Trustee fee + VAT</span>${px(f.trustee)}</div><div class="ln"><span>Admin fees</span>${px(f.admin)}</div><div class="ln"><span>Agency fee</span>${off ? '<b>Paid by developer</b>' : px(f.agency)}</div><div class="ln tot"><span>Total</span>${px(totalCost(l.price, !off))}</div><p class="mini">Indicative. Confirm before buying.</p></div>
        <div class="card-s"><h4>Mortgage calculator</h4>${mortgageHTML(l)}</div></div><div class="card-s mt"><h4>Return model</h4>${modelHTML(l)}</div></section>
      <section class="lsec"><h2>Location and nearby</h2><div class="locg"><div class="minimap" id="lmap"></div>${nearbyHTML(l)}</div></section>
      <section class="lsec"><h2>Market data</h2>${marketHTML(l, l.ppsf, l.status)}</section>
      <section class="lsec"><h2>Features and amenities</h2><ul class="amen">${[...l.features, ...(p ? p.amen : [])].map(a => `<li>${esc(a)}</li>`).join('')}</ul></section>
      ${sim.length ? `<section class="lsec"><h2>Similar homes</h2><div class="grid4">${sim.map(cardV).join('')}</div></section>` : ''}
    </div>
    <aside class="lside"><div class="scard"><div class="lh-price">${px(l.price)}</div><p class="muted">${off ? `Reserve with an EOI, then pay ${p.plan}` : 'Ready to transfer'}</p>
      ${off ? `<a class="btn btn-coral btn-lg wfull" href="#book-${l.ref}">Reserve this home</a><a class="btn btn-ghost wfull" href="#book-${l.ref}" data-mode="call">Book a video call</a>` : `<a class="btn btn-coral btn-lg wfull" href="#book-${l.ref}">Book a viewing</a><a class="btn btn-ghost wfull" href="#book-${l.ref}" data-mode="offer">Make an offer</a>`}
      <div class="agent"><span class="av lg">A</span><div><b>${SUPPORT.name}</b><small>ARKO property adviser</small></div></div>
      <div class="ag-acts"><a class="btn btn-primary" href="tel:${SUPPORT.phone}">${ICON.phone}Call</a><a class="btn btn-wa" href="${WA()}" target="_blank" rel="noopener">${ICON.chat}WhatsApp</a></div>
      <button class="link wfull" data-talk>Request a call back</button><p class="mini">Ref ${esc(l.ref)} · Permit ${esc(l.permit)}</p></div></aside></div></section>
  <div class="mbar"><a class="btn btn-ghost" href="tel:${SUPPORT.phone}" aria-label="Call">${ICON.phone}</a><a class="btn btn-wa" href="${WA()}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.chat}</a><a class="btn btn-coral grow" href="#book-${l.ref}">${off ? 'Reserve' : 'Book viewing'}</a></div>`;
  hydrate(); bindModel(l); bindMortgage(l); DubaiMap($('#lmap'), [l], { focus: l });
  const setM = startExplorer(sc, tid);
  view().onclick = e => {
    const j = e.target.closest('[data-jump],[data-gm]'); if (j) { $('#explorer').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); if (j.dataset.jump) setM(j.dataset.jump); }
    const s = e.target.closest('[data-save]'); if (s) { toggleSave(l.ref); }
    if (e.target.closest('[data-talk]')) openTalk(l);
    if (e.target.closest('#share')) { const u = location.href; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast('Link copied'), () => toast(u, 'info')); }
    const md = e.target.closest('[data-mode]'); if (md) S.bookMode = md.dataset.mode;
    const lc = e.target.closest('[data-loc]'); if (lc) { S.q.loc = lc.dataset.loc; S.q.status = 'all'; }
    const ma = e.target.closest('[data-marea]'); if (ma) S.mArea = ma.dataset.marea;
  };
}
function payPlanHTML(p, price) {
  const sch = schedule(p, price), f = fees(price), now = sch[0].amt + f.dld + f.trustee + f.admin;
  return `<div class="pp-bar">${sch.map(s => `<i style="flex:${s.pc}" class="${s.n === 'On handover' ? 'h' : s.n.startsWith('After') ? 'a' : ''}" title="${s.n} ${s.pc}%"></i>`).join('')}</div>
    <table class="sched"><thead><tr><th>Payment</th><th>When</th><th>%</th><th>Amount</th></tr></thead><tbody>${sch.map(s => `<tr class="${s.n === 'On handover' ? 'h' : ''}"><td>${s.n}</td><td>${s.m ? monthLabel(s.m) : 'On booking'}</td><td>${s.pc}%</td><td>${px(s.amt)}</td></tr>`).join('')}</tbody></table>
    <p class="ppnow"><b>Cash needed to start: ${px(now)}</b> (first payment plus DLD and trustee fees). The AED 40,000 EOI counts towards it.</p>`;
}
function viewProject(p) {
  track('home', p.id, { n: p.name });
  const units = LISTINGS.filter(l => l.project === p.id);
  view().innerHTML = `<section class="prhero"><img src="${imgFor(p, 'dusk')}" alt="Illustration of ${esc(p.name)}"><div class="wrap prh-in"><p class="eyebrow light">${esc(p.dev)} · ${esc(p.area)}</p><h1>${esc(p.name)}</h1><p>${esc(p.blurb)}</p><div class="prh-k"><div><small>From</small><b>${px(p.from)}</b></div><div><small>Handover</small><b>${p.ho}</b></div><div><small>Plan</small><b>${p.plan}</b></div><div><small>Sold</small><b>${p.sold}%</b></div></div></div></section>
  <section class="wrap lpage"><section class="lsec"><h2>Available homes</h2><div class="ulist">${units.map(l => `<a class="urow" href="#l-${l.ref}"><b>${bedTxt(l.beds)}</b><span>${l.size.toLocaleString('en-US')} sqft · floor ${l.floor} · ${esc(l.view)}</span><b>${px(l.price)}</b><span class="link">View</span></a>`).join('')}</div></section>
    <section class="lsec"><h2>Explore in 3D</h2>${explorerHTML()}</section>
    <section class="lsec"><h2>Payment plan · ${p.plan}</h2><div class="pp">${payPlanHTML(p, p.from)}</div></section>
    <section class="lsec"><h2>Location and nearby</h2><div class="locg"><div class="minimap" id="lmap"></div>${nearbyHTML(p)}</div></section>
    <section class="lsec"><h2>Market data</h2>${marketHTML(p, p.ppsf, 'off')}</section>
    <section class="lsec"><h2>Amenities</h2><ul class="amen">${p.amen.map(a => `<li>${esc(a)}</li>`).join('')}</ul></section></section>`;
  refreshPrices(view()); DubaiMap($('#lmap'), units.length ? units : [{ ...p, price: p.from, building: p.name, status: 'off', ref: p.id }], { focus: p }); startExplorer(p, p.id);
}
