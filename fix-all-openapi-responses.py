#!/usr/bin/env python3
"""
Wraps ALL OpenAPI response definitions (not just lists) in response envelopes.
Handles list responses (arrays) and single responses (objects).
"""

import re
import yaml
import sys
from pathlib import Path

# OpenAPI file mappings
OPENAPI_FILES = {
    'openapi/openapi-decision-intelligence.yaml': {
        'response_schema': 'DecApiResponse',
        'list_response_schema': 'DecApiListResponse',
        'prefix': 'DEC',
    },
    'openapi/openapi-integration-interoperability.yaml': {
        'response_schema': 'IntApiResponse',
        'list_response_schema': 'IntApiListResponse',
        'prefix': 'INT',
    },
    'openapi/openapi-knowledge-evidence.yaml': {
        'response_schema': 'KnoApiResponse',
        'list_response_schema': 'KnoApiListResponse',
        'prefix': 'KNO',
    },
    'openapi/openapi-patient-clinical-data.yaml': {
        'response_schema': 'PatApiResponse',
        'list_response_schema': 'PatApiListResponse',
        'prefix': 'PAT',
    },
    'openapi/openapi-workflow-care-pathways.yaml': {
        'response_schema': 'WorApiResponse',
        'list_response_schema': 'WorApiListResponse',
        'prefix': 'WOR',
    },
}

def is_list_response(schema_text):
    """Check if a response schema is a list (array) response."""
    try:
        # Check for type: array or items with $ref pattern
        return 'type: array' in schema_text or ('items:' in schema_text and '$ref:' in schema_text)
    except:
        return False

def wrap_single_response(content, response_schema, item_ref):
    """Wrap a single response schema in allOf envelope."""
    # Check if already wrapped
    if 'allOf:' in content:
        return content

    wrapper = f"""allOf:
                  - $ref: "#/components/schemas/{response_schema}"
                  - type: object
                    properties:
                      data:
                        $ref: "{item_ref}" """

    # Replace the $ref with wrapped version
    lines = content.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Look for $ref: "#/components/schemas/...
        if '$ref: "#/components/schemas/' in line:
            # Get the schema reference
            ref_match = re.search(r'\$ref: "#/components/schemas/(\w+)"', line)
            if ref_match:
                schema_name = ref_match.group(1)
                item_ref = f'"#/components/schemas/{schema_name}"'

                # Replace the line with wrapped version
                indent = len(line) - len(line.lstrip())
                replacement = ' ' * indent + wrapper
                result.append(replacement)
                i += 1
                continue

        result.append(line)
        i += 1

    return '\n'.join(result)

