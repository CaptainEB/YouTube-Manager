import { z } from "zod";

import { idSchema, optionalText } from "@/schemas/common";

export const ideaStatusValues = ["new", "in_progress", "used", "archived"] as const;
export const ideaStatusSchema = z.enum(ideaStatusValues);
export type IdeaStatus = z.infer<typeof ideaStatusSchema>;

export const ideaInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText(10000),
  status: ideaStatusSchema.default("new"),
  notes: optionalText(10000),
});

export const ideaUpdateSchema = ideaInputSchema.extend({ id: idSchema });

export type IdeaInput = z.infer<typeof ideaInputSchema>;
export type IdeaUpdateInput = z.infer<typeof ideaUpdateSchema>;
