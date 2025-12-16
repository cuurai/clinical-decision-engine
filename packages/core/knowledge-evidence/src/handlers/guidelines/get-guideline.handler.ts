/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetGuidelineResponse } from "@cuur-cde/core/knowledge-evidence/types";
import type { GuidelineRepository } from "@cuur-cde/core/knowledge-evidence/repositories";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence/utils/transaction-id";

/**
 * Get clinical guideline by ID
 */
export async function getGuideline(
    repo: GuidelineRepository,
    orgId: string,
    id: string
): Promise<GetGuidelineResponse> {
  const guideline = await repo.findById(orgId, id);
  if (!guideline) {
    throw new Error("Not found");
  }

  return {
    data: guideline,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
