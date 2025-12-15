/**
 * Knowledge Evidence Domain Types
 *
 * Auto-generated from OpenAPI spec
 * Generator: types-generator v2.0.0
 *
 * This file re-exports types from generated OpenAPI types and adds
 * convenient type aliases for handlers (response types, etc.)
 *
 * ⚠️ DO NOT EDIT MANUALLY - this file is auto-generated
 */

import type { components, operations } from "../openapi/knowledge-evidence.openapi.types.js";

// ============================================================================
// Re-export all generated types
// ============================================================================
// Note: components and operations are exported here but should be accessed via namespace
// in main index.ts to avoid duplicate export errors (e.g., blockchain.types.components)

export type { components, operations };

// ============================================================================
// Convenient Type Aliases for Schemas
// ============================================================================

export type CareProtocolTemplate = components["schemas"]["CareProtocolTemplate"];
export type CareProtocolTemplateInput = components["schemas"]["CareProtocolTemplateInput"];
export type CareProtocolTemplateUpdate = components["schemas"]["CareProtocolTemplateUpdate"];
export type ClinicalGuideline = components["schemas"]["ClinicalGuideline"];
export type ClinicalGuidelineInput = components["schemas"]["ClinicalGuidelineInput"];
export type ClinicalGuidelineUpdate = components["schemas"]["ClinicalGuidelineUpdate"];
export type ClinicalRule = components["schemas"]["ClinicalRule"];
export type ClinicalRuleInput = components["schemas"]["ClinicalRuleInput"];
export type ClinicalRuleUpdate = components["schemas"]["ClinicalRuleUpdate"];
export type ClinicalRuleVersion = components["schemas"]["ClinicalRuleVersion"];
export type CodeableConcept = components["schemas"]["CodeableConcept"];
export type Coding = components["schemas"]["Coding"];
export type ConceptMap = components["schemas"]["ConceptMap"];
export type ConceptMapInput = components["schemas"]["ConceptMapInput"];
export type ConceptMapUpdate = components["schemas"]["ConceptMapUpdate"];
export type ConceptMapping = components["schemas"]["ConceptMapping"];
export type EvidenceCitation = components["schemas"]["EvidenceCitation"];
export type EvidenceCitationInput = components["schemas"]["EvidenceCitationInput"];
export type EvidenceCitationUpdate = components["schemas"]["EvidenceCitationUpdate"];
export type EvidenceReview = components["schemas"]["EvidenceReview"];
export type EvidenceReviewInput = components["schemas"]["EvidenceReviewInput"];
export type EvidenceReviewUpdate = components["schemas"]["EvidenceReviewUpdate"];
export type FeatureDefinition = components["schemas"]["FeatureDefinition"];
export type GuidelineSection = components["schemas"]["GuidelineSection"];
export type KnowledgePackage = components["schemas"]["KnowledgePackage"];
export type KnowledgePackageInput = components["schemas"]["KnowledgePackageInput"];
export type KnowledgePackageUpdate = components["schemas"]["KnowledgePackageUpdate"];
export type ModelDefinition = components["schemas"]["ModelDefinition"];
export type ModelDefinitionInput = components["schemas"]["ModelDefinitionInput"];
export type ModelDefinitionUpdate = components["schemas"]["ModelDefinitionUpdate"];
export type ModelTest = components["schemas"]["ModelTest"];
export type ModelVersion = components["schemas"]["ModelVersion"];
export type ModelVersionInput = components["schemas"]["ModelVersionInput"];
export type ModelVersionUpdate = components["schemas"]["ModelVersionUpdate"];
export type OntologyTerm = components["schemas"]["OntologyTerm"];
export type OrderSetItem = components["schemas"]["OrderSetItem"];
export type OrderSetTemplate = components["schemas"]["OrderSetTemplate"];
export type OrderSetTemplateInput = components["schemas"]["OrderSetTemplateInput"];
export type OrderSetTemplateUpdate = components["schemas"]["OrderSetTemplateUpdate"];
export type PerformanceMetric = components["schemas"]["PerformanceMetric"];
export type ProtocolStep = components["schemas"]["ProtocolStep"];
export type QuestionnaireQuestion = components["schemas"]["QuestionnaireQuestion"];
export type QuestionnaireTemplate = components["schemas"]["QuestionnaireTemplate"];
export type QuestionnaireTemplateInput = components["schemas"]["QuestionnaireTemplateInput"];
export type QuestionnaireTemplateUpdate = components["schemas"]["QuestionnaireTemplateUpdate"];
export type RuleSet = components["schemas"]["RuleSet"];
export type RuleSetInput = components["schemas"]["RuleSetInput"];
export type RuleSetUpdate = components["schemas"]["RuleSetUpdate"];
export type RuleTest = components["schemas"]["RuleTest"];
export type ScoringItem = components["schemas"]["ScoringItem"];
export type ScoringTemplate = components["schemas"]["ScoringTemplate"];
export type ScoringTemplateInput = components["schemas"]["ScoringTemplateInput"];
export type ScoringTemplateUpdate = components["schemas"]["ScoringTemplateUpdate"];
export type TermMapping = components["schemas"]["TermMapping"];
export type Timestamps = components["schemas"]["Timestamps"];
export type ValueSet = components["schemas"]["ValueSet"];
export type ValueSetCode = components["schemas"]["ValueSetCode"];
export type ValueSetInput = components["schemas"]["ValueSetInput"];
export type ValueSetUpdate = components["schemas"]["ValueSetUpdate"];
export type ClinicalRuleTest =
  operations["listClinicalRuleTests"]["responses"]["200"]["content"]["application/json"]["data"];
