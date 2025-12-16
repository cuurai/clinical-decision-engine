/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { UpdateSimulationScenarioResponse } from "../../types/index.js"
import type { SimulationScenarioRepository } from "../../repositories/index.js"
import { diTransactionId } from "../../utils/transaction-id.js"
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update simulation scenario
 */
export async function updateSimulationScenario(
    repo: SimulationScenarioRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateSimulationScenarioResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const simulationScenario = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: simulationScenario,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
