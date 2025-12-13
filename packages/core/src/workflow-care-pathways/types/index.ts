/**
 * Workflow Care Pathways Domain Types
 *
 * Auto-generated from OpenAPI spec
 * Generator: types-generator v2.0.0
 *
 * This file re-exports types from generated OpenAPI types and adds
 * convenient type aliases for handlers (response types, etc.)
 *
 * ⚠️ DO NOT EDIT MANUALLY - this file is auto-generated
 */

import type { components, operations } from "../openapi/workflow-care-pathways.openapi.types";

// ============================================================================
// Re-export all generated types
// ============================================================================
// Note: components and operations are exported here but should be accessed via namespace
// in main index.ts to avoid duplicate export errors (e.g., blockchain.types.components)

export type { components, operations };


// ============================================================================
// Convenient Type Aliases for Schemas
// ============================================================================

export type Alert = components["schemas"]["Alert"];
export type AlertInput = components["schemas"]["AlertInput"];
export type AlertUpdate = components["schemas"]["AlertUpdate"];
export type AuditEvent = components["schemas"]["AuditEvent"];
export type CarePathwayTemplate = components["schemas"]["CarePathwayTemplate"];
export type CarePathwayTemplateInput = components["schemas"]["CarePathwayTemplateInput"];
export type CarePathwayTemplateUpdate = components["schemas"]["CarePathwayTemplateUpdate"];
export type CarePlan = components["schemas"]["CarePlan"];
export type CarePlanGoal = components["schemas"]["CarePlanGoal"];
export type CarePlanInput = components["schemas"]["CarePlanInput"];
export type CarePlanUpdate = components["schemas"]["CarePlanUpdate"];
export type ChecklistInstance = components["schemas"]["ChecklistInstance"];
export type ChecklistInstanceInput = components["schemas"]["ChecklistInstanceInput"];
export type ChecklistInstanceUpdate = components["schemas"]["ChecklistInstanceUpdate"];
export type ChecklistItem = components["schemas"]["ChecklistItem"];
export type ChecklistItemInstance = components["schemas"]["ChecklistItemInstance"];
export type ChecklistTemplate = components["schemas"]["ChecklistTemplate"];
export type ChecklistTemplateInput = components["schemas"]["ChecklistTemplateInput"];
export type ChecklistTemplateUpdate = components["schemas"]["ChecklistTemplateUpdate"];
export type Encounter = components["schemas"]["Encounter"];
export type EpisodeOfCare = components["schemas"]["EpisodeOfCare"];
export type EpisodeOfCareInput = components["schemas"]["EpisodeOfCareInput"];
export type EpisodeOfCareUpdate = components["schemas"]["EpisodeOfCareUpdate"];
export type EscalationPolicy = components["schemas"]["EscalationPolicy"];
export type EscalationPolicyInput = components["schemas"]["EscalationPolicyInput"];
export type EscalationPolicyUpdate = components["schemas"]["EscalationPolicyUpdate"];
export type EscalationRule = components["schemas"]["EscalationRule"];
export type Explanation = components["schemas"]["Explanation"];
export type Handoff = components["schemas"]["Handoff"];
export type HandoffInput = components["schemas"]["HandoffInput"];
export type HandoffUpdate = components["schemas"]["HandoffUpdate"];
export type OrderSetTemplate = components["schemas"]["OrderSetTemplate"];
export type PathwayStep = components["schemas"]["PathwayStep"];
export type RoutingRule = components["schemas"]["RoutingRule"];
export type RoutingRuleInput = components["schemas"]["RoutingRuleInput"];
export type RoutingRuleUpdate = components["schemas"]["RoutingRuleUpdate"];
export type ScheduleTemplate = components["schemas"]["ScheduleTemplate"];
export type ScheduleTemplateInput = components["schemas"]["ScheduleTemplateInput"];
export type ScheduleTemplateUpdate = components["schemas"]["ScheduleTemplateUpdate"];
export type Task = components["schemas"]["Task"];
export type TaskAssignment = components["schemas"]["TaskAssignment"];
export type TaskAssignmentInput = components["schemas"]["TaskAssignmentInput"];
export type TaskAssignmentUpdate = components["schemas"]["TaskAssignmentUpdate"];
export type TaskComment = components["schemas"]["TaskComment"];
export type TaskInput = components["schemas"]["TaskInput"];
export type TaskUpdate = components["schemas"]["TaskUpdate"];
export type Timestamps = components["schemas"]["Timestamps"];
export type WorkQueue = components["schemas"]["WorkQueue"];
export type WorkQueueInput = components["schemas"]["WorkQueueInput"];
export type WorkQueueUpdate = components["schemas"]["WorkQueueUpdate"];
export type WorkflowDefinition = components["schemas"]["WorkflowDefinition"];
export type WorkflowDefinitionInput = components["schemas"]["WorkflowDefinitionInput"];
export type WorkflowDefinitionUpdate = components["schemas"]["WorkflowDefinitionUpdate"];
export type WorkflowEvent = components["schemas"]["WorkflowEvent"];
export type WorkflowInstance = components["schemas"]["WorkflowInstance"];
export type WorkflowInstanceInput = components["schemas"]["WorkflowInstanceInput"];
export type WorkflowInstanceUpdate = components["schemas"]["WorkflowInstanceUpdate"];
export type WorkflowState = components["schemas"]["WorkflowState"];
export type WorkflowTransition = components["schemas"]["WorkflowTransition"];
export type WorkflowDefinitionState = operations["listWorkflowDefinitionStates"]["responses"]["200"]["content"]["application/json"]["data"];
export type WorkflowDefinitionTransition = operations["listWorkflowDefinitionTransitions"]["responses"]["200"]["content"]["application/json"]["data"];
export type WorkflowInstanceTask = operations["listWorkflowInstanceTasks"]["responses"]["200"]["content"]["application/json"]["data"];
export type WorkflowInstanceEvent = operations["listWorkflowInstanceEvents"]["responses"]["200"]["content"]["application/json"]["data"];
export type WorkflowInstanceAuditEvent = operations["listWorkflowInstanceAuditEvents"]["responses"]["200"]["content"]["application/json"]["data"];
export type CarePathwayTemplateStep = operations["listCarePathwayTemplateSteps"]["responses"]["200"]["content"]["application/json"]["data"];
export type CarePathwayTemplateOrderSetTemplate = operations["listCarePathwayTemplateOrderSetTemplates"]["responses"]["200"]["content"]["application/json"]["data"];
export type CarePlanTask = operations["listCarePlanTasks"]["responses"]["200"]["content"]["application/json"]["data"];
export type CarePlanChecklist = operations["listCarePlanChecklists"]["responses"]["200"]["content"]["application/json"]["data"];
export type EpisodesOfCare = operations["listEpisodesOfCare"]["responses"]["200"]["content"]["application/json"]["data"];
export type EpisodeOfCareEncounter = operations["listEpisodeOfCareEncounters"]["responses"]["200"]["content"]["application/json"]["data"];
export type EpisodeOfCareCarePlan = operations["listEpisodeOfCareCarePlans"]["responses"]["200"]["content"]["application/json"]["data"];
export type EpisodeOfCareWorkflowInstance = operations["listEpisodeOfCareWorkflowInstances"]["responses"]["200"]["content"]["application/json"]["data"];
export type TaskAuditEvent = operations["listTaskAuditEvents"]["responses"]["200"]["content"]["application/json"]["data"];
export type AlertExplanation = operations["listAlertExplanations"]["responses"]["200"]["content"]["application/json"]["data"];
export type AlertAuditEvent = operations["listAlertAuditEvents"]["responses"]["200"]["content"]["application/json"]["data"];
export type HandoffTask = operations["listHandoffTasks"]["responses"]["200"]["content"]["application/json"]["data"];
export type ChecklistTemplateItem = operations["listChecklistTemplateItems"]["responses"]["200"]["content"]["application/json"]["data"];
export type ChecklistInstanceItem = operations["listChecklistInstanceItems"]["responses"]["200"]["content"]["application/json"]["data"];
export type EscalationPolicyRule = operations["listEscalationPolicyRules"]["responses"]["200"]["content"]["application/json"]["data"];
export type WorkQueueTask = operations["listWorkQueueTasks"]["responses"]["200"]["content"]["application/json"]["data"];
export type WorkQueueAlert = operations["listWorkQueueAlerts"]["responses"]["200"]["content"]["application/json"]["data"];


