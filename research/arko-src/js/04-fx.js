/* ---------- effects: cursor, trail, shader, kinetic type, micro-interactions ---------- */
const pointer = { x: -999, y: -999, vx: 0, vy: 0, t: 0 };
addEventListener('pointermove', e => { pointer.vx = e.clientX - pointer.x; pointer.vy = e.clientY - pointer.y; pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now(); }, { passive: true });

function initCursor() {
  if (!FINE || RM) return;
  const c = $('#cursor'), dot = $('.dot', c), ring = $('.ring', c), lab = $('.ring span', c);
  let x = 0, y = 0, rx = 0, ry = 0, shown = false;
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; rx = x; ry = y; c.classList.add('on'); }
    const t = e.target.closest ? e.target.closest('[data-cursor]') : null;
    ring.classList.toggle('big', !!t);
    ring.classList.toggle('link', !t && !!(e.target.closest && e.target.closest('a,button,[role=button],input,label,select,.chip')));
    lab.textContent = t ? t.dataset.cursor : '';
  }, { passive: true });
  document.addEventListener('pointerleave', () => c.classList.remove('on'));
  document.addEventListener('pointerenter', () => shown && c.classList.add('on'));
  (function loop() {
    rx = lerp(rx, x, .17); ry = lerp(ry, y, .17);
    dot.style.transform = `translate(${x}px,${y}px)`;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();
  document.documentElement.classList.add('has-cursor');
}

function initTrail() {
  if (!FINE || RM) return;
  const cv = $('#trail'), ctx = cv.getContext('2d');
  let W, H, dpr;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  const pts = [], sparks = []; let last = null;
  addEventListener('pointermove', e => {
    const p = { x: e.clientX, y: e.clientY, t: performance.now() };
    pts.push(p); if (pts.length > 30) pts.shift();
    if (last) {
      const d = Math.hypot(p.x - last.x, p.y - last.y), n = Math.min(3, Math.floor(d / 16));
      for (let i = 0; i < n; i++) sparks.push({ x: p.x + (Math.random() - .5) * 10, y: p.y + (Math.random() - .5) * 10, vx: (Math.random() - .5) * .9, vy: (Math.random() - .5) * .9 - .25, life: 1, r: 2 + Math.random() * 3.5, c: Math.random() < .55 ? '14,124,121' : '255,122,89' });
    }
    last = p;
  }, { passive: true });
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();
    while (pts.length && now - pts[0].t > 420) pts.shift();
    ctx.lineCap = 'round';
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], k = i / pts.length;
      ctx.strokeStyle = `rgba(${k < .55 ? '14,124,121' : '255,122,89'},${k * .38})`;
      ctx.lineWidth = k * 9;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.life -= .022;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(${s.c},${s.life * .6})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, 6.283); ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
}

