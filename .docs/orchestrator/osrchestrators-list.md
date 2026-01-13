Below is a **comprehensive orchestrator use-case catalog** derived from your current *building blocks* (routes) but expressed correctly as **workflow/use-case orchestration contracts** (not CRUD), grouped into **End-to-End CDE scenarios** that your schema must serve.

---

# 0) Meta rule

**CRUD routes ≠ use cases**; use cases are **intent + lifecycle + cross-service coordination + read/write patterns** (and those are what drive schema/indexes).

---

# 1) E2E Orchestrators for a Clinical Decision Engine

## A) Clinical Decision Session Orchestrator (core runtime)

**Goal:** run a clinical decisioning “session” for a patient/encounter and produce decisions + artifacts.

### Use cases

1. **Start Decision Session** (patient + encounter context bound, reason, scope, policy set)
2. **Add/Refresh Context Inputs** (pull latest vitals/labs/notes/meds; freeze snapshot “as-of”)
3. **Submit Decision Request** (for a specific decision intent: triage, dosing, diagnosis support, etc.)
4. **Execute Policy Evaluation** (rules + thresholds + scoring templates + model invocations)
5. **Produce Decision Result Bundle** (result + risk assessments + recommendations + alerts)
6. **Generate Explanation Bundle** (features + rule traces + model invocation explanations)
7. **Persist Decision Artifacts as Immutable** (replayable + auditable)
8. **Close Decision Session** (final state + summary + emitted events)

### Cross-service building blocks it composes

* Patient snapshot/summary: patients/{id}/summary, observations, meds, conditions, encounters
* Knowledge: rule sets, clinical rules/versions/tests, scoring templates, model versions/feature defs
* Decision intelligence: decision sessions, requests, results, explanations, model invocations
* Workflow: alerts + audit events + routing/escalation policies
* Integration: event deliveries/subscriptions for outbound

---

## B) Policy & Threshold Governance Orchestrator (authoring → production)

**Goal:** govern decision policies and their threshold profiles (and link them to knowledge assets).

### Use cases

1. **Create/Update Decision Policy** (metadata + scope + eligibility constraints)
2. **Attach Threshold Profiles to Policy** (by condition, care setting, org/site, population segment)
3. **Activate/Deactivate Policy** (effective dates, staged rollout)
4. **Policy Change Impact Preview** (simulate effect on recent sessions/cohorts)
5. **Policy Versioning + Audit** (immutable versions, signed approvals)
6. **Policy-to-RuleSet Binding** (policy selects rule-set(s), scoring templates, model versions)

### Building blocks

* decision-policies, threshold-profiles, decision-policy-threshold-profiles
* knowledge packages, rule sets, scoring templates, model versions

---

## C) Explainability & Trace Orchestrator (clinical defensibility)

**Goal:** produce a defensible explanation that survives audits and clinical review.

### Use cases

1. **Assemble Explanation Bundle for a Decision Result**
2. **Generate Rule Trace Narrative** (what rules fired, in which order, why)
3. **Attach Feature Attribution** (feature list, contributions, missingness handling)
4. **Link Evidence Citations to Decision** (guidelines/sections/citations used)
5. **Export Audit Package** (human readable + machine readable)

### Building blocks

* explanations, explanation-features, explanation-rule-traces
* model-invocations + model-invocation-explanations
* guideline evidence citations, guideline sections, evidence citations/reviews

---

## D) Risk & Recommendation Orchestrator (outputs that trigger care)

**Goal:** convert decisions into structured risk assessments and actionable recommendations.

### Use cases

1. **Compute Risk Assessment** (score + tier + confidence + evidence)
2. **Generate Recommendations** (actions, contraindications, alternatives, next tests)
3. **Bind Explanations to Risks/Recommendations** (traceability)
4. **Publish to Work Queues** (task creation or clinician alert)
5. **Track Outcome Signals** (accepted/rejected/overridden; follow-up results)

### Building blocks

* risk-assessments (+ explanations)
* recommendations (+ explanations)
* workflow tasks/work queues/alerts

---

## E) Alert & Escalation Orchestrator (closed-loop action)

**Goal:** ensure alerts reach the right person, are acknowledged, escalated, and audited.

### Use cases

1. **Create Alert from Decision Result** (severity, urgency, routing tags)
2. **Route Alert to Work Queue** (routing rules + schedule templates + role/team)
3. **Escalate Alert** (escalation policy rules + timers)
4. **Acknowledge/Resolve Alert** (state machine)
5. **Generate Alert Explanation** (why this alert, why now)
6. **Audit Every Transition** (alert-audit-events immutable)

### Building blocks

* alerts, alert-explanations, alert-audit-events
* routing-rules, escalation-policies/rules, schedule-templates
* work-queues/{id}/alerts

---

## F) Care Pathway Orchestrator (decision → pathway instance)

**Goal:** instantiate a care pathway template into a patient-specific plan, then execute it.

### Use cases

1. **Select Care Pathway Template** (based on decision type, condition, risk tier)
2. **Instantiate Care Plan** (goals, checklists, tasks)
3. **Schedule and Assign Tasks** (assignments, schedules, work queues)
4. **Track Task Completion + Comments** (audit trail)
5. **Handoff Between Teams** (handoffs + handoff tasks)
6. **Close Episode of Care** (episode state, encounter linkage)