// ============================================================================
// Operation Input Types (Request Bodies)
// ============================================================================

// These types represent the input data for create/update operations

export type WorkflowDefinitionInputInput = NonNullable<operations["createWorkflowDefinition"]["requestBody"]>["content"]["application/json"];
export type WorkflowDefinitionUpdateInput = NonNullable<operations["updateWorkflowDefinition"]["requestBody"]>["content"]["application/json"];
export type WorkflowInstanceInputInput = NonNullable<operations["createWorkflowInstance"]["requestBody"]>["content"]["application/json"];
export type WorkflowInstanceUpdateInput = NonNullable<operations["updateWorkflowInstance"]["requestBody"]>["content"]["application/json"];
export type CarePathwayTemplateInputInput = NonNullable<operations["createCarePathwayTemplate"]["requestBody"]>["content"]["application/json"];
export type CarePathwayTemplateUpdateInput = NonNullable<operations["updateCarePathwayTemplate"]["requestBody"]>["content"]["application/json"];
export type CarePlanInputInput = NonNullable<operations["createCarePlan"]["requestBody"]>["content"]["application/json"];
export type CarePlanUpdateInput = NonNullable<operations["updateCarePlan"]["requestBody"]>["content"]["application/json"];
export type EpisodeOfCareInputInput = NonNullable<operations["createEpisodeOfCare"]["requestBody"]>["content"]["application/json"];
export type EpisodeOfCareUpdateInput = NonNullable<operations["updateEpisodeOfCare"]["requestBody"]>["content"]["application/json"];
export type TaskInputInput = NonNullable<operations["createTask"]["requestBody"]>["content"]["application/json"];
export type TaskUpdateInput = NonNullable<operations["updateTask"]["requestBody"]>["content"]["application/json"];
export type TaskAssignmentInputInput = NonNullable<operations["createTaskAssignment"]["requestBody"]>["content"]["application/json"];
export type TaskAssignmentUpdateInput = NonNullable<operations["updateTaskAssignment"]["requestBody"]>["content"]["application/json"];
export type AlertInputInput = NonNullable<operations["createAlert"]["requestBody"]>["content"]["application/json"];
export type AlertUpdateInput = NonNullable<operations["updateAlert"]["requestBody"]>["content"]["application/json"];
export type HandoffInputInput = NonNullable<operations["createHandoff"]["requestBody"]>["content"]["application/json"];
export type HandoffUpdateInput = NonNullable<operations["updateHandoff"]["requestBody"]>["content"]["application/json"];
export type ChecklistTemplateInputInput = NonNullable<operations["createChecklistTemplate"]["requestBody"]>["content"]["application/json"];
export type ChecklistTemplateUpdateInput = NonNullable<operations["updateChecklistTemplate"]["requestBody"]>["content"]["application/json"];
export type ChecklistInstanceInputInput = NonNullable<operations["createChecklistInstance"]["requestBody"]>["content"]["application/json"];
export type ChecklistInstanceUpdateInput = NonNullable<operations["updateChecklistInstance"]["requestBody"]>["content"]["application/json"];
export type EscalationPolicyInputInput = NonNullable<operations["createEscalationPolicy"]["requestBody"]>["content"]["application/json"];
export type EscalationPolicyUpdateInput = NonNullable<operations["updateEscalationPolicy"]["requestBody"]>["content"]["application/json"];
export type RoutingRuleInputInput = NonNullable<operations["createRoutingRule"]["requestBody"]>["content"]["application/json"];
export type RoutingRuleUpdateInput = NonNullable<operations["updateRoutingRule"]["requestBody"]>["content"]["application/json"];
export type ScheduleTemplateInputInput = NonNullable<operations["createScheduleTemplate"]["requestBody"]>["content"]["application/json"];
export type ScheduleTemplateUpdateInput = NonNullable<operations["updateScheduleTemplate"]["requestBody"]>["content"]["application/json"];
export type WorkQueueInputInput = NonNullable<operations["createWorkQueue"]["requestBody"]>["content"]["application/json"];
export type WorkQueueUpdateInput = NonNullable<operations["updateWorkQueue"]["requestBody"]>["content"]["application/json"];


