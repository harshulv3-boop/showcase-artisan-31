import type {
  Brand,
  Design,
  LayoutKey,
  OutputType,
  PresetKey,
  Ratio,
  Reference,
  Screen,
} from "./types";

export const RATIOS: Ratio[] = [
  { key: "dribbble", label: "Dribbble shot 4:3", w: 1600, h: 1200 },
  { key: "dribbble-thumb", label: "Dribbble thumbnail", w: 800, h: 600 },
  { key: "ph", label: "Product Hunt gallery", w: 1600, h: 900 },
  { key: "linkedin", label: "LinkedIn landscape", w: 1200, h: 627 },
  { key: "x", label: "X landscape", w: 1600, h: 900 },
  { key: "ig-square", label: "Instagram square", w: 1080, h: 1080 },
  { key: "ig-portrait", label: "Instagram portrait", w: 1080, h: 1350 },
  { key: "pinterest", label: "Pinterest portrait", w: 1000, h: 1500 },
  { key: "youtube", label: "YouTube thumbnail", w: 1280, h: 720 },
  { key: "cover", label: "Portfolio cover", w: 1400, h: 1050 },
];

export const OUTPUTS: { key: OutputType; label: string; hint: string }[] = [
  { key: "dribbble", label: "Dribbble shot", hint: "Presentation board for design communities" },
  { key: "app", label: "App showcase", hint: "Mobile screens, fans and stacks" },
  { key: "website", label: "Website showcase", hint: "Browser frames and responsive pairs" },
  { key: "product-hunt", label: "Product Hunt", hint: "Gallery sequence, 16:9" },
  { key: "portfolio", label: "Portfolio cover", hint: "Case-study hero and board" },
  { key: "social", label: "Social launch", hint: "Copy-led launch graphic" },
];

type PresetDef = {
  key: PresetKey;
  label: string;
  palette: [string, string, string];
  ink: string;
  frame: "dark" | "light";
  noise: number;
  vignette: number;
  backgrounds: Design["background"]["kind"][];
  fonts: Design["type"]["font"][];
  layouts: LayoutKey[];
};

