/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { ListHLMappingProfilesParams, ListHLMappingProfilesResponse } from "../../types/index.js";
import type { HL7MappingProfileRepository } from "../../repositories/index.js";
import { intTransactionId } from "../../../shared/helpers";

/**
 * List HL7 mapping profiles
 */
export async function listHL7MappingProfiles(
    repo: HL7MappingProfileRepository,
    orgId: string,
    params?: ListHLMappingProfilesParams
): Promise<ListHLMappingProfilesResponse> {
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
