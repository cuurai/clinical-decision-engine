/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetCarePathwayTemplateResponse } from "../../types/index.js";
import type { CarePathwayTemplateRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../utils/transaction-id.js";

/**
 * Get care pathway template by ID
 */
export async function getCarePathwayTemplate(
    repo: CarePathwayTemplateRepository,
    orgId: string,
    id: string
): Promise<GetCarePathwayTemplateResponse> {
  const carePathwayTemplate = await repo.findById(orgId, id);
  if (!carePathwayTemplate) {
    throw new Error("Not found");
  }

  return {
    data: carePathwayTemplate,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
