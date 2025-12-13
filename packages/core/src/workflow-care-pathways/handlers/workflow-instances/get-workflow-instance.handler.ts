/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetWorkflowInstanceResponse } from "../../types/index.js";
import type { WorkflowInstanceRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get workflow instance by ID
 */
export async function getWorkflowInstance(
    repo: WorkflowInstanceRepository,
    orgId: string,
    id: string
): Promise<GetWorkflowInstanceResponse> {
  const workflowInstance = await repo.findById(orgId, id);
  if (!workflowInstance) {
    throw new Error("Not found");
  }

  return {
    data: workflowInstance,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
