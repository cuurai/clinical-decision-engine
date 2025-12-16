/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { ListImagingStudySeriesResponse } from "@cuur-cde/core/patient-clinical-data/types";
import type { ImagingStudySeriesRepository } from "@cuur-cde/core/patient-clinical-data/repositories";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data/utils/transaction-id";

/**
 * List imaging study series
 */
export async function listImagingStudySeries(
    repo: ImagingStudySeriesRepository,
    orgId: string
): Promise<ListImagingStudySeriesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  } as ListImagingStudySeriesResponse;

}
