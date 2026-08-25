import { IdeasClient } from "@/app/(app)/ideas/_components/ideas-client";
import { listIdeas } from "@/server/actions/ideas";
import { getRule } from "@/server/actions/rules";

export default async function IdeasPage() {
  const [ideas, rule] = await Promise.all([listIdeas(), getRule("ideas")]);

  return <IdeasClient ideas={ideas} initialRules={rule?.content ?? ""} />;
}
