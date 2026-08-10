import type { CSSProperties } from "react";
import { FONT_STACK } from "@/lib/showcase/engine";
import type { Brand, Design, Screen } from "@/lib/showcase/types";

type Props = {
  design: Design;
  screens: Screen[];
  brand: Brand;
  width: number;
  height: number;
};

function bgStyle(d: Design): CSSProperties {
  const { kind, from, to, glow, angle } = d.background;
  switch (kind) {
    case "solid":
      return { background: from };
    case "gradient":
      return { background: `linear-gradient(${angle}deg, ${from}, ${to})` };
    case "mesh":
      return {
        background: `radial-gradient(60% 60% at 20% 20%, ${glow}cc, transparent 70%), radial-gradient(55% 55% at 85% 25%, ${to}dd, transparent 70%), radial-gradient(70% 70% at 60% 95%, ${from}, transparent 70%), linear-gradient(${angle}deg, ${from}, ${to})`,
      };
    case "radial-glow":
      return {
        background: `radial-gradient(70% 60% at 50% 30%, ${glow}55, transparent 65%), linear-gradient(${angle}deg, ${from}, ${to})`,
      };
    case "studio":
      return {
        background: `radial-gradient(90% 70% at 50% 110%, ${to}, ${from} 70%)`,
      };
    case "grid":
      return {
        background: `linear-gradient(${angle}deg, ${from}, ${to})`,
        backgroundBlendMode: "normal",
      };
    case "paper":
      return { background: from };
    default:
      return { background: from };
  }
}

function Grain({ amount }: { amount: number }) {
  if (amount <= 0) return null;
  return (
    <svg
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: amount, mixBlendMode: "overlay" }}
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

function Frame({
  screen,
  design,
  style,
  crop,
}: {
  screen: Screen;
  design: Design;
  style?: CSSProperties;
  crop?: boolean;
}) {
  const isMobile = screen.kind === "mobile";
  const bezel = design.device.bezel === "dark" ? "#111318" : "#f3f4f7";
  const bezelEdge = design.device.bezel === "dark" ? "#2c2f38" : "#d7dae2";
  const pad = design.device.frame ? (isMobile ? 12 : 0) : 0;
  const radius = isMobile ? design.device.radius * 2.4 : design.device.radius;
  const shadow = design.device.shadow;

  const inner = (
    <img
      src={screen.url}
      alt={screen.name}
      style={{
        display: "block",
        width: "100%",
        height: crop ? "100%" : "auto",
        objectFit: crop ? "cover" : "contain",
        objectPosition: "top",
        borderRadius: design.device.frame ? radius - pad : radius,
      }}
    />
  );

  const chrome =
    design.device.frame && !isMobile ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          background: bezel,
          borderBottom: `1px solid ${bezelEdge}`,
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 12, height: 12, borderRadius: 99, background: c, display: "block" }} />
        ))}
        <span
          style={{
            marginLeft: 12,
            flex: 1,
            height: 18,
            borderRadius: 99,
            background: design.device.bezel === "dark" ? "#1c1f27" : "#e6e8ee",
          }}
        />
      </div>
    ) : null;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: radius,
        padding: pad,
        background: design.device.frame ? bezel : "transparent",
        border: design.device.frame ? `1px solid ${bezelEdge}` : "none",
        boxShadow: shadow
          ? `0 ${40 * shadow}px ${90 * shadow}px rgba(3,6,18,${0.45 * shadow}), 0 ${8 * shadow}px ${18 * shadow}px rgba(3,6,18,${0.25 * shadow})`
          : "none",
        ...style,
      }}
    >
      {chrome}
      {design.device.frame && isMobile && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: "34%",
            height: 22,
            borderRadius: 99,
            background: design.device.bezel === "dark" ? "#05060a" : "#c9ccd6",
            zIndex: 2,
          }}
        />
      )}
      {inner}
    </div>
  );
}

function Copy({
  brand,
  design,
  width,
  align,
  max,
}: {
  brand: Brand;
  design: Design;
  width: number;
  align?: "left" | "center";
  max?: number;
}) {
  if (!design.type.show) return null;
  const a = align ?? design.type.align;
  const unit = width / 1600;
  const s = design.type.size * unit;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16 * s,
        alignItems: a === "center" ? "center" : "flex-start",
        textAlign: a,
        maxWidth: max ?? width * 0.55,
        fontFamily: FONT_STACK[design.type.font],
        color: design.type.color,
      }}
    >
      {(brand.logo || brand.product) && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 * s }}>
          {brand.logo && (
            <img src={brand.logo} alt="" style={{ height: 40 * s, width: "auto", objectFit: "contain" }} />
          )}
          {brand.product && (
            <span
              style={{
                fontSize: 20 * s,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                opacity: 0.7,
                fontWeight: 500,
              }}
            >
              {brand.product}
            </span>
          )}
        </div>
      )}
      {brand.headline && (
        <h2
          style={{
            fontSize: 78 * s,
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
            fontWeight: design.type.font === "serif" ? 400 : 600,
            margin: 0,
          }}
        >
          {brand.headline}
        </h2>
      )}
      {brand.sub && (
        <p style={{ fontSize: 26 * s, lineHeight: 1.4, margin: 0, opacity: 0.72, maxWidth: 640 * s }}>{brand.sub}</p>
      )}
      {brand.cta && (
        <span
          style={{
            marginTop: 8 * s,
            display: "inline-block",
            padding: `${14 * s}px ${28 * s}px`,
            borderRadius: 99,
            background: design.type.accent,
            color: "#0b0d12",
            fontSize: 20 * s,
            fontWeight: 600,
          }}
        >
          {brand.cta}
        </span>
      )}
    </div>
  );
}

