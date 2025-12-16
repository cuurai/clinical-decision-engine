/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetEpisodeOfCareResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { EpisodeOfCareRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";

/**
 * Get episode of care by ID
 */
export async function getEpisodeOfCare(
    repo: EpisodeOfCareRepository,
    orgId: string,
    id: string
): Promise<GetEpisodeOfCareResponse> {
  const episodeOfCare = await repo.findById(orgId, id);
  if (!episodeOfCare) {
    throw new Error("Not found");
  }

  return {
    data: episodeOfCare,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
