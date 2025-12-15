/**
 * Shared Core Package - Main Export
 *
 * This package exports shared types, repositories, and helpers used across all domains.
 */

// Types (Shared types from OpenAPI common files)
export * from "./types/index.js";

// Repository Interfaces (Base repository contracts)
// Re-export only repository interfaces, not types that conflict with types/index.js
export type {
  PaginationParams,
  PaginatedResult,
  ReadRepository,
  CreateReadRepository,
  CrudRepository,
  ActionRepository,
} from "./repositories/_base-repository.js";

// Helpers (Utility functions - selective exports to avoid conflicts)
export * from "./helpers/id-generator.js";
// Export converter functions but not types that conflict
export { timestampsToApi, timestamsFromApi, ConverterPresets } from "./helpers/core-converters.js";
export {
  createResponse,
  createListResponse,
  type WrapResponse,
  type WrapListResponse,
} from "./helpers/response-wrapper.js";
