/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetDataExportBatchResponse } from "../../types/index.js";
import type { DataExportBatchRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../utils/transaction-id.js";

/**
 * Get data export batch by ID
 */
export async function getDataExportBatch(
    repo: DataExportBatchRepository,
    orgId: string,
    id: string
): Promise<GetDataExportBatchResponse> {
  const dataExportBatch = await repo.findById(orgId, id);
  if (!dataExportBatch) {
    throw new Error("Not found");
  }

  return {
    data: dataExportBatch,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
