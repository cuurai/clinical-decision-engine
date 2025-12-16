/**
 * Transaction Manager (PORT)
 *
 * Persistence-agnostic transaction boundary.
 * Core defines WHEN a transaction exists, not HOW.
 *
 * @template TTransactionClient - The type of transaction client passed to the callback
 */
export interface TransactionManager<TTransactionClient = unknown> {
  run<T>(fn: (tx: TTransactionClient) => Promise<T>): Promise<T>;
}
