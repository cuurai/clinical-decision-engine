/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { ListKnowledgePackageModelDefinitionsResponse } from "../../types/index.js";
import type { KnowledgePackageModelDefinitionRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../../shared/helpers/id-generator.js";

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
  };

}
