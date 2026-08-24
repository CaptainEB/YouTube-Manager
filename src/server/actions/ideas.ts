"use server";

import { revalidatePath } from "next/cache";

import { firstZodError, type ActionResult } from "@/lib/action-result";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/schemas/common";
import { ideaInputSchema, ideaUpdateSchema } from "@/schemas/idea";

export async function listIdeas() {
  const userId = await requireOwner();
  return prisma.idea.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function createIdea(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireOwner();
  const parsed = ideaInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const idea = await prisma.idea.create({ data: { ...parsed.data, userId } });
  revalidatePath("/ideas");
  return { ok: true, data: { id: idea.id } };
}

export async function updateIdea(input: unknown): Promise<ActionResult> {
  const userId = await requireOwner();
  const parsed = ideaUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { id, ...data } = parsed.data;
  const result = await prisma.idea.updateMany({ where: { id, userId }, data });
  if (result.count === 0) {
    return { ok: false, error: "Idea not found" };
  }

  revalidatePath("/ideas");
  return { ok: true, data: undefined };
}

export async function deleteIdea(id: unknown): Promise<ActionResult> {
  const userId = await requireOwner();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Invalid id" };
  }

  const result = await prisma.idea.deleteMany({ where: { id: parsedId.data, userId } });
  if (result.count === 0) {
    return { ok: false, error: "Idea not found" };
  }

  revalidatePath("/ideas");
  return { ok: true, data: undefined };
}
