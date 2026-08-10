import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Download,
  ImagePlus,
  Layers,
  Redo2,
  RefreshCw,
  Sparkles,
  Trash2,
  Undo2,
  Wand2,
} from "lucide-react";
import { ShowcaseRender } from "@/components/showcase/ShowcaseRender";
import {
  LAYOUT_LABELS,
  OUTPUTS,
  PRESETS,
  RATIOS,
  analyseImage,
  buildStyleProfile,
  critique,
  generateDesigns,
} from "@/lib/showcase/engine";
import type {
  Brand,
  Design,
  LayoutKey,
  OutputType,
  PresetKey,
  Reference,
  ReferenceRole,
  Screen,
} from "@/lib/showcase/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Showcase Studio — Dribbble Shots & Product Screenshots" },
      {
        name: "description",
        content:
          "Turn app, website and dashboard screenshots into art-directed Dribbble shots, Product Hunt galleries and portfolio covers. Reference-driven, fully editable, export-ready.",
      },
      { property: "og:title", content: "Showcase Studio — AI Product Showcase Maker" },
      {
        property: "og:description",
        content:
          "Upload product screens, attach visual references, generate polished showcase compositions and export in any ratio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});

const uid = () => Math.random().toString(36).slice(2, 9);

const REF_ROLES: { key: ReferenceRole; label: string }[] = [
  { key: "auto", label: "Auto — full style" },
  { key: "art-direction", label: "Art direction" },
  { key: "composition", label: "Composition" },
  { key: "background", label: "Background" },
  { key: "device", label: "Device mockup" },
  { key: "typography", label: "Typography" },
  { key: "palette", label: "Color palette" },
  { key: "lighting", label: "Lighting" },
  { key: "arrangement", label: "Screen arrangement" },
];

async function readFile(file: File) {
  return new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-3 border-b border-border/60 px-5 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Studio() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [refs, setRefs] = useState<Reference[]>([]);
  const [strength, setStrength] = useState<"subtle" | "balanced" | "strong">("balanced");
  const [output, setOutput] = useState<OutputType>("dribbble");
  const [preset, setPreset] = useState<PresetKey>("dark-cinematic");
  const [brand, setBrand] = useState<Brand>({
    product: "",
    headline: "Ship better campaigns",
    sub: "One workspace for every channel your team runs.",
    cta: "",
    logo: null,
    primary: "#ffffff",
    accent: "#ff5a2c",
    font: "grotesk",
  });
  const [designs, setDesigns] = useState<Design[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [ratioKey, setRatioKey] = useState("dribbble");
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [history, setHistory] = useState<Design[][]>([]);
  const [future, setFuture] = useState<Design[][]>([]);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const ratio = RATIOS.find((r) => r.key === ratioKey) ?? RATIOS[0]!;
  const current = designs.find((d) => d.id === editing) ?? null;
  const profile = useMemo(
    () => buildStyleProfile(refs, PRESETS.find((p) => p.key === preset) ?? PRESETS[0]!),
    [refs, preset],
  );

  const commit = useCallback(
    (next: Design[]) => {
      setHistory((h) => [...h.slice(-40), designs]);
      setFuture([]);
      setDesigns(next);
    },
    [designs],
  );

  const patch = (id: string, fn: (d: Design) => Design) =>
    commit(designs.map((d) => (d.id === id ? fn(d) : d)));

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      setFuture((f) => [designs, ...f]);
      setDesigns(h[h.length - 1]!);
      return h.slice(0, -1);
    });
  };
  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      setHistory((h) => [...h, designs]);
      setDesigns(f[0]!);
      return f.slice(1);
    });
  };

  async function onScreens(files: FileList | null) {
    if (!files) return;
    const added: Screen[] = [];
    for (const file of Array.from(files).slice(0, 12)) {
      const url = await readFile(file);
      const meta = await analyseImage(url);
      const kind = meta.height / meta.width > 1.4 ? "mobile" : meta.width / meta.height > 1.25 ? "desktop" : "tablet";
      added.push({ id: uid(), name: file.name, url, width: meta.width, height: meta.height, kind });
    }
    setScreens((s) => [...s, ...added]);
  }

  async function onRefs(files: FileList | null) {
    if (!files) return;
    const added: Reference[] = [];
    for (const file of Array.from(files).slice(0, 12)) {
      const url = await readFile(file);
      const meta = await analyseImage(url);
      added.push({
        id: uid(),
        name: file.name,
        url,
        role: "auto",
        colors: meta.colors,
        luminance: meta.luminance,
        saturation: meta.saturation,
      });
    }
    setRefs((r) => [...r, ...added].slice(0, 12));
  }

  async function onLogo(files: FileList | null) {
    if (!files?.[0]) return;
    setBrand((b) => ({ ...b, logo: null }));
    const url = await readFile(files[0]);
    setBrand((b) => ({ ...b, logo: url }));
  }

  function generate() {
    if (!screens.length) {
      toast.error("Upload at least one product screen first");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const next = generateDesigns({ screens, refs, brand, output, preset, strength });
      setHistory((h) => [...h, designs]);
      setFuture([]);
      setDesigns(next);
      setEditing(null);
      setBusy(false);
      toast.success(`${next.length} compositions generated`);
    }, 350);
  }

  function regenerateOne(id: string) {
    const idx = designs.findIndex((d) => d.id === id);
    const fresh = generateDesigns({ screens, refs, brand, output, preset, strength, count: 8 });
    const alt = fresh.find((f) => f.layout !== designs[idx]?.layout) ?? fresh[0]!;
    patch(id, (d) => ({ ...alt, id: d.id }));
  }

  async function exportImage() {
    const node = canvasRef.current;
    if (!node) return;
    const { toPng, toJpeg, toCanvas } = await import("html-to-image");
    const opts = { pixelRatio: scale, cacheBust: true, width: ratio.w, height: ratio.h };
    let dataUrl: string;
    if (format === "png") dataUrl = await toPng(node, opts);
    else if (format === "jpeg") dataUrl = await toJpeg(node, { ...opts, quality: 0.95 });
    else dataUrl = (await toCanvas(node, opts)).toDataURL("image/webp", 0.95);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${(brand.product || "showcase").toLowerCase().replace(/\s+/g, "-")}-${ratio.key}@${scale}x.${format}`;
    a.click();
    toast.success("Exported");
  }

  const previewW = current ? 900 : 380;
  const fit = previewW / ratio.w;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Toaster position="top-center" />
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h1 className="font-display text-sm font-semibold tracking-tight">Showcase Studio</h1>
            <p className="text-[11px] text-muted-foreground">Reference-driven product presentation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} disabled={!history.length} aria-label="Undo">
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!future.length} aria-label="Redo">
            <Redo2 className="size-4" />
          </Button>
          <Button onClick={generate} disabled={busy} className="gap-2">
            <Wand2 className="size-4" />
            {busy ? "Composing…" : designs.length ? "Regenerate all" : "Generate"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <aside className="w-[320px] shrink-0 overflow-y-auto border-r border-border/60">
          <Section
            title="Product screens"
            action={<span className="text-[11px] text-muted-foreground">{screens.length}</span>}
          >
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border py-6 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground">
              <ImagePlus className="size-4" />
              Upload app / website screens
              <input type="file" accept="image/*" multiple hidden onChange={(e) => onScreens(e.target.files)} />
            </label>
            <ul className="space-y-1.5">
              {screens.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2 rounded-md bg-secondary/60 p-1.5">
                  <img src={s.url} alt="" className="size-9 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{s.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.kind} · {s.width}×{s.height}
                    </p>
                  </div>
                  <button
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={i === 0}
                    onClick={() => setScreens((a) => { const n = [...a]; [n[i - 1], n[i]] = [n[i]!, n[i - 1]!]; return n; })}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setScreens((a) => a.filter((x) => x.id !== s.id))}
                    aria-label="Remove screen"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="References" action={<span className="text-[11px] text-muted-foreground">{refs.length}/12</span>}>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border py-5 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground">
              <ImagePlus className="size-4" />
              Attach inspiration shots
              <input type="file" accept="image/*" multiple hidden onChange={(e) => onRefs(e.target.files)} />
            </label>
            <div className="space-y-2">
              {refs.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <img src={r.url} alt="" className="size-10 rounded object-cover" />
                  <Select
                    value={r.role}
                    onValueChange={(v) => setRefs((a) => a.map((x) => (x.id === r.id ? { ...x, role: v as ReferenceRole } : x)))}
                  >
                    <SelectTrigger className="h-8 flex-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REF_ROLES.map((role) => (
                        <SelectItem key={role.key} value={role.key} className="text-xs">
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button className="text-muted-foreground hover:text-destructive" onClick={() => setRefs((a) => a.filter((x) => x.id !== r.id))} aria-label="Remove reference">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {refs.length > 0 && (
              <>
                <div className="flex gap-1.5">
                  {(["subtle", "balanced", "strong"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStrength(s)}
                      className={`flex-1 rounded-md px-2 py-1.5 text-[11px] capitalize transition-colors ${strength === s ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {profile && (
                  <div className="rounded-md bg-secondary/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
                    <p className="mb-1.5 font-medium text-foreground">Style profile</p>
                    <p>{profile.composition}</p>
                    <p>{profile.background_treatment}</p>
                    <p>{profile.device_treatment}</p>
                    <p>{profile.overall_mood}</p>
                    <div className="mt-2 flex gap-1">
                      {profile.color_palette.map((c) => (
                        <span key={c} className="size-4 rounded-sm" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Section>

          <Section title="Brand & copy">
            <div className="grid gap-2">
              <Input placeholder="Product name" value={brand.product} onChange={(e) => setBrand({ ...brand, product: e.target.value })} className="h-9 text-xs" />
              <Input placeholder="Headline" value={brand.headline} onChange={(e) => setBrand({ ...brand, headline: e.target.value })} className="h-9 text-xs" />
              <Textarea placeholder="Supporting copy" value={brand.sub} onChange={(e) => setBrand({ ...brand, sub: e.target.value })} className="min-h-16 text-xs" />
              <Input placeholder="CTA (optional)" value={brand.cta} onChange={(e) => setBrand({ ...brand, cta: e.target.value })} className="h-9 text-xs" />
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer rounded-md bg-secondary px-3 py-2 text-center text-[11px] text-muted-foreground hover:text-foreground">
                  {brand.logo ? "Replace logo" : "Upload logo"}
                  <input type="file" accept="image/*" hidden onChange={(e) => onLogo(e.target.files)} />
                </label>
                <input type="color" value={brand.accent} onChange={(e) => setBrand({ ...brand, accent: e.target.value })} className="h-9 w-10 cursor-pointer rounded-md bg-secondary" aria-label="Accent color" />
              </div>
            </div>
          </Section>

          <Section title="Output">
            <div className="grid grid-cols-2 gap-1.5">
              {OUTPUTS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setOutput(o.key)}
                  className={`rounded-md p-2 text-left text-[11px] leading-tight transition-colors ${output === o.key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Style preset">
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className={`flex items-center gap-2 rounded-md p-2 text-left text-[11px] transition-colors ${preset === p.key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  <span className="size-3 shrink-0 rounded-sm" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[2]})` }} />
                  {p.label}
                </button>
              ))}
            </div>
          </Section>
        </aside>

        {/* CENTER */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-8">
          {!designs.length ? (
            <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-secondary">
                <Layers className="size-6 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold">Compose your first showcase</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload product screens, attach reference shots for art direction, then generate four to six genuinely
                different compositions. Your screenshots stay pixel-exact — only the presentation is generated.
              </p>
            </div>
          ) : current ? (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => setEditing(null)}>
                  <ArrowLeft className="size-4" /> All concepts
                </Button>
                <span className="text-xs text-muted-foreground">{current.label}</span>
              </div>
              <div
                className="mx-auto overflow-hidden rounded-lg shadow-2xl"
                style={{ width: previewW, height: ratio.h * fit }}
              >
                <div style={{ transform: `scale(${fit})`, transformOrigin: "top left", width: ratio.w, height: ratio.h }}>
                  <div ref={canvasRef}>
                    <ShowcaseRender design={current} screens={screens} brand={brand} width={ratio.w} height={ratio.h} />
                  </div>
                </div>
              </div>
              {critique(current, screens, brand).length > 0 && (
                <ul className="mx-auto mt-4 max-w-[900px] space-y-1 rounded-md border border-border/60 bg-card p-3 text-[11px] text-muted-foreground">
                  <li className="font-medium text-foreground">Quality critic</li>
                  {critique(current, screens, brand).map((c) => (
                    <li key={c}>· {c}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {designs.map((d) => {
                const w = 380;
                const f = w / ratio.w;
                return (
                  <div key={d.id} className="group space-y-2">
                    <div className="overflow-hidden rounded-lg shadow-lg" style={{ width: w, height: ratio.h * f }}>
                      <div style={{ transform: `scale(${f})`, transformOrigin: "top left", width: ratio.w, height: ratio.h }}>
                        <ShowcaseRender design={d} screens={screens} brand={brand} width={ratio.w} height={ratio.h} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setEditing(d.id)}>Use this</Button>
                      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => regenerateOne(d.id)}>
                        <RefreshCw className="size-3.5" /> Variation
                      </Button>
                      <span className="ml-auto text-[11px] text-muted-foreground">{d.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* RIGHT PANEL */}
        <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-border/60">
          {current ? (
            <>
              <Section title="Layout">
                <Select value={current.layout} onValueChange={(v) => patch(current.id, (d) => ({ ...d, layout: v as LayoutKey, label: LAYOUT_LABELS[v as LayoutKey] }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LAYOUT_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Screens in this composition</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {screens.map((s) => {
                      const on = current.screenIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() =>
                            patch(current.id, (d) => ({
                              ...d,
                              screenIds: on ? d.screenIds.filter((x) => x !== s.id) : [...d.screenIds, s.id],
                            }))
                          }
                          className={`overflow-hidden rounded border-2 transition-colors ${on ? "border-accent" : "border-transparent opacity-50"}`}
                        >
                          <img src={s.url} alt="" className="size-10 object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Section>

              <Section title="Background">
                <Select value={current.background.kind} onValueChange={(v) => patch(current.id, (d) => ({ ...d, background: { ...d.background, kind: v as Design["background"]["kind"] } }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["solid", "gradient", "mesh", "radial-glow", "studio", "grid", "paper"].map((k) => (
                      <SelectItem key={k} value={k} className="text-xs capitalize">{k.replace("-", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  {(["from", "to", "glow"] as const).map((k) => (
                    <input
                      key={k}
                      type="color"
                      aria-label={k}
                      value={current.background[k]}
                      onChange={(e) => patch(current.id, (d) => ({ ...d, background: { ...d.background, [k]: e.target.value } }))}
                      className="h-8 flex-1 cursor-pointer rounded bg-secondary"
                    />
                  ))}
                </div>
                <Ctrl label="Angle" value={current.background.angle} min={0} max={360} step={5} onChange={(v) => patch(current.id, (d) => ({ ...d, background: { ...d.background, angle: v } }))} />
                <Ctrl label="Grain" value={current.background.noise} min={0} max={0.3} step={0.01} onChange={(v) => patch(current.id, (d) => ({ ...d, background: { ...d.background, noise: v } }))} />
                <Ctrl label="Vignette" value={current.background.vignette} min={0} max={0.7} step={0.01} onChange={(v) => patch(current.id, (d) => ({ ...d, background: { ...d.background, vignette: v } }))} />
              </Section>

              <Section title="Device">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Show frame</Label>
                  <Switch checked={current.device.frame} onCheckedChange={(v) => patch(current.id, (d) => ({ ...d, device: { ...d.device, frame: v } }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Light bezel</Label>
                  <Switch checked={current.device.bezel === "light"} onCheckedChange={(v) => patch(current.id, (d) => ({ ...d, device: { ...d.device, bezel: v ? "light" : "dark" } }))} />
                </div>
                <Ctrl label="Perspective" value={current.device.perspective} min={0} max={30} step={1} onChange={(v) => patch(current.id, (d) => ({ ...d, device: { ...d.device, perspective: v } }))} />
                <Ctrl label="Rotation" value={current.device.rotate} min={-20} max={20} step={1} onChange={(v) => patch(current.id, (d) => ({ ...d, device: { ...d.device, rotate: v } }))} />
                <Ctrl label="Scale" value={current.device.scale} min={0.6} max={1.4} step={0.02} onChange={(v) => patch(current.id, (d) => ({ ...d, device: { ...d.device, scale: v } }))} />
                <Ctrl label="Shadow" value={current.device.shadow} min={0} max={1.2} step={0.05} onChange={(v) => patch(current.id, (d) => ({ ...d, device: { ...d.device, shadow: v } }))} />
                <Ctrl label="Corner radius" value={current.device.radius} min={0} max={40} step={1} onChange={(v) => patch(current.id, (d) => ({ ...d, device: { ...d.device, radius: v } }))} />
              </Section>

              <Section title="Typography">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Show copy</Label>
                  <Switch checked={current.type.show} onCheckedChange={(v) => patch(current.id, (d) => ({ ...d, type: { ...d.type, show: v } }))} />
                </div>
                <Select value={current.type.font} onValueChange={(v) => patch(current.id, (d) => ({ ...d, type: { ...d.type, font: v as Design["type"]["font"] } }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["grotesk", "sans", "serif", "mono"].map((f) => (
                      <SelectItem key={f} value={f} className="text-xs capitalize">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1.5">
                  {(["left", "center"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => patch(current.id, (d) => ({ ...d, type: { ...d.type, align: a } }))}
                      className={`flex-1 rounded-md py-1.5 text-[11px] capitalize ${current.type.align === a ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <Ctrl label="Type scale" value={current.type.size} min={0.6} max={2} step={0.05} onChange={(v) => patch(current.id, (d) => ({ ...d, type: { ...d.type, size: v } }))} />
                <div className="flex gap-2">
                  <input type="color" aria-label="Text color" value={current.type.color} onChange={(e) => patch(current.id, (d) => ({ ...d, type: { ...d.type, color: e.target.value } }))} className="h-8 flex-1 cursor-pointer rounded bg-secondary" />
                  <input type="color" aria-label="Accent" value={current.type.accent} onChange={(e) => patch(current.id, (d) => ({ ...d, type: { ...d.type, accent: e.target.value } }))} className="h-8 flex-1 cursor-pointer rounded bg-secondary" />
                </div>
              </Section>

              <Section title="Export">
                <Select value={ratioKey} onValueChange={setRatioKey}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RATIOS.map((r) => (
                      <SelectItem key={r.key} value={r.key} className="text-xs">{r.label} · {r.w}×{r.h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((s) => (
                    <button key={s} onClick={() => setScale(s)} className={`flex-1 rounded-md py-1.5 text-[11px] ${scale === s ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {s}×
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {(["png", "jpeg", "webp"] as const).map((f) => (
                    <button key={f} onClick={() => setFormat(f)} className={`flex-1 rounded-md py-1.5 text-[11px] uppercase ${format === f ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <Button className="w-full gap-2" onClick={exportImage}>
                  <Download className="size-4" /> Export {ratio.w * scale}×{ratio.h * scale}
                </Button>
              </Section>
            </>
          ) : (
            <div className="space-y-5 p-5">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Canvas ratio</h3>
                <Select value={ratioKey} onValueChange={setRatioKey}>
                  <SelectTrigger className="mt-3 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RATIOS.map((r) => (
                      <SelectItem key={r.key} value={r.key} className="text-xs">{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Select a concept to open the editor. Layout, background, device treatment, typography and export
                settings become editable per variant, and every change is undoable.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Ctrl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{Math.round(value * 100) / 100}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v!)} />
    </div>
  );
}
