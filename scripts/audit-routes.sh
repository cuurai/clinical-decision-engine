#!/bin/bash

# Route Audit Script (Bash version)
# Tests all UI routes and generates a gap analysis report

BASE_URL="${API_BASE_URL:-http://34.136.153.216/api}"
ORG_ID="${ORG_ID:-test-org}"
REPORT_FILE="${REPORT_FILE:-/tmp/route-audit-report-$(date +%Y%m%d-%H%M%S).txt}"

echo "=== Clinical Decision Engine Route Audit ===" > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "Base URL: $BASE_URL" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Define all routes (extracted from services.ts)
declare -a routes=(
    # Decision Intelligence (33 routes)
    "decision-intelligence/decision-sessions"
    "decision-intelligence/decision-session-requests"
    "decision-intelligence/decision-session-results"
    "decision-intelligence/decision-session-risk-assessments"
    "decision-intelligence/decision-session-alerts"
    "decision-intelligence/decision-session-explanations"
    "decision-intelligence/decision-requests"
    "decision-intelligence/decision-request-results"
    "decision-intelligence/decision-request-explanations"
    "decision-intelligence/decision-results"
    "decision-intelligence/decision-result-recommendations"
    "decision-intelligence/decision-result-risk-assessments"
    "decision-intelligence/decision-result-explanations"
    "decision-intelligence/risk-assessments"
    "decision-intelligence/risk-assessment-explanations"
    "decision-intelligence/recommendations"
    "decision-intelligence/recommendation-explanations"
    "decision-intelligence/alert-evaluations"
    "decision-intelligence/explanations"
    "decision-intelligence/explanation-features"
    "decision-intelligence/explanation-rule-traces"
    "decision-intelligence/model-invocations"
    "decision-intelligence/model-invocation-explanations"
    "decision-intelligence/simulation-scenarios"
    "decision-intelligence/simulation-scenario-runs"
    "decision-intelligence/simulation-runs"
    "decision-intelligence/simulation-run-decision-results"
    "decision-intelligence/simulation-run-metrics"
    "decision-intelligence/decision-policies"
    "decision-intelligence/decision-policy-threshold-profiles"
    "decision-intelligence/threshold-profiles"
    "decision-intelligence/decision-metrics"
    "decision-intelligence/decision-metric-snapshots"
    "decision-intelligence/experiments"
    "decision-intelligence/experiment-arms"
    "decision-intelligence/experiment-results"

    # Knowledge Evidence (33 routes)
    "knowledge-evidence/clinical-rules"
    "knowledge-evidence/clinical-rule-versions"
    "knowledge-evidence/clinical-rule-tests"
    "knowledge-evidence/rule-sets"
    "knowledge-evidence/rule-set-clinical-rules"
    "knowledge-evidence/guidelines"
    "knowledge-evidence/guideline-sections"
    "knowledge-evidence/guideline-evidence-citations"
    "knowledge-evidence/care-protocols"
    "knowledge-evidence/care-protocol-steps"
    "knowledge-evidence/care-protocol-order-sets"
    "knowledge-evidence/order-set-templates"
    "knowledge-evidence/order-set-template-items"
    "knowledge-evidence/model-definitions"
    "knowledge-evidence/model-definition-versions"
    "knowledge-evidence/model-definition-performance-metrics"
    "knowledge-evidence/model-versions"
    "knowledge-evidence/model-version-tests"
    "knowledge-evidence/model-version-feature-definitions"
    "knowledge-evidence/ontology-terms"
    "knowledge-evidence/ontology-term-children"
    "knowledge-evidence/ontology-term-parents"
    "knowledge-evidence/ontology-term-mappings"
    "knowledge-evidence/value-sets"
    "knowledge-evidence/value-set-codes"
    "knowledge-evidence/concept-maps"
    "knowledge-evidence/concept-map-mappings"
    "knowledge-evidence/scoring-templates"
    "knowledge-evidence/scoring-template-items"
    "knowledge-evidence/questionnaire-templates"
    "knowledge-evidence/questionnaire-template-questions"
    "knowledge-evidence/evidence-citations"
    "knowledge-evidence/evidence-reviews"
    "knowledge-evidence/knowledge-packages"
    "knowledge-evidence/knowledge-package-clinical-rules"
    "knowledge-evidence/knowledge-package-model-definitions"
    "knowledge-evidence/knowledge-package-value-sets"

    # Patient Clinical Data (39 routes)
    "patient-clinical-data/patients"
    "patient-clinical-data/patient-summaries"
    "patient-clinical-data/patient-encounters"
    "patient-clinical-data/patient-conditions"
    "patient-clinical-data/patient-allergies"
    "patient-clinical-data/patient-medications"
    "patient-clinical-data/patient-immunizations"
    "patient-clinical-data/patient-observations"
    "patient-clinical-data/patient-vitals"
    "patient-clinical-data/patient-labs"
    "patient-clinical-data/patient-diagnostic-reports"
    "patient-clinical-data/patient-procedures"
    "patient-clinical-data/patient-notes"
    "patient-clinical-data/patient-care-teams"
    "patient-clinical-data/patient-documents"
    "patient-clinical-data/encounters"
    "patient-clinical-data/encounter-conditions"
    "patient-clinical-data/encounter-observations"
    "patient-clinical-data/encounter-diagnostic-reports"
    "patient-clinical-data/encounter-procedures"
    "patient-clinical-data/encounter-notes"
    "patient-clinical-data/conditions"
    "patient-clinical-data/condition-notes"
    "patient-clinical-data/allergies"
    "patient-clinical-data/medication-statements"
    "patient-clinical-data/medication-orders"
    "patient-clinical-data/medication-administrations"
    "patient-clinical-data/immunizations"
    "patient-clinical-data/observations"
    "patient-clinical-data/diagnostic-reports"
    "patient-clinical-data/diagnostic-report-observations"
    "patient-clinical-data/diagnostic-report-imaging-studies"
    "patient-clinical-data/imaging-studies"
    "patient-clinical-data/imaging-study-series"
    "patient-clinical-data/procedures"
    "patient-clinical-data/notes"
    "patient-clinical-data/care-teams"
    "patient-clinical-data/documents"

    # Workflow Care Pathways (33 routes)
    "workflow-care-pathways/workflow-definitions"
    "workflow-care-pathways/workflow-definition-states"
    "workflow-care-pathways/workflow-definition-transitions"
    "workflow-care-pathways/workflow-instances"
    "workflow-care-pathways/workflow-instance-tasks"
    "workflow-care-pathways/workflow-instance-events"
    "workflow-care-pathways/workflow-instance-audit-events"
    "workflow-care-pathways/care-pathway-templates"
    "workflow-care-pathways/care-pathway-template-steps"
    "workflow-care-pathways/care-pathway-template-order-set-templates"
    "workflow-care-pathways/care-plans"
    "workflow-care-pathways/care-plan-goals"
    "workflow-care-pathways/care-plan-tasks"
    "workflow-care-pathways/care-plan-checklists"
    "workflow-care-pathways/episodes-of-cares"
    "workflow-care-pathways/episode-of-cares"
    "workflow-care-pathways/episode-of-care-encounters"
    "workflow-care-pathways/episode-of-care-care-plans"
    "workflow-care-pathways/episode-of-care-workflow-instances"
    "workflow-care-pathways/tasks"
    "workflow-care-pathways/task-comments"
    "workflow-care-pathways/task-audit-events"
    "workflow-care-pathways/task-assignments"
    "workflow-care-pathways/alerts"
    "workflow-care-pathways/alert-explanations"
    "workflow-care-pathways/alert-audit-events"
    "workflow-care-pathways/handoffs"
    "workflow-care-pathways/handoff-tasks"
    "workflow-care-pathways/checklist-templates"
    "workflow-care-pathways/checklist-template-items"
    "workflow-care-pathways/checklist-instances"
    "workflow-care-pathways/checklist-instance-items"
    "workflow-care-pathways/escalation-policies"
    "workflow-care-pathways/escalation-policy-rules"
    "workflow-care-pathways/routing-rules"
    "workflow-care-pathways/schedule-templates"
    "workflow-care-pathways/work-queues"
    "workflow-care-pathways/work-queue-tasks"
    "workflow-care-pathways/work-queue-alerts"

    # Integration Interoperability (33 routes)
    "integration-interoperability/external-systems"
    "integration-interoperability/external-system-endpoints"
    "integration-interoperability/external-system-connections"
    "integration-interoperability/external-system-integration-jobs"
    "integration-interoperability/connections"
    "integration-interoperability/connection-health-checks"
    "integration-interoperability/connection-integration-jobs"
    "integration-interoperability/f-hirbundles"
    "integration-interoperability/f-hirbundle-resources"
    "integration-interoperability/fhir-mapping-profiles"
    "integration-interoperability/f-hirmapping-profile-rules"
    "integration-interoperability/hl7-messages"
    "integration-interoperability/h-lmessage-segments"
    "integration-interoperability/h-lmessage-mapping-results"
    "integration-interoperability/hl7-mapping-profiles"
    "integration-interoperability/h-lmapping-profile-rules"
    "integration-interoperability/integration-jobs"
    "integration-interoperability/integration-job-runs"
    "integration-interoperability/integration-runs"
    "integration-interoperability/integration-run-logs"
    "integration-interoperability/integration-run-errors"
    "integration-interoperability/data-import-batches"
    "integration-interoperability/data-import-batch-records"
    "integration-interoperability/data-import-batch-errors"
    "integration-interoperability/data-export-batches"
    "integration-interoperability/data-export-batch-files"
    "integration-interoperability/data-export-batch-errors"
    "integration-interoperability/event-subscriptions"
    "integration-interoperability/event-subscription-deliveries"
    "integration-interoperability/event-deliveries"
    "integration-interoperability/a-piclients"
    "integration-interoperability/a-piclient-credentials"
    "integration-interoperability/a-piclient-usage-metrics"
    "integration-interoperability/a-picredentials"
    "integration-interoperability/interface-errors"
    "integration-interoperability/interface-health-checks"
)

