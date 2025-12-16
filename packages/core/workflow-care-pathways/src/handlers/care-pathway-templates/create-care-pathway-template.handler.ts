/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { CreateCarePathwayTemplateResponse } from "../../types/index.js";
import type { CarePathwayTemplateRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../utils/transaction-id.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create care pathway template
 */
export async function createCarePathwayTemplate(
    repo: CarePathwayTemplateRepository,
    orgId: string,
    input: unknown
): Promise<CreateCarePathwayTemplateResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const carePathwayTemplate = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: carePathwayTemplate,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
