/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { CreateHLMessageResponse } from "../../types/index.js";
import type { HL7MessageRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../../shared/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create HL7 message (ingest)
 */
export async function createHL7Message(
    repo: HL7MessageRepository,
    orgId: string,
    input: unknown
): Promise<CreateHLMessageResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const hLMessage = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: hLMessage,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
