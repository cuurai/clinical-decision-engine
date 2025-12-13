/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { CreateOrderSetTemplateResponse } from "../../types/index.js";
import type { OrderSetTemplateRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../../shared/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create order set template
 */
export async function createOrderSetTemplate(
    repo: OrderSetTemplateRepository,
    orgId: string,
    input: unknown
): Promise<CreateOrderSetTemplateResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const orderSetTemplate = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: orderSetTemplate,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
