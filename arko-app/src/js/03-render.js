/* ---------- procedural architectural renders (no external images) ---------- */
const MOOD = {
  dawn: { sky: ['#a9d4ee', '#f1e3da', '#ffd0ae'], sun: [.74, .6, '255,240,214'], far: '#c7d8e4', mid: '#a7bfcf', water: ['#f0cdb8', '#8fbad0'], glass: '#8db8cf', lit: 0, fog: '255,226,205' },
  day: { sky: ['#7cc3ea', '#cfe9f6', '#f1f8fb'], sun: [.2, .2, '255,255,255'], far: '#c2d8e6', mid: '#9dbbce', water: ['#c4e6f0', '#5fa9c4'], glass: '#6aa3c1', lit: 0, fog: '235,246,250' },
  dusk: { sky: ['#5870aa', '#d38d94', '#ffcd98'], sun: [.3, .64, '255,226,176'], far: '#8e8fb6', mid: '#6b7398', water: ['#d99a8f', '#506f9f'], glass: '#46608c', lit: 1, fog: '255,196,160' }
};
const hexRGB = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixc = (a, b, t) => { const A = hexRGB(a), B = typeof b === 'string' ? hexRGB(b) : b; return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; };
const lighten = (c, t) => mixc(c, [255, 255, 255], t), darken = (c, t) => mixc(c, [0, 0, 0], t);
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
const mk = (W, H) => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };

