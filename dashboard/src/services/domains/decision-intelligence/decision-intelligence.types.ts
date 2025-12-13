import { ListParams, ListResponse } from "../../core/resource-service";
import type {
  AlertEvaluation,
  CreateAlertEvaluationInput,
  UpdateAlertEvaluationInput,
  DecisionSession,
  CreateDecisionSessionInput,
  UpdateDecisionSessionInput,
  RiskAssessment,
  CreateRiskAssessmentInput,
  UpdateRiskAssessmentInput,
  Recommendation,
  CreateRecommendationInput,
  UpdateRecommendationInput,
  ModelInvocation,
  CreateModelInvocationInput,
  SimulationRun,
  CreateSimulationRunInput,
  DecisionPolicy,
  CreateDecisionPolicyInput,
  UpdateDecisionPolicyInput,
  Experiment,
  CreateExperimentInput,
  UpdateExperimentInput,
  DecisionMetric,
  ListAlertEvaluationsParams,
  ListDecisionSessionsParams,
  ListRiskAssessmentsParams,
  ListRecommendationsParams,
  ListModelInvocationsParams,
  ListSimulationRunsParams,
  ListDecisionPoliciesParams,
  ListExperimentsParams,
  ListDecisionMetricsParams,
} from "@cuur/core/decision-intelligence/types";

// Re-export types from core
export type {
  AlertEvaluation,
  CreateAlertEvaluationInput,
  UpdateAlertEvaluationInput,
  DecisionSession,
  CreateDecisionSessionInput,
  UpdateDecisionSessionInput,
  RiskAssessment,
  CreateRiskAssessmentInput,
  UpdateRiskAssessmentInput,
  Recommendation,
  CreateRecommendationInput,
  UpdateRecommendationInput,
  ModelInvocation,
  CreateModelInvocationInput,
  SimulationRun,
  CreateSimulationRunInput,
  DecisionPolicy,
  CreateDecisionPolicyInput,
  UpdateDecisionPolicyInput,
  Experiment,
  CreateExperimentInput,
  UpdateExperimentInput,
  DecisionMetric,
};

// Update input types - using Update types from core where available
export type UpdateModelInvocationInput = Partial<ModelInvocation>;
export type UpdateSimulationRunInput = Partial<SimulationRun>;
export type CreateDecisionMetricInput = Partial<DecisionMetric>;
export type UpdateDecisionMetricInput = Partial<DecisionMetric>;

// Export list params and response types
export type AlertEvaluationListParams = ListAlertEvaluationsParams & ListParams;
export type AlertEvaluationListResponse = ListResponse<AlertEvaluation>;
export type DecisionSessionListParams = ListDecisionSessionsParams & ListParams;
export type DecisionSessionListResponse = ListResponse<DecisionSession>;
export type RiskAssessmentListParams = ListRiskAssessmentsParams & ListParams;
export type RiskAssessmentListResponse = ListResponse<RiskAssessment>;
export type RecommendationListParams = ListRecommendationsParams & ListParams;
export type RecommendationListResponse = ListResponse<Recommendation>;
export type ModelInvocationListParams = ListModelInvocationsParams & ListParams;
export type ModelInvocationListResponse = ListResponse<ModelInvocation>;
export type SimulationRunListParams = ListSimulationRunsParams & ListParams;
export type SimulationRunListResponse = ListResponse<SimulationRun>;
export type DecisionPolicyListParams = ListDecisionPoliciesParams & ListParams;
export type DecisionPolicyListResponse = ListResponse<DecisionPolicy>;
export type ExperimentListParams = ListExperimentsParams & ListParams;
export type ExperimentListResponse = ListResponse<Experiment>;
export type DecisionMetricListParams = ListDecisionMetricsParams & ListParams;
export type DecisionMetricListResponse = ListResponse<DecisionMetric>;
