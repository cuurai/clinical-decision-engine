/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetHandoffResponse } from "../../types/index.js";
import type { HandoffRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get handoff by ID
 */
export async function getHandoff(
    repo: HandoffRepository,
    orgId: string,
    id: string
): Promise<GetHandoffResponse> {
  const handoff = await repo.findById(orgId, id);
  if (!handoff) {
    throw new Error("Not found");
  }

  return {
    data: handoff,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