export const PRESETS: PresetDef[] = [
  {
    key: "minimal-saas",
    label: "Minimal SaaS",
    palette: ["#f4f5f7", "#e7eaf0", "#2563eb"],
    ink: "#0b1120",
    frame: "light",
    noise: 0.03,
    vignette: 0.05,
    backgrounds: ["solid", "studio", "grid"],
    fonts: ["sans", "grotesk"],
    layouts: ["hero-center", "hero-support", "responsive-pair", "browser-dashboard"],
  },
  {
    key: "soft-gradient",
    label: "Soft Gradient",
    palette: ["#dfe7ff", "#ffe3ee", "#5b6bff"],
    ink: "#161a33",
    frame: "light",
    noise: 0.05,
    vignette: 0.08,
    backgrounds: ["mesh", "gradient", "radial-glow"],
    fonts: ["grotesk", "sans"],
    layouts: ["angled-hero", "phone-fan", "hero-support", "screen-grid"],
  },
  {
    key: "dark-cinematic",
    label: "Dark Cinematic",
    palette: ["#07080c", "#12151f", "#ff5a2c"],
    ink: "#f6f7fb",
    frame: "dark",
    noise: 0.1,
    vignette: 0.45,
    backgrounds: ["radial-glow", "studio", "grid"],
    fonts: ["grotesk", "mono"],
    layouts: ["angled-hero", "perspective-wall", "detail-crop", "hero-support"],
  },
  {
    key: "bold-editorial",
    label: "Bold Editorial",
    palette: ["#111111", "#f2f0ea", "#d7ff3e"],
    ink: "#f7f7f2",
    frame: "dark",
    noise: 0.07,
    vignette: 0.12,
    backgrounds: ["split-background" as never, "solid", "paper"],
    fonts: ["grotesk", "serif"],
    layouts: ["editorial-type", "split-background", "screen-grid", "detail-crop"],
  },
  {
    key: "mockup-3d",
    label: "3D Device Mockup",
    palette: ["#c9c6ff", "#eae8ff", "#3a2fd6"],
    ink: "#15123a",
    frame: "light",
    noise: 0.04,
    vignette: 0.14,
    backgrounds: ["studio", "radial-glow", "mesh"],
    fonts: ["grotesk", "sans"],
    layouts: ["angled-hero", "phone-fan", "perspective-wall", "hero-support"],
  },
  {
    key: "futuristic",
    label: "Futuristic Technical",
    palette: ["#05070a", "#0c1622", "#3ef0c4"],
    ink: "#e6fff8",
    frame: "dark",
    noise: 0.09,
    vignette: 0.3,
    backgrounds: ["grid", "radial-glow", "studio"],
    fonts: ["mono", "grotesk"],
    layouts: ["browser-dashboard", "perspective-wall", "detail-crop", "screen-grid"],
  },
  {
    key: "playful",
    label: "Playful Consumer",
    palette: ["#ffd166", "#ff7a5c", "#1b1b3a"],
    ink: "#1b1b3a",
    frame: "dark",
    noise: 0.04,
    vignette: 0.06,
    backgrounds: ["gradient", "mesh", "solid"],
    fonts: ["grotesk", "sans"],
    layouts: ["phone-fan", "screen-grid", "hero-support", "split-background"],
  },
  {
    key: "premium",
    label: "Premium Luxury",
    palette: ["#14110f", "#241f1a", "#c8a86b"],
    ink: "#f5efe6",
    frame: "dark",
    noise: 0.08,
    vignette: 0.35,
    backgrounds: ["studio", "radial-glow", "paper"],
    fonts: ["serif", "grotesk"],
    layouts: ["hero-center", "angled-hero", "detail-crop", "editorial-type"],
  },
  {
    key: "brutalist",
    label: "Brutalist Poster",
    palette: ["#e8e6df", "#111111", "#ff3b1f"],
    ink: "#111111",
    frame: "dark",
    noise: 0.06,
    vignette: 0.05,
    backgrounds: ["solid", "grid", "paper"],
    fonts: ["mono", "grotesk"],
    layouts: ["editorial-type", "screen-grid", "split-background", "hero-center"],
  },
  {
    key: "monochrome",
    label: "Monochrome",
    palette: ["#101012", "#26262b", "#dcdce2"],
    ink: "#f2f2f5",
    frame: "dark",
    noise: 0.07,
    vignette: 0.28,
    backgrounds: ["studio", "grid", "radial-glow"],
    fonts: ["grotesk", "mono"],
    layouts: ["hero-center", "perspective-wall", "hero-support", "detail-crop"],
  },
  {
    key: "glass",
    label: "Glass / Glossy",
    palette: ["#0a1a2f", "#123a5c", "#7ad7ff"],
    ink: "#eaf6ff",
    frame: "dark",
    noise: 0.05,
    vignette: 0.25,
    backgrounds: ["mesh", "radial-glow", "gradient"],
    fonts: ["grotesk", "sans"],
    layouts: ["angled-hero", "hero-support", "phone-fan", "browser-dashboard"],
  },
];

export const FONT_STACK: Record<Design["type"]["font"], string> = {
  grotesk: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  sans: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
};

export const LAYOUT_LABELS: Record<LayoutKey, string> = {
  "hero-center": "Single centered screen",
  "angled-hero": "Angled hero device",
  "hero-support": "Hero + supporting screens",
  "phone-fan": "Three-device fan",
  "browser-dashboard": "Browser window presentation",
  "responsive-pair": "Desktop + mobile pair",
  "screen-grid": "Screen grid collage",
  "editorial-type": "Oversized typography",
  "split-background": "Split background",
  "perspective-wall": "Perspective screen wall",
  "detail-crop": "Dashboard close-up crop",
};

/* ---------- reference analysis (local, canvas based) ---------- */

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export async function analyseImage(url: string): Promise<{
  colors: string[];
  luminance: number;
  saturation: number;
  width: number;
  height: number;
}> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await img.decode();
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  let lum = 0;
  let sat = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    lum += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    sat += max === 0 ? 0 : (max - min) / max;
    count++;
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.n += 1;
    buckets.set(key, bucket);
  }
  const colors = [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, 6)
    .map((b) => rgbToHex(Math.round(b.r / b.n), Math.round(b.g / b.n), Math.round(b.b / b.n)));
  return {
    colors,
    luminance: lum / count,
    saturation: sat / count,
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}

export type StyleProfile = {
  composition: string;
  color_palette: string[];
  background_treatment: string;
  typography_style: string;
  screen_arrangement: string;
  device_treatment: string;
  perspective: string;
  lighting: string;
  shadow_style: string;
  depth: string;
  texture: string;
  density: string;
  decorative_language: string;
  image_crop_style: string;
  overall_mood: string;
};

