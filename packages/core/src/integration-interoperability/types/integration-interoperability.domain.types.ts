/**
 * Integration Interoperability Domain Types
 *
 * Auto-generated from OpenAPI spec
 * Generator: types-generator v2.0.0
 *
 * This file re-exports types from generated OpenAPI types and adds
 * convenient type aliases for handlers (response types, etc.)
 *
 * ⚠️ DO NOT EDIT MANUALLY - this file is auto-generated
 */

import type { components, operations } from "../openapi/integration-interoperability.openapi.types";

// ============================================================================
// Domain Types Export - Domain-specific types only (excludes components/operations)
// ============================================================================
// This file exports domain-specific types for use in main index.ts
// components and operations are NOT exported here to avoid duplicate export errors
// Access components/operations via namespace: domain.types.components

// ============================================================================
// Convenient Type Aliases for Schemas
// ============================================================================

export type APIClient = components["schemas"]["APIClient"];
export type APIClientInput = components["schemas"]["APIClientInput"];
export type APIClientUpdate = components["schemas"]["APIClientUpdate"];
export type APICredential = components["schemas"]["APICredential"];
export type APICredentialInput = components["schemas"]["APICredentialInput"];
export type APICredentialUpdate = components["schemas"]["APICredentialUpdate"];
export type Connection = components["schemas"]["Connection"];
export type ConnectionInput = components["schemas"]["ConnectionInput"];
export type ConnectionUpdate = components["schemas"]["ConnectionUpdate"];
export type DataExportBatch = components["schemas"]["DataExportBatch"];
export type DataExportBatchInput = components["schemas"]["DataExportBatchInput"];
export type DataExportBatchUpdate = components["schemas"]["DataExportBatchUpdate"];
export type DataImportBatch = components["schemas"]["DataImportBatch"];
export type DataImportBatchInput = components["schemas"]["DataImportBatchInput"];
export type DataImportBatchUpdate = components["schemas"]["DataImportBatchUpdate"];
export type EventDelivery = components["schemas"]["EventDelivery"];
export type EventDeliveryInput = components["schemas"]["EventDeliveryInput"];
export type EventDeliveryUpdate = components["schemas"]["EventDeliveryUpdate"];
export type EventSubscription = components["schemas"]["EventSubscription"];
export type EventSubscriptionInput = components["schemas"]["EventSubscriptionInput"];
export type EventSubscriptionUpdate = components["schemas"]["EventSubscriptionUpdate"];
export type ExportFile = components["schemas"]["ExportFile"];
export type ExternalSystem = components["schemas"]["ExternalSystem"];
export type ExternalSystemInput = components["schemas"]["ExternalSystemInput"];
export type ExternalSystemUpdate = components["schemas"]["ExternalSystemUpdate"];
export type FHIRBundle = components["schemas"]["FHIRBundle"];
export type FHIRBundleInput = components["schemas"]["FHIRBundleInput"];
export type FHIRMappingProfile = components["schemas"]["FHIRMappingProfile"];
export type FHIRMappingProfileInput = components["schemas"]["FHIRMappingProfileInput"];
export type FHIRMappingProfileUpdate = components["schemas"]["FHIRMappingProfileUpdate"];
export type HL7MappingProfile = components["schemas"]["HL7MappingProfile"];
export type HL7MappingProfileInput = components["schemas"]["HL7MappingProfileInput"];
export type HL7MappingProfileUpdate = components["schemas"]["HL7MappingProfileUpdate"];
export type HL7Message = components["schemas"]["HL7Message"];
export type HL7MessageInput = components["schemas"]["HL7MessageInput"];
export type HL7Segment = components["schemas"]["HL7Segment"];
export type ImportRecord = components["schemas"]["ImportRecord"];
export type IntegrationJob = components["schemas"]["IntegrationJob"];
export type IntegrationJobInput = components["schemas"]["IntegrationJobInput"];
export type IntegrationJobUpdate = components["schemas"]["IntegrationJobUpdate"];
export type IntegrationLog = components["schemas"]["IntegrationLog"];
export type IntegrationRun = components["schemas"]["IntegrationRun"];
export type IntegrationRunInput = components["schemas"]["IntegrationRunInput"];
export type InterfaceHealthCheck = components["schemas"]["InterfaceHealthCheck"];
export type InterfaceHealthCheckInput = components["schemas"]["InterfaceHealthCheckInput"];
export type MappingResult = components["schemas"]["MappingResult"];
export type MappingRule = components["schemas"]["MappingRule"];
export type SystemEndpoint = components["schemas"]["SystemEndpoint"];
export type Timestamps = components["schemas"]["Timestamps"];
export type UsageMetric = components["schemas"]["UsageMetric"];
export type ExternalSystemEndpoint = operations["listExternalSystemEndpoints"]["responses"]["200"]["content"]["application/json"]["data"];
export type ExternalSystemConnection = operations["listExternalSystemConnections"]["responses"]["200"]["content"]["application/json"]["data"];
export type ExternalSystemIntegrationJob = operations["listExternalSystemIntegrationJobs"]["responses"]["200"]["content"]["application/json"]["data"];
export type ConnectionHealthCheck = operations["listConnectionHealthChecks"]["responses"]["200"]["content"]["application/json"]["data"];
export type ConnectionIntegrationJob = operations["listConnectionIntegrationJobs"]["responses"]["200"]["content"]["application/json"]["data"];
export type FHIRBundleResource = operations["listFHIRBundleResources"]["responses"]["200"]["content"]["application/json"]["data"];
export type FHIRMappingProfileRule = operations["listFHIRMappingProfileRules"]["responses"]["200"]["content"]["application/json"]["data"];
export type HL7MessageSegment = operations["listHL7MessageSegments"]["responses"]["200"]["content"]["application/json"]["data"];
export type HL7MessageMappingResult = operations["listHL7MessageMappingResults"]["responses"]["200"]["content"]["application/json"]["data"];
export type HL7MappingProfileRule = operations["listHL7MappingProfileRules"]["responses"]["200"]["content"]["application/json"]["data"];
export type IntegrationJobRun = operations["listIntegrationJobRuns"]["responses"]["200"]["content"]["application/json"]["data"];
export type IntegrationRunLog = operations["listIntegrationRunLogs"]["responses"]["200"]["content"]["application/json"]["data"];
export type IntegrationRunError = operations["listIntegrationRunErrors"]["responses"]["200"]["content"]["application/json"]["data"];
export type DataImportBatchRecord = operations["listDataImportBatchRecords"]["responses"]["200"]["content"]["application/json"]["data"];
export type DataImportBatchError = operations["listDataImportBatchErrors"]["responses"]["200"]["content"]["application/json"]["data"];
export type DataExportBatchFile = operations["listDataExportBatchFiles"]["responses"]["200"]["content"]["application/json"]["data"];
export type DataExportBatchError = operations["listDataExportBatchErrors"]["responses"]["200"]["content"]["application/json"]["data"];
export type EventSubscriptionDelivery = operations["listEventSubscriptionDeliveries"]["responses"]["200"]["content"]["application/json"]["data"];
export type APIClientCredential = operations["listAPIClientCredentials"]["responses"]["200"]["content"]["application/json"]["data"];
export type APIClientUsageMetric = operations["listAPIClientUsageMetrics"]["responses"]["200"]["content"]["application/json"]["data"];


