/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetEvidenceReviewResponse } from "@cuur-cde/core/knowledge-evidence";
import type { EvidenceReviewRepository } from "@cuur-cde/core/knowledge-evidence";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence";

/**
 * Get evidence review by ID
 */
export async function getEvidenceReview(
    repo: EvidenceReviewRepository,
    orgId: string,
    id: string
): Promise<GetEvidenceReviewResponse> {
  const evidenceReview = await repo.findById(orgId, id);
  if (!evidenceReview) {
    throw new Error("Not found");
  }

  return {
    data: evidenceReview,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
