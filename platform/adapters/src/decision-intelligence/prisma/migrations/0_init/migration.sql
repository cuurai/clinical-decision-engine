-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SeverityEnum" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('active', 'snoozed', 'overridden', 'resolved');

-- CreateEnum
CREATE TYPE "RequesttypeEnum" AS ENUM ('diagnostic', 'treatment', 'risk_assessment', 'pathway_selection');

-- CreateEnum
CREATE TYPE "PriorityEnum" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "ExperimenttypeEnum" AS ENUM ('ab', 'multi_arm');

-- CreateEnum
CREATE TYPE "ExplanationtypeEnum" AS ENUM ('feature_importance', 'rule_trace', 'evidence_summary', 'model_reasoning');

-- CreateEnum
CREATE TYPE "RecommendationtypeEnum" AS ENUM ('diagnostic', 'treatment', 'monitoring', 'follow_up', 'documentation', 'other');

-- CreateEnum
CREATE TYPE "RisktypeEnum" AS ENUM ('mortality', 'readmission', 'complication', 'disease_progression', 'other');

-- CreateTable
CREATE TABLE "AlertEvaluationInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "patientId" CHAR(33) NOT NULL,
    "decisionSessionId" CHAR(33) NOT NULL,
    "clinicalRuleId" CHAR(33) NOT NULL,
    "severity" "SeverityEnum" NOT NULL,
    "fired" BOOLEAN NOT NULL DEFAULT true,
    "reasons" TEXT[],
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "AlertEvaluationInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEvaluationUpdate" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL,
    "snoozedUntil" TIMESTAMP(3) NOT NULL,
    "overriddenBy" TEXT NOT NULL,
    "overriddenAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "AlertEvaluationUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionMetricSnapshotInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "decisionPolicyId" CHAR(33) NOT NULL,
    "modelDefinitionId" CHAR(33) NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "metrics" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "DecisionMetricSnapshotInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionPolicyInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "configuration" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "version" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "DecisionPolicyInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionPolicyUpdate" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "configuration" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL,
    "version" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "DecisionPolicyUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionRequestInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "decisionSessionId" CHAR(33) NOT NULL,
    "patientId" CHAR(33) NOT NULL,
    "requestType" "RequesttypeEnum" NOT NULL,
    "context" TEXT NOT NULL,
    "priority" "PriorityEnum" NOT NULL DEFAULT 'normal',
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "DecisionRequestInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionResultInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "decisionRequestId" CHAR(33) NOT NULL,
    "decisionSessionId" CHAR(33) NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "result" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "DecisionResultInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionResultUpdate" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL,
    "result" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "DecisionResultUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionSessionInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "patientId" CHAR(33) NOT NULL,
    "encounterId" CHAR(33) NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "DecisionSessionInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionSessionUpdate" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "DecisionSessionUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Error" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Error_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentArm" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "experimentId" CHAR(33) NOT NULL,
    "name" TEXT NOT NULL,
    "decisionPolicyId" CHAR(33) NOT NULL,
    "modelVersionId" CHAR(33) NOT NULL,
    "trafficPercentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "ExperimentArm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "experimentType" "ExperimenttypeEnum" NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "trafficAllocation" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "ExperimentInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentResult" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "experimentId" CHAR(33) NOT NULL,
    "armId" CHAR(33) NOT NULL,
    "metrics" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "ExperimentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentUpdate" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "trafficAllocation" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "ExperimentUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExplanationInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "explanationType" "ExplanationtypeEnum" NOT NULL,
    "content" TEXT NOT NULL,
    "relatedEntityType" TEXT NOT NULL,
    "relatedEntityId" CHAR(33) NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "ExplanationInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureAttribution" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "explanationId" CHAR(33) NOT NULL,
    "featureName" TEXT NOT NULL,
    "attribution" DOUBLE PRECISION NOT NULL,
    "contribution" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "FeatureAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelInvocationInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "modelVersionId" CHAR(33) NOT NULL,
    "patientId" CHAR(33) NOT NULL,
    "inputs" TEXT NOT NULL,
    "outputs" TEXT NOT NULL,
    "performanceMetadata" TEXT NOT NULL,
    "executionTime" DOUBLE PRECISION NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "ModelInvocationInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "decisionResultId" CHAR(33) NOT NULL,
    "recommendationType" "RecommendationtypeEnum" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "RecommendationInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationUpdate" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL,
    "acceptedBy" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "RecommendationUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessmentInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "patientId" CHAR(33) NOT NULL,
    "decisionResultId" CHAR(33) NOT NULL,
    "riskType" "RisktypeEnum" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "scoreRange" TEXT NOT NULL,
    "interpretation" TEXT NOT NULL,
    "factors" TEXT[],
    "modelId" CHAR(33) NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "RiskAssessmentInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessmentUpdate" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "interpretation" TEXT NOT NULL,
    "factors" TEXT[],
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "RiskAssessmentUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleTrace" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "explanationId" CHAR(33) NOT NULL,
    "ruleId" CHAR(33) NOT NULL,
    "ruleName" TEXT NOT NULL,
    "conditionMet" BOOLEAN NOT NULL,
    "actionExecuted" TEXT NOT NULL,
    "trace" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "RuleTrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationMetric" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "simulationRunId" CHAR(33) NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DECIMAL(65,30) NOT NULL,
    "metricType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "SimulationMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationRunInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "simulationScenarioId" CHAR(33) NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "SimulationRunInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationScenarioInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "scenarioDefinition" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "SimulationScenarioInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationScenarioUpdate" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scenarioDefinition" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "SimulationScenarioUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThresholdProfileInput" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "thresholds" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "ThresholdProfileInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThresholdProfileUpdate" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "thresholds" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "ThresholdProfileUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timestamps" (
    "id" CHAR(33) NOT NULL,
    "org_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Timestamps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertEvaluationInput_org_id_idx" ON "AlertEvaluationInput"("org_id");

-- CreateIndex
CREATE INDEX "AlertEvaluationInput_status_idx" ON "AlertEvaluationInput"("status");

-- CreateIndex
CREATE INDEX "AlertEvaluationInput_created_at_idx" ON "AlertEvaluationInput"("created_at");

-- CreateIndex
CREATE INDEX "AlertEvaluationInput_updated_at_idx" ON "AlertEvaluationInput"("updated_at");

-- CreateIndex
CREATE INDEX "AlertEvaluationInput_deleted_at_idx" ON "AlertEvaluationInput"("deleted_at");

-- CreateIndex
CREATE INDEX "AlertEvaluationInput_clinicalRuleId_idx" ON "AlertEvaluationInput"("clinicalRuleId");

-- CreateIndex
CREATE INDEX "AlertEvaluationInput_patientId_idx" ON "AlertEvaluationInput"("patientId");

-- CreateIndex
CREATE INDEX "AlertEvaluationInput_decisionSessionId_idx" ON "AlertEvaluationInput"("decisionSessionId");

-- CreateIndex
CREATE INDEX "AlertEvaluationInput_org_id_status_idx" ON "AlertEvaluationInput"("org_id", "status");

-- CreateIndex
CREATE INDEX "AlertEvaluationUpdate_org_id_idx" ON "AlertEvaluationUpdate"("org_id");

-- CreateIndex
CREATE INDEX "AlertEvaluationUpdate_status_idx" ON "AlertEvaluationUpdate"("status");

-- CreateIndex
CREATE INDEX "AlertEvaluationUpdate_created_at_idx" ON "AlertEvaluationUpdate"("created_at");

-- CreateIndex
CREATE INDEX "AlertEvaluationUpdate_updated_at_idx" ON "AlertEvaluationUpdate"("updated_at");

-- CreateIndex
CREATE INDEX "AlertEvaluationUpdate_deleted_at_idx" ON "AlertEvaluationUpdate"("deleted_at");

-- CreateIndex
CREATE INDEX "AlertEvaluationUpdate_org_id_status_idx" ON "AlertEvaluationUpdate"("org_id", "status");

-- CreateIndex
CREATE INDEX "DecisionMetricSnapshotInput_org_id_idx" ON "DecisionMetricSnapshotInput"("org_id");

-- CreateIndex
CREATE INDEX "DecisionMetricSnapshotInput_created_at_idx" ON "DecisionMetricSnapshotInput"("created_at");

-- CreateIndex
CREATE INDEX "DecisionMetricSnapshotInput_updated_at_idx" ON "DecisionMetricSnapshotInput"("updated_at");

-- CreateIndex
CREATE INDEX "DecisionMetricSnapshotInput_deleted_at_idx" ON "DecisionMetricSnapshotInput"("deleted_at");

-- CreateIndex
CREATE INDEX "DecisionMetricSnapshotInput_decisionPolicyId_idx" ON "DecisionMetricSnapshotInput"("decisionPolicyId");

-- CreateIndex
CREATE INDEX "DecisionMetricSnapshotInput_modelDefinitionId_idx" ON "DecisionMetricSnapshotInput"("modelDefinitionId");

-- CreateIndex
CREATE INDEX "DecisionPolicyInput_org_id_idx" ON "DecisionPolicyInput"("org_id");

-- CreateIndex
CREATE INDEX "DecisionPolicyInput_status_idx" ON "DecisionPolicyInput"("status");

-- CreateIndex
CREATE INDEX "DecisionPolicyInput_created_at_idx" ON "DecisionPolicyInput"("created_at");

-- CreateIndex
CREATE INDEX "DecisionPolicyInput_updated_at_idx" ON "DecisionPolicyInput"("updated_at");

-- CreateIndex
CREATE INDEX "DecisionPolicyInput_deleted_at_idx" ON "DecisionPolicyInput"("deleted_at");

-- CreateIndex
CREATE INDEX "DecisionPolicyInput_org_id_status_idx" ON "DecisionPolicyInput"("org_id", "status");

-- CreateIndex
CREATE INDEX "DecisionPolicyUpdate_org_id_idx" ON "DecisionPolicyUpdate"("org_id");

-- CreateIndex
CREATE INDEX "DecisionPolicyUpdate_status_idx" ON "DecisionPolicyUpdate"("status");

-- CreateIndex
CREATE INDEX "DecisionPolicyUpdate_created_at_idx" ON "DecisionPolicyUpdate"("created_at");

-- CreateIndex
CREATE INDEX "DecisionPolicyUpdate_updated_at_idx" ON "DecisionPolicyUpdate"("updated_at");

-- CreateIndex
CREATE INDEX "DecisionPolicyUpdate_deleted_at_idx" ON "DecisionPolicyUpdate"("deleted_at");

-- CreateIndex
CREATE INDEX "DecisionPolicyUpdate_org_id_status_idx" ON "DecisionPolicyUpdate"("org_id", "status");

-- CreateIndex
CREATE INDEX "DecisionRequestInput_org_id_idx" ON "DecisionRequestInput"("org_id");

-- CreateIndex
CREATE INDEX "DecisionRequestInput_created_at_idx" ON "DecisionRequestInput"("created_at");

-- CreateIndex
CREATE INDEX "DecisionRequestInput_updated_at_idx" ON "DecisionRequestInput"("updated_at");

-- CreateIndex
CREATE INDEX "DecisionRequestInput_deleted_at_idx" ON "DecisionRequestInput"("deleted_at");

-- CreateIndex
CREATE INDEX "DecisionRequestInput_patientId_idx" ON "DecisionRequestInput"("patientId");

-- CreateIndex
CREATE INDEX "DecisionRequestInput_decisionSessionId_idx" ON "DecisionRequestInput"("decisionSessionId");

-- CreateIndex
CREATE INDEX "DecisionResultInput_org_id_idx" ON "DecisionResultInput"("org_id");

-- CreateIndex
CREATE INDEX "DecisionResultInput_status_idx" ON "DecisionResultInput"("status");

-- CreateIndex
CREATE INDEX "DecisionResultInput_created_at_idx" ON "DecisionResultInput"("created_at");

-- CreateIndex
CREATE INDEX "DecisionResultInput_updated_at_idx" ON "DecisionResultInput"("updated_at");

-- CreateIndex
CREATE INDEX "DecisionResultInput_deleted_at_idx" ON "DecisionResultInput"("deleted_at");

-- CreateIndex
CREATE INDEX "DecisionResultInput_decisionSessionId_idx" ON "DecisionResultInput"("decisionSessionId");

-- CreateIndex
CREATE INDEX "DecisionResultInput_decisionRequestId_idx" ON "DecisionResultInput"("decisionRequestId");

-- CreateIndex
CREATE INDEX "DecisionResultInput_org_id_status_idx" ON "DecisionResultInput"("org_id", "status");

-- CreateIndex
CREATE INDEX "DecisionResultUpdate_org_id_idx" ON "DecisionResultUpdate"("org_id");

-- CreateIndex
CREATE INDEX "DecisionResultUpdate_status_idx" ON "DecisionResultUpdate"("status");

-- CreateIndex
CREATE INDEX "DecisionResultUpdate_created_at_idx" ON "DecisionResultUpdate"("created_at");

-- CreateIndex
CREATE INDEX "DecisionResultUpdate_updated_at_idx" ON "DecisionResultUpdate"("updated_at");

-- CreateIndex
CREATE INDEX "DecisionResultUpdate_deleted_at_idx" ON "DecisionResultUpdate"("deleted_at");

-- CreateIndex
CREATE INDEX "DecisionResultUpdate_org_id_status_idx" ON "DecisionResultUpdate"("org_id", "status");

-- CreateIndex
CREATE INDEX "DecisionSessionInput_org_id_idx" ON "DecisionSessionInput"("org_id");

-- CreateIndex
CREATE INDEX "DecisionSessionInput_status_idx" ON "DecisionSessionInput"("status");

-- CreateIndex
CREATE INDEX "DecisionSessionInput_created_at_idx" ON "DecisionSessionInput"("created_at");

-- CreateIndex
CREATE INDEX "DecisionSessionInput_updated_at_idx" ON "DecisionSessionInput"("updated_at");

-- CreateIndex
CREATE INDEX "DecisionSessionInput_deleted_at_idx" ON "DecisionSessionInput"("deleted_at");

-- CreateIndex
CREATE INDEX "DecisionSessionInput_patientId_idx" ON "DecisionSessionInput"("patientId");

-- CreateIndex
CREATE INDEX "DecisionSessionInput_encounterId_idx" ON "DecisionSessionInput"("encounterId");

-- CreateIndex
CREATE INDEX "DecisionSessionInput_org_id_status_idx" ON "DecisionSessionInput"("org_id", "status");

-- CreateIndex
CREATE INDEX "DecisionSessionUpdate_org_id_idx" ON "DecisionSessionUpdate"("org_id");

-- CreateIndex
CREATE INDEX "DecisionSessionUpdate_status_idx" ON "DecisionSessionUpdate"("status");

-- CreateIndex
CREATE INDEX "DecisionSessionUpdate_created_at_idx" ON "DecisionSessionUpdate"("created_at");

-- CreateIndex
CREATE INDEX "DecisionSessionUpdate_updated_at_idx" ON "DecisionSessionUpdate"("updated_at");

-- CreateIndex
CREATE INDEX "DecisionSessionUpdate_deleted_at_idx" ON "DecisionSessionUpdate"("deleted_at");

-- CreateIndex
CREATE INDEX "DecisionSessionUpdate_org_id_status_idx" ON "DecisionSessionUpdate"("org_id", "status");

-- CreateIndex
CREATE INDEX "Error_org_id_idx" ON "Error"("org_id");

-- CreateIndex
CREATE INDEX "Error_created_at_idx" ON "Error"("created_at");

-- CreateIndex
CREATE INDEX "Error_updated_at_idx" ON "Error"("updated_at");

-- CreateIndex
CREATE INDEX "Error_deleted_at_idx" ON "Error"("deleted_at");

-- CreateIndex
CREATE INDEX "ExperimentArm_org_id_idx" ON "ExperimentArm"("org_id");

-- CreateIndex
CREATE INDEX "ExperimentArm_createdAt_idx" ON "ExperimentArm"("createdAt");

-- CreateIndex
CREATE INDEX "ExperimentArm_updatedAt_idx" ON "ExperimentArm"("updatedAt");

-- CreateIndex
CREATE INDEX "ExperimentArm_deleted_at_idx" ON "ExperimentArm"("deleted_at");

-- CreateIndex
CREATE INDEX "ExperimentArm_modelVersionId_idx" ON "ExperimentArm"("modelVersionId");

-- CreateIndex
CREATE INDEX "ExperimentArm_decisionPolicyId_idx" ON "ExperimentArm"("decisionPolicyId");

-- CreateIndex
CREATE INDEX "ExperimentArm_experimentId_idx" ON "ExperimentArm"("experimentId");

-- CreateIndex
CREATE INDEX "ExperimentInput_org_id_idx" ON "ExperimentInput"("org_id");

-- CreateIndex
CREATE INDEX "ExperimentInput_status_idx" ON "ExperimentInput"("status");

-- CreateIndex
CREATE INDEX "ExperimentInput_created_at_idx" ON "ExperimentInput"("created_at");

-- CreateIndex
CREATE INDEX "ExperimentInput_updated_at_idx" ON "ExperimentInput"("updated_at");

-- CreateIndex
CREATE INDEX "ExperimentInput_deleted_at_idx" ON "ExperimentInput"("deleted_at");

-- CreateIndex
CREATE INDEX "ExperimentInput_org_id_status_idx" ON "ExperimentInput"("org_id", "status");

-- CreateIndex
CREATE INDEX "ExperimentResult_org_id_idx" ON "ExperimentResult"("org_id");

-- CreateIndex
CREATE INDEX "ExperimentResult_createdAt_idx" ON "ExperimentResult"("createdAt");

-- CreateIndex
CREATE INDEX "ExperimentResult_updatedAt_idx" ON "ExperimentResult"("updatedAt");

-- CreateIndex
CREATE INDEX "ExperimentResult_deleted_at_idx" ON "ExperimentResult"("deleted_at");

-- CreateIndex
CREATE INDEX "ExperimentResult_armId_idx" ON "ExperimentResult"("armId");

-- CreateIndex
CREATE INDEX "ExperimentResult_experimentId_idx" ON "ExperimentResult"("experimentId");

-- CreateIndex
CREATE INDEX "ExperimentUpdate_org_id_idx" ON "ExperimentUpdate"("org_id");

-- CreateIndex
CREATE INDEX "ExperimentUpdate_status_idx" ON "ExperimentUpdate"("status");

-- CreateIndex
CREATE INDEX "ExperimentUpdate_created_at_idx" ON "ExperimentUpdate"("created_at");

-- CreateIndex
CREATE INDEX "ExperimentUpdate_updated_at_idx" ON "ExperimentUpdate"("updated_at");

-- CreateIndex
CREATE INDEX "ExperimentUpdate_deleted_at_idx" ON "ExperimentUpdate"("deleted_at");

-- CreateIndex
CREATE INDEX "ExperimentUpdate_org_id_status_idx" ON "ExperimentUpdate"("org_id", "status");

-- CreateIndex
CREATE INDEX "ExplanationInput_org_id_idx" ON "ExplanationInput"("org_id");

-- CreateIndex
CREATE INDEX "ExplanationInput_created_at_idx" ON "ExplanationInput"("created_at");

-- CreateIndex
CREATE INDEX "ExplanationInput_updated_at_idx" ON "ExplanationInput"("updated_at");

-- CreateIndex
CREATE INDEX "ExplanationInput_deleted_at_idx" ON "ExplanationInput"("deleted_at");

-- CreateIndex
CREATE INDEX "ExplanationInput_relatedEntityId_idx" ON "ExplanationInput"("relatedEntityId");

-- CreateIndex
CREATE INDEX "FeatureAttribution_org_id_idx" ON "FeatureAttribution"("org_id");

-- CreateIndex
CREATE INDEX "FeatureAttribution_createdAt_idx" ON "FeatureAttribution"("createdAt");

-- CreateIndex
CREATE INDEX "FeatureAttribution_updatedAt_idx" ON "FeatureAttribution"("updatedAt");

-- CreateIndex
CREATE INDEX "FeatureAttribution_deleted_at_idx" ON "FeatureAttribution"("deleted_at");

-- CreateIndex
CREATE INDEX "FeatureAttribution_explanationId_idx" ON "FeatureAttribution"("explanationId");

-- CreateIndex
CREATE INDEX "ModelInvocationInput_org_id_idx" ON "ModelInvocationInput"("org_id");

-- CreateIndex
CREATE INDEX "ModelInvocationInput_created_at_idx" ON "ModelInvocationInput"("created_at");

-- CreateIndex
CREATE INDEX "ModelInvocationInput_updated_at_idx" ON "ModelInvocationInput"("updated_at");

-- CreateIndex
CREATE INDEX "ModelInvocationInput_deleted_at_idx" ON "ModelInvocationInput"("deleted_at");

-- CreateIndex
CREATE INDEX "ModelInvocationInput_modelVersionId_idx" ON "ModelInvocationInput"("modelVersionId");

-- CreateIndex
CREATE INDEX "ModelInvocationInput_patientId_idx" ON "ModelInvocationInput"("patientId");

-- CreateIndex
CREATE INDEX "RecommendationInput_org_id_idx" ON "RecommendationInput"("org_id");

-- CreateIndex
CREATE INDEX "RecommendationInput_status_idx" ON "RecommendationInput"("status");

-- CreateIndex
CREATE INDEX "RecommendationInput_created_at_idx" ON "RecommendationInput"("created_at");

-- CreateIndex
CREATE INDEX "RecommendationInput_updated_at_idx" ON "RecommendationInput"("updated_at");

-- CreateIndex
CREATE INDEX "RecommendationInput_deleted_at_idx" ON "RecommendationInput"("deleted_at");

-- CreateIndex
CREATE INDEX "RecommendationInput_decisionResultId_idx" ON "RecommendationInput"("decisionResultId");

-- CreateIndex
CREATE INDEX "RecommendationInput_org_id_status_idx" ON "RecommendationInput"("org_id", "status");

-- CreateIndex
CREATE INDEX "RecommendationUpdate_org_id_idx" ON "RecommendationUpdate"("org_id");

-- CreateIndex
CREATE INDEX "RecommendationUpdate_status_idx" ON "RecommendationUpdate"("status");

-- CreateIndex
CREATE INDEX "RecommendationUpdate_created_at_idx" ON "RecommendationUpdate"("created_at");

-- CreateIndex
CREATE INDEX "RecommendationUpdate_updated_at_idx" ON "RecommendationUpdate"("updated_at");

-- CreateIndex
CREATE INDEX "RecommendationUpdate_deleted_at_idx" ON "RecommendationUpdate"("deleted_at");

-- CreateIndex
CREATE INDEX "RecommendationUpdate_org_id_status_idx" ON "RecommendationUpdate"("org_id", "status");

-- CreateIndex
CREATE INDEX "RiskAssessmentInput_org_id_idx" ON "RiskAssessmentInput"("org_id");

-- CreateIndex
CREATE INDEX "RiskAssessmentInput_created_at_idx" ON "RiskAssessmentInput"("created_at");

-- CreateIndex
CREATE INDEX "RiskAssessmentInput_updated_at_idx" ON "RiskAssessmentInput"("updated_at");

-- CreateIndex
CREATE INDEX "RiskAssessmentInput_deleted_at_idx" ON "RiskAssessmentInput"("deleted_at");

-- CreateIndex
CREATE INDEX "RiskAssessmentInput_modelId_idx" ON "RiskAssessmentInput"("modelId");

-- CreateIndex
CREATE INDEX "RiskAssessmentInput_patientId_idx" ON "RiskAssessmentInput"("patientId");

-- CreateIndex
CREATE INDEX "RiskAssessmentInput_decisionResultId_idx" ON "RiskAssessmentInput"("decisionResultId");

-- CreateIndex
CREATE INDEX "RiskAssessmentUpdate_org_id_idx" ON "RiskAssessmentUpdate"("org_id");

-- CreateIndex
CREATE INDEX "RiskAssessmentUpdate_created_at_idx" ON "RiskAssessmentUpdate"("created_at");

-- CreateIndex
CREATE INDEX "RiskAssessmentUpdate_updated_at_idx" ON "RiskAssessmentUpdate"("updated_at");

-- CreateIndex
CREATE INDEX "RiskAssessmentUpdate_deleted_at_idx" ON "RiskAssessmentUpdate"("deleted_at");

-- CreateIndex
CREATE INDEX "RuleTrace_org_id_idx" ON "RuleTrace"("org_id");

-- CreateIndex
CREATE INDEX "RuleTrace_createdAt_idx" ON "RuleTrace"("createdAt");

-- CreateIndex
CREATE INDEX "RuleTrace_updatedAt_idx" ON "RuleTrace"("updatedAt");

-- CreateIndex
CREATE INDEX "RuleTrace_deleted_at_idx" ON "RuleTrace"("deleted_at");

-- CreateIndex
CREATE INDEX "RuleTrace_explanationId_idx" ON "RuleTrace"("explanationId");

-- CreateIndex
CREATE INDEX "RuleTrace_ruleId_idx" ON "RuleTrace"("ruleId");

-- CreateIndex
CREATE INDEX "SimulationMetric_org_id_idx" ON "SimulationMetric"("org_id");

-- CreateIndex
CREATE INDEX "SimulationMetric_createdAt_idx" ON "SimulationMetric"("createdAt");

-- CreateIndex
CREATE INDEX "SimulationMetric_updatedAt_idx" ON "SimulationMetric"("updatedAt");

-- CreateIndex
CREATE INDEX "SimulationMetric_deleted_at_idx" ON "SimulationMetric"("deleted_at");

-- CreateIndex
CREATE INDEX "SimulationMetric_simulationRunId_idx" ON "SimulationMetric"("simulationRunId");

-- CreateIndex
CREATE INDEX "SimulationRunInput_org_id_idx" ON "SimulationRunInput"("org_id");

-- CreateIndex
CREATE INDEX "SimulationRunInput_status_idx" ON "SimulationRunInput"("status");

-- CreateIndex
CREATE INDEX "SimulationRunInput_created_at_idx" ON "SimulationRunInput"("created_at");

-- CreateIndex
CREATE INDEX "SimulationRunInput_updated_at_idx" ON "SimulationRunInput"("updated_at");

-- CreateIndex
CREATE INDEX "SimulationRunInput_deleted_at_idx" ON "SimulationRunInput"("deleted_at");

-- CreateIndex
CREATE INDEX "SimulationRunInput_simulationScenarioId_idx" ON "SimulationRunInput"("simulationScenarioId");

-- CreateIndex
CREATE INDEX "SimulationRunInput_org_id_status_idx" ON "SimulationRunInput"("org_id", "status");

-- CreateIndex
CREATE INDEX "SimulationScenarioInput_org_id_idx" ON "SimulationScenarioInput"("org_id");

-- CreateIndex
CREATE INDEX "SimulationScenarioInput_status_idx" ON "SimulationScenarioInput"("status");

-- CreateIndex
CREATE INDEX "SimulationScenarioInput_created_at_idx" ON "SimulationScenarioInput"("created_at");

-- CreateIndex
CREATE INDEX "SimulationScenarioInput_updated_at_idx" ON "SimulationScenarioInput"("updated_at");

-- CreateIndex
CREATE INDEX "SimulationScenarioInput_deleted_at_idx" ON "SimulationScenarioInput"("deleted_at");

-- CreateIndex
CREATE INDEX "SimulationScenarioInput_org_id_status_idx" ON "SimulationScenarioInput"("org_id", "status");

-- CreateIndex
CREATE INDEX "SimulationScenarioUpdate_org_id_idx" ON "SimulationScenarioUpdate"("org_id");

-- CreateIndex
CREATE INDEX "SimulationScenarioUpdate_status_idx" ON "SimulationScenarioUpdate"("status");

-- CreateIndex
CREATE INDEX "SimulationScenarioUpdate_created_at_idx" ON "SimulationScenarioUpdate"("created_at");

-- CreateIndex
CREATE INDEX "SimulationScenarioUpdate_updated_at_idx" ON "SimulationScenarioUpdate"("updated_at");

-- CreateIndex
CREATE INDEX "SimulationScenarioUpdate_deleted_at_idx" ON "SimulationScenarioUpdate"("deleted_at");

-- CreateIndex
CREATE INDEX "SimulationScenarioUpdate_org_id_status_idx" ON "SimulationScenarioUpdate"("org_id", "status");

-- CreateIndex
CREATE INDEX "ThresholdProfileInput_org_id_idx" ON "ThresholdProfileInput"("org_id");

-- CreateIndex
CREATE INDEX "ThresholdProfileInput_created_at_idx" ON "ThresholdProfileInput"("created_at");

-- CreateIndex
CREATE INDEX "ThresholdProfileInput_updated_at_idx" ON "ThresholdProfileInput"("updated_at");

-- CreateIndex
CREATE INDEX "ThresholdProfileInput_deleted_at_idx" ON "ThresholdProfileInput"("deleted_at");

-- CreateIndex
CREATE INDEX "ThresholdProfileUpdate_org_id_idx" ON "ThresholdProfileUpdate"("org_id");

-- CreateIndex
CREATE INDEX "ThresholdProfileUpdate_created_at_idx" ON "ThresholdProfileUpdate"("created_at");

-- CreateIndex
CREATE INDEX "ThresholdProfileUpdate_updated_at_idx" ON "ThresholdProfileUpdate"("updated_at");

-- CreateIndex
CREATE INDEX "ThresholdProfileUpdate_deleted_at_idx" ON "ThresholdProfileUpdate"("deleted_at");

-- CreateIndex
CREATE INDEX "Timestamps_org_id_idx" ON "Timestamps"("org_id");

-- CreateIndex
CREATE INDEX "Timestamps_createdAt_idx" ON "Timestamps"("createdAt");

-- CreateIndex
CREATE INDEX "Timestamps_updatedAt_idx" ON "Timestamps"("updatedAt");

-- CreateIndex
CREATE INDEX "Timestamps_deleted_at_idx" ON "Timestamps"("deleted_at");

