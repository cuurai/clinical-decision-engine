#!/bin/bash
# Fix all list handler return statements
# Changes from { data: { items: [...] }, meta: { pagination: ... } }
# To { data: [...], meta: { correlationId, timestamp, totalCount, pageSize, pageNumber } }

echo "Fixing list handler return statements..."

find packages/core/src -name "list-*.handler.ts" | while read file; do
  # Skip if no repo.list call (already modified)
  if ! grep -q "repo\.list" "$file"; then
    continue
  fi

  # Replace the return statement
  sed -i '' 's/data: {$/data:/' "$file"
  sed -i '' 's/items: result\.items,//' "$file"
  sed -i '' 's/},$//' "$file"
  sed -i '' 's/pagination: {/totalCount: result.totalCount ?? 0,/' "$file"
  sed -i '' 's/nextCursor: result\.nextCursor ?? null,/pageSize: result.pageSize ?? 0,/' "$file"
  sed -i '' 's/prevCursor: result\.prevCursor ?? null,/pageNumber: result.pageNumber ?? 0,/' "$file"
  sed -i '' 's/limit: result\.items\.length,//' "$file"
  sed -i '' 's/},$//' "$file"
done

echo "✓ Fixed list handlers"
