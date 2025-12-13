"""
DTO Builder - Builds DTO file content for different operation types
"""

from pathlib import Path
from typing import Dict, Any
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.folder_structure import FolderStructureConfig
from cuur_codegen.utils.string import kebab_case, camel_case, pascal_case
from cuur_codegen.utils.openapi import get_request_body_schema_name
from cuur_codegen.generators.core.schemas.parameter_extractor import ParameterExtractor
from cuur_codegen.generators.core.schemas.zod_converter import ZodConverter


class DtoBuilder:
    """Builds DTO file content"""

    @staticmethod
    def generate_dto_filename(verb: str, resource: str, operation_id: str) -> str:
        """Generate DTO filename"""
        resource_kebab = kebab_case(resource)
        return f"{kebab_case(verb)}-{resource_kebab}.dto.ts"

    @staticmethod
    def build_dto_content(
        context: GenerationContext,
        operation: Dict[str, Any],
        verb: str,
        resource: str,
        operation_id: str,
        header: str
    ) -> str:
        """Build DTO file content"""
        # Calculate relative import path
        resource_kebab = kebab_case(resource)
        domain_root = context.config.get_output_dir("core") / context.domain_name
        dto_dir = domain_root / "models" / resource_kebab / "dto"
        dto_file = dto_dir / DtoBuilder.generate_dto_filename(verb, resource, operation_id)

        folder_config = FolderStructureConfig()
        validators_path = folder_config.get_relative_import_path(
            from_file_path=dto_file,
            layer="core",
            to_generator="schemas_file",
            domain_name=context.domain_name,
            domain_root=domain_root
        )

        if verb in ["create", "update", "patch"]:
            return DtoBuilder._build_request_body_dto(
                context, operation, verb, resource, header, validators_path
            )
        elif verb == "get":
            return DtoBuilder._build_path_params_dto(
                context, operation, resource, header
            )
        elif verb == "list":
            return DtoBuilder._build_query_params_dto(
                context, operation, resource, header, validators_path
            )
        else:
            return DtoBuilder._build_default_dto(
                verb, resource, header, validators_path
            )

    @staticmethod
    def _build_request_body_dto(
        context: GenerationContext,
        operation: Dict[str, Any],
        verb: str,
        resource: str,
        header: str,
        validators_path: str
    ) -> str:
        """Build request body DTO"""
        schema_name = get_request_body_schema_name(operation, context.spec)

        # Fallback to naming convention if schema name not found
        if not schema_name:
            resource_pascal = pascal_case(resource)
            verb_pascal = pascal_case(verb)
            schema_name = f"{verb_pascal}{resource_pascal}Request"

        return f"""{header}import {{ z }} from "zod";
import {{ schemas }} from "{validators_path}";

/**
 * DTO: {schema_name}
 * Direction: Request Body → Handler → Domain
 * Route: {operation.get('summary', 'N/A')}
 * OpenAPI Source: schemas.{schema_name}
 */
export const Z{schema_name}Schema = schemas.{schema_name};
export type {schema_name} = z.infer<typeof Z{schema_name}Schema>;
"""

    @staticmethod
    def _build_path_params_dto(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        header: str
    ) -> str:
        """Build path parameters DTO"""
        path_params = ParameterExtractor.extract_path_parameters(operation, context.spec)

        if path_params:
            param_fields = []
            for param_name, param_info in path_params.items():
                param_key = camel_case(param_name)
                param_fields.append(f'  {param_key}: z.string(),')
            params_object = "\n".join(param_fields)
        else:
            resource_camel = camel_case(resource)
            params_object = f'  {resource_camel}Id: z.string(),'

        return f"""{header}import {{ z }} from "zod";

/**
 * DTO: Get{resource}Path
 * Direction: Path Parameters → Handler → Domain
 * Route: {operation.get('summary', 'N/A')}
 */
export const ZGet{resource}PathSchema = z.object({{
{params_object}
}});

export type Get{resource}Path = z.infer<typeof ZGet{resource}PathSchema>;
"""

    @staticmethod
    def _build_query_params_dto(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        header: str,
        validators_path: str
    ) -> str:
        """Build query parameters DTO"""
        query_params = ParameterExtractor.extract_query_parameters(operation, context.spec)

        if query_params:
            param_fields = []
            uses_schemas = False
            for param_name, param_info in query_params.items():
                param_key = camel_case(param_name)
                param_schema = param_info.get("schema", {})
                zod_type = ZodConverter.convert_openapi_schema_to_zod(param_schema, param_info, context)
                if zod_type.startswith("schemas."):
                    uses_schemas = True
                param_fields.append(f'  {param_key}: {zod_type},')
            params_object = "\n".join(param_fields)
        else:
            params_object = ""
            uses_schemas = False

        params_type = f"List{resource}Params"

        # Always import zod since we use z.object() even if params_object is empty
        zod_import = 'import { z } from "zod";\n'

        if uses_schemas:
            schemas_import = f'import {{ schemas }} from "{validators_path}";\n'
        else:
            schemas_import = ""

        return f"""{header}{zod_import}{schemas_import}/**
 * DTO: {params_type}
 * Direction: Query Parameters → Handler → Domain
 * Route: GET /{kebab_case(resource)}
 */
export const Z{params_type}Schema = z.object({{
{params_object}
}});

export type {params_type} = z.infer<typeof Z{params_type}Schema>;
"""

    @staticmethod
    def _build_default_dto(
        verb: str,
        resource: str,
        header: str,
        validators_path: str
    ) -> str:
        """Build default DTO (for operations with no request body or parameters)"""
        return f"""{header}import {{ z }} from "zod";

/**
 * DTO: {verb.capitalize()}{resource} DTO
 */
export const Z{verb.capitalize()}{resource}Schema = z.object({{}});
export type {verb.capitalize()}{resource} = z.infer<typeof Z{verb.capitalize()}{resource}Schema>;
"""