// ============================================================================
// Operation Input Types (Request Bodies)
// ============================================================================

// These types represent the input data for create/update operations

export type CreateExternalSystemInput = NonNullable<operations["createExternalSystem"]["requestBody"]>["content"]["application/json"];
export type UpdateExternalSystemInput = NonNullable<operations["updateExternalSystem"]["requestBody"]>["content"]["application/json"];
export type CreateConnectionInput = NonNullable<operations["createConnection"]["requestBody"]>["content"]["application/json"];
export type UpdateConnectionInput = NonNullable<operations["updateConnection"]["requestBody"]>["content"]["application/json"];
export type FHIRBundleInputInput = NonNullable<operations["createFHIRBundle"]["requestBody"]>["content"]["application/json"];
export type CreateFHIRMappingProfileInput = NonNullable<operations["createFHIRMappingProfile"]["requestBody"]>["content"]["application/json"];
export type UpdateFHIRMappingProfileInput = NonNullable<operations["updateFHIRMappingProfile"]["requestBody"]>["content"]["application/json"];
export type CreateHLMessageInput = NonNullable<operations["createHL7Message"]["requestBody"]>["content"]["application/json"];
export type CreateHLMappingProfileInput = NonNullable<operations["createHL7MappingProfile"]["requestBody"]>["content"]["application/json"];
export type UpdateHLMappingProfileInput = NonNullable<operations["updateHL7MappingProfile"]["requestBody"]>["content"]["application/json"];
export type CreateIntegrationJobInput = NonNullable<operations["createIntegrationJob"]["requestBody"]>["content"]["application/json"];
export type UpdateIntegrationJobInput = NonNullable<operations["updateIntegrationJob"]["requestBody"]>["content"]["application/json"];
export type CreateIntegrationRunInput = NonNullable<operations["createIntegrationRun"]["requestBody"]>["content"]["application/json"];
export type CreateDataImportBatchInput = NonNullable<operations["createDataImportBatch"]["requestBody"]>["content"]["application/json"];
export type UpdateDataImportBatchInput = NonNullable<operations["updateDataImportBatch"]["requestBody"]>["content"]["application/json"];
export type CreateDataExportBatchInput = NonNullable<operations["createDataExportBatch"]["requestBody"]>["content"]["application/json"];
export type UpdateDataExportBatchInput = NonNullable<operations["updateDataExportBatch"]["requestBody"]>["content"]["application/json"];
export type CreateEventSubscriptionInput = NonNullable<operations["createEventSubscription"]["requestBody"]>["content"]["application/json"];
export type UpdateEventSubscriptionInput = NonNullable<operations["updateEventSubscription"]["requestBody"]>["content"]["application/json"];
export type CreateEventDeliveryInput = NonNullable<operations["createEventDelivery"]["requestBody"]>["content"]["application/json"];
export type UpdateEventDeliveryInput = NonNullable<operations["updateEventDelivery"]["requestBody"]>["content"]["application/json"];
export type CreateAPIClientInput = NonNullable<operations["createAPIClient"]["requestBody"]>["content"]["application/json"];
export type UpdateAPIClientInput = NonNullable<operations["updateAPIClient"]["requestBody"]>["content"]["application/json"];
export type CreateAPICredentialInput = NonNullable<operations["createAPICredential"]["requestBody"]>["content"]["application/json"];
export type UpdateAPICredentialInput = NonNullable<operations["updateAPICredential"]["requestBody"]>["content"]["application/json"];
export type CreateInterfaceErrorInput = NonNullable<operations["createInterfaceError"]["requestBody"]>["content"]["application/json"];
export type UpdateInterfaceErrorInput = NonNullable<operations["updateInterfaceError"]["requestBody"]>["content"]["application/json"];
export type CreateInterfaceHealthCheckInput = NonNullable<operations["createInterfaceHealthCheck"]["requestBody"]>["content"]["application/json"];


