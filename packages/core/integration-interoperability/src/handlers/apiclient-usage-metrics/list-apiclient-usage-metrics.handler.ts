/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { ListAPIClientUsageMetricsResponse } from "@cuur-cde/core/integration-interoperability";
import type { APIClientUsageMetricRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";

/**
 * List API client usage metrics
 */
export async function listAPIClientUsageMetrics(
    repo: APIClientUsageMetricRepository,
    orgId: string
): Promise<ListAPIClientUsageMetricsResponse> {
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
  } as ListAPIClientUsageMetricsResponse;

}
