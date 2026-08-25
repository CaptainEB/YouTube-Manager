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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GenerationDetails } from "@/components/workspace/generation-details";
import { ideaStatusValues, type IdeaStatus } from "@/schemas/idea";
import { createIdea, updateIdea } from "@/server/actions/ideas";

type IdeaRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  notes: string | null;
  generationRules: string | null;
  generationPrompt: string | null;
};

const STATUS_LABELS: Record<IdeaStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  used: "Used",
  archived: "Archived",
};

export function IdeaFormDialog({
  open,
  onOpenChange,
  idea,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea?: IdeaRecord;
}) {
  const isEditing = Boolean(idea);
  const [title, setTitle] = useState(idea?.title ?? "");
  const [status, setStatus] = useState<IdeaStatus>((idea?.status as IdeaStatus) ?? "new");
  const [description, setDescription] = useState(idea?.description ?? "");
  const [notes, setNotes] = useState(idea?.notes ?? "");
  const [isPending, startTransition] = useTransition();

  function resetAndClose() {
    onOpenChange(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const input = { title, status, description, notes };
      const result = isEditing
        ? await updateIdea({ id: idea!.id, ...input })
        : await createIdea(input);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Idea updated" : "Idea created");
      if (!isEditing) {
        setTitle("");
        setDescription("");
        setNotes("");
        setStatus("new");
      }
      resetAndClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto sm:max-w-4xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Idea" : "New Idea"}</DialogTitle>
            <DialogDescription>Capture a video idea to develop later.</DialogDescription>
          </DialogHeader>
          <GenerationDetails
            prompt={idea?.generationPrompt ?? null}
            rules={idea?.generationRules ?? null}
          />
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="idea-title">Title</FieldLabel>
              <Input
                id="idea-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={200}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="idea-status">Status</FieldLabel>
              <Select value={status} onValueChange={(value) => setStatus(value as IdeaStatus)}>
                <SelectTrigger id="idea-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ideaStatusValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="idea-description">Description</FieldLabel>
              <Textarea
                id="idea-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="idea-notes">Notes</FieldLabel>
              <Textarea
                id="idea-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
              />
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
