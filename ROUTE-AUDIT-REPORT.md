# Clinical Decision Engine - Route Audit Report

## Overview

This report provides a comprehensive gap analysis of all UI routes defined in the dashboard against the actual API endpoints.

## Summary Statistics

Based on the latest audit run:

- **Total Routes**: 186
- **✅ Success (200)**: ~50 routes (27%)
- **❌ Not Found (404)**: ~100 routes (54%)
- **💥 Server Error (500)**: ~36 routes (19%)

## Key Findings

### 1. Decision Intelligence Service
**Status**: Mostly Working ✅
- **Working Routes**: 19/33 (58%)
- **Missing Routes**: 14 routes (mostly nested resources)
- **Issues**:
  - Missing nested routes (explanation-features, explanation-rule-traces, etc.)
  - Some simulation and experiment sub-resources not implemented

### 2. Knowledge Evidence Service
**Status**: Partially Working ⚠️
- **Working Routes**: 3/33 (9%)
- **Server Errors**: 12 routes (model access issues)
- **Missing Routes**: 18 routes
- **Critical Issues**:
  - Many routes returning 500 errors due to Prisma model access issues
  - Need to fix DAO repositories to use correct model names (e.g., `clinicalRuleInput` instead of `clinicalRule`)

### 3. Patient Clinical Data Service
**Status**: Partially Working ⚠️
- **Working Routes**: 3/39 (8%)
- **Server Errors**: 12 routes (model access issues)
- **Missing Routes**: 24 routes
- **Critical Issues**:
  - Many patient-scoped routes not implemented (patient-encounters, patient-conditions, etc.)
  - Several core routes returning 500 errors due to model access issues

### 4. Workflow Care Pathways Service
**Status**: Partially Working ⚠️
- **Working Routes**: 1/33 (3%)
- **Server Errors**: 13 routes
- **Missing Routes**: 19 routes
- **Critical Issues**:
  - Most workflow-related routes need implementation
  - Many nested resources missing

### 5. Integration Interoperability Service
**Status**: Partially Working ⚠️
- **Working Routes**: 1/33 (3%)
- **Server Errors**: 13 routes
- **Missing Routes**: 19 routes
- **Critical Issues**:
  - Many integration routes need implementation
  - FHIR/HL7 mapping routes mostly missing

## Detailed Breakdown

### Routes Not Found (404) - ~100 routes

These routes are defined in the UI but not implemented in the backend:

#### Decision Intelligence (14 routes)
- explanation-features
- explanation-rule-traces
- model-invocation-explanations
- simulation-scenario-runs
- simulation-run-decision-results
- simulation-run-metrics
- decision-policy-threshold-profiles
- decision-metric-snapshots
- experiment-arms
- experiment-results

#### Knowledge Evidence (18 routes)
- clinical-rule-versions
- clinical-rule-tests
- rule-set-clinical-rules
- guideline-sections
- care-protocol-steps
- care-protocol-order-sets
- order-set-template-items
- model-definition-versions
- model-definition-performance-metrics
- model-version-tests
- model-version-feature-definitions
- ontology-terms
- ontology-term-children
- ontology-term-parents
- ontology-term-mappings
- value-set-codes
- concept-map-mappings
- scoring-template-items
- questionnaire-template-questions
- knowledge-package-clinical-rules
- knowledge-package-model-definitions
- knowledge-package-value-sets

#### Patient Clinical Data (24 routes)
- patient-summaries
- patient-encounters
- patient-conditions
- patient-allergies
- patient-medications
- patient-immunizations
- patient-observations
- patient-vitals
- patient-labs
- patient-diagnostic-reports
- patient-procedures
- patient-notes
- patient-care-teams
- patient-documents
- encounter-conditions
- encounter-observations
- encounter-diagnostic-reports
- encounter-procedures
- encounter-notes
- condition-notes
- medication-administrations
- diagnostic-report-observations
- diagnostic-report-imaging-studies
- imaging-study-series