// ============================================================================
// Operation Parameter Types (Query Parameters)
// ============================================================================

// These types represent query parameters for list/search operations

export type ListWorkflowDefinitionsParams = operations["listWorkflowDefinitions"]["parameters"]["query"];
export type ListWorkflowInstancesParams = operations["listWorkflowInstances"]["parameters"]["query"];
export type ListCarePathwayTemplatesParams = operations["listCarePathwayTemplates"]["parameters"]["query"];
export type ListCarePlansParams = operations["listCarePlans"]["parameters"]["query"];
export type ListEpisodesOfCareParams = operations["listEpisodesOfCare"]["parameters"]["query"];
export type ListTasksParams = operations["listTasks"]["parameters"]["query"];
export type ListTaskAssignmentsParams = operations["listTaskAssignments"]["parameters"]["query"];
export type ListAlertsParams = operations["listAlerts"]["parameters"]["query"];
export type ListHandoffsParams = operations["listHandoffs"]["parameters"]["query"];
export type ListChecklistTemplatesParams = operations["listChecklistTemplates"]["parameters"]["query"];
export type ListChecklistInstancesParams = operations["listChecklistInstances"]["parameters"]["query"];
export type ListEscalationPoliciesParams = operations["listEscalationPolicies"]["parameters"]["query"];
export type ListRoutingRulesParams = operations["listRoutingRules"]["parameters"]["query"];
export type ListScheduleTemplatesParams = operations["listScheduleTemplates"]["parameters"]["query"];
export type ListWorkQueuesParams = operations["listWorkQueues"]["parameters"]["query"];


