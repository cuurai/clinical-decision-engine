/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetDecisionMetricSnapshotResponse } from "../../types/index.js";
import type { DecisionMetricSnapshotRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get decision metric snapshot by ID
 */
export async function getDecisionMetricSnapshot(
    repo: DecisionMetricSnapshotRepository,
    orgId: string,
    id: string
): Promise<GetDecisionMetricSnapshotResponse> {
  const decisionMetricSnapshot = await repo.findById(orgId, id);
  if (!decisionMetricSnapshot) {
    throw new Error("Not found");
  }

  return {
    data: decisionMetricSnapshot,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