### Building blocks

* care-pathway-templates (+ steps + order-set-templates)
* care-plans (+ tasks + goals + checklists)
* episodes-of-care (+ encounters + workflow instances)
* handoffs, task-assignments, tasks, workflow-instances

---

## G) Experimentation & Simulation Orchestrator (safe change + learning)

**Goal:** evaluate new policies/models safely via experiments and simulation.

### Use cases

1. **Define Experiment** (hypothesis, target population, KPIs)
2. **Configure Arms** (policy versions, threshold profiles, model versions)
3. **Assign Sessions to Arms** (deterministic bucketing)
4. **Run Simulation Scenario** (replay historical sessions or synthetic cohorts)
5. **Compute Experiment Results + Metrics** (decision metrics, safety metrics)
6. **Promote Winning Arm** (rollout plan, staged activation)

### Building blocks

* experiments + arms + results
* simulation-scenarios + simulation-runs + run metrics + decision-results
* decision metrics + metric snapshots

---

## H) Knowledge Packaging & Release Orchestrator (content lifecycle)

**Goal:** publish coherent bundles of knowledge assets into production.

### Use cases

1. **Author Knowledge Package** (which value sets + rules + models are included)
2. **Validate Package** (rule tests, model tests, value set integrity)
3. **Version + Sign Package** (immutable release artifact)
4. **Deploy Package to Policy** (policy points to package version)
5. **Rollback Package** (fast revert while preserving audit)

### Building blocks

* knowledge-packages (+ clinical rules + model definitions + value sets)
* clinical rules + versions + tests
* model definitions + versions + performance metrics + tests + feature defs
* value sets + codes

---

## I) Interoperability Ingestion Orchestrator (HL7/FHIR → normalized clinical facts)

**Goal:** ingest from external systems, map, normalize, and write into patient clinical data.

### Use cases

1. **Provision External System + Connection**
2. **Run Integration Job** (import batch / incremental sync)
3. **Ingest HL7 Message** (store raw, parse segments, apply mapping profile)
4. **Ingest FHIR Bundle** (store, map resources via mapping profile)
5. **Write Normalized Records** (patients/encounters/observations/etc.)
6. **Track Errors + Health** (interface errors, health checks, retry)
7. **Idempotent Reprocessing** (safe reruns, dedupe keys)

### Building blocks

* external-systems, connections, integration-jobs/runs/logs/errors
* hl7-messages + segments + mapping-results + hl7 mapping profiles/rules
* fhir-bundles + resources + fhir mapping profiles/rules
* data-import-batches/records/errors

---

## J) Eventing & Outbound Delivery Orchestrator (CDE as a platform)

**Goal:** publish decisions/alerts/events to subscribers, track deliveries and retries.

### Use cases

1. **Create Event Subscription** (topics, filters, destination)
2. **Emit Decision Event** (decision created/overridden/resolved)
3. **Emit Workflow Event** (task created/completed, alert escalated)
4. **Deliver Events with Retries** (delivery status, error capture)
5. **Provide Delivery Audit + Metrics** (usage metrics, SLA)

### Building blocks

* event-subscriptions, event-deliveries, subscription deliveries
* api-clients/credentials/usage-metrics

---

# 2) “Richer” Composite Use-Cases (what your UI / product actually sells)

These are the ones that *feel like product features* and force real schema/query needs:

1. **ED Triage Decisioning**

   * patient arrives → create encounter → ingest vitals/labs → run triage decision → create high-sev alert + work queue tasks → explanation package.
2. **Medication Safety Check**

   * new med order → check allergies + current meds → evaluate interaction/contraindication rules → recommendation alternatives → alert pharmacist queue.
3. **Sepsis Early Warning**

   * continuous vitals/labs ingestion → risk score trend → threshold breach → create alert → escalation if not acknowledged → audit trail.
4. **Guideline Update Rollout**

   * ingest new guideline section/citations → update rule set → package release → run simulation on last 30 days → experiment rollout.
5. **Model Upgrade Governance**

   * new model version with tests + performance metrics → bind to policy arm → monitor drift/metrics snapshots → promote/rollback.
6. **Closed-loop Care Pathway Activation**

   * decision result qualifies patient → instantiate care plan + checklist + tasks + schedules → track completion and outcomes.

---

# 3) The “Persistence Contract” you should lock (per orchestrator)

For each orchestrator use case, define:

* **Command**: inputs + idempotency key + expected state transitions
* **Reads**: required query shapes (by patient, encounter, session, time range, status)
* **Writes**: immutable vs mutable entities
* **Indexes**: what must be fast (dashboard routes strongly hint these)
* **Audit**: which events are append-only

If you want, I can output this as a **standard template** for each orchestrator (1 page each) so it becomes your schema-driving contract.

---

# 4) Immediate recommendation (to unblock your schema)

Start with **three orchestrators** because they force 80% of schema realities:

1. **Clinical Decision Session Orchestrator**
2. **Alert & Escalation Orchestrator**
3. **Interoperability Ingestion Orchestrator**

Lock their persistence contracts first, then everything else becomes consistent.

---
