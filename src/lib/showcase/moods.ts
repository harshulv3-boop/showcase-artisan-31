import type { FontKey, PresetKey } from "./types";

/**
 * Moods are *not* layouts. They only seed art direction when the user has not
 * attached any references. No composition data lives here.
 */
export type Mood = {
  key: PresetKey;
  label: string;
  palette: [string, string, string];
  ink: string;
  dark: boolean;
  air: number;
  symmetry: number;
  tilt: number;
  typeScale: number;
  radius: number;
  glass: number;
  font: FontKey;
};

export const MOODS: Mood[] = [
  { key: "minimal-saas", label: "Minimal SaaS", palette: ["#f4f5f7", "#e7eaf0", "#2563eb"], ink: "#0b1120", dark: false, air: 0.7, symmetry: 0.7, tilt: 0, typeScale: 1, radius: 18, glass: 0.1, font: "sans" },
  { key: "soft-gradient", label: "Soft Gradient", palette: ["#dfe7ff", "#ffe3ee", "#5b6bff"], ink: "#161a33", dark: false, air: 0.6, symmetry: 0.55, tilt: 8, typeScale: 1.05, radius: 22, glass: 0.35, font: "grotesk" },
  { key: "dark-cinematic", label: "Dark Cinematic", palette: ["#07080c", "#12151f", "#ff5a2c"], ink: "#f6f7fb", dark: true, air: 0.55, symmetry: 0.4, tilt: 16, typeScale: 1.2, radius: 16, glass: 0.3, font: "grotesk" },
  { key: "bold-editorial", label: "Bold Editorial", palette: ["#111111", "#f2f0ea", "#d7ff3e"], ink: "#f7f7f2", dark: true, air: 0.35, symmetry: 0.3, tilt: 4, typeScale: 1.6, radius: 6, glass: 0, font: "grotesk" },
  { key: "mockup-3d", label: "3D Device Mockup", palette: ["#c9c6ff", "#eae8ff", "#3a2fd6"], ink: "#15123a", dark: false, air: 0.6, symmetry: 0.45, tilt: 20, typeScale: 1, radius: 24, glass: 0.4, font: "grotesk" },
  { key: "futuristic", label: "Futuristic Technical", palette: ["#05070a", "#0c1622", "#3ef0c4"], ink: "#e6fff8", dark: true, air: 0.45, symmetry: 0.5, tilt: 14, typeScale: 0.95, radius: 10, glass: 0.5, font: "mono" },
  { key: "playful", label: "Playful Consumer", palette: ["#ffd166", "#ff7a5c", "#1b1b3a"], ink: "#1b1b3a", dark: false, air: 0.45, symmetry: 0.5, tilt: 10, typeScale: 1.15, radius: 26, glass: 0.15, font: "grotesk" },
  { key: "premium", label: "Premium Luxury", palette: ["#14110f", "#241f1a", "#c8a86b"], ink: "#f5efe6", dark: true, air: 0.72, symmetry: 0.65, tilt: 8, typeScale: 1.1, radius: 14, glass: 0.2, font: "serif" },
  { key: "brutalist", label: "Brutalist Poster", palette: ["#e8e6df", "#111111", "#ff3b1f"], ink: "#111111", dark: false, air: 0.3, symmetry: 0.25, tilt: 0, typeScale: 1.7, radius: 2, glass: 0, font: "mono" },
  { key: "monochrome", label: "Monochrome", palette: ["#101012", "#26262b", "#dcdce2"], ink: "#f2f2f5", dark: true, air: 0.66, symmetry: 0.6, tilt: 10, typeScale: 1, radius: 14, glass: 0.15, font: "grotesk" },
  { key: "glass", label: "Glass / Glossy", palette: ["#0a1a2f", "#123a5c", "#7ad7ff"], ink: "#eaf6ff", dark: true, air: 0.58, symmetry: 0.5, tilt: 14, typeScale: 1.05, radius: 22, glass: 0.7, font: "grotesk" },
];
