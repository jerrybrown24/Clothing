/* ---------- drawn map of Dubai (offline, no tiles). Coastline and roads are simplified. ---------- */
const MAPBOX = { lng0: 55.02, lng1: 55.44, lat0: 24.95, lat1: 25.30 };
const MW = 1000, MH = Math.round(MW * (MAPBOX.lat1 - MAPBOX.lat0) * 111 / ((MAPBOX.lng1 - MAPBOX.lng0) * 101));
const mx = lng => (lng - MAPBOX.lng0) / (MAPBOX.lng1 - MAPBOX.lng0) * MW, my = lat => (MAPBOX.lat1 - lat) / (MAPBOX.lat1 - MAPBOX.lat0) * MH;
const P = pts => pts.map(([la, ln], i) => (i ? 'L' : 'M') + mx(ln).toFixed(1) + ',' + my(la).toFixed(1)).join('');
const COAST = [[24.95, 55.02], [24.99, 55.05], [25.03, 55.10], [25.06, 55.12], [25.08, 55.132], [25.10, 55.15], [25.12, 55.165], [25.14, 55.19], [25.16, 55.21], [25.18, 55.23], [25.20, 55.245], [25.22, 55.255], [25.24, 55.27], [25.26, 55.285], [25.275, 55.297], [25.29, 55.315], [25.30, 55.33]];
const ROADS = {
  'Sheikh Zayed Rd': [[24.97, 55.06], [25.06, 55.14], [25.10, 55.18], [25.15, 55.22], [25.20, 55.27], [25.23, 55.29], [25.26, 55.31]],
  'Al Khail Rd': [[25.02, 55.17], [25.08, 55.21], [25.14, 55.26], [25.19, 55.31], [25.22, 55.34]],
  'Mohammed Bin Zayed Rd': [[24.97, 55.13], [25.05, 55.21], [25.12, 55.29], [25.18, 55.36], [25.23, 55.40]],
  'Al Asayel St': [[25.13, 55.21], [25.17, 55.25], [25.19, 55.255]]
};
const AREA_XY = { 'Dubai Marina': [25.082, 55.141], 'Jumeirah Lake Towers': [25.071, 55.146], 'Palm Jumeirah': [25.118, 55.132], 'Al Furjan': [25.027, 55.148], 'Jumeirah Village Circle': [25.059, 55.209], 'Dubai Hills Estate': [25.106, 55.246], 'Business Bay': [25.186, 55.270], 'Downtown Dubai': [25.196, 55.278], 'MBR City': [25.158, 55.300], 'Dubai Creek Harbour': [25.201, 55.346] };

