/**
 * Shared utilities for DAO repositories
 *
 * This module exports common utilities used across all DAO repository implementations:
 * - NotFoundError: Custom error for 404 cases
 * - TransactionManager: Manages database transactions
 * - handleDatabaseError: Centralized error handling for database operations
 */

import type { DaoClient } from "./dao-client.js";

/**
 * Custom error class for resource not found scenarios
 */
export class NotFoundError extends Error {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

/**
 * Transaction Manager for handling database transactions
 *
 * This class provides a simple wrapper around Prisma's transaction API
 * to ensure consistent transaction handling across all DAO repositories.
 */
export class TransactionManager {
  constructor(private readonly dao: DaoClient) {}

  /**
   * Execute a function within a transaction
   *
   * @param callback - Function to execute within the transaction
   * @returns Promise resolving to the result of the callback
   */
  async executeInTransaction<T>(callback: (tx: DaoClient) => Promise<T>): Promise<T> {
    return this.dao.$transaction(callback);
  }

  /**
   * Get the underlying DAO client
   *
   * @returns The DAO client instance
   */
  getClient(): DaoClient {
    return this.dao;
  }
}

/**
 * Handle database errors consistently across all DAO repositories
 *
 * This function provides centralized error handling and logging for database operations.
 * It can be extended to handle specific error types (e.g., unique constraint violations,
 * foreign key violations) and provide more meaningful error messages.
 *
 * @param error - The error that occurred during database operation
 * @throws The error (possibly transformed) to be handled by the caller
 */
export function handleDatabaseError(error: unknown): never {
  // Log the error for debugging purposes
  console.error("Database error:", error);

  // Re-throw the error to be handled by the caller
  // In the future, this could transform specific Prisma errors into more user-friendly messages
  throw error;
}
