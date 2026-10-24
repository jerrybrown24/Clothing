/* ---------- router, home, search, projects, market, saved, compare, start ---------- */
let scene3 = null, miniScenes = [], mapInst = null;
const view = () => $('#view');
const px = (aed, full) => `<span class="px" data-aed="${Math.round(aed)}"${full ? ' data-full="1"' : ''}>${money(aed, full)}</span>`;
const refreshPrices = (root = document) => $$('.px', root).forEach(el => el.textContent = money(+el.dataset.aed, el.dataset.full === '1'));
const int = t => ` data-int="${esc(t)}"`;
const bedTxt = b => b ? b + ' bed' : 'Studio';
const isSaved = ref => S.short.includes(ref);
function cleanup() { if (scene3) { scene3.destroy(); scene3 = null; } miniScenes.forEach(s => s.destroy()); miniScenes = []; mapInst = null; }
function route() {
  cleanup();
  const h = location.hash.slice(1) || 'home', i = h.indexOf('-'), name = i > 0 ? h.slice(0, i) : h, arg = i > 0 ? h.slice(i + 1) : '';
  document.body.dataset.view = name;
  const lst = name === 'l' && listingByRef(arg); $$('.hd nav a').forEach(a => a.classList.toggle('on', a.dataset.k === 'search' ? (name === 'search' && S.q.status === a.dataset.s) || (lst && lst.status === a.dataset.s) : a.dataset.k === name || (name === 'pr' && a.dataset.k === 'projects')));
  ({ home: viewHome, search: viewSearch, l: () => listingByRef(arg) ? viewListing(listingByRef(arg)) : viewHome(), pr: () => projectById(arg) ? viewProject(projectById(arg)) : viewProjects(), projects: viewProjects, market: viewMarket, saved: viewSaved, compare: viewCompare, start: viewStart, book: () => listingByRef(arg) ? viewBook(listingByRef(arg)) : viewHome(), track: viewTrack }[name] || viewHome)(arg);
  $('#savedCount').textContent = S.short.length; $('#savedCount').hidden = !S.short.length;
  track('view', name); scrollTo(0, 0); view().focus({ preventScroll: true });
}
const go = h => { if (location.hash === '#' + h) route(); else location.hash = h; };

/* ----- cards ----- */
function badges(l) {
  const p = l.project && projectById(l.project);
  return `<span class="tag ${l.status === 'off' ? 't-off' : 't-rd'}">${l.status === 'off' ? 'Off-plan · ' + p.ho : 'Ready'}</span>${l.verified ? `<span class="tag t-ver">${ICON.verified} Checked</span>` : ''}`;
}
function specs(l) { return `<ul class="specs"><li>${ICON.bed}${bedTxt(l.beds)}</li><li>${ICON.bath}${l.baths} bath</li><li>${ICON.size}${l.size.toLocaleString('en-US')} sqft</li></ul>`; }
function cardV(l) {
  return `<article class="lcard v" data-ref="${l.ref}"><a class="lc-img" href="#l-${l.ref}" aria-label="${esc(l.title)}"><img alt="" loading="lazy" data-scene="${l.ref}">${badges(l)}</a>
    <button class="heart" data-save="${l.ref}" aria-pressed="${isSaved(l.ref)}" aria-label="Save">${ICON.heart}</button>
    <div class="lc-b"><div class="lc-price">${px(l.price)}<small>AED ${l.ppsf.toLocaleString('en-US')}/sqft</small></div><h3><a href="#l-${l.ref}">${esc(l.title)}</a></h3><p class="loc">${ICON.pin}${esc(l.sub)}, ${esc(l.area)}</p>${specs(l)}</div></article>`;
}
function cardH(l, m) {
  const p = l.project && projectById(l.project), va = vsArea(l), metro = nearby(l).find(x => x.cat === 'metro');
  return `<article class="lcard h" data-ref="${l.ref}"><a class="lc-img" href="#l-${l.ref}" aria-label="${esc(l.title)}"><img alt="" loading="lazy" data-scene="${l.ref}">${badges(l)}${m != null ? `<span class="ring"><b>${m}%</b> match</span>` : ''}</a>
    <div class="lc-b"><button class="heart" data-save="${l.ref}" aria-pressed="${isSaved(l.ref)}" aria-label="Save">${ICON.heart}</button>
      <div class="lc-price">${px(l.price)}<small>AED ${l.ppsf.toLocaleString('en-US')}/sqft</small></div>
      <h3><a href="#l-${l.ref}">${esc(l.title)}</a></h3><p class="loc">${ICON.pin}${esc(l.sub)}, ${esc(l.area)}</p>${specs(l)}
      <ul class="facts">${p ? `<li>${p.plan} plan</li><li>Handover ${p.ho}</li>` : `<li>${esc(l.tenancy)}</li><li>Built ${l.built}</li>`}<li>${metro.t.min} min to metro</li></ul>
      ${va ? `<p class="dld ${va.pct <= 0 ? 'good' : ''}"${int('DLD open data (live)')}>${Math.abs(va.pct).toFixed(0)}% ${va.pct <= 0 ? 'below' : 'above'} the area ${va.label} median per sqft (DLD)</p>` : ''}
      <div class="lc-agent"><span class="av">A</span><span>${SUPPORT.name} · ARKO</span><a class="btn btn-ghost sm" href="tel:${SUPPORT.phone}" data-track="call-card">${ICON.phone}Call</a><a class="btn btn-ghost sm" href="#l-${l.ref}">View</a></div>
    </div></article>`;
}
function hydrate(root = view()) { $$('img[data-scene]', root).forEach(i => { const l = listingByRef(i.dataset.scene); i.src = imgFor({ ...sceneOf(l), id: l.ref, seed: l.seed }); }); refreshPrices(root); }
function toggleSave(ref) {
  const on = !isSaved(ref);
  S.short = on ? [...S.short, ref] : S.short.filter(x => x !== ref); store.set('short', S.short);
  $$(`[data-save="${ref}"]`).forEach(b => b.setAttribute('aria-pressed', String(on)));
  $('#savedCount').textContent = S.short.length; $('#savedCount').hidden = !S.short.length;
  const l = listingByRef(ref); track('shortlist', l.project || ref, { on, n: l.project ? projectById(l.project).name : l.building, ref });
  toast(on ? 'Saved. Compare it from Saved.' : 'Removed from Saved');
}

