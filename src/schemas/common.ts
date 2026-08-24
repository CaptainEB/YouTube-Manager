import { z } from "zod";

export const idSchema = z.string().min(1).max(191);

// Transforms to null (not undefined) for blank input: on an update, undefined means "leave the
// column alone" to Prisma, which would make clearing a field impossible once it had a value.
export const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const optionalHttpsUrl = z
  .url({ protocol: /^https$/, error: "Must be a valid https:// URL" })
  .max(2048)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : null));