# Counters
total=${#routes[@]}
success=0
not_found=0
server_error=0
other_error=0
success_routes=()
not_found_routes=()
server_error_routes=()
other_error_routes=()

echo "Testing $total routes..." | tee -a "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Test each route
for i in "${!routes[@]}"; do
    route="${routes[$i]}"
    url="${BASE_URL}/${route}"
    progress="[$((i + 1))/$total]"

    echo -n "$progress Testing: $route... "

    response=$(curl -s -w "\n%{http_code}" -H "X-Org-Id: $ORG_ID" "$url" 2>&1)
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')

    case "$http_code" in
        200)
            if echo "$body" | grep -qE '"items"|"data"'; then
                echo "✅ OK"
                echo "✅ $route - HTTP $http_code" >> "$REPORT_FILE"
                success_routes+=("$route")
                success=$((success + 1))
            else
                echo "⚠️  OK (no data structure)"
                echo "⚠️  $route - HTTP $http_code (no data structure)" >> "$REPORT_FILE"
                success_routes+=("$route")
                success=$((success + 1))
            fi
            ;;
        404)
            echo "❌ NOT FOUND"
            echo "❌ $route - HTTP $http_code" >> "$REPORT_FILE"
            not_found_routes+=("$route")
            not_found=$((not_found + 1))
            ;;
        500)
            error_msg=$(echo "$body" | jq -r '.message // .error // "Unknown error"' 2>/dev/null || echo "Unknown error")
            echo "💥 SERVER ERROR: ${error_msg:0:50}"
            echo "💥 $route - HTTP $http_code - $error_msg" >> "$REPORT_FILE"
            server_error_routes+=("$route")
            server_error=$((server_error + 1))
            ;;
        *)
            echo "⚠️  HTTP $http_code"
            echo "⚠️  $route - HTTP $http_code" >> "$REPORT_FILE"
            other_error_routes+=("$route")
            other_error=$((other_error + 1))
            ;;
    esac

    sleep 0.05  # Rate limiting