#### Workflow Care Pathways (19 routes)
- workflow-definition-states
- workflow-definition-transitions
- workflow-instance-tasks
- workflow-instance-events
- workflow-instance-audit-events
- care-pathway-template-steps
- care-pathway-template-order-set-templates
- care-plan-goals
- care-plan-tasks
- care-plan-checklists
- episodes-of-cares
- episode-of-cares
- episode-of-care-encounters
- episode-of-care-care-plans
- episode-of-care-workflow-instances
- task-comments
- task-audit-events
- alert-explanations
- alert-audit-events
- handoff-tasks
- checklist-template-items
- checklist-instance-items
- escalation-policy-rules
- work-queue-tasks
- work-queue-alerts

#### Integration Interoperability (19 routes)
- external-system-endpoints
- external-system-connections
- external-system-integration-jobs
- connection-health-checks
- connection-integration-jobs
- f-hirbundles
- f-hirbundle-resources
- f-hirmapping-profile-rules
- h-lmessage-segments
- h-lmessage-mapping-results
- h-lmapping-profile-rules
- integration-job-runs
- integration-run-logs
- integration-run-errors
- data-import-batch-records
- data-import-batch-errors
- data-export-batch-files
- data-export-batch-errors
- event-subscription-deliveries
- a-piclients
- a-piclient-credentials
- a-piclient-usage-metrics
- a-picredentials

### Routes with Server Errors (500) - ~36 routes

These routes exist but are failing due to implementation issues:

#### Knowledge Evidence (12 routes)
- clinical-rules
- rule-sets
- guidelines
- care-protocols
- model-definitions
- model-versions
- concept-maps
- scoring-templates
- questionnaire-templates
- evidence-citations
- evidence-reviews
- knowledge-packages

**Root Cause**: Prisma model access issues - DAO repositories accessing wrong model names (e.g., `clinicalRule` instead of `clinicalRuleInput`)

#### Patient Clinical Data (12 routes)
- allergies
- medication-statements
- medication-orders
- immunizations
- diagnostic-reports
- imaging-studies
- procedures
- notes
- care-teams
- documents

**Root Cause**: Similar Prisma model access issues

#### Workflow Care Pathways (13 routes)
- workflow-instances
- care-pathway-templates
- task-assignments
- alerts
- handoffs
- checklist-templates
- checklist-instances
- escalation-policies
- routing-rules
- schedule-templates
- work-queues

**Root Cause**: Prisma model access issues

#### Integration Interoperability (13 routes)
- external-systems
- connections
- fhir-mapping-profiles
- hl7-messages
- hl7-mapping-profiles
- integration-jobs
- integration-runs
- data-import-batches
- data-export-batches
- event-subscriptions
- event-deliveries
- interface-errors
- interface-health-checks

**Root Cause**: Prisma model access issues

## Recommendations

### Immediate Actions (High Priority)

1. **Fix Prisma Model Access Issues** (500 errors)
   - Update all DAO repositories to use correct model names from unified schema
   - Pattern: Change `this.dao.modelName` to `this.dao.modelNameInput`
   - Affects: ~36 routes across all services

2. **Implement Missing Core Routes** (404 errors)
   - Prioritize routes that are most commonly used in the UI
   - Start with nested resources that have parent routes working

### Medium Priority

3. **Implement Patient-Scoped Routes**
   - Many patient-* routes are missing
   - These are likely important for patient data views

4. **Implement Workflow Routes**
   - Workflow management is a core feature
   - Most workflow routes are missing or broken

### Low Priority

5. **Implement Integration Routes**
   - FHIR/HL7 mapping routes
   - Integration job management routes

## Running the Audit

To run the audit script:

```bash
# Bash version (faster)
./scripts/audit-routes.sh

# Node.js version (reads from services.ts automatically)
node scripts/audit-routes.js
```

The report will be saved to `/tmp/route-audit-report-*.txt`

## Next Steps

1. Fix all 500 errors by updating DAO repositories
2. Implement missing routes based on priority
3. Re-run audit to verify fixes
4. Update this report with progress
