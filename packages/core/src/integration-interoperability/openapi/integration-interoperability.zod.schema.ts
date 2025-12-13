import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const IntApiMeta = z
  .object({
    correlationId: z.string(),
    timestamp: z.string().datetime({ offset: true }),
    totalCount: z.number().int(),
    pageSize: z.number().int(),
    pageNumber: z.number().int(),
  })
  .partial()
  .passthrough();
const IntApiListResponse = z
  .object({ data: z.array(z.any()), meta: IntApiMeta })
  .partial()
  .passthrough();
const Timestamps = z
  .object({
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ExternalSystem = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      systemType: z.enum(["ehr", "lis", "ris", "pms", "hie", "payer", "other"]),
      vendor: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const IntApiResponse = z
  .object({ data: z.object({}).partial().passthrough(), meta: IntApiMeta })
  .partial()
  .passthrough();
const ExternalSystemInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    systemType: z.enum(["ehr", "lis", "ris", "pms", "hie", "payer", "other"]),
    vendor: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createExternalSystem_Body = IntApiResponse.and(
  z.object({ data: ExternalSystemInput }).partial().passthrough()
);
const Error = z
  .object({
    error: z.string(),
    message: z.string(),
    details: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const ExternalSystemUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    vendor: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateExternalSystem_Body = IntApiResponse.and(
  z.object({ data: ExternalSystemUpdate }).partial().passthrough()
);
const SystemEndpoint = z
  .object({
    id: z.string(),
    externalSystemId: z.string(),
    endpointType: z.enum(["fhir", "hl7", "rest", "soap", "other"]),
    url: z.string().url(),
    description: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const Connection = Timestamps.and(
  z
    .object({
      id: z.string(),
      externalSystemId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      baseUrl: z.string().url().optional(),
      protocol: z.enum(["fhir", "hl7", "rest", "soap", "other"]).optional(),
      profile: z.string().optional(),
      credentials: z.object({}).partial().passthrough().optional(),
      status: z.enum(["active", "inactive", "error"]).optional(),
      lastSyncAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const IntegrationJob = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      externalSystemId: z.string().optional(),
      connectionId: z.string().optional(),
      jobType: z.enum(["sync", "import", "export", "scheduled", "manual"]),
      schedule: z.object({}).partial().passthrough().optional(),
      status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
      lastRunAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ConnectionInput = z
  .object({
    externalSystemId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    baseUrl: z.string().url(),
    protocol: z.enum(["fhir", "hl7", "rest", "soap", "other"]),
    profile: z.string().optional(),
    credentials: z.object({}).partial().passthrough().optional(),
    status: z.enum(["active", "inactive", "error"]).optional().default("active"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createConnection_Body = IntApiResponse.and(
  z.object({ data: ConnectionInput }).partial().passthrough()
);
const ConnectionUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    baseUrl: z.string().url(),
    credentials: z.object({}).partial().passthrough(),
    status: z.enum(["active", "inactive", "error"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateConnection_Body = IntApiResponse.and(
  z.object({ data: ConnectionUpdate }).partial().passthrough()
);
const InterfaceHealthCheck = Timestamps.and(
  z
    .object({
      id: z.string(),
      connectionId: z.string(),
      status: z.enum(["healthy", "degraded", "down"]),
      latency: z.number().optional(),
      lastSuccessAt: z.string().datetime({ offset: true }).optional(),
      lastFailureAt: z.string().datetime({ offset: true }).optional(),
      availability: z.number().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const FHIRBundle = Timestamps.and(
  z
    .object({
      id: z.string(),
      bundleType: z.enum([
        "document",
        "message",
        "transaction",
        "transaction-response",
        "batch",
        "batch-response",
        "history",
        "searchset",
        "collection",
      ]),
      resources: z.array(z.object({}).partial().passthrough()).optional(),
      direction: z.enum(["inbound", "outbound"]).optional(),
      connectionId: z.string().optional(),
      status: z.enum(["received", "processing", "completed", "failed"]).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const FHIRBundleInput = z
  .object({
    bundleType: z.enum([
      "document",
      "message",
      "transaction",
      "transaction-response",
      "batch",
      "batch-response",
      "history",
      "searchset",
      "collection",
    ]),
    resources: z.array(z.object({}).partial().passthrough()),
    direction: z.enum(["inbound", "outbound"]).optional().default("inbound"),
    connectionId: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const FHIRMappingProfile = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      externalSystemId: z.string(),
      sourceProfile: z.string().optional(),
      targetProfile: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const FHIRMappingProfileInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    externalSystemId: z.string(),
    sourceProfile: z.string().optional(),
    targetProfile: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createFHIRMappingProfile_Body = IntApiResponse.and(
  z.object({ data: FHIRMappingProfileInput }).partial().passthrough()
);
const FHIRMappingProfileUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    sourceProfile: z.string(),
    targetProfile: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateFHIRMappingProfile_Body = IntApiResponse.and(
  z.object({ data: FHIRMappingProfileUpdate }).partial().passthrough()
);
const MappingRule = z
  .object({
    id: z.string(),
    mappingProfileId: z.string(),
    sourcePath: z.string(),
    targetPath: z.string(),
    transformation: z.object({}).partial().passthrough(),
    order: z.number().int(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const HL7Message = Timestamps.and(
  z
    .object({
      id: z.string(),
      messageType: z.string(),
      rawMessage: z.string().optional(),
      parsedMessage: z.object({}).partial().passthrough().optional(),
      direction: z.enum(["inbound", "outbound"]).optional(),
      connectionId: z.string().optional(),
      status: z.enum(["received", "parsed", "processed", "failed"]).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const HL7Segment = z
  .object({
    id: z.string(),
    hl7MessageId: z.string(),
    segmentType: z.string(),
    segmentData: z.object({}).partial().passthrough(),
    order: z.number().int(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const MappingResult = z
  .object({
    id: z.string(),
    hl7MessageId: z.string(),
    mappingProfileId: z.string(),
    result: z.object({}).partial().passthrough(),
    success: z.boolean(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const HL7MappingProfile = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      externalSystemId: z.string(),
      messageType: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const HL7MappingProfileInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    externalSystemId: z.string(),
    messageType: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createHL7MappingProfile_Body = IntApiResponse.and(
  z.object({ data: HL7MappingProfileInput }).partial().passthrough()
);
const HL7MappingProfileUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    messageType: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateHL7MappingProfile_Body = IntApiResponse.and(
  z.object({ data: HL7MappingProfileUpdate }).partial().passthrough()
);
const IntegrationJobInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    externalSystemId: z.string().optional(),
    connectionId: z.string().optional(),
    jobType: z.enum(["sync", "import", "export", "scheduled", "manual"]),
    schedule: z.object({}).partial().passthrough().optional(),
    status: z
      .enum(["pending", "running", "completed", "failed", "cancelled"])
      .optional()
      .default("pending"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createIntegrationJob_Body = IntApiResponse.and(
  z.object({ data: IntegrationJobInput }).partial().passthrough()
);
const IntegrationJobUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    schedule: z.object({}).partial().passthrough(),
    status: z.enum(["pending", "running", "completed", "failed", "cancelled"]),
    lastRunAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateIntegrationJob_Body = IntApiResponse.and(
  z.object({ data: IntegrationJobUpdate }).partial().passthrough()
);
const IntegrationRun = Timestamps.and(
  z
    .object({
      id: z.string(),
      integrationJobId: z.string(),
      status: z.enum(["running", "completed", "failed"]).optional(),
      startedAt: z.string().datetime({ offset: true }).optional(),
      completedAt: z.string().datetime({ offset: true }).optional(),
      recordsProcessed: z.number().int().optional(),
      recordsTotal: z.number().int().optional(),
      errorCount: z.number().int().optional(),
      executionTime: z.number().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const IntegrationRunInput = z
  .object({
    integrationJobId: z.string(),
    status: z.enum(["running", "completed", "failed"]).optional().default("running"),
    startedAt: z.string().datetime({ offset: true }).optional(),
    recordsProcessed: z.number().int().optional(),
    recordsTotal: z.number().int().optional(),
    errorCount: z.number().int().optional(),
    executionTime: z.number().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createIntegrationRun_Body = IntApiResponse.and(
  z.object({ data: IntegrationRunInput }).partial().passthrough()
);
const IntegrationLog = z
  .object({
    id: z.string(),
    integrationRunId: z.string(),
    logLevel: z.enum(["debug", "info", "warn", "error"]),
    message: z.string(),
    timestamp: z.string().datetime({ offset: true }),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const InterfaceError = Timestamps.and(
  z
    .object({
      id: z.string(),
      errorType: z.enum(["message-level", "record-level", "validation", "connection", "other"]),
      message: z.string(),
      entityType: z.string().optional(),
      entityId: z.string().optional(),
      connectionId: z.string().optional(),
      status: z.enum(["open", "resolved", "ignored", "reprocessed"]).optional(),
      resolvedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const DataImportBatch = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      format: z.enum(["csv", "ndjson", "fhir-bulk", "other"]),
      sourceUrl: z.string().url().optional(),
      status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      recordsTotal: z.number().int().optional(),
      recordsProcessed: z.number().int().optional(),
      recordsFailed: z.number().int().optional(),
      startedAt: z.string().datetime({ offset: true }).optional(),
      completedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const DataImportBatchInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    format: z.enum(["csv", "ndjson", "fhir-bulk", "other"]),
    sourceUrl: z.string().url().optional(),
    status: z.enum(["pending", "processing", "completed", "failed"]).optional().default("pending"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createDataImportBatch_Body = IntApiResponse.and(
  z.object({ data: DataImportBatchInput }).partial().passthrough()
);
const DataImportBatchUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    status: z.enum(["pending", "processing", "completed", "failed"]),
    recordsProcessed: z.number().int(),
    recordsFailed: z.number().int(),
    completedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateDataImportBatch_Body = IntApiResponse.and(
  z.object({ data: DataImportBatchUpdate }).partial().passthrough()
);
const ImportRecord = z
  .object({
    id: z.string(),
    dataImportBatchId: z.string(),
    recordNumber: z.number().int(),
    recordData: z.object({}).partial().passthrough(),
    status: z.enum(["pending", "processed", "failed"]),
    errorMessage: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const DataExportBatch = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      targetSystemId: z.string(),
      format: z.string().optional(),
      status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      recordsTotal: z.number().int().optional(),
      filesGenerated: z.number().int().optional(),
      startedAt: z.string().datetime({ offset: true }).optional(),
      completedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const DataExportBatchInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    targetSystemId: z.string(),
    format: z.string().optional(),
    status: z.enum(["pending", "processing", "completed", "failed"]).optional().default("pending"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createDataExportBatch_Body = IntApiResponse.and(
  z.object({ data: DataExportBatchInput }).partial().passthrough()
);
const DataExportBatchUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    status: z.enum(["pending", "processing", "completed", "failed"]),
    filesGenerated: z.number().int(),
    completedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateDataExportBatch_Body = IntApiResponse.and(
  z.object({ data: DataExportBatchUpdate }).partial().passthrough()
);
const ExportFile = z
  .object({
    id: z.string(),
    dataExportBatchId: z.string(),
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileSize: z.number().int(),
    recordCount: z.number().int(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const EventSubscription = Timestamps.and(
  z
    .object({
      id: z.string(),
      eventType: z.string(),
      webhookUrl: z.string().url(),
      externalSystemId: z.string().optional(),
      filters: z.object({}).partial().passthrough().optional(),
      status: z.enum(["active", "inactive", "paused"]).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const EventSubscriptionInput = z
  .object({
    eventType: z.string(),
    webhookUrl: z.string().url(),
    externalSystemId: z.string().optional(),
    filters: z.object({}).partial().passthrough().optional(),
    status: z.enum(["active", "inactive", "paused"]).optional().default("active"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createEventSubscription_Body = IntApiResponse.and(
  z.object({ data: EventSubscriptionInput }).partial().passthrough()
);
const EventSubscriptionUpdate = z
  .object({
    webhookUrl: z.string().url(),
    filters: z.object({}).partial().passthrough(),
    status: z.enum(["active", "inactive", "paused"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateEventSubscription_Body = IntApiResponse.and(
  z.object({ data: EventSubscriptionUpdate }).partial().passthrough()
);
const EventDelivery = Timestamps.and(
  z
    .object({
      id: z.string(),
      eventSubscriptionId: z.string(),
      eventData: z.object({}).partial().passthrough().optional(),
      status: z.enum(["pending", "delivered", "failed", "retrying"]).optional(),
      deliveredAt: z.string().datetime({ offset: true }).optional(),
      retryCount: z.number().int().optional(),
      errorMessage: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const EventDeliveryInput = z
  .object({
    eventSubscriptionId: z.string(),
    eventData: z.object({}).partial().passthrough(),
    status: z.enum(["pending", "delivered", "failed", "retrying"]).optional().default("pending"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createEventDelivery_Body = IntApiResponse.and(
  z.object({ data: EventDeliveryInput }).partial().passthrough()
);
const EventDeliveryUpdate = z
  .object({
    status: z.enum(["pending", "delivered", "failed", "retrying"]),
    deliveredAt: z.string().datetime({ offset: true }),
    retryCount: z.number().int(),
    errorMessage: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateEventDelivery_Body = IntApiResponse.and(
  z.object({ data: EventDeliveryUpdate }).partial().passthrough()
);
const APIClient = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      status: z.enum(["active", "inactive", "suspended"]).optional(),
      rateLimit: z.number().int().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const APIClientInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    status: z.enum(["active", "inactive", "suspended"]).optional().default("active"),
    rateLimit: z.number().int().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createAPIClient_Body = IntApiResponse.and(
  z.object({ data: APIClientInput }).partial().passthrough()
);
const APIClientUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    status: z.enum(["active", "inactive", "suspended"]),
    rateLimit: z.number().int(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateAPIClient_Body = IntApiResponse.and(
  z.object({ data: APIClientUpdate }).partial().passthrough()
);
const APICredential = Timestamps.and(
  z
    .object({
      id: z.string(),
      apiClientId: z.string(),
      credentialType: z.enum(["api-key", "oauth-client", "certificate"]),
      keyId: z.string().optional(),
      secretHash: z.string().optional(),
      expiresAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const UsageMetric = z
  .object({
    id: z.string(),
    apiClientId: z.string(),
    metricType: z.enum(["request-count", "error-count", "latency", "throttle-count"]),
    value: z.number(),
    period: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const APICredentialInput = z
  .object({
    apiClientId: z.string(),
    credentialType: z.enum(["api-key", "oauth-client", "certificate"]),
    keyId: z.string().optional(),
    secret: z.string().optional(),
    expiresAt: z.string().datetime({ offset: true }).optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createAPICredential_Body = IntApiResponse.and(
  z.object({ data: APICredentialInput }).partial().passthrough()
);
const APICredentialUpdate = z
  .object({
    expiresAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateAPICredential_Body = IntApiResponse.and(
  z.object({ data: APICredentialUpdate }).partial().passthrough()
);
const InterfaceErrorInput = z
  .object({
    errorType: z.enum(["message-level", "record-level", "validation", "connection", "other"]),
    message: z.string(),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    connectionId: z.string().optional(),
    status: z.enum(["open", "resolved", "ignored", "reprocessed"]).optional().default("open"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createInterfaceError_Body = IntApiResponse.and(
  z.object({ data: InterfaceErrorInput }).partial().passthrough()
);
const InterfaceErrorUpdate = z
  .object({
    status: z.enum(["open", "resolved", "ignored", "reprocessed"]),
    resolvedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateInterfaceError_Body = IntApiResponse.and(
  z.object({ data: InterfaceErrorUpdate }).partial().passthrough()
);
const InterfaceHealthCheckInput = z
  .object({
    connectionId: z.string(),
    status: z.enum(["healthy", "degraded", "down"]),
    latency: z.number().optional(),
    lastSuccessAt: z.string().datetime({ offset: true }).optional(),
    lastFailureAt: z.string().datetime({ offset: true }).optional(),
    availability: z.number().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createInterfaceHealthCheck_Body = IntApiResponse.and(
  z.object({ data: InterfaceHealthCheckInput }).partial().passthrough()
);

export const schemas = {
  IntApiMeta,
  IntApiListResponse,
  Timestamps,
  ExternalSystem,
  IntApiResponse,
  ExternalSystemInput,
  createExternalSystem_Body,
  Error,
  ExternalSystemUpdate,
  updateExternalSystem_Body,
  SystemEndpoint,
  Connection,
  IntegrationJob,
  ConnectionInput,
  createConnection_Body,
  ConnectionUpdate,
  updateConnection_Body,
  InterfaceHealthCheck,
  FHIRBundle,
  FHIRBundleInput,
  FHIRMappingProfile,
  FHIRMappingProfileInput,
  createFHIRMappingProfile_Body,
  FHIRMappingProfileUpdate,
  updateFHIRMappingProfile_Body,
  MappingRule,
  HL7Message,
  HL7Segment,
  MappingResult,
  HL7MappingProfile,
  HL7MappingProfileInput,
  createHL7MappingProfile_Body,
  HL7MappingProfileUpdate,
  updateHL7MappingProfile_Body,
  IntegrationJobInput,
  createIntegrationJob_Body,
  IntegrationJobUpdate,
  updateIntegrationJob_Body,
  IntegrationRun,
  IntegrationRunInput,
  createIntegrationRun_Body,
  IntegrationLog,
  InterfaceError,
  DataImportBatch,
  DataImportBatchInput,
  createDataImportBatch_Body,
  DataImportBatchUpdate,
  updateDataImportBatch_Body,
  ImportRecord,
  DataExportBatch,
  DataExportBatchInput,
  createDataExportBatch_Body,
  DataExportBatchUpdate,
  updateDataExportBatch_Body,
  ExportFile,
  EventSubscription,
  EventSubscriptionInput,
  createEventSubscription_Body,
  EventSubscriptionUpdate,
  updateEventSubscription_Body,
  EventDelivery,
  EventDeliveryInput,
  createEventDelivery_Body,
  EventDeliveryUpdate,
  updateEventDelivery_Body,
  APIClient,
  APIClientInput,
  createAPIClient_Body,
  APIClientUpdate,
  updateAPIClient_Body,
  APICredential,
  UsageMetric,
  APICredentialInput,
  createAPICredential_Body,
  APICredentialUpdate,
  updateAPICredential_Body,
  InterfaceErrorInput,
  createInterfaceError_Body,
  InterfaceErrorUpdate,
  updateInterfaceError_Body,
  InterfaceHealthCheckInput,
  createInterfaceHealthCheck_Body,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api-clients",
    alias: "listAPIClients",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["active", "inactive", "suspended"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(APIClient) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/api-clients",
    alias: "createAPIClient",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createAPIClient_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: APIClient }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/api-clients/:id",
    alias: "getAPIClient",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: APIClient }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/api-clients/:id",
    alias: "updateAPIClient",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateAPIClient_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: APIClient }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/api-clients/:id",
    alias: "deleteAPIClient",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/api-clients/:id/credentials",
    alias: "listAPIClientCredentials",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(APICredential),
  },
  {
    method: "get",
    path: "/api-clients/:id/usage-metrics",
    alias: "listAPIClientUsageMetrics",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(UsageMetric),
  },
  {
    method: "get",
    path: "/api-credentials",
    alias: "listAPICredentials",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "apiClientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "credentialType",
        type: "Query",
        schema: z.enum(["api-key", "oauth-client", "certificate"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(APICredential) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/api-credentials",
    alias: "createAPICredential",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createAPICredential_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: APICredential }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/api-credentials/:id",
    alias: "getAPICredential",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: APICredential }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/api-credentials/:id",
    alias: "updateAPICredential",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateAPICredential_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: APICredential }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/api-credentials/:id",
    alias: "deleteAPICredential",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/connections",
    alias: "listConnections",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "externalSystemId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["active", "inactive", "error"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(Connection) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/connections",
    alias: "createConnection",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createConnection_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: Connection }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/connections/:id",
    alias: "getConnection",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: Connection }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/connections/:id",
    alias: "updateConnection",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateConnection_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: Connection }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/connections/:id",
    alias: "deleteConnection",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/connections/:id/health-checks",
    alias: "listConnectionHealthChecks",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(InterfaceHealthCheck),
  },
  {
    method: "get",
    path: "/connections/:id/integration-jobs",
    alias: "listConnectionIntegrationJobs",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(IntegrationJob),
  },
  {
    method: "get",
    path: "/data-export-batches",
    alias: "listDataExportBatches",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      },
      {
        name: "targetSystemId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(DataExportBatch) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/data-export-batches",
    alias: "createDataExportBatch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createDataExportBatch_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: DataExportBatch }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/data-export-batches/:id",
    alias: "getDataExportBatch",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: DataExportBatch }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/data-export-batches/:id",
    alias: "updateDataExportBatch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateDataExportBatch_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: DataExportBatch }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/data-export-batches/:id",
    alias: "deleteDataExportBatch",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/data-export-batches/:id/errors",
    alias: "listDataExportBatchErrors",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(InterfaceError),
  },
  {
    method: "get",
    path: "/data-export-batches/:id/files",
    alias: "listDataExportBatchFiles",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ExportFile),
  },
  {
    method: "get",
    path: "/data-import-batches",
    alias: "listDataImportBatches",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      },
      {
        name: "format",
        type: "Query",
        schema: z.enum(["csv", "ndjson", "fhir-bulk", "other"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(DataImportBatch) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/data-import-batches",
    alias: "createDataImportBatch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createDataImportBatch_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: DataImportBatch }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/data-import-batches/:id",
    alias: "getDataImportBatch",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: DataImportBatch }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/data-import-batches/:id",
    alias: "updateDataImportBatch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateDataImportBatch_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: DataImportBatch }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/data-import-batches/:id",
    alias: "deleteDataImportBatch",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/data-import-batches/:id/errors",
    alias: "listDataImportBatchErrors",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(InterfaceError),
  },
  {
    method: "get",
    path: "/data-import-batches/:id/records",
    alias: "listDataImportBatchRecords",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ImportRecord),
  },
  {
    method: "get",
    path: "/event-deliveries",
    alias: "listEventDeliveries",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "eventSubscriptionId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["pending", "delivered", "failed", "retrying"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(EventDelivery) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/event-deliveries",
    alias: "createEventDelivery",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createEventDelivery_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: EventDelivery }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/event-deliveries/:id",
    alias: "getEventDelivery",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: EventDelivery }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/event-deliveries/:id",
    alias: "updateEventDelivery",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateEventDelivery_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: EventDelivery }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/event-subscriptions",
    alias: "listEventSubscriptions",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "eventType",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["active", "inactive", "paused"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(EventSubscription) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/event-subscriptions",
    alias: "createEventSubscription",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createEventSubscription_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: EventSubscription }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/event-subscriptions/:id",
    alias: "getEventSubscription",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: EventSubscription }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/event-subscriptions/:id",
    alias: "updateEventSubscription",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateEventSubscription_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: EventSubscription }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/event-subscriptions/:id",
    alias: "deleteEventSubscription",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/event-subscriptions/:id/deliveries",
    alias: "listEventSubscriptionDeliveries",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(EventDelivery),
  },
  {
    method: "get",
    path: "/external-systems",
    alias: "listExternalSystems",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "systemType",
        type: "Query",
        schema: z.enum(["ehr", "lis", "ris", "pms", "hie", "payer", "other"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(ExternalSystem) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/external-systems",
    alias: "createExternalSystem",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createExternalSystem_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: ExternalSystem }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/external-systems/:id",
    alias: "getExternalSystem",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: ExternalSystem }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/external-systems/:id",
    alias: "updateExternalSystem",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateExternalSystem_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: ExternalSystem }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/external-systems/:id",
    alias: "deleteExternalSystem",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/external-systems/:id/connections",
    alias: "listExternalSystemConnections",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Connection),
  },
  {
    method: "get",
    path: "/external-systems/:id/endpoints",
    alias: "listExternalSystemEndpoints",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(SystemEndpoint),
  },
  {
    method: "get",
    path: "/external-systems/:id/integration-jobs",
    alias: "listExternalSystemIntegrationJobs",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(IntegrationJob),
  },
  {
    method: "get",
    path: "/fhir-bundles",
    alias: "listFHIRBundles",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "bundleType",
        type: "Query",
        schema: z
          .enum([
            "document",
            "message",
            "transaction",
            "transaction-response",
            "batch",
            "batch-response",
            "history",
            "searchset",
            "collection",
          ])
          .optional(),
      },
      {
        name: "direction",
        type: "Query",
        schema: z.enum(["inbound", "outbound"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(FHIRBundle) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/fhir-bundles",
    alias: "createFHIRBundle",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FHIRBundleInput,
      },
    ],
    response: IntApiResponse.and(z.object({ data: FHIRBundle }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/fhir-bundles/:id",
    alias: "getFHIRBundle",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: FHIRBundle }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/fhir-bundles/:id",
    alias: "deleteFHIRBundle",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/fhir-bundles/:id/resources",
    alias: "listFHIRBundleResources",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(z.object({}).partial().passthrough()),
  },
  {
    method: "get",
    path: "/fhir-mapping-profiles",
    alias: "listFHIRMappingProfiles",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "externalSystemId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(FHIRMappingProfile) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/fhir-mapping-profiles",
    alias: "createFHIRMappingProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createFHIRMappingProfile_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: FHIRMappingProfile }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/fhir-mapping-profiles/:id",
    alias: "getFHIRMappingProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: FHIRMappingProfile }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/fhir-mapping-profiles/:id",
    alias: "updateFHIRMappingProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateFHIRMappingProfile_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: FHIRMappingProfile }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/fhir-mapping-profiles/:id",
    alias: "deleteFHIRMappingProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/fhir-mapping-profiles/:id/rules",
    alias: "listFHIRMappingProfileRules",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(MappingRule),
  },
  {
    method: "get",
    path: "/hl7-mapping-profiles",
    alias: "listHL7MappingProfiles",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "externalSystemId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(HL7MappingProfile) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/hl7-mapping-profiles",
    alias: "createHL7MappingProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createHL7MappingProfile_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: HL7MappingProfile }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/hl7-mapping-profiles/:id",
    alias: "getHL7MappingProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: HL7MappingProfile }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/hl7-mapping-profiles/:id",
    alias: "updateHL7MappingProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateHL7MappingProfile_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: HL7MappingProfile }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/hl7-mapping-profiles/:id",
    alias: "deleteHL7MappingProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/hl7-mapping-profiles/:id/rules",
    alias: "listHL7MappingProfileRules",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(MappingRule),
  },
  {
    method: "get",
    path: "/hl7-messages",
    alias: "listHL7Messages",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "messageType",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "direction",
        type: "Query",
        schema: z.enum(["inbound", "outbound"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(HL7Message) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/hl7-messages",
    alias: "createHL7Message",
    requestFormat: "text",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.string(),
      },
    ],
    response: IntApiResponse.and(z.object({ data: HL7Message }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/hl7-messages/:id",
    alias: "getHL7Message",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: HL7Message }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/hl7-messages/:id",
    alias: "deleteHL7Message",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/hl7-messages/:id/mapping-results",
    alias: "listHL7MessageMappingResults",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(MappingResult),
  },
  {
    method: "get",
    path: "/hl7-messages/:id/segments",
    alias: "listHL7MessageSegments",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(HL7Segment),
  },
  {
    method: "get",
    path: "/integration-jobs",
    alias: "listIntegrationJobs",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "externalSystemId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "connectionId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "jobType",
        type: "Query",
        schema: z.enum(["sync", "import", "export", "scheduled", "manual"]).optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(IntegrationJob) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/integration-jobs",
    alias: "createIntegrationJob",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createIntegrationJob_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: IntegrationJob }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/integration-jobs/:id",
    alias: "getIntegrationJob",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: IntegrationJob }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/integration-jobs/:id",
    alias: "updateIntegrationJob",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateIntegrationJob_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: IntegrationJob }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/integration-jobs/:id",
    alias: "deleteIntegrationJob",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/integration-jobs/:id/runs",
    alias: "listIntegrationJobRuns",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(IntegrationRun),
  },
  {
    method: "get",
    path: "/integration-runs",
    alias: "listIntegrationRuns",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "integrationJobId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["running", "completed", "failed"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(IntegrationRun) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/integration-runs",
    alias: "createIntegrationRun",
    description: `Creates an immutable integration run record. Once created, runs cannot be
modified to ensure audit trail integrity.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createIntegrationRun_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: IntegrationRun }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/integration-runs/:id",
    alias: "getIntegrationRun",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: IntegrationRun }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/integration-runs/:id/errors",
    alias: "listIntegrationRunErrors",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(InterfaceError),
  },
  {
    method: "get",
    path: "/integration-runs/:id/logs",
    alias: "listIntegrationRunLogs",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(IntegrationLog),
  },
  {
    method: "get",
    path: "/interface-errors",
    alias: "listInterfaceErrors",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "errorType",
        type: "Query",
        schema: z
          .enum(["message-level", "record-level", "validation", "connection", "other"])
          .optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["open", "resolved", "ignored", "reprocessed"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(InterfaceError) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/interface-errors",
    alias: "createInterfaceError",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createInterfaceError_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: InterfaceError }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/interface-errors/:id",
    alias: "getInterfaceError",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: InterfaceError }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/interface-errors/:id",
    alias: "updateInterfaceError",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateInterfaceError_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: InterfaceError }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/interface-health-checks",
    alias: "listInterfaceHealthChecks",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "connectionId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["healthy", "degraded", "down"]).optional(),
      },
    ],
    response: IntApiListResponse.and(
      z
        .object({ data: z.array(InterfaceHealthCheck) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/interface-health-checks",
    alias: "createInterfaceHealthCheck",
    description: `Creates an immutable interface health check snapshot. Once created, health checks cannot be
modified to ensure historical accuracy.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createInterfaceHealthCheck_Body,
      },
    ],
    response: IntApiResponse.and(z.object({ data: InterfaceHealthCheck }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/interface-health-checks/:id",
    alias: "getInterfaceHealthCheck",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntApiResponse.and(z.object({ data: InterfaceHealthCheck }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: IntApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
]);

export const api = new Zodios("https://api.cuurai.com/api/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