done

# Generate detailed report
echo "" >> "$REPORT_FILE"
echo "=== Summary ===" >> "$REPORT_FILE"
echo "Total Routes: $total" >> "$REPORT_FILE"
echo "✅ Success (200): $success ($(( success * 100 / total ))%)" >> "$REPORT_FILE"
echo "❌ Not Found (404): $not_found ($(( not_found * 100 / total ))%)" >> "$REPORT_FILE"
echo "💥 Server Error (500): $server_error ($(( server_error * 100 / total ))%)" >> "$REPORT_FILE"
echo "⚠️  Other Errors: $other_error ($(( other_error * 100 / total ))%)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ ${#not_found_routes[@]} -gt 0 ]; then
    echo "=== Routes Not Found (404) ===" >> "$REPORT_FILE"
    for route in "${not_found_routes[@]}"; do
        echo "  - $route" >> "$REPORT_FILE"
    done
    echo "" >> "$REPORT_FILE"
fi

if [ ${#server_error_routes[@]} -gt 0 ]; then
    echo "=== Routes with Server Errors (500) ===" >> "$REPORT_FILE"
    for route in "${server_error_routes[@]}"; do
        echo "  - $route" >> "$REPORT_FILE"
    done
    echo "" >> "$REPORT_FILE"
fi

if [ ${#other_error_routes[@]} -gt 0 ]; then
    echo "=== Routes with Other Errors ===" >> "$REPORT_FILE"
    for route in "${other_error_routes[@]}"; do
        echo "  - $route" >> "$REPORT_FILE"
    done
    echo "" >> "$REPORT_FILE"
fi

echo ""
echo "=== Summary ==="
echo "Total Routes: $total"
echo "✅ Success (200): $success ($(( success * 100 / total ))%)"
echo "❌ Not Found (404): $not_found ($(( not_found * 100 / total ))%)"
echo "💥 Server Error (500): $server_error ($(( server_error * 100 / total ))%)"
echo "⚠️  Other Errors: $other_error ($(( other_error * 100 / total ))%)"
echo ""
echo "Full report saved to: $REPORT_FILE"
