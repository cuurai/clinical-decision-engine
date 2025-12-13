#!/usr/bin/env python3
"""
Wrap all response definitions in ApiResponse/ApiListResponse envelopes.
Reads YAML, wraps responses, validates, and writes back.
"""

import yaml
import re
import sys
from pathlib import Path
from typing import Tuple, Dict, Any

DOMAIN_CONFIG = {
    'openapi-decision-intelligence.yaml': {
        'response_schema': 'DecApiResponse',
        'list_response_schema': 'DecApiListResponse',
    },
    'openapi-integration-interoperability.yaml': {
        'response_schema': 'IntApiResponse',
        'list_response_schema': 'IntApiListResponse',
    },
    'openapi-knowledge-evidence.yaml': {
        'response_schema': 'KnoApiResponse',
        'list_response_schema': 'KnoApiListResponse',
    },
    'openapi-patient-clinical-data.yaml': {
        'response_schema': 'PatApiResponse',
        'list_response_schema': 'PatApiListResponse',
    },
    'openapi-workflow-care-pathways.yaml': {
        'response_schema': 'WorApiResponse',
        'list_response_schema': 'WorApiListResponse',
    },
}

def validate_yaml(content: str) -> Tuple[bool, str]:
    """Validate YAML content"""
    try:
        yaml.safe_load(content)
        return True, ""
    except yaml.YAMLError as e:
        return False, str(e)

def wrap_responses(file_content: str, config: Dict[str, str]) -> str:
    """
    Wrap all response definitions using regex patterns.
    Handles both $ref and inline schema types.
    """

    # Pattern 1: Wrap single $ref in 200/201 responses
    # Before: schema:\n            $ref: "#/components/schemas/Entity"
    # After:  schema:\n              allOf:\n                - $ref: "#/components/schemas/ApiResponse"\n                - type: object\n                  properties:\n                    data:\n                      $ref: "#/components/schemas/Entity"

    response_schema = config['response_schema']
    list_response_schema = config['list_response_schema']

    content = file_content

    # Pattern for 200/201 responses with schema refs
    # This regex captures the full response block and wraps the schema
    pattern = r'("200"|"201"):\n(\s+)description: ([^\n]+)\n(\s+)content:\n(\s+)application/json:\n(\s+)schema:\n(\s+)(\$ref: "[^"]+")(?=\n\s{2,}(?:"[0-9]{3}":|responses:|parameters:|delete:|patch:|get:|post:|put:))'

    def wrap_schema(match):
        status = match.group(1)
        indent_response = match.group(2)
        description = match.group(3)
        indent_content = match.group(4)
        indent_app = match.group(5)
        indent_schema = match.group(6)
        schema_ref = match.group(7)

        # Determine which response schema to use (200 might be list, 201 is usually single)
        # For now, use response_schema for all (handlers manage the distinction)
        api_response_ref = f'$ref: "#/components/schemas/{response_schema}"'

        return f'''{status}:
{indent_response}description: {description}
{indent_content}content:
{indent_app}application/json:
{indent_schema}schema:
{indent_schema}  allOf:
{indent_schema}    - {api_response_ref}
{indent_schema}    - type: object
{indent_schema}      properties:
{indent_schema}        data:
{indent_schema}          {schema_ref}'''

    wrapped_content = re.sub(pattern, wrap_schema, content, flags=re.MULTILINE)

    return wrapped_content

def process_file(filepath: Path, config: Dict[str, str]) -> Tuple[bool, str]:
    """Process a single OpenAPI file"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Wrap responses
    wrapped = wrap_responses(content, config)

    # Validate
    is_valid, error = validate_yaml(wrapped)
    if not is_valid:
        return False, f"YAML validation failed: {error}"

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(wrapped)

    return True, "Wrapped and validated"

def main():
    openapi_dir = Path('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi')

    print("=" * 80)
    print("Wrapping Response Definitions in allOf Envelopes")
    print("=" * 80)
    print()

    all_success = True

    for filename, config in DOMAIN_CONFIG.items():
        filepath = openapi_dir / filename

        if not filepath.exists():
            print(f"✗ {filename}: File not found")
            all_success = False
            continue

        print(f"Processing: {filename}")
        success, message = process_file(filepath, config)

        if success:
            print(f"  ✓ {message}")
        else:
            print(f"  ✗ {message}")
            all_success = False

    print()
    print("=" * 80)

    if all_success:
        print("✓ All response definitions wrapped successfully")
        return 0
    else:
        print("✗ Some files encountered errors")
        return 1

if __name__ == '__main__':
    sys.exit(main())
