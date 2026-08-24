import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

function getAllowedUserIds(): string[] {
  return (process.env.ALLOWED_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * The single authorization choke point: every page, layout, and Server Action must call this
 * before touching any data. Middleware/proxy is not relied on for protection (see src/proxy.ts).
 *
 * - No session at all -> sent to sign-in.
 * - Signed in but not the app owner -> 404, indistinguishable from a route that doesn't exist.
 */
export async function requireOwner(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const allowedUserIds = getAllowedUserIds();
  if (allowedUserIds.length === 0 || !allowedUserIds.includes(userId)) {
    notFound();
  }

  return userId;
}
