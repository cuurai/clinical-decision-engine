/**
 * Response Types for Clinical Decision Engine
 *
 * Standard response envelopes used across all API endpoints.
 */

import type { PageInfo } from "./pagination.types.js";

/**
 * Standard metadata included in all API responses.
 * Provides correlation tracking for distributed tracing and audit compliance.
 */
export interface ResponseMeta {
  /**
   * Server-generated domain-scoped correlation ID for distributed tracing (format: {DOMAIN_PREFIX}_{ULID}).
   * Domain prefixes: DEC (decision-intelligence), KNO (knowledge-evidence), PAT (patient-clinical-data), WOR (workflow-care-pathways), INT (integration-interoperability)
   * Use this ID when contacting support or investigating issues.
   * @example DEC_01HQZX3K8PQRS7VN6M9TW1ABJZ
   */
  correlationId: string;
  /**
   * Format: date-time
   * Server timestamp when response was generated (ISO 8601 UTC)
   * @example 2025-11-10T12:34:56.789Z
   */
  timestamp: string;
  /**
   * Optional client-provided request ID (echoed back if provided)
   * @example client-req-12345
   */
  requestId?: string;
}

/**
 * Standard success response envelope.
 * All successful API responses are wrapped in this structure.
 * @example {
 *   "data": {
 *     "id": "DEC_01HQZX3K8PQRS7VN6M9TW1ABJZ",
 *     "status": "active"
 *   },
 *   "meta": {
 *     "correlationId": "DEC_01HQZX3K8PQRS7VN6M9TW1ABJZ",
 *     "timestamp": "2025-11-10T12:34:56.789Z"
 *   }
 * }
 */
export interface DataEnvelope<T = unknown> {
  /** Response payload (type varies by endpoint) */
  data: T;
  meta: ResponseMeta;
}

/**
 * Standard response envelope for single-item endpoints.
 * Used for GET /entity/:id, POST /entity, PATCH /entity/:id operations.
 */
export interface ApiResponse<T = unknown> {
  /** The response payload - can be any entity type */
  data: T;
  meta: ResponseMeta;
}

/**
 * Standard response envelope for list endpoints.
 * Used for GET /entity operations that return multiple items.
 */
export interface ApiListResponse<T = unknown> {
  /** Array of entities */
  data: T[];
  meta: ResponseMeta & {
    /** Total number of items matching the filter */
    totalCount?: number;
    /** Number of items returned in this response */
    pageSize?: number;
    /** Current page number (if using offset-based pagination) */
    pageNumber?: number;
  };
}

/**
 * Paginated list response envelope - use this for list endpoints with cursor-based pagination.
 * Concrete schemas extend this and specify the item type.
 * @example {
 *   "data": {
 *     "items": [
 *       { "id": "DEC_01HQZX3K8PQRS7VN6M9TW1ABJZ" },
 *       { "id": "DEC_01HQZX3K8PQRS7VN6M9TW1ABJZ" }
 *     ]
 *   },
 *   "meta": {
 *     "correlationId": "DEC_01HQZX3K8PQRS7VN6M9TW1ABJZ",
 *     "timestamp": "2025-11-10T12:34:56.789Z",
 *     "pagination": {
 *       "nextCursor": "DEC_01HQZX3K8PQRS7VN6M9TW1ABJZ",
 *       "prevCursor": null,
 *       "limit": 50
 *     }
 *   }
 * }
 */
export interface ListResponseEnvelope<T = unknown> {
  data: {
    items: T[];
  };
  meta: ResponseMeta & {
    pagination: PageInfo;
  };
}

/**
 * Paginated response envelope - base schema.
 * Do not use directly. Use ListResponseEnvelope instead.
 */
export interface PagedDataEnvelope<T = unknown> {
  data: {
    items: T[];
  };
  meta: ResponseMeta & {
    pagination: PageInfo;
  };
}
