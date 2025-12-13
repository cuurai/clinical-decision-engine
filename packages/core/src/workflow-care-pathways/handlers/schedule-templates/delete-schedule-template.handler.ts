/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { ScheduleTemplateRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers";

/**
 * Delete schedule template
 */
export async function deleteScheduleTemplate(
    repo: ScheduleTemplateRepository,
    orgId: string,
    id: string
): Promise<any> {
  await repo.delete(orgId, id);
  // For 204 No Content responses, return void (no response body)
  // For 200 OK responses, return success response
  return {
    data: { success: true },
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
