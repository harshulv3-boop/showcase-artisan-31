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
  MOODS,
  OUTPUTS,
  RATIOS,
  analyseImage,
  composeVariants,
  critique,
  deriveDirection,
} from "@/lib/showcase/engine";
import { applyAiDirection } from "@/lib/showcase/direction";
import { artDirectFn } from "@/lib/showcase/ai.functions";
import type {
  AiPlan,
  Brand,
  Composition,
  FontKey,
  OutputType,
  PresetKey,
  Reference,
  ReferenceRole,
  Screen,
} from "@/lib/showcase/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Showcase Studio — Reference-Driven Product Showcases" },
      {
        name: "description",
        content:
          "Upload references, and Showcase Studio reads their composition, lighting, perspective and typography to art-direct original Dribbble shots, Product Hunt galleries and portfolio covers from your screenshots.",
      },
      { property: "og:title", content: "Showcase Studio — Reference-Driven Product Showcases" },
      {
        property: "og:description",
        content:
          "Reference intelligence extracts design principles and generates original compositions — no templates, no reused layouts.",
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
  { key: "device", label: "Device treatment" },
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
  const [output, setOutput] = useState<OutputType>("dribbble");
  const [mood, setMood] = useState<PresetKey>("dark-cinematic");
  const [brand, setBrand] = useState<Brand>({
    product: "",
    headline: "Ship better campaigns",
    sub: "One workspace for every channel your team runs.",
    cta: "",
    logo: null,
    primary: "#ffffff",
    accent: "",
    font: "auto",
  });
  const [comps, setComps] = useState<Composition[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [selNode, setSelNode] = useState(0);
  const [ratioKey, setRatioKey] = useState("dribbble");
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [history, setHistory] = useState<Composition[][]>([]);
  const [future, setFuture] = useState<Composition[][]>([]);
  const [busy, setBusy] = useState(false);
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null);
  const saltRef = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const ratio = RATIOS.find((r) => r.key === ratioKey) ?? RATIOS[0]!;
  const current = comps.find((c) => c.id === editing) ?? null;

  const baseDirection = useMemo(() => deriveDirection(refs, brand, mood), [refs, brand, mood]);
  const direction = useMemo(
    () => applyAiDirection(baseDirection, aiPlan?.direction),
    [baseDirection, aiPlan],
  );

  const commit = useCallback(
    (next: Composition[]) => {
      setHistory((h) => [...h.slice(-40), comps]);
      setFuture([]);
      setComps(next);
    },
    [comps],
  );

  const patch = (id: string, fn: (c: Composition) => Composition) =>
    commit(comps.map((c) => (c.id === id ? fn(c) : c)));

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      setFuture((f) => [comps, ...f]);
      setComps(h[h.length - 1]!);
      return h.slice(0, -1);
    });
  };
  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      setHistory((h) => [...h, comps]);
      setComps(f[0]!);
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
      const signals = await analyseImage(url);
      added.push({ id: uid(), name: file.name, url, role: "auto", signals });
    }
    setRefs((r) => [...r, ...added].slice(0, 12));
    toast.success(`${added.length} reference${added.length > 1 ? "s" : ""} analysed`);
  }

  async function onLogo(files: FileList | null) {
    if (!files?.[0]) return;
    const url = await readFile(files[0]);
    setBrand((b) => ({ ...b, logo: url }));
  }

  function generate() {
    if (!screens.length) {
      toast.error("Upload at least one product screen first");
      return;
    }
    setBusy(true);
    saltRef.current += 1;
    setTimeout(() => {
      const next = composeVariants({
        dir: direction,
        screens,
        brand,
        output,
        ratio,
        count: 6,
        salt: saltRef.current,
      });
      setHistory((h) => [...h, comps]);
      setFuture([]);
      setComps(next);
      setEditing(null);
      setBusy(false);
      toast.success(
        refs.length
          ? `${next.length} original compositions art-directed from ${refs.length} reference${refs.length > 1 ? "s" : ""}`
          : `${next.length} original compositions generated`,
      );
    }, 300);
  }

  function regenerateOne(id: string) {
    saltRef.current += 1;
    const fresh = composeVariants({
      dir: direction,
      screens,
      brand,
      output,
      ratio,
      count: 8,
      salt: saltRef.current * 31,
    });
    const currentArr = comps.find((c) => c.id === id)?.arrangement;
    const alt = fresh.find((f) => f.arrangement !== currentArr) ?? fresh[0]!;
    patch(id, (c) => ({ ...alt, id: c.id }));
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

  const previewW = 900;
  const fit = previewW / ratio.w;
  const node = current?.nodes[Math.min(selNode, current.nodes.length - 1)] ?? null;

  const setNode = (fn: (n: NonNullable<typeof node>) => Partial<NonNullable<typeof node>>) => {
    if (!current || !node) return;
    const idx = Math.min(selNode, current.nodes.length - 1);
    patch(current.id, (c) => ({
      ...c,
      nodes: c.nodes.map((n, i) => (i === idx ? { ...n, ...fn(n) } : n)),
    }));
  };

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
            <p className="text-[11px] text-muted-foreground">Reference intelligence → original art direction</p>
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
            {busy ? "Art-directing…" : comps.length ? "Re-art-direct" : "Generate"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <aside className="w-[320px] shrink-0 overflow-y-auto border-r border-border/60">
          <Section title="Product screens" action={<span className="text-[11px] text-muted-foreground">{screens.length}</span>}>
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
                  <button className="text-muted-foreground hover:text-destructive" onClick={() => setScreens((a) => a.filter((x) => x.id !== s.id))} aria-label="Remove screen">
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
                  <Select value={r.role} onValueChange={(v) => setRefs((a) => a.map((x) => (x.id === r.id ? { ...x, role: v as ReferenceRole } : x)))}>
                    <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REF_ROLES.map((role) => (
                        <SelectItem key={role.key} value={role.key} className="text-xs">{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button className="text-muted-foreground hover:text-destructive" onClick={() => setRefs((a) => a.filter((x) => x.id !== r.id))} aria-label="Remove reference">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Extracted design principles">
            <div className="space-y-2 rounded-md bg-secondary/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
              {direction.notes.map((n) => (
                <p key={n}>· {n}</p>
              ))}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[10px] uppercase tracking-wider">
                <span>Density {Math.round(direction.density * 100)}</span>
                <span>Air {Math.round(direction.negativeSpace * 100)}</span>
                <span>Symmetry {Math.round(direction.symmetry * 100)}</span>
                <span>Bleed {Math.round(direction.bleed * 100)}</span>
                <span>Tilt {Math.round(direction.perspective.tiltY)}°</span>
                <span>Light {Math.round(direction.lighting.intensity * 100)}</span>
                <span>Type {direction.typography.font}</span>
                <span>Decor {Math.round(direction.decor.intensity * 100)}</span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {direction.palette.map((c) => (
                  <span key={c} className="size-4 rounded-sm border border-border/50" style={{ background: c }} />
                ))}
              </div>
            </div>
            {!refs.length && (
              <p className="text-[11px] text-muted-foreground">
                No references yet — principles come from the fallback mood below. Attach references to art-direct from
                their actual composition, lighting and typography.
              </p>
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
                <input
                  type="color"
                  value={brand.accent || direction.accent}
                  onChange={(e) => setBrand({ ...brand, accent: e.target.value })}
                  className="h-9 w-10 cursor-pointer rounded-md bg-secondary"
                  aria-label="Accent color override"
                />
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

          <Section title="Fallback mood (used when no references)">
            <div className="grid grid-cols-2 gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  disabled={refs.length > 0}
                  className={`flex items-center gap-2 rounded-md p-2 text-left text-[11px] transition-colors disabled:opacity-40 ${mood === m.key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  <span className="size-3 shrink-0 rounded-sm" style={{ background: `linear-gradient(135deg, ${m.palette[0]}, ${m.palette[2]})` }} />
                  {m.label}
                </button>
              ))}
            </div>
          </Section>
        </aside>

        {/* CENTER */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-8">
          {!comps.length ? (
            <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-secondary">
                <Layers className="size-6 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold">Art-direct your first showcase</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload product screens and reference shots. Showcase Studio measures the references' composition,
                lighting, perspective, density and typography, then composes original scenes from those principles —
                no templates involved.
              </p>
            </div>
          ) : current ? (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => setEditing(null)}>
                  <ArrowLeft className="size-4" /> All concepts
                </Button>
                <span className="text-xs capitalize text-muted-foreground">{current.label}</span>
              </div>
              <div className="mx-auto overflow-hidden rounded-lg shadow-2xl" style={{ width: previewW, height: ratio.h * fit }}>
                <div style={{ transform: `scale(${fit})`, transformOrigin: "top left", width: ratio.w, height: ratio.h }}>
                  <div ref={canvasRef}>
                    <ShowcaseRender comp={current} screens={screens} brand={brand} width={ratio.w} height={ratio.h} />
                  </div>
                </div>
              </div>
              <ul className="mx-auto mt-4 max-w-[900px] space-y-1 rounded-md border border-border/60 bg-card p-3 text-[11px] text-muted-foreground">
                <li className="font-medium text-foreground">Composition notes</li>
                {current.notes.map((n) => (
                  <li key={n}>· {n}</li>
                ))}
                {critique(current, screens, brand).map((c) => (
                  <li key={c} className="text-destructive">! {c}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {comps.map((c) => {
                const w = 380;
                const f = w / ratio.w;
                return (
                  <div key={c.id} className="group space-y-2">
                    <div className="overflow-hidden rounded-lg shadow-lg" style={{ width: w, height: ratio.h * f }}>
                      <div style={{ transform: `scale(${f})`, transformOrigin: "top left", width: ratio.w, height: ratio.h }}>
                        <ShowcaseRender comp={c} screens={screens} brand={brand} width={ratio.w} height={ratio.h} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => { setEditing(c.id); setSelNode(0); }}>Use this</Button>
                      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => regenerateOne(c.id)}>
                        <RefreshCw className="size-3.5" /> Variation
                      </Button>
                      <span className="ml-auto text-[11px] capitalize text-muted-foreground">{c.label}</span>
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
              <Section title="Composition">
                <div className="flex flex-wrap gap-1.5">
                  {current.nodes.map((n, i) => {
                    const s = screens.find((x) => x.id === n.screenId);
                    return (
                      <button
                        key={n.id + i}
                        onClick={() => setSelNode(i)}
                        className={`overflow-hidden rounded border-2 transition-colors ${i === Math.min(selNode, current.nodes.length - 1) ? "border-accent" : "border-transparent opacity-50"}`}
                        aria-label={`Select plane ${i + 1}`}
                      >
                        {s && <img src={s.url} alt="" className="size-10 object-cover" />}
                      </button>
                    );
                  })}
                </div>
                {node && (
                  <>
                    <Ctrl label="Position X" value={node.x} min={-0.2} max={1.2} step={0.01} onChange={(v) => setNode(() => ({ x: v }))} />
                    <Ctrl label="Position Y" value={node.y} min={-0.2} max={1.2} step={0.01} onChange={(v) => setNode(() => ({ y: v }))} />
                    <Ctrl label="Size" value={node.w} min={0.05} max={1.3} step={0.01} onChange={(v) => setNode(() => ({ w: v }))} />
                    <Ctrl label="Rotate" value={node.rotate} min={-30} max={30} step={1} onChange={(v) => setNode(() => ({ rotate: v }))} />
                    <Ctrl label="Tilt Y" value={node.tiltY} min={-50} max={50} step={1} onChange={(v) => setNode(() => ({ tiltY: v }))} />
                    <Ctrl label="Depth blur" value={node.blur} min={0} max={6} step={0.2} onChange={(v) => setNode(() => ({ blur: v }))} />
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Remove plane</Label>
                      <Button size="sm" variant="ghost" onClick={() => patch(current.id, (c) => ({ ...c, nodes: c.nodes.filter((_, i) => i !== Math.min(selNode, c.nodes.length - 1)) }))}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </>
                )}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[11px] text-muted-foreground">Scene</Label>
                  <Ctrl label="Global scale" value={current.tune.scale} min={0.5} max={1.6} step={0.02} onChange={(v) => patch(current.id, (c) => ({ ...c, tune: { ...c.tune, scale: v } }))} />
                  <Ctrl label="Spread" value={current.tune.spread} min={0.4} max={1.6} step={0.02} onChange={(v) => patch(current.id, (c) => ({ ...c, tune: { ...c.tune, spread: v } }))} />
                  <Ctrl label="Perspective" value={current.tune.tilt} min={0} max={2} step={0.05} onChange={(v) => patch(current.id, (c) => ({ ...c, tune: { ...c.tune, tilt: v } }))} />
                </div>
                <Button size="sm" variant="secondary" className="w-full gap-1.5" onClick={() => regenerateOne(current.id)}>
                  <RefreshCw className="size-3.5" /> Recompose this concept
                </Button>
              </Section>

              <Section title="Background">
                <div className="flex gap-2">
                  <input type="color" aria-label="Base" value={current.base} onChange={(e) => patch(current.id, (c) => ({ ...c, base: e.target.value }))} className="h-8 flex-1 cursor-pointer rounded bg-secondary" />
                </div>
                <Ctrl label="Grain" value={current.grain} min={0} max={0.3} step={0.01} onChange={(v) => patch(current.id, (c) => ({ ...c, grain: v }))} />
                <Ctrl label="Vignette" value={current.vignette} min={0} max={0.7} step={0.01} onChange={(v) => patch(current.id, (c) => ({ ...c, vignette: v }))} />
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  {current.layers.length} generated light and field layers derived from the reference lighting angle.
                </p>
              </Section>

              <Section title="Device treatment">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Show frames</Label>
                  <Switch checked={current.device.frame} onCheckedChange={(v) => patch(current.id, (c) => ({ ...c, device: { ...c.device, frame: v }, nodes: c.nodes.map((n) => ({ ...n, frame: n.crop ? false : v })) }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Light bezel</Label>
                  <Switch checked={current.device.bezel === "light"} onCheckedChange={(v) => patch(current.id, (c) => ({ ...c, device: { ...c.device, bezel: v ? "light" : "dark" } }))} />
                </div>
                <Ctrl label="Corner radius" value={current.device.radius} min={0} max={40} step={1} onChange={(v) => patch(current.id, (c) => ({ ...c, device: { ...c.device, radius: v } }))} />
                <Ctrl label="Shadow" value={current.device.shadow} min={0} max={1.3} step={0.05} onChange={(v) => patch(current.id, (c) => ({ ...c, device: { ...c.device, shadow: v } }))} />
                <Ctrl label="Edge light" value={current.device.edgeLight} min={0} max={1} step={0.05} onChange={(v) => patch(current.id, (c) => ({ ...c, device: { ...c.device, edgeLight: v } }))} />
                <Ctrl label="Gloss" value={current.device.glass} min={0} max={1} step={0.05} onChange={(v) => patch(current.id, (c) => ({ ...c, device: { ...c.device, glass: v } }))} />
              </Section>

              <Section title="Typography">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Show copy</Label>
                  <Switch checked={current.text.show} onCheckedChange={(v) => patch(current.id, (c) => ({ ...c, text: { ...c.text, show: v } }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Uppercase</Label>
                  <Switch checked={current.text.upper} onCheckedChange={(v) => patch(current.id, (c) => ({ ...c, text: { ...c.text, upper: v } }))} />
                </div>
                <Select value={current.text.font} onValueChange={(v) => patch(current.id, (c) => ({ ...c, text: { ...c.text, font: v as FontKey } }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["grotesk", "sans", "serif", "mono"].map((f) => (
                      <SelectItem key={f} value={f} className="text-xs capitalize">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1.5">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => patch(current.id, (c) => ({ ...c, text: { ...c.text, align: a } }))}
                      className={`flex-1 rounded-md py-1.5 text-[11px] capitalize ${current.text.align === a ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <Ctrl label="Type scale" value={current.text.scale} min={0.5} max={2.2} step={0.05} onChange={(v) => patch(current.id, (c) => ({ ...c, text: { ...c.text, scale: v } }))} />
                <Ctrl label="Tracking" value={current.text.tracking} min={-0.06} max={0.2} step={0.005} onChange={(v) => patch(current.id, (c) => ({ ...c, text: { ...c.text, tracking: v } }))} />
                <Ctrl label="Block X" value={current.text.x} min={0} max={0.95} step={0.01} onChange={(v) => patch(current.id, (c) => ({ ...c, text: { ...c.text, x: v } }))} />
                <Ctrl label="Block Y" value={current.text.y} min={0} max={0.95} step={0.01} onChange={(v) => patch(current.id, (c) => ({ ...c, text: { ...c.text, y: v } }))} />
                <div className="flex gap-2">
                  <input type="color" aria-label="Text color" value={current.text.color} onChange={(e) => patch(current.id, (c) => ({ ...c, text: { ...c.text, color: e.target.value } }))} className="h-8 flex-1 cursor-pointer rounded bg-secondary" />
                  <input type="color" aria-label="Accent" value={current.text.accent} onChange={(e) => patch(current.id, (c) => ({ ...c, text: { ...c.text, accent: e.target.value } }))} className="h-8 flex-1 cursor-pointer rounded bg-secondary" />
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
                Every concept is composed from scratch: placement, depth, lighting, decorative language and type
                treatment are sampled per variant from the extracted principles. Pick one to fine-tune each plane.
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