/* ----- home ----- */
function viewHome() {
  const tot = MARKET ? Object.values(MARKET.areas).reduce((a, x) => a + x.monthly.reduce((b, m) => b + m.n, 0), 0) : 0;
  const ready = LISTINGS.filter(l => l.status === 'ready').slice(0, 4), lane = (t, steps) => `<div class="lane"><h3>${t}</h3><ol>${steps.map((s, i) => `<li><b>${i + 1}</b><span>${s}</span></li>`).join('')}</ol></div>`;
  view().innerHTML = `<section class="hero"><div class="wrap hero-in">
    <div class="hero-t"><p class="eyebrow light">Dubai property, end to end</p><h1>Find it. See it in 3D. <em>Own it</em> with proof.</h1><p class="hero-p">Off-plan launches and ready homes, priced against real DLD sales, explored in 3D, booked online and tracked to the keys.</p></div>
    <form class="search" id="hs" role="search"><div class="s-tabs" role="tablist">${[['all', 'All'], ['off', 'Off-plan'], ['ready', 'Ready']].map(([v, l], i) => `<button type="button" role="tab" data-st="${v}" aria-selected="${i === 0}">${l}</button>`).join('')}</div>
      <div class="s-row"><label class="s-f grow">${ICON.search}<input id="hsLoc" list="locs" placeholder="Area, project or building" autocomplete="off"></label>
        <label class="s-f"><span class="sr">Bedrooms</span><select id="hsBeds"><option value="">Beds</option><option value="0">Studio</option><option value="1">1</option><option value="2">2</option><option value="3">3+</option></select></label>
        <label class="s-f"><span class="sr">Max price</span><select id="hsMax"><option value="0">Max price</option>${[1e6, 1.5e6, 2.5e6, 4e6, 8e6].map(v => `<option value="${v}">${money(v)}</option>`).join('')}</select></label>
        <button class="btn btn-coral btn-lg">Search</button></div>
      <datalist id="locs">${AREAS.map(a => `<option value="${esc(a)}">`).join('')}${PROJECTS.map(p => `<option value="${esc(p.name)}">`).join('')}</datalist>
      <p class="s-alt">Not sure where to start? <a href="#start" class="link light">Answer 3 questions</a> and we'll rank homes for you.</p></form>
    <div class="hero-art" aria-hidden="true">${PROJECTS.slice(0, 3).map((p, i) => `<img class="ha${i}" src="${imgFor(p, i === 1 ? 'dusk' : 'ext')}" alt="">`).join('')}</div>
  </div></section>
  <section class="stats wrap"${int('DLD open data (live)')}><div><b>${tot.toLocaleString('en-US')}</b><span>flat sales in our ${Object.keys(MARKET ? MARKET.areas : {}).length} areas this year (DLD)</span></div><div><b>${LISTINGS.length}</b><span>homes, ${PROJECTS.length} new projects</span></div><div><b>${DLD && DLD.city ? '+' + DLD.city.flat3y + '%' : '–'}</b><span>Dubai flat prices over 3 years to ${DLD && DLD.city ? DLD.city.asOf : ''} (DLD index)</span></div></section>
  <section class="wrap sec"><div class="sec-h"><div><p class="eyebrow">New projects</p><h2>Launching now</h2></div><a class="link" href="#projects">All projects</a></div><div class="rail">${PROJECTS.map(projCard).join('')}</div></section>
  <section class="wrap sec"><div class="sec-h"><div><p class="eyebrow">Areas</p><h2>Where people are buying</h2></div><a class="link" href="#market">Market data</a></div><div class="areas"${int('DLD open data (live)')}>${AREAS.filter(a => DLD && DLD.areas[a]).map(a => { const d = DLD.areas[a]; return `<a class="area" href="#search" data-loc="${esc(a)}"><b>${esc(a)}</b><span>AED ${d.medPpsf.toLocaleString('en-US')}/sqft median</span><small>${d.n.toLocaleString('en-US')} flat sales · ${d.offShare}% off-plan</small></a>`; }).join('')}</div></section>
  <section class="wrap sec"><div class="sec-h"><div><p class="eyebrow">Ready to move</p><h2>Ready homes</h2></div><a class="link" href="#search" data-status="ready">See all ready homes</a></div><div class="grid4">${ready.map(cardV).join('')}</div></section>
  <section class="journey"><div class="wrap"><p class="eyebrow">How buying works here</p><h2>Two clear paths, every step tracked</h2>
    <div class="lanes">${lane('Off-plan', ['Choose by budget and goal', 'Explore in 3D and on the street', 'Check DLD prices and returns', 'Talk to an adviser if you want', 'Reserve with an EOI into escrow', 'Sign the SPA, pay 10%', 'DLD registration (Oqood)', 'Instalment reminders to handover'])}${lane('Ready', ['Choose by budget and goal', 'Book a viewing', 'Make an offer', 'Pay cash or get a mortgage', 'Pay the 10% deposit', 'Transfer at the DLD trustee', 'Get the keys and title deed'])}</div></div></section>`;
  hydrate();
  let st = 'all';
  $('#hs .s-tabs').onclick = e => { const b = e.target.closest('[data-st]'); if (!b) return; st = b.dataset.st; $$('#hs [data-st]').forEach(x => x.setAttribute('aria-selected', String(x === b))); };
  $('#hs').onsubmit = e => { e.preventDefault(); Object.assign(S.q, { status: st, loc: $('#hsLoc').value.trim(), beds: $('#hsBeds').value, max: +$('#hsMax').value }); track('search', st + ':' + (S.q.loc || 'any')); go('search'); };
  view().onclick = e => { const a = e.target.closest('[data-loc]'); if (a) { S.q.loc = a.dataset.loc; S.q.status = 'all'; } const s = e.target.closest('[data-status]'); if (s) { S.q.status = s.dataset.status; S.q.loc = ''; } const h = e.target.closest('[data-save]'); if (h) toggleSave(h.dataset.save); };
}
function projCard(p) {
  const d = dldOf(p), va = d && d.offMed ? (p.ppsf / d.offMed - 1) * 100 : null;
  return `<a class="pcard" href="#pr-${p.id}"><div class="pc-img"><img src="${imgFor(p)}" alt="" loading="lazy"><span class="tag t-off">Handover ${p.ho}</span></div><div class="pc-b"><small>${esc(p.dev)}</small><h3>${esc(p.name)}</h3><p class="loc">${ICON.pin}${esc(p.area)}</p>
    <div class="pc-row"><div><small>From</small><b>${px(p.from)}</b></div><div><small>Plan</small><b>${p.plan}</b></div><div><small>Sold</small><b>${p.sold}%</b></div></div>${va != null ? `<p class="dld ${va <= 0 ? 'good' : ''}">${Math.abs(va).toFixed(0)}% ${va <= 0 ? 'below' : 'above'} area off-plan median</p>` : ''}</div></a>`;
}

