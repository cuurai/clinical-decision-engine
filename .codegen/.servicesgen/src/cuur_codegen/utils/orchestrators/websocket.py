"""
WebSocket Builder - Utility for building WebSocket handlers

This is a utility function, not a generator. It can be called by generators
to build WebSocket handler files.
"""

from pathlib import Path
from typing import List

from cuur_codegen.core.context import GenerationContext
from cuur_codegen.core.logger import Logger
from cuur_codegen.utils.file import ensure_directory, write_file
from cuur_codegen.generators.orchestrators.builders import WebSocketBuilder


def build_websocket_handlers(
    context: GenerationContext,
    output_dir: Path,
    logger: Logger,
) -> List[Path]:
    """
    Build WebSocket handler files.

    Args:
        context: Generation context
        output_dir: Output directory (orchestrators/src/api/websocket/handlers)
        logger: Logger instance

    Returns:
        List of generated file paths
    """
    files: List[Path] = []

    # WebSocket handlers are cross-domain, so we generate them once
    project_root = context.config.paths.project_root
    handlers_dir = project_root / "orchestrators" / "src" / "api" / "websocket" / "handlers"
    ensure_directory(handlers_dir)

    # Generate handlers for each pattern
    from cuur_codegen.base.builder import BaseBuilder
    for pattern_name, pattern in WebSocketBuilder.WEBSOCKET_PATTERNS.items():
        handler_file = handlers_dir / f"{pattern_name}.handler.ts"

        header = BaseBuilder.generate_header(
            context,
            f"{pattern['name']} - {pattern['description']}",
        )

        content = WebSocketBuilder.build_handler(
            context,
            pattern["name"],
            pattern,
            header,
        )

        write_file(handler_file, content)
        files.append(handler_file)

        logger.info(f"Generated WebSocket handler: {handler_file.name}")

    return files
