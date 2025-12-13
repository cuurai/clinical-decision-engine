import { z, type ZodTypeAny } from "zod";

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
const DecisionSessionInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    status: z.enum(["active", "completed", "cancelled"]).optional().default("active"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
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
const DecisionResultInput = z
  .object({
    decisionRequestId: z.string(),
    decisionSessionId: z.string().optional(),
    status: z.enum(["pending", "completed", "failed"]).optional().default("pending"),
    result: z.object({}).partial().passthrough().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const DecisionResultUpdate = z
  .object({
    status: z.enum(["pending", "completed", "failed"]),
    result: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
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
const RiskAssessmentUpdate = z
  .object({
    score: z.number(),
    interpretation: z.string(),
    factors: z.array(z.object({}).partial().passthrough()),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
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
const RecommendationUpdate = z
  .object({
    status: z.enum(["pending", "accepted", "overridden", "deferred"]),
    acceptedBy: z.string(),
    acceptedAt: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
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

export const schemas: Record<string, ZodTypeAny> = {
  Timestamps,
  DecisionSession,
  DecisionSessionInput,
  Error,
  DecisionSessionUpdate,
  DecisionRequest,
  DecisionResult,
  RiskAssessment,
  AlertEvaluation,
  Explanation,
  DecisionRequestInput,
  DecisionResultInput,
  DecisionResultUpdate,
  Recommendation,
  RiskAssessmentInput,
  RiskAssessmentUpdate,
  RecommendationInput,
  RecommendationUpdate,
  AlertEvaluationInput,
  AlertEvaluationUpdate,
  ExplanationInput,
  FeatureAttribution,
  RuleTrace,
  ModelInvocation,
  ModelInvocationInput,
  SimulationScenario,
  SimulationScenarioInput,
  SimulationScenarioUpdate,
  SimulationRun,
  SimulationRunInput,
  SimulationMetric,
  DecisionPolicy,
  DecisionPolicyInput,
  DecisionPolicyUpdate,
  ThresholdProfile,
  ThresholdProfileInput,
  ThresholdProfileUpdate,
  DecisionMetricSnapshot,
  DecisionMetricSnapshotInput,
  Experiment,
  ExperimentInput,
  ExperimentUpdate,
  ExperimentArm,
  ExperimentResult,
};



