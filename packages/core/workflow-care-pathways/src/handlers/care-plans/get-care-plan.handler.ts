/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetCarePlanResponse } from "../../types/index.js";
import type { CarePlanRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get care plan by ID
 */
export async function getCarePlan(
    repo: CarePlanRepository,
    orgId: string,
    id: string
): Promise<GetCarePlanResponse> {
  const carePlan = await repo.findById(orgId, id);
  if (!carePlan) {
    throw new Error("Not found");
  }

  return {
    data: carePlan,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
