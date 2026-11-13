// Drawing board. Every device keeps the same list of drawing operations and
// paints them onto a fixed 800×600 canvas, so a fill on one device lands the
// same way on the others.
//   {t:'s', id, c, w, p:[x,y,...]}  start a stroke
//   {t:'a', id, p:[x,y,...]}         add points to a stroke
//   {t:'f', id, x, y, c}             paint-bucket fill
//   {t:'sh', id, k, c, w, x1, y1, x2, y2}  shape (line, rect, circle, tri,
//                                    star, heart) stretched over a box
//   {t:'c', id}                      clear
//   {t:'u'}                          undo the last stroke, fill or clear
export const W = 800, H = 600;

export class Board {
  constructor(canvas) {
    this.cv = canvas; canvas.width = W; canvas.height = H;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.ops = [];
    this.last = new Map(); // stroke id → [x,y, color, width]
    this.reset();
  }

  reset() { this.ops = []; this.last.clear(); this.paintWhite(); }
  paintWhite() { const c = this.ctx; c.save(); c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); c.restore(); }

  load(ops) { this.ops = []; this.last.clear(); this.paintWhite(); for (const o of ops) this.apply(o); }

  apply(op) {
    if (!op || typeof op !== 'object') return;
    if (op.t === 'u') { this.undo(); return; }
    this.ops.push(op);
    this.paint(op);
  }

  undo() {
    for (let i = this.ops.length - 1; i >= 0; i--) {
      const o = this.ops[i];
      if (o.t === 's' || o.t === 'f' || o.t === 'c' || o.t === 'sh') {
        const id = o.id;
        const keep = this.ops.filter((x) => x.id !== id);
        this.load(keep);
        return;
      }
    }
  }

  paint(op) {
    const c = this.ctx;
    if (op.t === 'c') { this.paintWhite(); return; }
    if (op.t === 'f') { floodFill(c, Math.round(op.x), Math.round(op.y), op.c); return; }
    if (op.t === 'sh') { strokeShape(c, op); return; }
    if (op.t === 's' || op.t === 'a') {
      const p = op.p || [];
      let prev = op.t === 'a' ? this.last.get(op.id) : null;
      const color = op.t === 's' ? op.c : prev && prev[2];
      const width = op.t === 's' ? op.w : prev && prev[3];
      if (!color) return;
      c.save();
      c.strokeStyle = color; c.fillStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round';
      if (op.t === 's' && p.length >= 2) { c.beginPath(); c.arc(p[0], p[1], width / 2, 0, Math.PI * 2); c.fill(); }
      // One path per segment, so the pixels come out the same whether the
      // points arrive one by one (drawer) or in batches (everyone else).
      let x0 = prev ? prev[0] : p[0], y0 = prev ? prev[1] : p[1];
      for (let i = op.t === 's' ? 2 : 0; i + 1 < p.length; i += 2) {
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(p[i], p[i + 1]); c.stroke();
        x0 = p[i]; y0 = p[i + 1];
      }
      if (op.t === 's' && p.length >= 2) { x0 = p[p.length - 2]; y0 = p[p.length - 1]; }
      c.restore();
      if (p.length >= 2) this.last.set(op.id, [x0, y0, color, width]);
    }
  }
}

export const SHAPES = ['line', 'rect', 'circle', 'tri', 'star', 'heart'];

// Outline of a shape stretched over the box from (x1,y1) to (x2,y2).
export function shapePath(ctx, k, x1, y1, x2, y2) {
  const l = Math.min(x1, x2), t = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  const cx = l + w / 2, cy = t + h / 2;
  ctx.beginPath();
  if (k === 'line') { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); return; }
  if (k === 'rect') { ctx.rect(l, t, w, h); return; }
  if (k === 'circle') { ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2); return; }
  if (k === 'tri') { ctx.moveTo(cx, t); ctx.lineTo(l + w, t + h); ctx.lineTo(l, t + h); ctx.closePath(); return; }
  if (k === 'star') {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.45 : 1;
      const px = cx + Math.cos(a) * (w / 2) * r, py = cy + Math.sin(a) * (h / 2) * r;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath(); return;
  }
  if (k === 'heart') {
    const X = (u) => l + u * w, Y = (v) => t + v * h;
    ctx.moveTo(X(0.5), Y(0.28));
    ctx.bezierCurveTo(X(0.5), Y(0.02), X(0), Y(0), X(0), Y(0.33));
    ctx.bezierCurveTo(X(0), Y(0.62), X(0.38), Y(0.78), X(0.5), Y(1));
    ctx.bezierCurveTo(X(0.62), Y(0.78), X(1), Y(0.62), X(1), Y(0.33));
    ctx.bezierCurveTo(X(1), Y(0), X(0.5), Y(0.02), X(0.5), Y(0.28));
    ctx.closePath();
  }
}

export function strokeShape(ctx, op) {
  if (!SHAPES.includes(op.k)) return;
  ctx.save();
  ctx.strokeStyle = op.c; ctx.lineWidth = op.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  shapePath(ctx, op.k, op.x1, op.y1, op.x2, op.y2);
  ctx.stroke();
  ctx.restore();
}

function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

// Scanline flood fill with a little tolerance so anti-aliased edges fill too.
export function floodFill(ctx, x, y, hex) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const img = ctx.getImageData(0, 0, W, H), d = img.data;
  const [r, g, b] = hexToRgb(hex);
  const i0 = (y * W + x) * 4;
  const sr = d[i0], sg = d[i0 + 1], sb = d[i0 + 2];
  if (Math.abs(sr - r) + Math.abs(sg - g) + Math.abs(sb - b) < 10) return;
  const TOL = 90;
  const seen = new Uint8Array(W * H);
  const match = (k) => { const i = k * 4; return !seen[k] && Math.abs(d[i] - sr) + Math.abs(d[i + 1] - sg) + Math.abs(d[i + 2] - sb) <= TOL; };
  const stack = [x, y];
  while (stack.length) {
    const py = stack.pop(); let px = stack.pop();
    let k = py * W + px;
    while (px > 0 && match(k - 1)) { px--; k--; }
    let up = false, down = false;
    for (; px < W && match(k); px++, k++) {
      seen[k] = 1; const i = k * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
      if (py > 0) { const m = match(k - W); if (m && !up) { stack.push(px, py - 1); up = true; } else if (!m) up = false; }
      if (py < H - 1) { const m = match(k + W); if (m && !down) { stack.push(px, py + 1); down = true; } else if (!m) down = false; }
    }
  }
  ctx.putImageData(img, 0, 0);
}
