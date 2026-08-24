import { ThumbnailsClient } from "@/app/(app)/thumbnails/_components/thumbnails-client";
import { getSystemPrompt } from "@/lib/config";
import { getRule } from "@/server/actions/rules";
import { listThumbnails } from "@/server/actions/thumbnails";

export default async function ThumbnailsPage() {
  const [thumbnails, rule] = await Promise.all([listThumbnails(), getRule("thumbnails")]);

  return (
    <ThumbnailsClient
      thumbnails={thumbnails}
      systemPrompt={getSystemPrompt("thumbnails")}
      initialRules={rule?.content ?? ""}
    />
  );
}
