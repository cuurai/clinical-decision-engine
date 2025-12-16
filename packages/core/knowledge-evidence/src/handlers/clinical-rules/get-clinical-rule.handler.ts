/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetClinicalRuleResponse } from "@cuur-cde/core/knowledge-evidence/types";
import type { ClinicalRuleRepository } from "@cuur-cde/core/knowledge-evidence/repositories";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence/utils/transaction-id";

/**
 * Get clinical rule by ID
 */
export async function getClinicalRule(
    repo: ClinicalRuleRepository,
    orgId: string,
    id: string
): Promise<GetClinicalRuleResponse> {
  const clinicalRule = await repo.findById(orgId, id);
  if (!clinicalRule) {
    throw new Error("Not found");
  }

  return {
    data: clinicalRule,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
