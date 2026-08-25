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
import { GenerationDetails } from "@/components/workspace/generation-details";
import { thumbnailStatusValues, type ThumbnailStatus } from "@/schemas/thumbnail";
import { updateThumbnail } from "@/server/actions/thumbnails";

type ThumbnailRecord = {
  id: string;
  title: string;
  promptText: string;
  imageUrl: string | null;
  status: string;
  notes: string | null;
  generationRules: string | null;
  generationPrompt: string | null;
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
  thumbnail: ThumbnailRecord;
}) {
  const [title, setTitle] = useState(thumbnail.title);
  const [status, setStatus] = useState<ThumbnailStatus>(thumbnail.status as ThumbnailStatus);
  const [promptText, setPromptText] = useState(thumbnail.promptText);
  const [imageUrl, setImageUrl] = useState(thumbnail.imageUrl ?? "");
  const [notes, setNotes] = useState(thumbnail.notes ?? "");
  const [isPending, startTransition] = useTransition();

  function resetAndClose() {
    onOpenChange(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateThumbnail({
        id: thumbnail.id,
        title,
        status,
        promptText,
        imageUrl,
        notes,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Thumbnail updated");
      resetAndClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto sm:max-w-4xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Thumbnail</DialogTitle>
            <DialogDescription>
              Draft a thumbnail concept and its image-generation prompt.
            </DialogDescription>
          </DialogHeader>
          <GenerationDetails
            prompt={thumbnail.generationPrompt}
            rules={thumbnail.generationRules}
          />
          {imageUrl && (
            // Opens the full-size image in a new tab rather than an in-app lightbox — simpler and
            // avoids adding focus-trap/z-index complexity for what's otherwise a read-only preview.
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border mt-3 block w-64 max-w-full overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary R2/user-supplied URL, not an app asset */}
              <img src={imageUrl} alt="" className="aspect-video w-full object-cover" />
            </a>
          )}
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
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
