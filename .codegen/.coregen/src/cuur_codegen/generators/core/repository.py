"""
Repository Generator - Generates TypeScript repository interfaces

See docs/AI_OPERATION_GUIDE.md for operation guidelines.
"""

from pathlib import Path
from typing import List

from cuur_codegen.base.generator_bases import FileGenerator
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.utils.openapi import extract_operations
from cuur_codegen.utils.naming import NamingConvention
from cuur_codegen.utils.file import write_file
from cuur_codegen.generators.core.repositories.entity_extractor import EntityExtractor
from cuur_codegen.generators.core.repositories.repository_builder import RepositoryBuilder


class RepositoryGenerator(FileGenerator):
    """Generates repository interfaces from OpenAPI schemas"""

    @property
    def name(self) -> str:
        return "Repository Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "repository"

    def generate_files(self, context: GenerationContext, output_dir: Path) -> List[Path]:
        """Generate repository files for each resource"""
        files: List[Path] = []

        # Extract resources from operations and normalize using resource_for_grouping
        # This ensures all operations for the same resource (e.g., createMilestone, listMilestones)
        # group together and use consistent repository names
        operations = extract_operations(context.spec)
        resources = set()
        for op_data in operations:
            operation_id = op_data["operation_id"]
            operation = op_data["operation"]

            # Skip OAuth operations - they don't return entities, they return OAuth responses
            # Check operation ID patterns
            if any(pattern in operation_id.lower() for pattern in ["oauth", "connect", "callback", "start"]):
                # Also check if response is an OAuth response type
                from cuur_codegen.utils.openapi import get_response_schema_name
                response_schema_name = get_response_schema_name(operation, context.spec, "200")
                if not response_schema_name:
                    response_schema_name = get_response_schema_name(operation, context.spec, "201")
                if response_schema_name and "oauth" in response_schema_name.lower():
                    continue

            # Skip operations that return Response DTOs instead of entities
            # Check if response schema name ends with "Response" (e.g., LoginResponse, RefreshResponse)
            from cuur_codegen.utils.openapi import get_response_schema_name, get_response_schema
            from cuur_codegen.utils.openapi import extract_schemas
            response_schema_name = get_response_schema_name(operation, context.spec, "200")
            if not response_schema_name:
                response_schema_name = get_response_schema_name(operation, context.spec, "201")

            # Skip operations with no response schema (empty responses like handleProviderWebhook)
            if not response_schema_name:
                # Check if there's any response content with application/json
                responses = operation.get("responses", {})
                has_json_content = False
                for status_code in ["200", "201", "202"]:
                    if status_code in responses:
                        response = responses[status_code]
                        if isinstance(response, dict):
                            content = response.get("content", {})
                            if "application/json" in content:
                                has_json_content = True
                                break
                if not has_json_content:
                    # No JSON content means no entity to return - skip repository generation
                    continue

            if response_schema_name:
                # Get the actual response schema to check inner data schema
                response_schema = get_response_schema(operation, context.spec, "200")
                if not response_schema:
                    response_schema = get_response_schema(operation, context.spec, "201")

                schemas_dict = extract_schemas(context.spec)
                if not response_schema:
                    response_schema = schemas_dict.get(response_schema_name)

                # Check inner schema if wrapped in data
                inner_schema_name = None
                if response_schema and isinstance(response_schema, dict):
                    if "properties" in response_schema:
                        data_prop = response_schema["properties"].get("data")
                        if data_prop and "$ref" in data_prop:
                            from cuur_codegen.utils.openapi import extract_schema_name_from_ref
                            inner_schema_name = extract_schema_name_from_ref(data_prop["$ref"])
                        elif data_prop and isinstance(data_prop, dict) and "properties" in data_prop:
                            # Check if data has properties that indicate a Response DTO
                            data_props = data_prop["properties"]
                            if "isValid" in data_props or ("status" in data_props and "canRefresh" in data_props):
                                continue  # Skip Response DTO

                # Use semantic analysis to determine if we should skip repository generation
                # BUT: List operations always need repositories (they read entities)
                # Skip repository check for list operations
                from cuur_codegen.utils.string import extract_verb_from_operation_id
                verb = extract_verb_from_operation_id(operation_id)
                if verb != "list":
                    from cuur_codegen.utils.schema_analyzer import SchemaAnalyzer
                    if SchemaAnalyzer.should_skip_repository_generation(operation, context.spec, operation_id):
                        continue

            # Use resource_for_grouping to normalize (singularizes plural resources)
            # e.g., listMilestones -> Milestone, createMilestone -> Milestone
            resource = NamingConvention.resource_for_grouping(operation_id)
            resources.add(resource)

        if not resources:
            return files

        # Generate repository interface for each resource
        for resource in resources:
            repo_filename = NamingConvention.repository_filename(resource)
            repo_file = output_dir / repo_filename
            header = self.generate_header(context, f"Repository interface for {resource}")
            entity_name = EntityExtractor.extract_entity_name_from_operations(context, resource)
            if not entity_name:
                from cuur_codegen.utils.string import pascal_case
                entity_name = pascal_case(resource)
            content = RepositoryBuilder.build_repository_content(context, resource, entity_name, header)
            write_file(repo_file, content)
            files.append(repo_file)

        return files

    # Old monolithic methods removed - now using modular components:
    # - EntityExtractor.extract_entity_name_from_operations() replaces _extract_entity_name_from_operations()
    # - EntityExtractor handles all entity extraction logic including _resolve_allof_alias() and _extract_entity_from_response_schema()
    # - RepositoryBuilder.build_repository_content() handles all repository interface building logic
