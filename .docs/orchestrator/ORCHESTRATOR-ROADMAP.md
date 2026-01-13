# Clinical Decision Engine - Orchestrator Roadmap

## 📋 Complete List of E2E Orchestrators

---

## A) Clinical Decision Session Orchestrator ✅
**Goal**: Run a clinical decisioning "session" for a patient/encounter and produce decisions + artifacts.

**Status**: ✅ **100% Complete** (7/7 use-cases fixed)

### Use Cases:
- [x] **Start Decision Session** - Patient + encounter context bound, reason, scope, policy set
- [x] **Add/Refresh Context Inputs** - Pull latest vitals/labs/notes/meds; freeze snapshot "as-of"
- [x] **Submit Decision Request** - For a specific decision intent: triage, dosing, diagnosis support, etc.
- [x] **Execute Policy Evaluation** - Rules + thresholds + scoring templates + model invocations
- [x] **Produce Decision Result Bundle** - Result + risk assessments + recommendations + alerts
- [x] **Generate Explanation Bundle** - Features + rule traces + model invocation explanations
- [x] **Close Decision Session** - Final state + summary + emitted events

### Cross-Service Building Blocks:
- Patient snapshot/summary: `patients/{id}/summary`, observations, meds, conditions, encounters
- Knowledge: rule sets, clinical rules/versions/tests, scoring templates, model versions/feature defs
- Decision intelligence: decision sessions, requests, results, explanations, model invocations
- Workflow: alerts + audit events + routing/escalation policies
- Integration: event deliveries/subscriptions for outbound

---

## B) Policy & Threshold Governance Orchestrator
**Goal**: Govern decision policies and their threshold profiles (and link them to knowledge assets).

**Status**: ⏳ **Not Started** (0/6 use-cases)

### Use Cases:
- [ ] **Create/Update Decision Policy** - Metadata + scope + eligibility constraints
- [ ] **Attach Threshold Profiles to Policy** - By condition, care setting, org/site, population segment
- [ ] **Activate/Deactivate Policy** - Effective dates, staged rollout
- [ ] **Policy Change Impact Preview** - Simulate effect on recent sessions/cohorts
- [ ] **Policy Versioning + Audit** - Immutable versions, signed approvals
- [ ] **Policy-to-RuleSet Binding** - Policy selects rule-set(s), scoring templates, model versions

### Building Blocks:
- `decision-policies`, `threshold-profiles`, `decision-policy-threshold-profiles`
- `knowledge-packages`, `rule-sets`, `scoring-templates`, `model-versions`

---

## C) Explainability & Trace Orchestrator
**Goal**: Produce a defensible explanation that survives audits and clinical review.

**Status**: ⏳ **Not Started** (0/5 use-cases)

### Use Cases:
- [ ] **Assemble Explanation Bundle for a Decision Result**
- [ ] **Generate Rule Trace Narrative** - What rules fired, in which order, why
- [ ] **Attach Feature Attribution** - Feature list, contributions, missingness handling
- [ ] **Link Evidence Citations to Decision** - Guidelines/sections/citations used
- [ ] **Export Audit Package** - Human readable + machine readable

### Building Blocks:
- `explanations`, `explanation-features`, `explanation-rule-traces`
- `model-invocations` + `model-invocation-explanations`
- `guideline-evidence-citations`, `guideline-sections`, `evidence-citations/reviews`

---

## D) Risk & Recommendation Orchestrator
**Goal**: Convert decisions into structured risk assessments and actionable recommendations.

**Status**: ⏳ **Not Started** (0/5 use-cases)

### Use Cases:
- [ ] **Compute Risk Assessment** - Score + tier + confidence + evidence
- [ ] **Generate Recommendations** - Actions, contraindications, alternatives, next tests
- [ ] **Bind Explanations to Risks/Recommendations** - Traceability
- [ ] **Publish to Work Queues** - Task creation or clinician alert
- [ ] **Track Outcome Signals** - Accepted/rejected/overridden; follow-up results

