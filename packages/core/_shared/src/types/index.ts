/**
 * Shared Types - Main Export
 *
 * Clinical Decision Engine shared types used across all domains.
 *
 * This file exports:
 * - Primitive types (OrgId, Timestamp, etc.)
 * - Response envelopes (ApiResponse, ApiListResponse, etc.)
 * - Pagination types (PageInfo, PaginationParams, PaginatedResult)
 * - Error types (Problem, ValidationError, etc.)
 * - Domain prefixes and resource mappings
 */

// ============================================================================
// Primitive Types
// ============================================================================

export type { OrgId, Timestamp, NullableTimestamp, Locale } from "./primitives.types.js";

// ============================================================================
// Pagination Types
// ============================================================================

export type { PageInfo, PaginationParams, PaginatedResult } from "./pagination.types.js";

// ============================================================================
// Response Types
// ============================================================================

export type {
  ResponseMeta,
  DataEnvelope,
  ApiResponse,
  ApiListResponse,
  ListResponseEnvelope,
  PagedDataEnvelope,
} from "./responses.types.js";

// ============================================================================
// Error Types
// ============================================================================

export type {
  Problem,
  ErrorEnvelope,
  ValidationError,
  OrgMismatchError,
  OrgUnverifiedError,
} from "./errors.types.js";

// ============================================================================
// Component Types (for OpenAPI compatibility)
// ============================================================================

export type {
  ResponseMeta as ComponentsResponseMeta,
  DataEnvelope as ComponentsDataEnvelope,
  PagedDataEnvelope as ComponentsPagedDataEnvelope,
  ErrorEnvelope as ComponentsErrorEnvelope,
} from "./components.types.js";

// ============================================================================
// Domain & Resource Prefixes
// ============================================================================

export type {
  DomainPrefix,
  ResourcePrefixMapping,
  ResourcePrefixMappings,
} from "./resource-prefixes.types.js";

// ============================================================================
// Legacy Support (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use ResponseMeta directly
 */
export type { ResponseMeta };

/**
 * @deprecated Use DataEnvelope directly
 */
export type { DataEnvelope };

/**
 * @deprecated Use ErrorEnvelope directly
 */
export type { ErrorEnvelope };

/**
 * @deprecated Use PageInfo directly
 */
export type { PageInfo };
