/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { ListKnowledgePackageModelDefinitionsResponse } from "../../types/index.js";
import type { KnowledgePackageModelDefinitionRepository } from "../../repositories/index.js";
import { knoTransactionId } from "../../../shared/helpers";

/**
 * List knowledge package model definitions
 */
export async function listKnowledgePackageModelDefinitions(
    repo: KnowledgePackageModelDefinitionRepository,
    orgId: string
): Promise<ListKnowledgePackageModelDefinitionsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


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
