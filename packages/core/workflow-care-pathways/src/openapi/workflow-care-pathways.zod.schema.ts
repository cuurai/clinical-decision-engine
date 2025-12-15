import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const WorApiMeta = z
  .object({
    correlationId: z.string(),
    timestamp: z.string().datetime({ offset: true }),
    totalCount: z.number().int(),
    pageSize: z.number().int(),
    pageNumber: z.number().int(),
  })
  .partial()
  .passthrough();
const WorApiListResponse = z
  .object({ data: z.array(z.any()), meta: WorApiMeta })
  .partial()
  .passthrough();
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
const WorApiResponse = z
  .object({ data: z.object({}).partial().passthrough(), meta: WorApiMeta })
  .partial()
  .passthrough();
const WorkflowDefinitionInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createWorkflowDefinition_Body = WorApiResponse.and(
  z.object({ data: WorkflowDefinitionInput }).partial().passthrough()
);
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
const updateWorkflowDefinition_Body = WorApiResponse.and(
  z.object({ data: WorkflowDefinitionUpdate }).partial().passthrough()
);
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
    status: z.enum(["active", "paused", "completed", "cancelled"]).optional().default("active"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createWorkflowInstance_Body = WorApiResponse.and(
  z.object({ data: WorkflowInstanceInput }).partial().passthrough()
);
const WorkflowInstanceUpdate = z
  .object({
    currentState: z.string(),
    status: z.enum(["active", "paused", "completed", "cancelled"]),
    completedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateWorkflowInstance_Body = WorApiResponse.and(
  z.object({ data: WorkflowInstanceUpdate }).partial().passthrough()
);
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
        .enum(["draft", "ready", "in-progress", "on-hold", "completed", "cancelled"])
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
const createCarePathwayTemplate_Body = WorApiResponse.and(
  z.object({ data: CarePathwayTemplateInput }).partial().passthrough()
);
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
const updateCarePathwayTemplate_Body = WorApiResponse.and(
  z.object({ data: CarePathwayTemplateUpdate }).partial().passthrough()
);
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
      status: z.enum(["draft", "active", "suspended", "completed", "cancelled"]).optional(),
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
const createCarePlan_Body = WorApiResponse.and(
  z.object({ data: CarePlanInput }).partial().passthrough()
);
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
const updateCarePlan_Body = WorApiResponse.and(
  z.object({ data: CarePlanUpdate }).partial().passthrough()
);
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
    status: z.enum(["active", "completed", "cancelled"]).optional().default("active"),
    startDate: z.string().datetime({ offset: true }).optional(),
    condition: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createEpisodeOfCare_Body = WorApiResponse.and(
  z.object({ data: EpisodeOfCareInput }).partial().passthrough()
);
const EpisodeOfCareUpdate = z
  .object({
    status: z.enum(["active", "completed", "cancelled"]),
    endDate: z.string().datetime({ offset: true }),
    condition: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateEpisodeOfCare_Body = WorApiResponse.and(
  z.object({ data: EpisodeOfCareUpdate }).partial().passthrough()
);
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
    taskType: z.enum(["medication", "procedure", "lab-order", "appointment", "education", "other"]),
    status: z
      .enum(["draft", "ready", "in-progress", "on-hold", "completed", "cancelled"])
      .optional()
      .default("draft"),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal"),
    dueDate: z.string().datetime({ offset: true }).optional(),
    assignedTo: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createTask_Body = WorApiResponse.and(z.object({ data: TaskInput }).partial().passthrough());
const TaskUpdate = z
  .object({
    title: z.string(),
    description: z.string(),
    status: z.enum(["draft", "ready", "in-progress", "on-hold", "completed", "cancelled"]),
    priority: z.enum(["low", "normal", "high", "urgent"]),
    dueDate: z.string().datetime({ offset: true }),
    assignedTo: z.string(),
    completedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateTask_Body = WorApiResponse.and(z.object({ data: TaskUpdate }).partial().passthrough());
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
const createTaskAssignment_Body = WorApiResponse.and(
  z.object({ data: TaskAssignmentInput }).partial().passthrough()
);
const TaskAssignmentUpdate = z
  .object({
    assignedTo: z.string(),
    assignedToType: z.enum(["user", "role", "team"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateTaskAssignment_Body = WorApiResponse.and(
  z.object({ data: TaskAssignmentUpdate }).partial().passthrough()
);
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
        .enum(["active", "acknowledged", "overridden", "snoozed", "resolved", "dismissed"])
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
    alertType: z.enum(["drug-interaction", "allergy", "critical-value", "clinical-rule", "other"]),
    severity: z.enum(["low", "medium", "high", "critical"]),
    title: z.string(),
    message: z.string(),
    status: z
      .enum(["active", "acknowledged", "overridden", "snoozed", "resolved", "dismissed"])
      .optional()
      .default("active"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createAlert_Body = WorApiResponse.and(z.object({ data: AlertInput }).partial().passthrough());
const AlertUpdate = z
  .object({
    status: z.enum(["active", "acknowledged", "overridden", "snoozed", "resolved", "dismissed"]),
    acknowledgedBy: z.string(),
    acknowledgedAt: z.string().datetime({ offset: true }),
    resolvedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateAlert_Body = WorApiResponse.and(
  z.object({ data: AlertUpdate }).partial().passthrough()
);
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
    status: z.enum(["pending", "completed", "cancelled"]).optional().default("pending"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createHandoff_Body = WorApiResponse.and(
  z.object({ data: HandoffInput }).partial().passthrough()
);
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
const updateHandoff_Body = WorApiResponse.and(
  z.object({ data: HandoffUpdate }).partial().passthrough()
);
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
const createChecklistTemplate_Body = WorApiResponse.and(
  z.object({ data: ChecklistTemplateInput }).partial().passthrough()
);
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
const updateChecklistTemplate_Body = WorApiResponse.and(
  z.object({ data: ChecklistTemplateUpdate }).partial().passthrough()
);
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
    status: z.enum(["in-progress", "completed", "cancelled"]).optional().default("in-progress"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createChecklistInstance_Body = WorApiResponse.and(
  z.object({ data: ChecklistInstanceInput }).partial().passthrough()
);
const ChecklistInstanceUpdate = z
  .object({
    status: z.enum(["in-progress", "completed", "cancelled"]),
    completedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateChecklistInstance_Body = WorApiResponse.and(
  z.object({ data: ChecklistInstanceUpdate }).partial().passthrough()
);
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
const createEscalationPolicy_Body = WorApiResponse.and(
  z.object({ data: EscalationPolicyInput }).partial().passthrough()
);
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
const updateEscalationPolicy_Body = WorApiResponse.and(
  z.object({ data: EscalationPolicyUpdate }).partial().passthrough()
);
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
const createRoutingRule_Body = WorApiResponse.and(
  z.object({ data: RoutingRuleInput }).partial().passthrough()
);
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
const updateRoutingRule_Body = WorApiResponse.and(
  z.object({ data: RoutingRuleUpdate }).partial().passthrough()
);
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
const createScheduleTemplate_Body = WorApiResponse.and(
  z.object({ data: ScheduleTemplateInput }).partial().passthrough()
);
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
const updateScheduleTemplate_Body = WorApiResponse.and(
  z.object({ data: ScheduleTemplateUpdate }).partial().passthrough()
);
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
const createWorkQueue_Body = WorApiResponse.and(
  z.object({ data: WorkQueueInput }).partial().passthrough()
);
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
const updateWorkQueue_Body = WorApiResponse.and(
  z.object({ data: WorkQueueUpdate }).partial().passthrough()
);

export const schemas = {
  WorApiMeta,
  WorApiListResponse,
  Timestamps,
  WorkflowDefinition,
  WorApiResponse,
  WorkflowDefinitionInput,
  createWorkflowDefinition_Body,
  Error,
  WorkflowDefinitionUpdate,
  updateWorkflowDefinition_Body,
  WorkflowState,
  WorkflowTransition,
  WorkflowInstance,
  WorkflowInstanceInput,
  createWorkflowInstance_Body,
  WorkflowInstanceUpdate,
  updateWorkflowInstance_Body,
  Task,
  WorkflowEvent,
  AuditEvent,
  CarePathwayTemplate,
  CarePathwayTemplateInput,
  createCarePathwayTemplate_Body,
  CarePathwayTemplateUpdate,
  updateCarePathwayTemplate_Body,
  PathwayStep,
  OrderSetTemplate,
  CarePlan,
  CarePlanInput,
  createCarePlan_Body,
  CarePlanUpdate,
  updateCarePlan_Body,
  CarePlanGoal,
  ChecklistInstance,
  EpisodeOfCare,
  EpisodeOfCareInput,
  createEpisodeOfCare_Body,
  EpisodeOfCareUpdate,
  updateEpisodeOfCare_Body,
  Encounter,
  TaskInput,
  createTask_Body,
  TaskUpdate,
  updateTask_Body,
  TaskComment,
  TaskAssignment,
  TaskAssignmentInput,
  createTaskAssignment_Body,
  TaskAssignmentUpdate,
  updateTaskAssignment_Body,
  Alert,
  AlertInput,
  createAlert_Body,
  AlertUpdate,
  updateAlert_Body,
  Explanation,
  Handoff,
  HandoffInput,
  createHandoff_Body,
  HandoffUpdate,
  updateHandoff_Body,
  ChecklistTemplate,
  ChecklistTemplateInput,
  createChecklistTemplate_Body,
  ChecklistTemplateUpdate,
  updateChecklistTemplate_Body,
  ChecklistItem,
  ChecklistInstanceInput,
  createChecklistInstance_Body,
  ChecklistInstanceUpdate,
  updateChecklistInstance_Body,
  ChecklistItemInstance,
  EscalationPolicy,
  EscalationPolicyInput,
  createEscalationPolicy_Body,
  EscalationPolicyUpdate,
  updateEscalationPolicy_Body,
  EscalationRule,
  RoutingRule,
  RoutingRuleInput,
  createRoutingRule_Body,
  RoutingRuleUpdate,
  updateRoutingRule_Body,
  ScheduleTemplate,
  ScheduleTemplateInput,
  createScheduleTemplate_Body,
  ScheduleTemplateUpdate,
  updateScheduleTemplate_Body,
  WorkQueue,
  WorkQueueInput,
  createWorkQueue_Body,
  WorkQueueUpdate,
  updateWorkQueue_Body,
};

const endpoints: any = makeApi([
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
          .enum(["active", "acknowledged", "overridden", "snoozed", "resolved", "dismissed"])
          .optional(),
      },
    ],
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(Alert) })
        .partial()
        .passthrough()
    ),
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
        schema: createAlert_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: Alert }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: Alert }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateAlert_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: Alert }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(CarePathwayTemplate) })
        .partial()
        .passthrough()
    ),
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
        schema: createCarePathwayTemplate_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: CarePathwayTemplate }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: CarePathwayTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateCarePathwayTemplate_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: CarePathwayTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: z.enum(["draft", "active", "suspended", "completed", "cancelled"]).optional(),
      },
    ],
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(CarePlan) })
        .partial()
        .passthrough()
    ),
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
        schema: createCarePlan_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: CarePlan }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: CarePlan }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateCarePlan_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: CarePlan }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(ChecklistInstance) })
        .partial()
        .passthrough()
    ),
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
        schema: createChecklistInstance_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: ChecklistInstance }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: ChecklistInstance }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateChecklistInstance_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: ChecklistInstance }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(ChecklistTemplate) })
        .partial()
        .passthrough()
    ),
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
        schema: createChecklistTemplate_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: ChecklistTemplate }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: ChecklistTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateChecklistTemplate_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: ChecklistTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(EpisodeOfCare) })
        .partial()
        .passthrough()
    ),
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
        schema: createEpisodeOfCare_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: EpisodeOfCare }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: EpisodeOfCare }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateEpisodeOfCare_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: EpisodeOfCare }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(EscalationPolicy) })
        .partial()
        .passthrough()
    ),
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
        schema: createEscalationPolicy_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: EscalationPolicy }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: EscalationPolicy }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateEscalationPolicy_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: EscalationPolicy }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(Handoff) })
        .partial()
        .passthrough()
    ),
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
        schema: createHandoff_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: Handoff }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: Handoff }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateHandoff_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: Handoff }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(RoutingRule) })
        .partial()
        .passthrough()
    ),
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
        schema: createRoutingRule_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: RoutingRule }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: RoutingRule }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateRoutingRule_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: RoutingRule }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(ScheduleTemplate) })
        .partial()
        .passthrough()
    ),
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
        schema: createScheduleTemplate_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: ScheduleTemplate }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: ScheduleTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateScheduleTemplate_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: ScheduleTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(TaskAssignment) })
        .partial()
        .passthrough()
    ),
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
        schema: createTaskAssignment_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: TaskAssignment }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: TaskAssignment }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateTaskAssignment_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: TaskAssignment }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
          .enum(["draft", "ready", "in-progress", "on-hold", "completed", "cancelled"])
          .optional(),
      },
      {
        name: "assignedTo",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(Task) })
        .partial()
        .passthrough()
    ),
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
        schema: createTask_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: Task }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: Task }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateTask_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: Task }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(WorkQueue) })
        .partial()
        .passthrough()
    ),
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
        schema: createWorkQueue_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: WorkQueue }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: WorkQueue }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateWorkQueue_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: WorkQueue }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(WorkflowDefinition) })
        .partial()
        .passthrough()
    ),
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
        schema: createWorkflowDefinition_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: WorkflowDefinition }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: WorkflowDefinition }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateWorkflowDefinition_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: WorkflowDefinition }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
      },
    ],
    response: WorApiListResponse.and(
      z
        .object({ data: z.array(WorkflowInstance) })
        .partial()
        .passthrough()
    ),
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
        schema: createWorkflowInstance_Body,
      },
    ],
    response: WorApiResponse.and(z.object({ data: WorkflowInstance }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: WorApiResponse.and(z.object({ data: WorkflowInstance }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateWorkflowInstance_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: WorApiResponse.and(z.object({ data: WorkflowInstance }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: WorApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
