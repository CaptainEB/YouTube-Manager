"use server";

import { revalidatePath } from "next/cache";

import { firstZodError, type ActionResult } from "@/lib/action-result";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/schemas/common";
import { scriptInputSchema, scriptUpdateSchema } from "@/schemas/script";

export async function listScripts() {
  const userId = await requireOwner();
  return prisma.script.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function createScript(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireOwner();
  const parsed = scriptInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const script = await prisma.script.create({ data: { ...parsed.data, userId } });
  revalidatePath("/scripts");
  return { ok: true, data: { id: script.id } };
}

export async function updateScript(input: unknown): Promise<ActionResult> {
  const userId = await requireOwner();
  const parsed = scriptUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { id, ...data } = parsed.data;
  const result = await prisma.script.updateMany({ where: { id, userId }, data });
  if (result.count === 0) {
    return { ok: false, error: "Script not found" };
  }

  revalidatePath("/scripts");
  return { ok: true, data: undefined };
}

export async function deleteScript(id: unknown): Promise<ActionResult> {
  const userId = await requireOwner();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Invalid id" };
  }

  const result = await prisma.script.deleteMany({ where: { id: parsedId.data, userId } });
  if (result.count === 0) {
    return { ok: false, error: "Script not found" };
  }

  revalidatePath("/scripts");
  return { ok: true, data: undefined };
}
