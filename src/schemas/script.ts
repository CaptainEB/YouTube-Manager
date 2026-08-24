import { z } from "zod";

import { idSchema, optionalText } from "@/schemas/common";

export const scriptStatusValues = ["draft", "in_progress", "completed"] as const;
export const scriptStatusSchema = z.enum(scriptStatusValues);
export type ScriptStatus = z.infer<typeof scriptStatusSchema>;

export const scriptInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().max(50000).default(""),
  status: scriptStatusSchema.default("draft"),
  notes: optionalText(10000),
});

export const scriptUpdateSchema = scriptInputSchema.extend({ id: idSchema });

export type ScriptInput = z.infer<typeof scriptInputSchema>;
export type ScriptUpdateInput = z.infer<typeof scriptUpdateSchema>;
