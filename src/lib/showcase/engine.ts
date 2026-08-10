import type { Brand, Composition, FontKey, OutputType, Ratio, Screen } from "./types";

export { analyseImage } from "./analysis";
export { deriveDirection } from "./direction";
export { composeVariants } from "./compose";
export { MOODS } from "./moods";

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

export const FONT_STACK: Record<FontKey, string> = {
  grotesk: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  sans: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
};

export function critique(comp: Composition, screens: Screen[], brand: Brand): string[] {
  const issues: string[] = [];
  const used = comp.nodes
    .map((n) => screens.find((s) => s.id === n.screenId))
    .filter((s): s is Screen => Boolean(s));
  comp.nodes.forEach((n) => {
    const s = used.find((x) => x.id === n.screenId);
    if (s && s.width < 900 && n.w > 0.55) issues.push(`${s.name} is low resolution for a placement this large`);
    if (n.x - n.w / 2 < -0.12 || n.x + n.w / 2 > 1.12) issues.push("A screen bleeds heavily off canvas — reduce spread");
  });
  if (comp.text.show && !brand.headline.trim()) issues.push("Headline is empty — hide copy or add a line");
  if (comp.text.show && brand.headline.length > 64) issues.push("Headline is long; shorten for readability");
  if (comp.vignette > 0.55) issues.push("Vignette may darken screen edges");
  if (comp.nodes.length > 6) issues.push("Many planes competing — consider fewer screens");
  return [...new Set(issues)];
}
