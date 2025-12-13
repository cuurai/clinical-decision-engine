/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type {
  ListExternalSystemsParams,
  ListExternalSystemsResponseWrapped,
} from "../../types/index.js";
import type { ExternalSystemRepository } from "../../repositories/index.js";
import { intTransactionId } from "../../../shared/helpers";

/**
 * List external systems
 */
export async function listExternalSystems(
  repo: ExternalSystemRepository,
  orgId: string,
  params?: ListExternalSystemsParams
): Promise<ListExternalSystemsResponseWrapped> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);

  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: result.items,
    meta: {
      correlationId: intTransactionId(),
      timestamp: new Date().toISOString(),
      totalCount: result.total ?? result.items.length,
      pageSize: result.items.length,
      pageNumber: 1,
    },
  };
}
