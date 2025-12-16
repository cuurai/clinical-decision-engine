/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetScheduleTemplateResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { ScheduleTemplateRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";

/**
 * Get schedule template by ID
 */
export async function getScheduleTemplate(
    repo: ScheduleTemplateRepository,
    orgId: string,
    id: string
): Promise<GetScheduleTemplateResponse> {
  const scheduleTemplate = await repo.findById(orgId, id);
  if (!scheduleTemplate) {
    throw new Error("Not found");
  }

  return {
    data: scheduleTemplate,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
