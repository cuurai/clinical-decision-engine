import { ListParams, ListResponse } from "../../core/resource-service";
import type {
  ClinicalRule,
  ClinicalRuleInput,
  ClinicalRuleUpdate,
  Guideline,
  CareProtocol,
  ModelDefinition,
  ModelDefinitionInput,
  ModelDefinitionUpdate,
  OntologyTerm,
  ValueSet,
  ValueSetInput,
  ValueSetUpdate,
  ConceptMap,
  ConceptMapInput,
  ConceptMapUpdate,
  KnowledgePackage,
  KnowledgePackageInput,
  KnowledgePackageUpdate,
  ListClinicalRulesParams,
  ListGuidelinesParams,
  ListCareProtocolsParams,
  ListModelDefinitionsParams,
  ListOntologyTermsParams,
  ListValueSetsParams,
  ListConceptMapsParams,
  ListKnowledgePackagesParams,
} from "@cuur/core/knowledge-evidence/types";

// Re-export types from core
export type {
  ClinicalRule,
  Guideline,
  CareProtocol,
  ModelDefinition,
  OntologyTerm,
  ValueSet,
  ConceptMap,
  KnowledgePackage,
};

// Input types
export type CreateClinicalRuleInput = ClinicalRuleInput;
export type UpdateClinicalRuleInput = ClinicalRuleUpdate;
export type CreateGuidelineInput = Partial<Guideline>;
export type UpdateGuidelineInput = Partial<Guideline>;
export type CreateCareProtocolInput = Partial<CareProtocol>;
export type UpdateCareProtocolInput = Partial<CareProtocol>;
export type CreateModelDefinitionInput = ModelDefinitionInput;
export type UpdateModelDefinitionInput = ModelDefinitionUpdate;
export type CreateOntologyTermInput = Partial<OntologyTerm>;
export type UpdateOntologyTermInput = Partial<OntologyTerm>;
export type CreateValueSetInput = ValueSetInput;
export type UpdateValueSetInput = ValueSetUpdate;
export type CreateConceptMapInput = ConceptMapInput;
export type UpdateConceptMapInput = ConceptMapUpdate;
export type CreateKnowledgePackageInput = KnowledgePackageInput;
export type UpdateKnowledgePackageInput = KnowledgePackageUpdate;

// List params and response types
export type ClinicalRuleListParams = ListClinicalRulesParams & ListParams;
export type ClinicalRuleListResponse = ListResponse<ClinicalRule>;
export type GuidelineListParams = ListGuidelinesParams & ListParams;
export type GuidelineListResponse = ListResponse<Guideline>;
export type CareProtocolListParams = ListCareProtocolsParams & ListParams;
export type CareProtocolListResponse = ListResponse<CareProtocol>;
export type ModelDefinitionListParams = ListModelDefinitionsParams & ListParams;
export type ModelDefinitionListResponse = ListResponse<ModelDefinition>;
export type OntologyTermListParams = ListOntologyTermsParams & ListParams;
export type OntologyTermListResponse = ListResponse<OntologyTerm>;
export type ValueSetListParams = ListValueSetsParams & ListParams;
export type ValueSetListResponse = ListResponse<ValueSet>;
export type ConceptMapListParams = ListConceptMapsParams & ListParams;
export type ConceptMapListResponse = ListResponse<ConceptMap>;
export type KnowledgePackageListParams = ListKnowledgePackagesParams & ListParams;
export type KnowledgePackageListResponse = ListResponse<KnowledgePackage>;
