/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetGuidelineResponse } from "../../types/index.js";
import type { GuidelineRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

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