// ============================================================================
// Operation Parameter Types (Query Parameters)
// ============================================================================

// These types represent query parameters for list/search operations

export type ListExternalSystemsParams = operations["listExternalSystems"]["parameters"]["query"];
export type ListConnectionsParams = operations["listConnections"]["parameters"]["query"];
export type ListFHIRBundlesParams = operations["listFHIRBundles"]["parameters"]["query"];
export type ListFHIRMappingProfilesParams = operations["listFHIRMappingProfiles"]["parameters"]["query"];
export type ListHLMessagesParams = operations["listHL7Messages"]["parameters"]["query"];
export type ListHLMappingProfilesParams = operations["listHL7MappingProfiles"]["parameters"]["query"];
export type ListIntegrationJobsParams = operations["listIntegrationJobs"]["parameters"]["query"];
export type ListIntegrationRunsParams = operations["listIntegrationRuns"]["parameters"]["query"];
export type ListDataImportBatchesParams = operations["listDataImportBatches"]["parameters"]["query"];
export type ListDataExportBatchesParams = operations["listDataExportBatches"]["parameters"]["query"];
export type ListEventSubscriptionsParams = operations["listEventSubscriptions"]["parameters"]["query"];
export type ListEventDeliveriesParams = operations["listEventDeliveries"]["parameters"]["query"];
export type ListAPIClientsParams = operations["listAPIClients"]["parameters"]["query"];
export type ListAPICredentialsParams = operations["listAPICredentials"]["parameters"]["query"];
export type ListInterfaceErrorsParams = operations["listInterfaceErrors"]["parameters"]["query"];
export type ListInterfaceHealthChecksParams = operations["listInterfaceHealthChecks"]["parameters"]["query"];


