import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Low-emphasis pill styling per the design system — status is informational, not an action.
const NEUTRAL_STATUSES = new Set(["draft", "new", "planned"]);
const ACTIVE_STATUSES = new Set(["in_progress"]);
const DONE_STATUSES = new Set(["completed", "used", "published"]);

function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal",
        NEUTRAL_STATUSES.has(status) && "bg-muted text-muted-foreground",
        ACTIVE_STATUSES.has(status) && "bg-accent text-accent-foreground border-transparent",
        DONE_STATUSES.has(status) && "bg-secondary text-secondary-foreground border-transparent",
      )}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}
