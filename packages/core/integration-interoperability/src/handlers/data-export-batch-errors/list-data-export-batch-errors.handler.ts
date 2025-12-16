/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { ListDataExportBatchErrorsResponse } from "@cuur-cde/core/integration-interoperability";
import type { DataExportBatchErrorRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";

/**
 * List data export batch errors
 */
export async function listDataExportBatchErrors(
    repo: DataExportBatchErrorRepository,
    orgId: string
): Promise<ListDataExportBatchErrorsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  } as ListDataExportBatchErrorsResponse;

}
