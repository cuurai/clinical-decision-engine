/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetCareTeamResponse } from "../../types/index.js";
import type { CareTeamRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

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
