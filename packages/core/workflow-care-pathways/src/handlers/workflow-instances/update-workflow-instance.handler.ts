/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { UpdateWorkflowInstanceResponse } from "../../types/index.js";
import type { WorkflowInstanceRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../utils/transaction-id.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update workflow instance
 */
export async function updateWorkflowInstance(
    repo: WorkflowInstanceRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateWorkflowInstanceResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const workflowInstance = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: workflowInstance,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
