/**
 * Decision Intelligence Domain Types
 *
 * Auto-generated from OpenAPI spec
 * Generator: types-generator v2.0.0
 *
 * This file re-exports types from generated OpenAPI types and adds
 * convenient type aliases for handlers (response types, etc.)
 *
 * ⚠️ DO NOT EDIT MANUALLY - this file is auto-generated
 */

import type { components, operations } from "@cuur-cde/core/decision-intelligence/openapi/decision-intelligence.openapi.types";

// ============================================================================
// Re-export all generated types
// ============================================================================
// Note: components and operations are exported here but should be accessed via namespace
// in main index.ts to avoid duplicate export errors (e.g., blockchain.types.components)

export type { components, operations };

// ============================================================================
// Convenient Type Aliases for Schemas
// ============================================================================

export type AlertEvaluation = components["schemas"]["AlertEvaluation"];
export type AlertEvaluationInput = components["schemas"]["AlertEvaluationInput"];
export type AlertEvaluationUpdate = components["schemas"]["AlertEvaluationUpdate"];
export type DecisionMetricSnapshot = components["schemas"]["DecisionMetricSnapshot"];
export type DecisionMetricSnapshotInput = components["schemas"]["DecisionMetricSnapshotInput"];
export type DecisionPolicy = components["schemas"]["DecisionPolicy"];
export type DecisionPolicyInput = components["schemas"]["DecisionPolicyInput"];
export type DecisionPolicyUpdate = components["schemas"]["DecisionPolicyUpdate"];
export type DecisionResult = components["schemas"]["DecisionResult"];
export type DecisionResultInput = components["schemas"]["DecisionResultInput"];
export type DecisionResultUpdate = components["schemas"]["DecisionResultUpdate"];
export type DecisionSession = components["schemas"]["DecisionSession"];
export type DecisionSessionInput = components["schemas"]["DecisionSessionInput"];
export type DecisionSessionUpdate = components["schemas"]["DecisionSessionUpdate"];
export type Experiment = components["schemas"]["Experiment"];
export type ExperimentArm = components["schemas"]["ExperimentArm"];
export type ExperimentInput = components["schemas"]["ExperimentInput"];
export type ExperimentResult = components["schemas"]["ExperimentResult"];
export type ExperimentUpdate = components["schemas"]["ExperimentUpdate"];
export type Explanation = components["schemas"]["Explanation"];
export type ExplanationInput = components["schemas"]["ExplanationInput"];
export type FeatureAttribution = components["schemas"]["FeatureAttribution"];
export type ModelInvocation = components["schemas"]["ModelInvocation"];
export type ModelInvocationInput = components["schemas"]["ModelInvocationInput"];
export type Recommendation = components["schemas"]["Recommendation"];
export type RecommendationInput = components["schemas"]["RecommendationInput"];
export type RecommendationUpdate = components["schemas"]["RecommendationUpdate"];
export type RiskAssessment = components["schemas"]["RiskAssessment"];
export type RiskAssessmentInput = components["schemas"]["RiskAssessmentInput"];
export type RiskAssessmentUpdate = components["schemas"]["RiskAssessmentUpdate"];
export type RuleTrace = components["schemas"]["RuleTrace"];
export type SimulationMetric = components["schemas"]["SimulationMetric"];
export type SimulationRun = components["schemas"]["SimulationRun"];
export type SimulationRunInput = components["schemas"]["SimulationRunInput"];
export type SimulationScenario = components["schemas"]["SimulationScenario"];
export type SimulationScenarioInput = components["schemas"]["SimulationScenarioInput"];
export type SimulationScenarioUpdate = components["schemas"]["SimulationScenarioUpdate"];
export type ThresholdProfile = components["schemas"]["ThresholdProfile"];
export type ThresholdProfileInput = components["schemas"]["ThresholdProfileInput"];
export type ThresholdProfileUpdate = components["schemas"]["ThresholdProfileUpdate"];
export type Timestamps = components["schemas"]["Timestamps"];
export type DecisionRequest = components["schemas"]["DecisionRequest"];
export type DecisionRequestInput = components["schemas"]["DecisionRequestInput"];
export type DecisionSessionRequest =
  operations["listDecisionSessionRequests"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionSessionResult =
  operations["listDecisionSessionResults"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionSessionRiskAssessment =
  operations["listDecisionSessionRiskAssessments"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionSessionAlert =
  operations["listDecisionSessionAlerts"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionSessionExplanation =
  operations["listDecisionSessionExplanations"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionRequestResult =
  operations["listDecisionRequestResults"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionRequestExplanation =
  operations["listDecisionRequestExplanations"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionResultRecommendation =
  operations["listDecisionResultRecommendations"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionResultRiskAssessment =
  operations["listDecisionResultRiskAssessments"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionResultExplanation =
  operations["listDecisionResultExplanations"]["responses"]["200"]["content"]["application/json"]["data"];
export type RiskAssessmentExplanation =
  operations["listRiskAssessmentExplanations"]["responses"]["200"]["content"]["application/json"]["data"];
export type RecommendationExplanation =
  operations["listRecommendationExplanations"]["responses"]["200"]["content"]["application/json"]["data"];
export type ExplanationFeature =
  operations["listExplanationFeatures"]["responses"]["200"]["content"]["application/json"]["data"];
export type ExplanationRuleTrace =
  operations["listExplanationRuleTraces"]["responses"]["200"]["content"]["application/json"]["data"];
export type ModelInvocationExplanation =
  operations["listModelInvocationExplanations"]["responses"]["200"]["content"]["application/json"]["data"];
export type SimulationScenarioRun =
  operations["listSimulationScenarioRuns"]["responses"]["200"]["content"]["application/json"]["data"];
export type SimulationRunDecisionResult =
  operations["listSimulationRunDecisionResults"]["responses"]["200"]["content"]["application/json"]["data"];
export type SimulationRunMetric =
  operations["listSimulationRunMetrics"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionPolicyThresholdProfile =
  operations["listDecisionPolicyThresholdProfiles"]["responses"]["200"]["content"]["application/json"]["data"];
export type DecisionMetric =
  operations["listDecisionMetrics"]["responses"]["200"]["content"]["application/json"]["data"];

// ============================================================================
// Operation Input Types (Request Bodies)
// ============================================================================

// These types represent the input data for create/update operations

export type CreateDecisionSessionInput = NonNullable<
  operations["createDecisionSession"]["requestBody"]
>["content"]["application/json"];
export type UpdateDecisionSessionInput = NonNullable<
  operations["updateDecisionSession"]["requestBody"]
>["content"]["application/json"];
export type CreateDecisionRequestInput = NonNullable<
  operations["createDecisionRequest"]["requestBody"]
>["content"]["application/json"];
export type CreateDecisionResultInput = NonNullable<
  operations["createDecisionResult"]["requestBody"]
>["content"]["application/json"];
export type UpdateDecisionResultInput = NonNullable<
  operations["updateDecisionResult"]["requestBody"]
>["content"]["application/json"];
export type CreateRiskAssessmentInput = NonNullable<
  operations["createRiskAssessment"]["requestBody"]
>["content"]["application/json"];
export type UpdateRiskAssessmentInput = NonNullable<
  operations["updateRiskAssessment"]["requestBody"]
>["content"]["application/json"];
export type CreateRecommendationInput = NonNullable<
  operations["createRecommendation"]["requestBody"]
>["content"]["application/json"];
export type UpdateRecommendationInput = NonNullable<
  operations["updateRecommendation"]["requestBody"]
>["content"]["application/json"];
export type CreateAlertEvaluationInput = NonNullable<
  operations["createAlertEvaluation"]["requestBody"]
>["content"]["application/json"];
export type UpdateAlertEvaluationInput = NonNullable<
  operations["updateAlertEvaluation"]["requestBody"]
>["content"]["application/json"];
export type CreateExplanationInput = NonNullable<
  operations["createExplanation"]["requestBody"]
>["content"]["application/json"];
export type CreateModelInvocationInput = NonNullable<
  operations["createModelInvocation"]["requestBody"]
>["content"]["application/json"];
export type CreateSimulationScenarioInput = NonNullable<
  operations["createSimulationScenario"]["requestBody"]
>["content"]["application/json"];
export type UpdateSimulationScenarioInput = NonNullable<
  operations["updateSimulationScenario"]["requestBody"]
>["content"]["application/json"];
export type CreateSimulationRunInput = NonNullable<
  operations["createSimulationRun"]["requestBody"]
>["content"]["application/json"];
export type CreateDecisionPolicyInput = NonNullable<
  operations["createDecisionPolicy"]["requestBody"]
>["content"]["application/json"];
export type UpdateDecisionPolicyInput = NonNullable<
  operations["updateDecisionPolicy"]["requestBody"]
>["content"]["application/json"];
export type CreateThresholdProfileInput = NonNullable<
  operations["createThresholdProfile"]["requestBody"]
>["content"]["application/json"];
export type UpdateThresholdProfileInput = NonNullable<
  operations["updateThresholdProfile"]["requestBody"]
>["content"]["application/json"];
export type CreateDecisionMetricSnapshotInput = NonNullable<
  operations["createDecisionMetricSnapshot"]["requestBody"]
>["content"]["application/json"];
export type CreateExperimentInput = NonNullable<
  operations["createExperiment"]["requestBody"]
>["content"]["application/json"];
export type UpdateExperimentInput = NonNullable<
  operations["updateExperiment"]["requestBody"]
>["content"]["application/json"];

// ============================================================================
// Type Aliases for Repository Interfaces (Update*Request → Update*Input)
// ============================================================================

// These aliases provide backward compatibility for repository interfaces
// that use Update*Request naming convention instead of Update*Input

export type UpdateAlertEvaluationRequest = UpdateAlertEvaluationInput;
export type UpdateDecisionPolicyRequest = UpdateDecisionPolicyInput;
export type UpdateDecisionResultRequest = UpdateDecisionResultInput;
export type UpdateDecisionSessionRequest = UpdateDecisionSessionInput;
export type UpdateExperimentRequest = UpdateExperimentInput;
export type UpdateRecommendationRequest = UpdateRecommendationInput;
export type UpdateRiskAssessmentRequest = UpdateRiskAssessmentInput;
export type UpdateSimulationScenarioRequest = UpdateSimulationScenarioInput;
export type UpdateThresholdProfileRequest = UpdateThresholdProfileInput;

// ============================================================================
// Operation Parameter Types (Query Parameters)
// ============================================================================

// These types represent query parameters for list/search operations

export type ListDecisionSessionsParams = operations["listDecisionSessions"]["parameters"]["query"];
export type ListDecisionRequestsParams = operations["listDecisionRequests"]["parameters"]["query"];
export type ListDecisionResultsParams = operations["listDecisionResults"]["parameters"]["query"];
export type ListRiskAssessmentsParams = operations["listRiskAssessments"]["parameters"]["query"];
export type ListRecommendationsParams = operations["listRecommendations"]["parameters"]["query"];
export type ListAlertEvaluationsParams = operations["listAlertEvaluations"]["parameters"]["query"];
export type ListExplanationsParams = operations["listExplanations"]["parameters"]["query"];
export type ListModelInvocationsParams = operations["listModelInvocations"]["parameters"]["query"];
export type ListSimulationScenariosParams =
  operations["listSimulationScenarios"]["parameters"]["query"];
export type ListSimulationRunsParams = operations["listSimulationRuns"]["parameters"]["query"];
export type ListDecisionPoliciesParams = operations["listDecisionPolicies"]["parameters"]["query"];
export type ListThresholdProfilesParams =
  operations["listThresholdProfiles"]["parameters"]["query"];
export type ListDecisionMetricsParams = operations["listDecisionMetrics"]["parameters"]["query"];
export type ListExperimentsParams = operations["listExperiments"]["parameters"]["query"];

// ============================================================================
// Operation Response Types
// ============================================================================

// These types are used by handlers for type-safe response envelopes

export type ListDecisionSessionsResponse =
  operations["listDecisionSessions"]["responses"]["200"]["content"]["application/json"];
export type CreateDecisionSessionResponse =
  operations["createDecisionSession"]["responses"]["201"]["content"]["application/json"];
export type GetDecisionSessionResponse =
  operations["getDecisionSession"]["responses"]["200"]["content"]["application/json"];
export type UpdateDecisionSessionResponse =
  operations["updateDecisionSession"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionSessionRequestsResponse =
  operations["listDecisionSessionRequests"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionSessionResultsResponse =
  operations["listDecisionSessionResults"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionSessionRiskAssessmentsResponse =
  operations["listDecisionSessionRiskAssessments"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionSessionAlertsResponse =
  operations["listDecisionSessionAlerts"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionSessionExplanationsResponse =
  operations["listDecisionSessionExplanations"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionRequestsResponse =
  operations["listDecisionRequests"]["responses"]["200"]["content"]["application/json"];
export type CreateDecisionRequestResponse =
  operations["createDecisionRequest"]["responses"]["201"]["content"]["application/json"];
export type GetDecisionRequestResponse =
  operations["getDecisionRequest"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionRequestResultsResponse =
  operations["listDecisionRequestResults"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionRequestExplanationsResponse =
  operations["listDecisionRequestExplanations"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionResultsResponse =
  operations["listDecisionResults"]["responses"]["200"]["content"]["application/json"];
export type CreateDecisionResultResponse =
  operations["createDecisionResult"]["responses"]["201"]["content"]["application/json"];
export type GetDecisionResultResponse =
  operations["getDecisionResult"]["responses"]["200"]["content"]["application/json"];
export type UpdateDecisionResultResponse =
  operations["updateDecisionResult"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionResultRecommendationsResponse =
  operations["listDecisionResultRecommendations"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionResultRiskAssessmentsResponse =
  operations["listDecisionResultRiskAssessments"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionResultExplanationsResponse =
  operations["listDecisionResultExplanations"]["responses"]["200"]["content"]["application/json"];
export type ListRiskAssessmentsResponse =
  operations["listRiskAssessments"]["responses"]["200"]["content"]["application/json"];
export type CreateRiskAssessmentResponse =
  operations["createRiskAssessment"]["responses"]["201"]["content"]["application/json"];
export type GetRiskAssessmentResponse =
  operations["getRiskAssessment"]["responses"]["200"]["content"]["application/json"];
export type UpdateRiskAssessmentResponse =
  operations["updateRiskAssessment"]["responses"]["200"]["content"]["application/json"];
export type ListRiskAssessmentExplanationsResponse =
  operations["listRiskAssessmentExplanations"]["responses"]["200"]["content"]["application/json"];
export type ListRecommendationsResponse =
  operations["listRecommendations"]["responses"]["200"]["content"]["application/json"];
export type CreateRecommendationResponse =
  operations["createRecommendation"]["responses"]["201"]["content"]["application/json"];
export type GetRecommendationResponse =
  operations["getRecommendation"]["responses"]["200"]["content"]["application/json"];
export type UpdateRecommendationResponse =
  operations["updateRecommendation"]["responses"]["200"]["content"]["application/json"];
export type ListRecommendationExplanationsResponse =
  operations["listRecommendationExplanations"]["responses"]["200"]["content"]["application/json"];
export type ListAlertEvaluationsResponse =
  operations["listAlertEvaluations"]["responses"]["200"]["content"]["application/json"];
export type CreateAlertEvaluationResponse =
  operations["createAlertEvaluation"]["responses"]["201"]["content"]["application/json"];
export type GetAlertEvaluationResponse =
  operations["getAlertEvaluation"]["responses"]["200"]["content"]["application/json"];
export type UpdateAlertEvaluationResponse =
  operations["updateAlertEvaluation"]["responses"]["200"]["content"]["application/json"];
export type ListExplanationsResponse =
  operations["listExplanations"]["responses"]["200"]["content"]["application/json"];
export type CreateExplanationResponse =
  operations["createExplanation"]["responses"]["201"]["content"]["application/json"];
export type GetExplanationResponse =
  operations["getExplanation"]["responses"]["200"]["content"]["application/json"];
export type ListExplanationFeaturesResponse =
  operations["listExplanationFeatures"]["responses"]["200"]["content"]["application/json"];
export type ListExplanationRuleTracesResponse =
  operations["listExplanationRuleTraces"]["responses"]["200"]["content"]["application/json"];
export type ListModelInvocationsResponse =
  operations["listModelInvocations"]["responses"]["200"]["content"]["application/json"];
export type CreateModelInvocationResponse =
  operations["createModelInvocation"]["responses"]["201"]["content"]["application/json"];
export type GetModelInvocationResponse =
  operations["getModelInvocation"]["responses"]["200"]["content"]["application/json"];
export type ListModelInvocationExplanationsResponse =
  operations["listModelInvocationExplanations"]["responses"]["200"]["content"]["application/json"];
export type ListSimulationScenariosResponse =
  operations["listSimulationScenarios"]["responses"]["200"]["content"]["application/json"];
export type CreateSimulationScenarioResponse =
  operations["createSimulationScenario"]["responses"]["201"]["content"]["application/json"];
export type GetSimulationScenarioResponse =
  operations["getSimulationScenario"]["responses"]["200"]["content"]["application/json"];
export type UpdateSimulationScenarioResponse =
  operations["updateSimulationScenario"]["responses"]["200"]["content"]["application/json"];
export type ListSimulationScenarioRunsResponse =
  operations["listSimulationScenarioRuns"]["responses"]["200"]["content"]["application/json"];
export type ListSimulationRunsResponse =
  operations["listSimulationRuns"]["responses"]["200"]["content"]["application/json"];
export type CreateSimulationRunResponse =
  operations["createSimulationRun"]["responses"]["201"]["content"]["application/json"];
export type GetSimulationRunResponse =
  operations["getSimulationRun"]["responses"]["200"]["content"]["application/json"];
export type ListSimulationRunDecisionResultsResponse =
  operations["listSimulationRunDecisionResults"]["responses"]["200"]["content"]["application/json"];
export type ListSimulationRunMetricsResponse =
  operations["listSimulationRunMetrics"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionPoliciesResponse =
  operations["listDecisionPolicies"]["responses"]["200"]["content"]["application/json"];
export type CreateDecisionPolicyResponse =
  operations["createDecisionPolicy"]["responses"]["201"]["content"]["application/json"];
export type GetDecisionPolicyResponse =
  operations["getDecisionPolicy"]["responses"]["200"]["content"]["application/json"];
export type UpdateDecisionPolicyResponse =
  operations["updateDecisionPolicy"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionPolicyThresholdProfilesResponse =
  operations["listDecisionPolicyThresholdProfiles"]["responses"]["200"]["content"]["application/json"];
export type ListThresholdProfilesResponse =
  operations["listThresholdProfiles"]["responses"]["200"]["content"]["application/json"];
export type CreateThresholdProfileResponse =
  operations["createThresholdProfile"]["responses"]["201"]["content"]["application/json"];
export type GetThresholdProfileResponse =
  operations["getThresholdProfile"]["responses"]["200"]["content"]["application/json"];
export type UpdateThresholdProfileResponse =
  operations["updateThresholdProfile"]["responses"]["200"]["content"]["application/json"];
export type ListDecisionMetricsResponse =
  operations["listDecisionMetrics"]["responses"]["200"]["content"]["application/json"];
export type CreateDecisionMetricSnapshotResponse =
  operations["createDecisionMetricSnapshot"]["responses"]["201"]["content"]["application/json"];
export type GetDecisionMetricSnapshotResponse =
  operations["getDecisionMetricSnapshot"]["responses"]["200"]["content"]["application/json"];
export type ListExperimentsResponse =
  operations["listExperiments"]["responses"]["200"]["content"]["application/json"];
export type CreateExperimentResponse =
  operations["createExperiment"]["responses"]["201"]["content"]["application/json"];
export type GetExperimentResponse =
  operations["getExperiment"]["responses"]["200"]["content"]["application/json"];
export type UpdateExperimentResponse =
  operations["updateExperiment"]["responses"]["200"]["content"]["application/json"];
export type ListExperimentArmsResponse =
  operations["listExperimentArms"]["responses"]["200"]["content"]["application/json"];
export type ListExperimentResultsResponse =
  operations["listExperimentResults"]["responses"]["200"]["content"]["application/json"];
