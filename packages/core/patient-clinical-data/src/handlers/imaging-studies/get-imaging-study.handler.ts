/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetImagingStudyResponse } from "@cuur-cde/core/patient-clinical-data";
import type { ImagingStudyRepository } from "@cuur-cde/core/patient-clinical-data";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data";

/**
 * Get imaging study by ID
 */
export async function getImagingStudy(
    repo: ImagingStudyRepository,
    orgId: string,
    id: string
): Promise<GetImagingStudyResponse> {
  const imagingStudy = await repo.findById(orgId, id);
  if (!imagingStudy) {
    throw new Error("Not found");
  }

  return {
    data: imagingStudy,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
