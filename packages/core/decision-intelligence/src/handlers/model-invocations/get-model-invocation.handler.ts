/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetModelInvocationResponse } from "@cuur-cde/core/decision-intelligence";
import type { ModelInvocationRepository } from "@cuur-cde/core/decision-intelligence";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence";

/**
 * Get model invocation by ID
 */
export async function getModelInvocation(
    repo: ModelInvocationRepository,
    orgId: string,
    id: string
): Promise<GetModelInvocationResponse> {
  const modelInvocation = await repo.findById(orgId, id);
  if (!modelInvocation) {
    throw new Error("Not found");
  }

  return {
    data: modelInvocation,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
