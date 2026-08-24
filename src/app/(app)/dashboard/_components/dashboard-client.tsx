"use client";

import { useState } from "react";

import { VideoCard } from "@/app/(app)/dashboard/_components/video-card";
import { VideoCreateDialog } from "@/app/(app)/dashboard/_components/video-create-dialog";
import { EmptyState } from "@/components/items/item-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

type VideoCardData = {
  id: string;
  title: string;
  status: string;
  thumbnail: { imageUrl: string | null } | null;
  script: { id: string } | null;
  idea: { id: string } | null;
};

export function DashboardClient({ videos }: { videos: VideoCardData[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Videos you've assembled from the scripts, thumbnails, and ideas you actually used."
        action={<Button onClick={() => setCreateOpen(true)}>New Video</Button>}
      />

      {videos.length === 0 ? (
        <EmptyState
          title="No videos yet"
          description="Create a video once you've decided what you're publishing, then link the pieces you used."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <VideoCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
