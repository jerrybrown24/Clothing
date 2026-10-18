/* ---------- draggable 3D tower (canvas, hand-rolled projection) ---------- */
function Tower3D(canvas, o) {
  const ctx = canvas.getContext('2d'), N = o.floors, twist = o.twist || .03;
  const glass = MOOD[o.mood === 'dusk' ? 'dusk' : 'day'].glass;
  let W, H, dpr, rot = .7, vel = 0, drag = false, lastX = 0, moved = 0, sel = o.sel, hover = -1, vis = true, mid = [];
  const size = () => { const r = canvas.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  const HW = .58, HD = .42, HT = 3.3, FH = HT / N, PITCH = .16, CAM = 6.2;
  function P(x, y, z) {
    const cy = Math.cos(PITCH), sy = Math.sin(PITCH), Y = y - HT * .5, y2 = Y * cy - z * sy, z2 = Y * sy + z * cy, f = CAM / (CAM + z2), K = Math.min(W * .55, H * .34);
    return [W * .5 + x * f * K, H * .52 - y2 * f * K, z2];
  }
  function ring(i) {
    const a = rot + twist * i, c = Math.cos(a), s = Math.sin(a), y = i * FH;
    return [[-HW, -HD], [HW, -HD], [HW, HD], [-HW, HD]].map(([x, z]) => P(x * c + z * s, y, -x * s + z * c));
  }
  const N0 = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  function draw() {
    ctx.clearRect(0, 0, W, H);
    let g = ctx.createRadialGradient(W * .5, H * .85, 10, W * .5, H * .85, W * .5); g.addColorStop(0, 'rgba(10,42,46,.18)'); g.addColorStop(1, 'rgba(10,42,46,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(W * .5, H * .86, W * .34, H * .06, 0, 0, 6.283); ctx.fill();
    const rings = []; for (let i = 0; i <= N; i++) rings.push(ring(i));
    mid = new Array(N).fill(null);
    for (let i = 0; i < N; i++) {
      const a = rot + twist * (i + .5), c = Math.cos(a), s = Math.sin(a);
      for (let k = 0; k < 4; k++) {
        const [nx0, nz0] = N0[k], nz = -nx0 * s + nz0 * c, nx = nx0 * c + nz0 * s;
        if (nz > .02) continue;
        const A = rings[i][k], B = rings[i][(k + 1) % 4], C = rings[i + 1][(k + 1) % 4], D = rings[i + 1][k];
        const lit = clamp(.45 + (-nx * .5 - nz * .6) * .7, .15, 1), hgt = i / N;
        ctx.fillStyle = mixc(glass, lit > .6 ? [255, 255, 255] : [8, 30, 40], Math.abs(lit - .6) * .75 + (1 - hgt) * .04);
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.lineTo(D[0], D[1]); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1;
        for (let j = 1; j < 6; j++) { const t = j / 6; ctx.beginPath(); ctx.moveTo(lerp(A[0], B[0], t), lerp(A[1], B[1], t)); ctx.lineTo(lerp(D[0], C[0], t), lerp(D[1], C[1], t)); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
        const cx = (A[0] + B[0] + C[0] + D[0]) / 4, cy = (A[1] + B[1] + C[1] + D[1]) / 4, wd = Math.abs(B[0] - A[0]);
        if (!mid[i] || wd > mid[i].w) mid[i] = { x: cx, y: cy, w: wd, h: Math.abs(D[1] - A[1]), A, B, C, D };
        if (i === sel || i === hover) {
          ctx.fillStyle = i === sel ? 'rgba(255,122,89,.62)' : 'rgba(14,124,121,.42)';
          ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.lineTo(D[0], D[1]); ctx.closePath(); ctx.fill();
        }
      }
    }
    /* crown */
    const top = rings[N]; ctx.fillStyle = lighten(glass, .5); ctx.beginPath(); top.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
    /* label */
    const m = mid[sel]; if (m) {
      const label = 'Floor ' + (sel + 1), x = Math.min(W - 92, m.x + m.w * .52 + 14), y = m.y;
      ctx.strokeStyle = '#FF7A59'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x + m.w * .3, y); ctx.lineTo(x, y); ctx.stroke();
      ctx.font = '700 13px Figtree, system-ui, sans-serif'; const tw = ctx.measureText(label).width + 20;
      ctx.fillStyle = '#0A2A2E'; rr(ctx, x, y - 14, tw, 28, 14); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 10, y + 1);
    }
  }
  let raf;
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!vis || document.hidden) return;
    if (!drag) { rot += vel + (RM ? 0 : .0035); vel *= .94; }
    draw();
  }
  new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(canvas);
  canvas.addEventListener('pointerdown', e => { drag = true; moved = 0; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (drag) { const dx = e.clientX - lastX; moved += Math.abs(dx); rot += dx * .008; vel = dx * .0016; lastX = e.clientX; }
    let best = -1, bd = 1e9;
    mid.forEach((m, i) => { if (!m) return; const d = Math.abs(py - m.y) + Math.abs(px - m.x) * .15; if (Math.abs(py - m.y) < Math.max(5, m.h * .8) && Math.abs(px - m.x) < m.w * .7 && d < bd) { bd = d; best = i; } });
    hover = best;
  });
  canvas.addEventListener('pointerleave', () => { hover = -1; });
  canvas.addEventListener('pointerup', e => { drag = false; if (moved < 5 && hover >= 0) { sel = hover; o.onPick && o.onPick(sel); } });
  canvas.addEventListener('keydown', e => { if (e.key === 'ArrowUp') { sel = Math.min(N - 1, sel + 1); o.onPick(sel); } if (e.key === 'ArrowDown') { sel = Math.max(0, sel - 1); o.onPick(sel); } if (e.key === 'ArrowLeft') rot -= .2; if (e.key === 'ArrowRight') rot += .2; });
  loop();
  return { setSel(i) { sel = i; }, destroy() { cancelAnimationFrame(raf); } };
}
