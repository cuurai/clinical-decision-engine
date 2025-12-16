/**
 * Pagination Types for Clinical Decision Engine
 *
 * Cursor-based pagination used across all list endpoints.
 */

/**
 * Pagination information for paginated list responses
 */
export interface PageInfo {
  /**
   * Opaque cursor for the next page of results; null if no more pages
   * @example eyJpZCI6IjEyMyIsInRzIjoxNzA5ODU2MDAwfQ
   */
  nextCursor?: string | null;
  /**
   * Opaque cursor for the previous page of results; null if none
   * @example null
   */
  prevCursor?: string | null;
  /**
   * Number of items returned in this page
   * @default 50
   */
  limit: number;
}

/**
 * Cursor-based pagination parameters shared by all list operations.
 */
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

/**
 * Envelope returned by all repository list operations.
 */
export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string | null;
  prevCursor?: string | null;
  total?: number;
}
