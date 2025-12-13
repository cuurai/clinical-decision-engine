/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { ListHLMessageSegmentsResponse } from "../../types/index.js";
import type { HL7MessageSegmentRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../../shared/helpers/id-generator.js";

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
  } as ListHLMessageSegmentsResponse;

}
