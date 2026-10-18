/* ---------- home detail: 3D view, analysis, advice, deal ---------- */
const px = (aed, full) => `<span class="px" data-aed="${Math.round(aed)}"${full ? ' data-full="1"' : ''}>${money(aed, full)}</span>`;
const DEP = 40000;
let tw3d = null, spy = null, lookRaf = 0;

const DLD = (() => { try { const d = JSON.parse($('#dld').textContent); return d && d.areas ? d : null; } catch (e) { return null; } })();
const dldOf = it => DLD && DLD.areas[it.area];
const medOf = it => (dldOf(it) && dldOf(it).medPpsf) || it.med || Math.round(it.ppsf * (.95 + R(hash(it.id))() * .1));
const areaStats = it => { const r = R(hash(it.area)), d = dldOf(it), o = { g1: +(4 + r() * 7).toFixed(1), g3: Math.round(14 + r() * 20), yld: +(5.2 + r() * 2).toFixed(1), supply: ['Low', 'Balanced', 'Rising'][Math.floor(r() * 3)], demand: Math.round(70 + r() * 25) }; if (d) { if (d.g1 != null) o.g1 = d.g1; if (d.g3 != null) o.g3 = d.g3; o.real = true; o.n12 = d.n12; } return o; };
const priceOf = it => it.type === 'off' ? (S.unit ? S.unit.price : it.from) : it.price;
const sizeOf = it => it.type === 'off' ? (S.unit ? S.unit.size : it.types[0][1]) : it.size;
const feesOf = (it, price) => { const off = it.type === 'off'; return { dld: price * .04, trustee: 4000 * 1.05, admin: 580, agency: off ? 0 : price * .02 * 1.05 }; };
const FEES = price => ({ dld: price * .04, trustee: 4000 * 1.05, admin: 580 });

function openItem(id, srcImg) {
  const it = byId(id); if (!it) return;
  S.pid = id; S.unit = null; S.planKey = it.plan || null;
  if (srcImg && !RM) srcImg.style.viewTransitionName = 'hero';
  go('project', () => buildProject(it), () => { if (srcImg) srcImg.style.viewTransitionName = ''; });
}
function sparkPath(p) {
  const r = R(p.seed + 5), pts = []; let v = .74;
  for (let i = 0; i < 12; i++) { v += (r() - .36) * .05 + .022; pts.push(v); }
  const mx = Math.max(...pts), mn = Math.min(...pts);
  return pts.map((y, i) => `${i ? 'L' : 'M'}${(i / 11 * 300).toFixed(1)},${(70 - (y - mn) / (mx - mn) * 58).toFixed(1)}`).join('');
}
const bar = (label, val, max, txt, cls = '') => `<div class="hb ${cls}"><span>${label}</span><div><i style="--w:${(clamp(val / max, 0, 1) * 100).toFixed(1)}"></i></div><b>${txt}</b></div>`;

/* ----- return model ----- */
function model(it, price, o) {
  const off = it.type === 'off', size = sizeOf(it), f = feesOf(it, price), fees = f.dld + f.trustee + f.admin + f.agency;
  const rent0 = price * it.yld / 100, svc0 = (it.svc || 14) * size, start = off ? it.hm / 12 : 0, rate = .048;
  const loan = price * o.ltv, equity = price - loan + fees; let net = 0; const prof = [];
  for (let y = 1; y <= o.yrs; y++) {
    const act = clamp(y - start, 0, 1), rent = rent0 * Math.pow(1 + o.rg, Math.max(0, y - 1 - start)), svc = svc0 * Math.pow(1.03, y - 1);
    net += act * (rent - svc - loan * rate);
    prof.push(net + price * Math.pow(1 + o.g, y) * .98 - price - fees);
  }
  const profit = prof[prof.length - 1], roi = profit / equity;
  return { fees, equity, net, exit: price * Math.pow(1 + o.g, o.yrs), profit, roi, ann: roi > -1 ? Math.pow(1 + roi, 1 / o.yrs) - 1 : -1, prof, netYield: (rent0 - svc0) / price * 100, rent0, start };
}