/* ----- search ----- */
function results() {
  const q = S.q, loc = q.loc.toLowerCase(), a = S.answers;
  let r = LISTINGS.filter(l => (q.status === 'all' || l.status === q.status)
    && (!loc || [l.area, l.sub, l.building, l.project && projectById(l.project).name].some(x => x && x.toLowerCase().includes(loc)))
    && (q.beds === '' || (+q.beds === 3 ? l.beds >= 3 : l.beds === +q.beds)) && (!q.min || l.price >= q.min) && (!q.max || l.price <= q.max) && (!q.type || l.type === q.type)
    && (!q.ho || (l.project && projectById(l.project).hy <= +q.ho)) && (!q.plan || (l.project && projectById(l.project).plan === q.plan)) && (!q.verified || l.verified));
  const m = new Map(r.map(l => [l.ref, match(l, a)]));
  const so = { new: (x, y) => y.added.localeCompare(x.added), low: (x, y) => x.price - y.price, high: (x, y) => y.price - x.price, ppsf: (x, y) => x.ppsf - y.ppsf, match: (x, y) => (m.get(y.ref) || 0) - (m.get(x.ref) || 0) }[q.sort] || (() => 0);
  return { r: r.sort(so), m };
}
function viewSearch() {
  const q = S.q;
  if (S.answers && q.sort === 'new' && !q._sorted) { q.sort = 'match'; q._sorted = 1; }
  const opt = (v, l, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${l}</option>`;
  view().innerHTML = `<section class="wrap srch">
    <div class="s-top"><div><h1 id="sTitle"></h1><p class="muted" id="sSub"></p></div>
      <div class="s-tools"><div class="seg" role="tablist" aria-label="Status">${[['all', 'All'], ['off', 'Off-plan'], ['ready', 'Ready']].map(([v, l]) => `<button role="tab" data-st="${v}" aria-selected="${q.status === v}">${l}</button>`).join('')}</div>
      <label class="sr" for="sSort">Sort</label><select id="sSort">${opt('new', 'Newest', q.sort)}${opt('match', 'Best match', q.sort)}${opt('low', 'Lowest price', q.sort)}${opt('high', 'Highest price', q.sort)}${opt('ppsf', 'Lowest price per sqft', q.sort)}</select>
      <div class="seg" role="tablist" aria-label="View"><button role="tab" data-vw="list" aria-selected="${q.view === 'list'}">${ICON.list}<span>List</span></button><button role="tab" data-vw="map" aria-selected="${q.view === 'map'}">${ICON.map}<span>Map</span></button></div>
      <button class="btn btn-ghost sm fbtn-m" id="fOpen">${ICON.filter}Filters</button></div></div>
    <div class="s-body ${q.view === 'map' ? 'mapmode' : ''}">
      <aside class="fpanel" id="fp" aria-label="Filters"><div class="fp-h"><h3>Filters</h3><button class="link" id="fReset">Reset</button></div>
        <label>Location<input id="fLoc" list="locs2" value="${esc(q.loc)}" placeholder="Area, project or building"><datalist id="locs2">${AREAS.map(a => `<option value="${esc(a)}">`).join('')}${PROJECTS.map(p => `<option value="${esc(p.name)}">`).join('')}</datalist></label>
        <label>Property type<select id="fType">${opt('', 'Any', q.type)}${opt('Apartment', 'Apartment', q.type)}${opt('Penthouse', 'Penthouse', q.type)}</select></label>
        <div class="fl">Bedrooms<div class="chips">${[['', 'Any'], ['0', 'Studio'], ['1', '1'], ['2', '2'], ['3', '3+']].map(([v, l]) => `<button type="button" class="chip" data-beds="${v}" aria-pressed="${String(q.beds) === v}">${l}</button>`).join('')}</div></div>
        <div class="two"><label>Min price<select id="fMin">${opt(0, 'Any', q.min)}${[5e5, 1e6, 1.5e6, 2.5e6, 4e6].map(v => opt(v, money(v), q.min)).join('')}</select></label><label>Max price<select id="fMax">${opt(0, 'Any', q.max)}${[1e6, 1.5e6, 2.5e6, 4e6, 8e6, 15e6].map(v => opt(v, money(v), q.max)).join('')}</select></label></div>
        <label>Handover by<select id="fHo">${opt('', 'Any time', q.ho)}${[2027, 2028, 2029, 2030].map(y => opt(y, 'End of ' + y, q.ho)).join('')}</select></label>
        <label>Payment plan<select id="fPlan">${opt('', 'Any', q.plan)}${Object.keys(PLANS).map(k => opt(k, k, q.plan)).join('')}</select></label>
        <label class="chk"><input type="checkbox" id="fVer" ${q.verified ? 'checked' : ''}><span>${ICON.verified} Checked listings only</span></label>
        <button class="btn btn-primary fdone" id="fDone">Show results</button>
        <div class="fp-help"><b>Need help choosing?</b><p class="mini">${SUPPORT.name} can shortlist for you.</p><button class="btn btn-ghost sm" data-talk>${ICON.phone} Talk to ${SUPPORT.name}</button></div></aside>
      <div class="s-res" id="res"${int('Developer and broker listings feed (demo data)')}></div>
      <div class="s-map" id="smap"></div>
    </div></section>`;
  const draw = () => {
    const { r, m } = results();
    $('#sTitle').textContent = `${r.length} ${q.status === 'off' ? 'off-plan' : q.status === 'ready' ? 'ready' : ''} home${r.length === 1 ? '' : 's'} for sale`.replace('  ', ' ');
    $('#sSub').textContent = (q.loc ? 'in ' + q.loc : 'in Dubai') + (S.answers ? ' · ranked by your answers' : '');
    $('#res').innerHTML = r.length ? r.map(l => cardH(l, S.answers ? m.get(l.ref) : null)).join('') : `<div class="empty"><b>No homes match.</b><p>Try a wider price range or clear the location.</p><button class="btn btn-ghost sm" id="fReset2">Clear filters</button></div>`;
    hydrate($('#res'));
    if (q.view === 'map') mapInst = DubaiMap($('#smap'), r, { onPick: arr => { const c = $(`#res [data-ref="${arr[0].ref}"]`); if (c) { c.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 900); } } });
  };
  draw();
  const set = (k, v) => { q[k] = v; draw(); };
  $('#fLoc').oninput = e => set('loc', e.target.value.trim());
  [['fType', 'type'], ['fHo', 'ho'], ['fPlan', 'plan']].forEach(([id, k]) => $('#' + id).onchange = e => set(k, e.target.value));
  [['fMin', 'min'], ['fMax', 'max']].forEach(([id, k]) => $('#' + id).onchange = e => set(k, +e.target.value));
  $('#fVer').onchange = e => set('verified', e.target.checked);
  $('#sSort').onchange = e => set('sort', e.target.value);
  view().onclick = e => {
    const st = e.target.closest('[data-st]'); if (st) { q.status = st.dataset.st; $$('[data-st]').forEach(b => b.setAttribute('aria-selected', String(b === st))); draw(); route.bar && 0; }
    const vw = e.target.closest('[data-vw]'); if (vw) { q.view = vw.dataset.vw; viewSearch(); return; }
    const bd = e.target.closest('[data-beds]'); if (bd) { $$('[data-beds]').forEach(b => b.setAttribute('aria-pressed', String(b === bd))); set('beds', bd.dataset.beds); }
    const sv = e.target.closest('[data-save]'); if (sv) toggleSave(sv.dataset.save);
    if (e.target.closest('#fReset,#fReset2')) { Object.assign(q, { loc: '', beds: '', type: '', min: 0, max: 0, ho: '', plan: '', verified: false }); viewSearch(); }
    if (e.target.closest('#fOpen')) $('#fp').classList.add('open');
    if (e.target.closest('#fDone')) $('#fp').classList.remove('open');
    if (e.target.closest('[data-talk]')) openTalk(null);
  };
  $('#res').addEventListener('mouseover', e => { const c = e.target.closest('.lcard'); if (c && mapInst) mapInst.highlight(c.dataset.ref); });
}

