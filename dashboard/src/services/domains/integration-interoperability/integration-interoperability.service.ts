import { createResourceService } from "../../core/resource-service";
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
} from "./integration-interoperability.types";

export const externalSystemsService = createResourceService<ExternalSystem, CreateExternalSystemInput, UpdateExternalSystemInput>("/external-systems");
export const connectionsService = createResourceService<Connection, CreateConnectionInput, UpdateConnectionInput>("/connections");
export const integrationJobsService = createResourceService<IntegrationJob, CreateIntegrationJobInput, UpdateIntegrationJobInput>("/integration-jobs");
export const integrationRunsService = createResourceService<IntegrationRun, CreateIntegrationRunInput, UpdateIntegrationRunInput>("/integration-runs");
export const dataImportBatchesService = createResourceService<DataImportBatch, CreateDataImportBatchInput, UpdateDataImportBatchInput>("/data-import-batches");
export const dataExportBatchesService = createResourceService<DataExportBatch, CreateDataExportBatchInput, UpdateDataExportBatchInput>("/data-export-batches");
export const fhirBundlesService = createResourceService<FHIRBundle, CreateFHIRBundleInput, UpdateFHIRBundleInput>("/f-hirbundles");
export const hl7MessagesService = createResourceService<HL7Message, CreateHL7MessageInput, UpdateHL7MessageInput>("/h-lmessages");
export const apiClientsService = createResourceService<APIClient, CreateAPIClientInput, UpdateAPIClientInput>("/a-piclients");

export const integrationInteroperabilityServices = {
  externalSystems: externalSystemsService,
  connections: connectionsService,
  integrationJobs: integrationJobsService,
  integrationRuns: integrationRunsService,
  dataImportBatches: dataImportBatchesService,
  dataExportBatches: dataExportBatchesService,
  fhirBundles: fhirBundlesService,
  hl7Messages: hl7MessagesService,
  apiClients: apiClientsService,
};
