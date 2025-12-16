/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { CreateWorkflowDefinitionResponse } from "@cuur-cde/core/workflow-care-pathways";
import type { WorkflowDefinitionRepository } from "@cuur-cde/core/workflow-care-pathways";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create workflow definition
 */
export async function createWorkflowDefinition(
    repo: WorkflowDefinitionRepository,
    orgId: string,
    input: unknown
): Promise<CreateWorkflowDefinitionResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const workflowDefinition = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: workflowDefinition,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
