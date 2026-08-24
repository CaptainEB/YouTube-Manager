import { z } from "zod";

import { GENERATION_FEATURES, type GenerationFeatureKey } from "@/config/features";

const featureKeys = GENERATION_FEATURES.map((feature) => feature.key) as [
  GenerationFeatureKey,
  ...GenerationFeatureKey[],
];

export const ruleFeatureSchema = z.enum(featureKeys);

export const ruleInputSchema = z.object({
  feature: ruleFeatureSchema,
  content: z.string().max(20000),
});

export type RuleInput = z.infer<typeof ruleInputSchema>;
