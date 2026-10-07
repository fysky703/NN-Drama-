import { z } from "zod";

export const viewportSchema = z.object({
  name: z.enum(["desktop", "tablet", "mobile"]),
  width: z.number().int().min(240).max(3840),
  height: z.number().int().min(240).max(2160),
});

export const frameworkSchema = z.enum(["nextjs", "react", "html"]);

export const createScanSchema = z.object({
  url: z.string().min(1, "Please enter a URL."),
  framework: frameworkSchema.optional(),
  viewports: z.array(viewportSchema).max(6).optional(),
  aiProvider: z.string().optional(),
  options: z
    .object({
      waitForNetworkIdle: z.boolean().optional(),
      fullPage: z.boolean().optional(),
    })
    .optional(),
});

export const generateCodeSchema = z.object({
  framework: frameworkSchema.optional(),
});

export const refineSchema = z.object({
  target: z.number().min(0).max(100).optional(),
  maxIterations: z.number().int().min(1).max(10).optional(),
});

export const compareSchema = z.object({
  viewport: z.enum(["desktop", "tablet", "mobile"]).optional(),
});

export type CreateScanPayload = z.infer<typeof createScanSchema>;

/** Worker -> web internal progress callback. */
export const workerProgressSchema = z.object({
  step: z.string(),
  label: z.string(),
  state: z.enum(["pending", "active", "done", "error"]),
  detail: z.string().optional(),
});

export const workerCompleteSchema = z.object({
  report: z.unknown(),
});

export const workerFailSchema = z.object({
  error: z.string(),
});
