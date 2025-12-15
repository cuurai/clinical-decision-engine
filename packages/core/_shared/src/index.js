/**
 * Shared Core Package - Main Export
 *
 * This package exports shared types, repositories, and helpers used across all domains.
 */
// Types (Shared types from OpenAPI common files)
export * from "./types/index.js";
// Helpers (Utility functions - selective exports to avoid conflicts)
export * from "./helpers/id-generator.js";
// Export converter functions but not types that conflict
export { timestampsToApi, timestamsFromApi, ConverterPresets } from "./helpers/core-converters.js";
export { createResponse, createListResponse, } from "./helpers/response-wrapper.js";
//# sourceMappingURL=index.js.map