export type RuleSetClinicalRule =
  operations["listRuleSetClinicalRules"]["responses"]["200"]["content"]["application/json"]["data"];
export type Guideline =
  operations["listGuidelines"]["responses"]["200"]["content"]["application/json"]["data"];
export type GuidelineEvidenceCitation =
  operations["listGuidelineEvidenceCitations"]["responses"]["200"]["content"]["application/json"]["data"];
export type CareProtocol =
  operations["listCareProtocols"]["responses"]["200"]["content"]["application/json"]["data"];
export type CareProtocolStep =
  operations["listCareProtocolSteps"]["responses"]["200"]["content"]["application/json"]["data"];
export type CareProtocolOrderSet =
  operations["listCareProtocolOrderSets"]["responses"]["200"]["content"]["application/json"]["data"];
export type OrderSetTemplateItem =
  operations["listOrderSetTemplateItems"]["responses"]["200"]["content"]["application/json"]["data"];
export type ModelDefinitionVersion =
  operations["listModelDefinitionVersions"]["responses"]["200"]["content"]["application/json"]["data"];
export type ModelDefinitionPerformanceMetric =
  operations["listModelDefinitionPerformanceMetrics"]["responses"]["200"]["content"]["application/json"]["data"];
export type ModelVersionTest =
  operations["listModelVersionTests"]["responses"]["200"]["content"]["application/json"]["data"];
export type ModelVersionFeatureDefinition =
  operations["listModelVersionFeatureDefinitions"]["responses"]["200"]["content"]["application/json"]["data"];
export type OntologyTermChild =
  operations["listOntologyTermChildren"]["responses"]["200"]["content"]["application/json"]["data"];
export type OntologyTermParent =
  operations["listOntologyTermParents"]["responses"]["200"]["content"]["application/json"]["data"];
export type OntologyTermMapping =
  operations["listOntologyTermMappings"]["responses"]["200"]["content"]["application/json"]["data"];
export type ConceptMapMapping =
  operations["listConceptMapMappings"]["responses"]["200"]["content"]["application/json"]["data"];
export type ScoringTemplateItem =
  operations["listScoringTemplateItems"]["responses"]["200"]["content"]["application/json"]["data"];
export type QuestionnaireTemplateQuestion =
  operations["listQuestionnaireTemplateQuestions"]["responses"]["200"]["content"]["application/json"]["data"];
export type KnowledgePackageClinicalRule =
  operations["listKnowledgePackageClinicalRules"]["responses"]["200"]["content"]["application/json"]["data"];
export type KnowledgePackageModelDefinition =
  operations["listKnowledgePackageModelDefinitions"]["responses"]["200"]["content"]["application/json"]["data"];
export type KnowledgePackageValueSet =
  operations["listKnowledgePackageValueSets"]["responses"]["200"]["content"]["application/json"]["data"];

// ============================================================================
// Operation Input Types (Request Bodies)
// ============================================================================

// These types represent the input data for create/update operations

export type CreateClinicalRuleInput = NonNullable<
  operations["createClinicalRule"]["requestBody"]
