/**
 * Decision Intelligence Domain Converters
 *
 * Thin wrappers around centralized converters (packages/core/src/shared/helpers/core-converters.ts)
 * Converts between domain types (with Date objects) and API types (with ISO strings)
 *
 * Naming convention: {entity}ToApi (camelCase)
 */

import { ConverterPresets } from "@cuur-cde/core/_shared";
import type {
  AlertEvaluationInput,
  AlertEvaluationUpdate,
  DecisionMetricSnapshotInput,
  DecisionPolicyInput,
  DecisionPolicyUpdate,
  DecisionResultInput,
  DecisionResultUpdate,
  DecisionSessionInput,
  DecisionSessionUpdate,
  ExperimentArm,
  ExperimentInput,
  ExperimentResult,
  ExperimentUpdate,
  ExplanationInput,
  FeatureAttribution,
  ModelInvocationInput,
  RecommendationInput,
  RecommendationUpdate,
  RiskAssessmentInput,
  RiskAssessmentUpdate,
  RuleTrace,
  SimulationMetric,
  SimulationRunInput,
  SimulationScenarioInput,
  SimulationScenarioUpdate,
  ThresholdProfileInput,
  ThresholdProfileUpdate,
  Timestamps,
} from "@cuur-cde/core/decision-intelligence/types";

