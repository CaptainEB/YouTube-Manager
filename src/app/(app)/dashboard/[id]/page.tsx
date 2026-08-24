import { notFound } from "next/navigation";

import { VideoDetailClient } from "@/app/(app)/dashboard/[id]/_components/video-detail-client";
import { getVideoDetail, listLinkableOptions } from "@/server/actions/videos";

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [video, options] = await Promise.all([getVideoDetail(id), listLinkableOptions()]);

  if (!video) {
    notFound();
  }

  return <VideoDetailClient video={video} options={options} />;
}
