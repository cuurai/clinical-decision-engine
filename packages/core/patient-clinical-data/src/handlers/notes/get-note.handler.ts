/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetNoteResponse } from "@cuur-cde/core/patient-clinical-data";
import type { NoteRepository } from "@cuur-cde/core/patient-clinical-data";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data";

/**
 * Get clinical note by ID
 */
export async function getNote(
    repo: NoteRepository,
    orgId: string,
    id: string
): Promise<GetNoteResponse> {
  const note = await repo.findById(orgId, id);
  if (!note) {
    throw new Error("Not found");
  }

  return {
    data: note,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
