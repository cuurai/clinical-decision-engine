/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { CreateAPICredentialResponse } from "@cuur-cde/core/integration-interoperability/types";
import type { APICredentialRepository } from "@cuur-cde/core/integration-interoperability/repositories";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability/utils/transaction-id";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create API credential
 */
export async function createAPICredential(
    repo: APICredentialRepository,
    orgId: string,
    input: unknown
): Promise<CreateAPICredentialResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const aPICredential = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: aPICredential,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
