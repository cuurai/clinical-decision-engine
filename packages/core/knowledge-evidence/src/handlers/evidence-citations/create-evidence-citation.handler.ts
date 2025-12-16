/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { CreateEvidenceCitationResponse } from "../../types/index.js";
import type { EvidenceCitationRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../utils/transaction-id.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create evidence citation
 */
export async function createEvidenceCitation(
    repo: EvidenceCitationRepository,
    orgId: string,
    input: unknown
): Promise<CreateEvidenceCitationResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const evidenceCitation = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: evidenceCitation,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
