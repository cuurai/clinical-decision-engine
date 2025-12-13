import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const DecApiMeta = z
  .object({
    correlationId: z.string(),
    timestamp: z.string().datetime({ offset: true }),
    totalCount: z.number().int(),
    pageSize: z.number().int(),
    pageNumber: z.number().int(),
  })
  .partial()
  .passthrough();
const DecApiListResponse = z
  .object({ data: z.array(z.any()), meta: DecApiMeta })
  .partial()
  .passthrough();
const Timestamps = z
  .object({
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const DecisionSession = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      status: z.enum(["active", "completed", "cancelled"]).optional(),
      startedAt: z.string().datetime({ offset: true }).optional(),
      endedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const DecApiResponse = z
  .object({ data: z.object({}).partial().passthrough(), meta: DecApiMeta })
  .partial()
  .passthrough();
const DecisionSessionInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    status: z.enum(["active", "completed", "cancelled"]).optional().default("active"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createDecisionSession_Body = DecApiResponse.and(
  z.object({ data: DecisionSessionInput }).partial().passthrough()
);
const Error = z
  .object({
    error: z.string(),
    message: z.string(),
    details: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const DecisionSessionUpdate = z
  .object({
    status: z.enum(["active", "completed", "cancelled"]),
    endedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateDecisionSession_Body = DecApiResponse.and(
  z.object({ data: DecisionSessionUpdate }).partial().passthrough()
);
const DecisionRequest = Timestamps.and(
  z
    .object({
      id: z.string(),
      decisionSessionId: z.string().optional(),
      patientId: z.string(),
      requestType: z.enum(["diagnostic", "treatment", "risk-assessment", "pathway-selection"]),
      context: z.object({}).partial().passthrough(),
      priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal"),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const DecisionResult = Timestamps.and(
  z
    .object({
      id: z.string(),
      decisionRequestId: z.string(),
      decisionSessionId: z.string().optional(),
      status: z.enum(["pending", "completed", "failed"]).optional(),
      result: z.object({}).partial().passthrough().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const RiskAssessment = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      decisionResultId: z.string().optional(),
      riskType: z.enum([
        "mortality",
        "readmission",
        "complication",
        "disease-progression",
        "other",
      ]),
      score: z.number(),
      scoreRange: z.object({ min: z.number(), max: z.number() }).partial().passthrough().optional(),
      interpretation: z.string().optional(),
      factors: z.array(z.object({}).partial().passthrough()).optional(),
      modelId: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const AlertEvaluation = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      decisionSessionId: z.string().optional(),
      clinicalRuleId: z.string().optional(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      fired: z.boolean().optional(),
      reasons: z.array(z.string()).optional(),
      status: z.enum(["active", "snoozed", "overridden", "resolved"]).optional(),
      snoozedUntil: z.string().datetime({ offset: true }).optional(),
      overriddenBy: z.string().optional(),
      overriddenAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const Explanation = Timestamps.and(
  z
    .object({
      id: z.string(),
      explanationType: z.enum([
        "feature-importance",
        "rule-trace",
        "evidence-summary",
        "model-reasoning",
      ]),
      content: z.object({}).partial().passthrough().optional(),
      relatedEntityType: z.string().optional(),
      relatedEntityId: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const DecisionRequestInput = z
  .object({
    decisionSessionId: z.string().optional(),
    patientId: z.string(),
    requestType: z.enum(["diagnostic", "treatment", "risk-assessment", "pathway-selection"]),
    context: z.object({}).partial().passthrough(),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createDecisionRequest_Body = DecApiResponse.and(
  z.object({ data: DecisionRequestInput }).partial().passthrough()
);
const DecisionResultInput = z
  .object({
    decisionRequestId: z.string(),
    decisionSessionId: z.string().optional(),
    status: z.enum(["pending", "completed", "failed"]).optional().default("pending"),
    result: z.object({}).partial().passthrough().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createDecisionResult_Body = DecApiResponse.and(
  z.object({ data: DecisionResultInput }).partial().passthrough()
);
const DecisionResultUpdate = z
  .object({
    status: z.enum(["pending", "completed", "failed"]),
    result: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateDecisionResult_Body = DecApiResponse.and(
  z.object({ data: DecisionResultUpdate }).partial().passthrough()
);
const Recommendation = Timestamps.and(
  z
    .object({
      id: z.string(),
      decisionResultId: z.string(),
      recommendationType: z.enum([
        "diagnostic",
        "treatment",
        "monitoring",
        "follow-up",
        "documentation",
        "other",
      ]),
      title: z.string().optional(),
      description: z.string().optional(),
      suggestion: z.object({}).partial().passthrough().optional(),
      status: z.enum(["pending", "accepted", "overridden", "deferred"]).optional(),
      acceptedBy: z.string().optional(),
      acceptedAt: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const RiskAssessmentInput = z
  .object({
    patientId: z.string(),
    decisionResultId: z.string().optional(),
    riskType: z.enum(["mortality", "readmission", "complication", "disease-progression", "other"]),
    score: z.number(),
    scoreRange: z.object({ min: z.number(), max: z.number() }).partial().passthrough().optional(),
    interpretation: z.string().optional(),
    factors: z.array(z.object({}).partial().passthrough()).optional(),
    modelId: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createRiskAssessment_Body = DecApiResponse.and(
  z.object({ data: RiskAssessmentInput }).partial().passthrough()
);
const RiskAssessmentUpdate = z
  .object({
    score: z.number(),
    interpretation: z.string(),
    factors: z.array(z.object({}).partial().passthrough()),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateRiskAssessment_Body = DecApiResponse.and(
  z.object({ data: RiskAssessmentUpdate }).partial().passthrough()
);
const RecommendationInput = z
  .object({
    decisionResultId: z.string(),
    recommendationType: z.enum([
      "diagnostic",
      "treatment",
      "monitoring",
      "follow-up",
      "documentation",
      "other",
    ]),
    title: z.string().optional(),
    description: z.string().optional(),
    suggestion: z.object({}).partial().passthrough().optional(),
    status: z.enum(["pending", "accepted", "overridden", "deferred"]).optional().default("pending"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createRecommendation_Body = DecApiResponse.and(
  z.object({ data: RecommendationInput }).partial().passthrough()
);
const RecommendationUpdate = z
  .object({
    status: z.enum(["pending", "accepted", "overridden", "deferred"]),
    acceptedBy: z.string(),
    acceptedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateRecommendation_Body = DecApiResponse.and(
  z.object({ data: RecommendationUpdate }).partial().passthrough()
);
const AlertEvaluationInput = z
  .object({
    patientId: z.string(),
    decisionSessionId: z.string().optional(),
    clinicalRuleId: z.string().optional(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    fired: z.boolean().optional().default(true),
    reasons: z.array(z.string()).optional(),
    status: z.enum(["active", "snoozed", "overridden", "resolved"]).optional().default("active"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createAlertEvaluation_Body = DecApiResponse.and(
  z.object({ data: AlertEvaluationInput }).partial().passthrough()
);
const AlertEvaluationUpdate = z
  .object({
    status: z.enum(["active", "snoozed", "overridden", "resolved"]),
    snoozedUntil: z.string().datetime({ offset: true }),
    overriddenBy: z.string(),
    overriddenAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateAlertEvaluation_Body = DecApiResponse.and(
  z.object({ data: AlertEvaluationUpdate }).partial().passthrough()
);
const ExplanationInput = z
  .object({
    explanationType: z.enum([
      "feature-importance",
      "rule-trace",
      "evidence-summary",
      "model-reasoning",
    ]),
    content: z.object({}).partial().passthrough(),
    relatedEntityType: z.string().optional(),
    relatedEntityId: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createExplanation_Body = DecApiResponse.and(
  z.object({ data: ExplanationInput }).partial().passthrough()
);
const FeatureAttribution = z
  .object({
    id: z.string(),
    explanationId: z.string(),
    featureName: z.string(),
    attribution: z.number(),
    contribution: z.number(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const RuleTrace = z
  .object({
    id: z.string(),
    explanationId: z.string(),
    ruleId: z.string(),
    ruleName: z.string(),
    conditionMet: z.boolean(),
    actionExecuted: z.object({}).partial().passthrough(),
    trace: z.array(z.object({}).partial().passthrough()),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ModelInvocation = Timestamps.and(
  z
    .object({
      id: z.string(),
      modelVersionId: z.string(),
      patientId: z.string().optional(),
      inputs: z.object({}).partial().passthrough().optional(),
      outputs: z.object({}).partial().passthrough().optional(),
      performanceMetadata: z.object({}).partial().passthrough().optional(),
      executionTime: z.number().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ModelInvocationInput = z
  .object({
    modelVersionId: z.string(),
    patientId: z.string().optional(),
    inputs: z.object({}).partial().passthrough(),
    outputs: z.object({}).partial().passthrough().optional(),
    performanceMetadata: z.object({}).partial().passthrough().optional(),
    executionTime: z.number().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createModelInvocation_Body = DecApiResponse.and(
  z.object({ data: ModelInvocationInput }).partial().passthrough()
);
const SimulationScenario = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      scenarioDefinition: z.object({}).partial().passthrough().optional(),
      status: z.enum(["draft", "active", "completed"]).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const SimulationScenarioInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    scenarioDefinition: z.object({}).partial().passthrough().optional(),
    status: z.enum(["draft", "active", "completed"]).optional().default("draft"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createSimulationScenario_Body = DecApiResponse.and(
  z.object({ data: SimulationScenarioInput }).partial().passthrough()
);
const SimulationScenarioUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    scenarioDefinition: z.object({}).partial().passthrough(),
    status: z.enum(["draft", "active", "completed"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateSimulationScenario_Body = DecApiResponse.and(
  z.object({ data: SimulationScenarioUpdate }).partial().passthrough()
);
const SimulationRun = Timestamps.and(
  z
    .object({
      id: z.string(),
      simulationScenarioId: z.string(),
      status: z.enum(["running", "completed", "failed"]).optional(),
      startedAt: z.string().datetime({ offset: true }).optional(),
      completedAt: z.string().datetime({ offset: true }).optional(),
      results: z.object({}).partial().passthrough().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const SimulationRunInput = z
  .object({
    simulationScenarioId: z.string(),
    status: z.enum(["running", "completed", "failed"]).optional().default("running"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createSimulationRun_Body = DecApiResponse.and(
  z.object({ data: SimulationRunInput }).partial().passthrough()
);
const SimulationMetric = z
  .object({
    id: z.string(),
    simulationRunId: z.string(),
    metricName: z.string(),
    metricValue: z.number(),
    metricType: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const DecisionPolicy = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      configuration: z.object({}).partial().passthrough().optional(),
      status: z.enum(["draft", "active", "deprecated"]).optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const DecisionPolicyInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    configuration: z.object({}).partial().passthrough().optional(),
    status: z.enum(["draft", "active", "deprecated"]).optional().default("draft"),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createDecisionPolicy_Body = DecApiResponse.and(
  z.object({ data: DecisionPolicyInput }).partial().passthrough()
);
const DecisionPolicyUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    configuration: z.object({}).partial().passthrough(),
    status: z.enum(["draft", "active", "deprecated"]),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateDecisionPolicy_Body = DecApiResponse.and(
  z.object({ data: DecisionPolicyUpdate }).partial().passthrough()
);
const ThresholdProfile = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      thresholds: z.object({}).partial().passthrough().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ThresholdProfileInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    thresholds: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createThresholdProfile_Body = DecApiResponse.and(
  z.object({ data: ThresholdProfileInput }).partial().passthrough()
);
const ThresholdProfileUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    thresholds: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateThresholdProfile_Body = DecApiResponse.and(
  z.object({ data: ThresholdProfileUpdate }).partial().passthrough()
);
const DecisionMetricSnapshot = Timestamps.and(
  z
    .object({
      id: z.string(),
      decisionPolicyId: z.string().optional(),
      modelDefinitionId: z.string().optional(),
      snapshotDate: z.string().datetime({ offset: true }).optional(),
      metrics: z.object({}).partial().passthrough().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const DecisionMetricSnapshotInput = z
  .object({
    decisionPolicyId: z.string().optional(),
    modelDefinitionId: z.string().optional(),
    snapshotDate: z.string().datetime({ offset: true }),
    metrics: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createDecisionMetricSnapshot_Body = DecApiResponse.and(
  z.object({ data: DecisionMetricSnapshotInput }).partial().passthrough()
);
const Experiment = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      experimentType: z.enum(["ab", "multi-arm"]).optional(),
      status: z.enum(["draft", "running", "completed", "cancelled"]).optional(),
      startDate: z.string().datetime({ offset: true }).optional(),
      endDate: z.string().datetime({ offset: true }).optional(),
      trafficAllocation: z.object({}).partial().passthrough().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ExperimentInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    experimentType: z.enum(["ab", "multi-arm"]),
    status: z.enum(["draft", "running", "completed", "cancelled"]).optional().default("draft"),
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
    trafficAllocation: z.object({}).partial().passthrough().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createExperiment_Body = DecApiResponse.and(
  z.object({ data: ExperimentInput }).partial().passthrough()
);
const ExperimentUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    status: z.enum(["draft", "running", "completed", "cancelled"]),
    endDate: z.string().datetime({ offset: true }),
    trafficAllocation: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateExperiment_Body = DecApiResponse.and(
  z.object({ data: ExperimentUpdate }).partial().passthrough()
);
const ExperimentArm = z
  .object({
    id: z.string(),
    experimentId: z.string(),
    name: z.string(),
    decisionPolicyId: z.string(),
    modelVersionId: z.string(),
    trafficPercentage: z.number(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ExperimentResult = z
  .object({
    id: z.string(),
    experimentId: z.string(),
    armId: z.string(),
    metrics: z.object({}).partial().passthrough(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();

export const schemas = {
  DecApiMeta,
  DecApiListResponse,
  Timestamps,
  DecisionSession,
  DecApiResponse,
  DecisionSessionInput,
  createDecisionSession_Body,
  Error,
  DecisionSessionUpdate,
  updateDecisionSession_Body,
  DecisionRequest,
  DecisionResult,
  RiskAssessment,
  AlertEvaluation,
  Explanation,
  DecisionRequestInput,
  createDecisionRequest_Body,
  DecisionResultInput,
  createDecisionResult_Body,
  DecisionResultUpdate,
  updateDecisionResult_Body,
  Recommendation,
  RiskAssessmentInput,
  createRiskAssessment_Body,
  RiskAssessmentUpdate,
  updateRiskAssessment_Body,
  RecommendationInput,
  createRecommendation_Body,
  RecommendationUpdate,
  updateRecommendation_Body,
  AlertEvaluationInput,
  createAlertEvaluation_Body,
  AlertEvaluationUpdate,
  updateAlertEvaluation_Body,
  ExplanationInput,
  createExplanation_Body,
  FeatureAttribution,
  RuleTrace,
  ModelInvocation,
  ModelInvocationInput,
  createModelInvocation_Body,
  SimulationScenario,
  SimulationScenarioInput,
  createSimulationScenario_Body,
  SimulationScenarioUpdate,
  updateSimulationScenario_Body,
  SimulationRun,
  SimulationRunInput,
  createSimulationRun_Body,
  SimulationMetric,
  DecisionPolicy,
  DecisionPolicyInput,
  createDecisionPolicy_Body,
  DecisionPolicyUpdate,
  updateDecisionPolicy_Body,
  ThresholdProfile,
  ThresholdProfileInput,
  createThresholdProfile_Body,
  ThresholdProfileUpdate,
  updateThresholdProfile_Body,
  DecisionMetricSnapshot,
  DecisionMetricSnapshotInput,
  createDecisionMetricSnapshot_Body,
  Experiment,
  ExperimentInput,
  createExperiment_Body,
  ExperimentUpdate,
  updateExperiment_Body,
  ExperimentArm,
  ExperimentResult,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/alert-evaluations",
    alias: "listAlertEvaluations",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "severity",
        type: "Query",
        schema: z.enum(["low", "medium", "high", "critical"]).optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["active", "snoozed", "overridden", "resolved"]).optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(AlertEvaluation) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/alert-evaluations",
    alias: "createAlertEvaluation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createAlertEvaluation_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: AlertEvaluation }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/alert-evaluations/:id",
    alias: "getAlertEvaluation",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: AlertEvaluation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/alert-evaluations/:id",
    alias: "updateAlertEvaluation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateAlertEvaluation_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: AlertEvaluation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/alert-evaluations/:id",
    alias: "deleteAlertEvaluation",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-metrics",
    alias: "listDecisionMetrics",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "decisionPolicyId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "modelDefinitionId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(DecisionMetricSnapshot) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/decision-metrics",
    alias: "createDecisionMetricSnapshot",
    description: `Creates an immutable decision metric snapshot. Once created, metrics cannot be
modified to ensure historical accuracy.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createDecisionMetricSnapshot_Body,
      },
    ],
    response: DecApiResponse.and(
      z.object({ data: DecisionMetricSnapshot }).partial().passthrough()
    ),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-metrics/:id",
    alias: "getDecisionMetricSnapshot",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(
      z.object({ data: DecisionMetricSnapshot }).partial().passthrough()
    ),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-policies",
    alias: "listDecisionPolicies",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["draft", "active", "deprecated"]).optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(DecisionPolicy) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/decision-policies",
    alias: "createDecisionPolicy",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createDecisionPolicy_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionPolicy }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-policies/:id",
    alias: "getDecisionPolicy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionPolicy }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/decision-policies/:id",
    alias: "updateDecisionPolicy",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateDecisionPolicy_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionPolicy }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/decision-policies/:id",
    alias: "deleteDecisionPolicy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-policies/:id/threshold-profiles",
    alias: "listDecisionPolicyThresholdProfiles",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ThresholdProfile),
  },
  {
    method: "get",
    path: "/decision-requests",
    alias: "listDecisionRequests",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "decisionSessionId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "requestType",
        type: "Query",
        schema: z
          .enum(["diagnostic", "treatment", "risk-assessment", "pathway-selection"])
          .optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(DecisionRequest) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/decision-requests",
    alias: "createDecisionRequest",
    description: `Creates an immutable decision request. Once created, decision requests cannot be
modified to ensure audit trail integrity.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createDecisionRequest_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionRequest }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-requests/:id",
    alias: "getDecisionRequest",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionRequest }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-requests/:id/decision-results",
    alias: "listDecisionRequestResults",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(DecisionResult),
  },
  {
    method: "get",
    path: "/decision-requests/:id/explanations",
    alias: "listDecisionRequestExplanations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Explanation),
  },
  {
    method: "get",
    path: "/decision-results",
    alias: "listDecisionResults",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "decisionRequestId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "decisionSessionId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["pending", "completed", "failed"]).optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(DecisionResult) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/decision-results",
    alias: "createDecisionResult",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createDecisionResult_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionResult }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-results/:id",
    alias: "getDecisionResult",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionResult }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/decision-results/:id",
    alias: "updateDecisionResult",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateDecisionResult_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionResult }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/decision-results/:id",
    alias: "deleteDecisionResult",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-results/:id/explanations",
    alias: "listDecisionResultExplanations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Explanation),
  },
  {
    method: "get",
    path: "/decision-results/:id/recommendations",
    alias: "listDecisionResultRecommendations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Recommendation),
  },
  {
    method: "get",
    path: "/decision-results/:id/risk-assessments",
    alias: "listDecisionResultRiskAssessments",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(RiskAssessment),
  },
  {
    method: "get",
    path: "/decision-sessions",
    alias: "listDecisionSessions",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "encounterId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["active", "completed", "cancelled"]).optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(DecisionSession) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/decision-sessions",
    alias: "createDecisionSession",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createDecisionSession_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionSession }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-sessions/:id",
    alias: "getDecisionSession",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionSession }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/decision-sessions/:id",
    alias: "updateDecisionSession",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateDecisionSession_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: DecisionSession }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/decision-sessions/:id",
    alias: "deleteDecisionSession",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/decision-sessions/:id/alerts",
    alias: "listDecisionSessionAlerts",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(AlertEvaluation),
  },
  {
    method: "get",
    path: "/decision-sessions/:id/decision-requests",
    alias: "listDecisionSessionRequests",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(DecisionRequest),
  },
  {
    method: "get",
    path: "/decision-sessions/:id/decision-results",
    alias: "listDecisionSessionResults",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(DecisionResult),
  },
  {
    method: "get",
    path: "/decision-sessions/:id/explanations",
    alias: "listDecisionSessionExplanations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Explanation),
  },
  {
    method: "get",
    path: "/decision-sessions/:id/risk-assessments",
    alias: "listDecisionSessionRiskAssessments",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(RiskAssessment),
  },
  {
    method: "get",
    path: "/experiments",
    alias: "listExperiments",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["draft", "running", "completed", "cancelled"]).optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(Experiment) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/experiments",
    alias: "createExperiment",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createExperiment_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: Experiment }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/experiments/:id",
    alias: "getExperiment",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: Experiment }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/experiments/:id",
    alias: "updateExperiment",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateExperiment_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: Experiment }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/experiments/:id",
    alias: "deleteExperiment",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/experiments/:id/arms",
    alias: "listExperimentArms",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ExperimentArm),
  },
  {
    method: "get",
    path: "/experiments/:id/results",
    alias: "listExperimentResults",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ExperimentResult),
  },
  {
    method: "get",
    path: "/explanations",
    alias: "listExplanations",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "explanationType",
        type: "Query",
        schema: z
          .enum(["feature-importance", "rule-trace", "evidence-summary", "model-reasoning"])
          .optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(Explanation) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/explanations",
    alias: "createExplanation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createExplanation_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: Explanation }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/explanations/:id",
    alias: "getExplanation",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: Explanation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/explanations/:id/features",
    alias: "listExplanationFeatures",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(FeatureAttribution),
  },
  {
    method: "get",
    path: "/explanations/:id/rule-traces",
    alias: "listExplanationRuleTraces",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(RuleTrace),
  },
  {
    method: "get",
    path: "/model-invocations",
    alias: "listModelInvocations",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "modelVersionId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(ModelInvocation) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/model-invocations",
    alias: "createModelInvocation",
    description: `Creates an immutable model invocation record. Once created, invocations cannot be
modified to ensure audit trail integrity.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createModelInvocation_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: ModelInvocation }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/model-invocations/:id",
    alias: "getModelInvocation",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: ModelInvocation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/model-invocations/:id/explanations",
    alias: "listModelInvocationExplanations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Explanation),
  },
  {
    method: "get",
    path: "/recommendations",
    alias: "listRecommendations",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "decisionResultId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "recommendationType",
        type: "Query",
        schema: z
          .enum(["diagnostic", "treatment", "monitoring", "follow-up", "documentation", "other"])
          .optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["pending", "accepted", "overridden", "deferred"]).optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(Recommendation) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/recommendations",
    alias: "createRecommendation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createRecommendation_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: Recommendation }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/recommendations/:id",
    alias: "getRecommendation",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: Recommendation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/recommendations/:id",
    alias: "updateRecommendation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateRecommendation_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: Recommendation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/recommendations/:id",
    alias: "deleteRecommendation",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/recommendations/:id/explanations",
    alias: "listRecommendationExplanations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Explanation),
  },
  {
    method: "get",
    path: "/risk-assessments",
    alias: "listRiskAssessments",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "riskType",
        type: "Query",
        schema: z
          .enum(["mortality", "readmission", "complication", "disease-progression", "other"])
          .optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(RiskAssessment) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/risk-assessments",
    alias: "createRiskAssessment",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createRiskAssessment_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: RiskAssessment }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/risk-assessments/:id",
    alias: "getRiskAssessment",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: RiskAssessment }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/risk-assessments/:id",
    alias: "updateRiskAssessment",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateRiskAssessment_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: RiskAssessment }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/risk-assessments/:id",
    alias: "deleteRiskAssessment",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/risk-assessments/:id/explanations",
    alias: "listRiskAssessmentExplanations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Explanation),
  },
  {
    method: "get",
    path: "/simulation-runs",
    alias: "listSimulationRuns",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "simulationScenarioId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["running", "completed", "failed"]).optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(SimulationRun) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/simulation-runs",
    alias: "createSimulationRun",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createSimulationRun_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: SimulationRun }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/simulation-runs/:id",
    alias: "getSimulationRun",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: SimulationRun }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/simulation-runs/:id/decision-results",
    alias: "listSimulationRunDecisionResults",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(DecisionResult),
  },
  {
    method: "get",
    path: "/simulation-runs/:id/metrics",
    alias: "listSimulationRunMetrics",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(SimulationMetric),
  },
  {
    method: "get",
    path: "/simulation-scenarios",
    alias: "listSimulationScenarios",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "category",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["draft", "active", "completed"]).optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(SimulationScenario) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/simulation-scenarios",
    alias: "createSimulationScenario",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createSimulationScenario_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: SimulationScenario }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/simulation-scenarios/:id",
    alias: "getSimulationScenario",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: SimulationScenario }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/simulation-scenarios/:id",
    alias: "updateSimulationScenario",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateSimulationScenario_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: SimulationScenario }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/simulation-scenarios/:id",
    alias: "deleteSimulationScenario",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/simulation-scenarios/:id/simulation-runs",
    alias: "listSimulationScenarioRuns",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(SimulationRun),
  },
  {
    method: "get",
    path: "/threshold-profiles",
    alias: "listThresholdProfiles",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "category",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: DecApiListResponse.and(
      z
        .object({ data: z.array(ThresholdProfile) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/threshold-profiles",
    alias: "createThresholdProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createThresholdProfile_Body,
      },
    ],
    response: DecApiResponse.and(z.object({ data: ThresholdProfile }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/threshold-profiles/:id",
    alias: "getThresholdProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: ThresholdProfile }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/threshold-profiles/:id",
    alias: "updateThresholdProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateThresholdProfile_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DecApiResponse.and(z.object({ data: ThresholdProfile }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/threshold-profiles/:id",
    alias: "deleteThresholdProfile",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: DecApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
]);

export const api = new Zodios("https://api.cuurai.com/api/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