/* ----- projects ----- */
function viewProjects() {
  view().innerHTML = `<section class="wrap sec"><p class="eyebrow">New projects</p><h1>Off-plan projects in Dubai</h1><p class="lead">Every project shows its RERA number, escrow account and DLD area prices before you commit.</p><div class="pgrid">${PROJECTS.map(projCard).join('')}</div></section>`;
  refreshPrices(view());
}

/* ----- market (real DLD data) ----- */
function viewMarket(arg) {
  if (!MARKET) { view().innerHTML = '<section class="wrap sec"><h1>Market data</h1><p class="lead">DLD data is not loaded.</p></section>'; return; }
  const areas = Object.keys(MARKET.areas), cur = areas.includes(S.mArea) ? S.mArea : areas[0], A = MARKET.areas[cur], d = DLD.areas[cur];
  const mm = A.monthly, W = 640, H = 220, maxN = Math.max(...mm.map(x => x.n)), mnP = Math.min(...mm.map(x => x.med)) * .9, mxP = Math.max(...mm.map(x => x.med)) * 1.05, bw = (W - 60) / mm.length;
  const X = i => 40 + i * bw + bw / 2, Yp = v => 20 + (1 - (v - mnP) / (mxP - mnP)) * (H - 60);
  const chart = `<svg viewBox="0 0 ${W} ${H}" class="mchart" role="img" aria-label="Monthly flat sales and median price per sqft in ${esc(cur)}">${mm.map((x, i) => `<rect x="${(X(i) - bw * .32).toFixed(1)}" y="${(H - 30 - x.n / maxN * (H - 60)).toFixed(1)}" width="${(bw * .64).toFixed(1)}" height="${(x.n / maxN * (H - 60)).toFixed(1)}" rx="3"><title>${x.m}: ${x.n} sales</title></rect><text x="${X(i).toFixed(1)}" y="${H - 12}" class="ax">${new Date(x.m + '-01').toLocaleDateString('en-GB', { month: 'short' })}</text>`).join('')}
    <path d="${mm.map((x, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Yp(x.med).toFixed(1)).join('')}" class="mline"/>${mm.map((x, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Yp(x.med).toFixed(1)}" r="4" class="mdot"><title>${x.m}: AED ${x.med}/sqft</title></circle>`).join('')}
    <text x="40" y="14" class="ax l">Median AED/sqft (line) · sales (bars)</text></svg>`;
  view().innerHTML = `<section class="wrap sec market"${int('DLD open data (live)')}><p class="eyebrow">Market data · DLD</p><h1>What homes actually sell for</h1><p class="lead">Registered flat sales from Dubai Land Department open data, ${MARKET.from} to ${MARKET.asOf}. Single-unit sales only.</p>
    <div class="chips mt" role="group" aria-label="Area">${areas.map(a => `<button class="chip" data-area="${esc(a)}" aria-pressed="${a === cur}">${esc(a)}</button>`).join('')}</div>
    <div class="kpis"><div><small>Median price per sqft</small><b>AED ${d.medPpsf.toLocaleString('en-US')}</b></div><div><small>Off-plan median</small><b>AED ${(d.offMed || 0).toLocaleString('en-US')}</b></div><div><small>Ready median</small><b>AED ${(d.readyMed || 0).toLocaleString('en-US')}</b></div><div><small>Sales this year</small><b>${d.n.toLocaleString('en-US')}</b></div><div><small>Off-plan share</small><b>${d.offShare}%</b></div></div>
    <div class="mk2"><div class="card-s"><h3>Month by month</h3>${chart}</div><div class="card-s"><h3>Homes on ARKO here</h3>${LISTINGS.filter(l => l.area === cur).slice(0, 4).map(l => `<a class="mini-l" href="#l-${l.ref}"><img data-scene="${l.ref}" alt=""><div><b>${px(l.price)}</b><span>${esc(l.title)}</span></div></a>`).join('') || '<p class="muted">None listed yet.</p>'}<a class="link" href="#search" data-loc="${esc(cur)}">See all in ${esc(cur)}</a></div></div>
    <div class="card-s mt"><h3>Latest registered sales in ${esc(cur)}</h3><div class="scroll"><table class="tx"><thead><tr><th>Date</th><th>Project or building</th><th>Type</th><th>Size</th><th>Price</th><th>Per sqft</th><th>Status</th></tr></thead><tbody>${A.recent.map(x => `<tr><td>${x.d}</td><td>${esc(x.project || '–')}</td><td>${esc(x.rooms)}</td><td>${x.sqft.toLocaleString('en-US')} sqft</td><td>${px(x.price, true)}</td><td>AED ${x.ppsf.toLocaleString('en-US')}</td><td><span class="pill ${x.off ? 'off' : 'rd'}">${x.off ? 'Off-plan' : 'Ready'}</span></td></tr>`).join('')}</tbody></table></div></div>
    <div class="card-s mt"><h3>All areas side by side</h3><div class="scroll"><table class="tx"><thead><tr><th>Area</th><th>Median AED/sqft</th><th>Off-plan</th><th>Ready</th><th>Sales</th><th>Off-plan share</th></tr></thead><tbody>${areas.map(a => DLD.areas[a]).map((x, i) => `<tr><td><button class="link" data-area="${esc(areas[i])}">${esc(areas[i])}</button></td><td>${x.medPpsf.toLocaleString('en-US')}</td><td>${(x.offMed || 0).toLocaleString('en-US')}</td><td>${(x.readyMed || 0).toLocaleString('en-US')}</td><td>${x.n.toLocaleString('en-US')}</td><td>${x.offShare}%</td></tr>`).join('')}</tbody></table></div></div>
  </section>`;
  hydrate();
  view().onclick = e => { const b = e.target.closest('[data-area]'); if (b) { S.mArea = b.dataset.area; track('click', 'market:' + S.mArea); viewMarket(); } const l = e.target.closest('[data-loc]'); if (l) { S.q.loc = l.dataset.loc; S.q.status = 'all'; } };
}

/* ----- saved and compare ----- */
function viewSaved() {
  const ls = S.short.map(listingByRef).filter(Boolean);
  view().innerHTML = `<section class="wrap sec"><h1>Saved homes</h1><p class="lead">${ls.length ? 'Tick up to four to compare them side by side.' : 'Tap the heart on any home to save it here.'}</p>
    ${ls.length ? `<div class="grid4 saved">${ls.map(l => `<div class="sv">${cardV(l)}<label class="cmpck"><input type="checkbox" data-cmp="${l.ref}" ${S.cmp && S.cmp.includes(l.ref) ? 'checked' : ''}><span>Compare</span></label></div>`).join('')}</div><div class="cbar"><span id="cTxt"></span><a class="btn btn-primary" id="cGo" href="#compare">Compare</a></div>` : '<a class="btn btn-primary" href="#search">Browse homes</a>'}</section>`;
  hydrate();
  S.cmp = (S.cmp || ls.slice(0, 3).map(l => l.ref)).filter(r => S.short.includes(r));
  const upd = () => { $$('[data-cmp]').forEach(c => c.checked = S.cmp.includes(c.dataset.cmp)); const t = $('#cTxt'); if (t) { t.textContent = S.cmp.length + ' selected'; $('#cGo').classList.toggle('disabled', S.cmp.length < 2); } };
  upd();
  view().onchange = e => { const c = e.target.closest('[data-cmp]'); if (!c) return; if (c.checked && S.cmp.length >= 4) { c.checked = false; toast('Compare up to four homes', 'info'); return; } S.cmp = c.checked ? [...S.cmp, c.dataset.cmp] : S.cmp.filter(x => x !== c.dataset.cmp); upd(); };
  view().onclick = e => { const h = e.target.closest('[data-save]'); if (h) { toggleSave(h.dataset.save); viewSaved(); } };
}
function viewCompare() {
  const ls = (S.cmp && S.cmp.length >= 2 ? S.cmp : S.short).slice(0, 4).map(listingByRef).filter(Boolean);
  if (ls.length < 2) { view().innerHTML = `<section class="wrap empty-state"><h1>Compare homes</h1><p class="lead">Save at least two homes with the heart, then compare them here.</p><a class="btn btn-primary" href="#search">Browse homes</a></section>`; return; }
  track('compare', ls.map(l => l.project || l.ref).join(','));
  const rows = [], N = ls.map(nearby), add = (label, vals, best, fmt = v => v) => rows.push({ label, vals, best, fmt });
  const cashNow = l => { const f = fees(l.price, l.status === 'ready'); return (l.status === 'off' ? l.price * (PLANS[projectById(l.project).plan][0][2] / 100) : l.price * .1) + f.dld + f.trustee + f.admin + f.agency; };
  add('Price', ls.map(l => l.price), 'min', v => px(v)); add('Price per sqft', ls.map(l => l.ppsf), 'min', v => 'AED ' + v.toLocaleString('en-US'));
  add('Against area median (DLD)', ls.map(l => { const v = vsArea(l); return v ? v.pct : null; }), 'min', v => v == null ? '–' : (v > 0 ? '+' : '') + v.toFixed(1) + '%');
  add('Size', ls.map(l => l.size), 'max', (v, i) => `${v.toLocaleString('en-US')} sqft <small>${bedTxt(ls[i].beds)}, ${ls[i].baths} bath</small>`);
  add('Status', ls.map(l => l.status === 'off' ? projectById(l.project).hm : 0), 'min', (v, i) => ls[i].status === 'off' ? 'Handover ' + projectById(ls[i].project).ho : 'Ready now');
  add('Payment plan', ls.map(l => l.status === 'off' ? projectById(l.project).plan : 'Cash or mortgage'), null);
  add('Cash needed to start', ls.map(cashNow), 'min', v => px(v));
  add('Service charge', ls.map(l => l.svc), 'min', v => `AED ${v}/sqft a year`);
  add('Estimated gross yield', ls.map(l => +(l.rentEst / l.price * 100).toFixed(1)), 'max', v => v + '%');
  ['metro', 'mall', 'beach', 'school', 'hospital', 'air'].forEach(c => add(CAT[c][0], N.map(n => (n.find(p => p.cat === c) || {}).t?.min ?? null), 'min', (v, i) => { const p = N[i].find(x => x.cat === c); return p ? `${p.t.min} min <small>${esc(p.name)}</small>` : '–'; }));
  add('Area sales this year (DLD)', ls.map(l => (dldOf(l) || {}).n ?? null), 'max', v => v == null ? '–' : v.toLocaleString('en-US'));
  const bi = r => { if (!r.best) return -1; const ok = r.vals.filter(v => v != null); if (ok.length < 2) return -1; return r.vals.indexOf(r.best === 'min' ? Math.min(...ok) : Math.max(...ok)); };
  view().innerHTML = `<section class="wrap sec"><a class="back" href="#saved">${ICON.back} Saved</a><h1>Side by side</h1><p class="muted">Highlighted cells lead on that row. Buildings are shown at the same scale.</p>
    <div class="ctable" style="--n:${ls.length}"><div class="cgrid"><div class="ch"></div>${ls.map(l => `<div class="ch"><div class="mini3d" data-ref="${l.ref}"></div><b>${esc(l.title)}</b><small>${esc(l.area)}</small></div>`).join('')}
    ${rows.map(r => { const b = bi(r); return `<div class="cl">${r.label}</div>${r.vals.map((v, i) => `<div class="cv ${i === b ? 'best' : ''}">${r.fmt(v, i)}</div>`).join('')}`; }).join('')}
    <div class="cl"></div>${ls.map(l => `<div class="cv"><a class="btn btn-primary sm" href="#book-${l.ref}">${l.status === 'off' ? 'Reserve' : 'Book viewing'}</a> <a class="link" href="#l-${l.ref}">Details</a></div>`).join('')}</div></div></section>`;
  refreshPrices(view());
  const H = s => s.kind === 'lowrise' ? FH * (s.floors + 1) : FH * (s.floors + 6), maxH = Math.max(...ls.map(l => H(sceneOf(l))));
  $$('.mini3d').forEach(h => { const l = listingByRef(h.dataset.ref); miniScenes.push(Scene3D(h, { ...sceneOf(l), id: l.ref }, { mini: true, scaleH: maxH })); });
}

/* ----- 3-question start ----- */
const QS = [
  { k: 'goal', q: 'What is the home for?', o: [['live', 'To live in', 'A home for me or my family'], ['invest', 'To invest', 'Rental income and growth']] },
  { k: 'bud', q: 'What budget feels comfortable?', o: [[1e6, 'Up to 1M'], [1.5e6, 'Up to 1.5M'], [2.5e6, 'Up to 2.5M'], [5e6, 'Up to 5M'], [0, 'Any budget']], money: true },
  { k: 'when', q: 'When do you want the keys?', o: [[2026, 'Now', 'Ready homes'], [2028, 'By end of 2028'], [2029, 'By end of 2029'], [2031, 'No rush', 'Best payment plans']] }
];
let qStep = 0, qAns = {};
function viewStart() { view().innerHTML = `<section class="wrap startq"><div class="qcard" id="qcard" aria-live="polite"></div></section>`; qStep = 0; qAns = {}; renderQ(); }
function renderQ() {
  const q = QS[qStep], box = $('#qcard'); if (!box) return;
  box.innerHTML = `<div class="q-top"><span>Question ${qStep + 1} of 3</span><span class="dots">${QS.map((_, i) => `<i class="${i < qStep ? 'done' : i === qStep ? 'cur' : ''}"></i>`).join('')}</span></div>
    <h1>${q.q}</h1><div class="opts ${q.o.length > 3 ? 'many' : ''}">${q.o.map(([v, l, d]) => `<button class="opt" data-v="${v}"><b>${q.money && v ? 'Up to ' + money(v) : l}</b>${d ? `<span>${d}</span>` : ''}</button>`).join('')}</div>
    <div class="q-foot">${qStep ? '<button class="link" id="qBack">Back</button>' : '<a class="link" href="#home">Cancel</a>'}<a class="link" href="#search">Skip, show all homes</a></div>`;
  box.onclick = e => {
    const b = e.target.closest('.opt');
    if (b) { qAns[q.k] = q.k === 'goal' ? b.dataset.v : +b.dataset.v; b.classList.add('sel');
      setTimeout(() => { if (qStep < 2) { qStep++; renderQ(); } else { S.answers = qAns; store.set('answers', qAns); Object.assign(S.q, { status: qAns.when <= 2026 ? 'ready' : 'all', max: 0, sort: 'match', loc: '' }); S.q._sorted = 1; track('start', `${qAns.goal} / ${qAns.bud || 'any'} / ${qAns.when}`); go('search'); } }, RM ? 0 : 160); }
    if (e.target.closest('#qBack')) { qStep--; renderQ(); }
  };
}
