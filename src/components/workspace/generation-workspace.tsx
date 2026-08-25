"use client";

import { ChevronDown, Loader2, NotebookText } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RulesDialog } from "@/components/workspace/rules-dialog";
import { getGenerationFeature, type GenerationFeatureKey } from "@/config/features";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import { saveRule } from "@/server/actions/rules";

export function GenerationWorkspace({
  feature,
  initialRules,
  rulesGuidance,
  onGenerate,
}: {
  feature: GenerationFeatureKey;
  initialRules: string;
  // When provided, Rules move to a button + modal with a "?" guidance tooltip and an explicit
  // Save button (Scripts/Thumbnails). When omitted, Rules stay inline with autosave (Ideas).
  rulesGuidance?: string;
  onGenerate: (input: {
    rules: string;
    userPrompt: string;
  }) => Promise<ActionResult<{ id: string }>>;
}) {
  const [rules, setRules] = useState(initialRules);
  const [userPrompt, setUserPrompt] = useState("");
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  // Only used by the inline autosave variant (Ideas).
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [rulesOpen, setRulesOpen] = useState(initialRules.trim().length === 0);
  const [, startSaveTransition] = useTransition();
  const [isGenerating, startGenerateTransition] = useTransition();

  const debouncedSave = useDebouncedCallback((value: string) => {
    setSaveState("saving");
    startSaveTransition(async () => {
      const result = await saveRule({ feature, content: value });
      setSaveState(result.ok ? "saved" : "idle");
      if (!result.ok) {
        toast.error(result.error);
      }
    });
  }, 800);

  function handleInlineRulesChange(value: string) {
    setRules(value);
    setSaveState("idle");
    debouncedSave(value);
  }

  function handleGenerate() {
    startGenerateTransition(async () => {
      const result = await onGenerate({ rules, userPrompt });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`${getGenerationFeature(feature).entityName} generated`);
      setUserPrompt("");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {rulesGuidance && (
        <div>
          <Button type="button" variant="outline" onClick={() => setRulesModalOpen(true)}>
            <NotebookText className="size-4" />
            Rules
          </Button>
        </div>
      )}

      <div className="border-border bg-card flex flex-col gap-5 rounded-xl border p-6">
        {!rulesGuidance && (
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
                onChange={(event) => handleInlineRulesChange(event.target.value)}
                placeholder="Rules applied to every prompt in this tab (tone, formatting, things to avoid, etc.)"
                rows={5}
              />
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="user-prompt">Prompt</Label>
          <Textarea
            id="user-prompt"
            value={userPrompt}
            onChange={(event) => setUserPrompt(event.target.value)}
            placeholder="Describe the video you're working on…"
            rows={4}
            disabled={isGenerating}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleGenerate} disabled={!userPrompt.trim() || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>

      {rulesGuidance && (
        <RulesDialog
          open={rulesModalOpen}
          onOpenChange={setRulesModalOpen}
          feature={feature}
          guidance={rulesGuidance}
          content={rules}
          onSaved={setRules}
        />
      )}
    </div>
  );
}
