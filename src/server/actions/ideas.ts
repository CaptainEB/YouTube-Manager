"use server";

import { revalidatePath } from "next/cache";

import { firstZodError, type ActionResult } from "@/lib/action-result";
import { requireOwner } from "@/lib/auth";
import { buildChannelContext } from "@/lib/channel-context";
import { getModelConfig, getSystemPrompt } from "@/lib/config";
import { generateJsonCompletion } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";
import { assembleFinalPrompt, toChatMessages } from "@/lib/prompt";
import { generateInputSchema, idSchema } from "@/schemas/common";
import { ideaInputSchema, ideaUpdateSchema } from "@/schemas/idea";

export async function listIdeas() {
  const userId = await requireOwner();
  return prisma.idea.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function generateIdea(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireOwner();
  const parsed = generateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { rules, userPrompt } = parsed.data;
  const channelContext = await buildChannelContext();
  const { sections } = assembleFinalPrompt({
    systemPrompt: getSystemPrompt("ideas"),
    rules,
    userPrompt,
    channelContext,
  });
  const modelConfig = getModelConfig("ideas");

  let generated: unknown;
  try {
    generated = await generateJsonCompletion({
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      maxOutputTokens: modelConfig.maxOutputTokens,
      messages: toChatMessages(sections),
      jsonSchema: {
        name: "idea",
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "A short, catchy title for the video idea." },
            description: {
              type: "string",
              description: "The hook and rationale for why this idea will perform well.",
            },
          },
          required: ["title", "description"],
          additionalProperties: false,
        },
      },
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Generation failed" };
  }

  const parsedIdea = ideaInputSchema.safeParse(generated);
  if (!parsedIdea.success) {
    return { ok: false, error: "The model returned an unexpected response. Please try again." };
  }

  const idea = await prisma.idea.create({
    data: {
      ...parsedIdea.data,
      userId,
      generationRules: rules || null,
      generationPrompt: userPrompt,
    },
  });
  revalidatePath("/ideas");
  return { ok: true, data: { id: idea.id } };
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
