/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { ListWorkflowDefinitionStatesResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { WorkflowDefinitionStateRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";

/**
 * List workflow definition states
 */
export async function listWorkflowDefinitionStates(
    repo: WorkflowDefinitionStateRepository,
    orgId: string
): Promise<ListWorkflowDefinitionStatesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  } as ListWorkflowDefinitionStatesResponse;

}
