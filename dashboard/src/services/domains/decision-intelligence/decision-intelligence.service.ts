import { createResourceService } from "../../core/resource-service";
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
  UpdateModelInvocationInput,
  SimulationRun,
  CreateSimulationRunInput,
  UpdateSimulationRunInput,
  DecisionPolicy,
  CreateDecisionPolicyInput,
  UpdateDecisionPolicyInput,
  Experiment,
  CreateExperimentInput,
  UpdateExperimentInput,
  DecisionMetric,
  CreateDecisionMetricInput,
  UpdateDecisionMetricInput,
} from "./decision-intelligence.types";

// Alert Evaluations Service
export const alertEvaluationsService = createResourceService<
  AlertEvaluation,
  CreateAlertEvaluationInput,
  UpdateAlertEvaluationInput
>("/alert-evaluations");

// Decision Sessions Service
export const decisionSessionsService = createResourceService<
  DecisionSession,
  CreateDecisionSessionInput,
  UpdateDecisionSessionInput
>("/decision-sessions");

// Risk Assessments Service
export const riskAssessmentsService = createResourceService<
  RiskAssessment,
  CreateRiskAssessmentInput,
  UpdateRiskAssessmentInput
>("/risk-assessments");

// Recommendations Service
export const recommendationsService = createResourceService<
  Recommendation,
  CreateRecommendationInput,
  UpdateRecommendationInput
>("/recommendations");

// Model Invocations Service
export const modelInvocationsService = createResourceService<
  ModelInvocation,
  CreateModelInvocationInput,
  UpdateModelInvocationInput
>("/model-invocations");

// Simulation Runs Service
export const simulationRunsService = createResourceService<
  SimulationRun,
  CreateSimulationRunInput,
  UpdateSimulationRunInput
>("/simulation-runs");

// Decision Policies Service
export const decisionPoliciesService = createResourceService<
  DecisionPolicy,
  CreateDecisionPolicyInput,
  UpdateDecisionPolicyInput
>("/decision-policies");

// Experiments Service
export const experimentsService = createResourceService<
  Experiment,
  CreateExperimentInput,
  UpdateExperimentInput
>("/experiments");

// Decision Metrics Service
export const decisionMetricsService = createResourceService<
  DecisionMetric,
  CreateDecisionMetricInput,
  UpdateDecisionMetricInput
>("/decision-metrics");

// Export all services as a namespace
export const decisionIntelligenceServices = {
  alertEvaluations: alertEvaluationsService,
  decisionSessions: decisionSessionsService,
  riskAssessments: riskAssessmentsService,
  recommendations: recommendationsService,
  modelInvocations: modelInvocationsService,
  simulationRuns: simulationRunsService,
  decisionPolicies: decisionPoliciesService,
  experiments: experimentsService,
  decisionMetrics: decisionMetricsService,
};
