/* ---------- 3D: architectural maquette, block plan, street walk, demo film (three.js r128) ----------
   1 unit = 10 m. North is -z, east is +x. Surroundings are generated, landmarks sit on their real bearing. */
const DENSITY = { 'Dubai Marina': [8, 26], 'Business Bay': [7, 24], 'Downtown Dubai': [8, 30], 'Dubai Creek Harbour': [5, 20], 'MBR City': [2, 9], 'Dubai Hills Estate': [1.5, 6], 'Jumeirah Village Circle': [1.2, 3.5], 'Al Furjan': [1, 3], 'Palm Jumeirah': [1, 4] };
const FH = .34;                                   /* floor height in units (3.4 m) */
const CATCOL = { metro: '#E23D3D', mall: '#7A4FD6', beach: '#1C8FC7', school: '#E2A02B', hospital: '#0E9C6B', air: '#3B4A5A', city: '#0A2A2E' };

function labelSprite(text, sub, color = '#0A2A2E', scale = 1) {
  const c = document.createElement('canvas'), x = c.getContext('2d'), f = 44;
  x.font = `700 ${f}px Figtree, system-ui, sans-serif`; const w1 = x.measureText(text).width;
  x.font = `500 ${f * .72}px Figtree, system-ui, sans-serif`; const w2 = sub ? x.measureText(sub).width : 0;
  const W = Math.ceil(Math.max(w1, w2) + 48), H = sub ? 120 : 74; c.width = W; c.height = H;
  x.fillStyle = 'rgba(255,255,255,.94)'; x.strokeStyle = color; x.lineWidth = 4;
  const r = 22; x.beginPath(); x.moveTo(r, 2); x.arcTo(W - 2, 2, W - 2, H - 2, r); x.arcTo(W - 2, H - 2, 2, H - 2, r); x.arcTo(2, H - 2, 2, 2, r); x.arcTo(2, 2, W - 2, 2, r); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = color; x.font = `700 ${f}px Figtree, system-ui, sans-serif`; x.textBaseline = 'top'; x.fillText(text, 24, 14);
  if (sub) { x.fillStyle = '#52666A'; x.font = `500 ${f * .72}px Figtree, system-ui, sans-serif`; x.fillText(sub, 24, 68); }
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(W / H * 3.2 * scale, 3.2 * scale, 1); s.renderOrder = 10; return s;
}

/* the project itself: returns {group, height, pickables, blocks:[{name, box}]} */
function buildProject(L, mats) {
  const g = new THREE.Group(), pick = [], blocks = [], r = R(L.seed);
  const floorMesh = (w, d, y, rot, bi, fi, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, FH * .92, d), mat); m.position.y = y + FH / 2; m.rotation.y = rot; m.castShadow = m.receiveShadow = true; m.userData = { block: bi, floor: fi }; pick.push(m); return m; };
  let H = 0;
  const towerAt = (x, z, floors, w, d, twist, bi, name) => {
    const t = new THREE.Group(); t.position.set(x, 0, z);
    const pod = new THREE.Mesh(new THREE.BoxGeometry(w * 1.7, FH * 3, d * 1.7), mats.podium); pod.position.y = FH * 1.5; pod.castShadow = pod.receiveShadow = true; t.add(pod);
    for (let f = 0; f < floors; f++) t.add(floorMesh(w, d, FH * 3 + f * FH, f * twist, bi, f + 1, f % 6 === 5 ? mats.glassDark : mats.glass));
    const crown = new THREE.Mesh(new THREE.BoxGeometry(w * .7, FH * 3, d * .7), mats.accent); crown.position.y = FH * 3 + floors * FH + FH * 1.5; crown.rotation.y = floors * twist; t.add(crown);
    g.add(t); H = Math.max(H, FH * (floors + 6));
    blocks.push({ name, x, z, floors, w: w * 1.7, d: d * 1.7, h: FH * (floors + 6) });
  };
  if (L.kind === 'tower') towerAt(0, 0, L.floors, 3.4, 2.6, .012, 0, 'Tower');
  else if (L.kind === 'twin') { towerAt(-4.4, 1, Math.round(L.floors * .82), 3, 2.4, .01, 0, 'Tower A'); towerAt(4.4, -1, L.floors, 3, 2.4, -.01, 1, 'Tower B'); }
  else {
    const n = L.blocks || 3, ring = n <= 2 ? 5 : 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + .4, x = Math.cos(a) * ring, z = Math.sin(a) * ring, w = n <= 2 ? 9 : 6.5, d = 3.2, fl = L.floors - (i % 2);
      const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = -a + Math.PI / 2;
      for (let f = 0; f < fl; f++) { const m = floorMesh(w * (1 - f * .012), d + (f % 3 === 0 ? .5 : 0), f * FH, 0, i, f + 1, f % 4 === 3 ? mats.glassDark : mats.glass); b.add(m); }
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w * .5, FH, d * .6), mats.accent); roof.position.y = fl * FH + FH / 2; b.add(roof);
      g.add(b); H = Math.max(H, fl * FH + FH);
      blocks.push({ name: 'Block ' + String.fromCharCode(65 + i), x, z, floors: fl, w: Math.max(w, d) + 1, d: Math.max(w, d) + 1, h: fl * FH });
    }
    const pool = new THREE.Mesh(new THREE.BoxGeometry(n <= 2 ? 5 : 4.5, .08, n <= 2 ? 2.2 : 3), mats.pool); pool.position.y = .05; g.add(pool);
  }
  return { group: g, height: H, pick, blocks };
}

