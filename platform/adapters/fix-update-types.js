#!/usr/bin/env node
/**
 * Script to fix update method parameter types in DAO repositories
 * Changes *Update types to Update*Request types to match repository interfaces
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mapping of *Update to Update*Request types
// Pattern: EntityNameUpdate -> UpdateEntityNameRequest
const typeMappings = {
  // decision-intelligence
  'AlertEvaluationUpdate': 'UpdateAlertEvaluationRequest',
  'DecisionPolicyUpdate': 'UpdateDecisionPolicyRequest',
  'DecisionResultUpdate': 'UpdateDecisionResultRequest',
  'DecisionSessionUpdate': 'UpdateDecisionSessionRequest',
  'ExperimentUpdate': 'UpdateExperimentRequest',
  'RecommendationUpdate': 'UpdateRecommendationRequest',
  'RiskAssessmentUpdate': 'UpdateRiskAssessmentRequest',
  'SimulationScenarioUpdate': 'UpdateSimulationScenarioRequest',
  'ThresholdProfileUpdate': 'UpdateThresholdProfileRequest',
  // integration-interoperability
  'APIClientUpdate': 'UpdateAPIClientRequest',
  'APICredentialUpdate': 'UpdateAPICredentialRequest',
  'ConnectionUpdate': 'UpdateConnectionRequest',
  'DataExportBatchUpdate': 'UpdateDataExportBatchRequest',
  'DataImportBatchUpdate': 'UpdateDataImportBatchRequest',
  'EventDeliveryUpdate': 'UpdateEventDeliveryRequest',
  'EventSubscriptionUpdate': 'UpdateEventSubscriptionRequest',
  'ExternalSystemUpdate': 'UpdateExternalSystemRequest',
  'FHIRMappingProfileUpdate': 'UpdateFHIRMappingProfileRequest',
  'HL7MappingProfileUpdate': 'UpdateHL7MappingProfileRequest',
  'IntegrationJobUpdate': 'UpdateIntegrationJobRequest',
  'InterfaceErrorUpdate': 'UpdateInterfaceErrorRequest',
  // knowledge-evidence
  'CareProtocolUpdate': 'UpdateCareProtocolTemplateRequest',
  'ClinicalGuidelineUpdate': 'UpdateClinicalGuidelineRequest',
  'ClinicalRuleUpdate': 'UpdateClinicalRuleRequest',
  'ConceptMapUpdate': 'UpdateConceptMapRequest',
  'EvidenceCitationUpdate': 'UpdateEvidenceCitationRequest',
  'EvidenceReviewUpdate': 'UpdateEvidenceReviewRequest',
  'KnowledgePackageUpdate': 'UpdateKnowledgePackageRequest',
  'ModelDefinitionUpdate': 'UpdateModelDefinitionRequest',
  'ModelVersionUpdate': 'UpdateModelVersionRequest',
  'OrderSetTemplateUpdate': 'UpdateOrderSetTemplateRequest',
  'QuestionnaireTemplateUpdate': 'UpdateQuestionnaireTemplateRequest',
  'RuleSetUpdate': 'UpdateRuleSetRequest',
  'ScoringTemplateUpdate': 'UpdateScoringTemplateRequest',
  'ValueSetUpdate': 'UpdateValueSetRequest',
  // patient-clinical-data
  'AllergyUpdate': 'UpdateAllergyRequest',
  'CareTeamUpdate': 'UpdateCareTeamRequest',
  'ClinicalNoteUpdate': 'UpdateClinicalNoteRequest',
  'ConditionUpdate': 'UpdateConditionRequest',
  'DiagnosticReportUpdate': 'UpdateDiagnosticReportRequest',
  'DocumentReferenceUpdate': 'UpdateDocumentReferenceRequest',
  'EncounterUpdate': 'UpdateEncounterRequest',
  'ImagingStudyUpdate': 'UpdateImagingStudyRequest',
  'ImmunizationUpdate': 'UpdateImmunizationRequest',
  'MedicationOrderUpdate': 'UpdateMedicationOrderRequest',
  'MedicationStatementUpdate': 'UpdateMedicationStatementRequest',
  'ObservationUpdate': 'UpdateObservationRequest',
  'PatientUpdate': 'UpdatePatientRequest',
  'ProcedureUpdate': 'UpdateProcedureRequest',
  // workflow-care-pathways
  'AlertUpdate': 'UpdateAlertRequest',
  'CarePathwayTemplateUpdate': 'UpdateCarePathwayTemplateRequest',
  'CarePlanUpdate': 'UpdateCarePlanRequest',
  'ChecklistInstanceUpdate': 'UpdateChecklistInstanceRequest',
  'ChecklistTemplateUpdate': 'UpdateChecklistTemplateRequest',
  'EpisodeOfCareUpdate': 'UpdateEpisodeOfCareRequest',
  'EscalationPolicyUpdate': 'UpdateEscalationPolicyRequest',
  'HandoffUpdate': 'UpdateHandoffRequest',
  'RoutingRuleUpdate': 'UpdateRoutingRuleRequest',
  'ScheduleTemplateUpdate': 'UpdateScheduleTemplateRequest',
  'TaskUpdate': 'UpdateTaskRequest',
  'TaskAssignmentUpdate': 'UpdateTaskAssignmentRequest',
  'WorkflowDefinitionUpdate': 'UpdateWorkflowDefinitionRequest',
  'WorkflowInstanceUpdate': 'UpdateWorkflowInstanceRequest',
  'WorkQueueUpdate': 'UpdateWorkQueueRequest',
};

async function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix imports
  for (const [oldType, newType] of Object.entries(typeMappings)) {
    const importPattern = new RegExp(`(import type\\{[^}]*)\\b${oldType}\\b([^}]*\\} from)`, 'g');
    if (importPattern.test(content)) {
      content = content.replace(importPattern, `$1${newType}$2`);
      modified = true;
    }
  }

  // Fix method signatures
  for (const [oldType, newType] of Object.entries(typeMappings)) {
    const methodPattern = new RegExp(`(async update\\([^:]+:\\s*[^,]+,\\s*[^:]+:\\s*[^,]+,\\s*data:\\s*)\\b${oldType}\\b(\\s*\\):)`, 'g');
    if (methodPattern.test(content)) {
      content = content.replace(methodPattern, `$1${newType}$2`);
      modified = true;
    }
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

async function main() {
  const files = await glob('src/**/*.dao.repository.ts', {
    cwd: __dirname,
    absolute: true,
  });

  let fixedCount = 0;
  for (const file of files) {
    if (await fixFile(file)) {
      fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} files`);
}

main().catch(console.error);
