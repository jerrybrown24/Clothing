/* ---------- router and views ---------- */
let scene3 = null, miniScenes = [];
const view = () => $('#view');
const STEPS = [['start', 'Start'], ['list', 'Choose'], ['p', 'Explore'], ['compare', 'Compare'], ['book', 'Book'], ['track', 'Track']];
const px = (aed, full) => `<span class="px" data-aed="${Math.round(aed)}"${full ? ' data-full="1"' : ''}>${money(aed, full)}</span>`;
const refreshPrices = (root = document) => $$('.px', root).forEach(el => el.textContent = money(+el.dataset.aed, el.dataset.full === '1'));
const int = t => ` data-int="${esc(t)}"`;

function cleanup() { if (scene3) { scene3.destroy(); scene3 = null; } miniScenes.forEach(s => s.destroy()); miniScenes = []; }
function route() {
  cleanup();
  const h = location.hash.slice(1) || (S.answers ? 'list' : 'start'), [name, ...rest] = h.split('-'), arg = rest.join('-');
  const key = name === 'p' ? 'p' : name;
  document.body.dataset.view = key;
  $$('#steps li').forEach(li => { const i = STEPS.findIndex(s => s[0] === li.dataset.s), c = STEPS.findIndex(s => s[0] === key); li.className = i < c ? 'done' : i === c ? 'cur' : ''; });
  $$('.hd nav a').forEach(a => a.classList.toggle('on', a.dataset.k === key || (key === 'p' && a.dataset.k === 'list')));
  if (name === 'p' && byId(arg)) viewDetail(byId(arg));
  else if (name === 'book' && byId(arg)) viewBook(byId(arg));
  else if (name === 'compare') viewCompare();
  else if (name === 'track') viewTrack();
  else if (name === 'list') viewList();
  else viewStart();
  updateShortBar(); track('view', key);
  scrollTo(0, 0); view().focus({ preventScroll: true });
}
const go = h => { if (location.hash === '#' + h) route(); else location.hash = h; };