>["content"]["application/json"];
export type UpdateClinicalRuleInput = NonNullable<
  operations["updateClinicalRule"]["requestBody"]
>["content"]["application/json"];
export type CreateRuleSetInput = NonNullable<
  operations["createRuleSet"]["requestBody"]
>["content"]["application/json"];
export type UpdateRuleSetInput = NonNullable<
  operations["updateRuleSet"]["requestBody"]
>["content"]["application/json"];
export type CreateGuidelineInput = NonNullable<
  operations["createGuideline"]["requestBody"]
>["content"]["application/json"];
export type UpdateGuidelineInput = NonNullable<
  operations["updateGuideline"]["requestBody"]
>["content"]["application/json"];
export type CreateCareProtocolInput = NonNullable<
  operations["createCareProtocol"]["requestBody"]
>["content"]["application/json"];
export type UpdateCareProtocolInput = NonNullable<
  operations["updateCareProtocol"]["requestBody"]
>["content"]["application/json"];
export type CreateOrderSetTemplateInput = NonNullable<
  operations["createOrderSetTemplate"]["requestBody"]
>["content"]["application/json"];
export type UpdateOrderSetTemplateInput = NonNullable<
  operations["updateOrderSetTemplate"]["requestBody"]
>["content"]["application/json"];
export type CreateModelDefinitionInput = NonNullable<
  operations["createModelDefinition"]["requestBody"]
>["content"]["application/json"];
export type UpdateModelDefinitionInput = NonNullable<
  operations["updateModelDefinition"]["requestBody"]
>["content"]["application/json"];
export type CreateModelVersionInput = NonNullable<
  operations["createModelVersion"]["requestBody"]
>["content"]["application/json"];
export type UpdateModelVersionInput = NonNullable<
  operations["updateModelVersion"]["requestBody"]
>["content"]["application/json"];
export type CreateValueSetInput = NonNullable<
  operations["createValueSet"]["requestBody"]
>["content"]["application/json"];
export type UpdateValueSetInput = NonNullable<
  operations["updateValueSet"]["requestBody"]
>["content"]["application/json"];
export type CreateConceptMapInput = NonNullable<
  operations["createConceptMap"]["requestBody"]
>["content"]["application/json"];
export type UpdateConceptMapInput = NonNullable<
  operations["updateConceptMap"]["requestBody"]
>["content"]["application/json"];
export type CreateScoringTemplateInput = NonNullable<
  operations["createScoringTemplate"]["requestBody"]
>["content"]["application/json"];
export type UpdateScoringTemplateInput = NonNullable<
  operations["updateScoringTemplate"]["requestBody"]
>["content"]["application/json"];
export type CreateQuestionnaireTemplateInput = NonNullable<
  operations["createQuestionnaireTemplate"]["requestBody"]
>["content"]["application/json"];
export type UpdateQuestionnaireTemplateInput = NonNullable<
  operations["updateQuestionnaireTemplate"]["requestBody"]
>["content"]["application/json"];
export type CreateEvidenceCitationInput = NonNullable<
  operations["createEvidenceCitation"]["requestBody"]
>["content"]["application/json"];
export type UpdateEvidenceCitationInput = NonNullable<
  operations["updateEvidenceCitation"]["requestBody"]
>["content"]["application/json"];
export type CreateEvidenceReviewInput = NonNullable<
  operations["createEvidenceReview"]["requestBody"]
>["content"]["application/json"];
export type UpdateEvidenceReviewInput = NonNullable<
  operations["updateEvidenceReview"]["requestBody"]
>["content"]["application/json"];
export type CreateKnowledgePackageInput = NonNullable<
  operations["createKnowledgePackage"]["requestBody"]
>["content"]["application/json"];
export type UpdateKnowledgePackageInput = NonNullable<
  operations["updateKnowledgePackage"]["requestBody"]
>["content"]["application/json"];

// ============================================================================
// Type Aliases for Repository Interfaces (Update*Request → Update*Input)
// ============================================================================

// These aliases provide backward compatibility for repository interfaces
// that use Update*Request naming convention instead of Update*Input

