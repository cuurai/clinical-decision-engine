/**
 * Primitive Types for Clinical Decision Engine
 *
 * Universal types used across all domains.
 */

/**
 * Organization identifier (prefixed ULID)
 *
 * Format: `org_` + 26-character base32 ULID
 * - Length: 30 characters
 * - Sortable: Lexicographically ordered by creation time
 * - URL-safe: No encoding needed
 * - Human-recognizable: Prefix indicates entity type
 * @example DEC_01HQZX3K8PQRS7VN6M9TW1ABJY
 */
export type OrgId = string;

/**
 * RFC3339 timestamp in UTC (Zulu) unless explicitly stated otherwise
 * @example 2025-10-22T10:30:00Z
 */
export type Timestamp = string;

/**
 * Optional timestamp (RFC3339 in UTC or null)
 */
export type NullableTimestamp = Timestamp | null;

/**
 * Locale identifier for internationalization
 * @enum {string}
 */
export type Locale = "en" | "ar" | "fr" | "es";
