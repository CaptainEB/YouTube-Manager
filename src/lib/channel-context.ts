import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Compiles the user's published videos into the "channel context" block injected into Ideas prompts.
export async function buildChannelContext(): Promise<string> {
  const userId = await requireOwner();
  const videos = await prisma.video.findMany({
    where: { userId, status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 25,
    include: { idea: { select: { title: true } } },
  });

  if (videos.length === 0) {
    return "";
  }

  return videos
    .map((video) => {
      const tags = Array.isArray(video.tags)
        ? video.tags.filter((tag) => typeof tag === "string")
        : [];
      const lines = [`- ${video.title}`];
      if (video.idea?.title) {
        lines.push(`  Idea: ${video.idea.title}`);
      }
      if (video.description) {
        lines.push(`  Description: ${video.description}`);
      }
      if (tags.length > 0) {
        lines.push(`  Tags: ${tags.join(", ")}`);
      }
      if (video.publishedAt) {
        lines.push(`  Published: ${video.publishedAt.toISOString().slice(0, 10)}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}
