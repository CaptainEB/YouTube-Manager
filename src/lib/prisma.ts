import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "@/generated/prisma/client";

// Parsed once so the pool config (and its connection limit) is explicit rather than left to driver string-parsing defaults.
function buildAdapter() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. See SETUP.md.");
  }

  const url = new URL(connectionString);
  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    // Serverless invocations open short-lived pools; keep this small so we don't exhaust Railway's connection limit.
    connectionLimit: 5,
    ssl: url.searchParams.has("ssl") || url.searchParams.get("sslaccept") ? {} : undefined,
  });
}

declare global {
  var prismaClient: PrismaClient | undefined;
}

// Cached on globalThis so Next.js dev-mode HMR doesn't spawn a new connection pool on every module reload.
export const prisma =
  globalThis.prismaClient ??
  new PrismaClient({
    adapter: buildAdapter(),
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prisma;
}
