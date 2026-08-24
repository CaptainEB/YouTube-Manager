"use client";

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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { scriptStatusValues, type ScriptStatus } from "@/schemas/script";
import { createScript, updateScript } from "@/server/actions/scripts";

type ScriptRecord = {
  id: string;
  title: string;
  content: string;
  status: string;
  notes: string | null;
};

const STATUS_LABELS: Record<ScriptStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
};

export function ScriptFormDialog({
  open,
  onOpenChange,
  script,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script?: ScriptRecord;
}) {
  const isEditing = Boolean(script);
  const [title, setTitle] = useState(script?.title ?? "");
  const [status, setStatus] = useState<ScriptStatus>((script?.status as ScriptStatus) ?? "draft");
  const [content, setContent] = useState(script?.content ?? "");
  const [notes, setNotes] = useState(script?.notes ?? "");
  const [isPending, startTransition] = useTransition();

  function resetAndClose() {
    onOpenChange(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const input = { title, status, content, notes };
      const result = isEditing
        ? await updateScript({ id: script!.id, ...input })
        : await createScript(input);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Script updated" : "Script created");
      if (!isEditing) {
        setTitle("");
        setContent("");
        setNotes("");
        setStatus("draft");
      }
      resetAndClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Script" : "New Script"}</DialogTitle>
            <DialogDescription>Track a video script from draft to completed.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="script-title">Title</FieldLabel>
              <Input
                id="script-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={200}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="script-status">Status</FieldLabel>
              <Select value={status} onValueChange={(value) => setStatus(value as ScriptStatus)}>
                <SelectTrigger id="script-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scriptStatusValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="script-content">Script</FieldLabel>
              <Textarea
                id="script-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={8}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="script-notes">Notes</FieldLabel>
              <Textarea
                id="script-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
              />
              <FieldDescription>
                Optional — anything else worth remembering about this script.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isEditing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
