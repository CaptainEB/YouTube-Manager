import { FileText, Image as ImageIcon, Lightbulb, Video as VideoIcon } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/items/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VideoCardData = {
  id: string;
  title: string;
  status: string;
  thumbnail: { imageUrl: string | null } | null;
  script: { id: string } | null;
  idea: { id: string } | null;
};

export function VideoCard({ video }: { video: VideoCardData }) {
  return (
    <Link href={`/dashboard/${video.id}`}>
      <Card className="overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="bg-muted flex aspect-video items-center justify-center">
          {video.thumbnail?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-supplied URL
            <img src={video.thumbnail.imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <VideoIcon className="text-muted-foreground size-8" />
          )}
        </div>
        <CardContent className="flex flex-col gap-3 pb-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-foreground line-clamp-2 font-semibold">{video.title}</h3>
            <StatusBadge status={video.status} />
          </div>
          <div className="text-muted-foreground flex gap-3">
            <FileText className={cn("size-4", video.script && "text-primary")} />
            <ImageIcon className={cn("size-4", video.thumbnail && "text-primary")} />
            <Lightbulb className={cn("size-4", video.idea && "text-primary")} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
