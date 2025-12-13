import { ListParams, ListResponse } from "../../core/resource-service";
import type {
  ExternalSystem,
  ExternalSystemInput,
  ExternalSystemUpdate,
  Connection,
  ConnectionInput,
  ConnectionUpdate,
  IntegrationJob,
  IntegrationJobInput,
  IntegrationJobUpdate,
  IntegrationRun,
  IntegrationRunInput,
  DataImportBatch,
  DataImportBatchInput,
  DataImportBatchUpdate,
  DataExportBatch,
  DataExportBatchInput,
  DataExportBatchUpdate,
  FHIRBundle,
  FHIRBundleInput,
  HL7Message,
  HL7MessageInput,
  APIClient,
  APIClientInput,
  APIClientUpdate,
  ListExternalSystemsParams,
  ListConnectionsParams,
  ListIntegrationJobsParams,
  ListIntegrationRunsParams,
  ListDataImportBatchesParams,
  ListDataExportBatchesParams,
  ListFHIRBundlesParams,
  ListHL7MessagesParams,
  ListAPIClientsParams,
} from "@cuur/core/integration-interoperability/types";

// Re-export types from core
export type {
  ExternalSystem,
  Connection,
  IntegrationJob,
  IntegrationRun,
  DataImportBatch,
  DataExportBatch,
  FHIRBundle,
  HL7Message,
  APIClient,
};

// Input types
export type CreateExternalSystemInput = ExternalSystemInput;
export type UpdateExternalSystemInput = ExternalSystemUpdate;
export type CreateConnectionInput = ConnectionInput;
export type UpdateConnectionInput = ConnectionUpdate;
export type CreateIntegrationJobInput = IntegrationJobInput;
export type UpdateIntegrationJobInput = IntegrationJobUpdate;
export type CreateIntegrationRunInput = IntegrationRunInput;
export type UpdateIntegrationRunInput = Partial<IntegrationRun>;
export type CreateDataImportBatchInput = DataImportBatchInput;
export type UpdateDataImportBatchInput = DataImportBatchUpdate;
export type CreateDataExportBatchInput = DataExportBatchInput;
export type UpdateDataExportBatchInput = DataExportBatchUpdate;
export type CreateFHIRBundleInput = FHIRBundleInput;
export type UpdateFHIRBundleInput = Partial<FHIRBundle>;
export type CreateHL7MessageInput = HL7MessageInput;
export type UpdateHL7MessageInput = Partial<HL7Message>;
export type CreateAPIClientInput = APIClientInput;
export type UpdateAPIClientInput = APIClientUpdate;

// List params and response types
export type ExternalSystemListParams = ListExternalSystemsParams & ListParams;
export type ExternalSystemListResponse = ListResponse<ExternalSystem>;
export type ConnectionListParams = ListConnectionsParams & ListParams;
export type ConnectionListResponse = ListResponse<Connection>;
export type IntegrationJobListParams = ListIntegrationJobsParams & ListParams;
export type IntegrationJobListResponse = ListResponse<IntegrationJob>;
export type IntegrationRunListParams = ListIntegrationRunsParams & ListParams;
export type IntegrationRunListResponse = ListResponse<IntegrationRun>;
export type DataImportBatchListParams = ListDataImportBatchesParams & ListParams;
export type DataImportBatchListResponse = ListResponse<DataImportBatch>;
export type DataExportBatchListParams = ListDataExportBatchesParams & ListParams;
export type DataExportBatchListResponse = ListResponse<DataExportBatch>;
export type FHIRBundleListParams = ListFHIRBundlesParams & ListParams;
export type FHIRBundleListResponse = ListResponse<FHIRBundle>;
export type HL7MessageListParams = ListHL7MessagesParams & ListParams;
export type HL7MessageListResponse = ListResponse<HL7Message>;
export type APIClientListParams = ListAPIClientsParams & ListParams;
export type APIClientListResponse = ListResponse<APIClient>;
