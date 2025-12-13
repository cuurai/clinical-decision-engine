/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { ListHLMessageSegmentsResponse } from "../../types/index.js";
import type { HL7MessageSegmentRepository } from "../../repositories/index.js";
import { intTransactionId } from "../../../shared/helpers";

/**
 * List HL7 message segments
 */
export async function listHL7MessageSegments(
    repo: HL7MessageSegmentRepository,
    orgId: string
): Promise<ListHLMessageSegmentsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


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
