import { DashboardClient } from "@/app/(app)/dashboard/_components/dashboard-client";
import { listVideos } from "@/server/actions/videos";

export default async function DashboardPage() {
  const videos = await listVideos();
  return <DashboardClient videos={videos} />;
}
