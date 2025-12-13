/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { ListDataExportBatchesParams, ListDataExportBatchesResponse } from "../../types/index.js";
import type { DataExportBatchRepository } from "../../repositories/index.js";
import { intTransactionId } from "../../shared/helpers";

/**
 * List data export batches
 */
export async function listDataExportBatches(
    repo: DataExportBatchRepository,
    orgId: string,
    params?: ListDataExportBatchesParams
): Promise<ListDataExportBatchesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: intTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  };

}
