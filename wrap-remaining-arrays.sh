#!/bin/bash

# This script wraps unwrapped array responses in list response envelopes

wrap_file() {
    local file=$1
    local list_response=$2
    
    echo "Processing $file..."
    
    # Create temp file
    local temp="${file}.tmp"
    cp "$file" "$temp"
    
    # Use sed to find and replace unwrapped array schemas
    # Pattern: schema: (next line) type: array -> wrap in allOf
    
    perl -i -pe '
    if (/^\s+schema:\s*$/) {
        $in_schema = 1;
        $schema_indent = length($&) - length($&=~s/^\s+//);
    } elsif ($in_schema && /^\s*type:\s*array\s*$/) {
        # Found unwrapped array - replace previous schema: line
        # This is tricky with perl in-place, so use a different approach
        $found_array = 1;
    }
    ' "$temp"
    
    # Use Python for more reliable replacement
    python3 << "PYSCRIPT"
import re

list_responses = {
    'decision-intelligence': 'DecApiListResponse',
    'integration-interoperability': 'IntApiListResponse',
    'knowledge-evidence': 'KnoApiListResponse',
    'patient-clinical-data': 'PatApiListResponse',
    'workflow-care-pathways': 'WorApiListResponse',
}

with open("$temp", 'r') as f:
    content = f.read()

for domain, schema_name in list_responses.items():
    if domain in "$file":
        # Replace unwrapped arrays with wrapped version
        pattern = r'(\s+)schema:\s*\n(\s+)type: array\n(\s+)items:'
        replacement = r'\1schema:\n\1  allOf:\n\1    - $ref: "#/components/schemas/' + schema_name + r'"\n\1    - type: object\n\1      properties:\n\1        data:\n\1          type: array\n\1          items:'
        content = re.sub(pattern, replacement, content)
        break

with open("$temp", 'w') as f:
    f.write(content)
PYSCRIPT

    # Validate the temp file
    if npx openapi-typescript "$temp" > /dev/null 2>&1; then
        mv "$temp" "$file"
        echo "✓ Wrapped and validated"
    else
        rm "$temp"
        echo "✗ Validation failed"
        return 1
    fi
}

wrap_file "openapi/openapi-decision-intelligence.yaml" "DecApiListResponse"
wrap_file "openapi/openapi-integration-interoperability.yaml" "IntApiListResponse"
wrap_file "openapi/openapi-knowledge-evidence.yaml" "KnoApiListResponse"
wrap_file "openapi/openapi-patient-clinical-data.yaml" "PatApiListResponse"
wrap_file "openapi/openapi-workflow-care-pathways.yaml" "WorApiListResponse"
