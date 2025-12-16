/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetOrderSetTemplateResponse } from "@cuur-cde/core/knowledge-evidence/types";
import type { OrderSetTemplateRepository } from "@cuur-cde/core/knowledge-evidence/repositories";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence/utils/transaction-id";

/**
 * Get order set template by ID
 */
export async function getOrderSetTemplate(
    repo: OrderSetTemplateRepository,
    orgId: string,
    id: string
): Promise<GetOrderSetTemplateResponse> {
  const orderSetTemplate = await repo.findById(orgId, id);
  if (!orderSetTemplate) {
    throw new Error("Not found");
  }

  return {
    data: orderSetTemplate,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
