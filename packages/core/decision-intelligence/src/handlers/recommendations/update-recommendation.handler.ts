/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { UpdateRecommendationResponse } from "@cuur-cde/core/decision-intelligence/types";
import type { RecommendationRepository } from "@cuur-cde/core/decision-intelligence/repositories";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence/utils/transaction-id";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update recommendation
 */
export async function updateRecommendation(
    repo: RecommendationRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateRecommendationResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const recommendation = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: recommendation,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
