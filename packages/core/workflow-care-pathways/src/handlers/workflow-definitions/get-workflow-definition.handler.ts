/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetWorkflowDefinitionResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { WorkflowDefinitionRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";

/**
 * Get workflow definition by ID
 */
export async function getWorkflowDefinition(
    repo: WorkflowDefinitionRepository,
    orgId: string,
    id: string
): Promise<GetWorkflowDefinitionResponse> {
  const workflowDefinition = await repo.findById(orgId, id);
  if (!workflowDefinition) {
    throw new Error("Not found");
  }

  return {
    data: workflowDefinition,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
