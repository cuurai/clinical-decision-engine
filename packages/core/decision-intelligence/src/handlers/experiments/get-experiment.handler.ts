/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetExperimentResponse } from "@cuur-cde/core/decision-intelligence";
import type { ExperimentRepository } from "@cuur-cde/core/decision-intelligence";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence";

/**
 * Get experiment by ID
 */
export async function getExperiment(
    repo: ExperimentRepository,
    orgId: string,
    id: string
): Promise<GetExperimentResponse> {
  const experiment = await repo.findById(orgId, id);
  if (!experiment) {
    throw new Error("Not found");
  }

  return {
    data: experiment,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
