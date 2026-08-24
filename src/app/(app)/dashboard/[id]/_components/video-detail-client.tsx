"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DeleteConfirmDialog } from "@/components/items/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
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
import { videoStatusValues, type VideoStatus } from "@/schemas/video";
import { deleteVideo, updateVideo } from "@/server/actions/videos";

const STATUS_LABELS: Record<VideoStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  published: "Published",
};

const NONE = "none";

type LinkOption = { id: string; title: string };

type VideoDetail = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  status: string;
  tags: unknown;
  publishedAt: Date | null;
  notes: string | null;
  scriptId: string | null;
  thumbnailId: string | null;
  ideaId: string | null;
};

function tagsToInput(tags: unknown): string {
  if (!Array.isArray(tags)) return "";
  return tags.filter((tag): tag is string => typeof tag === "string").join(", ");
}

function dateToInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function VideoDetailClient({
  video,
  options,
}: {
  video: VideoDetail;
  options: { scripts: LinkOption[]; thumbnails: LinkOption[]; ideas: LinkOption[] };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(video.title);
  const [status, setStatus] = useState<VideoStatus>(video.status as VideoStatus);
  const [description, setDescription] = useState(video.description ?? "");
  const [videoUrl, setVideoUrl] = useState(video.videoUrl ?? "");
  const [tags, setTags] = useState(tagsToInput(video.tags));
  const [publishedAt, setPublishedAt] = useState(dateToInput(video.publishedAt));
  const [notes, setNotes] = useState(video.notes ?? "");
  const [scriptId, setScriptId] = useState(video.scriptId ?? NONE);
  const [thumbnailId, setThumbnailId] = useState(video.thumbnailId ?? NONE);
  const [ideaId, setIdeaId] = useState(video.ideaId ?? NONE);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateVideo({
        id: video.id,
        title,
        status,
        description,
        videoUrl,
        tags,
        publishedAt,
        notes,
        scriptId: scriptId === NONE ? null : scriptId,
        thumbnailId: thumbnailId === NONE ? null : thumbnailId,
        ideaId: ideaId === NONE ? null : ideaId,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Video saved");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
        <Button variant="outline" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="border-border bg-card rounded-xl border p-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="video-title">Title</FieldLabel>
              <Input
                id="video-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="video-status">Status</FieldLabel>
                <Select value={status} onValueChange={(v) => setStatus(v as VideoStatus)}>
                  <SelectTrigger id="video-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoStatusValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="video-published">Published date</FieldLabel>
                <Input
                  id="video-published"
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="video-url">Live video link</FieldLabel>
              <Input
                id="video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=…"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="video-description">Description</FieldLabel>
              <Textarea
                id="video-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="video-tags">Tags</FieldLabel>
              <Input
                id="video-tags"
                placeholder="comma, separated, tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="video-notes">Notes</FieldLabel>
              <Textarea
                id="video-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </div>

        <div className="border-border bg-card rounded-xl border p-6">
          <h2 className="text-foreground mb-4 font-semibold">What you used</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="video-script">Script</FieldLabel>
              <Select value={scriptId} onValueChange={setScriptId}>
                <SelectTrigger id="video-script" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {options.scripts.map((script) => (
                    <SelectItem key={script.id} value={script.id}>
                      {script.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="video-thumbnail">Thumbnail</FieldLabel>
              <Select value={thumbnailId} onValueChange={setThumbnailId}>
                <SelectTrigger id="video-thumbnail" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {options.thumbnails.map((thumbnail) => (
                    <SelectItem key={thumbnail.id} value={thumbnail.id}>
                      {thumbnail.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="video-idea">Idea</FieldLabel>
              <Select value={ideaId} onValueChange={setIdeaId}>
                <SelectTrigger id="video-idea" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {options.ideas.map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      {idea.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !title.trim()}>
            Save
          </Button>
        </div>
      </form>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete video?"
        description="This permanently deletes this video entry. The linked script, thumbnail, and idea are not deleted."
        onConfirm={async () => {
          const result = await deleteVideo(video.id);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
