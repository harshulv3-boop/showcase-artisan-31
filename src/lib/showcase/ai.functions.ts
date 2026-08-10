import { createServerFn } from "@tanstack/react-start";
import type { AiDirectorInput } from "./ai.server";

export const artDirectFn = createServerFn({ method: "POST" })
  .inputValidator((data: AiDirectorInput) => data)
  .handler(async ({ data }) => {
    const { artDirect } = await import("./ai.server");
    return (await artDirect(data)) as {
      direction?: Record<string, unknown>;
      variants?: Record<string, unknown>[];
    };
  });
