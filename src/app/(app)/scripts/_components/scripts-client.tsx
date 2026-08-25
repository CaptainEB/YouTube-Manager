"use client";

import { useState } from "react";

import { ScriptFormDialog } from "@/app/(app)/scripts/_components/script-form-dialog";
import { DeleteConfirmDialog } from "@/components/items/delete-confirm-dialog";
import { ItemList } from "@/components/items/item-list";
import { ItemRow } from "@/components/items/item-row";
import { PageHeader } from "@/components/layout/page-header";
import { GenerationWorkspace } from "@/components/workspace/generation-workspace";
import { getGenerationFeature } from "@/config/features";
import { deleteScript, generateScript } from "@/server/actions/scripts";

type ScriptRecord = {
  id: string;
  title: string;
  content: string;
  status: string;
  notes: string | null;
  generationRules: string | null;
  generationPrompt: string | null;
  updatedAt: Date;
};

const feature = getGenerationFeature("scripts");

export function ScriptsClient({
  scripts,
  initialRules,
}: {
  scripts: ScriptRecord[];
  initialRules: string;
}) {
  const [editing, setEditing] = useState<ScriptRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={feature.label} description={feature.description} />

      <GenerationWorkspace
        feature={feature.key}
        initialRules={initialRules}
        rulesGuidance="Put in your video style, writing style, channel name, username, or any other context that should stay consistent across every script."
        onGenerate={generateScript}
      />

      <ItemList
        empty={{
          title: "No scripts yet",
          description: "Generate your first script above to get started.",
        }}
      >
        {scripts.map((script) => (
          <ItemRow
            key={script.id}
            title={script.title}
            status={script.status}
            updatedAt={script.updatedAt}
            onEdit={() => setEditing(script)}
            onDelete={() => setDeletingId(script.id)}
          />
        ))}
      </ItemList>

      {editing && (
        <ScriptFormDialog
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          script={editing}
        />
      )}
      <DeleteConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete script?"
        description="This will permanently delete this script. Videos that reference it will keep their other details."
        onConfirm={async () => {
          if (deletingId) {
            await deleteScript(deletingId);
          }
        }}
      />
    </div>
  );
}
