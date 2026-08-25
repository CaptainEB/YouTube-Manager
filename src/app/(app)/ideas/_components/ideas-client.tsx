"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { IdeaFormDialog } from "@/app/(app)/ideas/_components/idea-form-dialog";
import { DeleteConfirmDialog } from "@/components/items/delete-confirm-dialog";
import { ItemList } from "@/components/items/item-list";
import { ItemRow } from "@/components/items/item-row";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GenerationWorkspace } from "@/components/workspace/generation-workspace";
import { getGenerationFeature } from "@/config/features";
import { deleteIdea, generateIdea } from "@/server/actions/ideas";

type IdeaRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  notes: string | null;
  generationRules: string | null;
  generationPrompt: string | null;
  updatedAt: Date;
};

const feature = getGenerationFeature("ideas");

export function IdeasClient({
  ideas,
  initialRules,
}: {
  ideas: IdeaRecord[];
  initialRules: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<IdeaRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={feature.label}
        description={feature.description}
        action={
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Wired up once an AI model is configured — see config/models.json */}
                <span>
                  <Button variant="outline" disabled>
                    <Sparkles className="size-4" />
                    Get Ideas
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Coming soon — will use your channel history and current trends.
              </TooltipContent>
            </Tooltip>
            <Button onClick={() => setCreateOpen(true)}>New Idea</Button>
          </div>
        }
      />

      <GenerationWorkspace
        feature={feature.key}
        initialRules={initialRules}
        onGenerate={generateIdea}
      />

      <ItemList
        empty={{
          title: "No ideas yet",
          description: "Capture your first video idea to get started.",
        }}
      >
        {ideas.map((idea) => (
          <ItemRow
            key={idea.id}
            title={idea.title}
            status={idea.status}
            updatedAt={idea.updatedAt}
            onEdit={() => setEditing(idea)}
            onDelete={() => setDeletingId(idea.id)}
          />
        ))}
      </ItemList>

      <IdeaFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <IdeaFormDialog
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          idea={editing}
        />
      )}
      <DeleteConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete idea?"
        description="This will permanently delete this idea. Videos that reference it will keep their other details."
        onConfirm={async () => {
          if (deletingId) {
            await deleteIdea(deletingId);
          }
        }}
      />
    </div>
  );
}
