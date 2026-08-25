"use client";

import { HelpCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GenerationFeatureKey } from "@/config/features";
import { saveRule } from "@/server/actions/rules";

export function RulesDialog({
  open,
  onOpenChange,
  feature,
  guidance,
  content,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: GenerationFeatureKey;
  guidance: string;
  content: string;
  onSaved: (content: string) => void;
}) {
  const [draft, setDraft] = useState(content);
  const [isPending, startTransition] = useTransition();

  // Re-sync the draft to the last-saved value each time the dialog (re)opens, adjusted during
  // render rather than an effect so it takes effect before the reopened dialog is painted.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(content);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveRule({ feature, content: draft });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Rules saved");
      onSaved(draft);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-1.5">
            <DialogTitle>Rules</DialogTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="What goes in Rules?"
                >
                  <HelpCircle className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{guidance}</TooltipContent>
            </Tooltip>
          </div>
          <DialogDescription>Applied to every prompt in this tab.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="field-sizing-fixed min-h-96 flex-1 resize-none overflow-y-auto"
          autoFocus
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
