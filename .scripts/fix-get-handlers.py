#!/usr/bin/env python3
"""
Fix GET handler return statements to remove response wrapping.
GET endpoints return raw objects, not wrapped in { data, meta }.
"""

import re
from pathlib import Path

def fix_get_handler(filepath):
    """Remove response wrapping from get handler."""
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Pattern: return { data: { ...props }, meta: { ... } };
    # Replace with: return { ...props };

    pattern = r'return\s*\{\s*data:\s*\{([^}]*)\},?\s*meta:\s*\{[^}]*\},?\s*\};'
    replacement = r'return {\1};'

    content = re.sub(pattern, replacement, content, flags=re.DOTALL | re.MULTILINE)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    """Main entry point."""
    workspace = Path('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/packages/core')

    count = 0
    for handler_file in workspace.rglob('get-*.handler.ts'):
        if fix_get_handler(handler_file):
            count += 1
            print(f"  Fixed: {handler_file.relative_to(workspace)}")

    print(f"\n✓ Fixed {count} GET handlers")
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
