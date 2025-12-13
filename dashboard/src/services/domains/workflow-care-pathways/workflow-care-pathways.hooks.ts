import { useResourceHook } from "../../core/use-resource";
import { workflowCarePathwaysServices } from "./workflow-care-pathways.service";
import type {
  WorkflowInstance,
  CreateWorkflowInstanceInput,
  UpdateWorkflowInstanceInput,
  CarePlan,
  CreateCarePlanInput,
  UpdateCarePlanInput,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  Alert,
  CreateAlertInput,
  UpdateAlertInput,
  WorkQueue,
  CreateWorkQueueInput,
  UpdateWorkQueueInput,
  WorkflowInstanceListParams,
  CarePlanListParams,
  TaskListParams,
  AlertListParams,
  WorkQueueListParams,
} from "./workflow-care-pathways.types";

export function useWorkflowInstances(autoFetch = true, params?: WorkflowInstanceListParams) {
  return useResourceHook<WorkflowInstance, CreateWorkflowInstanceInput, UpdateWorkflowInstanceInput, WorkflowInstanceListParams>(
    workflowCarePathwaysServices.workflowInstances,
    autoFetch,
    params
  );
}

export function useCarePlans(autoFetch = true, params?: CarePlanListParams) {
  return useResourceHook<CarePlan, CreateCarePlanInput, UpdateCarePlanInput, CarePlanListParams>(
    workflowCarePathwaysServices.carePlans,
    autoFetch,
    params
  );
}

export function useTasks(autoFetch = true, params?: TaskListParams) {
  return useResourceHook<Task, CreateTaskInput, UpdateTaskInput, TaskListParams>(
    workflowCarePathwaysServices.tasks,
    autoFetch,
    params
  );
}

export function useAlerts(autoFetch = true, params?: AlertListParams) {
  return useResourceHook<Alert, CreateAlertInput, UpdateAlertInput, AlertListParams>(
    workflowCarePathwaysServices.alerts,
    autoFetch,
    params
  );
}

export function useWorkQueues(autoFetch = true, params?: WorkQueueListParams) {
  return useResourceHook<WorkQueue, CreateWorkQueueInput, UpdateWorkQueueInput, WorkQueueListParams>(
    workflowCarePathwaysServices.workQueues,
    autoFetch,
    params
  );
}
