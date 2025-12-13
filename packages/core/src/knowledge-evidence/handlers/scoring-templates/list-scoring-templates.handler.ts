/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { ListScoringTemplatesParams, ListScoringTemplatesResponse } from "../../types/index.js";
import type { ScoringTemplateRepository } from "../../repositories/index.js";
import { knoTransactionId } from "../../../shared/helpers";

/**
 * List scoring templates
 */
export async function listScoringTemplates(
    repo: ScoringTemplateRepository,
    orgId: string,
    params?: ListScoringTemplatesParams
): Promise<ListScoringTemplatesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: result.items,
    meta: {
      correlationId: knoTransactionId(),
      timestamp: new Date().toISOString(),
      totalCount: result.total ?? result.items.length,
      pageSize: result.items.length,
      pageNumber: 1,
    },
  };

}
