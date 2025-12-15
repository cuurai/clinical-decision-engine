import { z, type ZodTypeAny } from "zod";

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

export const schemas: Record<string, ZodTypeAny> = {
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



