/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { ListInterfaceErrorsParams, ListInterfaceErrorsResponse } from "../../types/index.js";
import type { InterfaceErrorRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../utils/transaction-id.js";

/**
 * List interface errors
 */
export async function listInterfaceErrors(
    repo: InterfaceErrorRepository,
    orgId: string,
    params?: ListInterfaceErrorsParams
): Promise<ListInterfaceErrorsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  } as ListInterfaceErrorsResponse;

}
