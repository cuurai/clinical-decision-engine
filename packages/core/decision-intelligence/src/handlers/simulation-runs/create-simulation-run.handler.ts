/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { CreateSimulationRunResponse } from "../../types/index.js";
import type { SimulationRunRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../../_shared/src/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create simulation run
 */
export async function createSimulationRun(
    repo: SimulationRunRepository,
    orgId: string,
    input: unknown
): Promise<CreateSimulationRunResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const simulationRun = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: simulationRun,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
