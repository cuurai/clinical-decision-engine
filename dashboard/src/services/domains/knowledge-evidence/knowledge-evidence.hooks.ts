import { useResourceHook } from "../../core/use-resource";
import { knowledgeEvidenceServices } from "./knowledge-evidence.service";
import type {
  ClinicalRule,
  CreateClinicalRuleInput,
  UpdateClinicalRuleInput,
  Guideline,
  CreateGuidelineInput,
  UpdateGuidelineInput,
  CareProtocol,
  CreateCareProtocolInput,
  UpdateCareProtocolInput,
  ModelDefinition,
  CreateModelDefinitionInput,
  UpdateModelDefinitionInput,
  OntologyTerm,
  CreateOntologyTermInput,
  UpdateOntologyTermInput,
  ValueSet,
  CreateValueSetInput,
  UpdateValueSetInput,
  ConceptMap,
  CreateConceptMapInput,
  UpdateConceptMapInput,
  KnowledgePackage,
  CreateKnowledgePackageInput,
  UpdateKnowledgePackageInput,
  ClinicalRuleListParams,
  GuidelineListParams,
  CareProtocolListParams,
  ModelDefinitionListParams,
  OntologyTermListParams,
  ValueSetListParams,
  ConceptMapListParams,
  KnowledgePackageListParams,
} from "./knowledge-evidence.types";

export function useClinicalRules(autoFetch = true, params?: ClinicalRuleListParams) {
  return useResourceHook<
    ClinicalRule,
    CreateClinicalRuleInput,
    UpdateClinicalRuleInput,
    ClinicalRuleListParams
  >(knowledgeEvidenceServices.clinicalRules, autoFetch, params);
}

export function useGuidelines(autoFetch = true, params?: GuidelineListParams) {
  return useResourceHook<
    Guideline,
    CreateGuidelineInput,
    UpdateGuidelineInput,
    GuidelineListParams
  >(knowledgeEvidenceServices.guidelines, autoFetch, params);
}

export function useCareProtocols(autoFetch = true, params?: CareProtocolListParams) {
  return useResourceHook<
    CareProtocol,
    CreateCareProtocolInput,
    UpdateCareProtocolInput,
    CareProtocolListParams
  >(knowledgeEvidenceServices.careProtocols, autoFetch, params);
}

export function useModelDefinitions(autoFetch = true, params?: ModelDefinitionListParams) {
  return useResourceHook<
    ModelDefinition,
    CreateModelDefinitionInput,
    UpdateModelDefinitionInput,
    ModelDefinitionListParams
  >(knowledgeEvidenceServices.modelDefinitions, autoFetch, params);
}

export function useOntologyTerms(autoFetch = true, params?: OntologyTermListParams) {
  return useResourceHook<
    OntologyTerm,
    CreateOntologyTermInput,
    UpdateOntologyTermInput,
    OntologyTermListParams
  >(knowledgeEvidenceServices.ontologyTerms, autoFetch, params);
}

export function useValueSets(autoFetch = true, params?: ValueSetListParams) {
  return useResourceHook<
    ValueSet,
    CreateValueSetInput,
    UpdateValueSetInput,
    ValueSetListParams
  >(knowledgeEvidenceServices.valueSets, autoFetch, params);
}

export function useConceptMaps(autoFetch = true, params?: ConceptMapListParams) {
  return useResourceHook<
    ConceptMap,
    CreateConceptMapInput,
    UpdateConceptMapInput,
    ConceptMapListParams
  >(knowledgeEvidenceServices.conceptMaps, autoFetch, params);
}

export function useKnowledgePackages(autoFetch = true, params?: KnowledgePackageListParams) {
  return useResourceHook<
    KnowledgePackage,
    CreateKnowledgePackageInput,
    UpdateKnowledgePackageInput,
    KnowledgePackageListParams
  >(knowledgeEvidenceServices.knowledgePackages, autoFetch, params);
}
