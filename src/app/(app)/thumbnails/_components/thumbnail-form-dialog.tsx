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
import { thumbnailStatusValues, type ThumbnailStatus } from "@/schemas/thumbnail";
import { createThumbnail, updateThumbnail } from "@/server/actions/thumbnails";

type ThumbnailRecord = {
  id: string;
  title: string;
  promptText: string;
  imageUrl: string | null;
  status: string;
  notes: string | null;
};

const STATUS_LABELS: Record<ThumbnailStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
};

export function ThumbnailFormDialog({
  open,
  onOpenChange,
  thumbnail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thumbnail?: ThumbnailRecord;
}) {
  const isEditing = Boolean(thumbnail);
  const [title, setTitle] = useState(thumbnail?.title ?? "");
  const [status, setStatus] = useState<ThumbnailStatus>(
    (thumbnail?.status as ThumbnailStatus) ?? "draft",
  );
  const [promptText, setPromptText] = useState(thumbnail?.promptText ?? "");
  const [imageUrl, setImageUrl] = useState(thumbnail?.imageUrl ?? "");
  const [notes, setNotes] = useState(thumbnail?.notes ?? "");
  const [isPending, startTransition] = useTransition();

  function resetAndClose() {
    onOpenChange(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const input = { title, status, promptText, imageUrl, notes };
      const result = isEditing
        ? await updateThumbnail({ id: thumbnail!.id, ...input })
        : await createThumbnail(input);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Thumbnail updated" : "Thumbnail created");
      if (!isEditing) {
        setTitle("");
        setPromptText("");
        setImageUrl("");
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
            <DialogTitle>{isEditing ? "Edit Thumbnail" : "New Thumbnail"}</DialogTitle>
            <DialogDescription>
              Draft a thumbnail concept and its image-generation prompt.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="thumbnail-title">Title</FieldLabel>
              <Input
                id="thumbnail-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={200}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="thumbnail-status">Status</FieldLabel>
              <Select value={status} onValueChange={(value) => setStatus(value as ThumbnailStatus)}>
                <SelectTrigger id="thumbnail-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {thumbnailStatusValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="thumbnail-prompt">Image prompt</FieldLabel>
              <Textarea
                id="thumbnail-prompt"
                value={promptText}
                onChange={(event) => setPromptText(event.target.value)}
                rows={6}
              />
              <FieldDescription>
                The text prompt to paste into your image generator of choice.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="thumbnail-image-url">Image URL</FieldLabel>
              <Input
                id="thumbnail-image-url"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://…"
              />
              <FieldDescription>
                Optional — once you&apos;ve generated or uploaded the image somewhere.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="thumbnail-notes">Notes</FieldLabel>
              <Textarea
                id="thumbnail-notes"
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
