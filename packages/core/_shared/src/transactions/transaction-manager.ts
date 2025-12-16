/**
 * Transaction Manager (PORT)
 *
 * Persistence-agnostic transaction boundary.
 * Core defines WHEN a transaction exists, not HOW.
 *
 * The callback receives a transaction client that operations should use
 * for database operations within the transaction. The type of the client
 * is implementation-specific (e.g., PrismaTransactionClient for Prisma).
 */
export interface TransactionManager {
  run<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}
