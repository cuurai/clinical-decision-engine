/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { ListRuleSetClinicalRulesResponse } from "../../types/index.js";
import type { RuleSetClinicalRuleRepository } from "../../repositories/index.js";
import { knoTransactionId } from "../../../shared/helpers";

/**
 * List rule set clinical rules
 */
export async function listRuleSetClinicalRules(
    repo: RuleSetClinicalRuleRepository,
    orgId: string
): Promise<ListRuleSetClinicalRulesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: knoTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  };

}
