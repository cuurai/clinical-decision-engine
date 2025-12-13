#!/usr/bin/env python3
"""
Fix pluralized Update types in route files (e.g., UpdateChecklistInstancesInput -> UpdateChecklistInstanceInput)
"""

import re
import os
from pathlib import Path

def extract_entity_name(file_path: str) -> str:
    """Extract entity name from file path like 'checklist-instances.routes.ts' -> 'ChecklistInstance'"""
    filename = os.path.basename(file_path)
    name_part = filename.replace('.routes.ts', '')
    parts = name_part.split('-')
    # Convert to PascalCase
    entity = ''.join(word.capitalize() for word in parts)
    # Remove plural 's' at the end if present
    if entity.endswith('s') and len(entity) > 1:
        entity = entity[:-1]
    return entity

def fix_pluralized_types(file_path: str) -> bool:
    """Fix pluralized Update types"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        entity_name = extract_entity_name(file_path)

        # Fix pluralized Update types
        # Pattern: UpdateEntityNamesInput -> UpdateEntityNameInput
        plural_pattern = rf'Update{entity_name}sInput'
        correct_type = f'Update{entity_name}Input'

        if plural_pattern in content:
            content = content.replace(plural_pattern, correct_type)

        # Also fix other plural patterns
        content = re.sub(rf'Update(\w+)sInput', lambda m: f'Update{m.group(1)}Input' if m.group(1).endswith('s') == False else m.group(0), content)

        # Fix specific known pluralizations
        plural_fixes = {
            'UpdateChecklistInstancesInput': 'UpdateChecklistInstanceInput',
            'UpdateChecklistTemplatesInput': 'UpdateChecklistTemplateInput',
            'UpdateQuestionnaireTemplatesInput': 'UpdateQuestionnaireTemplateInput',
            'UpdateOrderSetTemplatesInput': 'UpdateOrderSetTemplateInput',
            'UpdateDecisionPoliciesInput': 'UpdateDecisionPolicyInput',
            'UpdateImagingStudiesInput': 'UpdateImagingStudyInput',
            'UpdateModelDefinitionsInput': 'UpdateModelDefinitionInput',
            'UpdateMedicationStatementsInput': 'UpdateMedicationStatementInput',
            'UpdateClinicalRulesInput': 'UpdateClinicalRuleInput',
            'UpdateTasksInput': 'UpdateTaskInput',
            'UpdateRoutingRulesInput': 'UpdateRoutingRuleInput',
        }

        for plural, singular in plural_fixes.items():
            content = content.replace(plural, singular)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"  ❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Main function to fix all route files"""
    base_path = Path('platform/services/src')
    if not base_path.exists():
        print(f"❌ Directory {base_path} does not exist")
        return

    route_files = list(base_path.rglob('*.routes.ts'))
    print(f"Found {len(route_files)} route files")

    fixed_count = 0
    for file_path in sorted(route_files):
        rel_path = str(file_path)
        if fix_pluralized_types(rel_path):
            print(f"  ✅ Fixed {rel_path}")
            fixed_count += 1

    print(f"\n✅ Fixed {fixed_count} out of {len(route_files)} files")

if __name__ == '__main__':
    main()
