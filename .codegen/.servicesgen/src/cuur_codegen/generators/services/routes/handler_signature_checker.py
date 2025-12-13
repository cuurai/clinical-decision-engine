"""
Handler Signature Checker

Checks handler files to determine if they need repositories and orgId,
and maps operationId to actual handler function names
"""

from pathlib import Path
from typing import Dict, Optional, Tuple, List
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import (
    camel_case,
    kebab_case,
    pluralize_resource_name,
    singularize,
)
import re


class HandlerSignatureChecker:
    """Checks handler signatures to determine dependencies"""

    @staticmethod
    def _get_core_handlers_dir(context: GenerationContext) -> Path:
        """Get core handlers directory"""
        # Core package is typically at packages/core/src relative to project root
        # But project_root might be platform/, so we need to go up to find core
        core_base = context.config.paths.project_root / "packages" / "core" / "src"
        if not core_base.exists():
            # If not found, try going up one level (project_root might be platform/)
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "src"
        if not core_base.exists():
            # If still not found, try submodule structure (packages/core/packages/core/src)
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "packages" / "core" / "src"
        return core_base / context.domain_name / "handlers"

    @staticmethod
    def check_handler_signature(
        handler_name: str,
        operation_id: str,
        context: GenerationContext
    ) -> Tuple[bool, bool, Optional[str]]:
        """
        Check handler signature to determine if it needs repo and orgId,
        and get actual handler function name.

        Returns:
            (needs_repo, needs_org_id, actual_handler_name)
        """
        try:
            # Extract resource from handler name and operationId
            handler_match = re.match(r"^(list|get|create|update|delete|patch)([A-Z]\w+)", handler_name)
            operation_match = re.match(r"^(list|get|create|update|delete|patch)([A-Z]\w+)", operation_id)

            resource_from_op_id = None
            if operation_match:
                resource_from_op_id = camel_case(operation_match.group(2))

            # If no match, try to find handler file using operationId directly
            if not handler_match and not operation_match:
                # Use FolderStructureConfig to get core output path
                folder_config = context.config.folder_structure
                if not folder_config:
                    from cuur_codegen.core.layer_folder_structure import FolderStructureConfig
                    folder_config = FolderStructureConfig()
                core_base = context.config.paths.project_root / folder_config.get_layer_config("core").base_path
                possible_paths = [
                    core_base / context.domain_name / "handlers" / f"{kebab_case(operation_id)}.ts"
                ]

                content = HandlerSignatureChecker._try_read_handler_file(possible_paths)
                if content:
                    return HandlerSignatureChecker._extract_signature_from_content(content)

                # Default: assume handler needs both
                return (True, True, None)

            # Build possible handler file paths
            resource = handler_match.group(2) if handler_match else resource_from_op_id or ""
            resource_camel = camel_case(resource)
            resource_kebab = kebab_case(resource_camel)
            resource_singular = singularize(resource_camel)
            resource_singular_kebab = kebab_case(resource_singular)
            resource_plural_kebab = kebab_case(resource_camel)

            # Build possible paths
            possible_paths = []

            # Get handlers directory using FolderStructureConfig
            handlers_dir = HandlerSignatureChecker._get_core_handlers_dir(context)

            # Try with resource directory
            if resource_kebab:
                possible_paths.extend([
                    handlers_dir / resource_kebab / f"{kebab_case(handler_name)}.ts",
                    handlers_dir / resource_singular_kebab / f"{kebab_case(handler_name)}.ts",
                    handlers_dir / resource_plural_kebab / f"{kebab_case(handler_name)}.ts",
                ])

            # Try with operationId resource (if different)
            if resource_from_op_id and resource_from_op_id != resource_camel:
                op_id_kebab = kebab_case(resource_from_op_id)
                op_id_singular = singularize(resource_from_op_id)
                op_id_singular_kebab = kebab_case(op_id_singular)

                possible_paths.extend([
                    handlers_dir / op_id_kebab / f"{kebab_case(handler_name)}.ts",
                    handlers_dir / op_id_singular_kebab / f"{kebab_case(handler_name)}.ts",
                ])

            # Try with operationId as filename
            operation_id_kebab = kebab_case(operation_id)

            # Try pluralized directory names
            resource_pluralized = pluralize_resource_name(resource_singular)
            resource_pluralized_kebab = kebab_case(resource_pluralized)

            # Try compound word pluralization (e.g., "on-chain-tx" -> "on-chain-txes")
            if resource_singular_kebab and "-" in resource_singular_kebab:
                parts = resource_singular_kebab.split("-")
                last_part = parts[-1]
                pluralized_last = pluralize_resource_name(last_part)
                if pluralized_last != last_part:
                    compound_plural = "-".join(parts[:-1] + [pluralized_last])
                    possible_paths.insert(0, handlers_dir / compound_plural / f"{operation_id_kebab}.ts")

            if resource_pluralized_kebab and resource_pluralized_kebab != resource_singular_kebab:
                possible_paths.insert(0, handlers_dir / resource_pluralized_kebab / f"{operation_id_kebab}.ts")

            if resource_from_op_id:
                op_id_resource_kebab = kebab_case(resource_from_op_id)
                possible_paths.insert(0, handlers_dir / op_id_resource_kebab / f"{operation_id_kebab}.ts")

            possible_paths.extend([
                handlers_dir / resource_kebab / f"{operation_id_kebab}.ts",
                handlers_dir / resource_singular_kebab / f"{operation_id_kebab}.ts",
                handlers_dir / resource_plural_kebab / f"{operation_id_kebab}.ts",
                handlers_dir / f"{kebab_case(handler_name)}.ts",
                handlers_dir / f"{operation_id_kebab}.ts",
            ])

            # Try to read handler file
            content = HandlerSignatureChecker._try_read_handler_file(possible_paths)

            if not content:
                # Last resort: search directories
                handlers_dir = HandlerSignatureChecker._get_core_handlers_dir(context)
                if handlers_dir.exists():
                    for dir_entry in handlers_dir.iterdir():
                        if dir_entry.is_dir():
                            handler_file = dir_entry / f"{operation_id_kebab}.ts"
                            if handler_file.exists():
                                try:
                                    content = handler_file.read_text()
                                    break
                                except Exception:
                                    continue

            if not content:
                context.logger.debug(
                    f"Handler file not found for {handler_name} (operationId: {operation_id})"
                )
                return (True, True, None)  # Default: assume handler needs both

            return HandlerSignatureChecker._extract_signature_from_content(content)

        except Exception as error:
            context.logger.debug(f"Could not check handler {handler_name}: {error}")
            return (True, True, None)  # Default: assume handler needs both

    @staticmethod
    def _try_read_handler_file(possible_paths: List[Path]) -> Optional[str]:
        """Try to read handler file from list of possible paths"""
        for handler_path in possible_paths:
            try:
                if handler_path.exists() and handler_path.is_file():
                    return handler_path.read_text()
            except Exception:
                continue
        return None

    @staticmethod
    def _extract_signature_from_content(content: str) -> Tuple[bool, bool, Optional[str]]:
        """Extract signature information from handler file content"""
        # Match: export async function functionName(params)
        function_match = re.search(
            r"export\s+async\s+function\s+(\w+)\s*\(([^)]+)\)",
            content
        )

        if not function_match:
            return (True, True, None)  # Default

        actual_handler_name = function_match.group(1)
        params = function_match.group(2).strip()
        param_list = [p.strip() for p in params.split(",")]

        # Check if first parameter is a Repository type
        first_param = param_list[0] if param_list else ""
        needs_repo = "Repository" in first_param

        # Check if handler needs orgId - look for orgId parameter
        # If first param is repo, orgId is usually second; otherwise orgId is usually first
        org_id_param_index = 1 if needs_repo else 0
        org_id_param = param_list[org_id_param_index] if len(param_list) > org_id_param_index else ""
        needs_org_id = "orgId" in org_id_param

        return (needs_repo, needs_org_id, actual_handler_name)
