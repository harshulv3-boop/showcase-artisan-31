/** Server-only client for the art-direction model. */

export type AiDirectorInput = {
  refs: {
    name: string;
    role: string;
    aspect: number;
    colors: string[];
    luminance: number;
    saturation: number;
    contrast: number;
    warmth: number;
    colorVariance: number;
    edgeDensity: number;
    symmetry: number;
    negativeSpace: number;
    focalX: number;
    focalY: number;
    bleed: number;
    lightAngle: number;
    lightIntensity: number;
    massSpread: number;
    clusters: number;
  }[];
  screens: { kind: string; aspect: number }[];
  brand: { product: string; headline: string; sub: string; accent: string; font: string };
  mood: string;
  output: string;
  variants: number;
};

const SYSTEM = `You are an award-winning art director for Dribbble-grade product showcase imagery.
You receive measured visual signals extracted from the user's reference images (their taste), plus the product screens and copy.
You must infer the DESIGN PRINCIPLES behind those references and art-direct ORIGINAL compositions in that taste.
Never reuse a stock template. Every variant must differ meaningfully in composition, arrangement, device treatment, background and typography.
Reply with STRICT JSON only, no prose, no markdown fences.`;

const SCHEMA = `{
  "direction": {
    "dark": boolean,
    "palette": ["#hex", ...4-8 ordered dark->light],
    "ink": "#hex",
    "accent": "#hex",
    "focal": { "x": 0..1, "y": 0..1 },
    "negativeSpace": 0..1,
    "symmetry": 0..1,
    "density": 0..1,
    "bleed": 0..1,
    "depthPlanes": 1..3,
    "perspective": { "tiltY": -30..30, "tiltX": -12..12, "roll": -14..14 },
    "lighting": { "angle": 0..360, "intensity": 0..1, "falloff": 0..1 },
    "spacing": { "margin": 0.03..0.16, "gutter": 0.01..0.08 },
    "typography": { "font": "grotesk|serif|mono|sans", "scaleRatio": 0.7..1.9, "tracking": -0.06..0.12, "weight": 400|500|600|700|800, "upper": boolean, "align": "left|center|right" },
    "device": { "frame": boolean, "bezel": "dark|light", "radius": 2..30, "shadow": 0..1, "edgeLight": 0..1, "glass": 0..1 },
    "decor": { "rules": boolean, "dots": boolean, "blocks": boolean, "badges": boolean, "arcs": boolean, "intensity": 0..1 },
    "notes": ["5 short art-direction observations about the reference taste"]
  },
  "variants": [
    { "arrangement": "solo|cascade|orbit|wall|mosaic|shear-stack|split-cluster|macro-crop",
      "label": "2-4 word name",
      "seed": integer,
      "overrides": { "focal": {"x":0..1,"y":0..1}, "density": 0..1, "negativeSpace": 0..1, "symmetry": 0..1,
                     "perspective": {"tiltY":-30..30,"tiltX":-12..12,"roll":-14..14},
                     "typography": {"align":"left|center|right","upper":boolean,"scaleRatio":0.7..1.9},
                     "device": {"frame":boolean,"shadow":0..1,"glass":0..1} },
      "note": "one line on why this composition fits the references" }
  ]
}`;

export async function artDirect(input: AiDirectorInput): Promise<unknown> {
  const key = process.env["SHOWCASE_AI_KEY"];
  const baseUrl = process.env["SHOWCASE_AI_BASE_URL"] ?? "https://api.surplusintelligence.ai/min70/v1";
  const model = process.env["SHOWCASE_AI_MODEL"] ?? "glm-5.2";
  if (!key) throw new Error("Missing SHOWCASE_AI_KEY");

  const user = `REFERENCE SIGNALS (measured from the user's reference images):
${JSON.stringify(input.refs, null, 1)}

PRODUCT SCREENS: ${JSON.stringify(input.screens)}
BRAND / COPY: ${JSON.stringify(input.brand)}
MOOD HINT (only if no references): ${input.mood}
OUTPUT FORMAT: ${input.output}
NUMBER OF VARIANTS REQUIRED: ${input.variants}

Return exactly this JSON shape:
${SCHEMA}`;

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
      temperature: 1,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI director ${res.status}: ${body.slice(0, 400)}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? "";
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("AI director returned no JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}
