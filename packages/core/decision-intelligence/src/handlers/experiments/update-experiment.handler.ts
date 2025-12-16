/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { UpdateExperimentResponse } from "@cuur-cde/core/decision-intelligence";
import type { ExperimentRepository } from "@cuur-cde/core/decision-intelligence";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update experiment
 */
export async function updateExperiment(
    repo: ExperimentRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateExperimentResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const experiment = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: experiment,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
