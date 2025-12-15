/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetSimulationScenarioResponse } from "../../types/index.js";
import type { SimulationScenarioRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

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
