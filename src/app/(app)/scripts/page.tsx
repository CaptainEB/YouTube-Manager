import { ScriptsClient } from "@/app/(app)/scripts/_components/scripts-client";
import { getSystemPrompt } from "@/lib/config";
import { getRule } from "@/server/actions/rules";
import { listScripts } from "@/server/actions/scripts";

export default async function ScriptsPage() {
  const [scripts, rule] = await Promise.all([listScripts(), getRule("scripts")]);

  return (
    <ScriptsClient
      scripts={scripts}
      systemPrompt={getSystemPrompt("scripts")}
      initialRules={rule?.content ?? ""}
    />
  );
}
