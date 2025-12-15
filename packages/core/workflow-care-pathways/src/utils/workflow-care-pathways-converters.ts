/**
 * Workflow Care Pathways Domain Converters
 *
 * Thin wrappers around centralized converters (packages/core/src/shared/helpers/core-converters.ts)
 * Converts between domain types (with Date objects) and API types (with ISO strings)
 *
 * Naming convention: {entity}ToApi (camelCase)
 */

import { ConverterPresets } from "../../../_shared/src/helpers/core-converters.js";
import type {
  AlertInput,
  AlertUpdate,
  AuditEvent,
  CarePathwayTemplateInput,
  CarePathwayTemplateUpdate,
  CarePlanGoal,
  CarePlanInput,
  CarePlanUpdate,
  ChecklistInstanceInput,
  ChecklistInstanceUpdate,
  ChecklistItem,
  ChecklistItemInstance,
  ChecklistTemplateInput,
  ChecklistTemplateUpdate,
  Encounter,
  EpisodeOfCareInput,
  EpisodeOfCareUpdate,
  EscalationPolicyInput,
  EscalationPolicyUpdate,
  EscalationRule,
  Explanation,
  HandoffInput,
  HandoffUpdate,
  OrderSetTemplate,
  PathwayStep,
  RoutingRuleInput,
  RoutingRuleUpdate,
  ScheduleTemplateInput,
  ScheduleTemplateUpdate,
  TaskAssignmentInput,
  TaskAssignmentUpdate,
  TaskComment,
  TaskInput,
  TaskUpdate,
  Timestamps,
  WorkQueueInput,
  WorkQueueUpdate,
  WorkflowDefinitionInput,
  WorkflowDefinitionUpdate,
  WorkflowEvent,
  WorkflowInstanceInput,
  WorkflowInstanceUpdate,
  WorkflowState,
  WorkflowTransition,
} from "../types/index.js";

