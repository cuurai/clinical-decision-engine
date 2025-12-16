/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetCareTeamResponse } from "@cuur-cde/core/patient-clinical-data";
import type { CareTeamRepository } from "@cuur-cde/core/patient-clinical-data";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data";

/**
 * Get care team by ID
 */
export async function getCareTeam(
    repo: CareTeamRepository,
    orgId: string,
    id: string
): Promise<GetCareTeamResponse> {
  const careTeam = await repo.findById(orgId, id);
  if (!careTeam) {
    throw new Error("Not found");
  }

  return {
    data: careTeam,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
