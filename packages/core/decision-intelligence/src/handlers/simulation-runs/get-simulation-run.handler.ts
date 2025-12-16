/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetSimulationRunResponse } from "@cuur-cde/core/decision-intelligence/types";
import type { SimulationRunRepository } from "@cuur-cde/core/decision-intelligence/repositories";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence/utils/transaction-id";

/**
 * Get simulation run by ID
 */
export async function getSimulationRun(
    repo: SimulationRunRepository,
    orgId: string,
    id: string
): Promise<GetSimulationRunResponse> {
  const simulationRun = await repo.findById(orgId, id);
  if (!simulationRun) {
    throw new Error("Not found");
  }

  return {
    data: simulationRun,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
