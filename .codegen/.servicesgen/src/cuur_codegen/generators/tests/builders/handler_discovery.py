"""
Handler Discovery Utility

Discovers handlers from core package
"""

from pathlib import Path
from typing import List, Optional
from dataclasses import dataclass
import re
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, kebab_case


@dataclass
class HandlerInfo:
    """Handler information"""
    operation_id: str
    verb: str  # create, list, get, update, delete
    resource: str
    handler_name: str
    handler_file: str
    has_input: bool
    has_id: bool
    has_repository: bool


class HandlerDiscovery:
    """Discovers handlers from core package"""

    @staticmethod
    def discover_handlers(
        domain_name: str,
        context: GenerationContext
    ) -> List[HandlerInfo]:
        """
        Discover handlers for a domain by scanning the handlers directory

        Returns list of HandlerInfo objects
        """
        handlers: List[HandlerInfo] = []
        # Core package is typically at packages/core/src relative to project root
        # But project_root might be platform/, so we need to go up to find core
        core_base = context.config.paths.project_root / "packages" / "core" / "src"
        if not core_base.exists():
            # If not found, try going up one level (project_root might be platform/)
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "src"
        if not core_base.exists():
            # If still not found, try submodule structure (packages/core/packages/core/src)
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "packages" / "core" / "src"
        handlers_path = core_base / domain_name / "handlers"

        try:
            if not handlers_path.exists():
                context.logger.debug(f"No handlers directory found for {domain_name}")
                return handlers

            HandlerDiscovery._discover_handlers_recursive(
                handlers_path,
                handlers,
                domain_name
            )
        except Exception as error:
            context.logger.debug(f"Error discovering handlers for {domain_name}: {error}")

        return handlers

    @staticmethod
    def _discover_handlers_recursive(
        dir_path: Path,
        handlers: List[HandlerInfo],
        domain_name: str
    ) -> None:
        """Recursively discover handlers"""
        try:
            for entry in dir_path.iterdir():
                if entry.is_dir() and entry.name != "__tests__":
                    # Recursively search subdirectories
                    HandlerDiscovery._discover_handlers_recursive(
                        entry,
                        handlers,
                        domain_name
                    )
                elif entry.is_file() and entry.name.endswith(".ts") and entry.name != "index.ts":
                    # Parse handler file
                    handler_info = HandlerDiscovery._parse_handler_file(entry, domain_name)
                    if handler_info:
                        handlers.append(handler_info)
        except Exception:
            pass

    @staticmethod
    def _parse_handler_file(
        file_path: Path,
        _domain_name: str
    ) -> Optional[HandlerInfo]:
        """Parse handler file to extract handler information"""
        try:
            content = file_path.read_text()
            file_name = file_path.stem

            # Extract verb and resource from filename (e.g., "create-notification.ts" -> verb: "create", resource: "notification")
            parts = file_name.split("-")
            if len(parts) < 2:
                return None

            verb = parts[0]  # create, list, get, update, delete
            resource = "-".join(parts[1:])  # notification, notification-history, etc.

            # Extract handler function name from content
            handler_match = re.search(r"export\s+async\s+function\s+(\w+)", content)
            if not handler_match:
                return None

            handler_name = handler_match.group(1)
            operation_id = camel_case(handler_name)

            # Extract full function signature for better parameter detection
            function_sig_match = re.search(
                r"export\s+async\s+function\s+\w+\s*\(([^)]+)\)",
                content
            )
            params = function_sig_match.group(1) if function_sig_match else ""

            # Check if handler has input parameter
            has_input = bool(re.search(r"(?:^|,)\s*(?:input|data|body)\s*[:?]", params))

            # Check if handler has id parameter (for get, update, delete)
            has_id = (
                bool(re.search(r"(?:^|,)\s*\bid\s*[:?]", params)) and
                verb not in ("create", "list")
            )

            # Check if handler uses a repository
            has_repository = bool(re.search(r"(?:^|,)\s*repo\s*:\s*\w+Repository", params))

            return HandlerInfo(
                operation_id=operation_id,
                verb=verb,
                resource=resource,
                handler_name=handler_name,
                handler_file=str(file_path),
                has_input=has_input,
                has_id=has_id,
                has_repository=has_repository,
            )
        except Exception:
            return None
