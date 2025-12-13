#!/bin/bash

# Fix all list handler return statements to match OpenAPI response types
# Pattern: Change from { data: { items: [...] }, meta: { pagination: {...} } }
# To: { data: [...], meta: { correlationId, timestamp, totalCount, pageSize, pageNumber } }

count=0

for file in packages/core/src/*/handlers/*/list-*.handler.ts; do
  if [ ! -f "$file" ]; then
    continue
  fi
  
  # Check if this handler has the old pattern
  if ! grep -q "pagination:" "$file"; then
    continue
  fi
  
  # Get the transaction ID function from import
  if grep -q "decTransactionId" "$file"; then
    txid="decTransactionId"
  elif grep -q "intTransactionId" "$file"; then
    txid="intTransactionId"
  elif grep -q "knoTransactionId" "$file"; then
    txid="knoTransactionId"
  elif grep -q "patTransactionId" "$file"; then
    txid="patTransactionId"
  elif grep -q "worTransactionId" "$file"; then
    txid="worTransactionId"
  else
    txid="unknownTransactionId"
  fi
  
  # Replace the entire return statement block
  # This is complex, so we'll use a Python script per file
  python3 << PYTHON_EOF
import re

with open('$file', 'r') as f:
    content = f.read()

# Pattern to match the entire return statement with pagination structure
old_pattern = r'return\s*\{\s*data:\s*\{\s*items:\s*result\.items,\s*\},\s*meta:\s*\{\s*correlationId:\s*\w+\(\),\s*timestamp:\s*new Date\(\)\.toISOString\(\),\s*pagination:\s*\{\s*nextCursor:\s*result\.nextCursor\s*\?\?\s*null,\s*prevCursor:\s*result\.prevCursor\s*\?\?\s*null,\s*limit:\s*result\.items\.length,\s*\},\s*\},\s*\};'

new_return = '''return {
    data: result.items,
    meta: {
      correlationId: $txid(),
      timestamp: new Date().toISOString(),
      totalCount: result.total ?? result.items.length,
      pageSize: result.items.length,
      pageNumber: 1,
    },
  };'''

# Try exact pattern match first
if re.search(old_pattern, content, re.MULTILINE | re.DOTALL):
    content = re.sub(old_pattern, new_return, content, flags=re.MULTILINE | re.DOTALL)
else:
    # Try simpler pattern - just fix the structure parts
    # Fix data: { items: ... } -> data: ...
    content = re.sub(r'data:\s*\{\s*items:\s*result\.items,?\s*\},?', 'data: result.items,', content)
    
    # Fix pagination structure
    pagination_pattern = r'pagination:\s*\{\s*nextCursor:.*?limit:.*?\},?'
    content = re.sub(pagination_pattern, 'totalCount: result.total ?? result.items.length,\n      pageSize: result.items.length,\n      pageNumber: 1,', content, flags=re.DOTALL)

with open('$file', 'w') as f:
    f.write(content)

print('  Fixed: $file')
PYTHON_EOF
  
  count=$((count + 1))
done

echo "✓ Fixed $count list handlers"
