/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetRoutingRuleResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { RoutingRuleRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";

/**
 * Get routing rule by ID
 */
export async function getRoutingRule(
    repo: RoutingRuleRepository,
    orgId: string,
    id: string
): Promise<GetRoutingRuleResponse> {
  const routingRule = await repo.findById(orgId, id);
  if (!routingRule) {
    throw new Error("Not found");
  }

  return {
    data: routingRule,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
