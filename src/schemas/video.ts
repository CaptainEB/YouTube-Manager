import { z } from "zod";

import { idSchema, optionalHttpsUrl, optionalText } from "@/schemas/common";

export const videoStatusValues = ["planned", "in_progress", "published"] as const;
export const videoStatusSchema = z.enum(videoStatusValues);
export type VideoStatus = z.infer<typeof videoStatusSchema>;

// A Select with a "None" option posts "" for an unlinked reference; that's normalized to null here
// so the server action can tell "clear the link" apart from "leave it alone" isn't needed — links
// are always sent in full on save.
const linkId = z
  .union([idSchema, z.literal("")])
  .nullable()
  .optional()
  .transform((value) => (value ? value : null));

const tagsInput = z
  .string()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((value) =>
    (value ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  );

const optionalDate = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? new Date(value) : null));

export const videoInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText(10000),
  videoUrl: optionalHttpsUrl,
  status: videoStatusSchema.default("planned"),
  tags: tagsInput,
  publishedAt: optionalDate,
  notes: optionalText(10000),
  scriptId: linkId,
  thumbnailId: linkId,
  ideaId: linkId,
});

export const videoUpdateSchema = videoInputSchema.extend({ id: idSchema });

export type VideoInput = z.infer<typeof videoInputSchema>;
export type VideoUpdateInput = z.infer<typeof videoUpdateSchema>;
