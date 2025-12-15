#!/usr/bin/env node
/**
 * Script to add missing Update*Request imports and fix inputData references
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mapping of *Update to Update*Request types
const typeMappings = {
  'DecisionPolicyUpdate': 'UpdateDecisionPolicyRequest',
  'DecisionResultUpdate': 'UpdateDecisionResultRequest',
  'DecisionSessionUpdate': 'UpdateDecisionSessionRequest',
  'ExperimentUpdate': 'UpdateExperimentRequest',
  'RecommendationUpdate': 'UpdateRecommendationRequest',
  'RiskAssessmentUpdate': 'UpdateRiskAssessmentRequest',
  'SimulationScenarioUpdate': 'UpdateSimulationScenarioRequest',
  'ThresholdProfileUpdate': 'UpdateThresholdProfileRequest',
  // Add all other mappings
  'ConnectionUpdate': 'UpdateConnectionRequest',
  'DataExportBatchUpdate': 'UpdateDataExportBatchRequest',
  'DataImportBatchUpdate': 'UpdateDataImportBatchRequest',
  'EventDeliveryUpdate': 'UpdateEventDeliveryRequest',
  'EventSubscriptionUpdate': 'UpdateEventSubscriptionRequest',
  'ExternalSystemUpdate': 'UpdateExternalSystemRequest',
  'IntegrationJobUpdate': 'UpdateIntegrationJobRequest',
  'InterfaceErrorUpdate': 'UpdateInterfaceErrorRequest',
  'CareProtocolUpdate': 'UpdateCareProtocolTemplateRequest',
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
};

async function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix missing imports - add Update*Request if Update*Request is used but not imported
  for (const [oldType, newType] of Object.entries(typeMappings)) {
    // Check if newType is used in the file
    const usesNewType = new RegExp(`\\b${newType}\\b`).test(content);
    
    if (usesNewType) {
      // Check if it's already imported
      const alreadyImported = new RegExp(`import[^}]*\\b${newType}\\b`).test(content);
      
      if (!alreadyImported) {
        // Find the import statement from @cuur/core
        const importPattern = /(import type\s*\{[^}]*)(\} from "@cuur\/core\/[^"]+")/;
        const match = content.match(importPattern);
        
        if (match) {
          // Add the new type to the import
          const beforeBrace = match[1];
          const afterBrace = match[2];
          
          // Check if there's already a newline before the closing brace
          if (beforeBrace.trim().endsWith(',')) {
            content = content.replace(importPattern, `$1\n  ${newType},$2`);
          } else {
            content = content.replace(importPattern, `$1,\n  ${newType}$2`);
          }
          modified = true;
        }
      }
    }
  }

  // Fix inputData references in update methods - should be 'data' not 'inputData'
  const inputDataPattern = /(async update\([^)]+\)\s*\{[^}]*data:\s*\{[^}]*)\.\.\.inputData/g;
  if (inputDataPattern.test(content)) {
    content = content.replace(inputDataPattern, '$1...data');
    modified = true;
  }

  // More specific pattern for update methods
  const updateMethodPattern = /(async update\([^)]+,\s*data:\s*Update[^)]+\)\s*\{[^}]*data:\s*\{[^}]*)\.\.\.inputData/g;
  if (updateMethodPattern.test(content)) {
    content = content.replace(updateMethodPattern, '$1...data');
    modified = true;
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
