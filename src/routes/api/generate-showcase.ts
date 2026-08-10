import { createFileRoute } from "@tanstack/react-router";

type Body = {
  prompt: string;
  screens?: string[];
  refs?: string[];
};

export const Route = createFileRoute("/api/generate-showcase")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt, screens = [], refs = [] } = (await request.json()) as Body;
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const content: Array<Record<string, unknown>> = [{ type: "text", text: prompt }];
        for (const url of screens.slice(0, 3)) {
          content.push({ type: "image_url", image_url: { url } });
        }
        for (const url of refs.slice(0, 2)) {
          content.push({ type: "image_url", image_url: { url } });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image",
            messages: [{ role: "user", content }],
            modalities: ["image", "text"],
            stream: true,
          }),
        });
        if (!upstream.ok || !upstream.body) {
          return new Response(await upstream.text(), { status: upstream.status });
        }
        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});
