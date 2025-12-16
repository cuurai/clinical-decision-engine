/**
 * Error Types for Clinical Decision Engine
 *
 * Standard error response formats following RFC7807 Problem Details.
 */

import type { ResponseMeta } from "./responses.types.js";

/**
 * RFC7807-style error object for consistent error representation.
 */
export interface Problem {
  /**
   * Format: uri
   * URI identifying the error type
   * @example https://docs.cuurai.com/problems/validation-error
   */
  type: string;
  /** Short, human-readable summary of the problem */
  title: string;
  /** HTTP status code for this error */
  status: number;
  /** Detailed explanation of the specific error occurrence */
  detail?: string;
  /** URI reference identifying this specific error occurrence */
  instance?: string;
  /** Machine-readable internal code (e.g., VALIDATION_ERROR) */
  code?: string;
  /** Request trace ID for debugging */
  traceId?: string;
  /** Optional list of field-level validation issues */
  errors?: {
    field: string;
    message: string;
    code?: string;
  }[];
}

/**
 * Standard error response envelope.
 * All error responses use this structure for consistency.
 * @example {
 *   "error": "VALIDATION_ERROR",
 *   "message": "Invalid patient data",
 *   "detail": {
 *     "field": "dateOfBirth",
 *     "reason": "Must be a valid date"
 *   },
 *   "meta": {
 *     "correlationId": "DEC_01HQZX3K8PQRS7VN6M9TW1ABJZ",
 *     "timestamp": "2025-11-10T12:34:56.789Z"
 *   }
 * }
 */
export interface ErrorEnvelope {
  /**
   * Machine-readable error code
   * @example VALIDATION_ERROR
   */
  error: string;
  /**
   * Human-readable error message
   * @example Invalid patient data
   */
  message: string;
  /** Additional error context (structure varies by error type) */
  detail?: {
    [key: string]: unknown;
  };
  meta: ResponseMeta;
}

/**
 * Validation error - specific error type for validation failures
 */
export interface ValidationError extends Problem {
  code?: "VALIDATION_ERROR";
  status?: 422;
}

/**
 * Organization mismatch error - when orgId in header doesn't match path parameter
 */
export interface OrgMismatchError extends Problem {
  code?: "ORG_MISMATCH";
  status?: 400;
  title?: "Organization Mismatch";
  detail?: string;
}

/**
 * Organization unverified error - when organization verification is required
 */
export interface OrgUnverifiedError extends Problem {
  code?: "ORG_UNVERIFIED";
  status?: 403;
  title?: "Organization Not Verified";
  detail?: string;
}