/**
 * Convert AlertEvaluationInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function alertEvaluationInputToApi(alertEvaluationInput: AlertEvaluationInput): AlertEvaluationInput {
  return ConverterPresets.standardApiResponse(alertEvaluationInput, { dateFields: [] }) as AlertEvaluationInput;
}

/**
 * Convert AlertEvaluationUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `overriddenAt`, `snoozedUntil`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function alertEvaluationUpdateToApi(alertEvaluationUpdate: AlertEvaluationUpdate): AlertEvaluationUpdate {
  return ConverterPresets.standardApiResponse(alertEvaluationUpdate, { dateFields: ["overriddenAt", "snoozedUntil"] }) as AlertEvaluationUpdate;
}

/**
 * Convert DecisionMetricSnapshotInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `snapshotDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function decisionMetricSnapshotInputToApi(decisionMetricSnapshotInput: DecisionMetricSnapshotInput): DecisionMetricSnapshotInput {
  return ConverterPresets.standardApiResponse(decisionMetricSnapshotInput, { dateFields: ["snapshotDate"] }) as DecisionMetricSnapshotInput;
}

/**
 * Convert DecisionPolicyInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function decisionPolicyInputToApi(decisionPolicyInput: DecisionPolicyInput): DecisionPolicyInput {
  return ConverterPresets.standardApiResponse(decisionPolicyInput, { dateFields: [] }) as DecisionPolicyInput;
}

/**
 * Convert DecisionPolicyUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function decisionPolicyUpdateToApi(decisionPolicyUpdate: DecisionPolicyUpdate): DecisionPolicyUpdate {
  return ConverterPresets.standardApiResponse(decisionPolicyUpdate, { dateFields: [] }) as DecisionPolicyUpdate;
}

/**
 * Convert DecisionResultInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function decisionResultInputToApi(decisionResultInput: DecisionResultInput): DecisionResultInput {
  return ConverterPresets.standardApiResponse(decisionResultInput, { dateFields: [] }) as DecisionResultInput;
}

/**
 * Convert DecisionResultUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function decisionResultUpdateToApi(decisionResultUpdate: DecisionResultUpdate): DecisionResultUpdate {
  return ConverterPresets.standardApiResponse(decisionResultUpdate, { dateFields: [] }) as DecisionResultUpdate;
}

/**
 * Convert DecisionSessionInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function decisionSessionInputToApi(decisionSessionInput: DecisionSessionInput): DecisionSessionInput {
  return ConverterPresets.standardApiResponse(decisionSessionInput, { dateFields: [] }) as DecisionSessionInput;
}

/**
 * Convert DecisionSessionUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `endedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function decisionSessionUpdateToApi(decisionSessionUpdate: DecisionSessionUpdate): DecisionSessionUpdate {
  return ConverterPresets.standardApiResponse(decisionSessionUpdate, { dateFields: ["endedAt"] }) as DecisionSessionUpdate;
}

/**
 * Convert ExperimentArm domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function experimentArmToApi(experimentArm: ExperimentArm): ExperimentArm {
  return ConverterPresets.standardApiResponse(experimentArm, { dateFields: ["createdAt", "updatedAt"] }) as ExperimentArm;
}

/**
 * Convert ExperimentInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `endDate`, `startDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function experimentInputToApi(experimentInput: ExperimentInput): ExperimentInput {
  return ConverterPresets.standardApiResponse(experimentInput, { dateFields: ["endDate", "startDate"] }) as ExperimentInput;
}

/**
 * Convert ExperimentResult domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function experimentResultToApi(experimentResult: ExperimentResult): ExperimentResult {
  return ConverterPresets.standardApiResponse(experimentResult, { dateFields: ["createdAt", "updatedAt"] }) as ExperimentResult;
}

/**
 * Convert ExperimentUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `endDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function experimentUpdateToApi(experimentUpdate: ExperimentUpdate): ExperimentUpdate {
  return ConverterPresets.standardApiResponse(experimentUpdate, { dateFields: ["endDate"] }) as ExperimentUpdate;
}

/**
 * Convert ExplanationInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function explanationInputToApi(explanationInput: ExplanationInput): ExplanationInput {
  return ConverterPresets.standardApiResponse(explanationInput, { dateFields: [] }) as ExplanationInput;
}

/**
 * Convert FeatureAttribution domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function featureAttributionToApi(featureAttribution: FeatureAttribution): FeatureAttribution {
  return ConverterPresets.standardApiResponse(featureAttribution, { dateFields: ["createdAt", "updatedAt"] }) as FeatureAttribution;
}

/**
 * Convert ModelInvocationInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function modelInvocationInputToApi(modelInvocationInput: ModelInvocationInput): ModelInvocationInput {
  return ConverterPresets.standardApiResponse(modelInvocationInput, { dateFields: [] }) as ModelInvocationInput;
}

/**
 * Convert RecommendationInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function recommendationInputToApi(recommendationInput: RecommendationInput): RecommendationInput {
  return ConverterPresets.standardApiResponse(recommendationInput, { dateFields: [] }) as RecommendationInput;
}

/**
 * Convert RecommendationUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `acceptedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function recommendationUpdateToApi(recommendationUpdate: RecommendationUpdate): RecommendationUpdate {
  return ConverterPresets.standardApiResponse(recommendationUpdate, { dateFields: ["acceptedAt"] }) as RecommendationUpdate;
}

/**
 * Convert RiskAssessmentInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function riskAssessmentInputToApi(riskAssessmentInput: RiskAssessmentInput): RiskAssessmentInput {
  return ConverterPresets.standardApiResponse(riskAssessmentInput, { dateFields: [] }) as RiskAssessmentInput;
}

/**
 * Convert RiskAssessmentUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function riskAssessmentUpdateToApi(riskAssessmentUpdate: RiskAssessmentUpdate): RiskAssessmentUpdate {
  return ConverterPresets.standardApiResponse(riskAssessmentUpdate, { dateFields: [] }) as RiskAssessmentUpdate;
}

/**
 * Convert RuleTrace domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function ruleTraceToApi(ruleTrace: RuleTrace): RuleTrace {
  return ConverterPresets.standardApiResponse(ruleTrace, { dateFields: ["createdAt", "updatedAt"] }) as RuleTrace;
}

/**
 * Convert SimulationMetric domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function simulationMetricToApi(simulationMetric: SimulationMetric): SimulationMetric {
  return ConverterPresets.standardApiResponse(simulationMetric, { dateFields: ["createdAt", "updatedAt"] }) as SimulationMetric;
}

/**
 * Convert SimulationRunInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function simulationRunInputToApi(simulationRunInput: SimulationRunInput): SimulationRunInput {
  return ConverterPresets.standardApiResponse(simulationRunInput, { dateFields: [] }) as SimulationRunInput;
}

/**
 * Convert SimulationScenarioInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function simulationScenarioInputToApi(simulationScenarioInput: SimulationScenarioInput): SimulationScenarioInput {
  return ConverterPresets.standardApiResponse(simulationScenarioInput, { dateFields: [] }) as SimulationScenarioInput;
}

/**
 * Convert SimulationScenarioUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function simulationScenarioUpdateToApi(simulationScenarioUpdate: SimulationScenarioUpdate): SimulationScenarioUpdate {
  return ConverterPresets.standardApiResponse(simulationScenarioUpdate, { dateFields: [] }) as SimulationScenarioUpdate;
}

/**
 * Convert ThresholdProfileInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function thresholdProfileInputToApi(thresholdProfileInput: ThresholdProfileInput): ThresholdProfileInput {
  return ConverterPresets.standardApiResponse(thresholdProfileInput, { dateFields: [] }) as ThresholdProfileInput;
}

/**
 * Convert ThresholdProfileUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function thresholdProfileUpdateToApi(thresholdProfileUpdate: ThresholdProfileUpdate): ThresholdProfileUpdate {
  return ConverterPresets.standardApiResponse(thresholdProfileUpdate, { dateFields: [] }) as ThresholdProfileUpdate;
}

/**
 * Convert Timestamps domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function timestampsToApi(timestamps: Timestamps): Timestamps {
  return ConverterPresets.standardApiResponse(timestamps, { dateFields: ["createdAt", "updatedAt"] }) as Timestamps;
}
