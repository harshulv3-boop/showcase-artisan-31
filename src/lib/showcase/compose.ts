import type {
  ArtDirection,
  BgLayer,
  Brand,
  Composition,
  DecorItem,
  OutputType,
  Ratio,
  SceneNode,
  Screen,
} from "./types";
import { shift, withAlpha } from "./direction";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function rngFrom(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function signatureOf(dir: ArtDirection) {
  const nums = [
    dir.focal.x, dir.focal.y, dir.negativeSpace, dir.symmetry, dir.density, dir.bleed,
    dir.perspective.tiltY, dir.lighting.angle, dir.lighting.intensity, dir.typography.scaleRatio,
    dir.device.radius, dir.device.glass, dir.decor.intensity,
  ];
  let h = 2166136261;
  for (const n of nums) {
    const v = Math.round(n * 1000);
    h = Math.imul(h ^ v, 16777619);
  }
  for (const c of dir.palette.join("")) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/* ---------------- procedural placement strategies ----------------
   These are parametric field generators, not layouts: each one takes the
   art direction plus a random regime and produces node coordinates. Two runs
   with different references never produce the same coordinates.               */

type Ctx = {
  dir: ArtDirection;
  screens: Screen[];
  rnd: () => number;
  ratio: number; // canvas height / width
};

const aspectOf = (s: Screen) => s.width / Math.max(1, s.height);

function node(ctx: Ctx, s: Screen, p: Partial<SceneNode> & { x: number; y: number; w: number }): SceneNode {
  return {
    id: `${s.id}-${Math.round(p.x * 1000)}-${Math.round(p.y * 1000)}`,
    screenId: s.id,
    rotate: 0,
    tiltY: 0,
    tiltX: 0,
    z: 1,
    opacity: 1,
    blur: 0,
    frame: ctx.dir.device.frame,
    crop: null,
    ...p,
  };
}

/** height of a node as a fraction of canvas height */
function nodeH(ctx: Ctx, n: SceneNode) {
  const s = ctx.screens.find((x) => x.id === n.screenId)!;
  const ar = n.crop ? n.crop.ratio : aspectOf(s);
  return (n.w / ar) / ctx.ratio;
}

type Strategy = (ctx: Ctx, pool: Screen[]) => SceneNode[];

const solo: Strategy = (ctx, pool) => {
  const { dir, rnd } = ctx;
  const s = pool[0]!;
  const big = mix(0.42, 0.92, clamp(1 - dir.negativeSpace + rnd() * 0.25));
  const w = aspectOf(s) < 0.8 ? big * 0.42 : big;
  return [
    node(ctx, s, {
      x: mix(dir.focal.x, 0.5, 0.35),
      y: mix(dir.focal.y, 0.55, 0.4),
      w,
      rotate: dir.perspective.roll * (rnd() - 0.3),
      tiltY: dir.perspective.tiltY * mix(0.3, 1, rnd()),
      tiltX: dir.perspective.tiltX,
      z: 5,
    }),
  ];
};

const cascade: Strategy = (ctx, pool) => {
  const { dir, rnd } = ctx;
  const n = Math.min(pool.length, 2 + Math.round(dir.density * 3 + rnd()));
  const angle = mix(-32, 32, rnd()) + (dir.focal.x > 0.5 ? -12 : 12);
  const rad = (angle * Math.PI) / 180;
  const step = mix(0.1, 0.24, 1 - dir.density);
  const base = mix(0.3, 0.52, 1 - dir.density);
  return Array.from({ length: n }, (_, i) => {
    const k = i - (n - 1) / 2;
    const s = pool[i % pool.length]!;
    const scale = 1 - Math.abs(k) * mix(0.07, 0.2, rnd());
    return node(ctx, s, {
      x: clamp(dir.focal.x + Math.cos(rad) * k * step, 0.08, 0.92),
      y: clamp(dir.focal.y + Math.sin(rad) * k * step * ctx.ratio * 1.4, 0.14, 0.88),
      w: (aspectOf(s) < 0.8 ? base * 0.45 : base) * scale,
      rotate: dir.perspective.roll * 0.5 + k * mix(-6, 6, rnd()),
      tiltY: dir.perspective.tiltY * 0.6,
      tiltX: dir.perspective.tiltX * 0.5,
      z: 10 - Math.abs(k),
      opacity: 1 - Math.abs(k) * 0.06,
      blur: Math.abs(k) > 1 ? Math.abs(k) * 0.6 : 0,
    });
  });
};

const orbit: Strategy = (ctx, pool) => {
  const { dir, rnd } = ctx;
  const hero = pool[0]!;
  const sats = pool.slice(1, 1 + Math.min(5, 2 + Math.round(dir.density * 3)));
  const r = mix(0.24, 0.42, dir.negativeSpace) + rnd() * 0.06;
  const start = rnd() * Math.PI * 2;
  const nodes: SceneNode[] = [
    node(ctx, hero, {
      x: dir.focal.x,
      y: dir.focal.y,
      w: (aspectOf(hero) < 0.8 ? 0.24 : 0.5) * mix(0.9, 1.25, rnd()),
      z: 9,
      tiltY: dir.perspective.tiltY * 0.4,
      rotate: dir.perspective.roll * 0.3,
    }),
  ];
  sats.forEach((s, i) => {
    const a = start + (i / sats.length) * Math.PI * 2;
    nodes.push(
      node(ctx, s, {
        x: clamp(dir.focal.x + Math.cos(a) * r, 0.04, 0.96),
        y: clamp(dir.focal.y + Math.sin(a) * r * (1 / ctx.ratio) * 0.55, 0.08, 0.94),
        w: (aspectOf(s) < 0.8 ? 0.13 : 0.26) * mix(0.75, 1.15, rnd()),
        rotate: (Math.cos(a) * dir.perspective.roll) + mix(-8, 8, rnd()),
        tiltY: -Math.cos(a) * dir.perspective.tiltY * 0.8,
        z: Math.sin(a) > 0 ? 12 : 3,
        opacity: Math.sin(a) > 0 ? 1 : 0.9,
        blur: Math.sin(a) > 0 ? 0 : 1.2,
      }),
    );
  });
  return nodes;
};

const wall: Strategy = (ctx, pool) => {
  const { dir, rnd } = ctx;
  const n = Math.min(pool.length, 3 + Math.round(dir.density * 3));
  const depth = mix(18, 46, clamp(Math.abs(dir.perspective.tiltY) / 22 + rnd() * 0.3));
  const dirSign = dir.focal.x > 0.5 ? -1 : 1;
  const gap = mix(0.14, 0.26, dir.negativeSpace);
  const rowY = mix(0.42, 0.66, rnd());
  return Array.from({ length: n }, (_, i) => {
    const s = pool[i % pool.length]!;
    const t = i / Math.max(1, n - 1);
    return node(ctx, s, {
      x: clamp(0.5 + dirSign * (t - 0.5) * gap * n, -0.05, 1.05),
      y: clamp(rowY + (t - 0.5) * 0.1 * dirSign, 0.15, 0.85),
      w: (aspectOf(s) < 0.8 ? 0.16 : 0.34) * (1 - t * 0.22),
      rotate: dir.perspective.roll * 0.2,
      tiltY: depth * dirSign,
      tiltX: dir.perspective.tiltX * 0.4,
      z: 10 - i,
      opacity: 1 - t * 0.22,
      blur: t * 2.2,
    });
  });
};

const mosaic: Strategy = (ctx, pool) => {
  const { dir, rnd } = ctx;
  const cols = dir.density > 0.55 ? 3 : 2;
  const n = Math.min(pool.length, cols * 2 + (rnd() > 0.5 ? 1 : 0));
  const m = mix(0.06, 0.16, dir.negativeSpace);
  const cw = (1 - m * 2) / cols;
  const rows = Math.ceil(n / cols);
  const ch = (1 - m * 2) / rows;
  return Array.from({ length: n }, (_, i) => {
    const s = pool[i % pool.length]!;
    const cx = i % cols;
    const cy = Math.floor(i / cols);
    const jitter = mix(0.2, 1, 1 - dir.symmetry);
    return node(ctx, s, {
      x: m + cw * (cx + 0.5) + (rnd() - 0.5) * cw * 0.24 * jitter,
      y: m + ch * (cy + 0.5) + (rnd() - 0.5) * ch * 0.22 * jitter,
      w: cw * mix(0.7, 0.98, rnd()) * (aspectOf(s) < 0.8 ? 0.62 : 1),
      rotate: (rnd() - 0.5) * dir.perspective.roll * 0.8 * jitter,
      tiltY: dir.perspective.tiltY * 0.15,
      z: 4 + (i % 3),
    });
  });
};

const splitCluster: Strategy = (ctx, pool) => {
  const { dir, rnd } = ctx;
  const side = dir.focal.x > 0.5 ? 1 : -1;
  const anchorX = 0.5 + side * mix(0.12, 0.28, dir.negativeSpace);
  const n = Math.min(pool.length, 2 + Math.round(dir.density * 3));
  return Array.from({ length: n }, (_, i) => {
    const s = pool[i % pool.length]!;
    const t = i / Math.max(1, n - 1 || 1);
    return node(ctx, s, {
      x: clamp(anchorX + (i === 0 ? 0 : side * (0.06 + t * 0.16) * (i % 2 ? 1 : -0.6)), 0.02, 1.02),
      y: clamp(mix(0.34, 0.7, t * mix(0.6, 1.2, rnd())) + (i === 0 ? -0.02 : 0.06), 0.1, 0.92),
      w: (aspectOf(s) < 0.8 ? 0.2 : 0.44) * (i === 0 ? mix(1, 1.3, rnd()) : mix(0.5, 0.78, rnd())),
      rotate: i === 0 ? dir.perspective.roll * 0.4 : mix(-9, 9, rnd()),
      tiltY: -side * dir.perspective.tiltY * (i === 0 ? 1 : 0.4),
      tiltX: dir.perspective.tiltX,
      z: i === 0 ? 9 : 4 + i,
      opacity: i === 0 ? 1 : 0.96,
    });
  });
};

const macroCrop: Strategy = (ctx, pool) => {
  const { dir, rnd } = ctx;
  const hero = pool[0]!;
  const cropRatio = mix(1.1, 2.1, rnd());
  const nodes = [
    node(ctx, hero, {
      x: mix(0.42, 0.62, rnd()),
      y: mix(0.5, 0.68, rnd()),
      w: mix(0.78, 1.14, dir.bleed + rnd() * 0.4),
      rotate: dir.perspective.roll * 0.2,
      tiltY: dir.perspective.tiltY * 0.25,
      z: 4,
      frame: false,
      crop: { scale: mix(1.3, 2.4, rnd()), ox: rnd(), oy: rnd() * 0.5, ratio: cropRatio },
    }),
  ];
  if (pool[1]) {
    nodes.push(
      node(ctx, pool[1], {
        x: dir.focal.x > 0.5 ? 0.2 : 0.8,
        y: mix(0.52, 0.78, rnd()),
        w: aspectOf(pool[1]) < 0.8 ? 0.15 : 0.3,
        rotate: mix(-8, 8, rnd()),
        tiltY: dir.perspective.tiltY * 0.6,
        z: 12,
      }),
    );
  }
  return nodes;
};

const shearStack: Strategy = (ctx, pool) => {
  const { dir, rnd } = ctx;
  const n = Math.min(pool.length, 2 + Math.round(rnd() * 3));
  const lean = mix(-14, 14, rnd());
  return Array.from({ length: n }, (_, i) => {
    const s = pool[i % pool.length]!;
    return node(ctx, s, {
      x: clamp(dir.focal.x + i * mix(0.05, 0.13, rnd()) * (lean > 0 ? 1 : -1), 0.06, 0.94),
      y: clamp(mix(0.32, 0.6, rnd()) + i * mix(0.05, 0.12, rnd()), 0.12, 0.9),
      w: (aspectOf(s) < 0.8 ? 0.22 : 0.48) * (1 - i * 0.08),
      rotate: lean * (1 - i * 0.25),
      tiltY: dir.perspective.tiltY * 0.5,
      tiltX: dir.perspective.tiltX * 0.8,
      z: 10 - i,
      opacity: 1 - i * 0.05,
      blur: i * 0.5,
    });
  });
};

const STRATEGIES: { name: string; fn: Strategy; min: number; weight: (d: ArtDirection) => number }[] = [
  { name: "focal-solo", fn: solo, min: 1, weight: (d) => 0.6 + d.negativeSpace },
  { name: "diagonal-cascade", fn: cascade, min: 2, weight: (d) => 0.5 + (1 - d.symmetry) },
  { name: "orbital-cluster", fn: orbit, min: 3, weight: (d) => 0.4 + d.density },
  { name: "receding-wall", fn: wall, min: 3, weight: (d) => 0.3 + Math.abs(d.perspective.tiltY) / 22 },
  { name: "irregular-mosaic", fn: mosaic, min: 3, weight: (d) => 0.2 + d.density * 1.4 },
  { name: "weighted-split", fn: splitCluster, min: 2, weight: (d) => 0.5 + Math.abs(d.focal.x - 0.5) * 2 },
  { name: "macro-crop", fn: macroCrop, min: 1, weight: (d) => 0.3 + d.bleed * 1.6 },
  { name: "shear-stack", fn: shearStack, min: 2, weight: (d) => 0.4 + (1 - d.symmetry) * 0.8 },
];

/* ---------------- background composition ---------------- */

function buildBackground(dir: ArtDirection, rnd: () => number, variant: number) {
  const p = dir.palette;
  const darkest = p[0] ?? "#0b0d12";
  const lightest = p[p.length - 1] ?? "#f4f5f7";
  const base = dir.dark ? shift(darkest, -0.02) : shift(lightest, 0.02);
  const accent = dir.accent;
  const mid = p[Math.floor(p.length / 2)] ?? accent;
  const layers: BgLayer[] = [];
  const angle = ((dir.lighting.angle % 360) + 360) % 360;

  // core field — recipe varies per variant so no two share a backdrop
  const recipe = variant % 4;
  if (recipe === 0) {
    layers.push({ t: "linear", from: base, to: shift(base, dir.dark ? 0.06 : -0.05), angle });
  } else if (recipe === 1) {
    layers.push({ t: "linear", from: shift(base, dir.dark ? -0.03 : 0.03), to: mid, angle: (angle + 90) % 360 });
  } else if (recipe === 2) {
    layers.push({ t: "conic", from: base, to: mid, x: dir.focal.x, y: dir.focal.y, opacity: 0.55 });
  } else {
    layers.push({ t: "linear", from: base, to: base, angle });
    layers.push({
      t: "band",
      color: mid,
      x: 0.5,
      y: rnd(),
      w: 1.6,
      h: mix(0.18, 0.55, rnd()),
      angle: mix(-20, 20, rnd()),
      opacity: 0.5,
    });
  }

  // key light
  const lx = 0.5 + Math.cos((angle * Math.PI) / 180) * 0.42;
  const ly = 0.5 - Math.sin((angle * Math.PI) / 180) * 0.42;
  layers.push({
    t: "radial",
    color: dir.dark ? accent : shift(accent, 0.25),
    x: lx,
    y: ly,
    r: mix(0.4, 0.95, dir.lighting.falloff),
    blur: mix(30, 140, dir.lighting.falloff),
    opacity: clamp(dir.lighting.intensity * (dir.dark ? 0.55 : 0.28)),
  });

  if (dir.device.glass > 0.35) {
    layers.push({
      t: "blob",
      color: mid,
      x: clamp(1 - dir.focal.x + (rnd() - 0.5) * 0.2, 0.05, 0.95),
      y: clamp(1 - dir.focal.y + (rnd() - 0.5) * 0.2, 0.05, 0.95),
      w: mix(0.4, 0.9, rnd()),
      h: mix(0.3, 0.8, rnd()),
      blur: mix(60, 180, rnd()),
      opacity: clamp(dir.device.glass * 0.55),
      rotate: rnd() * 180,
    });
  }
  if (dir.decor.dots || dir.decor.rules) {
    layers.push({
      t: "grid",
      color: dir.ink,
      size: Math.round(mix(38, 120, dir.negativeSpace)),
      opacity: clamp(dir.decor.intensity * 0.16),
    });
  }
  if (dir.decor.arcs) {
    layers.push({
      t: "ring",
      color: accent,
      x: dir.focal.x,
      y: dir.focal.y,
      r: mix(0.35, 0.75, rnd()),
      thickness: mix(1, 6, rnd()),
      opacity: clamp(dir.decor.intensity * 0.5),
    });
  }
  if (dir.decor.blocks && variant % 2 === 0) {
    layers.push({
      t: "stripes",
      color: accent,
      size: Math.round(mix(10, 40, rnd())),
      angle: Math.round(mix(0, 180, rnd())),
      opacity: clamp(dir.decor.intensity * 0.1),
    });
  }

  return { base, layers };
}

/* ---------------- occupancy-aware type placement ---------------- */

function placeText(ctx: Ctx, nodes: SceneNode[], desiredW: number, desiredH: number) {
  const CX = 24;
  const CY = 16;
  const grid = new Float32Array(CX * CY);
  const padX = 0.03;
  const padY = 0.03;
  for (const n of nodes) {
    const h = nodeH(ctx, n);
    const x0 = n.x - n.w / 2 - padX;
    const x1 = n.x + n.w / 2 + padX;
    const y0 = n.y - h / 2 - padY;
    const y1 = n.y + h / 2 + padY;
    for (let cy = 0; cy < CY; cy++) {
      for (let cx = 0; cx < CX; cx++) {
        const px = (cx + 0.5) / CX;
        const py = (cy + 0.5) / CY;
        if (px > x0 && px < x1 && py > y0 && py < y1) grid[cy * CX + cx] = 1;
      }
    }
  }

  // try the requested block, then progressively tighter ones, before giving up
  for (const [shrink, need] of [[1, 1], [0.85, 1], [0.7, 0.97], [0.55, 0.92]] as const) {
    const bw = Math.max(1, Math.round(desiredW * shrink * CX));
    const bh = Math.max(1, Math.round(desiredH * shrink * CY));
    let best = { x: -1, y: -1, w: desiredW * shrink, score: -1 };
    for (let cy = 0; cy + bh <= CY; cy++) {
      for (let cx = 0; cx + bw <= CX; cx++) {
        let free = 0;
        for (let y = cy; y < cy + bh; y++) for (let x = cx; x < cx + bw; x++) free += grid[y * CX + x] ? 0 : 1;
        const ratio = free / (bw * bh);
        if (ratio < need) continue;
        const px = (cx + bw / 2) / CX;
        const py = (cy + bh / 2) / CY;
        const dist = Math.hypot(px - ctx.dir.focal.x, py - ctx.dir.focal.y);
        const edgePull = 1 - Math.min(px, 1 - px, py, 1 - py);
        const score = ratio * 2 + dist * 1.1 - edgePull * 0.8;
        if (score > best.score) best = { x: cx / CX, y: cy / CY, w: bw / CX, score };
      }
    }
    if (best.score >= 0) return best;
  }
  // last resort: the emptiest corner
  return { x: ctx.dir.focal.x > 0.5 ? 0.04 : 0.55, y: 0.05, w: desiredW * 0.55, score: 0 };
}


/** Pushes any plane out of the reserved copy area so hierarchy always reads. */
function clearTypeZone(ctx: Ctx, nodes: SceneNode[], tx: number, ty: number, tw: number, th: number) {
  const pad = 0.025;
  const rx0 = tx - pad;
  const rx1 = tx + tw + pad;
  const ry0 = ty - pad;
  const ry1 = ty + th + pad;
  return nodes.map((n) => {
    const h = nodeH(ctx, n);
    const nx0 = n.x - n.w / 2;
    const nx1 = n.x + n.w / 2;
    const ny0 = n.y - h / 2;
    const ny1 = n.y + h / 2;
    const ox = Math.min(nx1, rx1) - Math.max(nx0, rx0);
    const oy = Math.min(ny1, ry1) - Math.max(ny0, ry0);
    if (ox <= 0 || oy <= 0) return n;
    const overlapArea = (ox * oy) / Math.max(1e-4, n.w * h);
    const shrink = clamp(1 - overlapArea * 0.35, 0.72, 1);
    // move along the cheapest axis
    const pushRight = rx1 - nx0;
    const pushLeft = nx1 - rx0;
    const pushDown = ry1 - ny0;
    const pushUp = ny1 - ry0;
    const best = Math.min(pushRight, pushLeft, pushDown, pushUp);
    let { x, y } = n;
    if (best === pushRight) x += pushRight;
    else if (best === pushLeft) x -= pushLeft;
    else if (best === pushDown) y += pushDown;
    else y -= pushUp;
    return {
      ...n,
      x: clamp(x, -0.12, 1.12),
      y: clamp(y, -0.06, 1.06),
      w: n.w * shrink,
    };
  });
}

/* ---------------- decorative language ---------------- */

function buildDecor(dir: ArtDirection, rnd: () => number, brand: Brand, textY: number): DecorItem[] {
  const out: DecorItem[] = [];
  const k = dir.decor.intensity;
  if (dir.decor.rules) {
    out.push({ t: "rule", x: dir.spacing.margin, y: clamp(textY - 0.035, 0.03, 0.95), w: mix(0.08, 0.3, rnd()), h: 0.002, angle: 0, color: dir.accent, opacity: 0.9 });
  }
  if (dir.decor.badges && brand.product) {
    out.push({ t: "badge", x: 1 - dir.spacing.margin - 0.14, y: dir.spacing.margin, w: 0.14, h: 0.05, angle: 0, color: dir.accent, opacity: 0.9, text: brand.product });
  }
  if (dir.decor.dots) {
    out.push({ t: "dot-grid", x: mix(0.02, 0.1, rnd()), y: mix(0.55, 0.82, rnd()), w: mix(0.1, 0.22, rnd()), h: mix(0.08, 0.2, rnd()), angle: 0, color: dir.ink, opacity: clamp(k * 0.5) });
  }
  if (dir.decor.blocks) {
    out.push({ t: "block", x: mix(0.02, 0.85, rnd()), y: mix(0.02, 0.85, rnd()), w: mix(0.04, 0.18, rnd()), h: mix(0.01, 0.08, rnd()), angle: rnd() > 0.7 ? 90 : 0, color: dir.accent, opacity: clamp(0.25 + k * 0.5) });
  }
  if (dir.decor.arcs) {
    out.push({ t: "arc", x: mix(0.6, 0.95, rnd()), y: mix(0.05, 0.4, rnd()), w: mix(0.1, 0.28, rnd()), h: mix(0.1, 0.28, rnd()), angle: rnd() * 360, color: dir.accent, opacity: clamp(k * 0.6) });
  }
  return out;
}

/* ---------------- composer ---------------- */

export function composeVariants(opts: {
  dir: ArtDirection;
  screens: Screen[];
  brand: Brand;
  output: OutputType;
  ratio: Ratio;
  count?: number;
  salt?: number;
}): Composition[] {
  const { dir, screens, brand, ratio } = opts;
  if (!screens.length) return [];
  const count = opts.count ?? 6;
  const sig = signatureOf(dir) + (opts.salt ?? 0) * 7919;
  const canvasRatio = ratio.h / ratio.w;

  // rank screens: the strongest asset leads the composition
  const ranked = [...screens]
    .map((s, i) => ({ s, k: Math.log(s.width * s.height + 1) + (s.kind === "desktop" ? 0.5 : 0) - i * 0.04 }))
    .sort((a, b) => b.k - a.k)
    .map((x) => x.s);

  // strategy order: weighted by the direction, deterministic per reference set,
  // then de-duplicated so every variant composes differently.
  const pick = rngFrom(sig);
  const order = STRATEGIES
    .filter((st) => ranked.length >= st.min)
    .map((st) => ({ st, r: st.weight(dir) * (0.5 + pick()) }))
    .sort((a, b) => b.r - a.r)
    .map((x) => x.st);
  const usable = order.length ? order : [STRATEGIES[0]!];

  return Array.from({ length: count }, (_, i) => {
    const rnd = rngFrom(sig + i * 104729);
    const st = usable[i % usable.length]!;

    // per-variant direction drift: hierarchy, air and perspective all shift
    const v: ArtDirection = {
      ...dir,
      focal: {
        x: clamp(dir.focal.x + (rnd() - 0.5) * 0.34, 0.16, 0.84),
        y: clamp(dir.focal.y + (rnd() - 0.5) * 0.26, 0.2, 0.8),
      },
      negativeSpace: clamp(dir.negativeSpace + (rnd() - 0.5) * 0.3, 0.12, 0.88),
      density: clamp(dir.density + (rnd() - 0.5) * 0.3),
      perspective: {
        tiltY: dir.perspective.tiltY * mix(0.35, 1.5, rnd()),
        tiltX: dir.perspective.tiltX * mix(0.2, 1.4, rnd()),
        roll: dir.perspective.roll * mix(-1, 1.4, rnd()),
      },
      bleed: clamp(dir.bleed * mix(0.5, 1.8, rnd())),
    };

    const rotation = i % Math.max(1, ranked.length);
    const pool = [...ranked.slice(rotation), ...ranked.slice(0, rotation)];
    const ctx: Ctx = { dir: v, screens, rnd, ratio: canvasRatio };
    const nodes = st.fn(ctx, pool).sort((a, b) => a.z - b.z);

    const { base, layers } = buildBackground(v, rnd, i);

    // typography treatment drifts per variant: scale, case, alignment, weight
    const typeScale = v.typography.scaleRatio * mix(0.75, 1.4, rnd());
    const align: "left" | "center" | "right" =
      rnd() < 0.25 ? "center" : v.typography.align === "center" ? (rnd() < 0.5 ? "left" : "center") : v.typography.align;
    const blockW = clamp(mix(0.26, 0.52, rnd()) * (align === "center" ? 1.4 : 1), 0.22, 0.72);
    const blockH = clamp(0.16 + typeScale * 0.12, 0.14, 0.42);
    const spot = placeText(ctx, nodes, blockW, blockH);
    const finalW = Math.max(0.18, spot.w);
    // narrow blocks get proportionally smaller type so copy never overruns
    const fittedScale = typeScale * clamp(0.55 + finalW * 1.2, 0.6, 1.15);

    const text = {
      show: Boolean(brand.headline || brand.sub || brand.product),
      x: clamp(spot.x + v.spacing.margin * 0.3, 0.03, 1 - finalW - 0.03),
      y: clamp(spot.y + v.spacing.margin * 0.3, 0.03, 0.9),
      w: finalW,
      align,
      font: v.typography.font,
      scale: fittedScale,

      tracking: v.typography.tracking + (rnd() - 0.5) * 0.03,
      weight: rnd() < 0.3 ? 400 : v.typography.weight,
      upper: rnd() < 0.3 ? !v.typography.upper : v.typography.upper,
      color: v.ink,
      accent: v.accent,
      kicker: brand.product,
    };

    // hierarchy pass: nothing is allowed to sit under the copy
    const laid = text.show ? clearTypeZone(ctx, nodes, text.x, text.y, finalW, blockH) : nodes;


    const device = {
      ...v.device,
      frame: rnd() < 0.22 ? !v.device.frame : v.device.frame,
      radius: clamp(v.device.radius * mix(0.6, 1.5, rnd()), 0, 40),
      shadow: clamp(v.device.shadow * mix(0.6, 1.4, rnd()), 0, 1.3),
      edgeLight: clamp(v.device.edgeLight * mix(0.4, 1.4, rnd())),
      glass: clamp(v.device.glass * mix(0.3, 1.4, rnd())),
    };

    return {
      id: `c${i + 1}-${st.name}-${(sig % 9973) + i}`,
      label: st.name.replace(/-/g, " "),
      seed: sig + i,
      arrangement: st.name,
      base,
      layers,
      grain: clamp(0.02 + v.decor.intensity * 0.1 + (v.dark ? 0.03 : 0)),
      vignette: clamp(v.dark ? 0.18 + v.lighting.falloff * 0.4 : v.lighting.falloff * 0.14),
      nodes: laid,
      decor: buildDecor(v, rnd, brand, text.y),
      text,
      device,
      tune: { scale: 1, spread: 1, tilt: 1 },
      notes: [
        `${st.name.replace(/-/g, " ")} · focal ${Math.round(v.focal.x * 100)}/${Math.round(v.focal.y * 100)}`,
        `${Math.round(v.negativeSpace * 100)}% air · ${nodes.length} plane${nodes.length > 1 ? "s" : ""} · tilt ${Math.round(v.perspective.tiltY)}°`,
        `type ${text.align}, ${text.upper ? "uppercase" : "sentence"}, ${Math.round(typeScale * 100)}%`,
      ],
    } satisfies Composition;
  });
}

export const bgCss = { withAlpha };
