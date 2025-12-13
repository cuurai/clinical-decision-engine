/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { ListModelInvocationsParams, ListModelInvocationsResponse } from "../../types/index.js";
import type { ModelInvocationRepository } from "../../repositories/index.js";
import { decTransactionId } from "../../../shared/helpers";

/**
 * List model invocations
 */
export async function listModelInvocations(
    repo: ModelInvocationRepository,
    orgId: string,
    params?: ListModelInvocationsParams
): Promise<ListModelInvocationsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: result.items,
    meta: {
      correlationId: decTransactionId(),
      timestamp: new Date().toISOString(),
      totalCount: result.total ?? result.items.length,
      pageSize: result.items.length,
      pageNumber: 1,
    },
  };

}
