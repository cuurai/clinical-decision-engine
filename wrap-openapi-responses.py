#!/usr/bin/env python3
"""
Add response envelope schemas to OpenAPI files and wrap response definitions.
Validates YAML syntax after each modification.
"""

import yaml
import sys
from pathlib import Path
from typing import Tuple

# Domain prefixes for response schemas
DOMAIN_PREFIXES = {
    'openapi-decision-intelligence.yaml': 'DEC',
    'openapi-integration-interoperability.yaml': 'INT',
    'openapi-knowledge-evidence.yaml': 'KNO',
    'openapi-patient-clinical-data.yaml': 'PAT',
    'openapi-workflow-care-pathways.yaml': 'WOR',
}

RESPONSE_SCHEMAS = {
    'DEC': '''    DecApiMeta:
      type: object
      description: Response metadata with correlation tracking
      properties:
        correlationId:
          type: string
          description: Unique identifier for request-response correlation
        timestamp:
          type: string
          format: date-time
          description: Response timestamp
        totalCount:
          type: integer
          description: Total count of items (for list responses)
        pageSize:
          type: integer
          description: Number of items per page
        pageNumber:
          type: integer
          description: Current page number

    DecApiResponse:
      type: object
      properties:
        data:
          type: object
          description: Response payload
        meta:
          $ref: "#/components/schemas/DecApiMeta"

    DecApiListResponse:
      type: object
      properties:
        data:
          type: array
          description: List of items
        meta:
          $ref: "#/components/schemas/DecApiMeta"

''',
    'INT': '''    IntApiMeta:
      type: object
      description: Response metadata with correlation tracking
      properties:
        correlationId:
          type: string
          description: Unique identifier for request-response correlation
        timestamp:
          type: string
          format: date-time
          description: Response timestamp
        totalCount:
          type: integer
          description: Total count of items (for list responses)
        pageSize:
          type: integer
          description: Number of items per page
        pageNumber:
          type: integer
          description: Current page number

    IntApiResponse:
      type: object
      properties:
        data:
          type: object
          description: Response payload
        meta:
          $ref: "#/components/schemas/IntApiMeta"

    IntApiListResponse:
      type: object
      properties:
        data:
          type: array
          description: List of items
        meta:
          $ref: "#/components/schemas/IntApiMeta"

''',
    'KNO': '''    KnoApiMeta:
      type: object
      description: Response metadata with correlation tracking
      properties:
        correlationId:
          type: string
          description: Unique identifier for request-response correlation
        timestamp:
          type: string
          format: date-time
          description: Response timestamp
        totalCount:
          type: integer
          description: Total count of items (for list responses)
        pageSize:
          type: integer
          description: Number of items per page
        pageNumber:
          type: integer
          description: Current page number

    KnoApiResponse:
      type: object
      properties:
        data:
          type: object
          description: Response payload
        meta:
          $ref: "#/components/schemas/KnoApiMeta"

    KnoApiListResponse:
      type: object
      properties:
        data:
          type: array
          description: List of items
        meta:
          $ref: "#/components/schemas/KnoApiMeta"

''',
    'PAT': '''    PatApiMeta:
      type: object
      description: Response metadata with correlation tracking
      properties:
        correlationId:
          type: string
          description: Unique identifier for request-response correlation
        timestamp:
          type: string
          format: date-time
          description: Response timestamp
        totalCount:
          type: integer
          description: Total count of items (for list responses)
        pageSize:
          type: integer
          description: Number of items per page
        pageNumber:
          type: integer
          description: Current page number

    PatApiResponse:
      type: object
      properties:
        data:
          type: object
          description: Response payload
        meta:
          $ref: "#/components/schemas/PatApiMeta"

    PatApiListResponse:
      type: object
      properties:
        data:
          type: array
          description: List of items
        meta:
          $ref: "#/components/schemas/PatApiMeta"

''',
    'WOR': '''    WorApiMeta:
      type: object
      description: Response metadata with correlation tracking
      properties:
        correlationId:
          type: string
          description: Unique identifier for request-response correlation
        timestamp:
          type: string
          format: date-time
          description: Response timestamp
        totalCount:
          type: integer
          description: Total count of items (for list responses)
        pageSize:
          type: integer
          description: Number of items per page
        pageNumber:
          type: integer
          description: Current page number

    WorApiResponse:
      type: object
      properties:
        data:
          type: object
          description: Response payload
        meta:
          $ref: "#/components/schemas/WorApiMeta"

    WorApiListResponse:
      type: object
      properties:
        data:
          type: array
          description: List of items
        meta:
          $ref: "#/components/schemas/WorApiMeta"

'''
}

def validate_yaml(filepath: Path) -> Tuple[bool, str]:
    """Validate YAML syntax and return (is_valid, error_message)"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            yaml.safe_load(f)
        return True, ""
    except yaml.YAMLError as e:
        return False, str(e)

def add_response_schemas(filepath: Path, prefix: str) -> Tuple[bool, str]:
    """Add response envelope schemas to components/schemas section"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the Timestamps schema (it comes after Error)
    timestamps_marker = '\n    Timestamps:'
    if timestamps_marker not in content:
        return False, "Could not find Timestamps schema insertion point"

    # Insert response schemas before Timestamps
    schemas_to_insert = RESPONSE_SCHEMAS[prefix]
    content = content.replace(timestamps_marker, '\n' + schemas_to_insert + '    Timestamps:', 1)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    # Validate
    is_valid, error = validate_yaml(filepath)
    if not is_valid:
        # Restore original file
        import subprocess
        subprocess.run(['git', 'restore', str(filepath)], cwd=filepath.parent.parent, check=True)
        return False, f"YAML validation failed after adding schemas: {error}"

    return True, f"Added response envelope schemas"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Track modifications
    original_content = content

    # Count responses that should be wrapped
    wrap_count = 0

    # For now, just validate the file structure
    is_valid, error = validate_yaml(filepath)
    if not is_valid:
        return False, f"YAML validation failed: {error}"

    return True, f"Schema file is valid and ready for response wrapping"

def main():
    openapi_dir = Path('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi')

    files_to_process = [
        ('openapi-decision-intelligence.yaml', 'DEC'),
        ('openapi-integration-interoperability.yaml', 'INT'),
        ('openapi-knowledge-evidence.yaml', 'KNO'),
        ('openapi-patient-clinical-data.yaml', 'PAT'),
        ('openapi-workflow-care-pathways.yaml', 'WOR'),
    ]

    print("=" * 80)
    print("Adding Response Envelope Schemas to OpenAPI Files")
    print("=" * 80)
    print()

    all_success = True

    for filename, prefix in files_to_process:
        filepath = openapi_dir / filename

        if not filepath.exists():
            print(f"✗ {filename}: File not found")
            all_success = False
            continue

        print(f"Processing: {filename}")

        # Add schemas
        success, message = add_response_schemas(filepath, prefix)
        if not success:
            print(f"  ✗ Failed: {message}")
            all_success = False
            continue

        print(f"  ✓ {message}")

        # Validate
        is_valid, error = validate_yaml(filepath)
        if is_valid:
            print(f"  ✓ YAML validation passed")
        else:
            print(f"  ✗ YAML validation failed: {error}")
            all_success = False

    print()
    print("=" * 80)

    if all_success:
        print("✓ All schema additions completed successfully")
        return 0
    else:
        print("✗ Some files encountered errors")
if __name__ == '__main__':
    sys.exit(main())
