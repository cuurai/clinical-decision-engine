/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { ListKnowledgePackagesParams, ListKnowledgePackagesResponse } from "@cuur-cde/core/knowledge-evidence";
import type { KnowledgePackageRepository } from "@cuur-cde/core/knowledge-evidence";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence";

/**
 * List knowledge packages
 */
export async function listKnowledgePackages(
    repo: KnowledgePackageRepository,
    orgId: string,
    params?: ListKnowledgePackagesParams
): Promise<ListKnowledgePackagesResponse> {
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
  } as ListKnowledgePackagesResponse;

}
