"use client";

import { useEffect } from "react";

// Root-level fallback — catches errors thrown above route-level boundaries (e.g. ClerkProvider
// itself failing to initialize), which would otherwise render as a blank page. Must define its own
// <html>/<body> and can't rely on globals.css or the app's ThemeProvider, since this replaces the
// root layout entirely when active.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#161616",
          color: "#f5f5f5",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Something went wrong</h1>
        <p style={{ color: "#a3a3a3", maxWidth: "24rem", margin: 0 }}>
          An unexpected error occurred before the app could load. Check the browser console for
          details, or try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#ff0000",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
