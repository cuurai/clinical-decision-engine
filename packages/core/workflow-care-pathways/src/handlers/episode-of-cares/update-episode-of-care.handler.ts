/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { UpdateEpisodeOfCareResponse } from "../../types/index.js";
import type { EpisodeOfCareRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../utils/transaction-id.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update episode of care
 */
export async function updateEpisodeOfCare(
    repo: EpisodeOfCareRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateEpisodeOfCareResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const episodeOfCare = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: episodeOfCare,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
