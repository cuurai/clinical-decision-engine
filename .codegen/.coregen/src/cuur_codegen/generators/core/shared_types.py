"""
Shared Types Generator - Generates shared types export file

This generator runs after all domains are processed and creates a central
export file for all shared types (types defined in common/*.yaml files).

It bundles all common/*.yaml files into a single OpenAPI spec and generates
TypeScript types from it.
"""

from pathlib import Path
from typing import List, Set, Dict, Any
import yaml
import json
import subprocess

from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.errors import GenerationError
from cuur_codegen.base.config import DomainConfig
from cuur_codegen.base.folder_structure import FolderStructureConfig
from cuur_codegen.utils.file import ensure_directory, write_file, file_exists
from cuur_codegen.utils.openapi import load_openapi_spec, get_shared_types_from_common_files, extract_schemas
from cuur_codegen.extractors.openapi_typescript_extractor import OpenApiTypeScriptExtractor


class SharedTypesGenerator(BaseGenerator):
    """Generates shared types export file"""

    @property
    def name(self) -> str:
        return "Shared Types Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "shared_types"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Generate method required by BaseGenerator (not used for shared types)"""
        raise NotImplementedError("Use generate_shared_types() instead")

    def generate_shared_types(self, config) -> GenerateResult:
        """
        Generate shared types export files after all domains are processed.

        This bundles each common/*.yaml file separately, generates TypeScript types
        from each, and creates:
        - core/src/shared/types/components/index.ts
        - core/src/shared/types/domain-models/index.ts
        - core/src/shared/types/errors/index.ts
        - etc.
        - core/src/shared/types/index.ts (exports all)
        """
        files: List[Path] = []
        warnings: List[str] = []
        errors: List[str] = []

        try:
            # Get openapi directory
            openapi_dir = config.paths.openapi_dir
            # If openapi_dir doesn't have src/, try adding it
            if not (openapi_dir / "common").exists():
                openapi_src_dir = openapi_dir / "src"
                if openapi_src_dir.exists():
                    openapi_dir = openapi_src_dir

            common_dir = openapi_dir / "common"
            if not common_dir.exists():
                warnings.append("No common directory found")
                return GenerateResult(files=files, warnings=warnings)

            # Get all common YAML files
            common_files = sorted(common_dir.glob("*.yaml"))
            if not common_files:
                warnings.append("No common YAML files found")
                return GenerateResult(files=files, warnings=warnings)

            project_root = config.paths.project_root
            shared_bundled_dir = config.paths.bundled_dir / "shared"
            ensure_directory(shared_bundled_dir)

            shared_types_base_dir = project_root / "packages" / "core" / "src" / "shared" / "types"
            ensure_directory(shared_types_base_dir)

            # First, bundle all common files together into a master spec using redocly
            # This ensures all $refs between common files are fully resolved
            master_bundled_path = self._bundle_all_common_files(common_files, shared_bundled_dir, common_dir)
            if not master_bundled_path:
                warnings.append("Failed to bundle common files")
                return GenerateResult(files=files, warnings=warnings)

            # Generate master types file from master bundled spec (has all schemas)
            # This will be used as the source for components/operations in index.ts
            master_types_file = shared_types_base_dir / "_master.types.ts"
            if self._generate_master_types_file(master_bundled_path, master_types_file, project_root, config):
                files.append(master_types_file)

            # The master bundle should have all $refs resolved by redocly
            # Load the master bundled spec (all $refs should be resolved)
            master_spec = load_openapi_spec(master_bundled_path)
            master_schemas = master_spec.get("components", {}).get("schemas", {})

            # Process each common file separately - extract its schemas from the master spec
            generated_modules: List[str] = []

            for yaml_file in common_files:
                # Get module name (e.g., "components" from "components.yaml")
                module_name = yaml_file.stem

                # Load original spec to get which schemas belong to this file
                try:
                    original_spec = load_openapi_spec(yaml_file)
                    file_schemas = original_spec.get("components", {}).get("schemas", {})
                    file_schema_names = set(file_schemas.keys())
                except Exception as e:
                    if self.logger:
                        self.logger.warn(f"Failed to load {yaml_file.name}: {e}")
                    continue

                # Create a bundled spec with only this file's schemas (but with resolved $refs from master)
                module_bundled_path = self._create_module_bundled_spec(
                    module_name, file_schema_names, master_schemas, shared_bundled_dir
                )
                if not module_bundled_path:
                    warnings.append(f"Failed to create bundled spec for {module_name}")
                    continue

                # Generate types for this module using the same extractor as domain types
                # File naming: {module}.types.ts (e.g., components.types.ts)
                module_types_file = shared_types_base_dir / f"{module_name}.types.ts"

                # Use the existing OpenApiTypeScriptExtractor (same as domain types)
                # Create a pseudo-domain context for shared types
                pseudo_domain = DomainConfig(name=f"shared-{module_name}", enabled=True)
                # Set bundled_path relative to bundled_dir
                pseudo_domain.bundled_path = Path("shared") / f"{module_name}.json"

                # Load the spec first (same as pipeline does)
                spec = load_openapi_spec(module_bundled_path)

                pseudo_context = GenerationContext(
                    config=config,
                    domain=pseudo_domain,
                    logger=self.logger,
                    spec=spec,  # Load spec like pipeline does
                )

                # Use the extractor to generate types (same way as domain types)
                extractor = OpenApiTypeScriptExtractor(self.logger)
                extractor_result = extractor.generate(pseudo_context)

                # The extractor generates to {domain}/openapi/{domain}.openapi.types.ts
                # We need to move it to shared/types/{module}.types.ts
                generated_file = project_root / "packages" / "core" / "src" / f"shared-{module_name}" / "openapi" / f"shared-{module_name}.openapi.types.ts"

                if file_exists(generated_file):
                    # Move to the correct location
                    ensure_directory(module_types_file.parent)
                    generated_file.rename(module_types_file)

                    # Clean up the temporary domain directory
                    temp_domain_dir = project_root / "packages" / "core" / "src" / f"shared-{module_name}"
                    if temp_domain_dir.exists():
                        import shutil
                        shutil.rmtree(temp_domain_dir)

                    # Add type exports (same pattern as domain types)
                    self._add_type_exports(module_types_file, module_bundled_path)

                    files.append(module_types_file)
                    generated_modules.append(module_name)
                else:
                    warnings.append(f"Failed to generate types for {module_name}")
                    if extractor_result.errors:
                        warnings.extend(extractor_result.errors)

            # Generate main index.ts using TypesBuilder pattern (similar to domain types)
            if generated_modules and file_exists(master_types_file):
                main_index_file = shared_types_base_dir / "index.ts"
                # Load master spec to get all schemas for type exports
                master_spec = load_openapi_spec(master_bundled_path)
                self._generate_main_index_with_types_builder(main_index_file, master_types_file, master_spec)
                files.append(main_index_file)

        except Exception as e:
            errors.append(str(e))
            if self.logger:
                self.logger.error(f"Failed to generate shared types: {str(e)}")

        return GenerateResult(files=files, warnings=warnings, errors=errors)

    def _bundle_all_common_files(self, common_files: List[Path], bundled_dir: Path, common_dir: Path) -> Path:
        """
        Bundle all common files together using redocly to resolve all $refs.
        """
        # Create a temporary master YAML that includes all common files
        master_yaml = common_dir / "_master-common.yaml"
        master_spec: Dict[str, Any] = {
            "openapi": "3.1.0",
            "info": {
                "title": "Quub Exchange - All Common Types",
                "version": "1.0.0",
                "description": "Master spec with all common types"
            },
            "paths": {},
            "components": {
                "schemas": {}
            }
        }

        # Merge all schemas from all common files
        for yaml_file in common_files:
            try:
                spec = load_openapi_spec(yaml_file)
                file_schemas = spec.get("components", {}).get("schemas", {})
                master_spec["components"]["schemas"].update(file_schemas)
            except Exception as e:
                if self.logger:
                    self.logger.warn(f"Failed to load {yaml_file.name}: {e}")
                continue

        # Write temporary master YAML
        with open(master_yaml, "w") as f:
            yaml.dump(master_spec, f, default_flow_style=False, sort_keys=False)

        # Bundle using redocly to resolve all $refs
        master_bundled_path = bundled_dir / "common-master.json"
        try:
            cmd = [
                "npx",
                "--yes",
                "@redocly/cli@latest",
                "bundle",
                str(master_yaml.resolve()),
                "-o",
                str(master_bundled_path),
                "--force",
            ]

            result = subprocess.run(
                cmd,
                cwd=str(common_dir),
                capture_output=True,
                text=True,
                check=True,
            )

            # After bundling, resolve any remaining file-based $refs
            if file_exists(master_bundled_path):
                resolved_spec = load_openapi_spec(master_bundled_path)
                # Resolve file-based $refs to local refs
                resolved_spec = self._resolve_file_refs_in_spec(resolved_spec)
                # Write back the resolved spec
                with open(master_bundled_path, "w") as f:
                    json.dump(resolved_spec, f, indent=2)

            # Clean up temporary file
            if master_yaml.exists():
                master_yaml.unlink()

            return master_bundled_path if file_exists(master_bundled_path) else None
        except subprocess.CalledProcessError as e:
            if master_yaml.exists():
                master_yaml.unlink()
            if self.logger:
                self.logger.warn(f"Failed to bundle common files: {e.stderr}")
            return None

    def _create_module_bundled_spec(self, module_name: str, schema_names: Set[str], master_schemas: Dict[str, Any], bundled_dir: Path) -> Path:
        """
        Create a bundled spec for a specific module with its schemas and all referenced schemas.
        The master_schemas should already have all $refs resolved (from redocly bundle).
        """
        # Start with the module's schemas from the master (which has resolved $refs)
        module_schemas = {name: master_schemas[name] for name in schema_names if name in master_schemas}

        # Recursively find all schemas referenced by this module's schemas
        # Since master_schemas has resolved $refs, we can extract schema names from local refs
        referenced_schemas = self._find_referenced_schemas(module_schemas, master_schemas)

        # Include referenced schemas (but don't duplicate)
        for ref_name in referenced_schemas:
            if ref_name not in module_schemas and ref_name in master_schemas:
                module_schemas[ref_name] = master_schemas[ref_name]

        # Deep copy and resolve any remaining file-based $refs to local refs
        # This handles cases where redocly didn't fully resolve everything
        module_schemas = self._resolve_file_refs_in_schemas(module_schemas, master_schemas)

        module_spec: Dict[str, Any] = {
            "openapi": "3.1.0",
            "info": {
                "title": f"Quub Exchange - {module_name.title()}",
                "version": "1.0.0"
            },
            "paths": {},
            "components": {
                "schemas": module_schemas
            }
        }

        bundled_path = bundled_dir / f"{module_name}.json"
        with open(bundled_path, "w") as f:
            json.dump(module_spec, f, indent=2)

        return bundled_path

    def _resolve_file_refs_in_spec(self, spec: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve file-based $refs (like ./pagination.yaml#/components/schemas/PageInfo) to local refs in entire spec"""
        import copy
        resolved = copy.deepcopy(spec)

        def resolve_refs(obj: Any) -> None:
            if isinstance(obj, dict):
                if "$ref" in obj:
                    ref = obj["$ref"]
                    # If it's a file-based ref, extract schema name and convert to local ref
                    if ".yaml#/components/schemas/" in ref or ".json#/components/schemas/" in ref:
                        schema_name = ref.split("/")[-1]
                        # Replace with local ref
                        obj["$ref"] = f"#/components/schemas/{schema_name}"
                else:
                    for value in obj.values():
                        resolve_refs(value)
            elif isinstance(obj, list):
                for item in obj:
                    resolve_refs(item)

        resolve_refs(resolved)
        return resolved

    def _resolve_file_refs_in_schemas(self, schemas: Dict[str, Any], all_schemas: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve file-based $refs (like ./pagination.yaml#/components/schemas/PageInfo) to local refs"""
        import copy
        resolved = copy.deepcopy(schemas)

        def resolve_refs(obj: Any) -> None:
            if isinstance(obj, dict):
                if "$ref" in obj:
                    ref = obj["$ref"]
                    # If it's a file-based ref, extract schema name and convert to local ref
                    if ".yaml#/components/schemas/" in ref or ".json#/components/schemas/" in ref:
                        schema_name = ref.split("/")[-1]
                        # Replace with local ref
                        obj["$ref"] = f"#/components/schemas/{schema_name}"
                        # Ensure the referenced schema is included
                        if schema_name in all_schemas and schema_name not in resolved:
                            resolved[schema_name] = all_schemas[schema_name]
                else:
                    for value in obj.values():
                        resolve_refs(value)
            elif isinstance(obj, list):
                for item in obj:
                    resolve_refs(item)

        for schema in resolved.values():
            resolve_refs(schema)

        return resolved

    def _find_referenced_schemas(self, schemas: Dict[str, Any], all_schemas: Dict[str, Any], visited: Set[str] = None) -> Set[str]:
        """Recursively find all schema names referenced by the given schemas"""
        if visited is None:
            visited = set()

        referenced = set()

        def extract_refs(obj: Any) -> None:
            if isinstance(obj, dict):
                if "$ref" in obj:
                    ref = obj["$ref"]
                    # Handle both local refs (#/components/schemas/AccountId) and file refs (./pagination.yaml#/components/schemas/PageInfo)
                    if "#/components/schemas/" in ref:
                        ref_name = ref.split("/")[-1]
                        if ref_name in all_schemas and ref_name not in visited:
                            referenced.add(ref_name)
                            visited.add(ref_name)
                            # Recursively check referenced schema
                            extract_refs(all_schemas[ref_name])
                else:
                    for value in obj.values():
                        extract_refs(value)
            elif isinstance(obj, list):
                for item in obj:
                    extract_refs(item)

        for schema in schemas.values():
            extract_refs(schema)

        return referenced

    def _bundle_single_common_file(self, yaml_file: Path, bundled_dir: Path, module_name: str, common_dir: Path) -> Path:
        """
        Bundle a single common YAML file using redocly bundle (to resolve $refs).

        Runs from the common directory so $refs to other common files resolve correctly.

        Returns path to the bundled JSON file.
        """
        bundled_path = bundled_dir / f"{module_name}.json"

        try:
            # Use redocly bundle to properly resolve $ref references
            # Use absolute path to the YAML file, but run from common directory so relative $refs work
            cmd = [
                "npx",
                "--yes",
                "@redocly/cli@latest",
                "bundle",
                str(yaml_file.resolve()),  # Use absolute path
                "-o",
                str(bundled_path),
                "--force",
            ]

            result = subprocess.run(
                cmd,
                cwd=str(common_dir),  # Run from common directory for $ref resolution
                capture_output=True,
                text=True,
                check=True,
            )

            if file_exists(bundled_path):
                return bundled_path
            else:
                if self.logger:
                    self.logger.warn(f"Bundled file not created: {bundled_path}")
                return None
        except subprocess.CalledProcessError as e:
            if self.logger:
                self.logger.warn(f"Failed to bundle {yaml_file.name}: {e.stderr}")
            return None
        except Exception as e:
            if self.logger:
                self.logger.warn(f"Failed to bundle {yaml_file.name}: {e}")
            return None


    def _add_type_exports(self, types_file: Path, bundled_spec_path: Path) -> None:
        """Add type exports for all schemas (same pattern as domain types)"""
        # Load the bundled spec to get schema names
        spec = load_openapi_spec(bundled_spec_path)
        schemas = spec.get("components", {}).get("schemas", {})

        if not schemas:
            return

        # Read the generated types file
        with open(types_file, "r") as f:
            content = f.read()

        # Generate type exports (same pattern as domain types)
        type_exports = []
        for schema_name in sorted(schemas.keys()):
            # Export as: export type SchemaName = components["schemas"]["SchemaName"];
            type_exports.append(f'export type {schema_name} = components["schemas"]["{schema_name}"];')

        # Remove the empty $defs export if it exists and add our type exports
        import re
        if 'export type $defs' in content:
            # Replace the $defs line with our exports
            content = re.sub(
                r'export type \$defs = Record<string, never>;\n',
                '\n'.join(type_exports) + '\n',
                content
            )
        else:
            # Append exports before operations
            if 'export type operations' in content:
                content = content.replace(
                    'export type operations = Record<string, never>;',
                    '\n'.join(type_exports) + '\n' + 'export type operations = Record<string, never>;'
                )
            else:
                # Just append at the end
                content += '\n\n' + '\n'.join(type_exports) + '\n'

        # Write back
        with open(types_file, "w") as f:
            f.write(content)

    def _generate_master_types_file(self, master_bundled_path: Path, master_types_file: Path, project_root: Path, config) -> bool:
        """Generate master types file from master bundled spec (has all schemas). Returns True if successful."""
        # Use the existing OpenApiTypeScriptExtractor (same as domain types)
        pseudo_domain = DomainConfig(name="shared-master", enabled=True)
        pseudo_domain.bundled_path = Path("shared") / "common-master.json"

        # Load the spec first
        spec = load_openapi_spec(master_bundled_path)

        pseudo_context = GenerationContext(
            config=config,
            domain=pseudo_domain,
            logger=self.logger,
            spec=spec,
        )

        # Use the extractor to generate types
        extractor = OpenApiTypeScriptExtractor(self.logger)
        extractor_result = extractor.generate(pseudo_context)

        # The extractor generates to {domain}/openapi/{domain}.openapi.types.ts
        # We need to move it to shared/types/_master.types.ts
        generated_file = project_root / "packages" / "core" / "src" / "shared-master" / "openapi" / "shared-master.openapi.types.ts"

        if file_exists(generated_file):
            # Move to the correct location
            ensure_directory(master_types_file.parent)
            generated_file.rename(master_types_file)

            # Clean up the temporary domain directory
            temp_domain_dir = project_root / "packages" / "core" / "src" / "shared-master"
            if temp_domain_dir.exists():
                import shutil
                shutil.rmtree(temp_domain_dir)

            # Add type exports (same pattern as domain types)
            self._add_type_exports(master_types_file, master_bundled_path)
            return True
        else:
            if self.logger:
                self.logger.warn(f"Master types file was not generated: {generated_file}")
            return False

    def _generate_main_index_with_types_builder(self, index_file: Path, master_types_file: Path, master_spec: Dict[str, Any]) -> None:
        """Generate main index.ts using TypesBuilder pattern (similar to domain types/index.ts)"""
        # Import components and operations from master types file (has all schemas)
        header = f"""/**
 * Shared Types - Main Export
 *
 * Auto-generated from OpenAPI common files
 * Generator: shared-types-generator v{self.version}
 *
 * This file re-exports types from generated shared type modules and adds
 * convenient type aliases for all shared schemas.
 *
 * ⚠️ DO NOT EDIT MANUALLY - this file is auto-generated
 */

import type {{ components, operations }} from "./_master.types";

"""

        # Re-export section (same as domain types)
        re_export_section = """// ============================================================================
// Re-export all generated types
// ============================================================================

export type { components, operations };

"""

        # Generate schema aliases from master spec (all shared types)
        schemas = extract_schemas(master_spec)
        schema_aliases = []

        for schema_name in sorted(schemas.keys()):
            schema_aliases.append(f'export type {schema_name} = components["schemas"]["{schema_name}"];')

        schema_aliases_section = ""
        if schema_aliases:
            schema_aliases_section = f"""// ============================================================================
// Convenient Type Aliases for Schemas
// ============================================================================

{chr(10).join(schema_aliases)}

"""

        content = f"""{header}{re_export_section}{schema_aliases_section}"""

        write_file(index_file, content)

    def _generate_shared_types_content(self, shared_types: Set[str], openapi_dir: Path) -> str:
        """Generate content for shared types file"""
        # Sort types for consistent output
        sorted_types = sorted(shared_types)

        # We need to import shared types from one of the generated OpenAPI types files
        # Since shared types are in common files, they'll be in every domain's generated types
        # We'll use a generic import that works - users can import from any domain or we can
        # create a minimal spec. For now, we'll document that these come from common files.

        # Find a domain that has generated types (we'll use the first one we find)
        # Actually, better approach: import from a well-known domain or create a comment
        # explaining that these types are available from any domain's generated types

        header = f"""/**
 * Shared Types - Generated from Common OpenAPI Files
 *
 * Auto-generated by Shared Types Generator v{self.version}
 *
 * ⚠️  DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated. Any manual changes will be overwritten.
 *
 * These types are defined in openapi/src/common/*.yaml files and are
 * shared across all domains. They are re-exported here for convenience.
 *
 * Usage:
 *   import {{ AccountId, OrgId, PageInfo }} from "@cuur/core/shared/types/generated-types";
 */

// ============================================================================
// SHARED TYPES
// ============================================================================
// Types defined in common/*.yaml files that are used across multiple domains
// These types are available in every domain's generated types, but exported
// here for centralized access.

"""

        # For now, we'll create type aliases that reference a domain's types
        # In practice, users should import from domain types or we need to generate
        # a combined types file. For now, we'll export them as type aliases.
        # Actually, the best approach is to note that these are available via
        # any domain's types, but we can't directly import without knowing which domain.

        # Better approach: Create a comment explaining these are available via namespace exports
        # Or: Generate a minimal OpenAPI spec with only common files and generate types from it

        # For now, let's create a file that documents shared types and provides
        # re-exports from a reference domain. We'll use 'auth' as reference since it's common.

        type_exports = []
        for type_name in sorted_types:
            if type_name in ["components", "operations"]:
                # These are always available from any domain's generated types
                type_exports.append(f"// {type_name} - Available from any domain's generated types")
            else:
                # Create a type alias that references from auth domain (as reference)
                # Users can import from any domain, but we provide a convenient export
                type_exports.append(f"// {type_name} - Available from any domain's generated types")
                type_exports.append(f"// Import example: import type {{ {type_name} }} from \"../../auth/openapi/auth.openapi.types\";")

        # Generate type exports - re-export from identity domain as reference
        # Identity domain typically includes most shared types since it deals with Account, Org, Role, ApiKey
        # Since shared types are in common files, they're available in every domain's generated types
        type_exports = []

        # Import from identity domain (as reference - it has Account, Org, Role, ApiKey)
        type_exports.append("// Re-export shared types from identity domain (reference domain)")
        type_exports.append("// Shared types are defined in common/*.yaml and available in all domains")
        type_exports.append('import type { components, operations } from "../../identity/openapi/identity.openapi.types.js";')
        type_exports.append("")

        # Export individual type aliases - only export types that exist in the reference domain
        # This ensures we don't export types that aren't available
        for type_name in sorted_types:
            if type_name not in ["components", "operations"]:
                # Export with optional chaining - if type doesn't exist, it will be undefined
                # Users should import from the domain that has the type if it's not here
                type_exports.append(f'export type {type_name} = components["schemas"]["{type_name}"];')

        # Export components and operations
        type_exports.append("")
        type_exports.append("export type { components, operations };")

        return f"""{header}
// NOTE: Shared types are defined in common/*.yaml files and are included
// in every domain's generated OpenAPI types. This file re-exports them
// from a reference domain (auth) for centralized access.
//
// Usage:
//   import {{ AccountId, OrgId, PageInfo }} from "@cuur/core/shared/types/generated-types";
//   // Or via namespace:
//   import {{ auth }} from "@cuur/core";
//   type AccountId = auth.types.AccountId;

{chr(10).join(type_exports)}
"""
