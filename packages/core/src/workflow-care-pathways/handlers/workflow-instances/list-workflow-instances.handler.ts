/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { ListWorkflowInstancesParams, ListWorkflowInstancesResponse } from "../../types/index.js";
import type { WorkflowInstanceRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers";

/**
 * List workflow instances
 */
export async function listWorkflowInstances(
    repo: WorkflowInstanceRepository,
    orgId: string,
    params?: ListWorkflowInstancesParams
): Promise<ListWorkflowInstancesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: result.items,
    meta: {
      correlationId: unknownTransactionId(),
      timestamp: new Date().toISOString(),
      totalCount: result.total ?? result.items.length,
      pageSize: result.items.length,
      pageNumber: 1,
    },
  };

}
