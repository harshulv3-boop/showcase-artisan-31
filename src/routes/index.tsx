import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ImagePlus, Loader2, Sparkles, Trash2, X } from "lucide-react";
import { streamShowcaseImage } from "@/lib/streamImage";
import {
  MOOD_OPTIONS,
  RATIO_OPTIONS,
  buildShowcasePrompt,
  type MoodKey,
  type RatioKey,
} from "@/lib/showcase/imagePrompt";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Showcase Studio — AI Dribbble Showcase Image Maker" },
      {
        name: "description",
        content:
          "Upload your app screenshots and style references, and Showcase Studio art-directs finished Dribbble-quality showcase images with cinematic device placement, lighting and backgrounds.",
      },
      { property: "og:title", content: "Showcase Studio — AI Dribbble Showcase Image Maker" },
      {
        property: "og:description",
        content:
          "Finished, portfolio-worthy product showcase images generated from your screenshots — premium mockups, depth, lighting and art direction.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});

const uid = () => Math.random().toString(36).slice(2, 9);

type Upload = { id: string; name: string; url: string };
type Shot = {
  id: string;
  status: "queued" | "streaming" | "done" | "error";
  url: string | null;
  error?: string;
  label: string;
};

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

function Thumbs({ items, onRemove }: { items: Upload[]; onRemove: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((it) => (
        <div key={it.id} className="group relative overflow-hidden rounded-md border border-border/60 bg-muted/30">
          <img src={it.url} alt={it.name} className="aspect-square w-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(it.id)}
            className="absolute right-1 top-1 rounded bg-background/80 p-1 opacity-0 transition group-hover:opacity-100"
            aria-label={`Remove ${it.name}`}
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function Studio() {
  const [screens, setScreens] = useState<Upload[]>([]);
  const [refs, setRefs] = useState<Upload[]>([]);
  const [mood, setMood] = useState<MoodKey>("dark-cinematic");
  const [ratioKey, setRatioKey] = useState<RatioKey>("dribbble");
  const [count, setCount] = useState(4);
  const [headline, setHeadline] = useState("");
  const [sub, setSub] = useState("");
  const [product, setProduct] = useState("");
  const [extra, setExtra] = useState("");
  const [shots, setShots] = useState<Shot[]>([]);
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const shuffle = useRef(0);

  const ratio = RATIO_OPTIONS.find((r) => r.key === ratioKey)!;
  const moodDef = MOOD_OPTIONS.find((m) => m.key === mood)!;

  async function addFiles(files: FileList | null, kind: "screens" | "refs") {
    if (!files) return;
    const added: Upload[] = [];
    for (const file of Array.from(files).slice(0, 8)) {
      added.push({ id: uid(), name: file.name, url: await readFile(file) });
    }
    if (kind === "screens") setScreens((s) => [...s, ...added].slice(0, 8));
    else setRefs((r) => [...r, ...added].slice(0, 6));
  }

  const generate = useCallback(async () => {
    if (!screens.length) {
      toast.error("Upload at least one product screenshot");
      return;
    }
    setBusy(true);
    shuffle.current += 1;
    const seedShuffle = shuffle.current * 3;
    const initial: Shot[] = Array.from({ length: count }, (_, i) => ({
      id: uid(),
      status: "queued" as const,
      url: null,
      label: `Variation ${i + 1}`,
    }));
    setShots(initial);

    const screenUrls = screens.slice(0, 3).map((s) => s.url);
    const refUrls = refs.slice(0, 2).map((r) => r.url);

    await Promise.all(
      initial.map(async (shot, i) => {
        const prompt = buildShowcasePrompt({
          index: i,
          mood: moodDef,
          ratio,
          headline: headline.trim() || undefined,
          sub: sub.trim() || undefined,
          product: product.trim() || undefined,
          screenCount: screenUrls.length,
          refCount: refUrls.length,
          extra: extra.trim() || undefined,
          seedShuffle,
        });
        try {
          await streamShowcaseImage(
            { prompt, screens: screenUrls, refs: refUrls },
            (dataUrl, isFinal) => {
              setShots((prev) =>
                prev.map((s) =>
                  s.id === shot.id
                    ? { ...s, url: dataUrl, status: isFinal ? "done" : "streaming" }
                    : s,
                ),
              );
            },
          );
        } catch (err) {
          setShots((prev) =>
            prev.map((s) =>
              s.id === shot.id
                ? { ...s, status: "error", error: err instanceof Error ? err.message : "Failed" }
                : s,
            ),
          );
        }
      }),
    );
    setBusy(false);
  }, [screens, refs, count, moodDef, ratio, headline, sub, product, extra]);

  function download(url: string, i: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `showcase-${i + 1}.png`;
    a.click();
  }

  const aspect =
    ratioKey === "wide" ? "16 / 9" : ratioKey === "square" ? "1 / 1" : ratioKey === "portrait" ? "4 / 5" : "4 / 3";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Showcase Studio</h1>
            <p className="text-xs text-muted-foreground">AI showcase images — finished, not editable</p>
          </div>
        </div>
        <Button onClick={generate} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {busy ? "Art-directing…" : "Generate showcase"}
        </Button>
      </header>

      <div className="grid lg:grid-cols-[340px_1fr]">
        <aside className="border-r border-border/60">
          <Section
            title="Product screens"
            action={
              <label className="cursor-pointer text-xs text-primary">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files, "screens")}
                />
                Add
              </label>
            }
          >
            {screens.length ? (
              <Thumbs items={screens} onRemove={(id) => setScreens((s) => s.filter((x) => x.id !== id))} />
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files, "screens")}
                />
                <ImagePlus className="size-5" />
                Upload app screenshots
              </label>
            )}
          </Section>

          <Section
            title="Style references"
            action={
              <label className="cursor-pointer text-xs text-primary">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files, "refs")}
                />
                Add
              </label>
            }
          >
            <Thumbs items={refs} onRemove={(id) => setRefs((r) => r.filter((x) => x.id !== id))} />
            <p className="text-xs text-muted-foreground">
              References guide composition, framing and lighting — never copied literally.
            </p>
          </Section>

          <Section title="Look">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Mood</Label>
                <Select value={mood} onValueChange={(v) => setMood(v as MoodKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MOOD_OPTIONS.map((m) => (
                      <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Format</Label>
                <Select value={ratioKey} onValueChange={(v) => setRatioKey(v as RatioKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RATIO_OPTIONS.map((r) => (
                      <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Variations</Label>
                <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          <Section title="Copy">
            <div className="space-y-3">
              <Input placeholder="Product name" value={product} onChange={(e) => setProduct(e.target.value)} />
              <Input placeholder="Headline (optional)" value={headline} onChange={(e) => setHeadline(e.target.value)} />
              <Input placeholder="Subline (optional)" value={sub} onChange={(e) => setSub(e.target.value)} />
              <Textarea
                placeholder="Extra art direction (optional) — e.g. 'floating glass panels, teal rim light'"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                rows={3}
              />
            </div>
          </Section>
        </aside>

        <main className="p-6">
          {!shots.length ? (
            <div className="grid h-[70vh] place-items-center rounded-xl border border-dashed border-border/70 text-center">
              <div className="max-w-sm space-y-2">
                <h2 className="text-lg font-semibold">Finished showcase images</h2>
                <p className="text-sm text-muted-foreground">
                  Upload your screens, pick a mood, and generate polished Dribbble-style shots. Each variation is
                  art-directed differently — no templates, no canvas editing.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {shots.map((shot, i) => (
                <figure key={shot.id} className="space-y-2">
                  <div
                    className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20"
                    style={{ aspectRatio: aspect }}
                  >
                    {shot.url ? (
                      <img
                        src={shot.url}
                        alt={`${shot.label} showcase`}
                        onClick={() => shot.status === "done" && setLightbox(shot.url)}
                        className={`size-full cursor-zoom-in object-cover transition-[filter] duration-500 ${
                          shot.status === "done" ? "blur-0" : "blur-xl"
                        }`}
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-xs text-muted-foreground">
                        {shot.status === "error" ? (
                          <span className="px-6 text-center text-destructive">{shot.error}</span>
                        ) : (
                          <Loader2 className="size-5 animate-spin" />
                        )}
                      </div>
                    )}
                  </div>
                  <figcaption className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{shot.label}</span>
                    {shot.status === "done" && shot.url && (
                      <Button size="sm" variant="ghost" onClick={() => download(shot.url!, i)}>
                        <Download className="size-3.5" /> Download
                      </Button>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </main>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-8"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Showcase preview" className="max-h-full max-w-full rounded-lg object-contain" />
          <button className="absolute right-6 top-6 rounded-md border border-border p-2" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
