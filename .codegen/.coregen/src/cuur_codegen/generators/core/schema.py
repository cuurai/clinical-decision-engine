"""
Schema Generator - Generates DTO and Entity schema files
"""

from pathlib import Path
from typing import Dict, Any, List, Set, Optional
import re
from cuur_codegen.utils.openapi import resolve_ref
from cuur_codegen.utils.string import (
    pascal_case,
    kebab_case,
    camel_case,
    extract_resource_from_operation_id,
    extract_verb_from_operation_id,
    pluralize_resource_name,
    singularize,
)
from cuur_codegen.utils.naming import NamingConvention

from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.folder_structure import FolderStructureConfig
from cuur_codegen.utils.openapi import (
    extract_schemas,
    extract_operations,
    get_response_schema,
    get_request_body_schema_name,
    get_response_schema_name,
    extract_schema_name_from_ref,
)
from cuur_codegen.utils.file import ensure_directory, write_file, clean_directory
from cuur_codegen.generators.core.schemas.entity_builder import EntityBuilder
from cuur_codegen.generators.core.schemas.dto_builder import DtoBuilder


class SchemaGenerator(BaseGenerator):
    """Generates DTO and Entity schema files"""

    @property
    def name(self) -> str:
        return "Schema Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "schema"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Generate schema files"""
        self.validate_context(context)

        files: List[Path] = []
        warnings: List[str] = []

        # Get output directory using FolderStructureConfig
        from cuur_codegen.base.folder_structure import FolderStructureConfig
        folder_config = FolderStructureConfig()
        output_dir = folder_config.get_layer_output_path(
            project_root=context.config.paths.project_root,
            layer="core",
            domain_name=context.domain_name,
            generator_type="schema",
        )
        ensure_directory(output_dir)

        # Clean directory before generation to remove old files
        clean_directory(output_dir)

        # Extract operations and group by resource
        operations = extract_operations(context.spec)
        if not operations:
            warnings.append("No operations found in OpenAPI spec")
            return GenerateResult(files=files, warnings=warnings)

        # Group operations by resource (singular for grouping)
        resource_operations: Dict[str, List[Dict[str, Any]]] = {}
        for op_data in operations:
            operation_id = op_data["operation_id"]
            resource = NamingConvention.resource_for_grouping(operation_id)

            if resource not in resource_operations:
                resource_operations[resource] = []
            resource_operations[resource].append(op_data)

        # Generate schemas for each resource
        for resource, ops in resource_operations.items():
            resource_files = self._generate_resource_schemas(context, resource, ops, output_dir)
            files.extend(resource_files)

        # Generate domain index
        domain_index_file = output_dir / "index.ts"
        domain_index_content = self._generate_domain_index(context, list(resource_operations.keys()))
        write_file(domain_index_file, domain_index_content)
        files.append(domain_index_file)

        return GenerateResult(files=files, warnings=warnings)

    def _generate_resource_schemas(
        self, context: GenerationContext, resource: str, operations: List[Dict[str, Any]], output_dir: Path
    ) -> List[Path]:
        """Generate schemas for a single resource"""
        files: List[Path] = []

        # Create resource directory (kebab-case, singular)
        resource_kebab = kebab_case(resource)
        resource_dir = output_dir / resource_kebab
        dto_dir = resource_dir / "dto"
        entity_dir = resource_dir / "entity"

        ensure_directory(dto_dir)
        ensure_directory(entity_dir)

        # Generate DTOs for each operation
        for op_data in operations:
            op = op_data["operation"]
            operation_id = op_data["operation_id"]
            verb = extract_verb_from_operation_id(operation_id)

            # Skip DTO generation for operations without requestBody (create/update/patch)
            if verb in ["create", "update", "patch"]:
                from cuur_codegen.utils.openapi import get_request_body_schema_name
                if not get_request_body_schema_name(op, context.spec):
                    # Operation has no requestBody - skip DTO generation
                    continue

            # Generate DTO filename
            dto_filename = DtoBuilder.generate_dto_filename(verb, resource, operation_id)
            dto_file = dto_dir / dto_filename
            header = self.generate_header(context, f"{verb.capitalize()} {resource} DTO")
            dto_content = DtoBuilder.build_dto_content(context, op, verb, resource, operation_id, header)
            write_file(dto_file, dto_content)
            files.append(dto_file)

        # Generate entity file (single entity schema, not list response)
        # Skip if operations only return 204 (No Content)
        entity_header = self.generate_header(context, f"{resource} Entity")
        entity_content = EntityBuilder.build_entity_content(context, resource, operations, entity_header)
        has_entity = False
        if entity_content is not None:
            entity_filename = f"{resource_kebab}.entity.ts"
            entity_file = entity_dir / entity_filename
            write_file(entity_file, entity_content)
            files.append(entity_file)
            has_entity = True

        # Generate resource index
        resource_index_file = resource_dir / "index.ts"
        resource_index_content = self._generate_resource_index(context, resource, operations, has_entity)
        write_file(resource_index_file, resource_index_content)
        files.append(resource_index_file)

        return files


    def _generate_resource_index(
        self, context: GenerationContext, resource: str, operations: List[Dict[str, Any]], has_entity: bool = True
    ) -> str:
        """Generate resource index file"""
        header = self.generate_header(context, f"{resource} schemas")

        exports = []

        # Export entity only if it was generated (skip for 204-only operations)
        if has_entity:
            resource_kebab = kebab_case(resource)
            exports.append(f'export * from "./entity/{resource_kebab}.entity";')

        # Export DTOs (skip operations without requestBody)
        for op_data in operations:
            op = op_data["operation"]
            operation_id = op_data["operation_id"]
            verb = extract_verb_from_operation_id(operation_id)

            # Skip DTO export for operations without requestBody
            if verb in ["create", "update", "patch"]:
                from cuur_codegen.utils.openapi import get_request_body_schema_name
                if not get_request_body_schema_name(op, context.spec):
                    continue

            dto_filename = DtoBuilder.generate_dto_filename(verb, resource, operation_id)
            dto_base = dto_filename.replace(".ts", "")
            exports.append(f'export * from "./dto/{dto_base}";')

        return f"""{header}// Auto-generated barrel export
{chr(10).join(exports)}
"""

    def _generate_domain_index(self, context: GenerationContext, resources: List[str]) -> str:
        """Generate domain index file"""
        header = self.generate_header(context, "Domain schema exports")

        exports = []
        for resource in resources:
            resource_kebab = kebab_case(resource)
            exports.append(f'export * from "./{resource_kebab}/index.js";')

        return f"""{header}// Auto-generated domain barrel export
{chr(10).join(exports)}
"""

    # Old monolithic methods removed - now using modular components:
    # - DtoBuilder.build_dto_content() replaces _generate_dto_content()
    # - DtoBuilder.generate_dto_filename() replaces _generate_dto_filename()
    # - EntityBuilder.build_entity_content() replaces _generate_entity_content()
    # - ParameterExtractor, ZodConverter, SchemaResolver handle parameter/schema logic
