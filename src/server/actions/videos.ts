"use server";

import { revalidatePath } from "next/cache";

import { firstZodError, type ActionResult } from "@/lib/action-result";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/schemas/common";
import { videoInputSchema, videoUpdateSchema } from "@/schemas/video";

const withLinkedItems = {
  script: { select: { id: true, title: true } },
  thumbnail: { select: { id: true, title: true, imageUrl: true } },
  idea: { select: { id: true, title: true } },
} as const;

export async function listVideos() {
  const userId = await requireOwner();
  return prisma.video.findMany({
    where: { userId },
    include: withLinkedItems,
    orderBy: { updatedAt: "desc" },
  });
}

// Returns null (rather than throwing) so the calling page decides how to render a miss, e.g. notFound().
export async function getVideoDetail(id: string) {
  const userId = await requireOwner();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return null;
  }

  return prisma.video.findFirst({
    where: { id: parsedId.data, userId },
    include: withLinkedItems,
  });
}

// Feeds the Script/Thumbnail/Idea pickers on the video assembly page.
export async function listLinkableOptions() {
  const userId = await requireOwner();
  const [scripts, thumbnails, ideas] = await Promise.all([
    prisma.script.findMany({
      where: { userId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.thumbnail.findMany({
      where: { userId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.idea.findMany({
      where: { userId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);
  return { scripts, thumbnails, ideas };
}

// Prevents an id for a row that isn't yours from being linked in, even though the picker only ever
// offers your own rows — the server must not trust ids that come back from the client.
async function assertLinksBelongToUser(
  userId: string,
  links: { scriptId: string | null; thumbnailId: string | null; ideaId: string | null },
): Promise<string | null> {
  const checks: Promise<unknown>[] = [];
  if (links.scriptId) {
    checks.push(
      prisma.script
        .findFirst({ where: { id: links.scriptId, userId }, select: { id: true } })
        .then((row) => {
          if (!row) throw new Error("Script not found");
        }),
    );
  }
  if (links.thumbnailId) {
    checks.push(
      prisma.thumbnail
        .findFirst({ where: { id: links.thumbnailId, userId }, select: { id: true } })
        .then((row) => {
          if (!row) throw new Error("Thumbnail not found");
        }),
    );
  }
  if (links.ideaId) {
    checks.push(
      prisma.idea
        .findFirst({ where: { id: links.ideaId, userId }, select: { id: true } })
        .then((row) => {
          if (!row) throw new Error("Idea not found");
        }),
    );
  }

  try {
    await Promise.all(checks);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid link";
  }
}

export async function createVideo(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireOwner();
  const parsed = videoInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const linkError = await assertLinksBelongToUser(userId, parsed.data);
  if (linkError) {
    return { ok: false, error: linkError };
  }

  const video = await prisma.video.create({ data: { ...parsed.data, userId } });
  revalidatePath("/dashboard");
  return { ok: true, data: { id: video.id } };
}

export async function updateVideo(input: unknown): Promise<ActionResult> {
  const userId = await requireOwner();
  const parsed = videoUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const linkError = await assertLinksBelongToUser(userId, parsed.data);
  if (linkError) {
    return { ok: false, error: linkError };
  }

  const { id, ...data } = parsed.data;
  const result = await prisma.video.updateMany({ where: { id, userId }, data });
  if (result.count === 0) {
    return { ok: false, error: "Video not found" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
  return { ok: true, data: undefined };
}

export async function deleteVideo(id: unknown): Promise<ActionResult> {
  const userId = await requireOwner();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Invalid id" };
  }

  const result = await prisma.video.deleteMany({ where: { id: parsedId.data, userId } });
  if (result.count === 0) {
    return { ok: false, error: "Video not found" };
  }

  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}
