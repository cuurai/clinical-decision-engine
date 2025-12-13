/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { CreateConnectionResponse } from "../../types/index.js";
import type { ConnectionRepository } from "../../repositories/index.js";
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
 * Create connection
 */
export async function createConnection(
    repo: ConnectionRepository,
    orgId: string,
    input: unknown
): Promise<CreateConnectionResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const connection = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: connection,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
