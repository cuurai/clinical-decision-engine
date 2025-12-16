/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetAlertResponse } from "@cuur-cde/core/workflow-care-pathways";
import type { AlertRepository } from "@cuur-cde/core/workflow-care-pathways";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways";

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
