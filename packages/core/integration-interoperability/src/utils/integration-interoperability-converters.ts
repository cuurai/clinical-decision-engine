/**
 * Integration Interoperability Domain Converters
 *
 * Thin wrappers around centralized converters (packages/core/src/shared/helpers/core-converters.ts)
 * Converts between domain types (with Date objects) and API types (with ISO strings)
 *
 * Naming convention: {entity}ToApi (camelCase)
 */

import { ConverterPresets } from "@cuur-cde/core/_shared";
import type {
  APIClientInput,
  APIClientUpdate,
  APICredentialInput,
  APICredentialUpdate,
  ConnectionInput,
  ConnectionUpdate,
  DataExportBatchInput,
  DataExportBatchUpdate,
  DataImportBatchInput,
  DataImportBatchUpdate,
  EventDeliveryInput,
  EventDeliveryUpdate,
  EventSubscriptionInput,
  EventSubscriptionUpdate,
  ExportFile,
  ExternalSystemInput,
  ExternalSystemUpdate,
  FHIRBundleInput,
  FHIRMappingProfileInput,
  FHIRMappingProfileUpdate,
  ImportRecord,
  IntegrationJobInput,
  IntegrationJobUpdate,
  IntegrationLog,
  IntegrationRunInput,
  InterfaceHealthCheckInput,
  MappingResult,
  MappingRule,
  SystemEndpoint,
  Timestamps,
  UsageMetric,
} from "@cuur-cde/core/integration-interoperability/types";

