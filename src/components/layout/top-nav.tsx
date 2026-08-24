import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function TopNav() {
  return (
    <header className="border-border bg-card sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 shadow-sm md:px-8">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link
          href="/dashboard"
          className="text-primary text-xl font-bold tracking-tight md:text-2xl"
        >
          YouTube Manager
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
}
