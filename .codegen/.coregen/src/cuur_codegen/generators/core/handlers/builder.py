"""
Handler Builder - Builds complete handler file content
"""

from typing import Dict, Any, Optional
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.generators.core.handlers.imports import HandlerImportsBuilder
from cuur_codegen.generators.core.handlers.types import HandlerTypesBuilder
from cuur_codegen.generators.core.handlers.body.orchestrator import HandlerBodyBuilder
from cuur_codegen.utils.naming import NamingConvention
from cuur_codegen.utils.string import extract_verb_from_operation_id
from cuur_codegen.utils.openapi import get_request_body_schema_name


class HandlerBuilder:
    """Builds complete handler file content"""

    @staticmethod
    def build_handler_file_content(
        context: GenerationContext,
        op_data: Dict[str, Any],
        resource: str,
        header: str,
        verb: str = None
    ) -> str:
        """Build complete handler file content"""
        op = op_data["operation"]
        operation_id = op_data["operation_id"]
        if verb is None:
            verb = extract_verb_from_operation_id(operation_id)

        # Build function name
        func_name = NamingConvention.handler_function_name(operation_id)

        # Build parameters
        params = HandlerTypesBuilder.build_parameters(
            context, op, resource, verb, operation_id
        )

        # Build return type
        return_type = HandlerTypesBuilder.build_return_type(
            context, op, resource, verb, operation_id
        )

        # Build function body
        body = HandlerBodyBuilder.build_body(
            context, op, resource, verb, operation_id
        )

        # Build JSDoc
        summary = op.get("summary", f"{verb.capitalize()} {resource}")
        description = op.get("description", "")
        jsdoc = HandlerBuilder._build_jsdoc(summary, description, params)

        # Build imports
        imports = HandlerImportsBuilder.build_imports(
            context, op, resource, verb, operation_id
        )

        # Build mapInputToValidated function (only for operations with request bodies)
        # Check if validated will be used in the body
        map_input_func = ""
        if verb in ["create", "update", "patch"]:
            input_type = get_request_body_schema_name(op, context.spec)
            # Check if body uses validated (not commented out)
            body_uses_validated = "const validated" in body and "// const validated" not in body
            if body_uses_validated:
                map_input_func = HandlerBuilder._build_map_input_function(input_type)
            else:
                # Comment out mapInputToValidated function since validated is not used
                map_input_func = HandlerBuilder._build_map_input_function_commented(input_type)

        # Check which parameters are actually used in the body and prefix unused ones with _
        import re
        # Remove comments and check for actual parameter usage in code
        body_no_comments = re.sub(r'//.*', '', body)
        body_no_comments = re.sub(r'/\*.*?\*/', '', body_no_comments, flags=re.DOTALL)

        # Check for parameter usage in actual code (not in comments)
        used_params = set()
        if re.search(r'\brepo\.', body_no_comments) or re.search(r'\brepo\s*=', body_no_comments):
            used_params.add("repo")
        if re.search(r'\borgId\b', body_no_comments):
            used_params.add("orgId")
        if re.search(r'\binput\b', body_no_comments) and not re.search(r'\b_input\b', body_no_comments):
            used_params.add("input")
        if re.search(r'\bid\b', body_no_comments) and not re.search(r'\b_id\b', body_no_comments):
            used_params.add("id")

        # Parse params string - it's formatted as "param1,\n  param2,\n  param3" (from types.py line 131)
        # We need to preserve the format: first param has no leading spaces, subsequent have ",\n  "
        if params:
            # Split by the pattern used in types.py: ",\n  "
            params_parts = params.split(",\n  ")
            adjusted_params = []
            for i, param in enumerate(params_parts):
                param = param.strip()
                if not param:
                    continue
                param_name = param.split(":")[0].strip()

                if param_name not in used_params and param_name in ["repo", "orgId", "input", "id"]:
                    # Prefix with _ and add comment
                    adjusted_param = param.replace(param_name, f"_{param_name}")
                    if i == 0:
                        # First parameter - no leading comma
                        adjusted_params.append(f"  // TODO: Use {param_name} when implementing handler logic")
                        adjusted_params.append(f"  {adjusted_param}")
                    else:
                        # Subsequent parameters - will be joined with ",\n  "
                        adjusted_params.append(f"  // TODO: Use {param_name} when implementing handler logic")
                        adjusted_params.append(f"  {adjusted_param}")
                else:
                    # Keep original format
                    if i == 0:
                        adjusted_params.append(f"  {param}")
                    else:
                        adjusted_params.append(f"  {param}")

            # Join with the same pattern as types.py: ",\n  "
            adjusted_params_str = ",\n  ".join(adjusted_params)
        else:
            adjusted_params_str = ""

        # Comment out unused imports (ID generator and converters that throw errors before use)
        import re
        # Check if body throws error IMMEDIATELY (first statement) before using correlationId
        body_no_comments_for_throw = re.sub(r'//.*', '', body)
        body_no_comments_for_throw = re.sub(r'/\*.*?\*/', '', body_no_comments_for_throw, flags=re.DOTALL)
        body_no_comments_for_throw = body_no_comments_for_throw.strip()

        # Check if first non-comment line is a throw statement
        first_line = body_no_comments_for_throw.split('\n')[0].strip() if body_no_comments_for_throw else ""
        throws_immediately = first_line.startswith("throw new Error")

        # Also check if correlationId is never used
        correlation_used = "correlationId" in body_no_comments_for_throw

        if throws_immediately and not correlation_used:
            # ID generator is imported but not used (error thrown immediately)
            domain_name = context.domain_name
            domain_prefix_map = {
                "activity": "ac", "ai": "ai", "channel": "ch", "compliance": "co",
                "content": "cn", "conversation": "cv", "entitlement": "en", "identity": "id",
                "knowledge": "kn", "metrics": "mt", "notification": "ob", "observability": "ob",
                "operations": "op", "scheduling": "sc",
            }
            prefix = domain_prefix_map.get(domain_name)
            if not prefix:
                words = domain_name.split("-")
                prefix = "".join([word[0] for word in words if word])[:2].lower()
            id_gen_name = f"{prefix}TransactionId"
            # Comment out ID generator import
            imports = re.sub(
                rf'import {{ {id_gen_name} }} from "([^"]+)";',
                rf'// TODO: Uncomment when implementing handler logic\n// import {{ {id_gen_name} }} from "\1";',
                imports
            )
            # Also handle if it's part of a multi-import
            imports = re.sub(
                rf',\s*{id_gen_name}\s*}}',
                rf'// TODO: Uncomment when implementing handler logic\n  // {id_gen_name}\n}}',
                imports
            )

        # Check if converter is unused in body
        body_no_comments = re.sub(r'//.*', '', body)
        body_no_comments = re.sub(r'/\*.*?\*/', '', body_no_comments, flags=re.DOTALL)
        # Check for converter function calls
        converter_used_in_body = bool(re.search(r'\w+ToApi\s*\(', body_no_comments))

        # If converter is imported but not used, comment it out
        if not converter_used_in_body and imports:
            # Find converter imports and comment them out
            converter_import_pattern = r'import\s+\{\s*([^}]+)\s*\}\s+from\s+"[^"]*converters[^"]*";'
            converter_match = re.search(converter_import_pattern, imports)
            if converter_match:
                converter_names = [name.strip() for name in converter_match.group(1).split(",")]
                for converter_name in converter_names:
                    if converter_name and not re.search(rf'\b{converter_name}\s*\(', body_no_comments):
                        # Comment out this converter import
                        full_import_line = converter_match.group(0)
                        commented_import = f"// TODO: Uncomment when implementing handler logic\n// {full_import_line}"
                        imports = imports.replace(full_import_line, commented_import)
                        break  # Only comment out one import line at a time

        return f"""{header}{imports}{map_input_func}
{jsdoc}export async function {func_name}(
  {adjusted_params_str}
): Promise<{return_type}> {{
{body}
}}
"""

    @staticmethod
    def _build_jsdoc(summary: str, description: str, params: str) -> str:
        """Build JSDoc comment"""
        lines = [f"/**", f" * {summary}"]
        if description:
            lines.append(f" *")
            for line in description.split("\n"):
                lines.append(f" * {line}")
        lines.append(" */")
        return "\n".join(lines) + "\n"

    @staticmethod
    def _build_map_input_function(input_type: Optional[str] = None) -> str:
        """Build mapInputToValidated function"""
        if input_type:
            return f"""/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: {input_type}): {input_type} {{
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}}

"""
        else:
            return """/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}

"""

    @staticmethod
    def _build_map_input_function_commented(input_type: Optional[str] = None) -> str:
        """Build commented-out mapInputToValidated function"""
        if input_type:
            return f"""/**
 * Mapper: input → validated
 * TODO: Uncomment when implementing handler logic that uses validated input
 */
// function mapInputToValidated(input: {input_type}): {input_type} {{
//   // Note: Request body validation is handled by service layer schemas
//   // Handlers accept validated input and focus on business logic
//   return input;
// }}

"""
        else:
            return """/**
 * Mapper: input → validated
 * TODO: Uncomment when implementing handler logic that uses validated input
 */
// function mapInputToValidated(input: unknown): any {
//   // Note: Request body validation is handled by service layer schemas
//   // Handlers accept validated input and focus on business logic
//   return input;
// }

"""
