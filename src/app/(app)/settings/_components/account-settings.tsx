"use client";

import { useClerk, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function AccountSettings() {
  const { openUserProfile } = useClerk();
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-foreground font-medium">
          {user?.primaryEmailAddress?.emailAddress ?? "Signed in"}
        </p>
        <p className="text-muted-foreground text-sm">
          Manage your profile, email, and security settings.
        </p>
      </div>
      <Button variant="outline" onClick={() => openUserProfile()}>
        Manage account
      </Button>
    </div>
  );
}
