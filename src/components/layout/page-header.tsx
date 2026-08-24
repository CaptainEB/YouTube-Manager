import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}