function skyline(a, W, hz, rand, col, n, minH, maxH, spire) {
  a.fillStyle = col;
  let x = -20;
  while (x < W + 20) {
    const w = 14 + rand() * 34, h = minH + rand() * (maxH - minH);
    a.fillRect(x, hz - h, w, h + 2);
    if (spire && rand() < .06) { a.beginPath(); a.moveTo(x + w / 2 - 3, hz - h); a.lineTo(x + w / 2, hz - h - 110); a.lineTo(x + w / 2 + 3, hz - h); a.fill(); }
    x += w + rand() * 6;
  }
}
function tower(a, W, H, hz, cx, tw, th, m, rand, hero) {
  const x0 = cx - tw / 2, top = hz - th, sw = tw * .34, sk = tw * .06;
  let g = a.createLinearGradient(x0 + tw, top, x0 + tw + sw, hz);
  g.addColorStop(0, darken(m.glass, .22)); g.addColorStop(1, darken(m.glass, .45)); a.fillStyle = g;
  a.beginPath(); a.moveTo(x0 + tw, top); a.lineTo(x0 + tw + sw, top + sk); a.lineTo(x0 + tw + sw, hz + sk * .3); a.lineTo(x0 + tw, hz); a.closePath(); a.fill();
  g = a.createLinearGradient(x0, top, x0 + tw, hz);
  g.addColorStop(0, lighten(m.glass, .4)); g.addColorStop(.55, m.glass); g.addColorStop(1, darken(m.glass, .18));
  a.fillStyle = g; a.fillRect(x0, top, tw, th);
  const fl = Math.max(16, Math.round(th / (H * .016))), fh = th / fl, cols = Math.max(5, Math.round(tw / (W * .016))), cw = tw / cols;
  for (let r = 0; r < fl; r++) {
    const y = top + r * fh;
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * cw;
      if (m.lit && rand() < .26) { a.fillStyle = `rgba(255,${190 + Math.round(rand() * 40)},${110 + Math.round(rand() * 40)},.88)`; a.fillRect(x + cw * .12, y + fh * .18, cw * .76, fh * .62); }
      else if (rand() < .2) { a.fillStyle = 'rgba(255,255,255,.10)'; a.fillRect(x + cw * .1, y + fh * .12, cw * .8, fh * .7); }
    }
    a.fillStyle = 'rgba(255,255,255,.5)'; a.fillRect(x0, y + fh * .86, tw, Math.max(1, fh * .1));
    a.fillStyle = 'rgba(0,0,0,.10)'; a.fillRect(x0, y + fh * .96, tw, Math.max(1, fh * .07));
  }
  a.strokeStyle = 'rgba(255,255,255,.16)'; a.lineWidth = 1;
  for (let c = 1; c < cols; c++) { a.beginPath(); a.moveTo(x0 + c * cw, top); a.lineTo(x0 + c * cw, hz); a.stroke(); }
  g = a.createLinearGradient(x0, top, x0 + tw * .9, top + th * .5);
  g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(.5, 'rgba(255,255,255,.06)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  a.fillStyle = g; a.fillRect(x0, top, tw, th);
  a.strokeStyle = 'rgba(255,255,255,.2)';
  for (let r = 0; r < fl; r++) { const y = top + r * fh; a.beginPath(); a.moveTo(x0 + tw, y); a.lineTo(x0 + tw + sw, y + sk * (1 - (y - top) / th * .7)); a.stroke(); }
  if (hero) {
    a.fillStyle = lighten(m.glass, .2); a.fillRect(x0 + tw * .18, top - th * .035, tw * .64, th * .035);
    a.fillStyle = 'rgba(255,255,255,.55)'; a.fillRect(x0 + tw * .18, top - th * .035, tw * .64, 2);
    a.fillStyle = darken(m.glass, .1); a.beginPath(); a.moveTo(cx - 2, top - th * .035); a.lineTo(cx, top - th * .035 - th * .12); a.lineTo(cx + 2, top - th * .035); a.fill();
  }
  const pw = tw * 1.9, ph = H * .045;
  g = a.createLinearGradient(0, hz - ph, 0, hz); g.addColorStop(0, lighten(m.mid, .5)); g.addColorStop(1, darken(m.mid, .1));
  a.fillStyle = g; a.fillRect(cx - pw / 2, hz - ph, pw, ph);
  a.fillStyle = 'rgba(255,255,255,.55)'; a.fillRect(cx - pw / 2, hz - ph, pw, 2);
  for (let i = 0; i < 22; i++) {
    const tx = cx - pw / 2 + rand() * pw, tr = H * (.012 + rand() * .016);
    a.fillStyle = `rgb(${40 + rand() * 30 | 0},${110 + rand() * 50 | 0},${86 + rand() * 30 | 0})`;
    a.beginPath(); a.arc(tx, hz - ph, tr, 0, 6.283); a.fill();
  }
}
function lowrise(a, W, H, hz, cx, Wd, m, rand) {
  const levels = 4 + Math.floor(rand() * 2), lh = H * .085;
  let w = Wd * .62;
  for (let i = 0; i < levels; i++) {
    const x = cx - w / 2 + (rand() - .5) * Wd * .05, y = hz - (i + 1) * lh;
    let g = a.createLinearGradient(x, y, x, y + lh); g.addColorStop(0, '#f6f4ee'); g.addColorStop(1, '#e2e5df'); a.fillStyle = g; a.fillRect(x, y, w, lh);
    const gy = y + lh * .22, gh = lh * .56;
    g = a.createLinearGradient(x, gy, x + w, gy); g.addColorStop(0, lighten(m.glass, .35)); g.addColorStop(1, darken(m.glass, .12)); a.fillStyle = g; a.fillRect(x + w * .03, gy, w * .94, gh);
    const cols = Math.max(4, Math.round(w / (W * .045))), cwid = w * .94 / cols;
    for (let c = 1; c < cols; c++) { a.fillStyle = 'rgba(255,255,255,.55)'; a.fillRect(x + w * .03 + c * cwid, gy, 2, gh); }
    if (m.lit) for (let c = 0; c < cols; c++) if (rand() < .4) { a.fillStyle = 'rgba(255,205,130,.8)'; a.fillRect(x + w * .03 + c * cwid + 3, gy + 3, cwid - 6, gh - 6); }
    a.fillStyle = '#ffffff'; a.fillRect(x - w * .02, y + lh * .82, w * 1.04, lh * .1);
    a.fillStyle = 'rgba(0,0,0,.12)'; a.fillRect(x - w * .02, y + lh * .92, w * 1.04, lh * .05);
    for (let k = 0; k < Math.round(w / 26); k++) { a.fillStyle = `rgb(${50 + rand() * 30 | 0},${120 + rand() * 50 | 0},${88 + rand() * 30 | 0})`; a.beginPath(); a.arc(x + rand() * w, y + lh * .8, lh * (.07 + rand() * .08), 0, 6.283); a.fill(); }
    w *= .86 + rand() * .08;
  }
}
function waterBlock(b, A, W, H, hz, m, rand) {
  let g = b.createLinearGradient(0, hz, 0, H); g.addColorStop(0, m.water[0]); g.addColorStop(1, m.water[1]);
  b.fillStyle = g; b.fillRect(0, hz, W, H - hz);
  const h = H - hz;
  b.globalAlpha = .34;
  for (let d = 0; d < h; d += 2) {
    const ox = Math.sin(d * .33 + rand() * .6) * (1 + d * .035);
    b.drawImage(A, 0, Math.max(0, hz - d - 3), W, 2, ox, hz + d, W, 2);
  }
  b.globalAlpha = 1;
  g = b.createLinearGradient(0, hz, 0, H); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, `rgba(${hexRGB(m.water[1]).join(',')},.35)`);
  b.fillStyle = g; b.fillRect(0, hz, W, h);
  for (let i = 0; i < 70; i++) { b.fillStyle = `rgba(255,255,255,${.05 + rand() * .1})`; const y = hz + rand() * h; b.fillRect(rand() * W, y, 30 + rand() * 130, 1 + y / H * 1.5); }
}
function parkBlock(b, W, H, hz, m, rand) {
  const g = b.createLinearGradient(0, hz, 0, H); g.addColorStop(0, '#a9d1a6'); g.addColorStop(1, '#5d9a78');
  b.fillStyle = g; b.fillRect(0, hz, W, H - hz);
  b.fillStyle = 'rgba(255,255,255,.07)';
  for (let i = -10; i < 22; i++) { b.beginPath(); b.moveTo(i * 70, hz); b.lineTo(i * 70 + 36, hz); b.lineTo(W / 2 + (i - 6) * 170 + 90, H); b.lineTo(W / 2 + (i - 6) * 170, H); b.fill(); }
  b.fillStyle = 'rgba(244,238,226,.9)'; b.beginPath(); b.moveTo(W * .47, hz); b.lineTo(W * .53, hz); b.lineTo(W * .78, H); b.lineTo(W * .3, H); b.fill();
}
function palm(c, x, y, h, lean, col) {
  c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = h * .035;
  c.beginPath(); c.moveTo(x, y); const tx = x + lean * h, ty = y - h; c.quadraticCurveTo(x + lean * h * .2, y - h * .6, tx, ty); c.stroke();
  for (let i = 0; i < 9; i++) {
    const ang = -Math.PI / 2 + (i - 4) * .42 + lean * .5, len = h * .34;
    c.lineWidth = h * .018; c.beginPath(); c.moveTo(tx, ty);
    c.quadraticCurveTo(tx + Math.cos(ang) * len * .6, ty + Math.sin(ang) * len * .6 - len * .18, tx + Math.cos(ang) * len, ty + Math.sin(ang) * len + len * .35); c.stroke();
  }
}
function foreground(b, W, H, hz, m, rand, set) {
  const col = m.lit ? '#1a3b47' : '#1f5a4c';
  if (set === 'water') { palm(b, W * .07, H * 1.02, H * .52, .16, col); palm(b, W * .94, H * 1.03, H * .46, -.2, col); palm(b, W * .15, H * 1.04, H * .34, .22, col); }
  else {
    for (let i = 0; i < 9; i++) {
      const x = (i < 5 ? .02 + i * .045 : .78 + (i - 5) * .06) * W, y = hz + (H - hz) * (.45 + rand() * .5), r = H * (.05 + rand() * .06);
      b.fillStyle = 'rgba(0,0,0,.08)'; b.beginPath(); b.ellipse(x + r * .2, y + r * .9, r * 1.1, r * .3, 0, 0, 6.283); b.fill();
      b.fillStyle = `rgb(${40 + rand() * 30 | 0},${112 + rand() * 40 | 0},${80 + rand() * 30 | 0})`; b.beginPath(); b.arc(x, y, r, 0, 6.283); b.fill();
      b.fillStyle = 'rgba(255,255,255,.14)'; b.beginPath(); b.arc(x - r * .3, y - r * .3, r * .55, 0, 6.283); b.fill();
    }
  }
}
function finish(b, W, H, rand) {
  const g = b.createRadialGradient(W / 2, H * .5, H * .3, W / 2, H * .5, W * .75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,30,40,.22)'); b.fillStyle = g; b.fillRect(0, 0, W, H);
  for (let i = 0; i < 1400; i++) { b.fillStyle = `rgba(255,255,255,${rand() * .05})`; b.fillRect(rand() * W, rand() * H, 1.4, 1.4); }
}
function exterior(item, moodName, W, H, off) {
  const m = MOOD[moodName], rand = R(item.seed * 97 + off), hz = H * .7;
  const A = mk(W, H), a = A.getContext('2d');
  let g = a.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, m.sky[0]); g.addColorStop(.55, m.sky[1]); g.addColorStop(1, m.sky[2]);
  a.fillStyle = g; a.fillRect(0, 0, W, H);
  const sx = W * m.sun[0], sy = H * m.sun[1] * .9;
  g = a.createRadialGradient(sx, sy, 0, sx, sy, W * .5); g.addColorStop(0, `rgba(${m.sun[2]},.95)`); g.addColorStop(.12, `rgba(${m.sun[2]},.55)`); g.addColorStop(1, `rgba(${m.sun[2]},0)`);
  a.fillStyle = g; a.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) {
    const cx = rand() * W, cy = H * (.08 + rand() * .3), rw = 90 + rand() * 160;
    g = a.createRadialGradient(cx, cy, 0, cx, cy, rw); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    a.save(); a.translate(cx, cy); a.scale(1, .28); a.translate(-cx, -cy); a.fillStyle = g; a.beginPath(); a.arc(cx, cy, rw, 0, 6.283); a.fill(); a.restore();
  }
  skyline(a, W, hz, rand, m.far, 26, H * .09, H * .2, true);
  skyline(a, W, hz, rand, m.mid, 18, H * .06, H * .15, false);
  g = a.createLinearGradient(0, hz - H * .18, 0, hz); g.addColorStop(0, `rgba(${m.fog},0)`); g.addColorStop(1, `rgba(${m.fog},.55)`);
  a.fillStyle = g; a.fillRect(0, hz - H * .18, W, H * .18);
  const cx = W * (.5 + (rand() - .5) * .08);
  if (item.kind === 'tower') tower(a, W, H, hz, cx, W * .2, H * .72, m, rand, true);
  else if (item.kind === 'twin') { tower(a, W, H, hz, cx - W * .15, W * .15, H * .6, m, rand, false); tower(a, W, H, hz, cx + W * .1, W * .17, H * .74, m, rand, true); }
  else lowrise(a, W, H, hz, cx, W, m, rand);
  const B = mk(W, H), b = B.getContext('2d');
  b.drawImage(A, 0, 0);
  if (item.set === 'water') waterBlock(b, A, W, H, hz, m, rand); else parkBlock(b, W, H, hz, m, rand);
  foreground(b, W, H, hz, m, rand, item.set);
  finish(b, W, H, rand);
  return B;
}
function interior(item, W, H) {
  const rand = R(item.seed * 31 + 5), m = MOOD[item.mood === 'dusk' ? 'dusk' : 'day'], c = mk(W, H), x = c.getContext('2d');
  let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f1eee8'); g.addColorStop(1, '#e4dfd6'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const wx = W * .3, wy = H * .08, ww = W * .66, wh = H * .56;
  x.save(); x.beginPath(); x.rect(wx, wy, ww, wh); x.clip();
  g = x.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, m.sky[0]); g.addColorStop(.6, m.sky[1]); g.addColorStop(1, m.sky[2]); x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
  skyline(x, W, wy + wh * .8, rand, m.far, 26, wh * .2, wh * .45, true); skyline(x, W, wy + wh * .92, rand, m.mid, 16, wh * .12, wh * .3, false);
  g = x.createLinearGradient(0, wy + wh * .8, 0, wy + wh); g.addColorStop(0, m.water[0]); g.addColorStop(1, m.water[1]); x.fillStyle = g; x.fillRect(wx, wy + wh * .84, ww, wh * .2);
  x.restore();
  x.fillStyle = '#d9d4c9'; for (let i = 0; i <= 4; i++) x.fillRect(wx + i * ww / 4 - 3, wy, 6, wh); x.fillRect(wx, wy - 4, ww, 8); x.fillRect(wx, wy + wh - 4, ww, 8);
  g = x.createLinearGradient(0, H * .64, 0, H); g.addColorStop(0, '#cdb99c'); g.addColorStop(1, '#a88f6d'); x.fillStyle = g; x.fillRect(0, H * .64, W, H * .36);
  x.strokeStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < 14; i++) { x.beginPath(); x.moveTo(W / 2 + (i - 7) * 14, H * .64); x.lineTo(W / 2 + (i - 7) * 110, H); x.stroke(); }
  x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.moveTo(wx, H * .64); x.lineTo(wx + ww, H * .64); x.lineTo(W * 1.05, H); x.lineTo(W * .12, H); x.fill();
  x.fillStyle = 'rgba(46,120,118,.85)'; x.beginPath(); x.ellipse(W * .52, H * .84, W * .2, H * .07, 0, 0, 6.283); x.fill();
  x.fillStyle = '#e9e4d9'; rr(x, W * .34, H * .56, W * .34, H * .17, 26); x.fill();
  x.fillStyle = '#d9d2c3'; rr(x, W * .34, H * .53, W * .34, H * .08, 20); x.fill();
  [['#0f766e', .38], ['#ff8a6b', .45], ['#f6f1e6', .52], ['#0f766e', .59]].forEach(([col, px]) => { x.fillStyle = col; rr(x, W * px, H * .585, W * .055, H * .06, 12); x.fill(); });
  x.fillStyle = '#b79b78'; rr(x, W * .42, H * .76, W * .18, H * .05, 12); x.fill();
  x.fillStyle = '#fff'; x.beginPath(); x.ellipse(W * .51, H * .758, W * .02, H * .008, 0, 0, 6.283); x.fill();
  x.strokeStyle = '#3d5a5e'; x.lineWidth = 4; x.beginPath(); x.moveTo(W * .14, H * .8); x.lineTo(W * .14, H * .34); x.quadraticCurveTo(W * .14, H * .26, W * .2, H * .28); x.stroke();
  x.fillStyle = '#ffd89b'; x.beginPath(); x.arc(W * .205, H * .31, 20, 0, 6.283); x.fill();
  x.fillStyle = '#7a5b3f'; rr(x, W * .075, H * .72, 40, 60, 10); x.fill();
  for (let i = 0; i < 9; i++) { x.strokeStyle = '#2f7d62'; x.lineWidth = 5; x.beginPath(); x.moveTo(W * .075 + 20, H * .72); x.quadraticCurveTo(W * .075 + 20 + (i - 4) * 18, H * .62 - rand() * 30, W * .075 + 20 + (i - 4) * 30, H * .58 + rand() * 20); x.stroke(); }
  for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(255,255,255,${rand() * .04})`; x.fillRect(rand() * W, rand() * H, 1.4, 1.4); }
  return c;
}
const IMGS = {};
function imgFor(item, variant = 'ext') {
  const key = item.id + variant;
  if (IMGS[key]) return IMGS[key];
  const W = 960, H = 640;
  const c = variant === 'int' ? interior(item, W, H) : exterior(item, variant === 'dusk' ? 'dusk' : item.mood, W, H, variant === 'dusk' ? 7 : 0);
  return IMGS[key] = c.toDataURL('image/jpeg', .86);
}
async function ensureImg(item, variant = 'ext') {
  if (IMGS[item.id + variant]) return IMGS[item.id + variant];
  await sleep(0);
  return imgFor(item, variant);
}