export type UpdateCareProtocolTemplateRequest = UpdateCareProtocolInput;
export type UpdateClinicalGuidelineRequest = UpdateGuidelineInput;
export type UpdateClinicalRuleRequest = UpdateClinicalRuleInput;
export type UpdateConceptMapRequest = UpdateConceptMapInput;
export type UpdateEvidenceCitationRequest = UpdateEvidenceCitationInput;
export type UpdateEvidenceReviewRequest = UpdateEvidenceReviewInput;
export type UpdateKnowledgePackageRequest = UpdateKnowledgePackageInput;
export type UpdateModelDefinitionRequest = UpdateModelDefinitionInput;
export type UpdateModelVersionRequest = UpdateModelVersionInput;
export type UpdateOrderSetTemplateRequest = UpdateOrderSetTemplateInput;
export type UpdateQuestionnaireTemplateRequest = UpdateQuestionnaireTemplateInput;
export type UpdateRuleSetRequest = UpdateRuleSetInput;
export type UpdateScoringTemplateRequest = UpdateScoringTemplateInput;
export type UpdateValueSetRequest = UpdateValueSetInput;

// ============================================================================
// Operation Parameter Types (Query Parameters)
// ============================================================================

// These types represent query parameters for list/search operations

export type ListClinicalRulesParams = operations["listClinicalRules"]["parameters"]["query"];
export type ListRuleSetsParams = operations["listRuleSets"]["parameters"]["query"];
export type ListGuidelinesParams = operations["listGuidelines"]["parameters"]["query"];
export type ListCareProtocolsParams = operations["listCareProtocols"]["parameters"]["query"];
export type ListOrderSetTemplatesParams =
  operations["listOrderSetTemplates"]["parameters"]["query"];
export type ListModelDefinitionsParams = operations["listModelDefinitions"]["parameters"]["query"];
export type ListModelVersionsParams = operations["listModelVersions"]["parameters"]["query"];
export type SearchOntologyTermsParams = operations["searchOntologyTerms"]["parameters"]["query"];
export type ListValueSetsParams = operations["listValueSets"]["parameters"]["query"];
export type ListConceptMapsParams = operations["listConceptMaps"]["parameters"]["query"];
export type ListScoringTemplatesParams = operations["listScoringTemplates"]["parameters"]["query"];
export type ListQuestionnaireTemplatesParams =
  operations["listQuestionnaireTemplates"]["parameters"]["query"];
export type ListEvidenceCitationsParams =
  operations["listEvidenceCitations"]["parameters"]["query"];
export type ListEvidenceReviewsParams = operations["listEvidenceReviews"]["parameters"]["query"];
export type ListKnowledgePackagesParams =
  operations["listKnowledgePackages"]["parameters"]["query"];

// ============================================================================
// Operation Response Types
// ============================================================================

// These types are used by handlers for type-safe response envelopes

export type ListClinicalRulesResponse =
  operations["listClinicalRules"]["responses"]["200"]["content"]["application/json"];
export type CreateClinicalRuleResponse =
  operations["createClinicalRule"]["responses"]["201"]["content"]["application/json"];
export type GetClinicalRuleResponse =
  operations["getClinicalRule"]["responses"]["200"]["content"]["application/json"];
export type UpdateClinicalRuleResponse =
  operations["updateClinicalRule"]["responses"]["200"]["content"]["application/json"];
export type ListClinicalRuleVersionsResponse =
  operations["listClinicalRuleVersions"]["responses"]["200"]["content"]["application/json"];
export type ListClinicalRuleTestsResponse =
  operations["listClinicalRuleTests"]["responses"]["200"]["content"]["application/json"];
export type ListRuleSetsResponse =
  operations["listRuleSets"]["responses"]["200"]["content"]["application/json"];
export type CreateRuleSetResponse =
  operations["createRuleSet"]["responses"]["201"]["content"]["application/json"];
export type GetRuleSetResponse =
  operations["getRuleSet"]["responses"]["200"]["content"]["application/json"];
export type UpdateRuleSetResponse =
  operations["updateRuleSet"]["responses"]["200"]["content"]["application/json"];
export type ListRuleSetClinicalRulesResponse =
  operations["listRuleSetClinicalRules"]["responses"]["200"]["content"]["application/json"];
export type ListGuidelinesResponse =
  operations["listGuidelines"]["responses"]["200"]["content"]["application/json"];
export type CreateGuidelineResponse =
  operations["createGuideline"]["responses"]["201"]["content"]["application/json"];
export type GetGuidelineResponse =
  operations["getGuideline"]["responses"]["200"]["content"]["application/json"];
export type UpdateGuidelineResponse =
  operations["updateGuideline"]["responses"]["200"]["content"]["application/json"];
