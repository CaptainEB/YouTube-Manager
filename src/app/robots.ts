import type { MetadataRoute } from "next";

// Private, single-owner tool — no reason for any crawler to index it. Pairs with the noindex
// meta tag in src/app/layout.tsx (defense in depth: robots.txt covers crawlers that never render the page).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