/**
 * Convert APIClientInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function aPIClientInputToApi(aPIClientInput: APIClientInput): APIClientInput {
  return ConverterPresets.standardApiResponse(aPIClientInput, { dateFields: [] }) as APIClientInput;
}

/**
 * Convert APIClientUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function aPIClientUpdateToApi(aPIClientUpdate: APIClientUpdate): APIClientUpdate {
  return ConverterPresets.standardApiResponse(aPIClientUpdate, { dateFields: [] }) as APIClientUpdate;
}

/**
 * Convert APICredentialInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `expiresAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function aPICredentialInputToApi(aPICredentialInput: APICredentialInput): APICredentialInput {
  return ConverterPresets.standardApiResponse(aPICredentialInput, { dateFields: ["expiresAt"] }) as APICredentialInput;
}

/**
 * Convert APICredentialUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `expiresAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function aPICredentialUpdateToApi(aPICredentialUpdate: APICredentialUpdate): APICredentialUpdate {
  return ConverterPresets.standardApiResponse(aPICredentialUpdate, { dateFields: ["expiresAt"] }) as APICredentialUpdate;
}

/**
 * Convert ConnectionInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function connectionInputToApi(connectionInput: ConnectionInput): ConnectionInput {
  return ConverterPresets.standardApiResponse(connectionInput, { dateFields: [] }) as ConnectionInput;
}

/**
 * Convert ConnectionUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function connectionUpdateToApi(connectionUpdate: ConnectionUpdate): ConnectionUpdate {
  return ConverterPresets.standardApiResponse(connectionUpdate, { dateFields: [] }) as ConnectionUpdate;
}

/**
 * Convert DataExportBatchInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function dataExportBatchInputToApi(dataExportBatchInput: DataExportBatchInput): DataExportBatchInput {
  return ConverterPresets.standardApiResponse(dataExportBatchInput, { dateFields: [] }) as DataExportBatchInput;
}

/**
 * Convert DataExportBatchUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `completedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function dataExportBatchUpdateToApi(dataExportBatchUpdate: DataExportBatchUpdate): DataExportBatchUpdate {
  return ConverterPresets.standardApiResponse(dataExportBatchUpdate, { dateFields: ["completedAt"] }) as DataExportBatchUpdate;
}

/**
 * Convert DataImportBatchInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function dataImportBatchInputToApi(dataImportBatchInput: DataImportBatchInput): DataImportBatchInput {
  return ConverterPresets.standardApiResponse(dataImportBatchInput, { dateFields: [] }) as DataImportBatchInput;
}

/**
 * Convert DataImportBatchUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `completedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function dataImportBatchUpdateToApi(dataImportBatchUpdate: DataImportBatchUpdate): DataImportBatchUpdate {
  return ConverterPresets.standardApiResponse(dataImportBatchUpdate, { dateFields: ["completedAt"] }) as DataImportBatchUpdate;
}

/**
 * Convert EventDeliveryInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function eventDeliveryInputToApi(eventDeliveryInput: EventDeliveryInput): EventDeliveryInput {
  return ConverterPresets.standardApiResponse(eventDeliveryInput, { dateFields: [] }) as EventDeliveryInput;
}

/**
 * Convert EventDeliveryUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `deliveredAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function eventDeliveryUpdateToApi(eventDeliveryUpdate: EventDeliveryUpdate): EventDeliveryUpdate {
  return ConverterPresets.standardApiResponse(eventDeliveryUpdate, { dateFields: ["deliveredAt"] }) as EventDeliveryUpdate;
}

/**
 * Convert EventSubscriptionInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function eventSubscriptionInputToApi(eventSubscriptionInput: EventSubscriptionInput): EventSubscriptionInput {
  return ConverterPresets.standardApiResponse(eventSubscriptionInput, { dateFields: [] }) as EventSubscriptionInput;
}

/**
 * Convert EventSubscriptionUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function eventSubscriptionUpdateToApi(eventSubscriptionUpdate: EventSubscriptionUpdate): EventSubscriptionUpdate {
  return ConverterPresets.standardApiResponse(eventSubscriptionUpdate, { dateFields: [] }) as EventSubscriptionUpdate;
}

/**
 * Convert ExportFile domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function exportFileToApi(exportFile: ExportFile): ExportFile {
  return ConverterPresets.standardApiResponse(exportFile, { dateFields: ["createdAt", "updatedAt"] }) as ExportFile;
}

/**
 * Convert ExternalSystemInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function externalSystemInputToApi(externalSystemInput: ExternalSystemInput): ExternalSystemInput {
  return ConverterPresets.standardApiResponse(externalSystemInput, { dateFields: [] }) as ExternalSystemInput;
}

/**
 * Convert ExternalSystemUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function externalSystemUpdateToApi(externalSystemUpdate: ExternalSystemUpdate): ExternalSystemUpdate {
  return ConverterPresets.standardApiResponse(externalSystemUpdate, { dateFields: [] }) as ExternalSystemUpdate;
}

/**
 * Convert FHIRBundleInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function fHIRBundleInputToApi(fHIRBundleInput: FHIRBundleInput): FHIRBundleInput {
  return ConverterPresets.standardApiResponse(fHIRBundleInput, { dateFields: [] }) as FHIRBundleInput;
}

/**
 * Convert FHIRMappingProfileInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function fHIRMappingProfileInputToApi(fHIRMappingProfileInput: FHIRMappingProfileInput): FHIRMappingProfileInput {
  return ConverterPresets.standardApiResponse(fHIRMappingProfileInput, { dateFields: [] }) as FHIRMappingProfileInput;
}

/**
 * Convert FHIRMappingProfileUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function fHIRMappingProfileUpdateToApi(fHIRMappingProfileUpdate: FHIRMappingProfileUpdate): FHIRMappingProfileUpdate {
  return ConverterPresets.standardApiResponse(fHIRMappingProfileUpdate, { dateFields: [] }) as FHIRMappingProfileUpdate;
}

/**
 * Convert ImportRecord domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function importRecordToApi(importRecord: ImportRecord): ImportRecord {
  return ConverterPresets.standardApiResponse(importRecord, { dateFields: ["createdAt", "updatedAt"] }) as ImportRecord;
}

/**
 * Convert IntegrationJobInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function integrationJobInputToApi(integrationJobInput: IntegrationJobInput): IntegrationJobInput {
  return ConverterPresets.standardApiResponse(integrationJobInput, { dateFields: [] }) as IntegrationJobInput;
}

/**
 * Convert IntegrationJobUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `lastRunAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function integrationJobUpdateToApi(integrationJobUpdate: IntegrationJobUpdate): IntegrationJobUpdate {
  return ConverterPresets.standardApiResponse(integrationJobUpdate, { dateFields: ["lastRunAt"] }) as IntegrationJobUpdate;
}

/**
 * Convert IntegrationLog domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `timestamp`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function integrationLogToApi(integrationLog: IntegrationLog): IntegrationLog {
  return ConverterPresets.standardApiResponse(integrationLog, { dateFields: ["createdAt", "timestamp", "updatedAt"] }) as IntegrationLog;
}

/**
 * Convert IntegrationRunInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `startedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function integrationRunInputToApi(integrationRunInput: IntegrationRunInput): IntegrationRunInput {
  return ConverterPresets.standardApiResponse(integrationRunInput, { dateFields: ["startedAt"] }) as IntegrationRunInput;
}

/**
 * Convert InterfaceHealthCheckInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `lastFailureAt`, `lastSuccessAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function interfaceHealthCheckInputToApi(interfaceHealthCheckInput: InterfaceHealthCheckInput): InterfaceHealthCheckInput {
  return ConverterPresets.standardApiResponse(interfaceHealthCheckInput, { dateFields: ["lastFailureAt", "lastSuccessAt"] }) as InterfaceHealthCheckInput;
}

/**
 * Convert MappingResult domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function mappingResultToApi(mappingResult: MappingResult): MappingResult {
  return ConverterPresets.standardApiResponse(mappingResult, { dateFields: ["createdAt", "updatedAt"] }) as MappingResult;
}

/**
 * Convert MappingRule domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function mappingRuleToApi(mappingRule: MappingRule): MappingRule {
  return ConverterPresets.standardApiResponse(mappingRule, { dateFields: ["createdAt", "updatedAt"] }) as MappingRule;
}

/**
 * Convert SystemEndpoint domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function systemEndpointToApi(systemEndpoint: SystemEndpoint): SystemEndpoint {
  return ConverterPresets.standardApiResponse(systemEndpoint, { dateFields: ["createdAt", "updatedAt"] }) as SystemEndpoint;
}

/**
 * Convert Timestamps domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function timestampsToApi(timestamps: Timestamps): Timestamps {
  return ConverterPresets.standardApiResponse(timestamps, { dateFields: ["createdAt", "updatedAt"] }) as Timestamps;
}

/**
 * Convert UsageMetric domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function usageMetricToApi(usageMetric: UsageMetric): UsageMetric {
  return ConverterPresets.standardApiResponse(usageMetric, { dateFields: ["createdAt", "updatedAt"] }) as UsageMetric;
}