export type ListGuidelineSectionsResponse =
  operations["listGuidelineSections"]["responses"]["200"]["content"]["application/json"];
export type ListGuidelineEvidenceCitationsResponse =
  operations["listGuidelineEvidenceCitations"]["responses"]["200"]["content"]["application/json"];
export type ListCareProtocolsResponse =
  operations["listCareProtocols"]["responses"]["200"]["content"]["application/json"];
export type CreateCareProtocolResponse =
  operations["createCareProtocol"]["responses"]["201"]["content"]["application/json"];
export type GetCareProtocolResponse =
  operations["getCareProtocol"]["responses"]["200"]["content"]["application/json"];
export type UpdateCareProtocolResponse =
  operations["updateCareProtocol"]["responses"]["200"]["content"]["application/json"];
export type ListCareProtocolStepsResponse =
  operations["listCareProtocolSteps"]["responses"]["200"]["content"]["application/json"];
export type ListCareProtocolOrderSetsResponse =
  operations["listCareProtocolOrderSets"]["responses"]["200"]["content"]["application/json"];
export type ListOrderSetTemplatesResponse =
  operations["listOrderSetTemplates"]["responses"]["200"]["content"]["application/json"];
export type CreateOrderSetTemplateResponse =
  operations["createOrderSetTemplate"]["responses"]["201"]["content"]["application/json"];
export type GetOrderSetTemplateResponse =
  operations["getOrderSetTemplate"]["responses"]["200"]["content"]["application/json"];
export type UpdateOrderSetTemplateResponse =
  operations["updateOrderSetTemplate"]["responses"]["200"]["content"]["application/json"];
export type ListOrderSetTemplateItemsResponse =
  operations["listOrderSetTemplateItems"]["responses"]["200"]["content"]["application/json"];
export type ListModelDefinitionsResponse =
  operations["listModelDefinitions"]["responses"]["200"]["content"]["application/json"];
export type CreateModelDefinitionResponse =
  operations["createModelDefinition"]["responses"]["201"]["content"]["application/json"];
export type GetModelDefinitionResponse =
  operations["getModelDefinition"]["responses"]["200"]["content"]["application/json"];
export type UpdateModelDefinitionResponse =
  operations["updateModelDefinition"]["responses"]["200"]["content"]["application/json"];
export type ListModelDefinitionVersionsResponse =
  operations["listModelDefinitionVersions"]["responses"]["200"]["content"]["application/json"];
export type ListModelDefinitionPerformanceMetricsResponse =
  operations["listModelDefinitionPerformanceMetrics"]["responses"]["200"]["content"]["application/json"];
export type ListModelVersionsResponse =
  operations["listModelVersions"]["responses"]["200"]["content"]["application/json"];
export type CreateModelVersionResponse =
  operations["createModelVersion"]["responses"]["201"]["content"]["application/json"];
export type GetModelVersionResponse =
  operations["getModelVersion"]["responses"]["200"]["content"]["application/json"];
export type UpdateModelVersionResponse =
  operations["updateModelVersion"]["responses"]["200"]["content"]["application/json"];
export type ListModelVersionTestsResponse =
  operations["listModelVersionTests"]["responses"]["200"]["content"]["application/json"];
export type ListModelVersionFeatureDefinitionsResponse =
  operations["listModelVersionFeatureDefinitions"]["responses"]["200"]["content"]["application/json"];
export type SearchOntologyTermsResponse =
  operations["searchOntologyTerms"]["responses"]["200"]["content"]["application/json"];
export type GetOntologyTermResponse =
  operations["getOntologyTerm"]["responses"]["200"]["content"]["application/json"];
export type ListOntologyTermChildrenResponse =
  operations["listOntologyTermChildren"]["responses"]["200"]["content"]["application/json"];
export type ListOntologyTermParentsResponse =
  operations["listOntologyTermParents"]["responses"]["200"]["content"]["application/json"];
export type ListOntologyTermMappingsResponse =
  operations["listOntologyTermMappings"]["responses"]["200"]["content"]["application/json"];
export type ListValueSetsResponse =
  operations["listValueSets"]["responses"]["200"]["content"]["application/json"];
export type CreateValueSetResponse =
  operations["createValueSet"]["responses"]["201"]["content"]["application/json"];
export type GetValueSetResponse =
  operations["getValueSet"]["responses"]["200"]["content"]["application/json"];
