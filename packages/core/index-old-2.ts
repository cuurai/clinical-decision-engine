/**
 * Core Package - Main Export
 *
 * This file exports all domains and shared utilities from the core package.
 */

// Shared repository types (most commonly used)
export type {
  OrgId,
  PaginatedResult,
  PaginationParams,
} from "./shared/repositories/_base-repository.js";
export * from "./shared/repositories/_base-repository.js";

// Shared types (export types only, avoid conflicts with helpers)
export type * from "./shared/types/index.js";

// Shared helpers (exclude ApiResponse/ApiListResponse interfaces to avoid conflict with types)
export {
  generateId,
  wrapResponse,
  wrapListResponse,
  timestampsToApi,
  timestamsFromApi,
  createResponse,
  createListResponse,
  type WrapResponse,
  type WrapListResponse,
  ConverterPresets,
} from "./shared/helpers/index.js";

// Domain exports (using namespace-style to avoid conflicts)
export * as DecisionIntelligence from "./decision-intelligence/index.js";
export * as IntegrationInteroperability from "./integration-interoperability/index.js";
export * as KnowledgeEvidence from "./knowledge-evidence/index.js";
export * as PatientClinicalData from "./patient-clinical-data/index.js";
export * as WorkflowCarePathways from "./workflow-care-pathways/index.js";
