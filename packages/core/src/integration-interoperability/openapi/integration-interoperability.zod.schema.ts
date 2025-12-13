import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

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
const EventSubscriptionUpdate = z
  .object({
    webhookUrl: z.string().url(),
    filters: z.object({}).partial().passthrough(),
    status: z.enum(["active", "inactive", "paused"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
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
const APICredentialUpdate = z
  .object({
    expiresAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
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
const InterfaceErrorUpdate = z
  .object({
    status: z.enum(["open", "resolved", "ignored", "reprocessed"]),
    resolvedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
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

export const schemas = {
  Timestamps,
  ExternalSystem,
  ExternalSystemInput,
  Error,
  ExternalSystemUpdate,
  SystemEndpoint,
  Connection,
  IntegrationJob,
  ConnectionInput,
  ConnectionUpdate,
  InterfaceHealthCheck,
  FHIRBundle,
  FHIRBundleInput,
  FHIRMappingProfile,
  FHIRMappingProfileInput,
  FHIRMappingProfileUpdate,
  MappingRule,
  HL7Message,
  HL7Segment,
  MappingResult,
  HL7MappingProfile,
  HL7MappingProfileInput,
  HL7MappingProfileUpdate,
  IntegrationJobInput,
  IntegrationJobUpdate,
  IntegrationRun,
  IntegrationRunInput,
  IntegrationLog,
  InterfaceError,
  DataImportBatch,
  DataImportBatchInput,
  DataImportBatchUpdate,
  ImportRecord,
  DataExportBatch,
  DataExportBatchInput,
  DataExportBatchUpdate,
  ExportFile,
  EventSubscription,
  EventSubscriptionInput,
  EventSubscriptionUpdate,
  EventDelivery,
  EventDeliveryInput,
  EventDeliveryUpdate,
  APIClient,
  APIClientInput,
  APIClientUpdate,
  APICredential,
  UsageMetric,
  APICredentialInput,
  APICredentialUpdate,
  InterfaceErrorInput,
  InterfaceErrorUpdate,
  InterfaceHealthCheckInput,
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
    response: z.array(APIClient),
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
        schema: APIClientInput,
      },
    ],
    response: APIClient,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: APIClient,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: APIClientUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: APIClient,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(APICredential),
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
        schema: APICredentialInput,
      },
    ],
    response: APICredential,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: APICredential,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: APICredentialUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: APICredential,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(Connection),
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
        schema: ConnectionInput,
      },
    ],
    response: Connection,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: Connection,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: ConnectionUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Connection,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(DataExportBatch),
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
        schema: DataExportBatchInput,
      },
    ],
    response: DataExportBatch,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: DataExportBatch,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: DataExportBatchUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DataExportBatch,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(DataImportBatch),
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
        schema: DataImportBatchInput,
      },
    ],
    response: DataImportBatch,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: DataImportBatch,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: DataImportBatchUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DataImportBatch,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(EventDelivery),
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
        schema: EventDeliveryInput,
      },
    ],
    response: EventDelivery,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: EventDelivery,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: EventDeliveryUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: EventDelivery,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
    response: z.array(EventSubscription),
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
        schema: EventSubscriptionInput,
      },
    ],
    response: EventSubscription,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: EventSubscription,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: EventSubscriptionUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: EventSubscription,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(ExternalSystem),
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
        schema: ExternalSystemInput,
      },
    ],
    response: ExternalSystem,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: ExternalSystem,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: ExternalSystemUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ExternalSystem,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(FHIRBundle),
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
    response: FHIRBundle,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: FHIRBundle,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(FHIRMappingProfile),
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
        schema: FHIRMappingProfileInput,
      },
    ],
    response: FHIRMappingProfile,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: FHIRMappingProfile,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: FHIRMappingProfileUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: FHIRMappingProfile,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(HL7MappingProfile),
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
        schema: HL7MappingProfileInput,
      },
    ],
    response: HL7MappingProfile,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: HL7MappingProfile,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: HL7MappingProfileUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: HL7MappingProfile,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(HL7Message),
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
    response: HL7Message,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: HL7Message,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(IntegrationJob),
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
        schema: IntegrationJobInput,
      },
    ],
    response: IntegrationJob,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: IntegrationJob,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: IntegrationJobUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: IntegrationJob,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: Error,
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
    response: z.array(IntegrationRun),
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
        schema: IntegrationRunInput,
      },
    ],
    response: IntegrationRun,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: IntegrationRun,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
    response: z.array(InterfaceError),
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
        schema: InterfaceErrorInput,
      },
    ],
    response: InterfaceError,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: InterfaceError,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
        schema: InterfaceErrorUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: InterfaceError,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
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
    response: z.array(InterfaceHealthCheck),
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
        schema: InterfaceHealthCheckInput,
      },
    ],
    response: InterfaceHealthCheck,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
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
    response: InterfaceHealthCheck,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
]);

export const api = new Zodios("https://api.cuurai.com/api/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
