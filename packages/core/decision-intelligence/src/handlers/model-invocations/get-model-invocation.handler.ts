/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetModelInvocationResponse } from "../../types/index.js";
import type { ModelInvocationRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../../_shared/helpers/id-generator.js";

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
