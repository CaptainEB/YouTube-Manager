import { z } from "zod";

import { idSchema, optionalHttpsUrl, optionalText } from "@/schemas/common";

export const thumbnailStatusValues = ["draft", "in_progress", "completed"] as const;
export const thumbnailStatusSchema = z.enum(thumbnailStatusValues);
export type ThumbnailStatus = z.infer<typeof thumbnailStatusSchema>;

export const thumbnailInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  promptText: z.string().max(20000).default(""),
  imageUrl: optionalHttpsUrl,
  status: thumbnailStatusSchema.default("draft"),
  notes: optionalText(10000),
});

export const thumbnailUpdateSchema = thumbnailInputSchema.extend({ id: idSchema });

export type ThumbnailInput = z.infer<typeof thumbnailInputSchema>;
export type ThumbnailUpdateInput = z.infer<typeof thumbnailUpdateSchema>;
