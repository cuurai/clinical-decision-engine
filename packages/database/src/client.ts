/**
 * Shared Prisma Client for Clinical Decision Engine
 *
 * Exports a singleton PrismaClient instance used by all services.
 * Generated from packages/database/prisma/schema.prisma
 *
 * Prisma v6 (ESM):
 * - Default export is Prisma namespace
 * - PrismaClient is accessed via Prisma.PrismaClient
 */

import Prisma from "@prisma/client";

// Create a singleton Prisma client instance
const prismaClientSingleton = () => {
  return new Prisma.PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: Prisma.PrismaClient | undefined;
}

// Reuse client in dev (hot reload safe), new instance in prod
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// Re-export PrismaClient type for consumers
export type PrismaClient = Prisma.PrismaClient;
