import { z } from "zod";

import { GENERATION_FEATURES, type GenerationFeatureKey } from "@/config/features";
import promptsJson from "@config/prompts.json";

const featureKeys = GENERATION_FEATURES.map((feature) => feature.key) as [
  GenerationFeatureKey,
  ...GenerationFeatureKey[],
];

const promptsSchema = z.record(z.enum(featureKeys), z.object({ systemPrompt: z.string().min(1) }));

// Fails fast at startup if config/prompts.json is missing an entry or malformed, rather than
// surfacing a confusing error deep inside a page render later.
const prompts = promptsSchema.parse(promptsJson);

export function getSystemPrompt(feature: GenerationFeatureKey): string {
  return prompts[feature].systemPrompt;
}
