/**
 * @cuur-cde/database - Shared Database Package
 *
 * Exports the Prisma client and types for use across all services.
 * This is the single source of truth for database access across all adapters.
 */

export { prisma } from "./client.js";
export type { DaoClient } from "./dao-client.js";
export type { PrismaClient } from "./client.js";
export { PrismaTransactionManager } from "./transaction-manager.prisma.js";
