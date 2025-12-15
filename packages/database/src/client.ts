/**
 * Shared Prisma Client for Clinical Decision Engine
 *
 * This exports a singleton PrismaClient instance that should be used
 * by all services. The client is generated from the unified schema
 * in packages/database/prisma/schema.prisma
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Create a singleton Prisma client instance
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// In development, reuse the same instance across hot reloads
// In production, create a new instance
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Export PrismaClient type for type annotations
export type { PrismaClient } from '@prisma/client';
