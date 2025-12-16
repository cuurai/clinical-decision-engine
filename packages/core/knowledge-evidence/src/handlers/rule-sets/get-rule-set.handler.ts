/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetRuleSetResponse } from "@cuur-cde/core/knowledge-evidence";
import type { RuleSetRepository } from "@cuur-cde/core/knowledge-evidence";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence";

/**
 * Get rule set by ID
 */
export async function getRuleSet(
    repo: RuleSetRepository,
    orgId: string,
    id: string
): Promise<GetRuleSetResponse> {
  const ruleSet = await repo.findById(orgId, id);
  if (!ruleSet) {
    throw new Error("Not found");
  }

  return {
    data: ruleSet,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
