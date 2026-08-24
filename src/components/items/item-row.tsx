"use client";

import { formatDistanceToNow } from "date-fns";
import { Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/items/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ItemRow({
  title,
  status,
  updatedAt,
  leading,
  onEdit,
  onDelete,
}: {
  title: string;
  status: string;
  updatedAt: Date;
  leading?: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex flex-col items-start justify-between gap-3 px-6 py-4 sm:flex-row sm:items-center">
      <button type="button" onClick={onEdit} className="flex flex-1 items-center gap-4 text-left">
        {leading}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h3 className="text-foreground group-hover:text-primary font-semibold">{title}</h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <Clock className="size-3.5" />
            Last edited {formatDistanceToNow(updatedAt, { addSuffix: true })}
          </p>
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
