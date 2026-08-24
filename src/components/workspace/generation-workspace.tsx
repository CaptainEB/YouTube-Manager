"use client";

import { ChevronDown } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PromptPreviewDialog } from "@/components/workspace/prompt-preview-dialog";
import type { GenerationFeatureKey } from "@/config/features";
import { assembleFinalPrompt } from "@/lib/prompt";
import { cn } from "@/lib/utils";
import { saveRule } from "@/server/actions/rules";

export function GenerationWorkspace({
  feature,
  systemPrompt,
  initialRules,
  channelContext,
}: {
  feature: GenerationFeatureKey;
  systemPrompt: string;
  initialRules: string;
  channelContext?: string;
}) {
  const [rules, setRules] = useState(initialRules);
  const [userPrompt, setUserPrompt] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [rulesOpen, setRulesOpen] = useState(initialRules.trim().length === 0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [, startTransition] = useTransition();

  const debouncedSave = useDebouncedCallback((value: string) => {
    setSaveState("saving");
    startTransition(async () => {
      const result = await saveRule({ feature, content: value });
      setSaveState(result.ok ? "saved" : "idle");
      if (!result.ok) {
        toast.error(result.error);
      }
    });
  }, 800);

  function handleRulesChange(value: string) {
    setRules(value);
    setSaveState("idle");
    debouncedSave(value);
  }

  const { sections, fullText } = assembleFinalPrompt({
    systemPrompt,
    rules,
    userPrompt,
    channelContext,
  });

  return (
    <div className="border-border bg-card flex flex-col gap-5 rounded-xl border p-6">
      <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="text-foreground flex items-center gap-2 text-sm font-semibold"
            >
              <ChevronDown
                className={cn("size-4 transition-transform", !rulesOpen && "-rotate-90")}
              />
              Rules
            </button>
          </CollapsibleTrigger>
          <span className="text-muted-foreground text-xs">
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
          </span>
        </div>
        <CollapsibleContent className="mt-3">
          <Textarea
            value={rules}
            onChange={(event) => handleRulesChange(event.target.value)}
            placeholder="Rules applied to every prompt in this tab (tone, formatting, things to avoid, etc.)"
            rows={5}
          />
        </CollapsibleContent>
      </Collapsible>

      <div className="flex flex-col gap-2">
        <Label htmlFor="user-prompt">Prompt</Label>
        <Textarea
          id="user-prompt"
          value={userPrompt}
          onChange={(event) => setUserPrompt(event.target.value)}
          placeholder="Describe the video you're working on…"
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setPreviewOpen(true)} disabled={!userPrompt.trim()}>
          Generate
        </Button>
      </div>

      <PromptPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        sections={sections}
        fullText={fullText}
      />
    </div>
  );
}
