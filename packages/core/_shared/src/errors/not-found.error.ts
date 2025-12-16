/**
 * NotFoundError - Error thrown when a resource is not found
 *
 * Used by repositories to indicate that a requested entity does not exist.
 */

export class NotFoundError extends Error {
  constructor(
    public readonly entityName: string,
    public readonly id: string
  ) {
    super(`${entityName} with id ${id} not found`);
    this.name = "NotFoundError";
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}
