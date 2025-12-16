/**
 * Database Error Handler
 *
 * Utility function to handle database errors and rethrow with appropriate context.
 * Used by repositories to standardize error handling.
 */

/**
 * Handle database errors and rethrow with appropriate context
 *
 * @param error - The error to handle (can be any type)
 * @throws Error - Always throws, either the original error if it's an Error instance,
 *                 or a new Error wrapping the unknown error
 */
export function handleDatabaseError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(`Database error: ${String(error)}`);
}
