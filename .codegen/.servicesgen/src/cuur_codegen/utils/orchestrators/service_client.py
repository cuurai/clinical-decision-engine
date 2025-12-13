"""
Service Client Builder - Utility for building typed service client wrappers

This is a utility function, not a generator. It can be called by generators
to build service client files.
"""

from pathlib import Path
from typing import List, Any, Optional

from cuur_codegen.core.context import GenerationContext
from cuur_codegen.core.logger import Logger
from cuur_codegen.core.config import DomainConfig
from cuur_codegen.utils.openapi import extract_operations, load_openapi_spec
from cuur_codegen.utils.string import generate_file_name
from cuur_codegen.utils.file import ensure_directory, write_file
from cuur_codegen.generators.orchestrators.builders import ServiceClientBuilder
from cuur_codegen.generators.orchestrators.config_reader import load_orchestrator_domains_config


def build_service_clients(
    context: GenerationContext,
    output_dir: Path,
    logger: Logger,
) -> List[Path]:
    """
    Build service client files for orchestrator domains.

    For orchestrator layer, we generate clients based on orchestrator domain configuration,
    not core domain configuration. Each orchestrator domain gets service clients
    for the core domains it uses.

    Args:
        context: Generation context (domain_name is orchestrator domain name)
        output_dir: Output directory (orchestrators/src/domains/{orchestrator_domain}/services/clients)
        logger: Logger instance

    Returns:
        List of generated file paths
    """
    files: List[Path] = []

    # Load orchestrator domain configuration
    try:
        orchestrator_config = load_orchestrator_domains_config(context.config.paths.project_root)
    except FileNotFoundError:
        logger.warn(
            f"Orchestrator domains config not found, skipping service client generation"
        )
        return files

    # Get orchestrator domain configuration
    orchestrator_domain_config = None
    for domain in orchestrator_config.orchestrator_domains:
        if domain.name == context.domain_name:
            orchestrator_domain_config = domain
            break

    if not orchestrator_domain_config:
        logger.warn(
            f"Orchestrator domain '{context.domain_name}' not found in config, "
            f"skipping service client generation"
        )
        return files

    # Ensure output directory exists
    ensure_directory(output_dir)

    # Generate service clients for each core domain used by this orchestrator domain
    from cuur_codegen.base.builder import BaseBuilder
    for core_domain_config in orchestrator_domain_config.core_domains:
        core_domain_name = core_domain_config.name

        # Load core domain spec
        core_domain_spec_path = (
            context.config.paths.bundled_dir /
            f"{core_domain_name}.json"
        )

        if not core_domain_spec_path.exists():
            logger.warn(
                f"Bundled spec not found for core domain '{core_domain_name}': "
                f"{core_domain_spec_path}"
            )
            continue

        # Load spec
        core_domain_spec = load_openapi_spec(core_domain_spec_path)

        # Extract operations (filter by configured operations if specified)
        all_operations = extract_operations(core_domain_spec)
        if core_domain_config.operations:
            # Filter to only configured operations
            # Match by operationId (from OpenAPI spec)
            operations = []
            configured_ops_lower = [op.lower() for op in core_domain_config.operations]
            for op in all_operations:
                op_id = op.get("operation_id", "").lower()
                # Check if operationId matches any configured operation (case-insensitive)
                if op_id in configured_ops_lower:
                    operations.append(op)
        else:
            # If no operations specified, use all operations
            operations = all_operations

        if not operations:
            logger.warn(
                f"No operations found for core domain '{core_domain_name}' "
                f"in orchestrator domain '{context.domain_name}'"
            )
            continue

        # Generate service client file for this core domain (use kebab-case for file name)
        core_domain_client_name = generate_file_name(core_domain_name, "client")
        client_file = output_dir / core_domain_client_name

        # Create a temporary context for the core domain
        core_domain_config_obj = DomainConfig(
            name=core_domain_name,
            enabled=True
        )
        core_context = GenerationContext(
            config=context.config,
            domain=core_domain_config_obj,
            logger=logger,
            spec=core_domain_spec
        )

        # Build service client content
        header = BaseBuilder.generate_header(
            core_context,
            f"Service client for {core_domain_name} domain "
            f"(used by {context.domain_name} orchestrator domain)",
        )
        content = ServiceClientBuilder.build_service_client(
            core_context, operations, header
        )

        write_file(client_file, content)
        files.append(client_file)

        logger.info(
            f"Generated service client: {client_file.name} "
            f"({len(operations)} operations) for orchestrator domain '{context.domain_name}'"
        )

    return files
