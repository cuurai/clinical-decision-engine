/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetModelDefinitionResponse } from "../../types/index.js";
import type { ModelDefinitionRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../utils/transaction-id.js";

/**
 * Get model definition by ID
 */
export async function getModelDefinition(
    repo: ModelDefinitionRepository,
    orgId: string,
    id: string
): Promise<GetModelDefinitionResponse> {
  const modelDefinition = await repo.findById(orgId, id);
  if (!modelDefinition) {
    throw new Error("Not found");
  }

  return {
    data: modelDefinition,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
