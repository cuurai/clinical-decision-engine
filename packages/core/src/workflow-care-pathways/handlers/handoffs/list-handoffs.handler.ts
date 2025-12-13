/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/.bundled/openapi-workflow-care-pathways.json
 */

import type { ListHandoffsParams, ListHandoffsResponse } from "../../types/index.js";
import type { HandoffRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * List handoffs
 */
export async function listHandoffs(
    repo: HandoffRepository,
    orgId: string,
    params?: ListHandoffsParams
): Promise<ListHandoffsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


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
  };

}
