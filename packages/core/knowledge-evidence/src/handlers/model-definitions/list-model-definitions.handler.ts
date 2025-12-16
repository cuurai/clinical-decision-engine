/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { ListModelDefinitionsParams, ListModelDefinitionsResponse } from "../../types/index.js";
import type { ModelDefinitionRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../utils/transaction-id.js";

/**
 * List model definitions
 */
export async function listModelDefinitions(
    repo: ModelDefinitionRepository,
    orgId: string,
    params?: ListModelDefinitionsParams
): Promise<ListModelDefinitionsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  } as ListModelDefinitionsResponse;

}
