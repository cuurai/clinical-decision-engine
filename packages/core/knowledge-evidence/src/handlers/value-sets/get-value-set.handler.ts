/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetValueSetResponse } from "@cuur-cde/core/knowledge-evidence/types";
import type { ValueSetRepository } from "@cuur-cde/core/knowledge-evidence/repositories";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence/utils/transaction-id";

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
