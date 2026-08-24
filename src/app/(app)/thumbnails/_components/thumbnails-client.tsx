"use client";

import { useState } from "react";

import { ThumbnailFormDialog } from "@/app/(app)/thumbnails/_components/thumbnail-form-dialog";
import { DeleteConfirmDialog } from "@/components/items/delete-confirm-dialog";
import { ItemList } from "@/components/items/item-list";
import { ItemRow } from "@/components/items/item-row";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { GenerationWorkspace } from "@/components/workspace/generation-workspace";
import { getGenerationFeature } from "@/config/features";
import { deleteThumbnail } from "@/server/actions/thumbnails";

type ThumbnailRecord = {
  id: string;
  title: string;
  promptText: string;
  imageUrl: string | null;
  status: string;
  notes: string | null;
  updatedAt: Date;
};

const feature = getGenerationFeature("thumbnails");

export function ThumbnailsClient({
  thumbnails,
  systemPrompt,
  initialRules,
}: {
  thumbnails: ThumbnailRecord[];
  systemPrompt: string;
  initialRules: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ThumbnailRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={feature.label}
        description={feature.description}
        action={<Button onClick={() => setCreateOpen(true)}>{feature.createLabel}</Button>}
      />

      <GenerationWorkspace
        feature={feature.key}
        systemPrompt={systemPrompt}
        initialRules={initialRules}
      />

      <ItemList
        empty={{
          title: "No thumbnails yet",
          description: "Create your first thumbnail concept to get started.",
        }}
      >
        {thumbnails.map((thumbnail) => (
          <ItemRow
            key={thumbnail.id}
            title={thumbnail.title}
            status={thumbnail.status}
            updatedAt={thumbnail.updatedAt}
            leading={
              thumbnail.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-supplied URL, not an app asset
                <img
                  src={thumbnail.imageUrl}
                  alt=""
                  className="border-border h-12 w-20 shrink-0 rounded-md border object-cover"
                />
              ) : undefined
            }
            onEdit={() => setEditing(thumbnail)}
            onDelete={() => setDeletingId(thumbnail.id)}
          />
        ))}
      </ItemList>

      <ThumbnailFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <ThumbnailFormDialog
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          thumbnail={editing}
        />
      )}
      <DeleteConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete thumbnail?"
        description="This will permanently delete this thumbnail. Videos that reference it will keep their other details."
        onConfirm={async () => {
          if (deletingId) {
            await deleteThumbnail(deletingId);
          }
        }}
      />
    </div>
  );
}
