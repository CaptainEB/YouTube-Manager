"use server";

import { revalidatePath } from "next/cache";

import type { GenerationFeatureKey } from "@/config/features";
import { firstZodError, type ActionResult } from "@/lib/action-result";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ruleInputSchema } from "@/schemas/rule";

export async function getRule(feature: GenerationFeatureKey) {
  const userId = await requireOwner();
  return prisma.rule.findUnique({ where: { userId_feature: { userId, feature } } });
}

// Upserted on every autosave, so the client doesn't need to know whether a row exists yet.
export async function saveRule(input: unknown): Promise<ActionResult> {
  const userId = await requireOwner();
  const parsed = ruleInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { feature, content } = parsed.data;
  await prisma.rule.upsert({
    where: { userId_feature: { userId, feature } },
    create: { userId, feature, content },
    update: { content },
  });

  revalidatePath(`/${feature}`);
  return { ok: true, data: undefined };
}
