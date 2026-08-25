import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    // Clerk serves its clerk-js/@clerk/ui script bundles same-origin via /__clerk/npm/... — without
    // this, those requests (ending in .js) are excluded by the pattern above and 404.
    "/__clerk/(.*)",
  ],
};
