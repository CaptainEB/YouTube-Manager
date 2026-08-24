import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { requireOwner } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireOwner();

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="mx-auto flex w-full max-w-360 flex-1">
        <AppSidebar />
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
