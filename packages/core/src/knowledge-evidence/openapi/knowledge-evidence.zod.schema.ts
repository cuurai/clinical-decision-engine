import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const KnoApiMeta = z
  .object({
    correlationId: z.string(),
    timestamp: z.string().datetime({ offset: true }),
    totalCount: z.number().int(),
    pageSize: z.number().int(),
    pageNumber: z.number().int(),
  })
  .partial()
  .passthrough();
const KnoApiListResponse = z
  .object({ data: z.array(z.any()), meta: KnoApiMeta })
  .partial()
  .passthrough();
const Timestamps = z
  .object({
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ClinicalRule = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      ruleType: z.enum(["alert", "recommendation", "calculation", "workflow"]),
      condition: z.object({}).partial().passthrough().optional(),
      action: z.object({}).partial().passthrough().optional(),
      priority: z.number().int().gte(1).lte(10).optional(),
      enabled: z.boolean().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const KnoApiResponse = z
  .object({ data: z.object({}).partial().passthrough(), meta: KnoApiMeta })
  .partial()
  .passthrough();
const ClinicalRuleInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    ruleType: z.enum(["alert", "recommendation", "calculation", "workflow"]),
    condition: z.object({}).partial().passthrough(),
    action: z.object({}).partial().passthrough(),
    priority: z.number().int().gte(1).lte(10).optional(),
    enabled: z.boolean().optional().default(true),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createClinicalRule_Body = KnoApiResponse.and(
  z.object({ data: ClinicalRuleInput }).partial().passthrough()
);
const Error = z
  .object({
    error: z.string(),
    message: z.string(),
    details: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const ClinicalRuleUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    condition: z.object({}).partial().passthrough(),
    action: z.object({}).partial().passthrough(),
    priority: z.number().int().gte(1).lte(10),
    enabled: z.boolean(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateClinicalRule_Body = KnoApiResponse.and(
  z.object({ data: ClinicalRuleUpdate }).partial().passthrough()
);
const ClinicalRuleVersion = z
  .object({
    id: z.string(),
    clinicalRuleId: z.string(),
    version: z.string(),
    condition: z.object({}).partial().passthrough(),
    action: z.object({}).partial().passthrough(),
    effectiveDate: z.string().datetime({ offset: true }),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const RuleTest = z
  .object({
    id: z.string(),
    clinicalRuleId: z.string(),
    name: z.string(),
    testData: z.object({}).partial().passthrough(),
    expectedResult: z.object({}).partial().passthrough(),
    actualResult: z.object({}).partial().passthrough(),
    passed: z.boolean(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const RuleSet = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const RuleSetInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createRuleSet_Body = KnoApiResponse.and(
  z.object({ data: RuleSetInput }).partial().passthrough()
);
const RuleSetUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateRuleSet_Body = KnoApiResponse.and(
  z.object({ data: RuleSetUpdate }).partial().passthrough()
);
const ClinicalGuideline = Timestamps.and(
  z
    .object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      organization: z.string(),
      publicationDate: z.string().optional(),
      effectiveDate: z.string().optional(),
      version: z.string().optional(),
      url: z.string().url().optional(),
      category: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      content: z.object({}).partial().passthrough().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ClinicalGuidelineInput = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    organization: z.string(),
    publicationDate: z.string().optional(),
    effectiveDate: z.string().optional(),
    version: z.string().optional(),
    url: z.string().url().optional(),
    category: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    content: z.object({}).partial().passthrough().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createGuideline_Body = KnoApiResponse.and(
  z.object({ data: ClinicalGuidelineInput }).partial().passthrough()
);
const ClinicalGuidelineUpdate = z
  .object({
    title: z.string(),
    description: z.string(),
    effectiveDate: z.string(),
    version: z.string(),
    url: z.string().url(),
    category: z.string(),
    keywords: z.array(z.string()),
    content: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateGuideline_Body = KnoApiResponse.and(
  z.object({ data: ClinicalGuidelineUpdate }).partial().passthrough()
);
const GuidelineSection = z
  .object({
    id: z.string(),
    guidelineId: z.string(),
    title: z.string(),
    order: z.number().int(),
    content: z.object({}).partial().passthrough(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const EvidenceCitation = Timestamps.and(
  z
    .object({
      id: z.string(),
      citationType: z.enum(["paper", "guideline", "trial", "systematic-review", "other"]),
      title: z.string(),
      authors: z.array(z.string()).optional(),
      publicationDate: z.string().optional(),
      journal: z.string().optional(),
      url: z.string().url().optional(),
      doi: z.string().optional(),
      pmid: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const CareProtocolTemplate = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(["draft", "active", "deprecated"]).optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const CareProtocolTemplateInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(["draft", "active", "deprecated"]).optional().default("draft"),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createCareProtocol_Body = KnoApiResponse.and(
  z.object({ data: CareProtocolTemplateInput }).partial().passthrough()
);
const CareProtocolTemplateUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    status: z.enum(["draft", "active", "deprecated"]),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateCareProtocol_Body = KnoApiResponse.and(
  z.object({ data: CareProtocolTemplateUpdate }).partial().passthrough()
);
const ProtocolStep = z
  .object({
    id: z.string(),
    careProtocolId: z.string(),
    stepNumber: z.number().int(),
    title: z.string(),
    description: z.string(),
    order: z.number().int(),
    conditions: z.object({}).partial().passthrough(),
    actions: z.array(z.object({}).partial().passthrough()),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const OrderSetTemplate = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(["draft", "active", "deprecated"]).optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const OrderSetTemplateInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(["draft", "active", "deprecated"]).optional().default("draft"),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createOrderSetTemplate_Body = KnoApiResponse.and(
  z.object({ data: OrderSetTemplateInput }).partial().passthrough()
);
const OrderSetTemplateUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    status: z.enum(["draft", "active", "deprecated"]),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateOrderSetTemplate_Body = KnoApiResponse.and(
  z.object({ data: OrderSetTemplateUpdate }).partial().passthrough()
);
const Coding = z
  .object({ system: z.string(), code: z.string(), display: z.string(), version: z.string() })
  .partial()
  .passthrough();
const CodeableConcept = z
  .object({ coding: z.array(Coding), text: z.string() })
  .partial()
  .passthrough();
const OrderSetItem = z
  .object({
    id: z.string(),
    orderSetTemplateId: z.string(),
    itemType: z.enum(["medication", "lab", "imaging", "procedure", "other"]),
    code: CodeableConcept,
    required: z.boolean(),
    default: z.boolean(),
    order: z.number().int(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ModelDefinition = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      modelType: z.enum(["diagnostic", "prognostic", "treatment", "risk-assessment", "other"]),
      algorithm: z.string().optional(),
      framework: z.string().optional(),
      currentVersion: z.string().optional(),
      status: z.enum(["draft", "active", "deprecated", "archived"]).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ModelDefinitionInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    modelType: z.enum(["diagnostic", "prognostic", "treatment", "risk-assessment", "other"]),
    algorithm: z.string().optional(),
    framework: z.string().optional(),
    currentVersion: z.string().optional(),
    status: z.enum(["draft", "active", "deprecated", "archived"]).optional().default("draft"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createModelDefinition_Body = KnoApiResponse.and(
  z.object({ data: ModelDefinitionInput }).partial().passthrough()
);
const ModelDefinitionUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    currentVersion: z.string(),
    status: z.enum(["draft", "active", "deprecated", "archived"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateModelDefinition_Body = KnoApiResponse.and(
  z.object({ data: ModelDefinitionUpdate }).partial().passthrough()
);
const ModelVersion = Timestamps.and(
  z
    .object({
      id: z.string(),
      modelDefinitionId: z.string(),
      version: z.string(),
      artifactUrl: z.string().url().optional(),
      performanceMetrics: z.object({}).partial().passthrough().optional(),
      trainingDate: z.string().datetime({ offset: true }).optional(),
      status: z.enum(["training", "validated", "deployed", "deprecated"]).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const PerformanceMetric = z
  .object({
    id: z.string(),
    modelDefinitionId: z.string(),
    metricType: z.enum(["accuracy", "precision", "recall", "f1-score", "auc-roc", "other"]),
    value: z.number(),
    date: z.string().datetime({ offset: true }),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ModelVersionInput = z
  .object({
    modelDefinitionId: z.string(),
    version: z.string(),
    artifactUrl: z.string().url().optional(),
    performanceMetrics: z.object({}).partial().passthrough().optional(),
    trainingDate: z.string().datetime({ offset: true }).optional(),
    status: z
      .enum(["training", "validated", "deployed", "deprecated"])
      .optional()
      .default("training"),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createModelVersion_Body = KnoApiResponse.and(
  z.object({ data: ModelVersionInput }).partial().passthrough()
);
const ModelVersionUpdate = z
  .object({
    artifactUrl: z.string().url(),
    performanceMetrics: z.object({}).partial().passthrough(),
    status: z.enum(["training", "validated", "deployed", "deprecated"]),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateModelVersion_Body = KnoApiResponse.and(
  z.object({ data: ModelVersionUpdate }).partial().passthrough()
);
const ModelTest = z
  .object({
    id: z.string(),
    modelVersionId: z.string(),
    testType: z.enum(["unit", "integration", "validation", "performance"]),
    testData: z.object({}).partial().passthrough(),
    results: z.object({}).partial().passthrough(),
    passed: z.boolean(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const FeatureDefinition = z
  .object({
    id: z.string(),
    modelVersionId: z.string(),
    name: z.string(),
    dataType: z.string(),
    required: z.boolean(),
    description: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const OntologyTerm = z
  .object({
    id: z.string(),
    code: z.string(),
    display: z.string(),
    system: z.string(),
    parentId: z.string(),
    level: z.number().int(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const TermMapping = z
  .object({
    id: z.string(),
    sourceTermId: z.string(),
    targetTermId: z.string(),
    targetSystem: z.string(),
    equivalence: z.enum([
      "related-to",
      "equivalent",
      "wider",
      "narrower",
      "specializes",
      "generalizes",
    ]),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ValueSet = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ValueSetInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createValueSet_Body = KnoApiResponse.and(
  z.object({ data: ValueSetInput }).partial().passthrough()
);
const ValueSetUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateValueSet_Body = KnoApiResponse.and(
  z.object({ data: ValueSetUpdate }).partial().passthrough()
);
const ValueSetCode = z
  .object({
    id: z.string(),
    valueSetId: z.string(),
    code: z.string(),
    system: z.string(),
    display: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ConceptMap = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      sourceSystem: z.string(),
      targetSystem: z.string(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ConceptMapInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    sourceSystem: z.string(),
    targetSystem: z.string(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createConceptMap_Body = KnoApiResponse.and(
  z.object({ data: ConceptMapInput }).partial().passthrough()
);
const ConceptMapUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateConceptMap_Body = KnoApiResponse.and(
  z.object({ data: ConceptMapUpdate }).partial().passthrough()
);
const ConceptMapping = z
  .object({
    id: z.string(),
    conceptMapId: z.string(),
    sourceCode: z.string(),
    targetCode: z.string(),
    equivalence: z.enum([
      "related-to",
      "equivalent",
      "wider",
      "narrower",
      "specializes",
      "generalizes",
    ]),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ScoringTemplate = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      calculationFormula: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const ScoringTemplateInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    calculationFormula: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createScoringTemplate_Body = KnoApiResponse.and(
  z.object({ data: ScoringTemplateInput }).partial().passthrough()
);
const ScoringTemplateUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    calculationFormula: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateScoringTemplate_Body = KnoApiResponse.and(
  z.object({ data: ScoringTemplateUpdate }).partial().passthrough()
);
const ScoringItem = z
  .object({
    id: z.string(),
    scoringTemplateId: z.string(),
    name: z.string(),
    code: CodeableConcept,
    weight: z.number(),
    order: z.number().int(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const QuestionnaireTemplate = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const QuestionnaireTemplateInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createQuestionnaireTemplate_Body = KnoApiResponse.and(
  z.object({ data: QuestionnaireTemplateInput }).partial().passthrough()
);
const QuestionnaireTemplateUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateQuestionnaireTemplate_Body = KnoApiResponse.and(
  z.object({ data: QuestionnaireTemplateUpdate }).partial().passthrough()
);
const QuestionnaireQuestion = z
  .object({
    id: z.string(),
    questionnaireTemplateId: z.string(),
    questionText: z.string(),
    questionType: z.enum(["boolean", "choice", "date", "decimal", "integer", "string", "text"]),
    required: z.boolean(),
    order: z.number().int(),
    options: z.array(z.object({}).partial().passthrough()),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const EvidenceCitationInput = z
  .object({
    citationType: z.enum(["paper", "guideline", "trial", "systematic-review", "other"]),
    title: z.string(),
    authors: z.array(z.string()).optional(),
    publicationDate: z.string().optional(),
    journal: z.string().optional(),
    url: z.string().url().optional(),
    doi: z.string().optional(),
    pmid: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createEvidenceCitation_Body = KnoApiResponse.and(
  z.object({ data: EvidenceCitationInput }).partial().passthrough()
);
const EvidenceCitationUpdate = z
  .object({
    title: z.string(),
    authors: z.array(z.string()),
    publicationDate: z.string(),
    journal: z.string(),
    url: z.string().url(),
    doi: z.string(),
    pmid: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateEvidenceCitation_Body = KnoApiResponse.and(
  z.object({ data: EvidenceCitationUpdate }).partial().passthrough()
);
const EvidenceReview = Timestamps.and(
  z
    .object({
      id: z.string(),
      evidenceCitationId: z.string().optional(),
      gradeLevel: z.enum(["high", "moderate", "low", "very-low"]).optional(),
      strengthOfRecommendation: z.enum(["strong", "weak", "conditional"]).optional(),
      notes: z.string().optional(),
      reviewedBy: z.string().optional(),
      reviewDate: z.string().datetime({ offset: true }).optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const EvidenceReviewInput = z
  .object({
    evidenceCitationId: z.string(),
    gradeLevel: z.enum(["high", "moderate", "low", "very-low"]),
    strengthOfRecommendation: z.enum(["strong", "weak", "conditional"]),
    notes: z.string(),
    reviewedBy: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const createEvidenceReview_Body = KnoApiResponse.and(
  z.object({ data: EvidenceReviewInput }).partial().passthrough()
);
const EvidenceReviewUpdate = z
  .object({
    gradeLevel: z.enum(["high", "moderate", "low", "very-low"]),
    strengthOfRecommendation: z.enum(["strong", "weak", "conditional"]),
    notes: z.string(),
    reviewedBy: z.string(),
    reviewDate: z.string().datetime({ offset: true }),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateEvidenceReview_Body = KnoApiResponse.and(
  z.object({ data: EvidenceReviewUpdate }).partial().passthrough()
);
const KnowledgePackage = Timestamps.and(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      useCase: z.string().optional(),
      status: z.enum(["draft", "active", "deprecated"]).optional(),
      version: z.string().optional(),
      metadata: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
);
const KnowledgePackageInput = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    useCase: z.string().optional(),
    status: z.enum(["draft", "active", "deprecated"]).optional().default("draft"),
    version: z.string().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const createKnowledgePackage_Body = KnoApiResponse.and(
  z.object({ data: KnowledgePackageInput }).partial().passthrough()
);
const KnowledgePackageUpdate = z
  .object({
    name: z.string(),
    description: z.string(),
    useCase: z.string(),
    status: z.enum(["draft", "active", "deprecated"]),
    version: z.string(),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const updateKnowledgePackage_Body = KnoApiResponse.and(
  z.object({ data: KnowledgePackageUpdate }).partial().passthrough()
);

export const schemas = {
  KnoApiMeta,
  KnoApiListResponse,
  Timestamps,
  ClinicalRule,
  KnoApiResponse,
  ClinicalRuleInput,
  createClinicalRule_Body,
  Error,
  ClinicalRuleUpdate,
  updateClinicalRule_Body,
  ClinicalRuleVersion,
  RuleTest,
  RuleSet,
  RuleSetInput,
  createRuleSet_Body,
  RuleSetUpdate,
  updateRuleSet_Body,
  ClinicalGuideline,
  ClinicalGuidelineInput,
  createGuideline_Body,
  ClinicalGuidelineUpdate,
  updateGuideline_Body,
  GuidelineSection,
  EvidenceCitation,
  CareProtocolTemplate,
  CareProtocolTemplateInput,
  createCareProtocol_Body,
  CareProtocolTemplateUpdate,
  updateCareProtocol_Body,
  ProtocolStep,
  OrderSetTemplate,
  OrderSetTemplateInput,
  createOrderSetTemplate_Body,
  OrderSetTemplateUpdate,
  updateOrderSetTemplate_Body,
  Coding,
  CodeableConcept,
  OrderSetItem,
  ModelDefinition,
  ModelDefinitionInput,
  createModelDefinition_Body,
  ModelDefinitionUpdate,
  updateModelDefinition_Body,
  ModelVersion,
  PerformanceMetric,
  ModelVersionInput,
  createModelVersion_Body,
  ModelVersionUpdate,
  updateModelVersion_Body,
  ModelTest,
  FeatureDefinition,
  OntologyTerm,
  TermMapping,
  ValueSet,
  ValueSetInput,
  createValueSet_Body,
  ValueSetUpdate,
  updateValueSet_Body,
  ValueSetCode,
  ConceptMap,
  ConceptMapInput,
  createConceptMap_Body,
  ConceptMapUpdate,
  updateConceptMap_Body,
  ConceptMapping,
  ScoringTemplate,
  ScoringTemplateInput,
  createScoringTemplate_Body,
  ScoringTemplateUpdate,
  updateScoringTemplate_Body,
  ScoringItem,
  QuestionnaireTemplate,
  QuestionnaireTemplateInput,
  createQuestionnaireTemplate_Body,
  QuestionnaireTemplateUpdate,
  updateQuestionnaireTemplate_Body,
  QuestionnaireQuestion,
  EvidenceCitationInput,
  createEvidenceCitation_Body,
  EvidenceCitationUpdate,
  updateEvidenceCitation_Body,
  EvidenceReview,
  EvidenceReviewInput,
  createEvidenceReview_Body,
  EvidenceReviewUpdate,
  updateEvidenceReview_Body,
  KnowledgePackage,
  KnowledgePackageInput,
  createKnowledgePackage_Body,
  KnowledgePackageUpdate,
  updateKnowledgePackage_Body,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/care-protocols",
    alias: "listCareProtocols",
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
        schema: z.enum(["draft", "active", "deprecated"]).optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(CareProtocolTemplate) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/care-protocols",
    alias: "createCareProtocol",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createCareProtocol_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: CareProtocolTemplate }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/care-protocols/:id",
    alias: "getCareProtocol",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: CareProtocolTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/care-protocols/:id",
    alias: "updateCareProtocol",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateCareProtocol_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: CareProtocolTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/care-protocols/:id",
    alias: "deleteCareProtocol",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/care-protocols/:id/order-sets",
    alias: "listCareProtocolOrderSets",
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
    response: z.array(OrderSetTemplate),
  },
  {
    method: "get",
    path: "/care-protocols/:id/steps",
    alias: "listCareProtocolSteps",
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
    response: z.array(ProtocolStep),
  },
  {
    method: "get",
    path: "/clinical-rules",
    alias: "listClinicalRules",
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
        name: "ruleType",
        type: "Query",
        schema: z.enum(["alert", "recommendation", "calculation", "workflow"]).optional(),
      },
      {
        name: "enabled",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(ClinicalRule) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/clinical-rules",
    alias: "createClinicalRule",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createClinicalRule_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ClinicalRule }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/clinical-rules/:id",
    alias: "getClinicalRule",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ClinicalRule }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/clinical-rules/:id",
    alias: "updateClinicalRule",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateClinicalRule_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ClinicalRule }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/clinical-rules/:id",
    alias: "deleteClinicalRule",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/clinical-rules/:id/tests",
    alias: "listClinicalRuleTests",
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
    response: z.array(RuleTest),
  },
  {
    method: "get",
    path: "/clinical-rules/:id/versions",
    alias: "listClinicalRuleVersions",
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
    response: z.array(ClinicalRuleVersion),
  },
  {
    method: "get",
    path: "/concept-maps",
    alias: "listConceptMaps",
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
        name: "sourceSystem",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "targetSystem",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(ConceptMap) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/concept-maps",
    alias: "createConceptMap",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createConceptMap_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ConceptMap }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/concept-maps/:id",
    alias: "getConceptMap",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ConceptMap }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/concept-maps/:id",
    alias: "updateConceptMap",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateConceptMap_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ConceptMap }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/concept-maps/:id",
    alias: "deleteConceptMap",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/concept-maps/:id/mappings",
    alias: "listConceptMapMappings",
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
    response: z.array(ConceptMapping),
  },
  {
    method: "get",
    path: "/evidence-citations",
    alias: "listEvidenceCitations",
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
        name: "citationType",
        type: "Query",
        schema: z.enum(["paper", "guideline", "trial", "systematic-review", "other"]).optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(EvidenceCitation) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/evidence-citations",
    alias: "createEvidenceCitation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createEvidenceCitation_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: EvidenceCitation }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/evidence-citations/:id",
    alias: "getEvidenceCitation",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: EvidenceCitation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/evidence-citations/:id",
    alias: "updateEvidenceCitation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateEvidenceCitation_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: EvidenceCitation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/evidence-citations/:id",
    alias: "deleteEvidenceCitation",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/evidence-reviews",
    alias: "listEvidenceReviews",
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
        name: "gradeLevel",
        type: "Query",
        schema: z.enum(["high", "moderate", "low", "very-low"]).optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(EvidenceReview) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/evidence-reviews",
    alias: "createEvidenceReview",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createEvidenceReview_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: EvidenceReview }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/evidence-reviews/:id",
    alias: "getEvidenceReview",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: EvidenceReview }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/evidence-reviews/:id",
    alias: "updateEvidenceReview",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateEvidenceReview_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: EvidenceReview }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/evidence-reviews/:id",
    alias: "deleteEvidenceReview",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/guidelines",
    alias: "listGuidelines",
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
        name: "organization",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "category",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(ClinicalGuideline) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/guidelines",
    alias: "createGuideline",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createGuideline_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ClinicalGuideline }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/guidelines/:id",
    alias: "getGuideline",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ClinicalGuideline }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/guidelines/:id",
    alias: "updateGuideline",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateGuideline_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ClinicalGuideline }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/guidelines/:id",
    alias: "deleteGuideline",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/guidelines/:id/evidence-citations",
    alias: "listGuidelineEvidenceCitations",
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
    response: z.array(EvidenceCitation),
  },
  {
    method: "get",
    path: "/guidelines/:id/sections",
    alias: "listGuidelineSections",
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
    response: z.array(GuidelineSection),
  },
  {
    method: "get",
    path: "/knowledge-packages",
    alias: "listKnowledgePackages",
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
        name: "useCase",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["draft", "active", "deprecated"]).optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(KnowledgePackage) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/knowledge-packages",
    alias: "createKnowledgePackage",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createKnowledgePackage_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: KnowledgePackage }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/knowledge-packages/:id",
    alias: "getKnowledgePackage",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: KnowledgePackage }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/knowledge-packages/:id",
    alias: "updateKnowledgePackage",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateKnowledgePackage_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: KnowledgePackage }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/knowledge-packages/:id",
    alias: "deleteKnowledgePackage",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/knowledge-packages/:id/clinical-rules",
    alias: "listKnowledgePackageClinicalRules",
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
    response: z.array(ClinicalRule),
  },
  {
    method: "get",
    path: "/knowledge-packages/:id/model-definitions",
    alias: "listKnowledgePackageModelDefinitions",
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
    response: z.array(ModelDefinition),
  },
  {
    method: "get",
    path: "/knowledge-packages/:id/value-sets",
    alias: "listKnowledgePackageValueSets",
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
    response: z.array(ValueSet),
  },
  {
    method: "get",
    path: "/model-definitions",
    alias: "listModelDefinitions",
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
        name: "modelType",
        type: "Query",
        schema: z
          .enum(["diagnostic", "prognostic", "treatment", "risk-assessment", "other"])
          .optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["draft", "active", "deprecated", "archived"]).optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(ModelDefinition) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/model-definitions",
    alias: "createModelDefinition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createModelDefinition_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ModelDefinition }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/model-definitions/:id",
    alias: "getModelDefinition",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ModelDefinition }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/model-definitions/:id",
    alias: "updateModelDefinition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateModelDefinition_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ModelDefinition }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/model-definitions/:id",
    alias: "deleteModelDefinition",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/model-definitions/:id/performance-metrics",
    alias: "listModelDefinitionPerformanceMetrics",
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
    response: z.array(PerformanceMetric),
  },
  {
    method: "get",
    path: "/model-definitions/:id/versions",
    alias: "listModelDefinitionVersions",
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
    response: z.array(ModelVersion),
  },
  {
    method: "get",
    path: "/model-versions",
    alias: "listModelVersions",
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
        name: "modelDefinitionId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["training", "validated", "deployed", "deprecated"]).optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(ModelVersion) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/model-versions",
    alias: "createModelVersion",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createModelVersion_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ModelVersion }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/model-versions/:id",
    alias: "getModelVersion",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ModelVersion }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/model-versions/:id",
    alias: "updateModelVersion",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateModelVersion_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ModelVersion }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/model-versions/:id",
    alias: "deleteModelVersion",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/model-versions/:id/feature-definitions",
    alias: "listModelVersionFeatureDefinitions",
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
    response: z.array(FeatureDefinition),
  },
  {
    method: "get",
    path: "/model-versions/:id/tests",
    alias: "listModelVersionTests",
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
    response: z.array(ModelTest),
  },
  {
    method: "get",
    path: "/ontology-terms",
    alias: "searchOntologyTerms",
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
        name: "system",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(OntologyTerm),
  },
  {
    method: "get",
    path: "/ontology-terms/:id",
    alias: "getOntologyTerm",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: OntologyTerm }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/ontology-terms/:id/children",
    alias: "listOntologyTermChildren",
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
    response: z.array(OntologyTerm),
  },
  {
    method: "get",
    path: "/ontology-terms/:id/mappings",
    alias: "listOntologyTermMappings",
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
    response: z.array(TermMapping),
  },
  {
    method: "get",
    path: "/ontology-terms/:id/parents",
    alias: "listOntologyTermParents",
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
    response: z.array(OntologyTerm),
  },
  {
    method: "get",
    path: "/order-set-templates",
    alias: "listOrderSetTemplates",
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
        schema: z.enum(["draft", "active", "deprecated"]).optional(),
      },
    ],
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(OrderSetTemplate) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/order-set-templates",
    alias: "createOrderSetTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createOrderSetTemplate_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: OrderSetTemplate }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/order-set-templates/:id",
    alias: "getOrderSetTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: OrderSetTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/order-set-templates/:id",
    alias: "updateOrderSetTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateOrderSetTemplate_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: OrderSetTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/order-set-templates/:id",
    alias: "deleteOrderSetTemplate",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/order-set-templates/:id/items",
    alias: "listOrderSetTemplateItems",
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
    response: z.array(OrderSetItem),
  },
  {
    method: "get",
    path: "/questionnaire-templates",
    alias: "listQuestionnaireTemplates",
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
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(QuestionnaireTemplate) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/questionnaire-templates",
    alias: "createQuestionnaireTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createQuestionnaireTemplate_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: QuestionnaireTemplate }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/questionnaire-templates/:id",
    alias: "getQuestionnaireTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: QuestionnaireTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/questionnaire-templates/:id",
    alias: "updateQuestionnaireTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateQuestionnaireTemplate_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: QuestionnaireTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/questionnaire-templates/:id",
    alias: "deleteQuestionnaireTemplate",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/questionnaire-templates/:id/questions",
    alias: "listQuestionnaireTemplateQuestions",
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
    response: z.array(QuestionnaireQuestion),
  },
  {
    method: "get",
    path: "/rule-sets",
    alias: "listRuleSets",
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
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(RuleSet) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/rule-sets",
    alias: "createRuleSet",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createRuleSet_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: RuleSet }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/rule-sets/:id",
    alias: "getRuleSet",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: RuleSet }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/rule-sets/:id",
    alias: "updateRuleSet",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateRuleSet_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: RuleSet }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/rule-sets/:id",
    alias: "deleteRuleSet",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/rule-sets/:id/clinical-rules",
    alias: "listRuleSetClinicalRules",
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
    response: z.array(ClinicalRule),
  },
  {
    method: "get",
    path: "/scoring-templates",
    alias: "listScoringTemplates",
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
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(ScoringTemplate) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/scoring-templates",
    alias: "createScoringTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createScoringTemplate_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ScoringTemplate }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/scoring-templates/:id",
    alias: "getScoringTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ScoringTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/scoring-templates/:id",
    alias: "updateScoringTemplate",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateScoringTemplate_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ScoringTemplate }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/scoring-templates/:id",
    alias: "deleteScoringTemplate",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/scoring-templates/:id/items",
    alias: "listScoringTemplateItems",
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
    response: z.array(ScoringItem),
  },
  {
    method: "get",
    path: "/value-sets",
    alias: "listValueSets",
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
    response: KnoApiListResponse.and(
      z
        .object({ data: z.array(ValueSet) })
        .partial()
        .passthrough()
    ),
  },
  {
    method: "post",
    path: "/value-sets",
    alias: "createValueSet",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createValueSet_Body,
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ValueSet }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/value-sets/:id",
    alias: "getValueSet",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ValueSet }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "patch",
    path: "/value-sets/:id",
    alias: "updateValueSet",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: updateValueSet_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: KnoApiResponse.and(z.object({ data: ValueSet }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "delete",
    path: "/value-sets/:id",
    alias: "deleteValueSet",
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
        schema: KnoApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/value-sets/:id/codes",
    alias: "listValueSetCodes",
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
    response: z.array(ValueSetCode),
  },
]);

export const api = new Zodios("https://api.cuurai.com/api/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
