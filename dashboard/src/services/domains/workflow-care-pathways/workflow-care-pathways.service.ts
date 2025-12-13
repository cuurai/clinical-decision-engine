import { createResourceService } from "../../core/resource-service";
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
} from "./workflow-care-pathways.types";

export const workflowInstancesService = createResourceService<WorkflowInstance, CreateWorkflowInstanceInput, UpdateWorkflowInstanceInput>("/workflow-instances");
export const carePlansService = createResourceService<CarePlan, CreateCarePlanInput, UpdateCarePlanInput>("/care-plans");
export const tasksService = createResourceService<Task, CreateTaskInput, UpdateTaskInput>("/tasks");
export const alertsService = createResourceService<Alert, CreateAlertInput, UpdateAlertInput>("/alerts");
export const workQueuesService = createResourceService<WorkQueue, CreateWorkQueueInput, UpdateWorkQueueInput>("/work-queues");

export const workflowCarePathwaysServices = {
  workflowInstances: workflowInstancesService,
  carePlans: carePlansService,
  tasks: tasksService,
  alerts: alertsService,
  workQueues: workQueuesService,
};
