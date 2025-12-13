import { useResourceHook } from "../../core/use-resource";
import { integrationInteroperabilityServices } from "./integration-interoperability.service";
import type {
  ExternalSystem,
  CreateExternalSystemInput,
  UpdateExternalSystemInput,
  Connection,
  CreateConnectionInput,
  UpdateConnectionInput,
  IntegrationJob,
  CreateIntegrationJobInput,
  UpdateIntegrationJobInput,
  IntegrationRun,
  CreateIntegrationRunInput,
  UpdateIntegrationRunInput,
  DataImportBatch,
  CreateDataImportBatchInput,
  UpdateDataImportBatchInput,
  DataExportBatch,
  CreateDataExportBatchInput,
  UpdateDataExportBatchInput,
  FHIRBundle,
  CreateFHIRBundleInput,
  UpdateFHIRBundleInput,
  HL7Message,
  CreateHL7MessageInput,
  UpdateHL7MessageInput,
  APIClient,
  CreateAPIClientInput,
  UpdateAPIClientInput,
  ExternalSystemListParams,
  ConnectionListParams,
  IntegrationJobListParams,
  IntegrationRunListParams,
  DataImportBatchListParams,
  DataExportBatchListParams,
  FHIRBundleListParams,
  HL7MessageListParams,
  APIClientListParams,
} from "./integration-interoperability.types";

export function useExternalSystems(autoFetch = true, params?: ExternalSystemListParams) {
  return useResourceHook<ExternalSystem, CreateExternalSystemInput, UpdateExternalSystemInput, ExternalSystemListParams>(
    integrationInteroperabilityServices.externalSystems,
    autoFetch,
    params
  );
}

export function useConnections(autoFetch = true, params?: ConnectionListParams) {
  return useResourceHook<Connection, CreateConnectionInput, UpdateConnectionInput, ConnectionListParams>(
    integrationInteroperabilityServices.connections,
    autoFetch,
    params
  );
}

export function useIntegrationJobs(autoFetch = true, params?: IntegrationJobListParams) {
  return useResourceHook<IntegrationJob, CreateIntegrationJobInput, UpdateIntegrationJobInput, IntegrationJobListParams>(
    integrationInteroperabilityServices.integrationJobs,
    autoFetch,
    params
  );
}

export function useIntegrationRuns(autoFetch = true, params?: IntegrationRunListParams) {
  return useResourceHook<IntegrationRun, CreateIntegrationRunInput, UpdateIntegrationRunInput, IntegrationRunListParams>(
    integrationInteroperabilityServices.integrationRuns,
    autoFetch,
    params
  );
}

export function useDataImportBatches(autoFetch = true, params?: DataImportBatchListParams) {
  return useResourceHook<DataImportBatch, CreateDataImportBatchInput, UpdateDataImportBatchInput, DataImportBatchListParams>(
    integrationInteroperabilityServices.dataImportBatches,
    autoFetch,
    params
  );
}

export function useDataExportBatches(autoFetch = true, params?: DataExportBatchListParams) {
  return useResourceHook<DataExportBatch, CreateDataExportBatchInput, UpdateDataExportBatchInput, DataExportBatchListParams>(
    integrationInteroperabilityServices.dataExportBatches,
    autoFetch,
    params
  );
}

export function useFHIRBundles(autoFetch = true, params?: FHIRBundleListParams) {
  return useResourceHook<FHIRBundle, CreateFHIRBundleInput, UpdateFHIRBundleInput, FHIRBundleListParams>(
    integrationInteroperabilityServices.fhirBundles,
    autoFetch,
    params
  );
}

export function useHL7Messages(autoFetch = true, params?: HL7MessageListParams) {
  return useResourceHook<HL7Message, CreateHL7MessageInput, UpdateHL7MessageInput, HL7MessageListParams>(
    integrationInteroperabilityServices.hl7Messages,
    autoFetch,
    params
  );
}

export function useAPIClients(autoFetch = true, params?: APIClientListParams) {
  return useResourceHook<APIClient, CreateAPIClientInput, UpdateAPIClientInput, APIClientListParams>(
    integrationInteroperabilityServices.apiClients,
    autoFetch,
    params
  );
}
