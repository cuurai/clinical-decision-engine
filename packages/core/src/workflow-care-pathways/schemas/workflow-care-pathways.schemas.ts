import { z, type ZodTypeAny } from "zod";

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
    status: z.enum(["active", "paused", "completed", "cancelled"]).optional().default("active"),
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
    status: z.enum(["active", "completed", "cancelled"]).optional().default("active"),
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
    status: z.enum(["in-progress", "completed", "cancelled"]).optional().default("in-progress"),
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

export const schemas: Record<string, ZodTypeAny> = {
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



