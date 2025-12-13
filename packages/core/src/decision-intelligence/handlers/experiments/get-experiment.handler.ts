/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetExperimentResponse } from "../../types/index.js";
import type { ExperimentRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../shared/helpers/id-generator.js";

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
