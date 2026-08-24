import { FileQuestion } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-border flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
      <FileQuestion className="text-muted-foreground size-8" />
      <p className="text-foreground font-semibold">{title}</p>
      {description && <p className="text-muted-foreground max-w-sm text-sm">{description}</p>}
    </div>
  );
}

export function ItemList({
  children,
  empty,
}: {
  children: ReactNode[];
  empty: { title: string; description?: string };
}) {
  if (children.length === 0) {
    return <EmptyState title={empty.title} description={empty.description} />;
  }

  return (
    <div className="divide-border border-border bg-card flex flex-col divide-y rounded-xl border">
      {children}
    </div>
  );
}
