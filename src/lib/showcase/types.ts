export type ScreenKind = "mobile" | "desktop" | "tablet";

export type Screen = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  kind: ScreenKind;
};

export type ReferenceRole =
  | "auto"
  | "art-direction"
  | "composition"
  | "background"
  | "device"
  | "typography"
  | "palette"
  | "lighting"
  | "arrangement";

/** Raw visual signals measured from a reference image. */
export type RefSignals = {
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
  width: number;
  height: number;
  aspect: number;
};

export type Reference = {
  id: string;
  name: string;
  url: string;
  role: ReferenceRole;
  signals: RefSignals;
};

export type FontKey = "grotesk" | "serif" | "mono" | "sans";

export type Brand = {
  product: string;
  headline: string;
  sub: string;
  cta: string;
  logo: string | null;
  primary: string;
  accent: string;
  font: FontKey | "auto";
};

export type OutputType =
  | "dribbble"
  | "product-hunt"
  | "portfolio"
  | "website"
  | "app"
  | "social";

export type PresetKey =
  | "minimal-saas"
  | "soft-gradient"
  | "dark-cinematic"
  | "bold-editorial"
  | "mockup-3d"
  | "futuristic"
  | "playful"
  | "premium"
  | "brutalist"
  | "monochrome"
  | "glass";

/** Design principles distilled from the references — never a template. */
export type ArtDirection = {
  dark: boolean;
  palette: string[];
  ink: string;
  accent: string;
  focal: { x: number; y: number };
  negativeSpace: number;
  symmetry: number;
  density: number;
  bleed: number;
  depthPlanes: number;
  perspective: { tiltY: number; tiltX: number; roll: number };
  lighting: { angle: number; intensity: number; falloff: number };
  spacing: { margin: number; gutter: number };
  typography: {
    font: FontKey;
    scaleRatio: number;
    tracking: number;
    weight: number;
    upper: boolean;
    align: "left" | "center" | "right";
  };
  device: {
    frame: boolean;
    bezel: "dark" | "light";
    radius: number;
    shadow: number;
    edgeLight: number;
    glass: number;
  };
  decor: {
    rules: boolean;
    dots: boolean;
    blocks: boolean;
    badges: boolean;
    arcs: boolean;
    intensity: number;
  };
  notes: string[];
};

export type BgLayer =
  | { t: "linear"; from: string; to: string; angle: number }
  | { t: "radial"; color: string; x: number; y: number; r: number; blur: number; opacity: number }
  | { t: "conic"; from: string; to: string; x: number; y: number; opacity: number }
  | { t: "grid"; color: string; size: number; opacity: number }
  | { t: "stripes"; color: string; size: number; angle: number; opacity: number }
  | { t: "blob"; color: string; x: number; y: number; w: number; h: number; blur: number; opacity: number; rotate: number }
  | { t: "ring"; color: string; x: number; y: number; r: number; thickness: number; opacity: number }
  | { t: "band"; color: string; x: number; y: number; w: number; h: number; angle: number; opacity: number };

export type DecorItem = {
  t: "rule" | "dot-grid" | "block" | "badge" | "arc" | "caption";
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  color: string;
  opacity: number;
  text?: string;
};

export type SceneNode = {
  id: string;
  screenId: string;
  /** centre position, fraction of canvas */
  x: number;
  y: number;
  /** width as fraction of canvas width */
  w: number;
  rotate: number;
  tiltY: number;
  tiltX: number;
  z: number;
  opacity: number;
  blur: number;
  frame: boolean;
  crop: null | { scale: number; ox: number; oy: number; ratio: number };
};

export type TextBlock = {
  show: boolean;
  x: number;
  y: number;
  w: number;
  align: "left" | "center" | "right";
  font: FontKey;
  scale: number;
  tracking: number;
  weight: number;
  upper: boolean;
  color: string;
  accent: string;
  kicker: string;
};

export type Composition = {
  id: string;
  label: string;
  seed: number;
  arrangement: string;
  base: string;
  layers: BgLayer[];
  grain: number;
  vignette: number;
  nodes: SceneNode[];
  decor: DecorItem[];
  text: TextBlock;
  device: ArtDirection["device"];
  tune: { scale: number; spread: number; tilt: number };
  notes: string[];
};

export type Ratio = {
  key: string;
  label: string;
  w: number;
  h: number;
};

/** Art direction returned by the AI director (all fields optional/partial). */
export type AiVariantPlan = {
  arrangement?: string;
  label?: string;
  seed?: number;
  note?: string;
  overrides?: {
    focal?: { x?: number; y?: number };
    density?: number;
    negativeSpace?: number;
    symmetry?: number;
    perspective?: { tiltY?: number; tiltX?: number; roll?: number };
    typography?: { align?: "left" | "center" | "right"; upper?: boolean; scaleRatio?: number };
    device?: { frame?: boolean; shadow?: number; glass?: number };
  };
};

export type AiPlan = {
  direction?: Partial<ArtDirection> & { typography?: Partial<ArtDirection["typography"]>; device?: Partial<ArtDirection["device"]>; decor?: Partial<ArtDirection["decor"]>; lighting?: Partial<ArtDirection["lighting"]>; perspective?: Partial<ArtDirection["perspective"]>; spacing?: Partial<ArtDirection["spacing"]>; focal?: Partial<ArtDirection["focal"]> };
  variants?: AiVariantPlan[];
};