/* ----- cursor-reactive shader hero ----- */
function initHeroGL() {
  const cv = $('#heroGL'), hero = $('#hero');
  if (!cv) return;
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { hero.classList.add('nogl'); return; }
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec2 uVel; uniform vec3 uTrail[10];
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y;
  vec2 p=vec2(uv.x*asp,uv.y); vec2 m=vec2(uMouse.x*asp,uMouse.y);
  float t=uTime*.05;
  vec2 d=p-m; float r=length(d);
  float inf=exp(-r*r*12.);
  vec2 q=p+normalize(d+1e-4)*inf*.07+uVel*inf*.35;
  float rip=0.;
  for(int i=0;i<10;i++){vec3 tr=uTrail[i];vec2 tp=vec2(tr.x*asp,tr.y);float dd=length(p-tp);rip+=sin(dd*60.-tr.z*7.)*exp(-dd*8.)*exp(-tr.z*1.7);}
  q+=rip*.006;
  vec2 w=vec2(fbm(q*1.5+vec2(t,0.)),fbm(q*1.5+vec2(0.,-t)+5.2));
  float n=fbm(q*1.25+w*1.9+t);
  vec3 c1=vec3(.953,.969,.969),c2=vec3(.776,.933,.894),c3=vec3(.827,.914,.969),c4=vec3(1.,.851,.722);
  vec3 col=mix(c1,c2,smoothstep(.25,.65,n));
  col=mix(col,c3,smoothstep(.45,.85,fbm(q*2.+w))*.85);
  col=mix(col,c4,smoothstep(.55,.95,n+uv.y*.1)*.5*(1.-uv.y));
  col+=pow(abs(sin((n+rip*.12)*20.)),14.)*.10;
  col+=vec3(1.,.55,.38)*exp(-r*r*45.)*.20+vec3(.2,.8,.75)*exp(-r*r*10.)*.10;
  col+=(hash(gl_FragCoord.xy+uTime)-.5)*.014;
  gl_FragColor=vec4(col,1.);
}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(o)); return null; } return o; };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) { hero.classList.add('nogl'); return; }
  const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { hero.classList.add('nogl'); return; }
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'), uVel = U('uVel'), uTrail = U('uTrail[0]');
  const size = () => { const k = Math.min(devicePixelRatio || 1, 1.5) * .6; cv.width = Math.max(2, hero.clientWidth * k | 0); cv.height = Math.max(2, hero.clientHeight * k | 0); gl.viewport(0, 0, cv.width, cv.height); };
  size(); addEventListener('resize', size);
  const trail = []; for (let i = 0; i < 10; i++) trail.push({ x: .5, y: .5, t: -99 }); let ti = 0, lastDrop = 0;
  let mx = .6, my = .5, tx = .6, ty = .5, vx = 0, vy = 0, visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
  const arr = new Float32Array(30), t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || $('#v-home').hidden) return;
    const rect = hero.getBoundingClientRect(), sec = (now - t0) / 1000;
    const idle = now - pointer.t > 2200;
    if (!idle && pointer.x > -900) { tx = clamp((pointer.x - rect.left) / rect.width, 0, 1); ty = clamp(1 - (pointer.y - rect.top) / rect.height, 0, 1); }
    else { tx = .62 + .22 * Math.sin(sec * .35); ty = .5 + .18 * Math.cos(sec * .27); }
    vx = lerp(vx, (tx - mx) * 2, .2); vy = lerp(vy, (ty - my) * 2, .2);
    mx = lerp(mx, tx, .09); my = lerp(my, ty, .09);
    if (now - lastDrop > 70 && (Math.abs(vx) + Math.abs(vy) > .02)) { lastDrop = now; trail[ti] = { x: mx, y: my, t: now }; ti = (ti + 1) % 10; }
    for (let i = 0; i < 10; i++) { arr[i * 3] = trail[i].x; arr[i * 3 + 1] = trail[i].y; arr[i * 3 + 2] = Math.min(99, (now - trail[i].t) / 1000); }
    gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uTime, RM ? 3 : sec + 20);
    gl.uniform2f(uMouse, mx, my); gl.uniform2f(uVel, clamp(vx, -.3, .3), clamp(vy, -.3, .3)); gl.uniform3fv(uTrail, arr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(frame);
}

/* ----- kinetic typography ----- */
function split(el) {
  const txt = el.textContent.trim();
  el.setAttribute('aria-label', txt);
  el.textContent = '';
  let i = 0;
  txt.split(' ').forEach((w, wi, arr) => {
    const wd = document.createElement('span'); wd.className = 'w'; wd.setAttribute('aria-hidden', 'true');
    [...w].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; s.style.setProperty('--i', i++); wd.appendChild(s); });
    el.appendChild(wd);
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  el.dataset.split = 'done';
  return $$('.ch', el);
}
function weightField(el) {
  if (!FINE || RM) return;
  const chs = $$('.ch', el), cur = chs.map(() => 420); let on = true;
  new IntersectionObserver(es => { on = es[0].isIntersecting; }).observe(el);
  (function loop() {
    requestAnimationFrame(loop);
    if (!on || $('#v-home').hidden || pointer.x < -900) return;
    const rects = chs.map(c => c.getBoundingClientRect());
    chs.forEach((c, i) => {
      const r = rects[i], d = Math.hypot(pointer.x - (r.left + r.width / 2), (pointer.y - (r.top + r.height / 2)) * .7);
      cur[i] = lerp(cur[i], lerp(780, 380, clamp(d / 280, 0, 1)), .12);
      c.style.fontVariationSettings = `"wght" ${cur[i].toFixed(0)}`;
    });
  })();
}
function initRotator() {
  const rot = $('#rot'); if (!rot) return;
  const words = $$('.word', rot); words.forEach(w => split(w));
  let i = 0; words[0].classList.add('on');
  if (RM) return;
  setInterval(() => {
    const a = words[i], b = words[(i + 1) % words.length];
    a.classList.remove('on'); a.classList.add('out');
    setTimeout(() => { a.classList.remove('out'); }, 900);
    b.classList.add('on'); i = (i + 1) % words.length;
  }, 3000);
}
function initMarquee() {
  const tracks = $$('.mq-track'); if (!tracks.length) return;
  let pos = 0, lastY = scrollY, skew = 0;
  (function loop() {
    requestAnimationFrame(loop);
    const dy = scrollY - lastY; lastY = scrollY;
    skew = lerp(skew, clamp(dy * .12, -6, 6), .12);
    pos += RM ? 0 : .6 + Math.abs(dy) * .35;
    tracks.forEach((t, k) => {
      const w = t.scrollWidth / 2 || 1, off = (pos * (k ? -1 : 1)) % w;
      t.style.transform = `translate3d(${k ? off - w : -off}px,0,0) skewX(${(-skew * (k ? -1 : 1)).toFixed(2)}deg)`;
    });
  })();
}
function reveal(root = document) {
  $$('[data-split]', root).forEach(el => { if (el.dataset.split !== 'done') split(el); });
  $$('[data-reveal],[data-split]', root).forEach(el => {
    if (el._o) return; el._o = 1;
    io.observe(el);
  });
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18, rootMargin: '0px 0px -6% 0px' });

