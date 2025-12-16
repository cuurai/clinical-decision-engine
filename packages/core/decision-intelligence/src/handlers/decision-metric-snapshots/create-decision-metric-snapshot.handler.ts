/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { CreateDecisionMetricSnapshotResponse } from "@cuur-cde/core/decision-intelligence";
import type { DecisionMetricSnapshotRepository } from "@cuur-cde/core/decision-intelligence";
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
 * Create decision metric snapshot (immutable)
 *
 * Creates an immutable decision metric snapshot. Once created, metrics cannot be
 * modified to ensure historical accuracy.
 * 
 */
export async function createDecisionMetricSnapshot(
    repo: DecisionMetricSnapshotRepository,
    orgId: string,
    input: unknown
): Promise<CreateDecisionMetricSnapshotResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const decisionMetricSnapshot = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: decisionMetricSnapshot,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
