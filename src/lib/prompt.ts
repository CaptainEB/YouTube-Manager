export type PromptSection = { label: string; content: string };

type AssemblePromptInput = {
  systemPrompt: string;
  rules: string;
  userPrompt: string;
  channelContext?: string;
};

// The single place that combines system prompt + rules + (optional) channel context + user prompt
// into what actually gets sent to a model. Used by both the live preview and (later) the real call.
export function assembleFinalPrompt({
  systemPrompt,
  rules,
  userPrompt,
  channelContext,
}: AssemblePromptInput): { sections: PromptSection[]; fullText: string } {
  const sections: PromptSection[] = [{ label: "System Prompt", content: systemPrompt.trim() }];

  if (rules.trim()) {
    sections.push({ label: "Rules", content: rules.trim() });
  }

  if (channelContext?.trim()) {
    sections.push({ label: "Channel Context", content: channelContext.trim() });
  }

  sections.push({ label: "User Prompt", content: userPrompt.trim() });

  const fullText = sections
    .map((section) => `### ${section.label}\n${section.content}`)
    .join("\n\n");

  return { sections, fullText };
}
