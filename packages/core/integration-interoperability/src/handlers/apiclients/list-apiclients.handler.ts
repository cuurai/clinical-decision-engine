/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { ListAPIClientsParams, ListAPIClientsResponse } from "@cuur-cde/core/integration-interoperability/types";
import type { APIClientRepository } from "@cuur-cde/core/integration-interoperability/repositories";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability/utils/transaction-id";

/**
 * List API clients
 */
export async function listAPIClients(
    repo: APIClientRepository,
    orgId: string,
    params?: ListAPIClientsParams
): Promise<ListAPIClientsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


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
  } as ListAPIClientsResponse;

}
