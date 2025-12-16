/**
 * DomainConflictError - Error thrown when a domain conflict occurs
 *
 * Used to indicate conflicts such as:
 * - Duplicate resource creation
 * - Concurrent modification conflicts
 * - Business rule violations
 */

export class DomainConflictError extends Error {
  constructor(
    public readonly entityName: string,
    public readonly conflictReason: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(`${entityName} conflict: ${conflictReason}`);
    this.name = "DomainConflictError";
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainConflictError);
    }
  }
}
