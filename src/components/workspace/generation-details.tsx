"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Shown only for AI-generated entries — manually created rows (or ones predating this feature)
// have no prompt saved, so there's nothing to reveal.
export function GenerationDetails({
  prompt,
  rules,
}: {
  prompt: string | null;
  rules: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (!prompt) {
    return null;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", !open && "-rotate-90")} />
          <Sparkles className="size-3.5" />
          Generation prompt
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-border bg-muted/40 mt-2 flex flex-col gap-3 rounded-lg border p-3">
        {rules && (
          <>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Rules
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{rules}</p>
            </div>
            <Separator />
          </>
        )}
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Prompt
          </p>
          <p className="mt-1 text-sm whitespace-pre-wrap">{prompt}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