/**
 * Convert AlertInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function alertInputToApi(alertInput: AlertInput): AlertInput {
  return ConverterPresets.standardApiResponse(alertInput, { dateFields: [] }) as AlertInput;
}

/**
 * Convert AlertUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `acknowledgedAt`, `resolvedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function alertUpdateToApi(alertUpdate: AlertUpdate): AlertUpdate {
  return ConverterPresets.standardApiResponse(alertUpdate, { dateFields: ["acknowledgedAt", "resolvedAt"] }) as AlertUpdate;
}

/**
 * Convert AuditEvent domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `timestamp`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function auditEventToApi(auditEvent: AuditEvent): AuditEvent {
  return ConverterPresets.standardApiResponse(auditEvent, { dateFields: ["createdAt", "timestamp", "updatedAt"] }) as AuditEvent;
}

/**
 * Convert CarePathwayTemplateInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function carePathwayTemplateInputToApi(carePathwayTemplateInput: CarePathwayTemplateInput): CarePathwayTemplateInput {
  return ConverterPresets.standardApiResponse(carePathwayTemplateInput, { dateFields: [] }) as CarePathwayTemplateInput;
}

/**
 * Convert CarePathwayTemplateUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function carePathwayTemplateUpdateToApi(carePathwayTemplateUpdate: CarePathwayTemplateUpdate): CarePathwayTemplateUpdate {
  return ConverterPresets.standardApiResponse(carePathwayTemplateUpdate, { dateFields: [] }) as CarePathwayTemplateUpdate;
}

/**
 * Convert CarePlanGoal domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `targetDate`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function carePlanGoalToApi(carePlanGoal: CarePlanGoal): CarePlanGoal {
  return ConverterPresets.standardApiResponse(carePlanGoal, { dateFields: ["createdAt", "targetDate", "updatedAt"] }) as CarePlanGoal;
}

/**
 * Convert CarePlanInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `startDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function carePlanInputToApi(carePlanInput: CarePlanInput): CarePlanInput {
  return ConverterPresets.standardApiResponse(carePlanInput, { dateFields: ["startDate"] }) as CarePlanInput;
}

/**
 * Convert CarePlanUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `endDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function carePlanUpdateToApi(carePlanUpdate: CarePlanUpdate): CarePlanUpdate {
  return ConverterPresets.standardApiResponse(carePlanUpdate, { dateFields: ["endDate"] }) as CarePlanUpdate;
}

/**
 * Convert ChecklistInstanceInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function checklistInstanceInputToApi(checklistInstanceInput: ChecklistInstanceInput): ChecklistInstanceInput {
  return ConverterPresets.standardApiResponse(checklistInstanceInput, { dateFields: [] }) as ChecklistInstanceInput;
}

/**
 * Convert ChecklistInstanceUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `completedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function checklistInstanceUpdateToApi(checklistInstanceUpdate: ChecklistInstanceUpdate): ChecklistInstanceUpdate {
  return ConverterPresets.standardApiResponse(checklistInstanceUpdate, { dateFields: ["completedAt"] }) as ChecklistInstanceUpdate;
}

/**
 * Convert ChecklistItem domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function checklistItemToApi(checklistItem: ChecklistItem): ChecklistItem {
  return ConverterPresets.standardApiResponse(checklistItem, { dateFields: ["createdAt", "updatedAt"] }) as ChecklistItem;
}

/**
 * Convert ChecklistItemInstance domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `checkedAt`, `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function checklistItemInstanceToApi(checklistItemInstance: ChecklistItemInstance): ChecklistItemInstance {
  return ConverterPresets.standardApiResponse(checklistItemInstance, { dateFields: ["checkedAt", "createdAt", "updatedAt"] }) as ChecklistItemInstance;
}

/**
 * Convert ChecklistTemplateInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function checklistTemplateInputToApi(checklistTemplateInput: ChecklistTemplateInput): ChecklistTemplateInput {
  return ConverterPresets.standardApiResponse(checklistTemplateInput, { dateFields: [] }) as ChecklistTemplateInput;
}

/**
 * Convert ChecklistTemplateUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function checklistTemplateUpdateToApi(checklistTemplateUpdate: ChecklistTemplateUpdate): ChecklistTemplateUpdate {
  return ConverterPresets.standardApiResponse(checklistTemplateUpdate, { dateFields: [] }) as ChecklistTemplateUpdate;
}

/**
 * Convert Encounter domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function encounterToApi(encounter: Encounter): Encounter {
  return ConverterPresets.standardApiResponse(encounter, { dateFields: ["createdAt", "updatedAt"] }) as Encounter;
}

/**
 * Convert EpisodeOfCareInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `startDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function episodeOfCareInputToApi(episodeOfCareInput: EpisodeOfCareInput): EpisodeOfCareInput {
  return ConverterPresets.standardApiResponse(episodeOfCareInput, { dateFields: ["startDate"] }) as EpisodeOfCareInput;
}

/**
 * Convert EpisodeOfCareUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `endDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function episodeOfCareUpdateToApi(episodeOfCareUpdate: EpisodeOfCareUpdate): EpisodeOfCareUpdate {
  return ConverterPresets.standardApiResponse(episodeOfCareUpdate, { dateFields: ["endDate"] }) as EpisodeOfCareUpdate;
}

/**
 * Convert EscalationPolicyInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function escalationPolicyInputToApi(escalationPolicyInput: EscalationPolicyInput): EscalationPolicyInput {
  return ConverterPresets.standardApiResponse(escalationPolicyInput, { dateFields: [] }) as EscalationPolicyInput;
}

/**
 * Convert EscalationPolicyUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function escalationPolicyUpdateToApi(escalationPolicyUpdate: EscalationPolicyUpdate): EscalationPolicyUpdate {
  return ConverterPresets.standardApiResponse(escalationPolicyUpdate, { dateFields: [] }) as EscalationPolicyUpdate;
}

/**
 * Convert EscalationRule domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function escalationRuleToApi(escalationRule: EscalationRule): EscalationRule {
  return ConverterPresets.standardApiResponse(escalationRule, { dateFields: ["createdAt", "updatedAt"] }) as EscalationRule;
}

/**
 * Convert Explanation domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function explanationToApi(explanation: Explanation): Explanation {
  return ConverterPresets.standardApiResponse(explanation, { dateFields: ["createdAt", "updatedAt"] }) as Explanation;
}

/**
 * Convert HandoffInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `handoffDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function handoffInputToApi(handoffInput: HandoffInput): HandoffInput {
  return ConverterPresets.standardApiResponse(handoffInput, { dateFields: ["handoffDate"] }) as HandoffInput;
}

/**
 * Convert HandoffUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `handoffDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function handoffUpdateToApi(handoffUpdate: HandoffUpdate): HandoffUpdate {
  return ConverterPresets.standardApiResponse(handoffUpdate, { dateFields: ["handoffDate"] }) as HandoffUpdate;
}

/**
 * Convert OrderSetTemplate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function orderSetTemplateToApi(orderSetTemplate: OrderSetTemplate): OrderSetTemplate {
  return ConverterPresets.standardApiResponse(orderSetTemplate, { dateFields: ["createdAt", "updatedAt"] }) as OrderSetTemplate;
}

/**
 * Convert PathwayStep domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function pathwayStepToApi(pathwayStep: PathwayStep): PathwayStep {
  return ConverterPresets.standardApiResponse(pathwayStep, { dateFields: ["createdAt", "updatedAt"] }) as PathwayStep;
}

/**
 * Convert RoutingRuleInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function routingRuleInputToApi(routingRuleInput: RoutingRuleInput): RoutingRuleInput {
  return ConverterPresets.standardApiResponse(routingRuleInput, { dateFields: [] }) as RoutingRuleInput;
}

/**
 * Convert RoutingRuleUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function routingRuleUpdateToApi(routingRuleUpdate: RoutingRuleUpdate): RoutingRuleUpdate {
  return ConverterPresets.standardApiResponse(routingRuleUpdate, { dateFields: [] }) as RoutingRuleUpdate;
}

/**
 * Convert ScheduleTemplateInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function scheduleTemplateInputToApi(scheduleTemplateInput: ScheduleTemplateInput): ScheduleTemplateInput {
  return ConverterPresets.standardApiResponse(scheduleTemplateInput, { dateFields: [] }) as ScheduleTemplateInput;
}

/**
 * Convert ScheduleTemplateUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function scheduleTemplateUpdateToApi(scheduleTemplateUpdate: ScheduleTemplateUpdate): ScheduleTemplateUpdate {
  return ConverterPresets.standardApiResponse(scheduleTemplateUpdate, { dateFields: [] }) as ScheduleTemplateUpdate;
}

/**
 * Convert TaskAssignmentInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function taskAssignmentInputToApi(taskAssignmentInput: TaskAssignmentInput): TaskAssignmentInput {
  return ConverterPresets.standardApiResponse(taskAssignmentInput, { dateFields: [] }) as TaskAssignmentInput;
}

/**
 * Convert TaskAssignmentUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function taskAssignmentUpdateToApi(taskAssignmentUpdate: TaskAssignmentUpdate): TaskAssignmentUpdate {
  return ConverterPresets.standardApiResponse(taskAssignmentUpdate, { dateFields: [] }) as TaskAssignmentUpdate;
}

/**
 * Convert TaskComment domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function taskCommentToApi(taskComment: TaskComment): TaskComment {
  return ConverterPresets.standardApiResponse(taskComment, { dateFields: ["createdAt", "updatedAt"] }) as TaskComment;
}

/**
 * Convert TaskInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `dueDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function taskInputToApi(taskInput: TaskInput): TaskInput {
  return ConverterPresets.standardApiResponse(taskInput, { dateFields: ["dueDate"] }) as TaskInput;
}

/**
 * Convert TaskUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `completedAt`, `dueDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function taskUpdateToApi(taskUpdate: TaskUpdate): TaskUpdate {
  return ConverterPresets.standardApiResponse(taskUpdate, { dateFields: ["completedAt", "dueDate"] }) as TaskUpdate;
}

/**
 * Convert Timestamps domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function timestampsToApi(timestamps: Timestamps): Timestamps {
  return ConverterPresets.standardApiResponse(timestamps, { dateFields: ["createdAt", "updatedAt"] }) as Timestamps;
}

/**
 * Convert WorkQueueInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function workQueueInputToApi(workQueueInput: WorkQueueInput): WorkQueueInput {
  return ConverterPresets.standardApiResponse(workQueueInput, { dateFields: [] }) as WorkQueueInput;
}

/**
 * Convert WorkQueueUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function workQueueUpdateToApi(workQueueUpdate: WorkQueueUpdate): WorkQueueUpdate {
  return ConverterPresets.standardApiResponse(workQueueUpdate, { dateFields: [] }) as WorkQueueUpdate;
}

/**
 * Convert WorkflowDefinitionInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function workflowDefinitionInputToApi(workflowDefinitionInput: WorkflowDefinitionInput): WorkflowDefinitionInput {
  return ConverterPresets.standardApiResponse(workflowDefinitionInput, { dateFields: [] }) as WorkflowDefinitionInput;
}

/**
 * Convert WorkflowDefinitionUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function workflowDefinitionUpdateToApi(workflowDefinitionUpdate: WorkflowDefinitionUpdate): WorkflowDefinitionUpdate {
  return ConverterPresets.standardApiResponse(workflowDefinitionUpdate, { dateFields: [] }) as WorkflowDefinitionUpdate;
}

/**
 * Convert WorkflowEvent domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `occurredAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function workflowEventToApi(workflowEvent: WorkflowEvent): WorkflowEvent {
  return ConverterPresets.standardApiResponse(workflowEvent, { dateFields: ["createdAt", "occurredAt", "updatedAt"] }) as WorkflowEvent;
}

/**
 * Convert WorkflowInstanceInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function workflowInstanceInputToApi(workflowInstanceInput: WorkflowInstanceInput): WorkflowInstanceInput {
  return ConverterPresets.standardApiResponse(workflowInstanceInput, { dateFields: [] }) as WorkflowInstanceInput;
}

/**
 * Convert WorkflowInstanceUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `completedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function workflowInstanceUpdateToApi(workflowInstanceUpdate: WorkflowInstanceUpdate): WorkflowInstanceUpdate {
  return ConverterPresets.standardApiResponse(workflowInstanceUpdate, { dateFields: ["completedAt"] }) as WorkflowInstanceUpdate;
}

/**
 * Convert WorkflowState domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function workflowStateToApi(workflowState: WorkflowState): WorkflowState {
  return ConverterPresets.standardApiResponse(workflowState, { dateFields: ["createdAt", "updatedAt"] }) as WorkflowState;
}

/**
 * Convert WorkflowTransition domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function workflowTransitionToApi(workflowTransition: WorkflowTransition): WorkflowTransition {
  return ConverterPresets.standardApiResponse(workflowTransition, { dateFields: ["createdAt", "updatedAt"] }) as WorkflowTransition;
}
