import { readFileSync } from "node:fs";
import path from "node:path";

// Single source of truth for both legal documents lives in config/tos&pp.md (editable without
// touching code), one document after the other — split apart here for the two public pages.
const raw = readFileSync(path.join(process.cwd(), "config", "tos&pp.md"), "utf-8");

const splitHeading = "# Terms of Service";
const splitIndex = raw.indexOf(splitHeading);
if (splitIndex === -1) {
  throw new Error(`config/tos&pp.md is missing the "${splitHeading}" heading`);
}

export const privacyPolicyMarkdown = raw.slice(0, splitIndex).trim();
export const termsOfServiceMarkdown = raw.slice(splitIndex).trim();