export type UpdateValueSetResponse =
  operations["updateValueSet"]["responses"]["200"]["content"]["application/json"];
export type ListValueSetCodesResponse =
  operations["listValueSetCodes"]["responses"]["200"]["content"]["application/json"];
export type ListConceptMapsResponse =
  operations["listConceptMaps"]["responses"]["200"]["content"]["application/json"];
export type CreateConceptMapResponse =
  operations["createConceptMap"]["responses"]["201"]["content"]["application/json"];
export type GetConceptMapResponse =
  operations["getConceptMap"]["responses"]["200"]["content"]["application/json"];
export type UpdateConceptMapResponse =
  operations["updateConceptMap"]["responses"]["200"]["content"]["application/json"];
export type ListConceptMapMappingsResponse =
  operations["listConceptMapMappings"]["responses"]["200"]["content"]["application/json"];
export type ListScoringTemplatesResponse =
  operations["listScoringTemplates"]["responses"]["200"]["content"]["application/json"];
export type CreateScoringTemplateResponse =
  operations["createScoringTemplate"]["responses"]["201"]["content"]["application/json"];
export type GetScoringTemplateResponse =
  operations["getScoringTemplate"]["responses"]["200"]["content"]["application/json"];
export type UpdateScoringTemplateResponse =
  operations["updateScoringTemplate"]["responses"]["200"]["content"]["application/json"];
export type ListScoringTemplateItemsResponse =
  operations["listScoringTemplateItems"]["responses"]["200"]["content"]["application/json"];
export type ListQuestionnaireTemplatesResponse =
  operations["listQuestionnaireTemplates"]["responses"]["200"]["content"]["application/json"];
export type CreateQuestionnaireTemplateResponse =
  operations["createQuestionnaireTemplate"]["responses"]["201"]["content"]["application/json"];
export type GetQuestionnaireTemplateResponse =
  operations["getQuestionnaireTemplate"]["responses"]["200"]["content"]["application/json"];
export type UpdateQuestionnaireTemplateResponse =
  operations["updateQuestionnaireTemplate"]["responses"]["200"]["content"]["application/json"];
export type ListQuestionnaireTemplateQuestionsResponse =
  operations["listQuestionnaireTemplateQuestions"]["responses"]["200"]["content"]["application/json"];
export type ListEvidenceCitationsResponse =
  operations["listEvidenceCitations"]["responses"]["200"]["content"]["application/json"];
export type CreateEvidenceCitationResponse =
  operations["createEvidenceCitation"]["responses"]["201"]["content"]["application/json"];
export type GetEvidenceCitationResponse =
  operations["getEvidenceCitation"]["responses"]["200"]["content"]["application/json"];
export type UpdateEvidenceCitationResponse =
  operations["updateEvidenceCitation"]["responses"]["200"]["content"]["application/json"];
export type ListEvidenceReviewsResponse =
  operations["listEvidenceReviews"]["responses"]["200"]["content"]["application/json"];
export type CreateEvidenceReviewResponse =
  operations["createEvidenceReview"]["responses"]["201"]["content"]["application/json"];
export type GetEvidenceReviewResponse =
  operations["getEvidenceReview"]["responses"]["200"]["content"]["application/json"];
export type UpdateEvidenceReviewResponse =
  operations["updateEvidenceReview"]["responses"]["200"]["content"]["application/json"];
export type ListKnowledgePackagesResponse =
  operations["listKnowledgePackages"]["responses"]["200"]["content"]["application/json"];
export type CreateKnowledgePackageResponse =
  operations["createKnowledgePackage"]["responses"]["201"]["content"]["application/json"];
export type GetKnowledgePackageResponse =
  operations["getKnowledgePackage"]["responses"]["200"]["content"]["application/json"];
export type UpdateKnowledgePackageResponse =
  operations["updateKnowledgePackage"]["responses"]["200"]["content"]["application/json"];
export type ListKnowledgePackageClinicalRulesResponse =
  operations["listKnowledgePackageClinicalRules"]["responses"]["200"]["content"]["application/json"];
export type ListKnowledgePackageModelDefinitionsResponse =
  operations["listKnowledgePackageModelDefinitions"]["responses"]["200"]["content"]["application/json"];
export type ListKnowledgePackageValueSetsResponse =
  operations["listKnowledgePackageValueSets"]["responses"]["200"]["content"]["application/json"];
