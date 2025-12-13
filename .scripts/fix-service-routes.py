#!/usr/bin/env python3
"""
Fix all service route files in platform/services/src to:
1. Extract orgId from JWT token using extractOrgId helper
2. Extract id from request.params.id for GET/PATCH/DELETE operations
3. Use Create*Input types for POST operations (wrapped request body)
4. Use Update*Input types for PATCH operations (wrapped request body)
5. Pass id parameter to handlers that need it
6. Fix DELETE handlers to return 204 with no body
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Tuple

def extract_entity_name(file_path: str) -> str:
    """Extract entity name from file path like 'alert-evaluations.routes.ts' -> 'AlertEvaluation'"""
    filename = os.path.basename(file_path)
    # Remove .routes.ts
    name_part = filename.replace('.routes.ts', '')
    # Convert kebab-case to PascalCase
    parts = name_part.split('-')
    return ''.join(word.capitalize() for word in parts)

def extract_domain(file_path: str) -> str:
    """Extract domain from path like 'platform/services/src/decision-intelligence/...' -> 'decision-intelligence'"""
    parts = file_path.split('/')
    for i, part in enumerate(parts):
        if part == 'src' and i + 1 < len(parts):
            return parts[i + 1]
    return ''

def fix_route_file(file_path: str) -> bool:
    """Fix a single route file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        entity_name = extract_entity_name(file_path)
        domain = extract_domain(file_path)

        if not entity_name or not domain:
            print(f"  ⚠️  Skipping {file_path} - could not extract entity/domain")
            return False

        # Convert domain to import path format
        domain_path = domain

        # 1. Add extractOrgId import if not present
        if 'extractOrgId' not in content:
            # Find the last import statement before the route function
            import_pattern = r'(import type \{ [^}]+\} from "@cuur/core/[^"]+";)'
            imports = re.findall(import_pattern, content)
            if imports:
                last_import = imports[-1]
                # Add extractOrgId import after the last @cuur/core import
                extract_import = 'import { extractOrgId } from "../../../shared/extract-org-id.js";'
                # Check if shared import already exists
                if '../../../shared/extract-org-id.js' not in content:
                    content = content.replace(last_import, f'{last_import}\n{extract_import}')
                else:
                    # Update existing import
                    content = re.sub(
                        r'import \{ extractOrgId \} from "\.\.\/\.\.\/\.\.\/shared\/extract-org-id\.js";',
                        extract_import,
                        content
                    )

        # 2. Replace orgId extraction - change from header-based to JWT-based
        # Pattern: const orgId = (request as any).orgId || (request.headers as any)['x-org-id'] || '';
        old_orgid_pattern = r"const orgId = \(request as any\)\.orgId \|\| \(request\.headers as any\)\['x-org-id'\] \|\| '';"
        new_orgid = "const orgId = extractOrgId(request);"
        content = re.sub(old_orgid_pattern, new_orgid, content)

        # Also handle variations
        content = re.sub(
            r"const orgId = \(request as any\)\.orgId[^;]*;",
            new_orgid,
            content
        )

        # 3. Fix GET /{id} routes - extract id and pass to handler
        # Pattern: fastify.get("/.../:id", ...) without id extraction
        get_id_pattern = r'(fastify\.get\("/[^"]+/:id"[^{]*\{[^}]*const orgId = extractOrgId\(request\);[^}]*)(const result = await (\w+)\(deps\.\w+Repo, orgId\);)'
        def fix_get_id(match):
            before = match.group(1)
            handler_call = match.group(2)
            handler_name = match.group(3)
            repo_match = re.search(r'deps\.(\w+Repo)', handler_call)
            repo_name = repo_match.group(1) if repo_match else 'repo'
            # Check if id is already extracted
            if 'const id =' not in before:
                return f'{before}    const id = (request.params as any).id;\n    const result = await {handler_name}(deps.{repo_name}, orgId, id);'
            else:
                return f'{before}    const result = await {handler_name}(deps.{repo_name}, orgId, id);'

        content = re.sub(get_id_pattern, fix_get_id, content)

        # 4. Fix PATCH routes - extract id, use Update*Input, pass id to handler
        patch_pattern = r'(fastify\.patch\("/[^"]+/:id"[^{]*\{[^}]*const orgId = extractOrgId\(request\);[^}]*)(const result = await (\w+)\(deps\.\w+Repo, orgId(?:, [^)]+)?, request\.body as \w+\);)'
        def fix_patch(match):
            before = match.group(1)
            handler_call = match.group(2)
            handler_name = match.group(3)
            repo_match = re.search(r'deps\.(\w+Repo)', handler_call)
            repo_name = repo_match.group(1) if repo_match else 'repo'
            update_type = f"Update{entity_name}Input"
            # Check if id is already extracted
            if 'const id =' not in before:
                return f'{before}    const id = (request.params as any).id;\n    const result = await {handler_name}(deps.{repo_name}, orgId, id, request.body as {update_type});'
            else:
                return f'{before}    const result = await {handler_name}(deps.{repo_name}, orgId, id, request.body as {update_type});'

        content = re.sub(patch_pattern, fix_patch, content)

        # 5. Fix DELETE routes - extract id, pass id to handler, return 204 with no body
        delete_pattern = r'(fastify\.delete\("/[^"]+/:id"[^{]*\{[^}]*const orgId = extractOrgId\(request\);[^}]*)(const result = await (\w+)\(deps\.\w+Repo, orgId(?:, [^)]+)?\);[^}]*return reply\.code\(204\)\.send\(result\);)'
        def fix_delete(match):
            before = match.group(1)
            handler_call = match.group(2)
            handler_name = match.group(3)
            repo_match = re.search(r'deps\.(\w+Repo)', handler_call)
            repo_name = repo_match.group(1) if repo_match else 'repo'
            # Check if id is already extracted
            if 'const id =' not in before:
                return f'{before}    const id = (request.params as any).id;\n    await {handler_name}(deps.{repo_name}, orgId, id);\n    return reply.code(204).send();'
            else:
                return f'{before}    await {handler_name}(deps.{repo_name}, orgId, id);\n    return reply.code(204).send();'

        content = re.sub(delete_pattern, fix_delete, content)

        # Also handle DELETE without result variable
        delete_no_result_pattern = r'(fastify\.delete\("/[^"]+/:id"[^{]*\{[^}]*const orgId = extractOrgId\(request\);[^}]*)(await (\w+)\(deps\.\w+Repo, orgId(?:, [^)]+)?\);[^}]*return reply\.code\(204\)\.send\(\);?)'
        def fix_delete_no_result(match):
            before = match.group(1)
            handler_call = match.group(2)
            handler_name = match.group(3)
            repo_match = re.search(r'deps\.(\w+Repo)', handler_call)
            repo_name = repo_match.group(1) if repo_match else 'repo'
            if 'const id =' not in before:
                return f'{before}    const id = (request.params as any).id;\n    await {handler_name}(deps.{repo_name}, orgId, id);\n    return reply.code(204).send();'
            else:
                return f'{before}    await {handler_name}(deps.{repo_name}, orgId, id);\n    return reply.code(204).send();'

        content = re.sub(delete_no_result_pattern, fix_delete_no_result, content)

        # 6. Fix POST routes - use Create*Input type
        # Find POST routes and update the type
        post_type_pattern = rf'(request\.body as )({entity_name}Input)(\))'
        create_type = f"Create{entity_name}Input"
        content = re.sub(post_type_pattern, rf'\1{create_type}\3', content)

        # Also handle generic Input types that should be Create*Input
        post_generic_pattern = r'(fastify\.post\("[^"]+"[^{]*\{[^}]*request\.body as )(\w+Input)(\))'
        def fix_post_type(match):
            input_type = match.group(2)
            # If it's not Create*Input, replace it
            if not input_type.startswith('Create'):
                # Try to construct Create*Input from entity name
                base_name = input_type.replace('Input', '')
                create_type = f"Create{base_name}Input" if base_name else f"Create{entity_name}Input"
                return f'{match.group(1)}{create_type}{match.group(3)}'
            return match.group(0)

        content = re.sub(post_generic_pattern, fix_post_type, content)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"  ❌ Error fixing {file_path}: {e}")
        import traceback
        traceback.print_exc()
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
        print(f"Processing {rel_path}...")
        if fix_route_file(rel_path):
            print(f"  ✅ Fixed {rel_path}")
            fixed_count += 1
        else:
            print(f"  ⏭️  No changes needed for {rel_path}")

    print(f"\n✅ Fixed {fixed_count} out of {len(route_files)} files")

if __name__ == '__main__':
    main()
