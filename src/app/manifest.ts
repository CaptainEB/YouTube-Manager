import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YouTube Manager",
    short_name: "YT Manager",
    description: "Content creation workspace for scripting, thumbnails, ideas, and video tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f9f9",
    theme_color: "#2563eb",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