// ============================================================================
// Operation Response Types
// ============================================================================

// These types are used by handlers for type-safe response envelopes

export type ListWorkflowDefinitionsResponse = operations["listWorkflowDefinitions"]["responses"]["200"]["content"]["application/json"];
export type CreateWorkflowDefinitionResponse = operations["createWorkflowDefinition"]["responses"]["201"]["content"]["application/json"];
export type GetWorkflowDefinitionResponse = operations["getWorkflowDefinition"]["responses"]["200"]["content"]["application/json"];
export type UpdateWorkflowDefinitionResponse = operations["updateWorkflowDefinition"]["responses"]["200"]["content"]["application/json"];
export type ListWorkflowDefinitionStatesResponse = operations["listWorkflowDefinitionStates"]["responses"]["200"]["content"]["application/json"];
export type ListWorkflowDefinitionTransitionsResponse = operations["listWorkflowDefinitionTransitions"]["responses"]["200"]["content"]["application/json"];
export type ListWorkflowInstancesResponse = operations["listWorkflowInstances"]["responses"]["200"]["content"]["application/json"];
export type CreateWorkflowInstanceResponse = operations["createWorkflowInstance"]["responses"]["201"]["content"]["application/json"];
export type GetWorkflowInstanceResponse = operations["getWorkflowInstance"]["responses"]["200"]["content"]["application/json"];
export type UpdateWorkflowInstanceResponse = operations["updateWorkflowInstance"]["responses"]["200"]["content"]["application/json"];
export type ListWorkflowInstanceTasksResponse = operations["listWorkflowInstanceTasks"]["responses"]["200"]["content"]["application/json"];
export type ListWorkflowInstanceEventsResponse = operations["listWorkflowInstanceEvents"]["responses"]["200"]["content"]["application/json"];
export type ListWorkflowInstanceAuditEventsResponse = operations["listWorkflowInstanceAuditEvents"]["responses"]["200"]["content"]["application/json"];
export type ListCarePathwayTemplatesResponse = operations["listCarePathwayTemplates"]["responses"]["200"]["content"]["application/json"];
export type CreateCarePathwayTemplateResponse = operations["createCarePathwayTemplate"]["responses"]["201"]["content"]["application/json"];
export type GetCarePathwayTemplateResponse = operations["getCarePathwayTemplate"]["responses"]["200"]["content"]["application/json"];
export type UpdateCarePathwayTemplateResponse = operations["updateCarePathwayTemplate"]["responses"]["200"]["content"]["application/json"];
export type ListCarePathwayTemplateStepsResponse = operations["listCarePathwayTemplateSteps"]["responses"]["200"]["content"]["application/json"];
export type ListCarePathwayTemplateOrderSetTemplatesResponse = operations["listCarePathwayTemplateOrderSetTemplates"]["responses"]["200"]["content"]["application/json"];
export type ListCarePlansResponse = operations["listCarePlans"]["responses"]["200"]["content"]["application/json"];
export type CreateCarePlanResponse = operations["createCarePlan"]["responses"]["201"]["content"]["application/json"];
export type GetCarePlanResponse = operations["getCarePlan"]["responses"]["200"]["content"]["application/json"];
export type UpdateCarePlanResponse = operations["updateCarePlan"]["responses"]["200"]["content"]["application/json"];
export type ListCarePlanGoalsResponse = operations["listCarePlanGoals"]["responses"]["200"]["content"]["application/json"];
export type ListCarePlanTasksResponse = operations["listCarePlanTasks"]["responses"]["200"]["content"]["application/json"];
export type ListCarePlanChecklistsResponse = operations["listCarePlanChecklists"]["responses"]["200"]["content"]["application/json"];
export type ListEpisodesOfCareResponse = operations["listEpisodesOfCare"]["responses"]["200"]["content"]["application/json"];
export type CreateEpisodeOfCareResponse = operations["createEpisodeOfCare"]["responses"]["201"]["content"]["application/json"];
export type GetEpisodeOfCareResponse = operations["getEpisodeOfCare"]["responses"]["200"]["content"]["application/json"];
export type UpdateEpisodeOfCareResponse = operations["updateEpisodeOfCare"]["responses"]["200"]["content"]["application/json"];
export type ListEpisodeOfCareEncountersResponse = operations["listEpisodeOfCareEncounters"]["responses"]["200"]["content"]["application/json"];
export type ListEpisodeOfCareCarePlansResponse = operations["listEpisodeOfCareCarePlans"]["responses"]["200"]["content"]["application/json"];
export type ListEpisodeOfCareWorkflowInstancesResponse = operations["listEpisodeOfCareWorkflowInstances"]["responses"]["200"]["content"]["application/json"];
export type ListTasksResponse = operations["listTasks"]["responses"]["200"]["content"]["application/json"];
export type CreateTaskResponse = operations["createTask"]["responses"]["201"]["content"]["application/json"];
export type GetTaskResponse = operations["getTask"]["responses"]["200"]["content"]["application/json"];
export type UpdateTaskResponse = operations["updateTask"]["responses"]["200"]["content"]["application/json"];
export type ListTaskCommentsResponse = operations["listTaskComments"]["responses"]["200"]["content"]["application/json"];
export type ListTaskAuditEventsResponse = operations["listTaskAuditEvents"]["responses"]["200"]["content"]["application/json"];
export type ListTaskAssignmentsResponse = operations["listTaskAssignments"]["responses"]["200"]["content"]["application/json"];
export type CreateTaskAssignmentResponse = operations["createTaskAssignment"]["responses"]["201"]["content"]["application/json"];
export type GetTaskAssignmentResponse = operations["getTaskAssignment"]["responses"]["200"]["content"]["application/json"];
export type UpdateTaskAssignmentResponse = operations["updateTaskAssignment"]["responses"]["200"]["content"]["application/json"];
export type ListAlertsResponse = operations["listAlerts"]["responses"]["200"]["content"]["application/json"];
export type CreateAlertResponse = operations["createAlert"]["responses"]["201"]["content"]["application/json"];
export type GetAlertResponse = operations["getAlert"]["responses"]["200"]["content"]["application/json"];
export type UpdateAlertResponse = operations["updateAlert"]["responses"]["200"]["content"]["application/json"];
export type ListAlertExplanationsResponse = operations["listAlertExplanations"]["responses"]["200"]["content"]["application/json"];
export type ListAlertAuditEventsResponse = operations["listAlertAuditEvents"]["responses"]["200"]["content"]["application/json"];
export type ListHandoffsResponse = operations["listHandoffs"]["responses"]["200"]["content"]["application/json"];
export type CreateHandoffResponse = operations["createHandoff"]["responses"]["201"]["content"]["application/json"];
export type GetHandoffResponse = operations["getHandoff"]["responses"]["200"]["content"]["application/json"];
export type UpdateHandoffResponse = operations["updateHandoff"]["responses"]["200"]["content"]["application/json"];
export type ListHandoffTasksResponse = operations["listHandoffTasks"]["responses"]["200"]["content"]["application/json"];
export type ListChecklistTemplatesResponse = operations["listChecklistTemplates"]["responses"]["200"]["content"]["application/json"];
export type CreateChecklistTemplateResponse = operations["createChecklistTemplate"]["responses"]["201"]["content"]["application/json"];
export type GetChecklistTemplateResponse = operations["getChecklistTemplate"]["responses"]["200"]["content"]["application/json"];
export type UpdateChecklistTemplateResponse = operations["updateChecklistTemplate"]["responses"]["200"]["content"]["application/json"];
export type ListChecklistTemplateItemsResponse = operations["listChecklistTemplateItems"]["responses"]["200"]["content"]["application/json"];
export type ListChecklistInstancesResponse = operations["listChecklistInstances"]["responses"]["200"]["content"]["application/json"];
export type CreateChecklistInstanceResponse = operations["createChecklistInstance"]["responses"]["201"]["content"]["application/json"];
export type GetChecklistInstanceResponse = operations["getChecklistInstance"]["responses"]["200"]["content"]["application/json"];
export type UpdateChecklistInstanceResponse = operations["updateChecklistInstance"]["responses"]["200"]["content"]["application/json"];
export type ListChecklistInstanceItemsResponse = operations["listChecklistInstanceItems"]["responses"]["200"]["content"]["application/json"];
export type ListEscalationPoliciesResponse = operations["listEscalationPolicies"]["responses"]["200"]["content"]["application/json"];
export type CreateEscalationPolicyResponse = operations["createEscalationPolicy"]["responses"]["201"]["content"]["application/json"];
export type GetEscalationPolicyResponse = operations["getEscalationPolicy"]["responses"]["200"]["content"]["application/json"];
export type UpdateEscalationPolicyResponse = operations["updateEscalationPolicy"]["responses"]["200"]["content"]["application/json"];
export type ListEscalationPolicyRulesResponse = operations["listEscalationPolicyRules"]["responses"]["200"]["content"]["application/json"];
export type ListRoutingRulesResponse = operations["listRoutingRules"]["responses"]["200"]["content"]["application/json"];
export type CreateRoutingRuleResponse = operations["createRoutingRule"]["responses"]["201"]["content"]["application/json"];
export type GetRoutingRuleResponse = operations["getRoutingRule"]["responses"]["200"]["content"]["application/json"];
export type UpdateRoutingRuleResponse = operations["updateRoutingRule"]["responses"]["200"]["content"]["application/json"];
export type ListScheduleTemplatesResponse = operations["listScheduleTemplates"]["responses"]["200"]["content"]["application/json"];
export type CreateScheduleTemplateResponse = operations["createScheduleTemplate"]["responses"]["201"]["content"]["application/json"];
export type GetScheduleTemplateResponse = operations["getScheduleTemplate"]["responses"]["200"]["content"]["application/json"];
export type UpdateScheduleTemplateResponse = operations["updateScheduleTemplate"]["responses"]["200"]["content"]["application/json"];
export type ListWorkQueuesResponse = operations["listWorkQueues"]["responses"]["200"]["content"]["application/json"];
export type CreateWorkQueueResponse = operations["createWorkQueue"]["responses"]["201"]["content"]["application/json"];
export type GetWorkQueueResponse = operations["getWorkQueue"]["responses"]["200"]["content"]["application/json"];
export type UpdateWorkQueueResponse = operations["updateWorkQueue"]["responses"]["200"]["content"]["application/json"];
export type ListWorkQueueTasksResponse = operations["listWorkQueueTasks"]["responses"]["200"]["content"]["application/json"];
export type ListWorkQueueAlertsResponse = operations["listWorkQueueAlerts"]["responses"]["200"]["content"]["application/json"];


