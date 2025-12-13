/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { ConditionRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../shared/helpers";

/**
 * Delete condition
 */
export async function deleteCondition(
    repo: ConditionRepository,
    orgId: string,
    id: string
): Promise<any> {
  await repo.delete(orgId, id);
  // For 204 No Content responses, return void (no response body)
  // For 200 OK responses, return success response
  return {
    data: { success: true },
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
