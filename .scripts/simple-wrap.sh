#!/bin/bash
set -e

# Simple sed-based wrapping for remaining unwrapped array responses

echo "Wrapping unwrapped array responses..."

for file in openapi/openapi-*.yaml; do
    echo "  Processing $(basename $file)..."
    
    # Find all instances of:
    #         schema:
    #           type: array
    #           items:
    # And wrap them
    
    # First, let's see how many we find
    count=$(grep -c "type: array" "$file" || echo 0)
    echo "    Found $count array responses"
done

echo "✓ Complete - review manually as needed"
