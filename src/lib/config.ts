import { z } from "zod";

import { GENERATION_FEATURES, type GenerationFeatureKey } from "@/config/features";
import modelsJson from "@config/models.json";
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

const modelSettingsSchema = z.object({
  // OpenRouter model slug, e.g. "google/gemini-3.7-flash" — see https://openrouter.ai/models.
  model: z.string().min(1),
  temperature: z.number().min(0).max(2),
  maxOutputTokens: z.number().int().min(1).max(32000),
});

const modelsSchema = z.object({
  _comment: z.string().optional(),
  default: modelSettingsSchema,
  scripts: modelSettingsSchema.partial().optional(),
  thumbnails: modelSettingsSchema.partial().optional(),
  ideas: modelSettingsSchema.partial().optional(),
  // Separate from "thumbnails" above: that's the text model that writes the title/image prompt,
  // this is the image-generation model that renders the actual thumbnail from that prompt.
  thumbnailImage: z.object({ model: z.string().min(1) }),
});

// Fails fast at startup if config/models.json is malformed, rather than surfacing a confusing
// error deep inside a generate action later.
const models = modelsSchema.parse(modelsJson);

export type ModelSettings = z.infer<typeof modelSettingsSchema>;

// "default" applies to every tab; a per-feature key in config/models.json overrides any subset of
// its fields (e.g. a cheaper/faster model for one tab only) without touching code.
export function getModelConfig(feature: GenerationFeatureKey): ModelSettings {
  return { ...models.default, ...models[feature] };
}

export function getImageModelConfig(): { model: string } {
  return models.thumbnailImage;
}