function DubaiMap(host, items, o = {}) {
  const sea = P(COAST) + `L${mx(55.44)},${my(25.30)}L${mx(55.02)},${my(25.30)}Z`;
  const palm = `<g class="palm"><path d="${P([[25.107, 55.152], [25.136, 55.122]])}"/>${[...Array(8)].map((_, i) => { const t = .25 + i * .09, la = 25.107 + (25.136 - 25.107) * t, ln = 55.152 + (55.122 - 55.152) * t; return `<path d="${P([[la, ln], [la + .006, ln - .011]])}"/><path d="${P([[la, ln], [la - .009, ln - .004]])}"/>`; }).join('')}<path d="M${mx(55.107)},${my(25.126)} A${(mx(55.135) - mx(55.107)) / 1.3},${(my(25.11) - my(25.145)) / 1.4} 0 0 1 ${mx(55.138)},${my(25.146)}"/></g>`;
  const creek = `<path class="creek" d="${P([[25.276, 55.299], [25.258, 55.31], [25.238, 55.322], [25.218, 55.333], [25.205, 55.343], [25.193, 55.336], [25.186, 55.325]])}"/><path class="creek thin" d="${P([[25.186, 55.325], [25.188, 55.30], [25.184, 55.275], [25.183, 55.255], [25.19, 55.24], [25.205, 55.247]])}"/>`;
  const marina = `<path class="creek thin" d="${P([[25.067, 55.128], [25.074, 55.138], [25.083, 55.142], [25.092, 55.148]])}"/>`;
  const roads = Object.entries(ROADS).map(([n, pts]) => `<path class="road" d="${P(pts)}"><title>${n}</title></path>`).join('');
  const labels = Object.entries(AREA_XY).map(([n, [la, ln]]) => `<text class="alab" x="${mx(ln).toFixed(0)}" y="${(my(la) + 22).toFixed(0)}">${esc(n)}</text>`).join('');
  host.innerHTML = `<div class="dmap"><svg viewBox="0 0 ${MW} ${MH}" role="img" aria-label="Map of Dubai with ${items.length} homes"><rect width="${MW}" height="${MH}" class="land"/><path d="${sea}" class="sea"/>${palm}${creek}${marina}${roads}${labels}<g class="pins"></g></svg>
    <div class="dm-ctl"><button aria-label="Zoom in" data-z="1">+</button><button aria-label="Zoom out" data-z="-1">−</button></div><div class="dm-pop" hidden></div><p class="dm-note">Simplified map. A live site would use a full map service.</p></div>`;
  const svg = $('svg', host), g = $('.pins', host), pop = $('.dm-pop', host);
  let vb = { x: 0, y: 0, w: MW, h: MH };
  const setVB = () => svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  /* group items that share a building so pins don't stack */
  const groups = new Map(); items.forEach(it => { const k = it.lat.toFixed(3) + it.lng.toFixed(3); (groups.get(k) || groups.set(k, []).get(k)).push(it); });
  g.innerHTML = [...groups.values()].map((arr, i) => { const it = arr[0], x = mx(it.lng), y = my(it.lat), lab = arr.length > 1 ? arr.length + ' homes' : money(it.price);
    return `<g class="pin ${it.status === 'off' ? 'off' : 'rd'}" data-k="${i}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(it.building)}, ${lab}"><rect x="-38" y="-34" width="76" height="24" rx="12"/><text y="-17">${esc(lab)}</text><path d="M-5,-10 L0,-2 L5,-10z"/></g>`; }).join('');
  const arrs = [...groups.values()];
  const show = (i, el) => { const arr = arrs[i]; $$('.pin', g).forEach(p => p.classList.toggle('on', p === el));
    pop.innerHTML = arr.slice(0, 4).map(it => `<a href="#l-${it.ref}" class="dm-item"><img src="${imgFor(sceneOf(it))}" alt=""><div><b>${money(it.price)}</b><span>${it.beds ? it.beds + ' bed' : 'Studio'} · ${it.size} sqft</span><small>${esc(it.building)}</small></div></a>`).join('') + (arr.length > 4 ? `<p class="mini">+${arr.length - 4} more in this building</p>` : '');
    pop.hidden = false; o.onPick && o.onPick(arr); };
  g.addEventListener('click', e => { const p = e.target.closest('.pin'); if (p) show(+p.dataset.k, p); });
  g.addEventListener('keydown', e => { const p = e.target.closest('.pin'); if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(+p.dataset.k, p); } });
  const zoom = (f, cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2) => { const nw = clamp(vb.w * f, 160, MW); const nh = nw * MH / MW; vb = { x: clamp(cx - (cx - vb.x) * nw / vb.w, 0, MW - nw), y: clamp(cy - (cy - vb.y) * nh / vb.h, 0, MH - nh), w: nw, h: nh }; setVB(); };
  $('.dm-ctl', host).onclick = e => { const b = e.target.closest('[data-z]'); if (b) zoom(+b.dataset.z > 0 ? .7 : 1.4); };
  svg.addEventListener('wheel', e => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoom(e.deltaY < 0 ? .85 : 1.18, vb.x + (e.clientX - r.left) / r.width * vb.w, vb.y + (e.clientY - r.top) / r.height * vb.h); }, { passive: false });
  let drag = null;
  svg.addEventListener('pointerdown', e => { if (e.target.closest('.pin')) return; drag = [e.clientX, e.clientY, vb.x, vb.y]; svg.setPointerCapture(e.pointerId); });
  svg.addEventListener('pointermove', e => { if (!drag) return; const r = svg.getBoundingClientRect(), k = vb.w / r.width; vb.x = clamp(drag[2] - (e.clientX - drag[0]) * k, 0, MW - vb.w); vb.y = clamp(drag[3] - (e.clientY - drag[1]) * k, 0, MH - vb.h); setVB(); });
  svg.addEventListener('pointerup', () => drag = null);
  if (o.focus) { const x = mx(o.focus.lng), y = my(o.focus.lat); vb = { x: clamp(x - 160, 0, MW - 320), y: clamp(y - 160 * MH / MW, 0, MH - 320 * MH / MW), w: 320, h: 320 * MH / MW }; setVB(); }
  else if (items.length) { const xs = items.map(i => mx(i.lng)), ys = items.map(i => my(i.lat)), pad = 90, x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, w = clamp(x1 - x0, 320, MW); vb = { x: clamp((x0 + x1) / 2 - w / 2, 0, MW - w), y: clamp((Math.min(...ys) + Math.max(...ys)) / 2 - w * MH / MW / 2, 0, MH - w * MH / MW), w, h: w * MH / MW }; setVB(); }
  return { highlight(ref) { const i = arrs.findIndex(a => a.some(x => x.ref === ref)); $$('.pin', g).forEach((p, k) => p.classList.toggle('hl', k === i)); } };
}
