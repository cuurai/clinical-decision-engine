/**
 * Knowledge Evidence Domain Converters
 *
 * Thin wrappers around centralized converters (packages/core/src/shared/helpers/core-converters.ts)
 * Converts between domain types (with Date objects) and API types (with ISO strings)
 *
 * Naming convention: {entity}ToApi (camelCase)
 */

import { ConverterPresets } from "../../../_shared/src/helpers/core-converters.js";
import type {
  CareProtocolTemplateInput,
  CareProtocolTemplateUpdate,
  ClinicalGuidelineInput,
  ClinicalGuidelineUpdate,
  ClinicalRuleInput,
  ClinicalRuleUpdate,
  ClinicalRuleVersion,
  CodeableConcept,
  Coding,
  ConceptMapInput,
  ConceptMapUpdate,
  ConceptMapping,
  EvidenceCitationInput,
  EvidenceCitationUpdate,
  EvidenceReviewInput,
  EvidenceReviewUpdate,
  FeatureDefinition,
  GuidelineSection,
  KnowledgePackageInput,
  KnowledgePackageUpdate,
  ModelDefinitionInput,
  ModelDefinitionUpdate,
  ModelTest,
  ModelVersionInput,
  ModelVersionUpdate,
  OntologyTerm,
  OrderSetItem,
  OrderSetTemplateInput,
  OrderSetTemplateUpdate,
  PerformanceMetric,
  ProtocolStep,
  QuestionnaireQuestion,
  QuestionnaireTemplateInput,
  QuestionnaireTemplateUpdate,
  RuleSetInput,
  RuleSetUpdate,
  RuleTest,
  ScoringItem,
  ScoringTemplateInput,
  ScoringTemplateUpdate,
  TermMapping,
  Timestamps,
  ValueSetCode,
  ValueSetInput,
  ValueSetUpdate,
} from "../types/index.js";

