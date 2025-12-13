"""
GraphQL Builder - Utility for building GraphQL schema and resolvers

This is a utility function, not a generator. It can be called by generators
to build GraphQL files.
"""

from pathlib import Path
from typing import List

from cuur_codegen.core.context import GenerationContext
from cuur_codegen.core.logger import Logger
from cuur_codegen.utils.file import ensure_directory, write_file
from cuur_codegen.generators.orchestrators.builders import GraphQLBuilder


def build_graphql_schema(
    context: GenerationContext,
    output_dir: Path,
    logger: Logger,
) -> Path:
    """
    Build GraphQL schema file.

    Args:
        context: Generation context
        output_dir: Output directory (orchestrators/src/api/graphql)
        logger: Logger instance

    Returns:
        Path to generated schema file
    """
    # GraphQL is cross-domain, so we generate it once
    project_root = context.config.paths.project_root
    graphql_dir = project_root / "orchestrators" / "src" / "api" / "graphql"
    ensure_directory(graphql_dir)

    # Generate schema file
    schema_file = graphql_dir / "schema.ts"
    from cuur_codegen.base.builder import BaseBuilder
    schema_header = BaseBuilder.generate_header(
        context,
        "GraphQL Schema",
    )
    schema_content = GraphQLBuilder.build_schema(
        context,
        {},
        schema_header,
    )
    write_file(schema_file, schema_content)

    logger.info(f"Generated GraphQL schema: {schema_file.name}")

    return schema_file


def build_graphql_resolvers(
    context: GenerationContext,
    output_dir: Path,
    logger: Logger,
) -> Path:
    """
    Build GraphQL resolvers file.

    Args:
        context: Generation context
        output_dir: Output directory (orchestrators/src/api/graphql)
        logger: Logger instance

    Returns:
        Path to generated resolvers file
    """
    # GraphQL is cross-domain, so we generate it once
    project_root = context.config.paths.project_root
    graphql_dir = project_root / "orchestrators" / "src" / "api" / "graphql"
    ensure_directory(graphql_dir)

    # Generate resolvers file
    resolvers_file = graphql_dir / "resolvers.ts"
    from cuur_codegen.base.builder import BaseBuilder
    resolvers_header = BaseBuilder.generate_header(
        context,
        "GraphQL Resolvers",
    )
    resolvers_content = GraphQLBuilder.build_resolvers(
        context,
        {},
        resolvers_header,
    )
    write_file(resolvers_file, resolvers_content)

    logger.info(f"Generated GraphQL resolvers: {resolvers_file.name}")

    return resolvers_file