def process_openapi_file(filepath, response_schema, list_response_schema):
    """Process a single OpenAPI YAML file."""
    print(f"Processing: {filepath} ... ", end='', flush=True)

    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Pattern to find all 200/201 responses with schemas
        # Look for responses with content and schema
        response_pattern = r'((?:200|201|204):"[^"]*".*?schema:)(.*?)(?=\n\s{4}(?:"|\w))'

        def wrap_response(match):
            prefix = match.group(1)
            schema_section = match.group(2)

            # Check if this is a list response
            if is_list_response(schema_section):
                # Already handled by previous wrapping, keep as-is
                if 'allOf:' in schema_section:
                    return prefix + schema_section
                else:
                    # List response without allOf, add it
                    list_wrapper = f"""allOf:
                  - $ref: "#/components/schemas/{list_response_schema}"
                  - type: object
                    properties:
                      data:
                        type: array
                        items:"""

                    # Extract the items $ref
                    items_match = re.search(r'items:\s*\n\s+(\$ref:.*)', schema_section, re.MULTILINE)
                    if items_match:
                        return prefix + list_wrapper + '\n                          ' + items_match.group(1)
            else:
                # Single response - check if not already wrapped
                if 'allOf:' in schema_section:
                    return prefix + schema_section
                else:
                    # Extract the $ref for the single response
                    ref_match = re.search(r'\$ref: "#/components/schemas/(\w+)"', schema_section)
                    if ref_match:
                        schema_name = ref_match.group(1)
                        single_wrapper = f"""allOf:
                  - $ref: "#/components/schemas/{response_schema}"
                  - type: object
                    properties:
                      data:
                        $ref: "#/components/schemas/{schema_name}" """
                        return prefix + single_wrapper

            return prefix + schema_section

        # Process responses - more targeted pattern
        lines = content.split('\n')
        result = []
        i = 0
        in_response = False
        response_status = None
        indent_level = 0
        schema_started = False
        schema_content = []
        schema_indent = 0

        while i < len(lines):
            line = lines[i]

            # Detect response status code
            if re.match(r'\s+"(200|201|204|400|404|500|500)\":\s*$', line):
                in_response = True
                response_status = line.strip().split(':')[0].strip('"')
                result.append(line)
                i += 1
                continue

            # If we're in a response, look for content/schema
            if in_response:
                if 'content:' in line:
                    result.append(line)
                    i += 1
                    continue
                elif 'application/json:' in line:
                    result.append(line)
                    i += 1
                    continue
                elif 'schema:' in line:
                    # Found schema, now capture the schema content
                    result.append(line)
                    schema_indent = len(line) - len(line.lstrip())
                    schema_started = True
                    i += 1
                    # Now capture schema lines
                    schema_lines = []
                    while i < len(lines):
                        next_line = lines[i]
                        next_indent = len(next_line) - len(next_line.lstrip())

                        # If we hit a line with same or less indentation (and not empty), we're done with schema
                        if next_indent <= schema_indent and next_line.strip() and not next_line.strip().startswith('-'):
                            break

                        schema_lines.append(next_line)
                        i += 1

                    schema_text = '\n'.join(schema_lines)

                    # Now wrap the schema if needed
                    wrapped = wrap_schema_response(schema_text, response_schema, list_response_schema)
                    result.extend(wrapped.split('\n'))
                    in_response = False
                    continue
                elif re.match(r'\s+"\d{3}":\s*$', line):
                    # Another response code, reset
                    in_response = False
                    result.append(line)
                    i += 1
                    continue
                else:
                    result.append(line)
                    i += 1
                    continue

            result.append(line)
            i += 1

        new_content = '\n'.join(result)

        # Validate YAML
        try:
            yaml.safe_load(new_content)
        except Exception as e:
            print(f"✗ YAML validation failed: {str(e)[:50]}")
            return False

        # Write back
        with open(filepath, 'w') as f:
            f.write(new_content)

        print("✓ Wrapped and validated")
        return True

    except Exception as e:
        print(f"✗ Error: {str(e)[:60]}")
        return False

def wrap_schema_response(schema_text, response_schema, list_response_schema):
    """Wrap a schema response in proper envelope."""
    lines = schema_text.split('\n')

    # Check if already wrapped
    if any('allOf:' in line for line in lines):
        return schema_text

    # Check if list response (has type: array or items)
    is_list = any('type: array' in line for line in lines) or any('items:' in line for line in lines)

    # Find the $ref or type definition
    ref_line = None
    ref_line_idx = None

    for idx, line in enumerate(lines):
        if '$ref:' in line:
            ref_line = line
            ref_line_idx = idx
            break

    if not ref_line:
        return schema_text

    # Extract schema reference
    ref_match = re.search(r'\$ref: "#/components/schemas/(\w+)"', ref_line)
    if not ref_match:
        return schema_text

    schema_name = ref_match.group(1)
    indent = len(ref_line) - len(ref_line.lstrip())
    base_indent = ' ' * indent

    if is_list:
        # List response with items
        wrapper = f"""{base_indent}allOf:
{base_indent}  - $ref: "#/components/schemas/{list_response_schema}"
{base_indent}  - type: object
{base_indent}    properties:
{base_indent}      data:
{base_indent}        type: array
{base_indent}        items:
{base_indent}          $ref: "#/components/schemas/{schema_name}" """
    else:
        # Single response
        wrapper = f"""{base_indent}allOf:
{base_indent}  - $ref: "#/components/schemas/{response_schema}"
{base_indent}  - type: object
{base_indent}    properties:
{base_indent}      data:
{base_indent}        $ref: "#/components/schemas/{schema_name}" """

    # Replace the $ref line with wrapped version
    result_lines = lines[:ref_line_idx] + [wrapper] + lines[ref_line_idx + 1:]
    return '\n'.join(result_lines)

def main():
    """Main entry point."""
    os.chdir('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine')

    all_ok = True
    for filepath, config in OPENAPI_FILES.items():
        ok = process_openapi_file(
            filepath,
            config['response_schema'],
            config['list_response_schema']
        )
        all_ok = all_ok and ok

    if all_ok:
        print("\n✓ All OpenAPI files processed successfully")
        return 0
    else:
        print("\n✗ Some files failed processing")
        return 1

if __name__ == '__main__':
    import os
    sys.exit(main())
