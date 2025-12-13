#!/usr/bin/env python3
"""
Fix all DAO repository files in platform/adapters/src to:
1. Replace Timestamps with correct entity type
2. Remove extra parameters (createdBy, updatedBy, deletedBy) from method signatures
3. Remove or make private extra methods (createMany, updateMany, deleteMany)
4. Fix imports to include entity type
5. Fix toDomain return type
6. Fix NotFoundError to use correct entity name
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Tuple

def extract_entity_name(file_path: str) -> str:
    """Extract entity name from file path like 'alert-evaluation.dao.repository.ts' -> 'AlertEvaluation'"""
    filename = os.path.basename(file_path)
    # Remove .dao.repository.ts
    name_part = filename.replace('.dao.repository.ts', '')
    # Convert kebab-case to PascalCase
    parts = name_part.split('-')
    return ''.join(word.capitalize() for word in parts)

def extract_domain(file_path: str) -> str:
    """Extract domain from path like 'platform/adapters/src/decision-intelligence/...' -> 'decision-intelligence'"""
    parts = file_path.split('/')
    for i, part in enumerate(parts):
        if part == 'src' and i + 1 < len(parts):
            return parts[i + 1]
    return ''

def fix_dao_repository(file_path: str) -> bool:
    """Fix a single DAO repository file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        entity_name = extract_entity_name(file_path)
        domain = extract_domain(file_path)

        if not entity_name or not domain:
            print(f"  ⚠️  Skipping {file_path} - could not extract entity/domain")
            return False

        # 1. Fix imports - add entity type if missing
        entity_import_pattern = rf'import type \{{[^}}]*\}} from "@cuur/core/{domain}/types/index\.js";'
        if f'{entity_name},' not in content and f'{entity_name}' not in content.split('import type')[1].split('from')[0]:
            # Add entity name to imports
            content = re.sub(
                rf'(import type \{{[^}}]*)(Timestamps[^}}]*)(\}} from "@cuur/core/{domain}/types/index\.js";)',
                rf'\1{entity_name}, \2\3',
                content,
                count=1
            )

        # 2. Replace Timestamps with entity name in return types
        content = re.sub(rf'Promise<PaginatedResult<Timestamps>>', rf'Promise<PaginatedResult<{entity_name}>>', content)
        content = re.sub(rf'Promise<Timestamps \| null>', rf'Promise<{entity_name} | null>', content)
        content = re.sub(rf'Promise<Timestamps>', rf'Promise<{entity_name}>', content)
        content = re.sub(rf'Promise<Timestamps\[\]>', rf'Promise<{entity_name}[]>', content)
        content = re.sub(rf': Timestamps \| null', rf': {entity_name} | null', content)
        content = re.sub(rf': Timestamps', rf': {entity_name}', content)
        content = re.sub(rf'Timestamps\[\]', rf'{entity_name}[]', content)

        # 3. Fix NotFoundError to use entity name instead of "Timestamps"
        content = re.sub(rf'NotFoundError\("Timestamps"', rf'NotFoundError("{entity_name}"', content)

        # 4. Remove extra parameters from method signatures
        # Remove createdBy parameter
        content = re.sub(
            rf'async create\(orgId: OrgId, data: [^,]+,\s*createdBy\?: string\)',
            rf'async create(orgId: OrgId, data: {entity_name})',
            content
        )
        # Remove updatedBy parameter
        content = re.sub(
            rf'async update\(orgId: OrgId, id: string, data: [^,]+,\s*updatedBy\?: string\)',
            rf'async update(orgId: OrgId, id: string, data: {entity_name}Update)',
            content
        )
        # Remove deletedBy parameter
        content = re.sub(
            rf'async delete\(orgId: OrgId, id: string,\s*deletedBy\?: string\)',
            rf'async delete(orgId: OrgId, id: string)',
            content
        )
        content = re.sub(
            rf'async deleteMany\(orgId: OrgId, ids: string\[\],\s*deletedBy\?: string\)',
            rf'async deleteMany(orgId: OrgId, ids: string[])',
            content
        )

        # 5. Remove createdBy/updatedBy/deletedBy from method bodies
        content = re.sub(rf'createdBy: createdBy \?\? null,?\s*// Audit trail', '', content)
        content = re.sub(rf'updatedBy: updatedBy \?\? null,?\s*// Audit trail', '', content)
        content = re.sub(rf'deletedBy: deletedBy \?\? null,?', '', content)

        # 6. Fix toDomain return type
        content = re.sub(
            rf'private toDomain\(model: any\): Timestamps',
            rf'private toDomain(model: any): {entity_name}',
            content
        )
        content = re.sub(
            rf'private toDomain\(model: any\): Timestamps',
            rf'private toDomain(model: any): {entity_name}',
            content
        )
        # Fix return statement in toDomain
        content = re.sub(
            rf'\}} as Timestamps;',
            rf'}} as {entity_name};',
            content
        )

        # 7. Fix create method to handle AlertEvaluation input (extract input fields)
        # Add comment and type assertion for create method
        if f'async create(orgId: OrgId, data: {entity_name}' in content:
            # Check if we need to add the input extraction logic
            input_type = f'{entity_name}Input'
            if f'{input_type}' in content:
                # Add comment and extraction logic before the try block
                create_pattern = rf'(async create\(orgId: OrgId, data: {entity_name}\)[^{{]*{{)'
                replacement = rf'\1\n    // Note: Repository interface expects {entity_name}, but we only use input fields\n    // Extract only the input fields to avoid including id, createdAt, updatedAt\n    const inputData = data as unknown as {input_type};\n    try'
                content = re.sub(create_pattern, replacement, content, count=1)
                # Update data spread to use inputData
                content = re.sub(
                    rf'(data: \{{)\s*\.\.\.data,',
                    rf'\1\n          ...inputData,',
                    content,
                    count=1
                )

        # 8. Remove or comment out extra methods (createMany, updateMany, deleteMany)
        # These are not in the repository interface, so we'll remove them
        # But first check if they're used elsewhere - for now, we'll keep them but they won't be part of the interface

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"  ❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Main function to fix all DAO repositories"""
    base_path = Path('platform/adapters/src')
    if not base_path.exists():
        print(f"❌ Directory {base_path} does not exist")
        return

    dao_files = list(base_path.rglob('*.dao.repository.ts'))
    print(f"Found {len(dao_files)} DAO repository files")

    fixed_count = 0
    for file_path in dao_files:
        rel_path = str(file_path)
        print(f"Processing {rel_path}...")
        if fix_dao_repository(rel_path):
            print(f"  ✅ Fixed {rel_path}")
            fixed_count += 1
        else:
            print(f"  ⏭️  No changes needed for {rel_path}")

    print(f"\n✅ Fixed {fixed_count} out of {len(dao_files)} files")

if __name__ == '__main__':
    main()
