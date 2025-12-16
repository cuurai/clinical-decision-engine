/**
 * Repository Helper Utilities
 *
 * Shared utilities for DAO repositories
 */

import type { DaoClient } from "@cuur-cde/database";

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends Error {
  constructor(
    public readonly entityName: string,
    public readonly id: string
  ) {
    super(`${entityName} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

/**
 * Transaction Manager for database operations
 */
export class TransactionManager {
  constructor(private readonly dao: DaoClient) {}

  /**
   * Execute a function within a transaction
   */
  async executeInTransaction<T>(
    fn: (tx: DaoClient) => Promise<T>
  ): Promise<T> {
    return this.dao.$transaction(fn);
  }
}

/**
 * Handle database errors and rethrow with appropriate context
 */
export function handleDatabaseError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(`Database error: ${String(error)}`);
}

