#!/usr/bin/env python3
"""
Updates ALL OpenAPI response definitions (200/201/204) to wrap responses in envelopes.
Works with both list responses (arrays) and single responses (objects).
"""

import yaml
import sys
from pathlib import Path
from typing import Dict, Any, Optional

MAPPINGS = {
    'openapi-decision-intelligence.yaml': {
        'response': 'DecApiResponse',
        'list_response': 'DecApiListResponse',
    },
    'openapi-integration-interoperability.yaml': {
        'response': 'IntApiResponse',
        'list_response': 'IntApiListResponse',
    },
    'openapi-knowledge-evidence.yaml': {
        'response': 'KnoApiResponse',
        'list_response': 'KnoApiListResponse',
    },
    'openapi-patient-clinical-data.yaml': {
        'response': 'PatApiResponse',
        'list_response': 'PatApiListResponse',
    },
    'openapi-workflow-care-pathways.yaml': {
        'response': 'WorApiResponse',
        'list_response': 'WorApiListResponse',
    },
}

def is_list_response(schema: Dict[str, Any]) -> bool:
    """Check if schema is a list response."""
    return schema.get('type') == 'array' or (
        'items' in schema and '$ref' in schema['items']
    )

def wrap_response_schema(schema: Dict[str, Any], response_name: str, list_response_name: str) -> Dict[str, Any]:
    """Wrap a response schema in allOf envelope."""

    # Already wrapped
    if 'allOf' in schema:
        return schema

    # Extract the reference or type
    if '$ref' in schema:
        ref = schema['$ref']
        return {
            'allOf': [
                {'$ref': f'#/components/schemas/{response_name}'},
                {
                    'type': 'object',
                    'properties': {
                        'data': {'$ref': ref}
                    }
                }
            ]
        }
    elif schema.get('type') == 'array' and 'items' in schema:
        items = schema['items']
        return {
            'allOf': [
                {'$ref': f'#/components/schemas/{list_response_name}'},
                {
                    'type': 'object',
                    'properties': {
                        'data': {
                            'type': 'array',
                            'items': items
                        }
                    }
                }
            ]
        }

    # Already an object or complex schema
    return schema

def process_openapi_file(filepath: Path, response_name: str, list_response_name: str) -> bool:
    """Process a single OpenAPI file."""
    print(f"Processing {filepath.name}...", end=' ', flush=True)

    try:
        with open(filepath, 'r') as f:
            spec = yaml.safe_load(f)

        if not spec or 'paths' not in spec:
            print("✗ Invalid OpenAPI spec")
            return False

        # Iterate through all paths and operations
        response_count = 0
        for path, path_item in spec.get('paths', {}).items():
            for method, operation in path_item.items():
                if method.startswith('x-') or method == 'parameters':
                    continue

                if not isinstance(operation, dict) or 'responses' not in operation:
                    continue

                # Process 200/201/204 responses
                for status_code in ['200', '201', '204']:
                    if status_code not in operation['responses']:
                        continue

                    response = operation['responses'][status_code]
                    if not isinstance(response, dict):
                        continue

                    # Get the content
                    if 'content' not in response:
                        continue

                    content = response.get('content', {})
                    app_json = content.get('application/json')
                    if not app_json or 'schema' not in app_json:
                        continue

                    schema = app_json['schema']

                    # Skip if already wrapped
                    if 'allOf' in schema:
                        continue

                    # Skip if no schema content
                    if not schema:
                        continue

                    # Wrap the schema
                    wrapped = wrap_response_schema(schema, response_name, list_response_name)
                    if wrapped != schema:
                        app_json['schema'] = wrapped
                        response_count += 1

        # Write back to file
        with open(filepath, 'w') as f:
            yaml.dump(spec, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

        print(f"✓ Wrapped {response_count} responses")
        return True

    except Exception as e:
        print(f"✗ Error: {str(e)[:80]}")
        return False

def main():
    """Main entry point."""
    openapi_dir = Path('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi')

    all_ok = True
    for filename, config in MAPPINGS.items():
        filepath = openapi_dir / filename
        if not filepath.exists():
            print(f"Skipping {filename} - not found")
            continue

        ok = process_openapi_file(filepath, config['response'], config['list_response'])
        all_ok = all_ok and ok

    if all_ok:
        print("\n✓ All OpenAPI files updated successfully")
        return 0
    else:
        print("\n✗ Some files failed")
        return 1

if __name__ == '__main__':
    sys.exit(main())
