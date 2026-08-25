"use server";

import { revalidatePath } from "next/cache";

import { firstZodError, type ActionResult } from "@/lib/action-result";
import { requireOwner } from "@/lib/auth";
import { getModelConfig, getSystemPrompt } from "@/lib/config";
import { generateJsonCompletion } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";
import { assembleFinalPrompt, toChatMessages } from "@/lib/prompt";
import { generateInputSchema, idSchema } from "@/schemas/common";
import { scriptInputSchema, scriptUpdateSchema } from "@/schemas/script";

export async function listScripts() {
  const userId = await requireOwner();
  return prisma.script.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function generateScript(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireOwner();
  const parsed = generateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { rules, userPrompt } = parsed.data;
  const { sections } = assembleFinalPrompt({
    systemPrompt: getSystemPrompt("scripts"),
    rules,
    userPrompt,
  });
  const modelConfig = getModelConfig("scripts");

  let generated: unknown;
  try {
    generated = await generateJsonCompletion({
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      maxOutputTokens: modelConfig.maxOutputTokens,
      messages: toChatMessages(sections),
      jsonSchema: {
        name: "script",
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "A short, descriptive title for the video this script is for.",
            },
            content: {
              type: "string",
              description: "The full script, following all instructions in the system prompt.",
            },
          },
          required: ["title", "content"],
          additionalProperties: false,
        },
      },
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Generation failed" };
  }

  const parsedScript = scriptInputSchema.safeParse(generated);
  if (!parsedScript.success) {
    return { ok: false, error: "The model returned an unexpected response. Please try again." };
  }

  const script = await prisma.script.create({
    data: {
      ...parsedScript.data,
      userId,
      generationRules: rules || null,
      generationPrompt: userPrompt,
    },
  });
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
