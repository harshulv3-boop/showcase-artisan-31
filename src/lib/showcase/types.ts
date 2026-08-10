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

export type Reference = {
  id: string;
  name: string;
  url: string;
  role: ReferenceRole;
  colors: string[];
  luminance: number;
  saturation: number;
};

export type Brand = {
  product: string;
  headline: string;
  sub: string;
  cta: string;
  logo: string | null;
  primary: string;
  accent: string;
  font: FontKey;
};

export type FontKey = "grotesk" | "serif" | "mono" | "sans";

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

export type LayoutKey =
  | "hero-center"
  | "angled-hero"
  | "hero-support"
  | "phone-fan"
  | "browser-dashboard"
  | "responsive-pair"
  | "screen-grid"
  | "editorial-type"
  | "split-background"
  | "perspective-wall"
  | "detail-crop";

export type BackgroundKind =
  | "solid"
  | "gradient"
  | "mesh"
  | "radial-glow"
  | "studio"
  | "grid"
  | "paper";

export type Design = {
  id: string;
  label: string;
  layout: LayoutKey;
  background: {
    kind: BackgroundKind;
    from: string;
    to: string;
    glow: string;
    noise: number;
    vignette: number;
    angle: number;
  };
  device: {
    frame: boolean;
    bezel: "dark" | "light";
    perspective: number;
    rotate: number;
    scale: number;
    shadow: number;
    radius: number;
  };
  type: {
    font: FontKey;
    size: number;
    align: "left" | "center";
    show: boolean;
    color: string;
    accent: string;
  };
  screenIds: string[];
  notes: string[];
};

export type Ratio = {
  key: string;
  label: string;
  w: number;
  h: number;
};
