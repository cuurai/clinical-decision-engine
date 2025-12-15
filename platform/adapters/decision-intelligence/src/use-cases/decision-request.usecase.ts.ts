import {
  createDecisionRequest,
  getDecisionRequest,
  listDecisionRequests,
} from "@cuur-cde/core/decision-intelligence/handlers/index.js";

import type { DecisionRequestInput } from "@cuur-cde/core/decision-intelligence/types/index.js";
import type { DecisionRequestRepository } from "@cuur-cde/core/decision-intelligence/repositories/index.js";

export class DecisionRequestUseCase {
  constructor(private readonly decisionRequestRepo: DecisionRequestRepository) {}

  create(orgId: string, input: DecisionRequestInput) {
    return createDecisionRequest(this.decisionRequestRepo, orgId, input);
  }

  get(orgId: string, id: string) {
    return getDecisionRequest(this.decisionRequestRepo, orgId, id);
  }

  list(orgId: string, params?: any) {
    return listDecisionRequests(this.decisionRequestRepo, orgId, params);
  }
}