### Building Blocks:
- `risk-assessments` (+ explanations)
- `recommendations` (+ explanations)
- `workflow-tasks/work-queues/alerts`

---

## E) Alert & Escalation Orchestrator ✅
**Goal**: Ensure alerts reach the right person, are acknowledged, escalated, and audited.

**Status**: ✅ **100% Complete** (6/6 use-cases fixed)

### Use Cases:
- [x] **Create Alert from Decision Result** - Severity, urgency, routing tags
- [x] **Route Alert to Work Queue** - Routing rules + schedule templates + role/team
- [x] **Escalate Alert** - Escalation policy rules + timers
- [x] **Acknowledge/Resolve Alert** - State machine
- [x] **Generate Alert Explanation** - Why this alert, why now
- [x] **Audit Every Transition** - Alert-audit-events immutable

### Building Blocks:
- `alerts`, `alert-explanations`, `alert-audit-events`
- `routing-rules`, `escalation-policies/rules`, `schedule-templates`
- `work-queues/{id}/alerts`

---

## F) Care Pathway Orchestrator
**Goal**: Instantiate a care pathway template into a patient-specific plan, then execute it.

**Status**: ⏳ **Not Started** (0/6 use-cases)

### Use Cases:
- [ ] **Select Care Pathway Template** - Based on decision type, condition, risk tier
- [ ] **Instantiate Care Plan** - Goals, checklists, tasks
- [ ] **Schedule and Assign Tasks** - Assignments, schedules, work queues
- [ ] **Track Task Completion + Comments** - Audit trail
- [ ] **Handoff Between Teams** - Handoffs + handoff tasks
- [ ] **Close Episode of Care** - Episode state, encounter linkage

### Building Blocks:
- `care-pathway-templates` (+ steps + order-set-templates)
- `care-plans` (+ tasks + goals + checklists)
- `episodes-of-care` (+ encounters + workflow instances)
- `handoffs`, `task-assignments`, `tasks`, `workflow-instances`

---

## G) Experimentation & Simulation Orchestrator
**Goal**: Evaluate new policies/models safely via experiments and simulation.

**Status**: ⏳ **Not Started** (0/6 use-cases)

### Use Cases:
- [ ] **Define Experiment** - Hypothesis, target population, KPIs
- [ ] **Configure Arms** - Policy versions, threshold profiles, model versions
- [ ] **Assign Sessions to Arms** - Deterministic bucketing
- [ ] **Run Simulation Scenario** - Replay historical sessions or synthetic cohorts
- [ ] **Compute Experiment Results + Metrics** - Decision metrics, safety metrics
- [ ] **Promote Winning Arm** - Rollout plan, staged activation

### Building Blocks:
- `experiments` + `arms` + `results`
- `simulation-scenarios` + `simulation-runs` + `run-metrics` + `decision-results`
- `decision-metrics` + `metric-snapshots`

---

## H) Knowledge Packaging & Release Orchestrator
**Goal**: Publish coherent bundles of knowledge assets into production.

**Status**: ⏳ **Not Started** (0/5 use-cases)

### Use Cases:
- [ ] **Author Knowledge Package** - Which value sets + rules + models are included
- [ ] **Validate Package** - Rule tests, model tests, value set integrity
- [ ] **Version + Sign Package** - Immutable release artifact
- [ ] **Deploy Package to Policy** - Policy points to package version
- [ ] **Rollback Package** - Fast revert while preserving audit

### Building Blocks:
- `knowledge-packages` (+ clinical rules + model definitions + value sets)
- `clinical-rules` + `versions` + `tests`
- `model-definitions` + `versions` + `performance-metrics` + `tests` + `feature-defs`
- `value-sets` + `codes`

---

## I) Interoperability Ingestion Orchestrator ⚠️
**Goal**: Ingest from external systems, map, normalize, and write into patient clinical data.