/* ----- 1. start: three questions ----- */
const QS = [
  { k: 'goal', q: 'What is the home for?', o: [['live', 'To live in', 'A home for me or my family'], ['invest', 'To invest', 'Rental income and growth']] },
  { k: 'bud', q: 'What budget feels comfortable?', o: [[1e6, 'Up to 1M'], [1.5e6, 'Up to 1.5M'], [2.5e6, 'Up to 2.5M'], [5e6, 'Up to 5M'], [0, 'Any budget']], money: true },
  { k: 'when', q: 'When do you want the keys?', o: [[2027, 'By end of 2027', 'Sooner, fewer options'], [2028, 'By end of 2028'], [2029, 'By end of 2029'], [2031, 'No rush', 'Best payment plans']] }
];
let qStep = 0, qAns = {};
function viewStart() {
  view().innerHTML = `<section class="start wrap">
    <div class="start-l"><p class="eyebrow">Off-plan homes in Dubai</p><h1>Find, explore and book your off-plan home in one place.</h1>
      <p class="lead">Answer three questions. We rank nine new projects for you, show each one in 3D and on the street, and walk you through booking.</p>
      <ul class="ticks"><li${int('DLD open data (live)')}>${ICON.check} Real DLD market data for every area</li><li>${ICON.check} Your money goes to the project escrow account</li><li>${ICON.check} Talk to ${SUPPORT.name} whenever you want</li></ul></div>
    <div class="qcard" id="qcard" aria-live="polite"></div></section>
    <section class="how wrap"><ol>${[['Choose', 'Answer three questions and shortlist what fits.'], ['Explore', 'Turn the model, walk the street, watch the film.'], ['Compare', 'Prices against DLD data, plans, distances, side by side.'], ['Book', 'Call us or reserve with an EOI. Track every step after.']].map(([t, d], i) => `<li><b>${i + 1}</b><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol></section>`;
  qStep = 0; qAns = {}; renderQ();
}
function renderQ() {
  const q = QS[qStep], box = $('#qcard');
  box.innerHTML = `<div class="q-top"><span>Question ${qStep + 1} of 3</span><span class="dots">${QS.map((_, i) => `<i class="${i < qStep ? 'done' : i === qStep ? 'cur' : ''}"></i>`).join('')}</span></div>
    <h2>${q.q}</h2><div class="opts ${q.o.length > 3 ? 'many' : ''}">${q.o.map(([v, l, d]) => `<button class="opt" data-v="${v}"><b>${q.money && v ? 'Up to ' + money(v) : l}</b>${d ? `<span>${d}</span>` : ''}</button>`).join('')}</div>
    <div class="q-foot">${qStep ? '<button class="link" id="qBack">Back</button>' : '<span></span>'}<a class="link" href="#list" id="qSkip">Skip and see all homes</a></div>`;
  box.onclick = e => {
    const b = e.target.closest('.opt');
    if (b) { qAns[q.k] = q.k === 'goal' ? b.dataset.v : +b.dataset.v; b.classList.add('sel');
      setTimeout(() => { if (qStep < 2) { qStep++; renderQ(); } else { S.answers = qAns; store.set('answers', qAns); track('start', `${qAns.goal} / ${qAns.bud || 'any'} / ${qAns.when}`); go('list'); } }, RM ? 0 : 180); }
    if (e.target.closest('#qBack')) { qStep--; renderQ(); }
  };
}

/* ----- 2. list ----- */
function sortedList() {
  const f = S.filters, a = S.answers;
  let l = LISTINGS.map(L => ({ L, m: match(L, a) }));
  if (f.area) l = l.filter(x => x.L.area === f.area);
  if (f.beds !== '') l = l.filter(x => x.L.types.some(t => f.beds === 3 ? t[2] >= 3 : t[2] === f.beds));
  const by = { match: (x, y) => (y.m ?? 0) - (x.m ?? 0) || x.L.from - y.L.from, price: (x, y) => x.L.from - y.L.from, handover: (x, y) => x.L.hm - y.L.hm, yield: (x, y) => y.L.yld - x.L.yld }[f.sort] || (() => 0);
  return l.sort(by);
}
function cardHTML({ L, m }) {
  const d = dldOf(L), metro = nearby(L).find(p => p.cat === 'metro'), on = S.short.includes(L.id);
  const vs = d && d.offMed ? (L.ppsf / d.offMed - 1) * 100 : null;
  return `<article class="card" data-id="${L.id}">
    <a class="card-img" href="#p-${L.id}" aria-label="Explore ${esc(L.name)}"><img alt="" loading="lazy" data-src="${L.id}"><span class="tag t-off">Off-plan · ${L.ho}</span>${m != null ? `<span class="ring" style="--p:${m}" title="How well it matches your answers"><b>${m}%</b><small>match</small></span>` : ''}</a>
    <button class="heart" aria-pressed="${on}" aria-label="${on ? 'Remove from' : 'Add to'} shortlist">${ICON.heart}</button>
    <div class="card-b"><h3><a href="#p-${L.id}">${esc(L.name)}</a></h3><p class="muted">${esc(L.area)} · ${esc(L.dev)}</p>
      <div class="price"><small>From</small> ${px(L.from)}</div>
      <ul class="facts"><li>${L.types.map(t => t[2] || 'Studio').join(', ').replace(/(\d)(?=,|$)/g, '$1')} bed</li><li>${L.plan} plan</li><li>${metro.t.min} min to metro</li></ul>
      ${vs != null ? `<p class="dld ${vs <= 0 ? 'good' : ''}"${int('DLD open data (live)')}>${vs <= 0 ? Math.abs(vs).toFixed(0) + '% below' : vs.toFixed(0) + '% above'} area off-plan median (DLD)</p>` : ''}
    </div></article>`;
}
function viewList() {
  const a = S.answers, f = S.filters, areas = [...new Set(LISTINGS.map(L => L.area))].sort();
  const sum = a ? `${a.goal === 'invest' ? 'Investing' : 'To live in'} · ${a.bud ? 'up to ' + money(a.bud) : 'any budget'} · keys by ${a.when > 2030 ? 'any time' : a.when}` : 'No preferences yet';
  view().innerHTML = `<section class="wrap list">
    <div class="list-h"><div><h1>${a ? 'Your best matches' : 'All off-plan homes'}</h1><p class="muted">${sum} · <a href="#start" class="link">${a ? 'Change answers' : 'Answer 3 questions'}</a></p></div></div>
    <div class="filters" role="group" aria-label="Filters">
      <label>Area<select id="fArea"><option value="">All areas</option>${areas.map(x => `<option ${f.area === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <div class="chips" role="group" aria-label="Bedrooms">${[['', 'Any'], [0, 'Studio'], [1, '1 bed'], [2, '2 bed'], [3, '3+ bed']].map(([v, l]) => `<button class="chip" data-beds="${v}" aria-pressed="${String(f.beds) === String(v)}">${l}</button>`).join('')}</div>
      <label>Sort<select id="fSort">${[['match', 'Best match'], ['price', 'Lowest price'], ['handover', 'Earliest handover'], ['yield', 'Highest yield']].map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    </div>
    <div class="grid" id="grid"${int('Developer or broker listings feed (demo data)')}></div></section>`;
  const draw = () => { const l = sortedList(); $('#grid').innerHTML = l.length ? l.map(cardHTML).join('') : '<p class="empty">No homes match these filters. <button class="link" id="clr">Clear filters</button></p>'; $$('#grid img[data-src]').forEach(i => { i.src = imgFor(byId(i.dataset.src)); }); };
  draw();
  $('#fArea').onchange = e => { f.area = e.target.value; draw(); };
  $('#fSort').onchange = e => { f.sort = e.target.value; draw(); };
  view().onclick = e => {
    const c = e.target.closest('[data-beds]'); if (c) { f.beds = c.dataset.beds === '' ? '' : +c.dataset.beds; $$('[data-beds]').forEach(x => x.setAttribute('aria-pressed', String(x === c))); draw(); }
    const h = e.target.closest('.heart'); if (h) toggleShort(h.closest('.card').dataset.id, h);
    if (e.target.closest('#clr')) { f.area = ''; f.beds = ''; viewList(); }
  };
}
function toggleShort(id, btn) {
  const on = !S.short.includes(id);
  if (on && S.short.length >= 4) { toast('You can compare up to 4 homes. Remove one first.', 'info'); return; }
  S.short = on ? [...S.short, id] : S.short.filter(x => x !== id); store.set('short', S.short);
  if (btn) { btn.setAttribute('aria-pressed', String(on)); btn.setAttribute('aria-label', (on ? 'Remove from' : 'Add to') + ' shortlist'); }
  $$('.js-short').forEach(b => { b.setAttribute('aria-pressed', String(S.short.includes(b.dataset.id))); b.lastChild.textContent = S.short.includes(b.dataset.id) ? ' Shortlisted' : ' Shortlist'; });
  track('shortlist', id, { on, n: byId(id).name }); toast(on ? 'Added to your shortlist' : 'Removed from your shortlist'); updateShortBar();
}
function updateShortBar() {
  const n = S.short.length, bar = $('#shortbar'), v = document.body.dataset.view;
  $('#shortCount').textContent = n; $('#shortCount').hidden = !n;
  bar.hidden = !n || v === 'compare' || v === 'book' || v === 'track' || v === 'start';
  bar.innerHTML = `<div class="sb-in"><div class="sb-th">${S.short.map(id => `<img src="${imgFor(byId(id))}" alt="${esc(byId(id).name)}">`).join('')}</div><span>${n} shortlisted</span><a class="btn btn-primary" href="#compare">${n > 1 ? 'Compare ' + n + ' homes' : 'Add one more to compare'}</a></div>`;
  $('a', bar).classList.toggle('disabled', n < 2);
}

/* ----- 3. detail ----- */
const MODES = [['model', '3D model', 'cube'], ['plan', 'Block plan', 'grid'], ['walk', 'Street walk', 'walk'], ['video', 'Demo film', 'film'], ['photos', 'Gallery', 'img']];
function viewDetail(L) {
  track('home', L.id, { n: L.name });
  const d = dldOf(L), n = nearby(L), on = S.short.includes(L.id);
  S.pick[L.id] = S.pick[L.id] || { t: 0 };
  view().innerHTML = `<section class="wrap detail">
    <a class="back" href="#list">${ICON.back} All homes</a>
    <div class="d-top">
      <div class="viewer">
        <div class="vtabs" role="tablist">${MODES.map(([k, l, ic], i) => `<button role="tab" data-m="${k}" aria-selected="${i === 0}">${ICON[ic]}<span>${l}</span></button>`).join('')}</div>
        <div class="stage" id="stage"${int('Developer 3D / BIM model (procedural in prototype)')}><div id="s3host" class="s3host"></div><div id="overlay" class="overlay"></div></div>
      </div>
      <aside class="d-side">
        <p class="eyebrow">${esc(L.area)} · ${esc(L.dev)}</p><h1>${esc(L.name)}</h1><p class="muted">${esc(L.blurb)}</p>
        <div class="d-price"><small>From</small>${px(L.from)}<span class="muted">${L.types[0][0]}, ${L.types[0][1]} sqft</span></div>
        <dl class="kv"><div><dt>Handover</dt><dd>${L.ho}</dd></div><div><dt>Payment plan</dt><dd>${L.plan}</dd></div><div><dt>Homes</dt><dd>${L.units}</dd></div><div><dt>Sold</dt><dd>${L.sold}%</dd></div></dl>
        <h3>Why this home</h3><ul class="why">${whyThis(L).map(w => `<li>${ICON.check}<span>${esc(w)}</span></li>`).join('')}</ul>
        <div class="d-acts"><a class="btn btn-primary btn-lg" href="#book-${L.id}">Book this home ${ICON.arrow}</a><button class="btn btn-ghost js-short" data-id="${L.id}" aria-pressed="${on}">${ICON.heart}<span> ${on ? 'Shortlisted' : 'Shortlist'}</span></button></div>
        <button class="link talk-link" data-talk>${ICON.phone} Questions? Talk to ${SUPPORT.name}</button>
      </aside>
    </div>

    <section class="block"><h2>What's around</h2><p class="muted">Straight-line distance and an estimated travel time from the project.</p>
      <div class="near"${int('Maps and places API (approximate coordinates in prototype)')}><svg class="radar" viewBox="0 0 300 300" role="img" aria-label="Map of nearby places">${radar(L, n)}</svg>
      <ul class="places">${n.map(p => `<li><span class="pi" style="--c:${CATCOL[p.cat]}">${ICON[CAT[p.cat][1]]}</span><div><small>${CAT[p.cat][0]}</small><b>${esc(p.name)}</b></div><div class="pd"><b>${p.t.min} min</b><small>${p.t.mode} · ${p.d.toFixed(1)} km</small></div></li>`).join('')}</ul></div></section>

    <section class="block"><h2>Market data</h2><p class="muted">${d ? `From DLD open data: ${d.n.toLocaleString('en-US')} flat sales in ${esc(L.area)} between ${DLD.from.slice(0, 7)} and ${DLD.asOf.slice(0, 7)}.` : 'Area figures load from DLD data on the live site.'}</p>
      <div class="mkt"${int('DLD open data (live)')}>${marketHTML(L, d)}</div></section>

    <section class="block" id="units"><h2>Choose your home</h2><p class="muted">Pick a type to see the price, payment plan and cash you need now.</p><div id="unitBox"${int('Developer price list and inventory (demo)')}></div></section>

    <section class="block"><h2>Amenities</h2><ul class="amen">${L.amen.map(a => `<li>${esc(a)}</li>`).join('')}</ul></section>
  </section>
  <div class="mbar"><div><small>From</small>${px(L.from)}</div><a class="btn btn-primary" href="#book-${L.id}">Book</a></div>`;
  renderUnits(L);
  view().onclick = e => {
    const t = e.target.closest('.vtabs button'); if (t) setMode(L, t.dataset.m);
    const s = e.target.closest('.js-short'); if (s) toggleShort(L.id);
    if (e.target.closest('[data-talk]')) openTalk(L);
  };
  setMode(L, 'model');
}
function radar(L, n) {
  const c = 150, rr = d => clamp(26 + d * 16, 30, 132);
  let s = [60, 100, 132].map(r => `<circle cx="${c}" cy="${c}" r="${r}" class="rg"/>`).join('') + `<text x="${c}" y="14" class="rn">N</text>`;
  n.forEach(p => { const r = rr(p.d), x = c + Math.sin(p.b) * r, y = c - Math.cos(p.b) * r; s += `<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="rl"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${CATCOL[p.cat]}"><title>${esc(p.name)}: ${p.d.toFixed(1)} km</title></circle>`; });
  return s + `<circle cx="${c}" cy="${c}" r="10" class="rc"/><text x="${c}" y="${c + 28}" class="rt">${esc(L.name)}</text>`;
}
function marketHTML(L, d) {
  const city = DLD && DLD.city;
  if (!d) return '<p class="muted">No DLD figures for this area yet.</p>';
  const max = Math.max(L.ppsf, d.offMed || 0, d.readyMed || 0) * 1.1, bar = (l, v, cls) => `<div class="hb ${cls || ''}"><span>${l}</span><div><i style="width:${(v / max * 100).toFixed(1)}%"></i></div><b>AED ${Math.round(v).toLocaleString('en-US')}</b></div>`;
  let hist = '';
  if (city && city.series) {
    const sr = city.series, W = 320, H = 120, mn = Math.min(...sr.map(x => x.avg)) * .95, mx = Math.max(...sr.map(x => x.avg)) * 1.03, X = i => 10 + i / (sr.length - 1) * (W - 20), Y = v => H - 18 - (v - mn) / (mx - mn) * (H - 34);
    hist = `<div class="card-s"><h4>Dubai flat prices since ${sr[0].year}</h4><svg viewBox="0 0 ${W} ${H}" class="line" role="img" aria-label="Dubai-wide flat price index by year"><path d="${sr.map((x, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(x.avg).toFixed(1)).join('')}"/>${sr.map((x, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(x.avg).toFixed(1)}" r="${i === sr.length - 1 ? 4 : 2.4}"><title>${x.year}: AED ${x.avg.toLocaleString('en-US')}</title></circle>`).join('')}<text x="10" y="${H - 2}">${sr[0].year}</text><text x="${W - 10}" y="${H - 2}" text-anchor="end">${sr[sr.length - 1].year}</text></svg>
      <p class="mini">DLD flat price index, yearly average. Up ${city.flat12m}% in the 12 months to ${city.asOf} and ${city.flat3y}% over 3 years. The index file ends in ${city.asOf}.</p></div>`;
  }
  const vs = d.offMed ? (L.ppsf / d.offMed - 1) * 100 : 0;
  return `<div class="card-s"><h4>Price per sqft</h4>${bar('This home', L.ppsf, 'hi')}${d.offMed ? bar('Area off-plan median', d.offMed) : ''}${d.readyMed ? bar('Area ready median', d.readyMed, 'lo') : ''}
    <p class="mini">This home is ${Math.abs(vs).toFixed(1)}% ${vs <= 0 ? 'below' : 'above'} the median for off-plan flats sold in ${esc(L.area)} this year.</p></div>
    <div class="card-s"><h4>Area activity</h4><div class="two"><div><b class="big">${d.n.toLocaleString('en-US')}</b><small>flat sales, ${DLD.from.slice(0, 7)} to ${DLD.asOf.slice(0, 7)}</small></div><div><b class="big">${d.offShare}%</b><small>of them off-plan</small></div></div>
    <p class="mini">Estimated gross rental yield for this project: ${L.yld}% (demo estimate, not DLD).</p></div>${hist}`;
}
function setMode(L, m) {
  $$('.vtabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.m === m)));
  const host = $('#s3host'), ov = $('#overlay');
  track('view3d', L.id, { mode: m });
  if (m === 'photos') {
    if (scene3) { scene3.destroy(); scene3 = null; }
    host.innerHTML = `<div class="gallery">${[['ext', 'Day'], ['dusk', 'Dusk'], ['int', 'Interior']].map(([v, l]) => `<figure><img src="${imgFor(L, v)}" alt="${l} illustration of ${esc(L.name)}"><figcaption>${l}</figcaption></figure>`).join('')}</div>`;
    ov.innerHTML = '<p class="hint">Illustrations. The live site would show the developer\'s official renders and photos.</p>'; return;
  }
  if (!scene3 || !host.querySelector('canvas')) { host.innerHTML = ''; scene3 = Scene3D(host, L, { onPick: p => { const c = $('#pickInfo'); if (c) c.innerHTML = `<b>${esc(p.block)}</b> · floor ${p.floor}. <a href="#units" class="link">See prices</a>`; }, onCaption: (txt, f) => { const c = $('#cap'); if (c) { if (c.textContent !== txt) c.textContent = txt; $('#prog').style.width = (f * 100) + '%'; } }, onWalk: items => walkHud(items), onDrop: () => walkUI(L, true) }); }
  scene3.setMode(m);
  if (m === 'model') ov.innerHTML = `<p class="hint">Drag to turn · scroll or pinch to zoom · tap a floor</p><p class="pick" id="pickInfo">Tap a floor to see where it is.</p>`;
  if (m === 'plan') ov.innerHTML = `<p class="hint">Top view of the plot. Tap a block.</p><div class="blocks">${planBlocks(L)}</div><p class="pick" id="pickInfo"></p>`;
  if (m === 'walk') walkUI(L, false);
  if (m === 'video') { track('video', L.id); ov.innerHTML = `<div class="film"><p id="cap" class="cap">${esc(L.name)}</p><div class="fbar"><button class="fbtn" id="fPlay" aria-label="Pause">${ICON.pause}</button><div class="ftrack"><i id="prog"></i></div></div></div>`; $('#fPlay').onclick = e => { const p = scene3.playing(); p ? scene3.pause() : scene3.play(); e.currentTarget.innerHTML = p ? ICON.play : ICON.pause; e.currentTarget.setAttribute('aria-label', p ? 'Play' : 'Pause'); }; }
}
function planBlocks(L) {
  const r = R(L.seed + 9);
  const names = L.kind === 'tower' ? ['Tower'] : L.kind === 'twin' ? ['Tower A', 'Tower B'] : [...Array(L.blocks)].map((_, i) => 'Block ' + String.fromCharCode(65 + i));
  return names.map(n => { const av = Math.round(L.units / names.length * (100 - L.sold) / 100 * (.7 + r() * .6)); return `<div><b>${n}</b><span>${av} homes available</span></div>`; }).join('');
}
function walkUI(L, dropped) {
  const ov = $('#overlay');
  if (!dropped) { ov.innerHTML = `<div class="drop"><p><b>Drop in and look around.</b> Tap any street on the map, or start at:</p><div class="row">${[['entrance', 'Main entrance'], ['pool', 'Pool deck'], ['boulevard', 'Boulevard']].map(([k, l]) => `<button class="btn btn-ghost sm" data-drop="${k}">${l}</button>`).join('')}</div></div>`;
    ov.onclick = e => { const b = e.target.closest('[data-drop]'); if (b) { scene3.dropAt(b.dataset.drop); track('walk', L.id, { at: b.dataset.drop }); } }; return; }
  ov.onclick = null;
  ov.innerHTML = `<div class="hud" id="hud"></div><div class="pad" aria-label="Walk controls"><button data-w="f" aria-label="Walk forward">▲</button><button data-w="tl" aria-label="Turn left">⟲</button><button data-w="b" aria-label="Walk back">▼</button><button data-w="tr" aria-label="Turn right">⟳</button></div><button class="btn btn-ghost sm exit" id="wExit">Exit walk</button><p class="hint">Drag to look around · arrow keys or buttons to walk</p>`;
  let hold = null;
  const act = k => { if (k === 'tl') scene3.turn(.18); else if (k === 'tr') scene3.turn(-.18); else scene3.move(k, 2.2); };
  $$('.pad button', ov).forEach(b => { b.onpointerdown = e => { e.preventDefault(); act(b.dataset.w); clearInterval(hold); hold = setInterval(() => act(b.dataset.w), 90); }; b.onpointerup = b.onpointerleave = () => clearInterval(hold); });
  $('#wExit').onclick = () => { scene3.exitWalk(); walkUI(L, false); };
  $('#s3host canvas').focus();
}
function walkHud(items) {
  const h = $('#hud'); if (!h) return;
  h.innerHTML = items.sort((a, b) => a.d - b.d).slice(0, 4).map(i => `<div><span class="arr" style="transform:rotate(${(-i.turn).toFixed(0)}deg)">↑</span><b>${esc(i.name)}</b><small>${i.d.toFixed(1)} km · ${i.t.min} min</small></div>`).join('');
}
function renderUnits(L) {
  const pk = S.pick[L.id], t = pk.t, price = unitPrice(L, t), sch = schedule(L, price), f = fees(price), now = sch[0].amt + f.dld + f.trustee + f.admin;
  $('#unitBox').innerHTML = `<div class="seg" role="tablist">${L.types.map((x, i) => `<button role="tab" data-t="${i}" aria-selected="${i === t}">${x[0]}</button>`).join('')}</div>
   <div class="units"><div class="card-s"><div class="u-sum"><div><small>Price</small><b class="big">${px(price)}</b></div><div><small>Size</small><b>${L.types[t][1]} sqft</b></div><div><small>Cash needed now</small><b>${px(now)}</b></div></div>
     <table class="sched"><thead><tr><th>Payment</th><th>When</th><th>%</th><th>Amount</th></tr></thead><tbody>${sch.map(s => `<tr class="${s.n === 'On handover' ? 'h' : ''}"><td>${s.n}</td><td>${s.m ? monthLabel(s.m) : 'Today'}</td><td>${s.pc}%</td><td>${px(s.amt)}</td></tr>`).join('')}</tbody></table></div>
     <div class="card-s"><h4>Total cost</h4><div class="ln"><span>Price</span>${px(price)}</div><div class="ln"><span>DLD fee (4%)</span>${px(f.dld)}</div><div class="ln"><span>Trustee fee + VAT</span>${px(f.trustee)}</div><div class="ln"><span>Admin fees</span>${px(f.admin)}</div><div class="ln tot"><span>Total</span>${px(price + f.dld + f.trustee + f.admin)}</div>
     <p class="mini">Fees are indicative. Agency fee is paid by the developer.</p><a class="btn btn-primary" href="#book-${L.id}">Book this ${esc(L.types[t][0].toLowerCase())} ${ICON.arrow}</a></div></div>`;
  $('#unitBox .seg').onclick = e => { const b = e.target.closest('button'); if (!b) return; pk.t = +b.dataset.t; track('unit', L.id, { t: L.types[pk.t][0] }); renderUnits(L); };
}

/* ----- 4. compare ----- */
function viewCompare() {
  const ls = S.short.map(byId).filter(Boolean);
  if (ls.length < 2) { view().innerHTML = `<section class="wrap empty-state"><h1>Compare homes</h1><p class="lead">Shortlist at least two homes with the heart button, then compare them here.</p><a class="btn btn-primary" href="#list">See homes</a></section>`; return; }
  track('compare', ls.map(L => L.id).join(','));
  const rows = [], N = ls.map(nearby), D = ls.map(dldOf);
  const R_ = (label, vals, best, fmt = v => v) => rows.push({ label, vals, best, fmt });
  const cash = ls.map(L => { const p = unitPrice(L, 0), s = schedule(L, p), f = fees(p); return s[0].amt + f.dld + f.trustee + f.admin; });
  R_('Price from', ls.map(L => L.from), 'min', v => px(v));
  R_('Price per sqft', ls.map(L => L.ppsf), 'min', v => 'AED ' + v.toLocaleString('en-US'));
  R_('Against area off-plan median (DLD)', ls.map((L, i) => D[i] && D[i].offMed ? (L.ppsf / D[i].offMed - 1) * 100 : null), 'min', v => v == null ? '–' : (v > 0 ? '+' : '') + v.toFixed(1) + '%');
  R_('Cash needed now', cash, 'min', v => px(v));
  R_('Payment plan', ls.map(L => L.plan), null);
  R_('Handover', ls.map(L => L.hm), 'min', (v, i) => ls[i].ho);
  ['metro', 'mall', 'beach', 'school', 'hospital', 'air'].forEach(c => R_(CAT[c][0], N.map(n => (n.find(p => p.cat === c) || {}).t?.min ?? null), 'min', (v, i) => { const p = N[i].find(x => x.cat === c); return p ? `${p.t.min} min <small>${esc(p.name)}</small>` : '–'; }));
  R_('Area sales this year (DLD)', D.map(d => d ? d.n : null), 'max', v => v == null ? '–' : v.toLocaleString('en-US'));
  R_('Off-plan share of area sales (DLD)', D.map(d => d ? d.offShare : null), null, v => v == null ? '–' : v + '%');
  R_('Estimated gross yield', ls.map(L => L.yld), 'max', v => v + '%');
  const bestIdx = r => { if (!r.best) return -1; const v = r.vals.map(x => x == null ? null : x), ok = v.filter(x => x != null); if (ok.length < 2) return -1; const b = r.best === 'min' ? Math.min(...ok) : Math.max(...ok); return v.indexOf(b); };
  view().innerHTML = `<section class="wrap compare"><a class="back" href="#list">${ICON.back} All homes</a><h1>Compare your shortlist</h1><p class="muted">Highlighted cells lead on that row. Models are shown at the same scale.</p>
   <div class="ctable" style="--n:${ls.length}"><div class="cgrid">
    <div class="ch"></div>${ls.map(L => `<div class="ch"><div class="mini3d" data-id="${L.id}"></div><b>${esc(L.name)}</b><small>${esc(L.area)}</small><button class="link rm" data-rm="${L.id}">Remove</button></div>`).join('')}
    ${rows.map(r => { const bi = bestIdx(r); return `<div class="cl">${r.label}</div>${r.vals.map((v, i) => `<div class="cv ${i === bi ? 'best' : ''}">${r.fmt(v, i)}</div>`).join('')}`; }).join('')}
    <div class="cl"></div>${ls.map(L => `<div class="cv"><a class="btn btn-primary sm" href="#book-${L.id}">Book</a> <a class="link" href="#p-${L.id}">Explore</a></div>`).join('')}
   </div></div></section>`;
  const maxH = Math.max(...ls.map(L => buildHeight(L)));
  $$('.mini3d').forEach(h => miniScenes.push(Scene3D(h, byId(h.dataset.id), { mini: true, scaleH: maxH })));
  view().onclick = e => { const b = e.target.closest('[data-rm]'); if (b) { toggleShort(b.dataset.rm); viewCompare(); } };
}
const buildHeight = L => L.kind === 'tower' ? FH * (L.floors + 6) : L.kind === 'twin' ? FH * (L.floors + 6) : FH * (L.floors + 1);
