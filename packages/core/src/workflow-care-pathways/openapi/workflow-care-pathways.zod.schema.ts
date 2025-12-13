import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Timestamps = z
  .object({
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const WorkflowDefinition = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const WorkflowDefinitionInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
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
const WorkflowDefinitionUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const WorkflowState = z
  .object({
    id: z.string(),
    workflowDefinitionId: z.string(),
    name: z.string(),
    order: z.number().int(),
    isInitial: z.boolean(),
    isFinal: z.boolean(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const WorkflowTransition = z
  .object({
    id: z.string(),
    workflowDefinitionId: z.string(),
    fromStateId: z.string(),
    toStateId: z.string(),
    trigger: z.object({}).partial().passthrough(),
    conditions: z.object({}).partial().passthrough(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const WorkflowInstance = Timestamps.and(
  z
    .object({
      id: z.string(),
      workflowDefinitionId: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      episodeOfCareId: z.string().optional(),
      currentState: z.string().optional(),
      status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
      startedAt: z.string().datetime({ offset: true }).optional(),
      completedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const WorkflowInstanceInput = z
  .object({
    workflowDefinitionId: z.string(),
    patientId: z.string(),
    encounterId: z.string().optional(),
    episodeOfCareId: z.string().optional(),
    status: z
      .enum(["active", "paused", "completed", "cancelled"])
      .optional()
      .default("active"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const WorkflowInstanceUpdate = z
  .object({
    currentState: z.string(),
    status: z.enum(["active", "paused", "completed", "cancelled"]),
    completedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const Task = Timestamps.and(
  z
    .object({
      id: z.string(),
      carePlanId: z.string().optional(),
      workflowInstanceId: z.string().optional(),
      patientId: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      taskType: z.enum([
        "medication",
        "procedure",
        "lab-order",
        "appointment",
        "education",
        "other",
      ]),
      status: z
        .enum([
          "draft",
          "ready",
          "in-progress",
          "on-hold",
          "completed",
          "cancelled",
        ])
        .optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
      dueDate: z.string().datetime({ offset: true }).optional(),
      assignedTo: z.string().optional(),
      completedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const WorkflowEvent = z
  .object({
    id: z.string(),
    workflowInstanceId: z.string(),
    eventType: z.string(),
    eventData: z.object({}).partial().passthrough(),
    occurredAt: z.string().datetime({ offset: true }),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const AuditEvent = z
  .object({
    id: z.string(),
    entityType: z.string(),
    entityId: z.string(),
    eventType: z.string(),
    userId: z.string(),
    timestamp: z.string().datetime({ offset: true }),
    details: z.object({}).partial().passthrough(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const CarePathwayTemplate = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const CarePathwayTemplateInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const CarePathwayTemplateUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const PathwayStep = z
  .object({
    id: z.string(),
    carePathwayTemplateId: z.string(),
    stepNumber: z.number().int(),
    title: z.string(),
    description: z.string(),
    order: z.number().int(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const OrderSetTemplate = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const CarePlan = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      episodeOfCareId: z.string().optional(),
      carePathwayTemplateId: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z
        .enum(["draft", "active", "suspended", "completed", "cancelled"])
        .optional(),
      startDate: z.string().datetime({ offset: true }).optional(),
      endDate: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const CarePlanInput = z
  .object({
    patientId: z.string(),
    episodeOfCareId: z.string().optional(),
    carePathwayTemplateId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z
      .enum(["draft", "active", "suspended", "completed", "cancelled"])
      .optional()
      .default("draft"),
    startDate: z.string().datetime({ offset: true }).optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const CarePlanUpdate = z
  .object({
    title: z.string(),
    description: z.string(),
    status: z.enum(["draft", "active", "suspended", "completed", "cancelled"]),
    endDate: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const CarePlanGoal = z
  .object({
    id: z.string(),
    carePlanId: z.string(),
    description: z.string(),
    targetDate: z.string().datetime({ offset: true }),
    status: z.enum(["planned", "in-progress", "achieved", "cancelled"]),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ChecklistInstance = Timestamps.and(
  z
    .object({
      id: z.string(),
      checklistTemplateId: z.string(),
      patientId: z.string(),
      carePlanId: z.string().optional(),
      status: z.enum(["in-progress", "completed", "cancelled"]).optional(),
      startedAt: z.string().datetime({ offset: true }).optional(),
      completedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const EpisodeOfCare = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      status: z.enum(["active", "completed", "cancelled"]).optional(),
      startDate: z.string().datetime({ offset: true }).optional(),
      endDate: z.string().datetime({ offset: true }).optional(),
      condition: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const EpisodeOfCareInput = z
  .object({
    patientId: z.string(),
    status: z
      .enum(["active", "completed", "cancelled"])
      .optional()
      .default("active"),
    startDate: z.string().datetime({ offset: true }).optional(),
    condition: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const EpisodeOfCareUpdate = z
  .object({
    status: z.enum(["active", "completed", "cancelled"]),
    endDate: z.string().datetime({ offset: true }),
    condition: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const Encounter = z
  .object({
    id: z.string(),
    patientId: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const TaskInput = z
  .object({
    carePlanId: z.string().optional(),
    workflowInstanceId: z.string().optional(),
    patientId: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    taskType: z.enum([
      "medication",
      "procedure",
      "lab-order",
      "appointment",
      "education",
      "other",
    ]),
    status: z
      .enum([
        "draft",
        "ready",
        "in-progress",
        "on-hold",
        "completed",
        "cancelled",
      ])
      .optional()
      .default("draft"),
    priority: z
      .enum(["low", "normal", "high", "urgent"])
      .optional()
      .default("normal"),
    dueDate: z.string().datetime({ offset: true }).optional(),
    assignedTo: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const TaskUpdate = z
  .object({
    title: z.string(),
    description: z.string(),
    status: z.enum([
      "draft",
      "ready",
      "in-progress",
      "on-hold",
      "completed",
      "cancelled",
    ]),
    priority: z.enum(["low", "normal", "high", "urgent"]),
    dueDate: z.string().datetime({ offset: true }),
    assignedTo: z.string(),
    completedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const TaskComment = z
  .object({
    id: z.string(),
    taskId: z.string(),
    comment: z.string(),
    author: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const TaskAssignment = Timestamps.and(
  z
    .object({
      id: z.string(),
      taskId: z.string(),
      assignedTo: z.string().optional(),
      assignedToType: z.enum(["user", "role", "team"]).optional(),
      assignedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const TaskAssignmentInput = z
  .object({
    taskId: z.string(),
    assignedTo: z.string(),
    assignedToType: z.enum(["user", "role", "team"]),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const TaskAssignmentUpdate = z
  .object({
    assignedTo: z.string(),
    assignedToType: z.enum(["user", "role", "team"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const Alert = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      alertType: z.enum([
        "drug-interaction",
        "allergy",
        "critical-value",
        "clinical-rule",
        "other",
      ]),
      severity: z.enum(["low", "medium", "high", "critical"]),
      title: z.string().optional(),
      message: z.string().optional(),
      status: z
        .enum([
          "active",
          "acknowledged",
          "overridden",
          "snoozed",
          "resolved",
          "dismissed",
        ])
        .optional(),
      acknowledgedBy: z.string().optional(),
      acknowledgedAt: z.string().datetime({ offset: true }).optional(),
      resolvedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const AlertInput = z
  .object({
    patientId: z.string(),
    alertType: z.enum([
      "drug-interaction",
      "allergy",
      "critical-value",
      "clinical-rule",
      "other",
    ]),
    severity: z.enum(["low", "medium", "high", "critical"]),
    title: z.string(),
    message: z.string(),
    status: z
      .enum([
        "active",
        "acknowledged",
        "overridden",
        "snoozed",
        "resolved",
        "dismissed",
      ])
      .optional()
      .default("active"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const AlertUpdate = z
  .object({
    status: z.enum([
      "active",
      "acknowledged",
      "overridden",
      "snoozed",
      "resolved",
      "dismissed",
    ]),
    acknowledgedBy: z.string(),
    acknowledgedAt: z.string().datetime({ offset: true }),
    resolvedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const Explanation = z
  .object({
    id: z.string(),
    explanationType: z.string(),
    content: z.object({}).partial().passthrough(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const Handoff = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      fromTeam: z.string(),
      toTeam: z.string(),
      handoffType: z.string().optional(),
      handoffDate: z.string().datetime({ offset: true }).optional(),
      notes: z.string().optional(),
      status: z.enum(["pending", "completed", "cancelled"]).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const HandoffInput = z
  .object({
    patientId: z.string(),
    fromTeam: z.string(),
    toTeam: z.string(),
    handoffType: z.string().optional(),
    handoffDate: z.string().datetime({ offset: true }).optional(),
    notes: z.string().optional(),
    status: z
      .enum(["pending", "completed", "cancelled"])
      .optional()
      .default("pending"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const HandoffUpdate = z
  .object({
    handoffType: z.string(),
    handoffDate: z.string().datetime({ offset: true }),
    notes: z.string(),
    status: z.enum(["pending", "completed", "cancelled"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const ChecklistTemplate = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ChecklistTemplateInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const ChecklistTemplateUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const ChecklistItem = z
  .object({
    id: z.string(),
    checklistTemplateId: z.string(),
    itemText: z.string(),
    order: z.number().int(),
    required: z.boolean(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ChecklistInstanceInput = z
  .object({
    checklistTemplateId: z.string(),
    patientId: z.string(),
    carePlanId: z.string().optional(),
    status: z
      .enum(["in-progress", "completed", "cancelled"])
      .optional()
      .default("in-progress"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const ChecklistInstanceUpdate = z
  .object({
    status: z.enum(["in-progress", "completed", "cancelled"]),
    completedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const ChecklistItemInstance = z
  .object({
    id: z.string(),
    checklistInstanceId: z.string(),
    checklistItemId: z.string(),
    checked: z.boolean(),
    checkedAt: z.string().datetime({ offset: true }),
    checkedBy: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const EscalationPolicy = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      enabled: z.boolean().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const EscalationPolicyInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    enabled: z.boolean().optional().default(true),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const EscalationPolicyUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    enabled: z.boolean(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const EscalationRule = z
  .object({
    id: z.string(),
    escalationPolicyId: z.string(),
    ruleType: z.enum(["time-based", "severity-based", "other"]),
    conditions: z.object({}).partial().passthrough(),
    actions: z.object({}).partial().passthrough(),
    order: z.number().int(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const RoutingRule = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      conditions: z.object({}).partial().passthrough().optional(),
      targetQueue: z.string().optional(),
      targetTeam: z.string().optional(),
      targetRole: z.string().optional(),
      priority: z.number().int().optional(),
      enabled: z.boolean().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const RoutingRuleInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    conditions: z.object({}).partial().passthrough().optional(),
    targetQueue: z.string().optional(),
    targetTeam: z.string().optional(),
    targetRole: z.string().optional(),
    priority: z.number().int().optional(),
    enabled: z.boolean().optional().default(true),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const RoutingRuleUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    conditions: z.object({}).partial().passthrough(),
    targetQueue: z.string(),
    targetTeam: z.string(),
    targetRole: z.string(),
    priority: z.number().int(),
    enabled: z.boolean(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const ScheduleTemplate = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      schedulePattern: z.object({}).partial().passthrough().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ScheduleTemplateInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    schedulePattern: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const ScheduleTemplateUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    schedulePattern: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const WorkQueue = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      teamId: z.string().optional(),
      role: z.string().optional(),
      queueType: z.enum(["task", "alert", "mixed"]).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const WorkQueueInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    teamId: z.string().optional(),
    role: z.string().optional(),
    queueType: z.enum(["task", "alert", "mixed"]).optional().default("mixed"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const WorkQueueUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    teamId: z.string(),
    role: z.string(),
    queueType: z.enum(["task", "alert", "mixed"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();

export const schemas = {
  Timestamps,
  WorkflowDefinition,
  WorkflowDefinitionInput,
  Error,
  WorkflowDefinitionUpdate,
  WorkflowState,
  WorkflowTransition,
  WorkflowInstance,
  WorkflowInstanceInput,
  WorkflowInstanceUpdate,
  Task,
  WorkflowEvent,
  AuditEvent,
  CarePathwayTemplate,
  CarePathwayTemplateInput,
  CarePathwayTemplateUpdate,
  PathwayStep,
  OrderSetTemplate,
  CarePlan,
  CarePlanInput,
  CarePlanUpdate,
  CarePlanGoal,
  ChecklistInstance,
  EpisodeOfCare,
  EpisodeOfCareInput,
  EpisodeOfCareUpdate,
  Encounter,
  TaskInput,
  TaskUpdate,
  TaskComment,
  TaskAssignment,
  TaskAssignmentInput,
  TaskAssignmentUpdate,
  Alert,
  AlertInput,
  AlertUpdate,
  Explanation,
  Handoff,
  HandoffInput,
  HandoffUpdate,
  ChecklistTemplate,
  ChecklistTemplateInput,
  ChecklistTemplateUpdate,
  ChecklistItem,
  ChecklistInstanceInput,
  ChecklistInstanceUpdate,
  ChecklistItemInstance,
  EscalationPolicy,
  EscalationPolicyInput,
  EscalationPolicyUpdate,
  EscalationRule,
  RoutingRule,
  RoutingRuleInput,
  RoutingRuleUpdate,
  ScheduleTemplate,
  ScheduleTemplateInput,
  ScheduleTemplateUpdate,
  WorkQueue,
  WorkQueueInput,
  WorkQueueUpdate,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/alerts",
    alias: "listAlerts",
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
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "severity",
        type: "Query",
        schema: z.enum(["low", "medium", "high", "critical"]).optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "active",
            "acknowledged",
            "overridden",
            "snoozed",
            "resolved",
            "dismissed",
          ])
          .optional(),
      },
    ],
    response: z.array(Alert),
  },
  {
    method: "post",
    path: "/alerts",
    alias: "createAlert",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AlertInput,
      },
    ],
    response: Alert,
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
    path: "/alerts/:id",
    alias: "getAlert",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Alert,
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
    path: "/alerts/:id",
    alias: "updateAlert",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AlertUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Alert,
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
    path: "/alerts/:id",
    alias: "deleteAlert",
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
    path: "/alerts/:id/audit-events",
    alias: "listAlertAuditEvents",
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
    response: z.array(AuditEvent),
  },
  {
    method: "get",
    path: "/alerts/:id/explanations",
    alias: "listAlertExplanations",
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
    response: z.array(Explanation),
  },
  {
    method: "get",
    path: "/care-pathway-templates",
    alias: "listCarePathwayTemplates",
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
        name: "category",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(CarePathwayTemplate),
  },
  {
    method: "post",
    path: "/care-pathway-templates",
    alias: "createCarePathwayTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CarePathwayTemplateInput,
      },
    ],
    response: CarePathwayTemplate,
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
    path: "/care-pathway-templates/:id",
    alias: "getCarePathwayTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: CarePathwayTemplate,
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
    path: "/care-pathway-templates/:id",
    alias: "updateCarePathwayTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CarePathwayTemplateUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: CarePathwayTemplate,
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
    path: "/care-pathway-templates/:id",
    alias: "deleteCarePathwayTemplate",
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
    path: "/care-pathway-templates/:id/order-set-templates",
    alias: "listCarePathwayTemplateOrderSetTemplates",
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
    response: z.array(OrderSetTemplate),
  },
  {
    method: "get",
    path: "/care-pathway-templates/:id/steps",
    alias: "listCarePathwayTemplateSteps",
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
    response: z.array(PathwayStep),
  },
  {
    method: "get",
    path: "/care-plans",
    alias: "listCarePlans",
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
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum(["draft", "active", "suspended", "completed", "cancelled"])
          .optional(),
      },
    ],
    response: z.array(CarePlan),
  },
  {
    method: "post",
    path: "/care-plans",
    alias: "createCarePlan",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CarePlanInput,
      },
    ],
    response: CarePlan,
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
    path: "/care-plans/:id",
    alias: "getCarePlan",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: CarePlan,
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
    path: "/care-plans/:id",
    alias: "updateCarePlan",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CarePlanUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: CarePlan,
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
    path: "/care-plans/:id",
    alias: "deleteCarePlan",
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
    path: "/care-plans/:id/checklists",
    alias: "listCarePlanChecklists",
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
    response: z.array(ChecklistInstance),
  },
  {
    method: "get",
    path: "/care-plans/:id/goals",
    alias: "listCarePlanGoals",
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
    response: z.array(CarePlanGoal),
  },
  {
    method: "get",
    path: "/care-plans/:id/tasks",
    alias: "listCarePlanTasks",
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
    response: z.array(Task),
  },
  {
    method: "get",
    path: "/checklist-instances",
    alias: "listChecklistInstances",
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
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "checklistTemplateId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["in-progress", "completed", "cancelled"]).optional(),
      },
    ],
    response: z.array(ChecklistInstance),
  },
  {
    method: "post",
    path: "/checklist-instances",
    alias: "createChecklistInstance",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ChecklistInstanceInput,
      },
    ],
    response: ChecklistInstance,
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
    path: "/checklist-instances/:id",
    alias: "getChecklistInstance",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ChecklistInstance,
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
    path: "/checklist-instances/:id",
    alias: "updateChecklistInstance",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ChecklistInstanceUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ChecklistInstance,
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
    path: "/checklist-instances/:id",
    alias: "deleteChecklistInstance",
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
    path: "/checklist-instances/:id/items",
    alias: "listChecklistInstanceItems",
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
    response: z.array(ChecklistItemInstance),
  },
  {
    method: "get",
    path: "/checklist-templates",
    alias: "listChecklistTemplates",
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
        name: "category",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(ChecklistTemplate),
  },
  {
    method: "post",
    path: "/checklist-templates",
    alias: "createChecklistTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ChecklistTemplateInput,
      },
    ],
    response: ChecklistTemplate,
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
    path: "/checklist-templates/:id",
    alias: "getChecklistTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ChecklistTemplate,
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
    path: "/checklist-templates/:id",
    alias: "updateChecklistTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ChecklistTemplateUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ChecklistTemplate,
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
    path: "/checklist-templates/:id",
    alias: "deleteChecklistTemplate",
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
    path: "/checklist-templates/:id/items",
    alias: "listChecklistTemplateItems",
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
    response: z.array(ChecklistItem),
  },
  {
    method: "get",
    path: "/episodes-of-care",
    alias: "listEpisodesOfCare",
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
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["active", "completed", "cancelled"]).optional(),
      },
    ],
    response: z.array(EpisodeOfCare),
  },
  {
    method: "post",
    path: "/episodes-of-care",
    alias: "createEpisodeOfCare",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EpisodeOfCareInput,
      },
    ],
    response: EpisodeOfCare,
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
    path: "/episodes-of-care/:id",
    alias: "getEpisodeOfCare",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: EpisodeOfCare,
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
    path: "/episodes-of-care/:id",
    alias: "updateEpisodeOfCare",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EpisodeOfCareUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: EpisodeOfCare,
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
    path: "/episodes-of-care/:id",
    alias: "deleteEpisodeOfCare",
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
    path: "/episodes-of-care/:id/care-plans",
    alias: "listEpisodeOfCareCarePlans",
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
    response: z.array(CarePlan),
  },
  {
    method: "get",
    path: "/episodes-of-care/:id/encounters",
    alias: "listEpisodeOfCareEncounters",
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
    response: z.array(Encounter),
  },
  {
    method: "get",
    path: "/episodes-of-care/:id/workflow-instances",
    alias: "listEpisodeOfCareWorkflowInstances",
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
    response: z.array(WorkflowInstance),
  },
  {
    method: "get",
    path: "/escalation-policies",
    alias: "listEscalationPolicies",
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
        name: "category",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(EscalationPolicy),
  },
  {
    method: "post",
    path: "/escalation-policies",
    alias: "createEscalationPolicy",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EscalationPolicyInput,
      },
    ],
    response: EscalationPolicy,
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
    path: "/escalation-policies/:id",
    alias: "getEscalationPolicy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: EscalationPolicy,
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
    path: "/escalation-policies/:id",
    alias: "updateEscalationPolicy",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EscalationPolicyUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: EscalationPolicy,
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
    path: "/escalation-policies/:id",
    alias: "deleteEscalationPolicy",
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
    path: "/escalation-policies/:id/rules",
    alias: "listEscalationPolicyRules",
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
    response: z.array(EscalationRule),
  },
  {
    method: "get",
    path: "/handoffs",
    alias: "listHandoffs",
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
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "fromTeam",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "toTeam",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(Handoff),
  },
  {
    method: "post",
    path: "/handoffs",
    alias: "createHandoff",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: HandoffInput,
      },
    ],
    response: Handoff,
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
    path: "/handoffs/:id",
    alias: "getHandoff",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Handoff,
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
    path: "/handoffs/:id",
    alias: "updateHandoff",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: HandoffUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Handoff,
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
    path: "/handoffs/:id",
    alias: "deleteHandoff",
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
    path: "/handoffs/:id/tasks",
    alias: "listHandoffTasks",
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
    response: z.array(Task),
  },
  {
    method: "get",
    path: "/routing-rules",
    alias: "listRoutingRules",
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
        name: "enabled",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: z.array(RoutingRule),
  },
  {
    method: "post",
    path: "/routing-rules",
    alias: "createRoutingRule",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RoutingRuleInput,
      },
    ],
    response: RoutingRule,
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
    path: "/routing-rules/:id",
    alias: "getRoutingRule",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: RoutingRule,
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
    path: "/routing-rules/:id",
    alias: "updateRoutingRule",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RoutingRuleUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: RoutingRule,
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
    path: "/routing-rules/:id",
    alias: "deleteRoutingRule",
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
    path: "/schedule-templates",
    alias: "listScheduleTemplates",
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
        name: "category",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(ScheduleTemplate),
  },
  {
    method: "post",
    path: "/schedule-templates",
    alias: "createScheduleTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ScheduleTemplateInput,
      },
    ],
    response: ScheduleTemplate,
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
    path: "/schedule-templates/:id",
    alias: "getScheduleTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ScheduleTemplate,
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
    path: "/schedule-templates/:id",
    alias: "updateScheduleTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ScheduleTemplateUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ScheduleTemplate,
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
    path: "/schedule-templates/:id",
    alias: "deleteScheduleTemplate",
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
    path: "/task-assignments",
    alias: "listTaskAssignments",
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
        name: "taskId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "assignedTo",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(TaskAssignment),
  },
  {
    method: "post",
    path: "/task-assignments",
    alias: "createTaskAssignment",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TaskAssignmentInput,
      },
    ],
    response: TaskAssignment,
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
    path: "/task-assignments/:id",
    alias: "getTaskAssignment",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: TaskAssignment,
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
    path: "/task-assignments/:id",
    alias: "updateTaskAssignment",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TaskAssignmentUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: TaskAssignment,
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
    path: "/task-assignments/:id",
    alias: "deleteTaskAssignment",
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
    path: "/tasks",
    alias: "listTasks",
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
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "draft",
            "ready",
            "in-progress",
            "on-hold",
            "completed",
            "cancelled",
          ])
          .optional(),
      },
      {
        name: "assignedTo",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(Task),
  },
  {
    method: "post",
    path: "/tasks",
    alias: "createTask",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TaskInput,
      },
    ],
    response: Task,
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
    path: "/tasks/:id",
    alias: "getTask",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Task,
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
    path: "/tasks/:id",
    alias: "updateTask",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TaskUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Task,
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
    path: "/tasks/:id",
    alias: "deleteTask",
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
    path: "/tasks/:id/audit-events",
    alias: "listTaskAuditEvents",
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
    response: z.array(AuditEvent),
  },
  {
    method: "get",
    path: "/tasks/:id/comments",
    alias: "listTaskComments",
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
    response: z.array(TaskComment),
  },
  {
    method: "get",
    path: "/work-queues",
    alias: "listWorkQueues",
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
        name: "teamId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "role",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(WorkQueue),
  },
  {
    method: "post",
    path: "/work-queues",
    alias: "createWorkQueue",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkQueueInput,
      },
    ],
    response: WorkQueue,
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
    path: "/work-queues/:id",
    alias: "getWorkQueue",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorkQueue,
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
    path: "/work-queues/:id",
    alias: "updateWorkQueue",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkQueueUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorkQueue,
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
    path: "/work-queues/:id",
    alias: "deleteWorkQueue",
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
    path: "/work-queues/:id/alerts",
    alias: "listWorkQueueAlerts",
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
    response: z.array(Alert),
  },
  {
    method: "get",
    path: "/work-queues/:id/tasks",
    alias: "listWorkQueueTasks",
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
    response: z.array(Task),
  },
  {
    method: "get",
    path: "/workflow-definitions",
    alias: "listWorkflowDefinitions",
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
        name: "category",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(WorkflowDefinition),
  },
  {
    method: "post",
    path: "/workflow-definitions",
    alias: "createWorkflowDefinition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkflowDefinitionInput,
      },
    ],
    response: WorkflowDefinition,
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
    path: "/workflow-definitions/:id",
    alias: "getWorkflowDefinition",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorkflowDefinition,
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
    path: "/workflow-definitions/:id",
    alias: "updateWorkflowDefinition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkflowDefinitionUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorkflowDefinition,
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
    path: "/workflow-definitions/:id",
    alias: "deleteWorkflowDefinition",
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
    path: "/workflow-definitions/:id/states",
    alias: "listWorkflowDefinitionStates",
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
    response: z.array(WorkflowState),
  },
  {
    method: "get",
    path: "/workflow-definitions/:id/transitions",
    alias: "listWorkflowDefinitionTransitions",
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
    response: z.array(WorkflowTransition),
  },
  {
    method: "get",
    path: "/workflow-instances",
    alias: "listWorkflowInstances",
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
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "workflowDefinitionId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum(["active", "paused", "completed", "cancelled"])
          .optional(),
      },
    ],
    response: z.array(WorkflowInstance),
  },
  {
    method: "post",
    path: "/workflow-instances",
    alias: "createWorkflowInstance",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkflowInstanceInput,
      },
    ],
    response: WorkflowInstance,
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
    path: "/workflow-instances/:id",
    alias: "getWorkflowInstance",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorkflowInstance,
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
    path: "/workflow-instances/:id",
    alias: "updateWorkflowInstance",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkflowInstanceUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorkflowInstance,
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
    path: "/workflow-instances/:id",
    alias: "deleteWorkflowInstance",
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
    path: "/workflow-instances/:id/audit-events",
    alias: "listWorkflowInstanceAuditEvents",
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
    response: z.array(AuditEvent),
  },
  {
    method: "get",
    path: "/workflow-instances/:id/events",
    alias: "listWorkflowInstanceEvents",
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
    response: z.array(WorkflowEvent),
  },
  {
    method: "get",
    path: "/workflow-instances/:id/tasks",
    alias: "listWorkflowInstanceTasks",
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
    response: z.array(Task),
  },
]);

export const api = new Zodios("https://api.cuurai.com/api/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
