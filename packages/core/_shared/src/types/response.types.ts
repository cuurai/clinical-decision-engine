/**
 * Shared Response Wrapper Types
 *
 * Defines the standard response envelope structure for all API handlers.
 * This ensures consistent wrapping of API responses across all domains.
 */

/**
 * Standard API Response Metadata
 */
export interface ApiResponseMeta {
  correlationId: string;
  timestamp: string;
}

/**
 * Paginated Response Metadata (for list responses)
 */
export interface ApiPaginatedResponseMeta extends ApiResponseMeta {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

/**
 * Standard single-item API response wrapper
 * Used for GET, POST, PATCH, DELETE operations that return a single entity
 * Data can be a specific type or unknown for flexibility during development
 */
export interface ApiResponse<T = unknown> {
  data: T;
  meta: ApiResponseMeta;
}

/**
 * Standard list API response wrapper
 * Used for LIST operations that return arrays
 */
export interface ApiListResponse<T = unknown> {
  data: T[];
  meta: ApiPaginatedResponseMeta;
}

/**
 * Generic response type that automatically selects between single and list based on input
 */
export type ApiResponseType<T = unknown, IsList extends boolean = false> = IsList extends true
  ? ApiListResponse<T>
  : ApiResponse<T>;
