import { ListParams, ListResponse } from "../../core/resource-service";
import type {
  WorkflowInstance,
  WorkflowInstanceInput,
  WorkflowInstanceUpdate,
  CarePlan,
  CarePlanInput,
  CarePlanUpdate,
  Task,
  TaskInput,
  TaskUpdate,
  Alert,
  AlertInput,
  AlertUpdate,
  WorkQueue,
  WorkQueueInput,
  WorkQueueUpdate,
  ListWorkflowInstancesParams,
  ListCarePlansParams,
  ListTasksParams,
  ListAlertsParams,
  ListWorkQueuesParams,
} from "@cuur/core/workflow-care-pathways/types";

// Re-export types from core
export type { WorkflowInstance, CarePlan, Task, Alert, WorkQueue };

// Input types
export type CreateWorkflowInstanceInput = WorkflowInstanceInput;
export type UpdateWorkflowInstanceInput = WorkflowInstanceUpdate;
export type CreateCarePlanInput = CarePlanInput;
export type UpdateCarePlanInput = CarePlanUpdate;
export type CreateTaskInput = TaskInput;
export type UpdateTaskInput = TaskUpdate;
export type CreateAlertInput = AlertInput;
export type UpdateAlertInput = AlertUpdate;
export type CreateWorkQueueInput = WorkQueueInput;
export type UpdateWorkQueueInput = WorkQueueUpdate;

// List params and response types
export type WorkflowInstanceListParams = ListWorkflowInstancesParams & ListParams;
export type WorkflowInstanceListResponse = ListResponse<WorkflowInstance>;
export type CarePlanListParams = ListCarePlansParams & ListParams;
export type CarePlanListResponse = ListResponse<CarePlan>;
export type TaskListParams = ListTasksParams & ListParams;
export type TaskListResponse = ListResponse<Task>;
export type AlertListParams = ListAlertsParams & ListParams;
export type AlertListResponse = ListResponse<Alert>;
export type WorkQueueListParams = ListWorkQueuesParams & ListParams;
export type WorkQueueListResponse = ListResponse<WorkQueue>;
