/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetConditionResponse } from "@cuur-cde/core/patient-clinical-data";
import type { ConditionRepository } from "@cuur-cde/core/patient-clinical-data";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data";

/**
 * Get condition by ID
 */
export async function getCondition(
    repo: ConditionRepository,
    orgId: string,
    id: string
): Promise<GetConditionResponse> {
  const condition = await repo.findById(orgId, id);
  if (!condition) {
    throw new Error("Not found");
  }

  return {
    data: condition,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