// ============================================================================
// Operation Response Types
// ============================================================================

// These types are used by handlers for type-safe response envelopes

export type ListExternalSystemsResponse = operations["listExternalSystems"]["responses"]["200"]["content"]["application/json"];
export type CreateExternalSystemResponse = operations["createExternalSystem"]["responses"]["201"]["content"]["application/json"];
export type GetExternalSystemResponse = operations["getExternalSystem"]["responses"]["200"]["content"]["application/json"];
export type UpdateExternalSystemResponse = operations["updateExternalSystem"]["responses"]["200"]["content"]["application/json"];
export type ListExternalSystemEndpointsResponse = operations["listExternalSystemEndpoints"]["responses"]["200"]["content"]["application/json"];
export type ListExternalSystemConnectionsResponse = operations["listExternalSystemConnections"]["responses"]["200"]["content"]["application/json"];
export type ListExternalSystemIntegrationJobsResponse = operations["listExternalSystemIntegrationJobs"]["responses"]["200"]["content"]["application/json"];
export type ListConnectionsResponse = operations["listConnections"]["responses"]["200"]["content"]["application/json"];
export type CreateConnectionResponse = operations["createConnection"]["responses"]["201"]["content"]["application/json"];
export type GetConnectionResponse = operations["getConnection"]["responses"]["200"]["content"]["application/json"];
export type UpdateConnectionResponse = operations["updateConnection"]["responses"]["200"]["content"]["application/json"];
export type ListConnectionHealthChecksResponse = operations["listConnectionHealthChecks"]["responses"]["200"]["content"]["application/json"];
export type ListConnectionIntegrationJobsResponse = operations["listConnectionIntegrationJobs"]["responses"]["200"]["content"]["application/json"];
export type ListFHIRBundlesResponse = operations["listFHIRBundles"]["responses"]["200"]["content"]["application/json"];
export type CreateFHIRBundleResponse = operations["createFHIRBundle"]["responses"]["201"]["content"]["application/json"];
export type GetFHIRBundleResponse = operations["getFHIRBundle"]["responses"]["200"]["content"]["application/json"];
export type ListFHIRBundleResourcesResponse = operations["listFHIRBundleResources"]["responses"]["200"]["content"]["application/json"];
export type ListFHIRMappingProfilesResponse = operations["listFHIRMappingProfiles"]["responses"]["200"]["content"]["application/json"];
export type CreateFHIRMappingProfileResponse = operations["createFHIRMappingProfile"]["responses"]["201"]["content"]["application/json"];
export type GetFHIRMappingProfileResponse = operations["getFHIRMappingProfile"]["responses"]["200"]["content"]["application/json"];
export type UpdateFHIRMappingProfileResponse = operations["updateFHIRMappingProfile"]["responses"]["200"]["content"]["application/json"];
export type ListFHIRMappingProfileRulesResponse = operations["listFHIRMappingProfileRules"]["responses"]["200"]["content"]["application/json"];
export type ListHLMessagesResponse = operations["listHL7Messages"]["responses"]["200"]["content"]["application/json"];
export type CreateHLMessageResponse = operations["createHL7Message"]["responses"]["201"]["content"]["application/json"];
export type GetHLMessageResponse = operations["getHL7Message"]["responses"]["200"]["content"]["application/json"];
export type ListHLMessageSegmentsResponse = operations["listHL7MessageSegments"]["responses"]["200"]["content"]["application/json"];
export type ListHLMessageMappingResultsResponse = operations["listHL7MessageMappingResults"]["responses"]["200"]["content"]["application/json"];
export type ListHLMappingProfilesResponse = operations["listHL7MappingProfiles"]["responses"]["200"]["content"]["application/json"];
export type CreateHLMappingProfileResponse = operations["createHL7MappingProfile"]["responses"]["201"]["content"]["application/json"];
export type GetHLMappingProfileResponse = operations["getHL7MappingProfile"]["responses"]["200"]["content"]["application/json"];
export type UpdateHLMappingProfileResponse = operations["updateHL7MappingProfile"]["responses"]["200"]["content"]["application/json"];
export type ListHLMappingProfileRulesResponse = operations["listHL7MappingProfileRules"]["responses"]["200"]["content"]["application/json"];
export type ListIntegrationJobsResponse = operations["listIntegrationJobs"]["responses"]["200"]["content"]["application/json"];
export type CreateIntegrationJobResponse = operations["createIntegrationJob"]["responses"]["201"]["content"]["application/json"];
export type GetIntegrationJobResponse = operations["getIntegrationJob"]["responses"]["200"]["content"]["application/json"];
export type UpdateIntegrationJobResponse = operations["updateIntegrationJob"]["responses"]["200"]["content"]["application/json"];
export type ListIntegrationJobRunsResponse = operations["listIntegrationJobRuns"]["responses"]["200"]["content"]["application/json"];
export type ListIntegrationRunsResponse = operations["listIntegrationRuns"]["responses"]["200"]["content"]["application/json"];
export type CreateIntegrationRunResponse = operations["createIntegrationRun"]["responses"]["201"]["content"]["application/json"];
export type GetIntegrationRunResponse = operations["getIntegrationRun"]["responses"]["200"]["content"]["application/json"];
export type ListIntegrationRunLogsResponse = operations["listIntegrationRunLogs"]["responses"]["200"]["content"]["application/json"];
export type ListIntegrationRunErrorsResponse = operations["listIntegrationRunErrors"]["responses"]["200"]["content"]["application/json"];
export type ListDataImportBatchesResponse = operations["listDataImportBatches"]["responses"]["200"]["content"]["application/json"];
export type CreateDataImportBatchResponse = operations["createDataImportBatch"]["responses"]["201"]["content"]["application/json"];
export type GetDataImportBatchResponse = operations["getDataImportBatch"]["responses"]["200"]["content"]["application/json"];
export type UpdateDataImportBatchResponse = operations["updateDataImportBatch"]["responses"]["200"]["content"]["application/json"];
export type ListDataImportBatchRecordsResponse = operations["listDataImportBatchRecords"]["responses"]["200"]["content"]["application/json"];
export type ListDataImportBatchErrorsResponse = operations["listDataImportBatchErrors"]["responses"]["200"]["content"]["application/json"];
export type ListDataExportBatchesResponse = operations["listDataExportBatches"]["responses"]["200"]["content"]["application/json"];
export type CreateDataExportBatchResponse = operations["createDataExportBatch"]["responses"]["201"]["content"]["application/json"];
export type GetDataExportBatchResponse = operations["getDataExportBatch"]["responses"]["200"]["content"]["application/json"];
export type UpdateDataExportBatchResponse = operations["updateDataExportBatch"]["responses"]["200"]["content"]["application/json"];
export type ListDataExportBatchFilesResponse = operations["listDataExportBatchFiles"]["responses"]["200"]["content"]["application/json"];
export type ListDataExportBatchErrorsResponse = operations["listDataExportBatchErrors"]["responses"]["200"]["content"]["application/json"];
export type ListEventSubscriptionsResponse = operations["listEventSubscriptions"]["responses"]["200"]["content"]["application/json"];
export type CreateEventSubscriptionResponse = operations["createEventSubscription"]["responses"]["201"]["content"]["application/json"];
export type GetEventSubscriptionResponse = operations["getEventSubscription"]["responses"]["200"]["content"]["application/json"];
export type UpdateEventSubscriptionResponse = operations["updateEventSubscription"]["responses"]["200"]["content"]["application/json"];
export type ListEventSubscriptionDeliveriesResponse = operations["listEventSubscriptionDeliveries"]["responses"]["200"]["content"]["application/json"];
export type ListEventDeliveriesResponse = operations["listEventDeliveries"]["responses"]["200"]["content"]["application/json"];
export type CreateEventDeliveryResponse = operations["createEventDelivery"]["responses"]["201"]["content"]["application/json"];
export type GetEventDeliveryResponse = operations["getEventDelivery"]["responses"]["200"]["content"]["application/json"];
export type UpdateEventDeliveryResponse = operations["updateEventDelivery"]["responses"]["200"]["content"]["application/json"];
export type ListAPIClientsResponse = operations["listAPIClients"]["responses"]["200"]["content"]["application/json"];
export type CreateAPIClientResponse = operations["createAPIClient"]["responses"]["201"]["content"]["application/json"];
export type GetAPIClientResponse = operations["getAPIClient"]["responses"]["200"]["content"]["application/json"];
export type UpdateAPIClientResponse = operations["updateAPIClient"]["responses"]["200"]["content"]["application/json"];
export type ListAPIClientCredentialsResponse = operations["listAPIClientCredentials"]["responses"]["200"]["content"]["application/json"];
export type ListAPIClientUsageMetricsResponse = operations["listAPIClientUsageMetrics"]["responses"]["200"]["content"]["application/json"];
export type ListAPICredentialsResponse = operations["listAPICredentials"]["responses"]["200"]["content"]["application/json"];
export type CreateAPICredentialResponse = operations["createAPICredential"]["responses"]["201"]["content"]["application/json"];
export type GetAPICredentialResponse = operations["getAPICredential"]["responses"]["200"]["content"]["application/json"];
export type UpdateAPICredentialResponse = operations["updateAPICredential"]["responses"]["200"]["content"]["application/json"];
export type ListInterfaceErrorsResponse = operations["listInterfaceErrors"]["responses"]["200"]["content"]["application/json"];
export type CreateInterfaceErrorResponse = operations["createInterfaceError"]["responses"]["201"]["content"]["application/json"];
export type GetInterfaceErrorResponse = operations["getInterfaceError"]["responses"]["200"]["content"]["application/json"];
export type UpdateInterfaceErrorResponse = operations["updateInterfaceError"]["responses"]["200"]["content"]["application/json"];
export type ListInterfaceHealthChecksResponse = operations["listInterfaceHealthChecks"]["responses"]["200"]["content"]["application/json"];
export type CreateInterfaceHealthCheckResponse = operations["createInterfaceHealthCheck"]["responses"]["201"]["content"]["application/json"];
export type GetInterfaceHealthCheckResponse = operations["getInterfaceHealthCheck"]["responses"]["200"]["content"]["application/json"];


