#!/usr/bin/env python3
"""
Fix handler return statements to match correct response envelopes.
List handlers: { data: [...], meta: { correlationId, timestamp, totalCount, pageSize, pageNumber } }
Get handlers: Just return the raw entity (no wrapping - OpenAPI specs return raw objects)
Create/Update/Delete: Just return the raw entity
"""

import re
from pathlib import Path
import subprocess

def fix_list_handler(content):
    """Fix list handler return statement."""
    # Find the return statement for list handlers
    pattern = r'return\s*\{[\s\S]*?^\s*\};'

    # Check if this is a list handler
    if 'repo.list' not in content and 'result.items' not in content:
        return content

    # Replace the return statement
    # OLD: return { data: { items: result.items }, meta: { ...pagination: { nextCursor, ... } } }
    # NEW: return { data: result.items, meta: { correlationId, timestamp, totalCount, pageSize, pageNumber } }

    new_content = re.sub(
        r'return\s*\{\s*data:\s*\{\s*items:\s*result\.items,?\s*\},?\s*meta:\s*\{[^}]*\},?\s*\};',
        '''return {
    data: result.items,
    meta: {
      correlationId: intTransactionId(),
      timestamp: new Date().toISOString(),
      totalCount: result.total ?? result.items.length,
      pageSize: result.items.length,
      pageNumber: 1,
    },
  };''',
        content,
        flags=re.MULTILINE
    )

    # If the above didn't match, try a more flexible pattern
    if new_content == content:
        # Try replacing just the data section
        new_content = re.sub(
            r'data:\s*\{\s*items:\s*result\.items,?\s*\},?',
            'data: result.items,',
            content
        )

        # Replace pagination section
        new_content = re.sub(
            r'pagination:\s*\{[\s\S]*?\},?',
            'totalCount: result.total ?? result.items.length,\n      pageSize: result.items.length,\n      pageNumber: 1,',
            new_content
        )

    return new_content

def fix_get_handler(content):
    """Fix get handler return statement."""
    # Get handlers should return the raw entity, not wrapped
    # OLD: return { data: { ...entity }, meta: { correlationId, timestamp } };
    # NEW: return { ...entity };

    if 'repo.get' not in content and 'repo.findById' not in content:
        return content

    # Pattern 1: Simple get handlers that return mock/TODO data
    new_content = re.sub(
        r'return\s*\{\s*data:\s*\{([^}]*)\},?\s*meta:\s*\{[^}]*\},?\s*\};',
        r'return {\1};',
        content,
        flags=re.MULTILINE
    )

    return new_content

def fix_handlers_in_domain(domain_path):
    """Process all handlers in a domain."""
    handlers_dir = Path(domain_path) / 'handlers'
    if not handlers_dir.exists():
        return 0

    fixed_count = 0

    for handler_file in handlers_dir.rglob('*.handler.ts'):
        try:
            with open(handler_file, 'r') as f:
                content = f.read()

            original = content

            # Fix based on handler type
            if 'list-' in handler_file.name:
                content = fix_list_handler(content)
            elif 'get-' in handler_file.name or any(x in handler_file.name for x in ['get-', 'retrieve-', 'fetch-']):
                content = fix_get_handler(content)
            # else: create/update/delete handlers return raw entities from repo

            if content != original:
                with open(handler_file, 'w') as f:
                    f.write(content)
                fixed_count += 1
                print(f"  Fixed: {handler_file.relative_to(domain_path)}")

        except Exception as e:
            print(f"  Error fixing {handler_file.name}: {e}")

    return fixed_count

def main():
    """Main entry point."""
    workspace = Path('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine')

    print("Fixing handler return statements...")

    domains = [
        'packages/core/src/decision-intelligence',
        'packages/core/src/integration-interoperability',
        'packages/core/src/knowledge-evidence',
        'packages/core/src/patient-clinical-data',
        'packages/core/src/workflow-care-pathways',
    ]

    total_fixed = 0
    for domain_path in domains:
        full_path = workspace / domain_path
        if full_path.exists():
            domain_name = domain_path.split('/')[-1]
            print(f"\n{domain_name}:")
            fixed = fix_handlers_in_domain(full_path)
            total_fixed += fixed
            print(f"  Processed: {fixed} handlers")

    print(f"\n✓ Fixed {total_fixed} handler files")

    # Rebuild to check
    print("\nRebuilding project...")
    result = subprocess.run(
        'cd packages/core && npm run build 2>&1 | tail -20',
        shell=True,
        cwd=workspace,
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        print("⚠ Build still has errors (expected, some may be Zod-related)")

    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
