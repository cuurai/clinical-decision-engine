/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetRuleSetResponse } from "../../types/index.js";
import type { RuleSetRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

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
