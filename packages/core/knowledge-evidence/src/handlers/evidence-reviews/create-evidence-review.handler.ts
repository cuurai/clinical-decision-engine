/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { CreateEvidenceReviewResponse } from "@cuur-cde/core/knowledge-evidence/types";
import type { EvidenceReviewRepository } from "@cuur-cde/core/knowledge-evidence/repositories";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence/utils/transaction-id";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create evidence review
 */
export async function createEvidenceReview(
    repo: EvidenceReviewRepository,
    orgId: string,
    input: unknown
): Promise<CreateEvidenceReviewResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const evidenceReview = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: evidenceReview,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
