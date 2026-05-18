import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let connectionInfoLogged = false;

function logDatabaseConnectionInfo() {
  if (connectionInfoLogged || process.env.NODE_ENV === "production") return;
  connectionInfoLogged = true;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.info("Prisma database connection: DATABASE_URL is missing");
    return;
  }
  try {
    const parsed = new URL(databaseUrl);
    console.info("Prisma database connection", {
      host: parsed.hostname,
      port: parsed.port || "5432",
      database: parsed.pathname.replace(/^\//, ""),
      schema: parsed.searchParams.get("schema") || "public",
    });
  } catch {
    console.info("Prisma database connection: DATABASE_URL is not a valid URL");
  }
}

logDatabaseConnectionInfo();

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