/* ----- section builders ----- */
function headerHTML(it) {
  const off = it.type === 'off';
  const kp = off ? [['From', px(it.from)], ['Handover', it.ho], ['Est. yield', it.yld + '%'], ['Developer on time', it.ot + '%']] : [['Price', px(it.price)], ['Size', it.size + ' sqft'], ['Rent / yr', px(it.rent)], ['Yield', it.yld + '%']];
  const tags = off ? it.tags.map(t => `<span class="tag">${t}</span>`).join('') + `<span class="tag tag-ok">${ICON.shield} RERA ${it.rera}</span>` : `<span class="tag">${it.view} view</span><span class="tag">${it.tenant ? 'Tenanted' : 'Vacant'}</span><span class="tag tag-ok">${ICON.shield} Title checked</span>`;
  return `<header class="pj-head"><div class="pj-gal"><div class="pj-main"><img id="pjHero" alt="Illustrated render of ${it.name}"></div>
    ${off ? `<div class="pj-thumbs" role="tablist">${[['ext', 'Day'], ['dusk', 'Dusk'], ['int', 'Interior']].map(([v, l], i) => `<button role="tab" aria-selected="${i === 0}" data-v="${v}" data-cursor="Show"><img alt="" data-v="${v}"><span>${l}</span></button>`).join('')}</div>` : ''}
    <p class="note">Illustrated renders for this demo. A live version would show official images.</p></div>
  <div class="pj-title"><p class="eyebrow">${it.area} · ${off ? it.dev : it.unit}</p><h1 data-split>${it.name}</h1><p class="lead">${off ? it.blurb : `${it.beds ? it.beds + ' bedroom' : 'Studio'} ${it.view.toLowerCase()}-view home, built ${it.built}. Service charge AED ${it.svc} per sqft.`}</p>
  <div class="tags">${tags}</div><div class="kpis">${kp.map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join('')}</div>
  ${off ? `<div class="sold"><div class="sold-t"><span>${it.sold}% sold</span><span>${it.units} homes</span></div><div class="meter"><i style="--w:${it.sold}"></i></div></div>` : ''}</div></header>`;
}
function planSVG(beds) {
  const n = Math.max(beds, 0), rooms = [['Living and dining', 10, 10, 210, 150], ['Kitchen', 10, 160, 210, 70]];
  if (!n) rooms.push(['Sleeping area', 220, 10, 170, 130], ['Bath', 220, 140, 170, 90]);
  else { const h = 130 / n; for (let i = 0; i < n; i++) rooms.push([i ? 'Bedroom ' + (i + 1) : 'Main bedroom', 220, 10 + i * h, 170, h]); rooms.push(['Bath', 220, 140, 170, 90]); }
  return `<svg viewBox="0 0 400 240" role="img" aria-label="Schematic floor plan">${rooms.map(([l, x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle">${l}</text>`).join('')}</svg>`;
}
function viewHTML(it) {
  if (it.type === 'off') return `<section id="pjHome" class="sec"><h2 data-split>See your exact home in 3D</h2><p class="sub">Drag the tower to turn it. Tap a floor, then choose a unit.</p>
    <div class="pick"><div class="tw-box"><canvas id="tw" tabindex="0" aria-label="3D tower. Use arrow keys to change floor." data-cursor="Drag"></canvas><div class="tw-ctl"><button class="btn btn-ghost sm" id="fUp" aria-label="Floor up">▲</button><span id="fNo">Floor ${S.floor}</span><button class="btn btn-ghost sm" id="fDn" aria-label="Floor down">▼</button></div></div>
    <div class="units"><div class="units-h"><h3 id="uTitle"></h3><span class="legend"><i class="a"></i>Available <i class="h"></i>Held <i class="s"></i>Sold</span></div><div id="uList"></div><div class="u-prev" id="uPrev"></div></div></div></section>`;
  return `<section id="pjHome" class="sec"><h2 data-split>Look around before you visit</h2><p class="sub">Drag to look around, then compare with the floor plan.</p>
    <div class="pick"><div class="look" id="look" tabindex="0" data-cursor="Look around"><img id="lookImg" alt="Illustrated view"><div class="look-ui"><div class="seg" id="lookSeg"><button data-v="int" aria-selected="true">Inside</button><button data-v="ext" aria-selected="false">Outside</button><span class="thumb"></span></div><span class="look-h">Drag to look around</span></div></div>
    <div class="units"><h3>Floor plan</h3><div class="plan">${planSVG(it.beds)}</div><div class="ln"><span>Size</span><b>${it.size} sqft</b></div><div class="ln"><span>Bedrooms</span><b>${it.beds || 'Studio'}</b></div><div class="ln"><span>View</span><b>${it.view}</b></div><p class="mini">Schematic only. A live version would load the real plan.</p></div></div></section>`;
}
function analysisHTML(it) {
  const off = it.type === 'off', a = areaStats(it), med = medOf(it), vs = (it.ppsf / med - 1) * 100, max = Math.max(it.ppsf, med) * 1.1;
  return `<section id="pjAn" class="sec"><h2 data-split>The numbers behind the price</h2><p class="sub">Area returns, rental yield, total cost and a return model you can adjust. ${DLD ? 'Area growth and median price are from DLD open data to ' + DLD.asOf + ' where the area has enough sales; other figures are demo values.' : 'All figures are illustrative demo values.'} Not advice.</p>
  <div class="ins">
   <div class="card-s"><h4>Area returns · ${it.area}${a.real ? ' <span class="src">DLD data, ' + a.n12 + ' sales in 12 months</span>' : ' <span class="src demo">demo</span>'}</h4><div class="two-big"><div><div class="big">+${a.g1}%</div><small>price growth, last 12 months</small></div><div><div class="big">+${a.g3}%</div><small>last 3 years</small></div></div>
    ${bar('This home', it.ppsf, max, 'AED ' + it.ppsf.toLocaleString(), 'hi')}${bar('Area median', med, max, 'AED ' + med.toLocaleString())}<p class="mini">${Math.abs(vs).toFixed(1)}% ${vs > 0 ? 'above' : 'below'} the area median per sqft. Supply is ${a.supply.toLowerCase()}; rental demand ${a.demand}/100.</p>
    <svg viewBox="0 0 300 80" class="spark" role="img" aria-label="Price trend rising"><path d="${sparkPath(it)}" pathLength="1"/></svg></div>
   <div class="card-s"><h4>Rental yield</h4><div class="big" id="yNet"></div><small class="mini">net, after service charges</small>${bar('Gross yield', it.yld, 9, it.yld + '%', 'hi')}${bar('Area average', a.yld, 9, a.yld + '%')}<p class="mini">Estimated rent about ${px(it.type === 'off' ? it.from * it.yld / 100 : it.rent)} a year.${off ? ' Rent starts after handover, ' + it.ho + '.' : ''}</p></div>
   <div class="card-s"><h4>Total project cost</h4><div id="costBox"></div></div>
   <div class="card-s wide"><h4>Return model</h4><div class="mdl"><div class="mdl-in">
     <label>Hold for <b id="vYrs"></b><input type="range" id="mYrs" min="3" max="10" value="5"></label>
     <label>Price growth a year <b id="vG"></b><input type="range" id="mG" min="0" max="12" step="0.5" value="5"></label>
     <label>Rent growth a year <b id="vR"></b><input type="range" id="mR" min="0" max="8" step="0.5" value="3"></label>
     <label>Mortgage <b id="vL"></b><input type="range" id="mL" min="0" max="70" step="5" value="${off ? 0 : 50}"></label>
     <p class="mini">Mortgage at 4.8% interest-only for simplicity. Selling costs 2%.</p></div>
    <div class="mdl-out" id="mOut"></div></div></div>
  </div></section>`;
}
function adviceHTML() {
  return `<section id="pjAdv" class="sec"><h2 data-split>Want someone to talk it through?</h2><p class="sub">Optional. You can carry on by yourself at any point.</p>
  <div class="adv"><div class="card-s"><h4>I am comfortable on my own</h4><p class="mini">Everything you need is on this page. Go straight to the deal steps.</p><button class="btn btn-ghost" data-jump="pjDeal">See how the deal works ${ICON.arrow}</button></div>
  <div class="card-s hl"><h4>Talk to a specialist</h4><p class="mini">A licensed adviser walks you through price, payment and paperwork.</p><div class="row l"><button class="btn btn-primary" data-agent="call" data-magnetic>Call me</button><button class="btn btn-ghost" data-agent="meet">Meet in person</button></div><p class="adv-st" id="advSt"></p></div></div></section>`;
}
function dealHTML(it) {
  const off = it.type === 'off';
  const steps = off ? [['EOI', 'Reserve with AED 40,000 into escrow'], ['Deal closed', 'Sign the sale agreement'], ['Initial payment', '10% booking to escrow'], ['Charges', 'DLD 4% and trustee fee'], ['DLD registration', 'Oqood issued for your unit'], ['Instalments', 'Reminders and follow-ups'], ['Handover', 'Keys and title deed']]
    : [['Viewing', 'In person or on live video'], ['Bidding', 'Make an offer, hear back'], ['Deal closed', 'Agree the price'], ['Cash or loan', 'Loan: bank, documents, valuation, approvals'], ['Initial payment', '10% deposit'], ['Charges', 'DLD 4%, trustee, agency'], ['DLD registration', 'Title transferred'], ['Ownership', 'Title deed in your name']];
  return `<section id="pjDeal" class="sec"><h2 data-split>Your deal, step by step</h2><p class="sub">This is the full path from here to ${off ? 'handover' : 'owning the home'}. We show where you are at every step.</p>
  <ol class="path">${steps.map(([t, d], i) => `<li><b>${i + 1}</b><div><h4>${t}</h4><span>${d}</span></div></li>`).join('')}</ol>
  ${off ? `<h3 class="mt2">Choose a payment plan</h3><div class="seg" id="planSeg" role="tablist">${Object.keys(PLANS).map(k => `<button role="tab" aria-selected="${k === S.planKey}" data-v="${k}">${k}</button>`).join('')}<span class="thumb"></span></div><div class="pay"><div class="pay-l" id="payTbl"></div><div class="pay-r" id="payCost"></div></div>` : ''}
  <h3 class="mt2">How your money is protected</h3>
  <div class="flow">${off ? `<div class="fn"><b>You</b><span>Pay the EOI and instalments</span></div><i>${ICON.arrow}</i><div class="fn hl"><b>Project escrow account</b><span>Regulated bank, one account per project</span></div><i>${ICON.arrow}</i><div class="fn"><b>Developer</b><span>Paid as RERA-certified milestones are met</span></div>`
    : `<div class="fn"><b>You</b><span>Pay the deposit and balance</span></div><i>${ICON.arrow}</i><div class="fn hl"><b>DLD trustee office</b><span>Transfer is signed and paid here</span></div><i>${ICON.arrow}</i><div class="fn"><b>Seller</b><span>Paid when the title moves to you</span></div>`}</div>
  <ul class="checks"><li>${ICON.check}<div><b>${off ? 'RERA project registration' : 'Title checked'}</b><span>${off ? it.rera + ' (demo number)' : 'Ownership and any mortgage on the unit are verified first'}</span></div></li><li>${ICON.check}<div><b>Registered at DLD</b><span>${off ? 'Your purchase is recorded on the Oqood register through a trustee office' : 'The sale is recorded in your name at the DLD'}</span></div></li><li>${ICON.check}<div><b>Independent role</b><span>ARKO does not hold your money. Payments go to the account shown.</span></div></li></ul></section>`;
}

/* ----- build ----- */
function buildProject(it) {
  if (tw3d) { tw3d.destroy(); tw3d = null; } if (spy) spy.disconnect(); cancelAnimationFrame(lookRaf);
  const el = V.project, off = it.type === 'off';
  S.floor = off ? clamp(S.floor, 1, it.floors) : S.floor;
  el.innerHTML = `<div class="wrap pj"><button class="btn btn-ghost sm" id="pjBack">${ICON.back}<span>All homes</span></button>${headerHTML(it)}
   <nav class="subnav" id="subnav">${[['pjHome', '3D view'], ['pjAn', 'Analysis'], ['pjAdv', 'Advice'], ['pjDeal', 'Deal']].map(([id, l]) => `<a href="#${id}" data-to="${id}">${l}</a>`).join('')}</nav>
   ${viewHTML(it)}${analysisHTML(it)}${adviceHTML()}${dealHTML(it)}</div>
   <div class="cta" id="cta"><div class="cta-in"><div><small id="ctaK"></small><b id="ctaT"></b></div><button class="btn btn-primary" id="ctaGo" data-magnetic>${off ? 'Start EOI<span class="dp"> · AED 40,000</span>' : 'Book a viewing'} ${ICON.arrow}</button></div></div>`;
  const hero = $('#pjHero'); hero.src = imgFor(it, 'ext'); if (!RM) hero.style.viewTransitionName = 'hero';
  if (off) {
    $$('.pj-thumbs img').forEach(i => ensureImg(it, i.dataset.v).then(s => i.src = s));
    $('.pj-thumbs').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('.pj-thumbs button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
      ensureImg(it, b.dataset.v).then(s => { hero.classList.add('swap'); setTimeout(() => { hero.src = s; hero.classList.remove('swap'); }, 160); });
    });
  }
  $('#pjBack').onclick = () => go('home');
  reveal(el);
  $$('#subnav a').forEach(a => a.onclick = e => { e.preventDefault(); $('#' + a.dataset.to).scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); });
  el.onclick = e => {
    const j = e.target.closest('[data-jump]'); if (j) $('#' + j.dataset.jump).scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    const a = e.target.closest('[data-agent]'); if (a) openAgent(a.dataset.agent);
  };
  spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('#subnav a').forEach(a => a.classList.toggle('on', a.dataset.to === e.target.id)); }), { rootMargin: '-35% 0px -55% 0px' });
  $$('.sec', el).forEach(s => spy.observe(s));
  if (off) {
    tw3d = Tower3D($('#tw'), { floors: it.floors, twist: it.kind === 'tower' ? .035 : .015, mood: it.mood, sel: S.floor - 1, onPick: i => pickFloor(it, i + 1) });
    $('#fUp').onclick = () => { pickFloor(it, Math.min(it.floors, S.floor + 1)); tw3d.setSel(S.floor - 1); };
    $('#fDn').onclick = () => { pickFloor(it, Math.max(1, S.floor - 1)); tw3d.setSel(S.floor - 1); };
    $('#uList').onclick = e => { const b = e.target.closest('.u'); if (!b || b.disabled) return; pickUnit(it, +b.dataset.no); };
    initSeg($('#planSeg'), k => { S.planKey = k; renderPay(it); });
    pickFloor(it, S.floor);
    $('#ctaGo').onclick = () => openReserve();
  } else {
    initLook(it); renderCost(it); renderModel(it); setCTA(null);
    $('#ctaGo').onclick = () => openViewing();
  }
  ['mYrs', 'mG', 'mR', 'mL'].forEach(id => $('#' + id).oninput = () => renderModel(it));
  renderCost(it); renderModel(it); setAdvSt();
  refreshPrices(el);
}
function initLook(it) {
  const box = $('#look'), img = $('#lookImg'); let x = 0, vx = 0, drag = false, lx = 0, t = 0;
  const set = v => ensureImg(it, v).then(s => { img.src = s; });
  set('int');
  initSeg($('#lookSeg'), v => { box.classList.add('sw'); setTimeout(() => { set(v); box.classList.remove('sw'); }, 200); });
  const lim = () => Math.max(0, img.offsetWidth - box.clientWidth) / 2;
  box.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; box.setPointerCapture(e.pointerId); });
  box.addEventListener('pointermove', e => { if (!drag) return; const d = e.clientX - lx; lx = e.clientX; x += d; vx = d; });
  box.addEventListener('pointerup', () => drag = false);
  box.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') x += 40; if (e.key === 'ArrowRight') x -= 40; });
  (function loop() { lookRaf = requestAnimationFrame(loop); if (!drag) { x += vx; vx *= .93; if (!RM && Math.abs(vx) < .05) { t += .01; x += Math.sin(t) * .25; } } x = clamp(x, -lim(), lim()); img.style.transform = `translateX(${x}px)`; })();
}
function renderCost(it) {
  const price = priceOf(it), f = feesOf(it, price), tot = price + f.dld + f.trustee + f.admin + f.agency;
  $('#costBox').innerHTML = `<div class="big">${px(tot)}</div><small class="mini">price plus government and admin fees</small><div class="ln"><span>${S.unit || it.type === 'res' ? 'Price' : 'Price, smallest home'}</span>${px(price)}</div><div class="ln"><span>DLD fee (4%)</span>${px(f.dld)}</div><div class="ln"><span>Trustee fee + VAT</span>${px(f.trustee)}</div><div class="ln"><span>Admin fees</span>${px(f.admin)}</div>${f.agency ? `<div class="ln"><span>Agency fee (2% + VAT)</span>${px(f.agency)}</div>` : '<div class="ln"><span>Agency fee</span><b>Paid by developer</b></div>'}<p class="mini">Indicative. Confirm every fee before a real purchase.</p>`;
  const n = model(it, price, { yrs: 5, g: 0, rg: 0, ltv: 0 });
  $('#yNet').textContent = n.netYield.toFixed(1) + '%';
  refreshPrices($('#costBox'));
}
function renderModel(it) {
  const o = { yrs: +$('#mYrs').value, g: +$('#mG').value / 100, rg: +$('#mR').value / 100, ltv: +$('#mL').value / 100 };
  $('#vYrs').textContent = o.yrs + ' years'; $('#vG').textContent = (o.g * 100).toFixed(1) + '%'; $('#vR').textContent = (o.rg * 100).toFixed(1) + '%'; $('#vL').textContent = (o.ltv * 100).toFixed(0) + '% of price';
  const m = model(it, priceOf(it), o), mx = Math.max(...m.prof.map(Math.abs), 1);
  $('#mOut').innerHTML = `<div class="mo"><div><small>Cash you put in</small><b>${px(m.equity)}</b></div><div><small>Rent after costs</small><b>${px(m.net)}</b></div><div><small>Sale value</small><b>${px(m.exit)}</b></div><div class="${m.profit >= 0 ? 'pos' : 'neg'}"><small>Profit after selling</small><b>${px(m.profit)}</b></div></div>
   <div class="roi"><span class="big ${m.roi >= 0 ? 'pos' : 'neg'}">${(m.roi * 100).toFixed(0)}%</span><small>total return on your cash · about ${(m.ann * 100).toFixed(1)}% a year</small></div>
   <div class="bars" aria-label="Profit by year">${m.prof.map((v, i) => `<div class="${v >= 0 ? '' : 'n'}" style="--h:${(Math.abs(v) / mx * 100).toFixed(0)}"><i></i><span>Y${i + 1}</span></div>`).join('')}</div>${it.type === 'off' ? `<p class="mini">Rent and interest start after handover, ${it.ho}.</p>` : ''}`;
  refreshPrices($('#mOut'));
}
function pickFloor(p, f) {
  S.floor = f; S.unit = null; $('#fNo').textContent = 'Floor ' + f;
  const us = unitsFor(p, f); $('#uTitle').textContent = 'Floor ' + f + ' · ' + us.length + ' homes';
  $('#uList').innerHTML = us.map(u => `<button class="u ${u.st}" data-no="${u.no}" ${u.st !== 'avail' ? 'disabled' : ''}><b>${u.no}</b><span>${u.type} · ${u.size} sqft · ${u.view} view</span><em>${u.st === 'avail' ? px(u.price) : u.st === 'held' ? 'Held' : 'Sold'}</em></button>`).join('');
  refreshPrices($('#uList'));
  const a = us.find(u => u.st === 'avail');
  if (a) pickUnit(p, a.no); else { $('#uPrev').innerHTML = '<p class="mini">All homes on this floor are taken. Try another floor.</p>'; setCTA(null); }
}
function pickUnit(p, no) {
  const u = unitsFor(p, S.floor).find(x => x.no === no); S.unit = u;
  $$('#uList .u').forEach(b => b.classList.toggle('sel', +b.dataset.no === no));
  $('#uPrev').innerHTML = `<div class="up-img"><img alt="Illustrated interior" src="${imgFor(p, 'int')}"></div><div class="up-t"><b>${u.type} · ${u.size} sqft</b><span>Unit ${u.no}, ${u.view} view</span><span class="mini">Interior render is illustrative.</span></div>`;
  setCTA(u); if ($('#costBox')) { renderCost(p); renderModel(p); } if ($('#payTbl')) renderPay(p);
}
function setCTA(u) {
  const p = byId(S.pid); if (!$('#cta')) return;
  if (p.type === 'res') { $('#ctaGo').disabled = false; $('#ctaK').textContent = p.name; $('#ctaT').innerHTML = px(p.price); }
  else { $('#ctaGo').disabled = !u; $('#ctaK').textContent = u ? `${p.name} · unit ${u.no}` : 'Choose a home'; $('#ctaT').innerHTML = u ? px(u.price) : '–'; }
  refreshPrices($('#cta'));
}
function renderPay(p) {
  const price = S.unit ? S.unit.price : p.from, sch = schedule(p, S.planKey), f = FEES(price);
  $('#payTbl').innerHTML = `<h4>Instalments for ${px(price)}</h4><div class="pt">${sch.map(x => `<div class="pr ${x.n === 'On handover' ? 'h' : ''}"><span>${x.n}</span><em>${x.m ? monthLabel(x.m) : 'Today'}</em><i style="--w:${x.pc * 2.2}"></i><b>${x.pc}%</b><b>${px(price * x.pc / 100)}</b></div>`).join('')}</div>`;
  const now = price * .10 + f.dld + f.trustee + f.admin;
  $('#payCost').innerHTML = `<h4>Cash needed to start</h4><div class="big">${px(now)}</div><div class="ln"><span>Booking (10%)</span>${px(price * .1)}</div><div class="ln"><span>DLD fee (4%)</span>${px(f.dld)}</div><div class="ln"><span>Trustee fee + VAT</span>${px(f.trustee)}</div><div class="ln"><span>Admin fees</span>${px(f.admin)}</div><p class="mini">Your AED 40,000 EOI counts towards the booking. Indicative amounts.</p>`;
  refreshPrices($('#v-project'));
}

/* ----- specialist: call centre or meeting ----- */
function setAdvSt() {
  const s = $('#advSt'); if (!s) return;
  s.textContent = S.agent ? (S.agent.mode === 'call' ? 'Call requested: ' : 'Meeting booked: ') + S.agent.when : '';
}
function openAgent(mode) {
  const days = [...Array(5)].map((_, i) => new Date(Date.now() + (i + 1) * 864e5).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
  const chips = (id, arr, sel) => `<div class="chipset" id="${id}">${arr.map((x, i) => `<button class="chip" aria-pressed="${i === sel}" data-v="${x}">${x}</button>`).join('')}</div>`;
  if (!mode) { openModal(`<h2>Talk to a specialist</h2><p class="sub">Choose how you would like to speak.</p><div class="opts"><button class="opt" data-agent="call"><b>Call me</b><span>Our call centre rings you</span></button><button class="opt" data-agent="meet"><b>Meet in person</b><span>At the ARKO lounge</span></button></div>`); $('#modal').onclick = e => { const a = e.target.closest('[data-agent]'); if (a) openAgent(a.dataset.agent); }; return; }
  if (mode === 'call') openModal(`<h2>Connect me to the call centre</h2><p class="sub">A specialist will ring you. Demo only: no call is placed.</p><label class="fld">Mobile number<input id="agPhone" type="tel" placeholder="+971 50 000 0000" autocomplete="off"></label><p class="mini mt">When should we call?</p>${chips('agWhen', ['As soon as possible', 'This evening', 'Tomorrow morning'], 0)}<button class="btn btn-primary" id="agGo" disabled>Connect me</button>`);
  else openModal(`<h2>Meet a specialist</h2><p class="sub">ARKO lounge, Business Bay (demo address). About 45 minutes.</p><p class="mini">Day</p>${chips('agDay', days, 0)}<p class="mini mt">Time</p>${chips('agTime', ['10:00', '12:30', '16:00', '18:30'], 0)}<button class="btn btn-primary" id="agGo">Book meeting</button>`);
  const m = $('#modal'); m.onclick = e => {
    const c = e.target.closest('.chipset .chip'); if (c) { $$('.chip', c.parentNode).forEach(x => x.setAttribute('aria-pressed', String(x === c))); }
    const a = e.target.closest('[data-agent]'); if (a) openAgent(a.dataset.agent);
  };
  const ph = $('#agPhone'); if (ph) ph.oninput = () => { $('#agGo').disabled = ph.value.replace(/\D/g, '').length < 7; };
  const go = $('#agGo'); if (go) go.onclick = () => {
    const sel = id => ($('#' + id + ' .chip[aria-pressed=true]') || {}).dataset.v;
    const when = mode === 'call' ? sel('agWhen') : sel('agDay') + ' at ' + sel('agTime');
    const sheet = $('#modal .sheet');
    sheet.innerHTML = `<button class="x" data-close aria-label="Close">${ICON.x}</button><div class="conn"><span></span><span></span><span></span></div><h2>${mode === 'call' ? 'Connecting you…' : 'Booking…'}</h2>`;
    setTimeout(() => {
      S.agent = { mode, when }; setAdvSt();
      sheet.innerHTML = `<button class="x" data-close aria-label="Close">${ICON.x}</button><div class="okc">${ICON.check}</div><h2>${mode === 'call' ? 'Call requested' : 'Meeting booked'}</h2><p class="sub">${mode === 'call' ? 'A specialist will call you: ' + when + '.' : when + ', ARKO lounge, Business Bay.'} You can keep browsing. We will show this in your purchase tracker.</p><button class="btn btn-primary" data-close>Done</button>`;
      toast(mode === 'call' ? 'Call requested' : 'Meeting booked');
    }, RM ? 100 : 1600);
  };
}
