/**
 * Transaction Manager (PORT)
 *
 * Persistence-agnostic transaction boundary.
 * Core defines WHEN a transaction exists, not HOW.
 */
export interface TransactionManager {
  run<T>(fn: () => Promise<T>): Promise<T>;
}