export function ShowcaseRender({ design, screens, brand, width, height }: Props) {
  const picked = design.screenIds
    .map((id) => screens.find((s) => s.id === id))
    .filter((s): s is Screen => Boolean(s));
  const hero = picked[0];
  const u = width / 1600;
  const pad = 90 * u;

  const body = (() => {
    if (!hero) return null;
    switch (design.layout) {
      case "hero-center":
        return (
          <div style={{ position: "absolute", inset: pad, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 * u }}>
            <Copy brand={brand} design={design} width={width} align="center" max={width * 0.68} />
            <div style={{ flex: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", overflow: "hidden" }}>
              <Frame screen={hero} design={design} style={{ width: hero.kind === "mobile" ? "26%" : "82%" }} />
            </div>
          </div>
        );
      case "angled-hero":
        return (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
            <div style={{ width: "42%", paddingLeft: pad }}>
              <Copy brand={brand} design={design} width={width} align="left" max={width * 0.36} />
            </div>
            <div style={{ flex: 1, perspective: 2000 * u, display: "flex", justifyContent: "center" }}>
              <Frame
                screen={hero}
                design={design}
                style={{
                  width: hero.kind === "mobile" ? "38%" : "92%",
                  transform: `rotateY(${-design.device.perspective}deg) rotateX(4deg) rotate(${design.device.rotate}deg) scale(${design.device.scale})`,
                }}
              />
            </div>
          </div>
        );
      case "hero-support":
        return (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: pad, top: pad }}>
              <Copy brand={brand} design={design} width={width} align="left" max={width * 0.45} />
            </div>
            <div style={{ position: "absolute", inset: 0, top: "38%" }}>
              {picked.slice(1, 3).map((s, i) => (
                <Frame
                  key={s.id}
                  screen={s}
                  design={design}
                  style={{
                    position: "absolute",
                    width: s.kind === "mobile" ? "18%" : "46%",
                    left: i === 0 ? "6%" : "auto",
                    right: i === 1 ? "6%" : "auto",
                    top: 40 * u,
                    opacity: 0.92,
                    transform: `rotate(${i === 0 ? -4 : 4}deg)`,
                  }}
                />
              ))}
              <Frame
                screen={hero}
                design={design}
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: hero.kind === "mobile" ? "24%" : "58%",
                  zIndex: 3,
                }}
              />
            </div>
          </div>
        );
      case "phone-fan":
        return (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: pad, gap: 30 * u }}>
            <Copy brand={brand} design={design} width={width} align="center" max={width * 0.6} />
            <div style={{ position: "relative", flex: 1, width: "100%", perspective: 2200 * u }}>
              {picked.slice(0, 3).map((s, i) => {
                const order = [1, 0, 2][i]!;
                const offset = (order - 1) * 24;
                return (
                  <Frame
                    key={s.id}
                    screen={s}
                    design={design}
                    style={{
                      position: "absolute",
                      width: s.kind === "mobile" ? "24%" : "40%",
                      left: `${50 + offset}%`,
                      top: `${order === 1 ? 2 : 8}%`,
                      transform: `translateX(-50%) rotate(${(order - 1) * 9}deg) scale(${order === 1 ? 1.06 : 0.92})`,
                      zIndex: order === 1 ? 3 : 1,
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      case "browser-dashboard":
        return (
          <div style={{ position: "absolute", inset: pad, display: "flex", flexDirection: "column", gap: 36 * u }}>
            <Copy brand={brand} design={design} width={width} align="left" max={width * 0.55} />
            <div style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "center" }}>
              <Frame screen={hero} design={design} style={{ width: "100%" }} />
            </div>
          </div>
        );
      case "responsive-pair":
        return (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: pad, top: pad }}>
              <Copy brand={brand} design={design} width={width} align="left" max={width * 0.42} />
            </div>
            <Frame screen={hero} design={design} style={{ position: "absolute", left: "10%", top: "40%", width: "62%" }} />
            {picked[1] && (
              <Frame
                screen={picked[1]}
                design={design}
                style={{ position: "absolute", right: "10%", top: "34%", width: "18%", zIndex: 4 }}
              />
            )}
          </div>
        );
      case "screen-grid":
        return (
          <div style={{ position: "absolute", inset: pad, display: "flex", flexDirection: "column", gap: 32 * u }}>
            <Copy brand={brand} design={design} width={width} align="left" max={width * 0.6} />
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: `repeat(${picked.length > 4 ? 3 : 2}, 1fr)`,
                gap: 28 * u,
                overflow: "hidden",
              }}
            >
              {picked.map((s) => (
                <div key={s.id} style={{ overflow: "hidden", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                  <Frame screen={s} design={design} style={{ width: s.kind === "mobile" ? "58%" : "100%" }} crop={false} />
                </div>
              ))}
            </div>
          </div>
        );
      case "editorial-type":
        return (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: pad, top: pad, right: pad }}>
              <Copy brand={brand} design={design} width={width} align="left" max={width * 0.9} />
            </div>
            <Frame
              screen={hero}
              design={design}
              style={{
                position: "absolute",
                right: pad,
                bottom: -height * 0.12,
                width: hero.kind === "mobile" ? "22%" : "52%",
                transform: `rotate(${design.device.rotate || -3}deg)`,
              }}
            />
            {picked[1] && (
              <Frame
                screen={picked[1]}
                design={design}
                style={{ position: "absolute", left: pad, bottom: -height * 0.16, width: picked[1].kind === "mobile" ? "18%" : "34%", opacity: 0.95 }}
              />
            )}
          </div>
        );
      case "split-background":
        return (
          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            <div
              style={{
                width: "44%",
                background: design.background.glow,
                display: "flex",
                alignItems: "center",
                padding: pad,
              }}
            >
              <Copy brand={brand} design={design} width={width} align="left" max={width * 0.34} />
            </div>
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Frame
                screen={hero}
                design={design}
                style={{ width: hero.kind === "mobile" ? "36%" : "84%", transform: `translateX(-12%) rotate(${design.device.rotate}deg)` }}
              />
              {picked[1] && (
                <Frame
                  screen={picked[1]}
                  design={design}
                  style={{ position: "absolute", right: "6%", bottom: "8%", width: picked[1].kind === "mobile" ? "22%" : "38%" }}
                />
              )}
            </div>
          </div>
        );
      case "perspective-wall":
        return (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", paddingTop: pad, paddingLeft: pad, gap: 30 * u }}>
            <Copy brand={brand} design={design} width={width} align="left" max={width * 0.5} />
            <div style={{ flex: 1, perspective: 1800 * u, display: "flex", alignItems: "center", gap: 26 * u, paddingLeft: 40 * u }}>
              {picked.slice(0, 5).map((s, i) => (
                <Frame
                  key={s.id}
                  screen={s}
                  design={design}
                  style={{
                    flex: "0 0 auto",
                    width: s.kind === "mobile" ? `${16 - i}%` : `${34 - i * 3}%`,
                    transform: `rotateY(${-design.device.perspective - 6}deg) translateZ(${-i * 40}px)`,
                    opacity: 1 - i * 0.08,
                  }}
                />
              ))}
            </div>
          </div>
        );
      case "detail-crop":
        return (
          <div style={{ position: "absolute", inset: 0 }}>
            <div
              style={{
                position: "absolute",
                inset: `${height * 0.22}px ${pad}px ${pad}px ${pad}px`,
                overflow: "hidden",
                borderRadius: design.device.radius,
                boxShadow: `0 ${50 * design.device.shadow}px ${110 * design.device.shadow}px rgba(3,6,18,0.5)`,
              }}
            >
              <img
                src={hero.url}
                alt={hero.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left", transform: "scale(1.35)", transformOrigin: "top left" }}
              />
            </div>
            <div style={{ position: "absolute", left: pad, top: pad * 0.7 }}>
              <Copy brand={brand} design={design} width={width} align="left" max={width * 0.6} />
            </div>
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        ...bgStyle(design),
        fontFamily: FONT_STACK[design.type.font],
      }}
    >
      {design.background.kind === "grid" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${design.type.color}18 1px, transparent 1px), linear-gradient(90deg, ${design.type.color}18 1px, transparent 1px)`,
            backgroundSize: `${64 * u}px ${64 * u}px`,
          }}
        />
      )}
      {design.background.kind === "radial-glow" && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "-10%",
            width: "70%",
            height: "70%",
            transform: "translateX(-50%)",
            background: `radial-gradient(circle, ${design.background.glow}66, transparent 65%)`,
            filter: `blur(${60 * u}px)`,
          }}
        />
      )}
      {body}
      <Grain amount={design.background.noise} />
      {design.background.vignette > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(80% 70% at 50% 45%, transparent 40%, rgba(0,0,0,${design.background.vignette}))`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