export function buildStyleProfile(refs: Reference[], preset: PresetDef): StyleProfile | null {
  if (!refs.length) return null;
  const lum = refs.reduce((a, r) => a + r.luminance, 0) / refs.length;
  const sat = refs.reduce((a, r) => a + r.saturation, 0) / refs.length;
  const dark = lum < 0.45;
  const vivid = sat > 0.35;
  const palette = dedupe(refs.flatMap((r) => r.colors)).slice(0, 6);
  const roles = refs.map((r) => r.role).filter((r) => r !== "auto");
  return {
    composition: refs.length > 2 ? "multi-screen board with a dominant focal screen" : "single focal composition with generous negative space",
    color_palette: palette,
    background_treatment: dark
      ? "deep tonal backdrop with directional glow"
      : vivid
        ? "saturated mesh gradient field"
        : "soft neutral studio backdrop",
    typography_style: vivid ? "confident display type, tight tracking" : "restrained grotesk with quiet hierarchy",
    screen_arrangement: refs.length > 2 ? "layered stack, hero forward" : "centered hero, supporting screens behind",
    device_treatment: dark ? "dark bezel frames with reflective edge" : "clean light frames, thin bezels",
    perspective: dark || vivid ? "slight three-quarter tilt" : "flat frontal",
    lighting: dark ? "single key light, high falloff" : "even diffuse light",
    shadow_style: dark ? "long soft ambient shadow" : "short contact shadow",
    depth: refs.length > 2 ? "three planes: backdrop, support, hero" : "two planes",
    texture: dark ? "fine grain" : "clean, minimal grain",
    density: refs.length > 3 ? "dense editorial" : "airy",
    decorative_language: vivid ? "accent blocks and rules" : "minimal rules and labels",
    image_crop_style: "full screens, safe-area preserved",
    overall_mood: `${dark ? "cinematic" : "bright"} · ${vivid ? "expressive" : "understated"} · ${preset.label.toLowerCase()}${roles.length ? ` · guided by ${dedupe(roles).join(", ")}` : ""}`,
  };
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/* ---------- variant generation ---------- */

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function layoutsFor(output: OutputType, preset: PresetDef, screens: Screen[]): LayoutKey[] {
  const mobiles = screens.filter((s) => s.kind === "mobile").length;
  const wides = screens.length - mobiles;
  let pool = [...preset.layouts];
  if (output === "app") pool = ["phone-fan", "angled-hero", "hero-support", "screen-grid", "perspective-wall", "hero-center"];
  if (output === "website") pool = ["browser-dashboard", "responsive-pair", "angled-hero", "screen-grid", "detail-crop", "hero-center"];
  if (output === "portfolio") pool = ["editorial-type", "hero-support", "screen-grid", "split-background", "angled-hero"];
  if (output === "social") pool = ["editorial-type", "split-background", "hero-center", "detail-crop"];
  if (output === "product-hunt") pool = ["hero-center", "detail-crop", "hero-support", "browser-dashboard", "responsive-pair", "screen-grid"];
  if (!mobiles) pool = pool.filter((l) => l !== "phone-fan" && l !== "responsive-pair");
  if (!wides) pool = pool.filter((l) => l !== "browser-dashboard" && l !== "responsive-pair");
  if (screens.length < 3) pool = pool.filter((l) => l !== "screen-grid" && l !== "perspective-wall" && l !== "phone-fan");
  if (screens.length < 2) pool = pool.filter((l) => l !== "hero-support" && l !== "responsive-pair");
  return dedupe(pool.length ? pool : ["hero-center"]);
}

export function pickHeroOrder(screens: Screen[]): Screen[] {
  // "smart screen selection": widest aspect / largest pixel area reads strongest,
  // then alternate to maximise visual variety.
  const scored = screens.map((s, i) => ({
    s,
    score: Math.log(s.width * s.height + 1) + (s.kind === "desktop" ? 0.6 : 0) - i * 0.05,
  }));
  return scored.sort((a, b) => b.score - a.score).map((x) => x.s);
}

export function generateDesigns(opts: {
  screens: Screen[];
  refs: Reference[];
  brand: Brand;
  output: OutputType;
  preset: PresetKey;
  strength: "subtle" | "balanced" | "strong";
  count?: number;
}): Design[] {
  const preset = PRESETS.find((p) => p.key === opts.preset) ?? PRESETS[0]!;
  const profile = buildStyleProfile(opts.refs, preset);
  const refColors = dedupe(opts.refs.flatMap((r) => r.colors));
  const weight = opts.strength === "strong" ? 1 : opts.strength === "balanced" ? 0.6 : 0.25;
  const ordered = pickHeroOrder(opts.screens);
  const layouts = layoutsFor(opts.output, preset, opts.screens);
  const count = opts.count ?? Math.min(6, Math.max(4, layouts.length));
  const rand = mulberry(opts.screens.length * 977 + opts.refs.length * 31 + preset.key.length);

  const refDark = opts.refs.length ? opts.refs.reduce((a, r) => a + r.luminance, 0) / opts.refs.length < 0.45 : null;

  return Array.from({ length: count }, (_, i) => {
    const layout = layouts[i % layouts.length]!;
    const bgKinds = preset.backgrounds.filter((b) => b !== ("split-background" as never));
    const bgKind = layout === "split-background" ? "solid" : bgKinds[i % bgKinds.length]!;
    const useRef = refColors.length > 0 && rand() < 0.4 + weight * 0.6;
    const from = useRef ? refColors[i % refColors.length]! : preset.palette[0];
    const to = useRef ? refColors[(i + 2) % refColors.length]! : preset.palette[1];
    const glow = useRef && refColors.length > 2 ? refColors[(i + 4) % refColors.length]! : preset.palette[2];
    const ink = refDark === null ? preset.ink : refDark ? "#f6f7fb" : preset.ink;

    const screenIds =
      layout === "hero-center" || layout === "angled-hero" || layout === "detail-crop"
        ? ordered.slice(0, 1).map((s) => s.id)
        : layout === "responsive-pair"
          ? dedupe([
              ordered.find((s) => s.kind !== "mobile")?.id ?? ordered[0]!.id,
              ordered.find((s) => s.kind === "mobile")?.id ?? ordered[1]?.id ?? ordered[0]!.id,
            ])
          : layout === "screen-grid" || layout === "perspective-wall"
            ? ordered.slice(0, Math.min(6, ordered.length)).map((s) => s.id)
            : ordered.slice(0, Math.min(3, ordered.length)).map((s) => s.id);

    return {
      id: `v${i + 1}-${layout}`,
      label: LAYOUT_LABELS[layout],
      layout,
      background: {
        kind: bgKind,
        from,
        to,
        glow,
        noise: preset.noise + (i % 2) * 0.02,
        vignette: preset.vignette,
        angle: [135, 200, 45, 320, 90, 250][i % 6]!,
      },
      device: {
        frame: layout !== "detail-crop" && !(layout === "editorial-type" && i % 2 === 1),
        bezel: preset.frame,
        perspective: layout === "angled-hero" || layout === "perspective-wall" ? 12 + (i % 3) * 4 : layout === "phone-fan" ? 6 : 0,
        rotate: layout === "angled-hero" ? -8 + (i % 3) * 4 : 0,
        scale: 1,
        shadow: preset.key === "brutalist" ? 0.2 : 0.7,
        radius: preset.key === "brutalist" ? 2 : 18,
      },
      type: {
        font: opts.brand.font ?? preset.fonts[i % preset.fonts.length]!,
        size: layout === "editorial-type" ? 1.55 : layout === "detail-crop" ? 0.9 : 1,
        align: layout === "hero-center" || layout === "phone-fan" ? "center" : "left",
        show: true,
        color: ink,
        accent: opts.brand.accent || glow,
      },
      screenIds,
      notes: profile
        ? [profile.composition, profile.background_treatment, profile.lighting]
        : [LAYOUT_LABELS[layout], `${preset.label} direction`],
    } satisfies Design;
  });
}

/* ---------- quality critic ---------- */

export function critique(design: Design, screens: Screen[], brand: Brand): string[] {
  const issues: string[] = [];
  const used = screens.filter((s) => design.screenIds.includes(s.id));
  used.forEach((s) => {
    if (s.width < 600 && s.kind !== "mobile") issues.push(`${s.name} is low resolution for a large placement`);
  });
  if (design.type.show && !brand.headline.trim()) issues.push("Headline is empty — hide copy or add a line");
  if (design.type.show && brand.headline.length > 64) issues.push("Headline is long; shorten for readability");
  if (design.layout === "screen-grid" && used.length < 3) issues.push("Grid layout works best with 3+ screens");
  if (design.background.vignette > 0.5) issues.push("Vignette may darken screen edges");
  return issues;
}
