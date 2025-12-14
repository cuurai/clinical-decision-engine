#!/bin/bash
# Add GCP firewall rule for Clinical Decision Engine
# Run this script after authenticating with gcloud: gcloud auth login

set -e

RULE_NAME="allow-clinical-decision-engine"
PORTS="tcp:8081,tcp:3100,tcp:3101,tcp:3102,tcp:3104"

echo "🔥 Adding GCP firewall rule: ${RULE_NAME}"
echo "=========================================="
echo ""

# Check if rule already exists
if gcloud compute firewall-rules describe ${RULE_NAME} &>/dev/null; then
    echo "⚠️  Firewall rule ${RULE_NAME} already exists"
    echo ""
    echo "Current rule:"
    gcloud compute firewall-rules describe ${RULE_NAME} --format="yaml(allowed,direction,sourceRanges)"
    echo ""
    read -p "Do you want to update it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping firewall rule creation"
        exit 0
    fi
    echo "Deleting existing rule..."
    gcloud compute firewall-rules delete ${RULE_NAME} --quiet
fi

echo "Creating firewall rule..."
gcloud compute firewall-rules create ${RULE_NAME} \
    --allow ${PORTS} \
    --source-ranges 0.0.0.0/0 \
    --description "Allow Clinical Decision Engine ports" \
    --direction INGRESS

echo ""
echo "✅ Firewall rule created successfully!"
echo ""
echo "Rule details:"
gcloud compute firewall-rules describe ${RULE_NAME} --format="table(name,allowed[].map().firewall_rule().list():label=ALLOW,direction,priority,sourceRanges.list():label=SOURCE_RANGES)"
echo ""
echo "🌐 Test external access:"
echo "   curl http://34.136.153.216:8081/"
