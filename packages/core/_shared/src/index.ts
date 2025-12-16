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
  CreateUpdateReadRepository,
  CreateDeleteReadRepository,
  CrudRepository,
  ActionRepository,
} from "./repositories/_base-repository.js";

// Helpers (Utility functions - selective exports to avoid conflicts)
export * from "./helpers/id.js";
// Export only functions from core-converters, not interfaces (ApiResponse/ApiListResponse are exported from types)
export {
  timestampsToApi,
  timestamsFromApi,
  wrapResponse,
  wrapListResponse,
  ConverterPresets,
} from "./helpers/core-converters.js";
// Export response-wrapper types but not the conflicting interfaces
export type { WrapResponse, WrapListResponse } from "./helpers/response-wrapper.js";
export { createResponse, createListResponse } from "./helpers/response-wrapper.js";

// Errors (Error classes and handlers)
export { NotFoundError, DomainConflictError, handleDatabaseError } from "./errors/index.js";

// Transactions (Transaction management utilities)
export type { TransactionManager } from "./transactions/index.js";
