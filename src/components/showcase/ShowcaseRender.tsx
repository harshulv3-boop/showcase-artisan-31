import type { CSSProperties } from "react";
import { FONT_STACK } from "@/lib/showcase/engine";
import { withAlpha } from "@/lib/showcase/direction";
import type { BgLayer, Brand, Composition, DecorItem, SceneNode, Screen } from "@/lib/showcase/types";

type Props = {
  comp: Composition;
  screens: Screen[];
  brand: Brand;
  width: number;
  height: number;
};

function layerStyle(l: BgLayer): CSSProperties {
  switch (l.t) {
    case "linear":
      return { background: `linear-gradient(${l.angle}deg, ${l.from}, ${l.to})` };
    case "radial":
      return {
        background: `radial-gradient(circle at ${l.x * 100}% ${l.y * 100}%, ${withAlpha(l.color, l.opacity)} 0%, transparent ${Math.round(l.r * 100)}%)`,
        filter: `blur(${l.blur * 0.4}px)`,
      };
    case "conic":
      return {
        background: `conic-gradient(from ${Math.round(l.x * 360)}deg at ${l.x * 100}% ${l.y * 100}%, ${l.from}, ${l.to}, ${l.from})`,
        opacity: l.opacity,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${withAlpha(l.color, l.opacity)} 1px, transparent 1px), linear-gradient(90deg, ${withAlpha(l.color, l.opacity)} 1px, transparent 1px)`,
        backgroundSize: `${l.size}px ${l.size}px`,
      };
    case "stripes":
      return {
        backgroundImage: `repeating-linear-gradient(${l.angle}deg, ${withAlpha(l.color, l.opacity)} 0 2px, transparent 2px ${l.size}px)`,
      };
    case "blob":
      return {
        left: `${(l.x - l.w / 2) * 100}%`,
        top: `${(l.y - l.h / 2) * 100}%`,
        width: `${l.w * 100}%`,
        height: `${l.h * 100}%`,
        borderRadius: "50%",
        background: withAlpha(l.color, l.opacity),
        filter: `blur(${l.blur}px)`,
        transform: `rotate(${l.rotate}deg)`,
        inset: "auto",
      };
    case "ring":
      return {
        left: `${(l.x - l.r) * 100}%`,
        top: `${(l.y - l.r) * 100}%`,
        width: `${l.r * 200}%`,
        height: `${l.r * 200}%`,
        borderRadius: "50%",
        border: `${l.thickness}px solid ${withAlpha(l.color, l.opacity)}`,
        inset: "auto",
      };
    case "band":
      return {
        left: `${(l.x - l.w / 2) * 100}%`,
        top: `${(l.y - l.h / 2) * 100}%`,
        width: `${l.w * 100}%`,
        height: `${l.h * 100}%`,
        background: `linear-gradient(90deg, transparent, ${withAlpha(l.color, l.opacity)}, transparent)`,
        transform: `rotate(${l.angle}deg)`,
        inset: "auto",
      };
    default:
      return {};
  }
}

function Grain({ amount }: { amount: number }) {
  if (amount <= 0) return null;
  return (
    <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: amount, mixBlendMode: "overlay" }}>
      <filter id="sgrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" />
      </filter>
      <rect width="100%" height="100%" filter="url(#sgrain)" />
    </svg>
  );
}

function Device({
  node,
  screen,
  comp,
  width,
  u,
}: {
  node: SceneNode;
  screen: Screen;
  comp: Composition;
  width: number;
  u: number;
}) {
  const dev = comp.device;
  const isMobile = screen.kind === "mobile";
  const bezelBg = dev.bezel === "dark" ? "#0f1116" : "#f3f4f7";
  const bezelEdge = dev.bezel === "dark" ? "#2b2f39" : "#d7dae2";
  const pad = node.frame ? (isMobile ? 10 * u : 0) : 0;
  const radius = (isMobile ? dev.radius * 2.2 : dev.radius) * u + 4;
  const w = node.w * width;

  const img = (
    <img
      src={screen.url}
      alt={screen.name}
      style={{
        display: "block",
        width: node.crop ? `${node.crop.scale * 100}%` : "100%",
        height: node.crop ? "auto" : "auto",
        objectFit: "cover",
        transform: node.crop ? `translate(${-node.crop.ox * (node.crop.scale - 1) * 100}%, ${-node.crop.oy * (node.crop.scale - 1) * 100}%)` : undefined,
        borderRadius: node.frame ? Math.max(0, radius - pad) : radius,
      }}
    />
  );

  const chrome =
    node.frame && !isMobile ? (
      <div style={{ display: "flex", alignItems: "center", gap: 7 * u, padding: `${10 * u}px ${14 * u}px`, background: bezelBg, borderBottom: `1px solid ${bezelEdge}` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 10 * u, height: 10 * u, borderRadius: 99, background: c, display: "block" }} />
        ))}
        <span style={{ marginLeft: 10 * u, flex: 1, height: 14 * u, borderRadius: 99, background: dev.bezel === "dark" ? "#1b1f27" : "#e6e8ee" }} />
      </div>
    ) : null;

  const shadow = dev.shadow;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: w,
        borderRadius: radius,
        padding: pad,
        background: node.frame ? bezelBg : "transparent",
        border: node.frame ? `1px solid ${bezelEdge}` : dev.edgeLight > 0.2 ? `1px solid ${withAlpha("#ffffff", dev.edgeLight * 0.3)}` : "none",
        boxShadow: shadow
          ? `0 ${44 * shadow * u}px ${100 * shadow * u}px rgba(3,6,18,${0.5 * shadow}), 0 ${10 * shadow * u}px ${22 * shadow * u}px rgba(3,6,18,${0.28 * shadow})`
          : "none",
        maxHeight: node.crop ? `${(node.w / node.crop.ratio) * width}px` : undefined,
      }}
    >
      {chrome}
      {node.frame && isMobile && (
        <div style={{ position: "absolute", top: 16 * u, left: "50%", transform: "translateX(-50%)", width: "32%", height: 18 * u, borderRadius: 99, background: dev.bezel === "dark" ? "#05060a" : "#c9ccd6", zIndex: 2 }} />
      )}
      {img}
      {dev.glass > 0.15 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background: `linear-gradient(120deg, ${withAlpha("#ffffff", dev.glass * 0.28)} 0%, transparent 42%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

function Decor({ item, width, height, u, font }: { item: DecorItem; width: number; height: number; u: number; font: string }) {
  const base: CSSProperties = {
    position: "absolute",
    left: item.x * width,
    top: item.y * height,
    width: item.w * width,
    height: item.h * height,
    opacity: item.opacity,
    transform: `rotate(${item.angle}deg)`,
  };
  switch (item.t) {
    case "rule":
      return <div style={{ ...base, height: Math.max(2 * u, item.h * height), background: item.color }} />;
    case "block":
      return <div style={{ ...base, background: item.color, borderRadius: 2 * u }} />;
    case "dot-grid":
      return (
        <div
          style={{
            ...base,
            backgroundImage: `radial-gradient(${withAlpha(item.color, 0.8)} ${1.6 * u}px, transparent ${1.7 * u}px)`,
            backgroundSize: `${16 * u}px ${16 * u}px`,
          }}
        />
      );
    case "arc":
      return <div style={{ ...base, border: `${2 * u}px solid ${item.color}`, borderRadius: "50%", borderRightColor: "transparent", borderBottomColor: "transparent" }} />;
    case "badge":
      return (
        <div
          style={{
            ...base,
            height: "auto",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: `${8 * u}px ${14 * u}px`,
            border: `${1.5 * u}px solid ${item.color}`,
            color: item.color,
            borderRadius: 99,
            fontFamily: font,
            fontSize: 16 * u,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {item.text}
        </div>
      );
    default:
      return null;
  }
}

export function ShowcaseRender({ comp, screens, brand, width, height }: Props) {
  const u = width / 1600;
  const t = comp.tune;
  const font = FONT_STACK[comp.text.font];

  return (
    <div style={{ width, height, position: "relative", overflow: "hidden", background: comp.base, fontFamily: font }}>
      {comp.layers.map((l, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, pointerEvents: "none", ...layerStyle(l) }} />
      ))}

      {comp.decor.map((d, i) => (
        <Decor key={i} item={d} width={width} height={height} u={u} font={font} />
      ))}

      {comp.nodes.map((n) => {
        const screen = screens.find((s) => s.id === n.screenId);
        if (!screen) return null;
        const x = comp.text ? 0 : 0;
        void x;
        const px = (0.5 + (n.x - 0.5) * t.spread) * width;
        const py = (0.5 + (n.y - 0.5) * t.spread) * height;
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: px,
              top: py,
              zIndex: Math.round(n.z),
              opacity: n.opacity,
              filter: n.blur ? `blur(${n.blur * u}px)` : undefined,
              perspective: 2200 * u,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                transform: `translate(-50%, -50%) rotate(${n.rotate}deg) rotateY(${n.tiltY * t.tilt}deg) rotateX(${n.tiltX * t.tilt}deg) scale(${t.scale})`,
              }}
            >
              <Device node={{ ...n, w: n.w * t.scale }} screen={screen} comp={comp} width={width} u={u} />
            </div>
          </div>
        );
      })}

      {comp.text.show && (
        <div
          style={{
            position: "absolute",
            left: comp.text.x * width,
            top: comp.text.y * height,
            width: comp.text.w * width,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            gap: 16 * u * comp.text.scale,
            alignItems: comp.text.align === "center" ? "center" : comp.text.align === "right" ? "flex-end" : "flex-start",
            textAlign: comp.text.align,
            color: comp.text.color,
            fontFamily: font,
          }}
        >
          {(brand.logo || comp.text.kicker) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 * u }}>
              {brand.logo && <img src={brand.logo} alt="" style={{ height: 36 * u * comp.text.scale, width: "auto", objectFit: "contain" }} />}
              {comp.text.kicker && (
                <span style={{ fontSize: 18 * u * comp.text.scale, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.72 }}>
                  {comp.text.kicker}
                </span>
              )}
            </div>
          )}
          {brand.headline && (
            <h2
              style={{
                margin: 0,
                fontSize: 74 * u * comp.text.scale,
                lineHeight: 0.98,
                fontWeight: comp.text.weight,
                letterSpacing: `${comp.text.tracking}em`,
                textTransform: comp.text.upper ? "uppercase" : "none",
              }}
            >
              {brand.headline}
            </h2>
          )}
          {brand.sub && (
            <p style={{ margin: 0, fontSize: 24 * u * comp.text.scale, lineHeight: 1.42, opacity: 0.74 }}>{brand.sub}</p>
          )}
          {brand.cta && (
            <span
              style={{
                marginTop: 6 * u,
                display: "inline-block",
                padding: `${13 * u * comp.text.scale}px ${26 * u * comp.text.scale}px`,
                borderRadius: 99,
                background: comp.text.accent,
                color: "#0b0d12",
                fontSize: 19 * u * comp.text.scale,
                fontWeight: 600,
              }}
            >
              {brand.cta}
            </span>
          )}
        </div>
      )}

      <Grain amount={comp.grain} />
      {comp.vignette > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            pointerEvents: "none",
            background: `radial-gradient(80% 70% at ${comp.nodes[0]?.x ?? 0.5 ? (comp.nodes[0]?.x ?? 0.5) * 100 : 50}% 45%, transparent 42%, rgba(0,0,0,${comp.vignette}))`,
          }}
        />
      )}
    </div>
  );
}
