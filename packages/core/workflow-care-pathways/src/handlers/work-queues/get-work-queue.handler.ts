/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetWorkQueueResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { WorkQueueRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";

/**
 * Get work queue by ID
 */
export async function getWorkQueue(
    repo: WorkQueueRepository,
    orgId: string,
    id: string
): Promise<GetWorkQueueResponse> {
  const workQueue = await repo.findById(orgId, id);
  if (!workQueue) {
    throw new Error("Not found");
  }

  return {
    data: workQueue,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
