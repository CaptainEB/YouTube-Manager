"use server";

import { revalidatePath } from "next/cache";

import { firstZodError, type ActionResult } from "@/lib/action-result";
import { requireOwner } from "@/lib/auth";
import { getImageModelConfig, getModelConfig, getSystemPrompt } from "@/lib/config";
import { generateImage, generateJsonCompletion } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";
import { assembleFinalPrompt, toChatMessages } from "@/lib/prompt";
import { uploadThumbnailImage } from "@/lib/r2";
import { generateInputSchema, idSchema } from "@/schemas/common";
import { thumbnailInputSchema, thumbnailUpdateSchema } from "@/schemas/thumbnail";

export async function listThumbnails() {
  const userId = await requireOwner();
  return prisma.thumbnail.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function generateThumbnail(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireOwner();
  const parsed = generateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { rules, userPrompt } = parsed.data;
  const { sections } = assembleFinalPrompt({
    systemPrompt: getSystemPrompt("thumbnails"),
    rules,
    userPrompt,
  });
  const modelConfig = getModelConfig("thumbnails");

  let generated: unknown;
  try {
    generated = await generateJsonCompletion({
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      maxOutputTokens: modelConfig.maxOutputTokens,
      messages: toChatMessages(sections),
      jsonSchema: {
        name: "thumbnail",
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "A short, descriptive title for the thumbnail concept.",
            },
            promptText: {
              type: "string",
              description:
                "An image-generation prompt describing the finished thumbnail design, following all instructions in the system prompt.",
            },
          },
          required: ["title", "promptText"],
          additionalProperties: false,
        },
      },
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Generation failed" };
  }

  const parsedThumbnail = thumbnailInputSchema.safeParse(generated);
  if (!parsedThumbnail.success) {
    return { ok: false, error: "The model returned an unexpected response. Please try again." };
  }

  let imageUrl: string;
  try {
    const imageModel = getImageModelConfig();
    const image = await generateImage({
      model: imageModel.model,
      prompt: parsedThumbnail.data.promptText,
      aspectRatio: "16:9",
    });
    imageUrl = await uploadThumbnailImage({
      userId,
      data: image.data,
      contentType: image.contentType,
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Image generation failed" };
  }

  const thumbnail = await prisma.thumbnail.create({
    data: {
      ...parsedThumbnail.data,
      imageUrl,
      userId,
      generationRules: rules || null,
      generationPrompt: userPrompt,
    },
  });
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
