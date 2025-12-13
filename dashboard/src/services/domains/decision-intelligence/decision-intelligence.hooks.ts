import { useResourceHook } from "../../core/use-resource";
import { decisionIntelligenceServices } from "./decision-intelligence.service";
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
  AlertEvaluationListParams,
  DecisionSessionListParams,
  RiskAssessmentListParams,
  RecommendationListParams,
  ModelInvocationListParams,
  SimulationRunListParams,
  DecisionPolicyListParams,
  ExperimentListParams,
  DecisionMetricListParams,
} from "./decision-intelligence.types";


// Alert Evaluations Hook
export function useAlertEvaluations(
  autoFetch = true,
  params?: AlertEvaluationListParams
) {
  return useResourceHook<
    AlertEvaluation,
    CreateAlertEvaluationInput,
    UpdateAlertEvaluationInput,
    AlertEvaluationListParams
  >(decisionIntelligenceServices.alertEvaluations, autoFetch, params);
}

// Decision Sessions Hook
export function useDecisionSessions(
  autoFetch = true,
  params?: DecisionSessionListParams
) {
  return useResourceHook<
    DecisionSession,
    CreateDecisionSessionInput,
    UpdateDecisionSessionInput,
    DecisionSessionListParams
  >(decisionIntelligenceServices.decisionSessions, autoFetch, params);
}

// Risk Assessments Hook
export function useRiskAssessments(
  autoFetch = true,
  params?: RiskAssessmentListParams
) {
  return useResourceHook<
    RiskAssessment,
    CreateRiskAssessmentInput,
    UpdateRiskAssessmentInput,
    RiskAssessmentListParams
  >(decisionIntelligenceServices.riskAssessments, autoFetch, params);
}

// Recommendations Hook
export function useRecommendations(
  autoFetch = true,
  params?: RecommendationListParams
) {
  return useResourceHook<
    Recommendation,
    CreateRecommendationInput,
    UpdateRecommendationInput,
    RecommendationListParams
  >(decisionIntelligenceServices.recommendations, autoFetch, params);
}

// Model Invocations Hook
export function useModelInvocations(
  autoFetch = true,
  params?: ModelInvocationListParams
) {
  return useResourceHook<
    ModelInvocation,
    CreateModelInvocationInput,
    UpdateModelInvocationInput,
    ModelInvocationListParams
  >(decisionIntelligenceServices.modelInvocations, autoFetch, params);
}

// Simulation Runs Hook
export function useSimulationRuns(
  autoFetch = true,
  params?: SimulationRunListParams
) {
  return useResourceHook<
    SimulationRun,
    CreateSimulationRunInput,
    UpdateSimulationRunInput,
    SimulationRunListParams
  >(decisionIntelligenceServices.simulationRuns, autoFetch, params);
}

// Decision Policies Hook
export function useDecisionPolicies(
  autoFetch = true,
  params?: DecisionPolicyListParams
) {
  return useResourceHook<
    DecisionPolicy,
    CreateDecisionPolicyInput,
    UpdateDecisionPolicyInput,
    DecisionPolicyListParams
  >(decisionIntelligenceServices.decisionPolicies, autoFetch, params);
}

// Experiments Hook
export function useExperiments(
  autoFetch = true,
  params?: ExperimentListParams
) {
  return useResourceHook<
    Experiment,
    CreateExperimentInput,
    UpdateExperimentInput,
    ExperimentListParams
  >(decisionIntelligenceServices.experiments, autoFetch, params);
}

// Decision Metrics Hook
export function useDecisionMetrics(
  autoFetch = true,
  params?: DecisionMetricListParams
) {
  return useResourceHook<
    DecisionMetric,
    CreateDecisionMetricInput,
    UpdateDecisionMetricInput,
    DecisionMetricListParams
  >(decisionIntelligenceServices.decisionMetrics, autoFetch, params);
}
