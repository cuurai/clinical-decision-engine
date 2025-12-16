/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { CreateEpisodeOfCareResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { EpisodeOfCareRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create episode of care
 */
export async function createEpisodeOfCare(
    repo: EpisodeOfCareRepository,
    orgId: string,
    input: unknown
): Promise<CreateEpisodeOfCareResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const episodeOfCare = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: episodeOfCare,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
