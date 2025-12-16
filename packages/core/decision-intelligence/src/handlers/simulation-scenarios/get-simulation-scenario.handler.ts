/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetSimulationScenarioResponse } from "@cuur-cde/core/decision-intelligence";
import type { SimulationScenarioRepository } from "@cuur-cde/core/decision-intelligence";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence";

/**
 * Get simulation scenario by ID
 */
export async function getSimulationScenario(
    repo: SimulationScenarioRepository,
    orgId: string,
    id: string
): Promise<GetSimulationScenarioResponse> {
  const simulationScenario = await repo.findById(orgId, id);
  if (!simulationScenario) {
    throw new Error("Not found");
  }

  return {
    data: simulationScenario,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
