"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import type { PromptSection } from "@/lib/prompt";

export function PromptPreviewDialog({
  open,
  onOpenChange,
  sections,
  fullText,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: PromptSection[];
  fullText: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Final Prompt Preview</DialogTitle>
          <DialogDescription>
            This is the exact text that would be sent to the model.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6">
          <div className="flex flex-col gap-4 pb-2">
            {sections.map((section, index) => (
              <div key={section.label}>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {section.label}
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap">{section.content || "—"}</p>
                {index < sections.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCopy} variant="outline">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy to clipboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
