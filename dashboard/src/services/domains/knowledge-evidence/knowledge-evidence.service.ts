import { createResourceService } from "../../core/resource-service";
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
} from "./knowledge-evidence.types";

// Knowledge & Evidence Services
export const clinicalRulesService = createResourceService<
  ClinicalRule,
  CreateClinicalRuleInput,
  UpdateClinicalRuleInput
>("/clinical-rules");

export const guidelinesService = createResourceService<
  Guideline,
  CreateGuidelineInput,
  UpdateGuidelineInput
>("/guidelines");

export const careProtocolsService = createResourceService<
  CareProtocol,
  CreateCareProtocolInput,
  UpdateCareProtocolInput
>("/care-protocols");

export const modelDefinitionsService = createResourceService<
  ModelDefinition,
  CreateModelDefinitionInput,
  UpdateModelDefinitionInput
>("/model-definitions");

export const ontologyTermsService = createResourceService<
  OntologyTerm,
  CreateOntologyTermInput,
  UpdateOntologyTermInput
>("/ontology-terms");

export const valueSetsService = createResourceService<
  ValueSet,
  CreateValueSetInput,
  UpdateValueSetInput
>("/value-sets");

export const conceptMapsService = createResourceService<
  ConceptMap,
  CreateConceptMapInput,
  UpdateConceptMapInput
>("/concept-maps");

export const knowledgePackagesService = createResourceService<
  KnowledgePackage,
  CreateKnowledgePackageInput,
  UpdateKnowledgePackageInput
>("/knowledge-packages");

export const knowledgeEvidenceServices = {
  clinicalRules: clinicalRulesService,
  guidelines: guidelinesService,
  careProtocols: careProtocolsService,
  modelDefinitions: modelDefinitionsService,
  ontologyTerms: ontologyTermsService,
  valueSets: valueSetsService,
  conceptMaps: conceptMapsService,
  knowledgePackages: knowledgePackagesService,
};
