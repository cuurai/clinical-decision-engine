/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetConceptMapResponse } from "@cuur-cde/core/knowledge-evidence";
import type { ConceptMapRepository } from "@cuur-cde/core/knowledge-evidence";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence";

/**
 * Get concept map by ID
 */
export async function getConceptMap(
    repo: ConceptMapRepository,
    orgId: string,
    id: string
): Promise<GetConceptMapResponse> {
  const conceptMap = await repo.findById(orgId, id);
  if (!conceptMap) {
    throw new Error("Not found");
  }

  return {
    data: conceptMap,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