/* ----- micro-interactions ----- */
function initMicro() {
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest && e.target.closest('.btn'); if (!b) return;
    const r = b.getBoundingClientRect(), s = document.createElement('span');
    s.className = 'rip'; s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
    b.appendChild(s); setTimeout(() => s.remove(), 700);
  });
  if (FINE && !RM) {
    const mags = () => $$('[data-magnetic]').filter(el => el.offsetParent !== null);
    addEventListener('pointermove', e => {
      mags().forEach(el => {
        const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = Math.hypot(e.clientX - cx, e.clientY - cy), R0 = Math.max(r.width, r.height) * .9;
        if (d < R0) { el.style.transform = `translate(${(e.clientX - cx) * .22}px,${(e.clientY - cy) * .28}px)`; el._mg = 1; }
        else if (el._mg) { el.style.transform = ''; el._mg = 0; }
      });
    }, { passive: true });
    let tEl = null;
    document.addEventListener('pointermove', e => {
      const el = e.target.closest ? e.target.closest('[data-tilt]') : null;
      if (tEl && tEl !== el) { tEl.style.setProperty('--rx', '0deg'); tEl.style.setProperty('--ry', '0deg'); tEl.classList.remove('tilting'); }
      tEl = el;
      if (!el) return;
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.classList.add('tilting');
      el.style.setProperty('--rx', ((.5 - py) * 7).toFixed(2) + 'deg'); el.style.setProperty('--ry', ((px - .5) * 9).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    }, { passive: true });
  }
}
function initSeg(seg, onChange) {
  const th = $('.thumb', seg), bs = $$('button', seg);
  const place = () => { const a = bs.find(b => b.getAttribute('aria-selected') === 'true'); if (!a || !a.offsetWidth) return; th.style.width = a.offsetWidth + 'px'; th.style.transform = `translateX(${a.offsetLeft}px)`; };
  bs.forEach(b => b.addEventListener('click', () => { bs.forEach(x => x.setAttribute('aria-selected', String(x === b))); place(); onChange && onChange(b.dataset.v); }));
  place(); addEventListener('resize', place); seg._place = place;
  return place;
}
function burst(el, n = 8) {
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); s.className = 'bp';
    const a = i / n * 6.283 + Math.random() * .4, d = 22 + Math.random() * 18;
    s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.height / 2) + 'px';
    s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    s.style.background = i % 2 ? 'var(--coral)' : 'var(--teal)';
    document.body.appendChild(s); setTimeout(() => s.remove(), 700);
  }
}
function confetti(cv, ms = 2600) {
  const ctx = cv.getContext('2d'), W = cv.width = cv.clientWidth, H = cv.height = cv.clientHeight, cols = ['#0E7C79', '#FF7A59', '#C6EEE4', '#FFD9B8', '#0A2A2E', '#D3E9F7'];
  const ps = Array.from({ length: 120 }, () => ({ x: W / 2 + (Math.random() - .5) * 120, y: H * .42, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 4, r: 4 + Math.random() * 6, a: Math.random() * 6.28, va: (Math.random() - .5) * .4, c: cols[Math.random() * cols.length | 0] }));
  const t0 = performance.now();
  (function loop(now) {
    const k = (now - t0) / ms; ctx.clearRect(0, 0, W, H);
    ps.forEach(p => { p.vy += .42; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = clamp(1.2 - k, 0, 1); ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); });
    if (k < 1.2) requestAnimationFrame(loop); else ctx.clearRect(0, 0, W, H);
  })(t0);
}
