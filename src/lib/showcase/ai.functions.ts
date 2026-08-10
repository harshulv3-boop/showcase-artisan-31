import { createServerFn } from "@tanstack/react-start";
import type { AiDirectorInput } from "./ai.server";

/** Returns the raw art-direction JSON as a string (kept serializable). */
export const artDirectFn = createServerFn({ method: "POST" })
  .inputValidator((data: AiDirectorInput) => data)
  .handler(async ({ data }): Promise<string> => {
    const { artDirect } = await import("./ai.server");
    return JSON.stringify(await artDirect(data));
  });
