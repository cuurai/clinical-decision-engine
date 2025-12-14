#!/usr/bin/env python3
"""
Fix duplicate code in DAO repository create methods
"""

import re
import os
from pathlib import Path

def fix_duplicate_create_method(file_path: str) -> bool:
    """Fix duplicate code in create method"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Pattern: duplicate try statements and const inputData declarations
        # Look for pattern like:
        # const inputData = ...;
        # try
        # const inputData = ...;
        # try
        # try {
        pattern = r'(const inputData = data as unknown as \w+Input;)\s+try\s+\1\s+try\s+try \{'
        replacement = r'\1\n    try {'
        content = re.sub(pattern, replacement, content)

        # Also handle cases with comments between duplicates
        pattern2 = r'(// Note:.*?\n\s*// Extract.*?\n\s*const inputData = data as unknown as \w+Input;)\s+try\s+\1\s+try\s+try \{'
        replacement2 = r'\1\n    try {'
        content = re.sub(pattern2, replacement2, content)

        # Fix cases where there are just duplicate "try" statements without the const
        pattern3 = r'(\s+)try\s+try\s+try \{'
        replacement3 = r'\1try {'
        content = re.sub(pattern3, replacement3, content)

        # Fix cases where there's a standalone "try" before the actual try block
        pattern4 = r'(\s+)try\s+(\s+)try \{'
        replacement4 = r'\1try {'
        content = re.sub(pattern4, replacement4, content)

        # Fix update method - replace ...inputData with ...data
        pattern3 = r'(async update\([^)]+\): Promise<\w+> \{[^}]*data: \{)\s*\.\.\.inputData,'
        replacement3 = r'\1\n          ...data,'
        content = re.sub(pattern3, replacement3, content)

        # Fix update method where clause - add orgId
        pattern4 = r'(where: \{ id \},)'
        replacement4 = r'where: { id, orgId },'
        content = re.sub(pattern4, replacement4, content)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"  ❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Main function to fix all DAO repository files"""
    base_path = Path('platform/adapters/src')
    if not base_path.exists():
        print(f"❌ Directory {base_path} does not exist")
        return

    dao_files = list(base_path.rglob('*.dao.repository.ts'))
    print(f"Found {len(dao_files)} DAO repository files")

    fixed_count = 0
    for file_path in sorted(dao_files):
        rel_path = str(file_path)
        if fix_duplicate_create_method(rel_path):
            print(f"  ✅ Fixed {rel_path}")
            fixed_count += 1

    print(f"\n✅ Fixed {fixed_count} out of {len(dao_files)} files")

if __name__ == '__main__':
    main()


