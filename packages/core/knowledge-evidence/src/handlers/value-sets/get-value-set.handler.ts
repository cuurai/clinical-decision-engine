/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetValueSetResponse } from "../../types/index.js";
import type { ValueSetRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../utils/transaction-id.js";

/**
 * Get value set by ID
 */
export async function getValueSet(
    repo: ValueSetRepository,
    orgId: string,
    id: string
): Promise<GetValueSetResponse> {
  const valueSet = await repo.findById(orgId, id);
  if (!valueSet) {
    throw new Error("Not found");
  }

  return {
    data: valueSet,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
