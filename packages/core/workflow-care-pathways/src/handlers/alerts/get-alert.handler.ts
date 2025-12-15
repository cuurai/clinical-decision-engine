/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetAlertResponse } from "../../types/index.js";
import type { AlertRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get alert by ID
 */
export async function getAlert(
    repo: AlertRepository,
    orgId: string,
    id: string
): Promise<GetAlertResponse> {
  const alert = await repo.findById(orgId, id);
  if (!alert) {
    throw new Error("Not found");
  }

  return {
    data: alert,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