function Scene3D(host, L, o = {}) {
  if (!window.THREE) { host.innerHTML = `<div class="s3-fallback"><img src="${imgFor(L)}" alt=""><p>The 3D view needs a browser with WebGL. Showing an illustration instead.</p></div>`; return { setMode() { }, destroy() { }, play() { }, pause() { }, move() { } }; }
  const mini = !!o.mini, cv = document.createElement('canvas'); cv.className = 's3'; cv.tabIndex = 0; cv.setAttribute('aria-label', '3D model of ' + L.name + '. Drag to turn, scroll to zoom.'); host.appendChild(cv);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'low-power' }); } catch (e) { host.removeChild(cv); host.innerHTML = `<div class="s3-fallback"><img src="${imgFor(L)}" alt=""><p>3D is not available on this device.</p></div>`; return { setMode() { }, destroy() { }, play() { }, pause() { }, move() { } }; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mini ? 1.5 : 2));
  renderer.shadowMap.enabled = !mini; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), sky = new THREE.Color('#E3EEF1'); scene.background = sky; scene.fog = new THREE.Fog(sky, 160, 420);
  const cam = new THREE.PerspectiveCamera(40, 1, .05, 1200);
  scene.add(new THREE.HemisphereLight('#ffffff', '#b9a98c', .5));
  const sun = new THREE.DirectionalLight('#fff1dc', .62); sun.position.set(60, 110, 40); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 10, far: 300 }); scene.add(sun);
  const M = c => new THREE.MeshLambertMaterial({ color: c });
  const mats = { glass: new THREE.MeshStandardMaterial({ color: '#7FB3CB', roughness: .25, metalness: .35 }), glassDark: new THREE.MeshStandardMaterial({ color: '#4E8BA8', roughness: .3, metalness: .4 }), podium: M('#F3EEE4'), accent: M('#FF7A59'), pool: M('#57C3E0'), white: M('#ECEAE4'), road: M('#8F989A'), walkway: M('#D9D0BE'), ground: M('#DCD2BE'), water: M('#7FB4C6'), park: M('#A9C99A'), tree: M('#6E9F69'), sel: M('#FF7A59'), hover: M('#0E7C79') };
  const proj = buildProject(L, mats); scene.add(proj.group);
  const boxes = proj.blocks.map(b => ({ minx: b.x - b.w / 2, maxx: b.x + b.w / 2, minz: b.z - b.d / 2, maxz: b.z + b.d / 2 }));
  const disposables = [];
  /* ground, plot, surroundings */
  const plane = (w, d, mat, x, z, y = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m; };
  const ground = plane(mini ? 40 : 900, mini ? 40 : 900, mats.ground, 0, 0);
  plane(30, 30, mats.walkway, 0, 0, .01);
  const labels = [], pins = [];
  if (!mini) {
    const rand = R(L.seed * 7 + 3), [hMin, hMax] = DENSITY[L.area] || [2, 8], water = L.set === 'water', step = 32;
    if (water) plane(900, 380, mats.water, 0, -230, .02);
    for (let x = -256; x <= 256; x += step) { plane(3.2, 512, mats.road, x + step / 2, 0, .03); }
    for (let z = -256; z <= 256; z += step) { if (!(water && z < -40)) plane(512, 3.2, mats.road, 0, z + step / 2, .03); }
    const geo = new THREE.BoxGeometry(1, 1, 1), max = 900, inst = new THREE.InstancedMesh(geo, mats.white, max), dm = new THREE.Object3D(); let n = 0;
    inst.castShadow = inst.receiveShadow = true;
    for (let cx = -240; cx <= 240; cx += step) for (let cz = -240; cz <= 240; cz += step) {
      if (Math.abs(cx) < 20 && Math.abs(cz) < 20) continue;
      if (water && cz < -44) continue;
      const far = Math.hypot(cx, cz);
      if (rand() < .12) { plane(step - 6, step - 6, mats.park, cx, cz, .02); for (let t = 0; t < 6; t++) { const tr = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), mats.tree); tr.position.set(cx + (rand() - .5) * 20, 1.2, cz + (rand() - .5) * 20); tr.castShadow = true; scene.add(tr); } continue; }
      const k = 1 + Math.floor(rand() * 3);
      for (let i = 0; i < k && n < max; i++) {
        const w = 5 + rand() * 9, d = 5 + rand() * 9, h = (hMin + rand() * (hMax - hMin)) * (far > 140 ? .7 : 1) * (rand() < .1 ? 1.6 : 1);
        const x = cx + (rand() - .5) * (step - 8 - w), z = cz + (rand() - .5) * (step - 8 - d);
        dm.position.set(x, h / 2, z); dm.scale.set(w, h, d); dm.rotation.set(0, 0, 0); dm.updateMatrix(); inst.setMatrixAt(n++, dm.matrix);
        boxes.push({ minx: x - w / 2, maxx: x + w / 2, minz: z - d / 2, maxz: z + d / 2 });
      }
    }
    inst.count = n; scene.add(inst); disposables.push(geo);
    /* landmarks on their real bearing; distance compressed so they fit on screen */
    nearby(L).forEach(p => {
      const r = clamp(46 + p.d * 26, 48, 230), x = Math.sin(p.b) * r, z = -Math.cos(p.b) * r, col = CATCOL[p.cat];
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, 14, 6), M(col)); pole.position.set(x, 7, z); scene.add(pole);
      const head = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), M(col)); head.position.set(x, 14.5, z); scene.add(head);
      const s = labelSprite(p.name, `${p.d.toFixed(1)} km · ${p.t.min} min ${p.t.mode}`, col, 1.5); s.position.set(x, 20, z); scene.add(s);
      pins.push({ p, x, z, s });
    });
    proj.blocks.forEach((b, i) => { const s = labelSprite(b.name, b.floors + ' floors', '#FF7A59', .9); s.position.set(b.x, b.h + 3.5, b.z); s.visible = false; scene.add(s); labels.push(s); });
  }
  /* ---------- camera state ---------- */
  const H = proj.height, scaleH = o.scaleH || H;
  let mode = 'model', theta = .8, phi = 1.05, radius = mini ? scaleH * 2.4 + 16 : Math.max(60, H * 2.6), target = new THREE.Vector3(0, mini ? scaleH * .42 : H * .35, 0);
  let idle = 0, dragging = false, lx = 0, ly = 0, pinch = 0, pts = new Map(), vis = true, raf = 0, last = performance.now();
  const walk = { on: false, x: 0, z: 24, yaw: Math.PI, pitch: .05, keys: {} };
  let film = { t: 0, playing: false, T: 30 }, hovered = null, selected = null;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const size = () => { const w = host.clientWidth || 300, h = host.clientHeight || 200; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(host);
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; }); io.observe(host);
  function orbitCam() { cam.position.set(target.x + radius * Math.sin(phi) * Math.sin(theta), target.y + radius * Math.cos(phi), target.z + radius * Math.sin(phi) * Math.cos(theta)); cam.lookAt(target); }
  function blocked(x, z) { return boxes.some(b => x > b.minx - .4 && x < b.maxx + .4 && z > b.minz - .4 && z < b.maxz + .4) || Math.abs(x) > 250 || Math.abs(z) > 250 || (L.set === 'water' && z < -42); }
  const KEYF = () => { const n = nearby(L), m = n.find(p => p.cat === 'metro');
    return [[0, [200, 140, 200], [0, 8, 0], `${L.name}, ${L.area}`], [6, [Math.max(40, H * 1.5), H * 1.1, Math.max(40, H * 1.5)], [0, H * .5, 0], `${L.floors} floors · ${L.units} homes · handover ${L.ho}`],
      [12, [-Math.max(36, H * 1.2), H * .7, Math.max(30, H)], [0, H * .45, 0], L.amen[0]], [18, [6, 1.6, 30], [0, H * .55, 0], 'At street level, by the main entrance'],
      [24, [1, 230, 2], [0, 0, 0], `${m.name}: ${m.t.min} min ${m.t.mode}`], [30, [200, 140, 200], [0, 8, 0], L.amen[1] || L.blurb]]; };
  let keys = KEYF();
  function filmCam(t) {
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const a = keys[i], b = keys[i + 1], k = ease(clamp((t - a[0]) / (b[0] - a[0]), 0, 1));
    cam.position.set(lerp(a[1][0], b[1][0], k), lerp(a[1][1], b[1][1], k), lerp(a[1][2], b[1][2], k));
    cam.lookAt(lerp(a[2][0], b[2][0], k), lerp(a[2][1], b[2][1], k), lerp(a[2][2], b[2][2], k));
    o.onCaption && o.onCaption(k < .5 ? a[3] : b[3], t / film.T);
  }
  function walkCam() { cam.position.set(walk.x, .17, walk.z); cam.lookAt(walk.x + Math.sin(walk.yaw) * Math.cos(walk.pitch), .17 + Math.sin(walk.pitch), walk.z + Math.cos(walk.yaw) * Math.cos(walk.pitch)); }
  function hud() {
    if (!o.onWalk) return;
    const items = pins.map(({ p, x, z }) => { const ang = Math.atan2(x - walk.x, z - walk.z) - walk.yaw; let deg = ((ang * 180 / Math.PI) % 360 + 540) % 360 - 180; return { name: p.name, cat: p.cat, d: p.d, t: p.t, turn: deg }; });
    o.onWalk(items);
  }
  function setMode(m) {
    mode = m; film.playing = m === 'video'; walk.on = false; idle = 0;
    labels.forEach(s => s.visible = m === 'plan');
    if (m === 'model') { phi = 1.05; radius = Math.max(60, H * 2.6); target.set(0, H * .35, 0); }
    if (m === 'plan') { phi = .12; radius = Math.max(70, H * 1.3 + 45); target.set(0, 0, 0); }
    if (m === 'walk') { phi = .55; radius = 150; target.set(0, 0, 0); }
    if (m === 'video') { film.t = 0; keys = KEYF(); }
    cv.style.cursor = m === 'walk' ? 'crosshair' : 'grab';
  }
  function drop(x, z) {
    if (blocked(x, z)) { for (let r = 1; r < 30 && blocked(x, z); r++) { z += 1; } }
    walk.x = x; walk.z = z; walk.yaw = Math.atan2(-x, -z); walk.pitch = .12; walk.on = true; cv.style.cursor = 'grab'; o.onDrop && o.onDrop();
  }
  function move(dir, amt = 1) { if (!walk.on) return; const sp = .9 * amt, f = dir === 'f' ? 1 : dir === 'b' ? -1 : 0, s = dir === 'l' ? 1 : dir === 'r' ? -1 : 0;
    const nx = walk.x + (Math.sin(walk.yaw) * f + Math.cos(walk.yaw) * s) * sp, nz = walk.z + (Math.cos(walk.yaw) * f - Math.sin(walk.yaw) * s) * sp;
    if (!blocked(nx, nz)) { walk.x = nx; walk.z = nz; } else if (!blocked(nx, walk.z)) walk.x = nx; else if (!blocked(walk.x, nz)) walk.z = nz; }
  /* ---------- input ---------- */
  const pick = e => { const r = cv.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, cam); };
  cv.addEventListener('pointerdown', e => { pts.set(e.pointerId, [e.clientX, e.clientY]); dragging = true; lx = e.clientX; ly = e.clientY; idle = 0; cv.setPointerCapture(e.pointerId); cv._moved = 0; });
  cv.addEventListener('pointermove', e => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) radius = clamp(radius * pinch / d, 14, 360); pinch = d; return; }
    if (dragging && mode !== 'video') {
      const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; cv._moved += Math.abs(dx) + Math.abs(dy);
      if (walk.on) { walk.yaw -= dx * .005; walk.pitch = clamp(walk.pitch - dy * .004, -.6, .8); }
      else { theta -= dx * .006; if (mode === 'model') phi = clamp(phi - dy * .005, .25, 1.45); }
    } else if (!mini && mode !== 'video' && !walk.on && proj.pick.length) {
      pick(e); const hit = ray.intersectObjects(proj.pick)[0], m = hit ? hit.object : null;
      if (m !== hovered) { if (hovered && hovered !== selected) hovered.material = hovered.userData.mat || hovered.material; hovered = m; if (m && m !== selected) { m.userData.mat = m.userData.mat || m.material; m.material = mats.hover; } }
    }
  });
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; if (!dragging) return; dragging = false;
    if (cv._moved < 6 && mode !== 'video') {
      pick(e);
      if (mode === 'walk' && !walk.on) { const g = ray.intersectObject(ground)[0]; if (g) drop(g.point.x, g.point.z); return; }
      const hit = !walk.on && ray.intersectObjects(proj.pick)[0];
      if (hit) { if (selected) selected.material = selected.userData.mat || selected.material; selected = hit.object; selected.userData.mat = selected.userData.mat || selected.material; selected.material = mats.sel; o.onPick && o.onPick({ block: proj.blocks[selected.userData.block].name, floor: selected.userData.floor }); }
    } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { if (mode === 'video' || walk.on) return; e.preventDefault(); radius = clamp(radius * (1 + Math.sign(e.deltaY) * .08), 14, 360); idle = 0; }, { passive: false });
  const kd = e => { if (!walk.on) return; const k = { ArrowUp: 'f', w: 'f', ArrowDown: 'b', s: 'b', ArrowLeft: 'tl', a: 'l', ArrowRight: 'tr', d: 'r' }[e.key]; if (k) { walk.keys[k] = e.type === 'keydown'; e.preventDefault(); } };
  cv.addEventListener('keydown', kd); cv.addEventListener('keyup', kd);
  /* ---------- loop ---------- */
  let hudT = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!vis || document.hidden) return;
    if (mode === 'video') { if (film.playing) film.t = (film.t + dt) % film.T; filmCam(film.t); }
    else if (walk.on) {
      for (const k in walk.keys) if (walk.keys[k]) { if (k === 'tl') walk.yaw += dt * 1.6; else if (k === 'tr') walk.yaw -= dt * 1.6; else move(k, dt * 20); }
      walkCam(); if ((hudT += dt) > .2) { hudT = 0; hud(); }
    } else { if (!dragging && (idle += dt) > 2.5 && !RM && mode !== 'walk') theta += dt * .12; orbitCam(); }
    renderer.render(scene, cam);
  }
  setMode(o.mode || 'model'); raf = requestAnimationFrame(frame);
  return {
    setMode, drop, move, height: H,
    turn(d) { walk.yaw += d; }, exitWalk() { walk.on = false; setMode('walk'); o.onExit && o.onExit(); },
    dropAt(name) { const b = { entrance: [0, 20], pool: [0, 3], boulevard: [16, 20] }[name] || [0, 20]; drop(b[0], b[1]); },
    play() { film.playing = true; }, pause() { film.playing = false; }, playing: () => film.playing, seek(f) { film.t = f * film.T; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); scene.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) { if (x.material.map) x.material.map.dispose(); x.material.dispose(); } }); disposables.forEach(d => d.dispose()); renderer.dispose(); renderer.forceContextLoss(); cv.remove(); }
  };
}