/**
 * Convert CareProtocolTemplateInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function careProtocolTemplateInputToApi(careProtocolTemplateInput: CareProtocolTemplateInput): CareProtocolTemplateInput {
  return ConverterPresets.standardApiResponse(careProtocolTemplateInput, { dateFields: [] }) as CareProtocolTemplateInput;
}

/**
 * Convert CareProtocolTemplateUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function careProtocolTemplateUpdateToApi(careProtocolTemplateUpdate: CareProtocolTemplateUpdate): CareProtocolTemplateUpdate {
  return ConverterPresets.standardApiResponse(careProtocolTemplateUpdate, { dateFields: [] }) as CareProtocolTemplateUpdate;
}

/**
 * Convert ClinicalGuidelineInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function clinicalGuidelineInputToApi(clinicalGuidelineInput: ClinicalGuidelineInput): ClinicalGuidelineInput {
  return ConverterPresets.standardApiResponse(clinicalGuidelineInput, { dateFields: [] }) as ClinicalGuidelineInput;
}

/**
 * Convert ClinicalGuidelineUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function clinicalGuidelineUpdateToApi(clinicalGuidelineUpdate: ClinicalGuidelineUpdate): ClinicalGuidelineUpdate {
  return ConverterPresets.standardApiResponse(clinicalGuidelineUpdate, { dateFields: [] }) as ClinicalGuidelineUpdate;
}

/**
 * Convert ClinicalRuleInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function clinicalRuleInputToApi(clinicalRuleInput: ClinicalRuleInput): ClinicalRuleInput {
  return ConverterPresets.standardApiResponse(clinicalRuleInput, { dateFields: [] }) as ClinicalRuleInput;
}

/**
 * Convert ClinicalRuleUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function clinicalRuleUpdateToApi(clinicalRuleUpdate: ClinicalRuleUpdate): ClinicalRuleUpdate {
  return ConverterPresets.standardApiResponse(clinicalRuleUpdate, { dateFields: [] }) as ClinicalRuleUpdate;
}

/**
 * Convert ClinicalRuleVersion domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `effectiveDate`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function clinicalRuleVersionToApi(clinicalRuleVersion: ClinicalRuleVersion): ClinicalRuleVersion {
  return ConverterPresets.standardApiResponse(clinicalRuleVersion, { dateFields: ["createdAt", "effectiveDate", "updatedAt"] }) as ClinicalRuleVersion;
}

/**
 * Convert CodeableConcept domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function codeableConceptToApi(codeableConcept: CodeableConcept): CodeableConcept {
  return ConverterPresets.standardApiResponse(codeableConcept, { dateFields: [] }) as CodeableConcept;
}

/**
 * Convert Coding domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function codingToApi(coding: Coding): Coding {
  return ConverterPresets.standardApiResponse(coding, { dateFields: [] }) as Coding;
}

/**
 * Convert ConceptMapInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function conceptMapInputToApi(conceptMapInput: ConceptMapInput): ConceptMapInput {
  return ConverterPresets.standardApiResponse(conceptMapInput, { dateFields: [] }) as ConceptMapInput;
}

/**
 * Convert ConceptMapUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function conceptMapUpdateToApi(conceptMapUpdate: ConceptMapUpdate): ConceptMapUpdate {
  return ConverterPresets.standardApiResponse(conceptMapUpdate, { dateFields: [] }) as ConceptMapUpdate;
}

/**
 * Convert ConceptMapping domain entity to API response
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
export function conceptMappingToApi(conceptMapping: ConceptMapping): ConceptMapping {
  return ConverterPresets.standardApiResponse(conceptMapping, { dateFields: ["createdAt", "updatedAt"] }) as ConceptMapping;
}

/**
 * Convert EvidenceCitationInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function evidenceCitationInputToApi(evidenceCitationInput: EvidenceCitationInput): EvidenceCitationInput {
  return ConverterPresets.standardApiResponse(evidenceCitationInput, { dateFields: [] }) as EvidenceCitationInput;
}

/**
 * Convert EvidenceCitationUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function evidenceCitationUpdateToApi(evidenceCitationUpdate: EvidenceCitationUpdate): EvidenceCitationUpdate {
  return ConverterPresets.standardApiResponse(evidenceCitationUpdate, { dateFields: [] }) as EvidenceCitationUpdate;
}

/**
 * Convert EvidenceReviewInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function evidenceReviewInputToApi(evidenceReviewInput: EvidenceReviewInput): EvidenceReviewInput {
  return ConverterPresets.standardApiResponse(evidenceReviewInput, { dateFields: [] }) as EvidenceReviewInput;
}

/**
 * Convert EvidenceReviewUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `reviewDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function evidenceReviewUpdateToApi(evidenceReviewUpdate: EvidenceReviewUpdate): EvidenceReviewUpdate {
  return ConverterPresets.standardApiResponse(evidenceReviewUpdate, { dateFields: ["reviewDate"] }) as EvidenceReviewUpdate;
}

/**
 * Convert FeatureDefinition domain entity to API response
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
export function featureDefinitionToApi(featureDefinition: FeatureDefinition): FeatureDefinition {
  return ConverterPresets.standardApiResponse(featureDefinition, { dateFields: ["createdAt", "updatedAt"] }) as FeatureDefinition;
}

/**
 * Convert GuidelineSection domain entity to API response
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
export function guidelineSectionToApi(guidelineSection: GuidelineSection): GuidelineSection {
  return ConverterPresets.standardApiResponse(guidelineSection, { dateFields: ["createdAt", "updatedAt"] }) as GuidelineSection;
}

/**
 * Convert KnowledgePackageInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function knowledgePackageInputToApi(knowledgePackageInput: KnowledgePackageInput): KnowledgePackageInput {
  return ConverterPresets.standardApiResponse(knowledgePackageInput, { dateFields: [] }) as KnowledgePackageInput;
}

/**
 * Convert KnowledgePackageUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function knowledgePackageUpdateToApi(knowledgePackageUpdate: KnowledgePackageUpdate): KnowledgePackageUpdate {
  return ConverterPresets.standardApiResponse(knowledgePackageUpdate, { dateFields: [] }) as KnowledgePackageUpdate;
}

/**
 * Convert ModelDefinitionInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function modelDefinitionInputToApi(modelDefinitionInput: ModelDefinitionInput): ModelDefinitionInput {
  return ConverterPresets.standardApiResponse(modelDefinitionInput, { dateFields: [] }) as ModelDefinitionInput;
}

/**
 * Convert ModelDefinitionUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function modelDefinitionUpdateToApi(modelDefinitionUpdate: ModelDefinitionUpdate): ModelDefinitionUpdate {
  return ConverterPresets.standardApiResponse(modelDefinitionUpdate, { dateFields: [] }) as ModelDefinitionUpdate;
}

/**
 * Convert ModelTest domain entity to API response
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
export function modelTestToApi(modelTest: ModelTest): ModelTest {
  return ConverterPresets.standardApiResponse(modelTest, { dateFields: ["createdAt", "updatedAt"] }) as ModelTest;
}

/**
 * Convert ModelVersionInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `trainingDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function modelVersionInputToApi(modelVersionInput: ModelVersionInput): ModelVersionInput {
  return ConverterPresets.standardApiResponse(modelVersionInput, { dateFields: ["trainingDate"] }) as ModelVersionInput;
}

/**
 * Convert ModelVersionUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function modelVersionUpdateToApi(modelVersionUpdate: ModelVersionUpdate): ModelVersionUpdate {
  return ConverterPresets.standardApiResponse(modelVersionUpdate, { dateFields: [] }) as ModelVersionUpdate;
}

/**
 * Convert OntologyTerm domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function ontologyTermToApi(ontologyTerm: OntologyTerm): OntologyTerm {
  return ConverterPresets.standardApiResponse(ontologyTerm, { dateFields: [] }) as OntologyTerm;
}

/**
 * Convert OrderSetItem domain entity to API response
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
export function orderSetItemToApi(orderSetItem: OrderSetItem): OrderSetItem {
  return ConverterPresets.standardApiResponse(orderSetItem, { dateFields: ["createdAt", "updatedAt"] }) as OrderSetItem;
}

/**
 * Convert OrderSetTemplateInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function orderSetTemplateInputToApi(orderSetTemplateInput: OrderSetTemplateInput): OrderSetTemplateInput {
  return ConverterPresets.standardApiResponse(orderSetTemplateInput, { dateFields: [] }) as OrderSetTemplateInput;
}

/**
 * Convert OrderSetTemplateUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function orderSetTemplateUpdateToApi(orderSetTemplateUpdate: OrderSetTemplateUpdate): OrderSetTemplateUpdate {
  return ConverterPresets.standardApiResponse(orderSetTemplateUpdate, { dateFields: [] }) as OrderSetTemplateUpdate;
}

/**
 * Convert PerformanceMetric domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `date`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function performanceMetricToApi(performanceMetric: PerformanceMetric): PerformanceMetric {
  return ConverterPresets.standardApiResponse(performanceMetric, { dateFields: ["createdAt", "date", "updatedAt"] }) as PerformanceMetric;
}

/**
 * Convert ProtocolStep domain entity to API response
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
export function protocolStepToApi(protocolStep: ProtocolStep): ProtocolStep {
  return ConverterPresets.standardApiResponse(protocolStep, { dateFields: ["createdAt", "updatedAt"] }) as ProtocolStep;
}

/**
 * Convert QuestionnaireQuestion domain entity to API response
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
export function questionnaireQuestionToApi(questionnaireQuestion: QuestionnaireQuestion): QuestionnaireQuestion {
  return ConverterPresets.standardApiResponse(questionnaireQuestion, { dateFields: ["createdAt", "updatedAt"] }) as QuestionnaireQuestion;
}

/**
 * Convert QuestionnaireTemplateInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function questionnaireTemplateInputToApi(questionnaireTemplateInput: QuestionnaireTemplateInput): QuestionnaireTemplateInput {
  return ConverterPresets.standardApiResponse(questionnaireTemplateInput, { dateFields: [] }) as QuestionnaireTemplateInput;
}

/**
 * Convert QuestionnaireTemplateUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function questionnaireTemplateUpdateToApi(questionnaireTemplateUpdate: QuestionnaireTemplateUpdate): QuestionnaireTemplateUpdate {
  return ConverterPresets.standardApiResponse(questionnaireTemplateUpdate, { dateFields: [] }) as QuestionnaireTemplateUpdate;
}

/**
 * Convert RuleSetInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function ruleSetInputToApi(ruleSetInput: RuleSetInput): RuleSetInput {
  return ConverterPresets.standardApiResponse(ruleSetInput, { dateFields: [] }) as RuleSetInput;
}

/**
 * Convert RuleSetUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function ruleSetUpdateToApi(ruleSetUpdate: RuleSetUpdate): RuleSetUpdate {
  return ConverterPresets.standardApiResponse(ruleSetUpdate, { dateFields: [] }) as RuleSetUpdate;
}

/**
 * Convert RuleTest domain entity to API response
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
export function ruleTestToApi(ruleTest: RuleTest): RuleTest {
  return ConverterPresets.standardApiResponse(ruleTest, { dateFields: ["createdAt", "updatedAt"] }) as RuleTest;
}

/**
 * Convert ScoringItem domain entity to API response
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
export function scoringItemToApi(scoringItem: ScoringItem): ScoringItem {
  return ConverterPresets.standardApiResponse(scoringItem, { dateFields: ["createdAt", "updatedAt"] }) as ScoringItem;
}

/**
 * Convert ScoringTemplateInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function scoringTemplateInputToApi(scoringTemplateInput: ScoringTemplateInput): ScoringTemplateInput {
  return ConverterPresets.standardApiResponse(scoringTemplateInput, { dateFields: [] }) as ScoringTemplateInput;
}

/**
 * Convert ScoringTemplateUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function scoringTemplateUpdateToApi(scoringTemplateUpdate: ScoringTemplateUpdate): ScoringTemplateUpdate {
  return ConverterPresets.standardApiResponse(scoringTemplateUpdate, { dateFields: [] }) as ScoringTemplateUpdate;
}

/**
 * Convert TermMapping domain entity to API response
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
export function termMappingToApi(termMapping: TermMapping): TermMapping {
  return ConverterPresets.standardApiResponse(termMapping, { dateFields: ["createdAt", "updatedAt"] }) as TermMapping;
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

/**
 * Convert ValueSetCode domain entity to API response
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
export function valueSetCodeToApi(valueSetCode: ValueSetCode): ValueSetCode {
  return ConverterPresets.standardApiResponse(valueSetCode, { dateFields: ["createdAt", "updatedAt"] }) as ValueSetCode;
}

/**
 * Convert ValueSetInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function valueSetInputToApi(valueSetInput: ValueSetInput): ValueSetInput {
  return ConverterPresets.standardApiResponse(valueSetInput, { dateFields: [] }) as ValueSetInput;
}

/**
 * Convert ValueSetUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function valueSetUpdateToApi(valueSetUpdate: ValueSetUpdate): ValueSetUpdate {
  return ConverterPresets.standardApiResponse(valueSetUpdate, { dateFields: [] }) as ValueSetUpdate;
}
