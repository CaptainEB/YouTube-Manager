import type { LucideIcon } from "lucide-react";
import { FileText, Image as ImageIcon, LayoutDashboard, Lightbulb, Settings } from "lucide-react";

export type GenerationFeatureKey = "scripts" | "thumbnails" | "ideas";

type GenerationFeature = {
  key: GenerationFeatureKey;
  label: string;
  href: `/${GenerationFeatureKey}`;
  icon: LucideIcon;
  description: string;
  // Singular noun used in generation success toasts (e.g. "Script generated").
  entityName: string;
};

// The tabs that share the Rules + prompt + preview workspace pattern. Adding a new one here
// automatically adds it to the sidebar; the matching entry in config/prompts.json supplies its prompt copy.
export const GENERATION_FEATURES: readonly GenerationFeature[] = [
  {
    key: "scripts",
    label: "Scripts",
    href: "/scripts",
    icon: FileText,
    description: "Manage and track your video scripts.",
    entityName: "Script",
  },
  {
    key: "thumbnails",
    label: "Thumbnails",
    href: "/thumbnails",
    icon: ImageIcon,
    description: "Draft thumbnail concepts and image-generation prompts.",
    entityName: "Thumbnail",
  },
  {
    key: "ideas",
    label: "Ideas",
    href: "/ideas",
    icon: Lightbulb,
    description: "Brainstorm new video ideas from your channel history and trends.",
    entityName: "Idea",
  },
];

export function getGenerationFeature(key: GenerationFeatureKey): GenerationFeature {
  const feature = GENERATION_FEATURES.find((item) => item.key === key);
  if (!feature) {
    throw new Error(`Unknown generation feature: ${key}`);
  }
  return feature;
}

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ...GENERATION_FEATURES.map(({ label, href, icon }) => ({ label, href, icon })),
];

export const SECONDARY_NAV_ITEMS: readonly NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];
