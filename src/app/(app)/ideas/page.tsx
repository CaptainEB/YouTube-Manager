import { IdeasClient } from "@/app/(app)/ideas/_components/ideas-client";
import { buildChannelContext } from "@/lib/channel-context";
import { getSystemPrompt } from "@/lib/config";
import { listIdeas } from "@/server/actions/ideas";
import { getRule } from "@/server/actions/rules";

export default async function IdeasPage() {
  const [ideas, rule, channelContext] = await Promise.all([
    listIdeas(),
    getRule("ideas"),
    buildChannelContext(),
  ]);

  return (
    <IdeasClient
      ideas={ideas}
      systemPrompt={getSystemPrompt("ideas")}
      initialRules={rule?.content ?? ""}
      channelContext={channelContext}
    />
  );
}
