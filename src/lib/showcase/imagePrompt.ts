export type RatioKey = "dribbble" | "wide" | "square" | "portrait";

export const RATIO_OPTIONS: { key: RatioKey; label: string; ratio: string; px: string }[] = [
  { key: "dribbble", label: "Dribbble shot 4:3", ratio: "4:3", px: "1600 x 1200" },
  { key: "wide", label: "Wide 16:9", ratio: "16:9", px: "1920 x 1080" },
  { key: "square", label: "Square 1:1", ratio: "1:1", px: "1400 x 1400" },
  { key: "portrait", label: "Portrait 4:5", ratio: "4:5", px: "1280 x 1600" },
];

export type MoodKey =
  | "dark-cinematic"
  | "clean-studio"
  | "vibrant-gradient"
  | "editorial-mono"
  | "glass-futurism"
  | "warm-organic";

export const MOOD_OPTIONS: { key: MoodKey; label: string; look: string }[] = [
  {
    key: "dark-cinematic",
    label: "Dark cinematic",
    look: "near-black graphite environment, single warm key light raking from one side, deep falloff, volumetric haze, rich contact shadows, subtle film grain",
  },
  {
    key: "clean-studio",
    label: "Clean studio",
    look: "bright seamless studio backdrop with a soft horizon, diffused softbox lighting, crisp neutral greys, delicate long shadows, lots of negative space",
  },
  {
    key: "vibrant-gradient",
    label: "Vibrant gradient",
    look: "saturated multi-stop mesh gradient backdrop, glowing bloom around devices, colored rim lights, soft chromatic bokeh",
  },
  {
    key: "editorial-mono",
    label: "Editorial mono",
    look: "off-white paper-toned backdrop, monochrome palette, strong typographic grid, hard directional shadow, print-editorial restraint",
  },
  {
    key: "glass-futurism",
    label: "Glass futurism",
    look: "dark blue-violet space with frosted glass planes, refraction, thin neon edge lighting, floating translucent panels, reflective floor",
  },
  {
    key: "warm-organic",
    label: "Warm organic",
    look: "sand and clay tones, sunlit window gobo shadows, soft dunes of gradient, tactile matte texture, golden hour warmth",
  },
];

const ART_DIRECTIONS = [
  "Extreme asymmetry: one hero device very large, cropped confidently by the canvas edge, with a smaller secondary screen floating far back in soft focus. Copy occupies the opposite third.",
  "Floating cluster in 3D space: three devices at different depths and rotations, tilted on two axes, casting layered shadows on each other, strong parallax and depth of field.",
  "Cinematic macro close-up: camera pushed in on one region of the interface at a raking angle, most of the device out of frame, dramatic specular highlight across the glass.",
  "Editorial diagonal: devices arranged along a rising diagonal axis with generous negative space, oversized headline sitting behind and partially occluded by the front device.",
  "Overlapping stack: screens overlapping like shuffled cards with consistent tilt, front-most sharp and lit, rear ones dimmed, tight crop with an off-center focal point.",
  "Perspective wall: an angled receding row of screens vanishing toward one side, one screen pulled forward out of the wall as the hero.",
  "Low-angle hero: camera below the device looking up, monumental scale, dramatic light from above, small supporting screen sitting on the floor plane with reflection.",
  "Split environment: canvas divided by a strong color/lighting break, hero device straddling the seam, secondary UI fragments floating as glass panels.",
];

export function buildShowcasePrompt(opts: {
  index: number;
  mood: { label: string; look: string };
  ratio: { ratio: string; px: string };
  headline?: string | undefined;
  sub?: string | undefined;
  product?: string | undefined;
  screenCount: number;
  refCount: number;
  extra?: string | undefined;
  seedShuffle: number;
}) {
  const dir = ART_DIRECTIONS[(opts.index + opts.seedShuffle) % ART_DIRECTIONS.length]!;
  const uiImages =
    opts.screenCount > 0
      ? `The first ${opts.screenCount} attached image(s) are the product UI screenshots. Render them EXACTLY as given — pixel-faithful, undistorted, legible, correct colors, no invented UI, no fake text, no re-drawing. Place them inside photoreal device mockups (or as floating glass screens) following the perspective.`
      : "Invent a plausible modern product UI.";
  const refImages =
    opts.refCount > 0
      ? `The final ${opts.refCount} attached image(s) are STYLE REFERENCES ONLY — borrow their composition language, device framing, lighting and typographic feel. Never copy their content or layout literally.`
      : "";

  return [
    `Create a premium Dribbble / Awwwards-quality product showcase image. Aspect ratio ${opts.ratio.ratio} (${opts.ratio.px}).`,
    `ART DIRECTION FOR THIS VARIATION: ${dir}`,
    `MOOD: ${opts.mood.label} — ${opts.mood.look}.`,
    uiImages,
    refImages,
    opts.headline
      ? `Typography: set the headline "${opts.headline}"${opts.sub ? ` with supporting line "${opts.sub}"` : ""} in a refined modern sans, tight tracking, perfect kerning, spelled exactly as written, integrated into the composition (never centered by default).`
      : "No headline text; let the composition carry the shot.",
    opts.product ? `Brand/product name: ${opts.product}.` : "",
    "Quality bar: photoreal device mockups with accurate bezels, screen glass reflections and rim light; realistic contact and cast shadows; believable depth-of-field; studio-grade gradient background derived from the product's own colors; subtle abstract environment elements (light streaks, soft blobs, grid or grain) that support and never clutter.",
    "Avoid: flat pasted screenshot on a plain gradient, centered default placement, clip-art icons, watermark, UI chrome of design tools, gibberish text, duplicated logos, cluttered stickers, low resolution.",
    opts.extra ? `Additional direction: ${opts.extra}` : "",
    "Output one finished, polished marketing image.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
