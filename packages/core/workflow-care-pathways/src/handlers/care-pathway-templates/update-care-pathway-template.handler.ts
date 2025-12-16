/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { UpdateCarePathwayTemplateResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { CarePathwayTemplateRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update care pathway template
 */
export async function updateCarePathwayTemplate(
    repo: CarePathwayTemplateRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateCarePathwayTemplateResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const carePathwayTemplate = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: carePathwayTemplate,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
