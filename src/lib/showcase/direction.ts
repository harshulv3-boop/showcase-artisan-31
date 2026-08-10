import type { AiPlan, ArtDirection, Brand, FontKey, PresetKey, Reference } from "./types";
import { MOODS } from "./moods";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)] as const;
}
export function lumOf(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
export function satOf(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}
export function shift(hex: string, amount: number) {
  const [r, g, b] = hexToRgb(hex);
  const f = (v: number) => Math.round(clamp(v + amount * 255, 0, 255));
  return "#" + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, "0")).join("");
}
export function withAlpha(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

/** role weights: a reference tagged "typography" mostly influences type, etc. */
const ROLE_WEIGHTS: Record<string, Partial<Record<string, number>>> = {
  auto: {},
  "art-direction": { all: 1.3 },
  composition: { composition: 2.4 },
  background: { background: 2.6 },
  device: { device: 2.6 },
  typography: { typography: 2.8 },
  palette: { color: 3 },
  lighting: { lighting: 2.8 },
  arrangement: { composition: 2 },
};

function weightFor(ref: Reference, channel: string) {
  const map = ROLE_WEIGHTS[ref.role] ?? {};
  return (map[channel] ?? map["all"] ?? 1) as number;
}

function avg(refs: Reference[], channel: string, pick: (r: Reference) => number) {
  let sum = 0;
  let wsum = 0;
  for (const r of refs) {
    const w = weightFor(r, channel);
    sum += pick(r) * w;
    wsum += w;
  }
  return wsum ? sum / wsum : 0;
}

/**
 * Turns measured reference signals into explicit design principles.
 * With no references we fall back to a mood (never a layout).
 */
export function deriveDirection(refs: Reference[], brand: Brand, mood: PresetKey): ArtDirection {
  const fallback = MOODS.find((m) => m.key === mood) ?? MOODS[0]!;

  if (!refs.length) {
    return synthetic(fallback, brand);
  }

  const lum = avg(refs, "lighting", (r) => r.signals.luminance);
  const sat = avg(refs, "color", (r) => r.signals.saturation);
  const contrast = avg(refs, "lighting", (r) => r.signals.contrast);
  const edge = avg(refs, "composition", (r) => r.signals.edgeDensity);
  const negative = avg(refs, "composition", (r) => r.signals.negativeSpace);
  const symmetry = avg(refs, "composition", (r) => r.signals.symmetry);
  const focalX = avg(refs, "composition", (r) => r.signals.focalX);
  const focalY = avg(refs, "composition", (r) => r.signals.focalY);
  const bleed = avg(refs, "composition", (r) => r.signals.bleed);
  const spread = avg(refs, "composition", (r) => r.signals.massSpread);
  const clusters = avg(refs, "composition", (r) => r.signals.clusters);
  const lightAngle = avg(refs, "lighting", (r) => r.signals.lightAngle);
  const lightIntensity = avg(refs, "lighting", (r) => r.signals.lightIntensity);
  const warmth = avg(refs, "color", (r) => r.signals.warmth);
  const colorVar = avg(refs, "color", (r) => r.signals.colorVariance);

  const dark = lum < 0.46;

  // palette: strongest colours across references, ordered dark → light
  const pool = refs
    .flatMap((r) => r.signals.colors.map((c) => ({ c, w: weightFor(r, "color") })))
    .sort((a, b) => b.w - a.w)
    .map((x) => x.c);
  const palette = [...new Set(pool)].sort((a, b) => lumOf(a) - lumOf(b)).slice(0, 8);
  const accentCandidates = [...new Set(pool)].sort((a, b) => satOf(b) * 1.2 + Math.abs(lumOf(b) - lum) - (satOf(a) * 1.2 + Math.abs(lumOf(a) - lum)));
  const accent = brand.accent || accentCandidates[0] || fallback.palette[2];
  const ink = dark ? shift(palette[palette.length - 1] ?? "#ffffff", 0.35) : shift(palette[0] ?? "#101014", -0.3);

  const density = clamp(edge * 0.55 + (1 - negative) * 0.45 + clusters / 16 * 0.25);
  const perspectiveEnergy = clamp((1 - symmetry) * 0.7 + spread * 0.5);

  const font: FontKey =
    (brand.font !== "auto" ? brand.font : null) ??
    (edge > 0.55 && sat < 0.3 ? "mono" : contrast > 0.26 && sat < 0.22 ? "serif" : sat > 0.4 ? "grotesk" : "sans");

  return {
    dark,
    palette: palette.length ? palette : [...fallback.palette],
    ink,
    accent,
    focal: { x: clamp(mix(0.5, focalX, 0.8), 0.24, 0.76), y: clamp(mix(0.5, focalY, 0.7), 0.28, 0.74) },
    negativeSpace: clamp(negative, 0.15, 0.86),
    symmetry: clamp(symmetry),
    density,
    bleed: clamp(bleed * 1.15),
    depthPlanes: clusters > 8 ? 3 : clusters > 4 ? 2 : 1,
    perspective: {
      tiltY: perspectiveEnergy * 22 * (focalX > 0.5 ? -1 : 1),
      tiltX: perspectiveEnergy * 7,
      roll: (1 - symmetry) * 10 - 3,
    },
    lighting: {
      angle: Number.isFinite(lightAngle) ? lightAngle : 120,
      intensity: clamp(lightIntensity * 0.9 + contrast * 0.6, 0.1, 1),
      falloff: clamp(0.3 + contrast * 1.6),
    },
    spacing: { margin: mix(0.045, 0.13, negative), gutter: mix(0.015, 0.06, negative) },
    typography: {
      font,
      scaleRatio: mix(0.82, 1.7, clamp(contrast * 1.2 + (1 - density) * 0.5)),
      tracking: sat > 0.4 ? -0.03 : edge > 0.5 ? 0.08 : -0.015,
      weight: contrast > 0.3 ? 700 : sat > 0.35 ? 600 : 500,
      upper: edge > 0.52 || (sat < 0.18 && contrast > 0.3),
      align: symmetry > 0.62 ? "center" : focalX > 0.55 ? "left" : "right",
    },
    device: {
      frame: density < 0.72,
      bezel: dark ? "dark" : "light",
      radius: mix(4, 26, clamp(1 - edge)),
      shadow: clamp(0.25 + contrast * 1.5 + (dark ? 0.25 : 0)),
      edgeLight: dark ? clamp(lightIntensity) : clamp(lightIntensity * 0.4),
      glass: clamp(colorVar * 0.8 + sat * 0.4) * (dark ? 1 : 0.6),
    },
    decor: {
      rules: edge > 0.42,
      dots: edge > 0.5 && sat < 0.45,
      blocks: sat > 0.36 || colorVar > 0.5,
      badges: density > 0.45,
      arcs: sat > 0.3 && symmetry < 0.6,
      intensity: clamp(density * 0.8 + colorVar * 0.4),
    },
    notes: [
      `${dark ? "Low-key" : "High-key"} field · light from ${Math.round(((lightAngle % 360) + 360) % 360)}°`,
      `Focal mass at ${Math.round(focalX * 100)}% / ${Math.round(focalY * 100)}%, ${Math.round(negative * 100)}% negative space`,
      `${density > 0.6 ? "Dense editorial" : density > 0.35 ? "Measured" : "Airy"} density · ${clusters > 8 ? "multi-cluster" : clusters > 4 ? "two-cluster" : "single-cluster"} arrangement`,
      `${symmetry > 0.62 ? "Symmetric" : "Asymmetric"} balance · ${perspectiveEnergy > 0.5 ? "three-quarter perspective" : "frontal planes"}`,
      `Type: ${font}, ${warmth > 0.05 ? "warm" : warmth < -0.05 ? "cool" : "neutral"} palette, ${colorVar > 0.5 ? "polychrome" : "restrained"}`,
    ],
  };
}

function synthetic(m: (typeof MOODS)[number], brand: Brand): ArtDirection {
  const dark = m.dark;
  return {
    dark,
    palette: [...m.palette],
    ink: m.ink,
    accent: brand.accent || m.palette[2]!,
    focal: { x: 0.5, y: 0.52 },
    negativeSpace: m.air,
    symmetry: m.symmetry,
    density: 1 - m.air,
    bleed: 0.12,
    depthPlanes: 2,
    perspective: { tiltY: m.tilt, tiltX: m.tilt * 0.3, roll: 0 },
    lighting: { angle: 115, intensity: dark ? 0.8 : 0.4, falloff: dark ? 0.7 : 0.3 },
    spacing: { margin: mix(0.05, 0.12, m.air), gutter: mix(0.02, 0.05, m.air) },
    typography: {
      font: brand.font !== "auto" ? brand.font : m.font,
      scaleRatio: m.typeScale,
      tracking: m.font === "mono" ? 0.06 : -0.02,
      weight: 600,
      upper: m.font === "mono",
      align: m.symmetry > 0.6 ? "center" : "left",
    },
    device: {
      frame: true,
      bezel: dark ? "dark" : "light",
      radius: m.radius,
      shadow: dark ? 0.85 : 0.5,
      edgeLight: dark ? 0.6 : 0.2,
      glass: m.glass,
    },
    decor: { rules: true, dots: false, blocks: m.key === "brutalist", badges: false, arcs: false, intensity: 0.4 },
    notes: [`No references attached — art-directed from the "${m.label}" mood.`],
  };
}

/** Merge the AI director's principles over the measured baseline. */
export function applyAiDirection(base: ArtDirection, ai: AiPlan["direction"] | undefined): ArtDirection {
  if (!ai) return base;
  const num = (v: unknown, fb: number, lo = -Infinity, hi = Infinity) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fb;
  const bool = (v: unknown, fb: boolean) => (typeof v === "boolean" ? v : fb);
  const hex = (v: unknown, fb: string) => (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v) ? v : fb);

  const palette = Array.isArray(ai.palette)
    ? ai.palette.filter((c): c is string => typeof c === "string" && /^#[0-9a-f]{3,8}$/i.test(c))
    : [];

  return {
    ...base,
    dark: bool(ai.dark, base.dark),
    palette: palette.length >= 3 ? palette.slice(0, 8) : base.palette,
    ink: hex(ai.ink, base.ink),
    accent: hex(ai.accent, base.accent),
    focal: {
      x: num(ai.focal?.x, base.focal.x, 0.12, 0.88),
      y: num(ai.focal?.y, base.focal.y, 0.14, 0.86),
    },
    negativeSpace: num(ai.negativeSpace, base.negativeSpace, 0.08, 0.92),
    symmetry: num(ai.symmetry, base.symmetry, 0, 1),
    density: num(ai.density, base.density, 0, 1),
    bleed: num(ai.bleed, base.bleed, 0, 1),
    depthPlanes: Math.round(num(ai.depthPlanes, base.depthPlanes, 1, 3)),
    perspective: {
      tiltY: num(ai.perspective?.tiltY, base.perspective.tiltY, -32, 32),
      tiltX: num(ai.perspective?.tiltX, base.perspective.tiltX, -14, 14),
      roll: num(ai.perspective?.roll, base.perspective.roll, -16, 16),
    },
    lighting: {
      angle: num(ai.lighting?.angle, base.lighting.angle, 0, 360),
      intensity: num(ai.lighting?.intensity, base.lighting.intensity, 0, 1),
      falloff: num(ai.lighting?.falloff, base.lighting.falloff, 0, 1),
    },
    spacing: {
      margin: num(ai.spacing?.margin, base.spacing.margin, 0.02, 0.18),
      gutter: num(ai.spacing?.gutter, base.spacing.gutter, 0.005, 0.09),
    },
    typography: {
      font: (["grotesk", "serif", "mono", "sans"] as const).includes(ai.typography?.font as FontKey)
        ? (ai.typography!.font as FontKey)
        : base.typography.font,
      scaleRatio: num(ai.typography?.scaleRatio, base.typography.scaleRatio, 0.6, 2),
      tracking: num(ai.typography?.tracking, base.typography.tracking, -0.08, 0.16),
      weight: num(ai.typography?.weight, base.typography.weight, 300, 900),
      upper: bool(ai.typography?.upper, base.typography.upper),
      align: (["left", "center", "right"] as const).includes(ai.typography?.align as "left")
        ? (ai.typography!.align as "left" | "center" | "right")
        : base.typography.align,
    },
    device: {
      frame: bool(ai.device?.frame, base.device.frame),
      bezel: ai.device?.bezel === "light" || ai.device?.bezel === "dark" ? ai.device.bezel : base.device.bezel,
      radius: num(ai.device?.radius, base.device.radius, 0, 40),
      shadow: num(ai.device?.shadow, base.device.shadow, 0, 1.3),
      edgeLight: num(ai.device?.edgeLight, base.device.edgeLight, 0, 1),
      glass: num(ai.device?.glass, base.device.glass, 0, 1),
    },
    decor: {
      rules: bool(ai.decor?.rules, base.decor.rules),
      dots: bool(ai.decor?.dots, base.decor.dots),
      blocks: bool(ai.decor?.blocks, base.decor.blocks),
      badges: bool(ai.decor?.badges, base.decor.badges),
      arcs: bool(ai.decor?.arcs, base.decor.arcs),
      intensity: num(ai.decor?.intensity, base.decor.intensity, 0, 1),
    },
    notes: Array.isArray(ai.notes) && ai.notes.length
      ? ai.notes.filter((n): n is string => typeof n === "string").slice(0, 6)
      : base.notes,
  };
}
