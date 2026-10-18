/* ---------- router + home ---------- */
const V = { home: $('#v-home'), project: $('#v-project'), reserve: $('#v-reserve'), tracker: $('#v-tracker') };
let curView = 'home';

function showView(name) {
  for (const k in V) V[k].hidden = (k !== name);
  curView = name; document.body.dataset.view = name; scrollTo(0, 0); track('view', name);
  $$('[data-nav]').forEach(b => b.classList.toggle('on', b.dataset.nav === (name === 'tracker' ? 'tracker' : 'home')));
  reveal(V[name]);
  if (name === 'home') $$('.seg', V.home).forEach(s => s._place && s._place());
}
function go(name, after, cleanup) {
  const swap = () => { showView(name); after && after(); };
  if (document.startViewTransition && !RM) {
    try { const vt = document.startViewTransition(swap); if (cleanup) vt.finished.finally(cleanup); return vt; } catch (e) { /* fall through */ }
  }
  swap(); cleanup && cleanup();
}
function goHome(sel) {
  const done = () => { if (sel) { const el = $(sel); el && el.scrollIntoView(); } };
  if (curView === 'home') { if (sel) { const el = $(sel); el && el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); } return; }
  go('home', done);
}

/* ----- cards ----- */
function planBarHTML(p) {
  const s = schedule(p), hand = s.find(x => x.n === 'On handover'), pre = s.filter(x => x.m < p.hm).reduce((a, x) => a + x.pc, 0), post = s.filter(x => x.n.startsWith('Post')).reduce((a, x) => a + x.pc, 0);
  const segs = s.map(x => `<i class="${x.n === 'On handover' ? 'h' : x.n.startsWith('Post') ? 'po' : 'pre'}" style="--w:${x.pc}"></i>`).join('');
  return `<div class="pbar" aria-hidden="true">${segs}</div><p class="mini">${pre}% while it is built · ${hand.pc}% on handover${post ? ' · ' + post + '% after' : ''}</p>`;
}
function cardHTML(it) {
  const off = it.type === 'off';
  const c2 = off ? `<div><small>Plan</small><b>${it.plan}</b></div>` : `<div><small>Rent / yr</small><b class="px" data-aed="${it.rent}">${money(it.rent)}</b></div>`;
  const c3 = off ? `<div><small>Homes</small><b>${it.fromBeds}</b></div>` : `<div><small>Size</small><b>${it.size} sqft</b></div>`;
  return `<article class="card" data-id="${it.id}" data-tilt data-cursor="View" tabindex="0" role="button" aria-label="${it.name}, ${it.area}">
  <div class="ph"><img alt="Illustrated render of ${it.name}" class="cimg"><span class="shim"></span>
    <div class="badges"><span class="b ${off ? 'b-off' : 'b-res'}">${off ? 'Off-plan' : 'Ready'}</span><span class="b">${off ? 'Handover ' + it.ho : (it.tenant ? 'Tenanted' : 'Vacant')}</span></div>
    <button class="save" aria-label="Save ${it.name}" aria-pressed="${S.saved.has(it.id)}">${ICON.heart}</button>
    ${S.goal?`<span class="match">${fitOf(it)}% match</span>`:''}<span class="ver">${ICON.shield}<span>${off ? 'RERA project checked' : 'Title checked'}</span></span>
  </div>
  <div class="cb">
    <div class="r1"><h3>${it.name}</h3><span class="yl">${it.yld}% est. yield</span></div>
    <p class="loc">${it.area} · ${off ? it.dev : it.unit}</p>
    <div class="r2"><div><small>${off ? 'From' : 'Price'}</small><b class="px" data-aed="${it.from}">${money(it.from)}</b></div>${c2}${c3}</div>
    ${off ? planBarHTML(it) : `<p class="mini">Service charge AED ${it.svc}/sqft · built ${it.built}</p>`}
    <label class="cmp"><input type="checkbox" ${S.compare.includes(it.id) ? 'checked' : ''}><span>Compare</span></label>
  </div></article>`;
}
function listItems() {
  let a = S.market === 'off' ? PROJ.slice() : RES.slice();
  const A = $('#fArea').value, B = +$('#fBud').value, H = $('#fHand').value, f = S.filters;
  if (A) a = a.filter(x => x.area === A);
  if (B) a = a.filter(x => x.from <= B);
  if (H && S.market === 'off') a = a.filter(x => H === '28' ? x.hy <= 2028 : x.hy >= 2029);
  if (f.has('water')) a = a.filter(x => x.set === 'water');
  if (f.has('u15')) a = a.filter(x => x.from < 1.5e6);
  if (S.market === 'off') { if (f.has('plan50')) a = a.filter(x => x.plan === '50/50'); if (f.has('h28')) a = a.filter(x => x.hy <= 2028); }
  const so = S.sort;
  if (S.goal && so === 'featured' && !f.has('yield')) return a.sort((x, y) => fitOf(y) - fitOf(x));
  if (f.has('yield') || so === 'yield') a.sort((x, y) => y.yld - x.yld);
  else if (so === 'low') a.sort((x, y) => x.from - y.from);
  else if (so === 'soon' && S.market === 'off') a.sort((x, y) => x.hm - y.hm);
  return a;
}
async function renderCards(anim = true) {
  const grid = $('#grid'), items = listItems();
  const first = new Map($$('.card', grid).map(c => [c.dataset.id, c.getBoundingClientRect()]));
  grid.innerHTML = items.map(cardHTML).join('') || '<div class="empty"><b>No homes match.</b><span>Try widening the budget or clearing a filter.</span></div>';
  $('#count').textContent = items.length + (items.length === 1 ? ' home' : ' homes');
  grid.dataset.market = S.market;
  $$('.card', grid).forEach((c, i) => {
    const it = byId(c.dataset.id), img = $('img', c), ok = () => c.classList.add('ready');
    const key = it.id + 'ext';
    img.onload = ok;
    if (IMGS[key]) { img.src = IMGS[key]; if (img.complete) ok(); } else ensureImg(it, 'ext').then(src => { img.src = src; });
    if (anim && !RM) {
      const old = first.get(it.id), r = c.getBoundingClientRect();
      if (old) c.animate([{ transform: `translate(${old.left - r.left}px,${old.top - r.top}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
      else c.animate([{ opacity: 0, transform: 'translateY(28px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 640, delay: i * 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    }
  });
  updateTray();
}
function setMarket(v, scroll) {
  if (S.market === v) return;
  track('market', v);
  S.market = v;
  $$('.seg[data-seg="market"]').forEach(s => { $$('button', s).forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === v))); s._place && s._place(); });
  const off = v === 'off';
  $('#exTitle').classList.remove('in'); const t = $('#exTitle'); t.textContent = off ? 'Off-plan launches' : 'Ready homes for resale'; t.dataset.split = ''; split(t); requestAnimationFrame(() => t.classList.add('in'));
  $('#exSub').textContent = off ? 'Pay in instalments while it is built. Every project shows its RERA number and escrow account before you commit.' : 'Move in or rent out now. Each listing shows tenancy, service charge and a title check. Resale offers open in phase 3 of the prototype.';
  $('#fHandWrap').hidden = !off;
  $$('.chip[data-off]').forEach(c => c.hidden = !off);
  $('#grid').classList.add('swap'); setTimeout(() => $('#grid').classList.remove('swap'), 500);
  renderCards(true);
  if (scroll) $('#explore').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
}
function toggleSave(card, btn) {
  const id = card.dataset.id, on = !S.saved.has(id);
  on ? S.saved.add(id) : S.saved.delete(id);
  btn.setAttribute('aria-pressed', String(on));
  if (on) { burst(btn); toast('Saved ' + byId(id).name); }
}
function toggleCompare(id, on, input) {
  if (on) { if (S.compare.length >= 3) { input.checked = false; toast('You can compare up to 3 homes', 'info'); return; } S.compare.push(id); }
  else S.compare = S.compare.filter(x => x !== id);
  updateTray();
}
function updateTray() {
  const t = $('#tray'); t.classList.toggle('on', S.compare.length > 0);
  $('#trayThumbs').innerHTML = S.compare.map(id => { const it = byId(id); return `<button class="th" data-rm="${id}" aria-label="Remove ${it.name} from comparison"><img src="${imgFor(it)}" alt=""><i>${ICON.x}</i></button>`; }).join('');
  $('#trayGo').disabled = S.compare.length < 2;
  $('#trayTxt').textContent = S.compare.length < 2 ? 'Pick 2 or 3 homes to compare' : S.compare.length + ' homes selected';
}
function openModal(html, cls = '') {
  const m = $('#modal'); m.innerHTML = `<div class="scrim" data-close></div><div class="sheet ${cls}" role="dialog" aria-modal="true"><button class="x" data-close aria-label="Close">${ICON.x}</button>${html}</div>`;
  m.hidden = false; requestAnimationFrame(() => m.classList.add('on'));
  const f = $('.sheet button:not(.x),.sheet input', m); f && f.focus();
}
function closeModal() { const m = $('#modal'); m.classList.remove('on'); setTimeout(() => { m.hidden = true; m.innerHTML = ''; }, 350); }
function compareModal() {
  const items = S.compare.map(byId), off = it => it.type === 'off';
  const best = (fn, hi) => { const vals = items.map(fn); const ok = vals.filter(v => v != null); if (ok.length < 2) return -1; const b = hi ? Math.max(...ok) : Math.min(...ok); return vals.indexOf(b); };
  const rows = [
    ['Area', it => it.area], ['Developer', it => off(it) ? it.dev : 'Resale'],
    ['Price', it => `<span class="px" data-aed="${it.from}">${money(it.from)}</span>`, () => best(i => i.from, false)],
    ['Price per sqft', it => `AED ${it.ppsf.toLocaleString()}`, () => best(i => i.ppsf / (i.med || i.ppsf), false)],
    ['Vs area median', it => off(it) ? `${it.ppsf > it.med ? '+' : ''}${((it.ppsf / it.med - 1) * 100).toFixed(1)}%` : '–', () => best(i => off(i) ? i.ppsf / i.med : null, false)],
    ['Est. gross yield', it => it.yld + '%', () => best(i => i.yld, true)],
    ['Handover', it => off(it) ? it.ho : 'Ready now', () => best(i => off(i) ? i.hm : 0, false)],
    ['Payment plan', it => off(it) ? it.plan : '–'],
    ['Developer on-time record', it => off(it) ? it.ot + '%' : '–', () => best(i => off(i) ? i.ot : null, true)],
    ['Sold so far', it => off(it) ? it.sold + '%' : '–'],
    ['Escrow account shown', it => off(it) ? 'Yes' : 'Not applicable']
  ];
  const head = items.map(it => `<th><img src="${imgFor(it)}" alt=""><b>${it.name}</b></th>`).join('');
  const body = rows.map(([l, f, b]) => { const bi = b ? b() : -1; return `<tr><th scope="row">${l}</th>${items.map((it, i) => `<td class="${i === bi ? 'best' : ''}">${f(it)}${i === bi ? '<em>best</em>' : ''}</td>`).join('')}</tr>`; }).join('');
  openModal(`<h2>Side by side</h2><p class="sub">Highlighted cells lead on that measure. Figures are illustrative demo data.</p><div class="tbl"><table><thead><tr><th></th>${head}</tr></thead><tbody>${body}</tbody></table></div>`, 'wide');
}

/* ----- fit score (used for match badges) ----- */
function fitScore(p, a) {
  let s = 50;
  if (a.goal === 'live') s += (p.set === 'park' ? 14 : 4) + (p.ot - 90) * 1.2;
  if (a.goal === 'rent') s += (p.yld - 5.5) * 9 + (p.metro.includes('metro') ? 4 : 0);
  if (p.from > a.bud) s -= Math.min(40, (p.from - a.bud) / a.bud * 70); else s += 6;
  s += p.hy <= 2028 ? 4 : 2;
  return clamp(Math.round(s), 35, 98);
}
function fitOf(it) {
  const a = { goal: S.goal === 'invest' ? 'rent' : 'live', bud: S.bud || 9e6 };
  if (it.type === 'off') return fitScore(it, a);
  let s = 55 + (a.goal === 'rent' ? (it.yld - 5.5) * 9 + (it.tenant ? 5 : 0) : (it.tenant ? -4 : 8) + (it.built >= 2018 ? 4 : 0));
  if (it.from > a.bud) s -= Math.min(40, (it.from - a.bud) / a.bud * 70); else s += 6;
  return clamp(Math.round(s), 35, 98);
}

/* ----- Discover: why, budget, off-plan or ready ----- */
const BUDS = [1e6, 1.5e6, 2.5e6, 4e6, 0];
function renderIntent() {
  const body = $('#intBody'), st = S.intStep || 0;
  $('#intDots').innerHTML = [0, 1, 2].map(i => `<i class="${i < st ? 'done' : i === st ? 'cur' : ''}"></i>`).join('');
  $('#intStep').textContent = st < 3 ? 'Step ' + (st + 1) + ' of 3' : 'Your starting point';
  if (st === 0) body.innerHTML = `<h3>Why are you buying?</h3><div class="opts"><button class="opt" data-goal="own" data-cursor="Pick"><b>To live in it</b><span>A home for me or my family</span></button><button class="opt" data-goal="invest" data-cursor="Pick"><b>To invest</b><span>Rental income or resale gain</span></button></div>`;
  else if (st === 1) body.innerHTML = `<h3>What budget feels right?</h3><div class="opts b3">${BUDS.map(b => `<button class="opt" data-bud="${b}"><b>${b ? 'Up to ' + money(b) : 'Show everything'}</b></button>`).join('')}</div>`;
  else if (st === 2) body.innerHTML = `<h3>What are you looking for?</h3><div class="opts"><button class="opt" data-kind="off" data-cursor="Pick"><b>Off-plan</b><span>Express interest, pay while it is built</span></button><button class="opt" data-kind="res" data-cursor="Pick"><b>Ready</b><span>View, bid and move in or rent out</span></button></div>`;
  else body.innerHTML = `<div class="int-sum"><div><h3>${S.goal === 'invest' ? 'Investing' : 'Buying to live in'} · ${S.bud ? 'up to ' + money(S.bud) : 'any budget'} · ${S.market === 'off' ? 'Off-plan' : 'Ready homes'}</h3><p class="mini">Homes below are ranked by how well they match.</p></div><button class="btn btn-ghost sm" data-reset>Change</button></div>`;
}
S.renderIntent = renderIntent;
function applyIntent() {
  const sel = $('#fBud'); sel.value = S.bud ? String(S.bud) : '';
  S.sort = 'featured'; $('#sort').value = 'featured'; track('intent', S.goal + ' / ' + (S.bud || 'any') + ' / ' + S.market);
  renderCards(true); $('#explore').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  toast('Showing homes that match');
}

function initHome() {
  $('#fArea').innerHTML = '<option value="">All areas</option>' + AREAS.map(a => `<option>${a}</option>`).join('');
  const budgets = [['', 'Any budget'], [1e6], [1.5e6], [2.5e6], [4e6]];
  const drawBud = () => { const v = $('#fBud').value; $('#fBud').innerHTML = budgets.map(([x, l]) => `<option value="${x}">${x ? 'Up to ' + money(x) : l}</option>`).join(''); $('#fBud').value = v; };
  drawBud(); S.drawBud = drawBud;
  $$('.seg[data-seg="market"]').forEach(s => initSeg(s, v => setMarket(v)));
  ['fArea', 'fBud', 'fHand'].forEach(id => $('#' + id).addEventListener('change', () => renderCards(true)));
  $('#sort').addEventListener('change', e => { S.sort = e.target.value; renderCards(true); });
  $$('.chip[data-f]').forEach(c => c.addEventListener('click', () => {
    const k = c.dataset.f, on = c.getAttribute('aria-pressed') !== 'true';
    c.setAttribute('aria-pressed', String(on)); on ? S.filters.add(k) : S.filters.delete(k); renderCards(true);
  }));
  const grid = $('#grid');
  grid.addEventListener('click', e => {
    const card = e.target.closest('.card'); if (!card) return;
    const sv = e.target.closest('.save'); if (sv) { toggleSave(card, sv); return; }
    if (e.target.closest('.cmp')) return;
    openItem(card.dataset.id, $('img', card));
  });
  grid.addEventListener('change', e => { if (e.target.matches('.cmp input')) toggleCompare(e.target.closest('.card').dataset.id, e.target.checked, e.target); });
  grid.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('card')) { e.preventDefault(); openItem(e.target.dataset.id, $('img', e.target)); } });
  $('#trayThumbs').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (!b) return; S.compare = S.compare.filter(x => x !== b.dataset.rm); $$('.card', grid).forEach(c => { const i = $('.cmp input', c); if (i) i.checked = S.compare.includes(c.dataset.id); }); updateTray(); });
  $('#trayGo').addEventListener('click', compareModal);
  /* intent flow */
  $('#intent').addEventListener('click', e => {
    const g = e.target.closest('[data-goal]'), b = e.target.closest('[data-bud]'), k = e.target.closest('[data-kind]'), r = e.target.closest('[data-reset]');
    if (g) { S.goal = g.dataset.goal; S.intStep = 1; }
    else if (b) { S.bud = +b.dataset.bud; S.intStep = 2; }
    else if (k) { S.intStep = 3; if (S.market !== k.dataset.kind) setMarket(k.dataset.kind); applyIntent(); }
    else if (r) { S.intStep = 0; S.goal = null; S.bud = 0; renderCards(false); }
    else return;
    renderIntent();
  });
  S.intStep = 0; renderIntent();
  /* hero floaters */
  const fl = $('#floaters');
  fl.innerHTML = [PROJ[0], PROJ[3], PROJ[2]].map((p, i) => `<div class="fl fl${i + 1}" data-depth="${[.9, 1.5, 1.1][i]}"><div class="fc" data-tilt data-cursor="View" data-open="${p.id}"><img alt="" src="${imgFor(p)}"><div><b>${p.name}</b><span>${p.area} · <span class="px" data-aed="${p.from}">${money(p.from)}</span></span></div></div></div>`).join('');
  fl.addEventListener('click', e => { const c = e.target.closest('[data-open]'); if (c) openItem(c.dataset.open, $('img', c)); });
  if (FINE && !RM) {
    const fls = $$('.fl', fl); let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); }, { passive: true });
    (function loop() { requestAnimationFrame(loop); if (curView !== 'home') return; cx = lerp(cx, tx, .06); cy = lerp(cy, ty, .06); fls.forEach(f => { const d = +f.dataset.depth; f.style.transform = `translate3d(${-cx * 38 * d}px,${-cy * 30 * d}px,0)`; }); })();
  }
  renderCards(false);
}
