import type { RefSignals } from "./types";

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

/**
 * Reference intelligence: measures real visual properties from the pixels of an
 * uploaded image. No templates, no presets — just signals that later drive
 * original composition decisions.
 */
export async function analyseImage(url: string): Promise<RefSignals> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await img.decode();

  const N = 64;
  const canvas = document.createElement("canvas");
  canvas.width = N;
  canvas.height = N;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, N, N);
  const { data } = ctx.getImageData(0, 0, N, N);

  const lum = new Float32Array(N * N);
  const sat = new Float32Array(N * N);
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  let lumSum = 0;
  let satSum = 0;
  let warmSum = 0;

  for (let i = 0; i < N * N; i++) {
    const r = data[i * 4]!;
    const g = data[i * 4 + 1]!;
    const b = data[i * 4 + 2]!;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const S = max === 0 ? 0 : (max - min) / max;
    lum[i] = L;
    sat[i] = S;
    lumSum += L;
    satSum += S;
    warmSum += (r - b) / 255;
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.n += 1;
    buckets.set(key, bucket);
  }

  const count = N * N;
  const luminance = lumSum / count;
  const saturation = satSum / count;
  const warmth = warmSum / count;

  let variance = 0;
  for (let i = 0; i < count; i++) variance += (lum[i]! - luminance) ** 2;
  const contrast = Math.sqrt(variance / count);

  const colors = [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)
    .map((b) => rgbToHex(b.r / b.n, b.g / b.n, b.b / b.n));

  // colour spread across the dominant buckets
  const topN = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 8);
  let colorVariance = 0;
  for (let i = 1; i < topN.length; i++) {
    const a = topN[0]!;
    const c = topN[i]!;
    colorVariance +=
      Math.abs(a.r / a.n - c.r / c.n) + Math.abs(a.g / a.n - c.g / c.n) + Math.abs(a.b / a.n - c.b / c.n);
  }
  colorVariance = Math.min(1, colorVariance / (255 * 3 * Math.max(1, topN.length - 1)) * 2.2);

  // background reference = median luminance of the border ring
  const border: number[] = [];
  for (let x = 0; x < N; x++) {
    border.push(lum[x]!, lum[(N - 1) * N + x]!, lum[x * N]!, lum[x * N + N - 1]!);
  }
  border.sort((a, b) => a - b);
  const bgLum = border[Math.floor(border.length / 2)]!;

  // "interest" map = deviation from backdrop + local colour energy
  const interest = new Float32Array(count);
  let interestSum = 0;
  for (let i = 0; i < count; i++) {
    const v = Math.abs(lum[i]! - bgLum) * 1.4 + sat[i]! * 0.5;
    interest[i] = v;
    interestSum += v;
  }
  const meanInterest = interestSum / count;
  const thresh = Math.max(0.05, meanInterest * 0.8);

  let mx = 0;
  let my = 0;
  let mass = 0;
  let occupied = 0;
  let borderMass = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const v = interest[y * N + x]!;
      if (v > thresh) {
        occupied++;
        if (x < 2 || y < 2 || x > N - 3 || y > N - 3) borderMass += v;
      }
      mx += v * (x / (N - 1));
      my += v * (y / (N - 1));
      mass += v;
    }
  }
  const focalX = mass ? mx / mass : 0.5;
  const focalY = mass ? my / mass : 0.5;
  const negativeSpace = 1 - occupied / count;
  const bleed = mass ? Math.min(1, (borderMass / mass) * 3) : 0;

  // spread of visual mass around the focal point
  let spread = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const v = interest[y * N + x]!;
      spread += v * Math.hypot(x / (N - 1) - focalX, y / (N - 1) - focalY);
    }
  }
  const massSpread = mass ? Math.min(1, (spread / mass) * 2.4) : 0.5;

  // edge density (visual busyness) + light direction from the luminance gradient
  let edge = 0;
  let gx = 0;
  let gy = 0;
  for (let y = 1; y < N - 1; y++) {
    for (let x = 1; x < N - 1; x++) {
      const i = y * N + x;
      const dx = lum[i + 1]! - lum[i - 1]!;
      const dy = lum[i + N]! - lum[i - N]!;
      edge += Math.hypot(dx, dy);
      gx += dx;
      gy += dy;
    }
  }
  const edgeDensity = Math.min(1, edge / ((N - 2) * (N - 2)) * 3.2);
  const lightAngle = (Math.atan2(-gy, -gx) * 180) / Math.PI;
  const lightIntensity = Math.min(1, Math.hypot(gx, gy) / ((N - 2) * (N - 2)) * 40 + contrast);

  // horizontal symmetry
  let symDiff = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N / 2; x++) {
      symDiff += Math.abs(lum[y * N + x]! - lum[y * N + (N - 1 - x)]!);
    }
  }
  const symmetry = Math.max(0, 1 - (symDiff / (count / 2)) * 3);

  // rough cluster count over a 4x4 occupancy grid
  let clusters = 0;
  for (let cy = 0; cy < 4; cy++) {
    for (let cx = 0; cx < 4; cx++) {
      let s = 0;
      for (let y = cy * 16; y < cy * 16 + 16; y++)
        for (let x = cx * 16; x < cx * 16 + 16; x++) s += interest[y * N + x]!;
      if (s / 256 > thresh) clusters++;
    }
  }

  return {
    colors,
    luminance,
    saturation,
    contrast,
    warmth,
    colorVariance,
    edgeDensity,
    symmetry,
    negativeSpace,
    focalX,
    focalY,
    bleed,
    lightAngle,
    lightIntensity,
    massSpread,
    clusters,
    width: img.naturalWidth,
    height: img.naturalHeight,
    aspect: img.naturalWidth / Math.max(1, img.naturalHeight),
  };
}
