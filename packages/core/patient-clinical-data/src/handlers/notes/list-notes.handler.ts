/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { ListNotesParams, ListNotesResponse } from "../../types/index.js";
import type { NoteRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

/**
 * List clinical notes
 */
export async function listNotes(
    repo: NoteRepository,
    orgId: string,
    params?: ListNotesParams
): Promise<ListNotesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


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
  } as ListNotesResponse;

}
