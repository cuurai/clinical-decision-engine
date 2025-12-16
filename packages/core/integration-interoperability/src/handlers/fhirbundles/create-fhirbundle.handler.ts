/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { CreateFHIRBundleResponse, FHIRBundleInput } from "../../types/index.js";
import type { FHIRBundleRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../utils/transaction-id.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: FHIRBundleInput): FHIRBundleInput {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create FHIR bundle (ingest or send)
 */
export async function createFHIRBundle(
    repo: FHIRBundleRepository,
    orgId: string,
    input: FHIRBundleInput
): Promise<CreateFHIRBundleResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const fHIRBundle = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: fHIRBundle,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
