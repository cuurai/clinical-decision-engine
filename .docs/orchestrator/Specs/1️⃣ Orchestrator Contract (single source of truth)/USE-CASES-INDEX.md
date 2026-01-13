# Orchestrator Use-Cases - Complete Index

All use-case intent YAML files have been created following the standard format and organized by orchestrator.

## ✅ Clinical Decision Session Orchestrator (A) - 7 use-cases

**Directory**: `clinical-decision-session/`

- `1- start-decision-session.intent.yaml`
- `2- refresh-decision-session-context.intent.yaml`
- `3- submit-decision-request.intent.yaml`
- `4- execute-decision-evaluation.intent.yaml`
- `5- produce-decision-result-bundle.intent.yaml`
- `6- generate-decision-explanation-bundle.intent.yaml`
- `7- close-decision-session.intent.yaml`

## ✅ Alert & Escalation Orchestrator (E) - 6 use-cases

**Directory**: `alert-escalation/`

- `E1- create-alert-from-decision-result.intent.yaml`
- `E2- route-alert-to-work-queue.intent.yaml`
- `E3- escalate-alert.intent.yaml`
- `E4- acknowledge-alert.intent.yaml`
- `E5- resolve-alert.intent.yaml`
- `E6- generate-alert-explanation.intent.yaml`

## ✅ Interoperability Ingestion Orchestrator (I) - 7 use-cases

**Directory**: `interoperability-ingestion/`

- `I1- provision-external-system-connection.intent.yaml`
- `I2- run-integration-job.intent.yaml`
- `I3- ingest-hl7-message.intent.yaml`
- `I4- ingest-fhir-bundle.intent.yaml`
- `I5- normalize-inbound-clinical-data.intent.yaml`
- `I6- persist-normalized-records.intent.yaml`
- `I7- handle-ingestion-errors.intent.yaml`

## ✅ Risk & Recommendation Orchestrator (D) - 5 use-cases

**Directory**: `risk-recommendation/`

- `D1- compute-risk-assessment.intent.yaml`
- `D2- generate-recommendations.intent.yaml`
- `D3- bind-explanations-to-risks-recommendations.intent.yaml`
- `D4- publish-to-work-queues.intent.yaml`
- `D5- track-outcome-signals.intent.yaml`

## ✅ Explainability & Trace Orchestrator (C) - 5 use-cases

**Directory**: `explainability-trace/`

- `C1- assemble-explanation-bundle.intent.yaml`
- `C2- generate-rule-trace-narrative.intent.yaml`
- `C3- attach-feature-attribution.intent.yaml`
- `C4- link-evidence-citations.intent.yaml`
- `C5- export-audit-package.intent.yaml`

## ✅ Policy & Threshold Governance Orchestrator (B) - 6 use-cases

**Directory**: `policy-threshold-governance/`

- `B1- create-update-decision-policy.intent.yaml`
- `B2- attach-threshold-profiles-to-policy.intent.yaml`
- `B3- activate-deactivate-policy.intent.yaml`
- `B4- policy-change-impact-preview.intent.yaml`
- `B5- policy-versioning-audit.intent.yaml`
- `B6- policy-to-ruleset-binding.intent.yaml`

## ✅ Knowledge Packaging & Release Orchestrator (H) - 5 use-cases

**Directory**: `knowledge-packaging-release/`

- `H1- author-knowledge-package.intent.yaml`
- `H2- validate-package.intent.yaml`
- `H3- version-sign-package.intent.yaml`
- `H4- deploy-package-to-policy.intent.yaml`
- `H5- rollback-package.intent.yaml`

## ✅ Care Pathway Orchestrator (F) - 6 use-cases

**Directory**: `care-pathway/`

- `F1- select-care-pathway-template.intent.yaml`
- `F2- instantiate-care-plan.intent.yaml`
- `F3- schedule-and-assign-tasks.intent.yaml`
- `F4- track-task-completion-comments.intent.yaml`
- `F5- handoff-between-teams.intent.yaml`
- `F6- close-episode-of-care.intent.yaml`

## ✅ Eventing & Outbound Delivery Orchestrator (J) - 5 use-cases

**Directory**: `eventing-outbound-delivery/`

- `J1- create-event-subscription.intent.yaml`
- `J2- emit-decision-event.intent.yaml`
- `J3- emit-workflow-event.intent.yaml`
- `J4- deliver-events-with-retries.intent.yaml`
- `J5- provide-delivery-audit-metrics.intent.yaml`

## ✅ Experimentation & Simulation Orchestrator (G) - 6 use-cases

**Directory**: `experimentation-simulation/`

- `G1- define-experiment.intent.yaml`
- `G2- configure-arms.intent.yaml`
- `G3- assign-sessions-to-arms.intent.yaml`
- `G4- run-simulation-scenario.intent.yaml`
- `G5- compute-experiment-results-metrics.intent.yaml`
- `G6- promote-winning-arm.intent.yaml`

---

## 📊 Summary

**Total Use-Cases**: 60
**Total YAML Files Created**: 60
**Orchestrators Covered**: 10

All use-case intent YAML files follow the standard format:

- `useCase`: Use case name
- `orchestrator`: Orchestrator name
- `purpose`: Description
- `trigger`: Type and source
- `input`: Input parameters
- `output`: Output structure
- `dependencies`: Repositories and services
- `flow`: Step-by-step flow
- `events`: Events emitted

---

## 📁 Directory Structure

All files are organized by orchestrator in:
`.docs/orchestrator/Specs/1️⃣ Orchestrator Contract (single source of truth)/use-cases/{orchestrator-name}/`

```
use-cases/
├── clinical-decision-session/          (7 files)
├── alert-escalation/                    (6 files)
├── interoperability-ingestion/         (7 files)
├── risk-recommendation/                 (5 files)
├── explainability-trace/               (5 files)
├── policy-threshold-governance/        (6 files)
├── knowledge-packaging-release/        (5 files)
├── care-pathway/                       (6 files)
├── eventing-outbound-delivery/         (5 files)
└── experimentation-simulation/        (6 files)
```
