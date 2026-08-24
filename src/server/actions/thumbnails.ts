"use server";

import { revalidatePath } from "next/cache";

import { firstZodError, type ActionResult } from "@/lib/action-result";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/schemas/common";
import { thumbnailInputSchema, thumbnailUpdateSchema } from "@/schemas/thumbnail";

export async function listThumbnails() {
  const userId = await requireOwner();
  return prisma.thumbnail.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function createThumbnail(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireOwner();
  const parsed = thumbnailInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const thumbnail = await prisma.thumbnail.create({ data: { ...parsed.data, userId } });
  revalidatePath("/thumbnails");
  return { ok: true, data: { id: thumbnail.id } };
}

export async function updateThumbnail(input: unknown): Promise<ActionResult> {
  const userId = await requireOwner();
  const parsed = thumbnailUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { id, ...data } = parsed.data;
  const result = await prisma.thumbnail.updateMany({ where: { id, userId }, data });
  if (result.count === 0) {
    return { ok: false, error: "Thumbnail not found" };
  }

  revalidatePath("/thumbnails");
  return { ok: true, data: undefined };
}

export async function deleteThumbnail(id: unknown): Promise<ActionResult> {
  const userId = await requireOwner();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Invalid id" };
  }

  const result = await prisma.thumbnail.deleteMany({ where: { id: parsedId.data, userId } });
  if (result.count === 0) {
    return { ok: false, error: "Thumbnail not found" };
  }

  revalidatePath("/thumbnails");
  return { ok: true, data: undefined };
}