**Status**: ⚠️ **29% Complete** (2/7 use-cases fixed)

### Use Cases:
- [x] **Provision External System + Connection** - Domain factories, save() pattern
- [ ] **Run Integration Job** - Import batch / incremental sync
- [x] **Ingest HL7 Message** - Store raw, parse segments, apply mapping profile
- [x] **Ingest FHIR Bundle** - Store, map resources via mapping profile
- [ ] **Write Normalized Records** - Patients/encounters/observations/etc.
- [ ] **Track Errors + Health** - Interface errors, health checks, retry
- [ ] **Idempotent Reprocessing** - Safe reruns, dedupe keys

### Building Blocks:
- `external-systems`, `connections`, `integration-jobs/runs/logs/errors`
- `hl7-messages` + `segments` + `mapping-results` + `hl7-mapping-profiles/rules`
- `fhir-bundles` + `resources` + `fhir-mapping-profiles/rules`
- `data-import-batches/records/errors`

---

## J) Eventing & Outbound Delivery Orchestrator
**Goal**: Publish decisions/alerts/events to subscribers, track deliveries and retries.

**Status**: ⏳ **Not Started** (0/5 use-cases)

### Use Cases:
- [ ] **Create Event Subscription** - Topics, filters, destination
- [ ] **Emit Decision Event** - Decision created/overridden/resolved
- [ ] **Emit Workflow Event** - Task created/completed, alert escalated
- [ ] **Deliver Events with Retries** - Delivery status, error capture
- [ ] **Provide Delivery Audit + Metrics** - Usage metrics, SLA

### Building Blocks:
- `event-subscriptions`, `event-deliveries`, `subscription-deliveries`
- `api-clients/credentials/usage-metrics`

---

## 📊 Overall Progress

**Total Orchestrators**: 10
**Completed**: 2 (20%)
**In Progress**: 1 (10%)
**Not Started**: 7 (70%)

**Total Use-Cases**: 60
**Completed**: 15 (25%)
**Remaining**: 45 (75%)

### By Status:
- ✅ **Complete**: A (Decision Session), E (Alert & Escalation)
- ⚠️ **In Progress**: I (Interoperability Ingestion) - 2/7 done
- ⏳ **Not Started**: B, C, D, F, G, H, J

---

## 🎯 Next Steps (Recommended Order)

### Phase 1: Core Runtime (Complete) ✅
1. ✅ A) Clinical Decision Session Orchestrator
2. ✅ E) Alert & Escalation Orchestrator

### Phase 2: Ingestion & Interoperability (In Progress)
3. ⚠️ I) Interoperability Ingestion Orchestrator (5 remaining use-cases)

### Phase 3: Output & Actionability
4. D) Risk & Recommendation Orchestrator
5. C) Explainability & Trace Orchestrator (some overlap with Decision Session)

### Phase 4: Governance & Lifecycle
6. B) Policy & Threshold Governance Orchestrator
7. H) Knowledge Packaging & Release Orchestrator

### Phase 5: Execution & Workflow
8. F) Care Pathway Orchestrator

### Phase 6: Platform & Integration
9. J) Eventing & Outbound Delivery Orchestrator
10. G) Experimentation & Simulation Orchestrator

---

## 📝 Notes

- **Architectural Patterns**: All orchestrators must follow Clean Architecture + DDD principles
- **Repository Pattern**: Use `load()`/`save()` pattern, not CRUD
- **Domain Factories**: No object literals, factories handle ID generation
- **Domain Aggregates**: Use aggregate methods for state transitions
- **Explicit State**: No metadata hacking, explicit domain properties

---

## 🔗 Related Documentation

- `ARCHITECTURAL-PATTERNS.md` - Pattern guide
- `ARCHITECTURAL-FIXES.md` - Tracking document
- `DECISION-SESSION-FIXES.md` - Decision session completion
- `INGESTION-FIXES.md` - Ingestion fixes (partial)
- `SUMMARY.md` - Overall progress summary
