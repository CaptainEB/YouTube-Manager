import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-foreground text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground max-w-sm">
        This page doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
