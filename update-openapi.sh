#!/bin/bash

# Wrap single-item GET responses in response envelopes
# This wraps responses that are direct $ref to a schema

update_file() {
    local file=$1
    local response_schema=$2
    local list_response_schema=$3
    
    echo "Processing $file..."
    
    # Use sed to wrap all 200/201/204 responses with $ref
    # Pattern: after "schema:" line with $ref, wrap in allOf
    
    # For now, let's just validate the current file
    npx openapi-typescript "$file" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✓ Valid OpenAPI YAML"
    else
        echo "✗ Invalid OpenAPI YAML"
        return 1
    fi
}

# Check existing wrapping status
for file in openapi/openapi-*.yaml; do
    echo "Checking $file for wrapped responses..."
    # Count allOf patterns
    count=$(grep -c "allOf:" "$file" 2>/dev/null || echo 0)
    echo "  Found $count allOf patterns"
done
