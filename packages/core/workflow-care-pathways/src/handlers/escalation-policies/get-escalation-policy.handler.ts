/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetEscalationPolicyResponse } from "../../types/index.js";
import type { EscalationPolicyRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get escalation policy by ID
 */
export async function getEscalationPolicy(
    repo: EscalationPolicyRepository,
    orgId: string,
    id: string
): Promise<GetEscalationPolicyResponse> {
  const escalationPolicy = await repo.findById(orgId, id);
  if (!escalationPolicy) {
    throw new Error("Not found");
  }

  return {
    data: escalationPolicy,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
