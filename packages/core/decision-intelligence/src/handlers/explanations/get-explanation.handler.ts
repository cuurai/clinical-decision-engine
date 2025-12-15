/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetExplanationResponse } from "../../types/index.js";
import type { ExplanationRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../../_shared/helpers/id-generator.js";

/**
 * Get explanation by ID
 */
export async function getExplanation(
    repo: ExplanationRepository,
    orgId: string,
    id: string
): Promise<GetExplanationResponse> {
  const explanation = await repo.findById(orgId, id);
  if (!explanation) {
    throw new Error("Not found");
  }

  return {
    data: explanation,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
