/**
 * Component Types for Clinical Decision Engine
 *
 * Core component schemas used across all domains.
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
 * Standard success response envelope (for OpenAPI component schemas).
 * Re-exported from responses.types.ts for consistency.
 */
export type { DataEnvelope } from "./responses.types.js";

/**
 * Paginated response envelope (for OpenAPI component schemas).
 * Re-exported from responses.types.ts for consistency.
 */
export type { PagedDataEnvelope } from "./responses.types.js";

/**
 * Standard error response envelope (for OpenAPI component schemas).
 * Re-exported from errors.types.ts for consistency.
 */
export type { ErrorEnvelope } from "./errors.types.js";
