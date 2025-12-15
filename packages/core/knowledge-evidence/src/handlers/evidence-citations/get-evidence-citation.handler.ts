/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetEvidenceCitationResponse } from "../../types/index.js";
import type { EvidenceCitationRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

/**
 * Get evidence citation by ID
 */
export async function getEvidenceCitation(
    repo: EvidenceCitationRepository,
    orgId: string,
    id: string
): Promise<GetEvidenceCitationResponse> {
  const evidenceCitation = await repo.findById(orgId, id);
  if (!evidenceCitation) {
    throw new Error("Not found");
  }

  return {
    data: evidenceCitation,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
