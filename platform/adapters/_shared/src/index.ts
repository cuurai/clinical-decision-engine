/**
 * Shared utilities for DAO repositories
 *
 * This module exports common utilities used across all DAO repository implementations:
 * - NotFoundError: Custom error for 404 cases
 * - TransactionManager: Manages database transactions
 * - handleDatabaseError: Centralized error handling for database operations
 * - Shared types: OrgId, PaginatedResult, PaginationParams
 */

import type { DaoClient } from "./dao-client.js";

// Re-export shared types from core/_shared
export type { OrgId, PaginatedResult, PaginationParams } from "@cuur-cde/core/_shared";

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
 * It logs the error and can be extended in the future to transform specific error types
 * (e.g., unique constraint violations, foreign key violations) into more user-friendly messages.
 *
 * Callers should throw the error after calling this function:
 * ```ts
 * } catch (error) {
 *   handleDatabaseError(error);
 *   throw error;
 * }
 * ```
 *
 * @param error - The error that occurred during database operation
 */
export function handleDatabaseError(error: unknown): void {
  // Log the error for debugging purposes
  console.error("Database error:", error);

  // In the future, this could:
  // - Transform Prisma errors into domain-specific errors
  // - Add error context/metadata
  // - Send to error tracking service
  // - Handle specific error types differently
}
