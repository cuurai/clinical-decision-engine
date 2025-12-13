"""
Context Factory - Centralized context creation
"""

from pathlib import Path
from typing import Optional, Dict, Any

from cuur_codegen.core.config import Config, DomainConfig
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.core.logger import Logger
from cuur_codegen.utils.openapi import load_openapi_spec


class ContextFactory:
    """Factory for creating generation contexts"""

    @staticmethod
    def create_domain_context(
        config: Config,
        domain: DomainConfig,
        logger: Logger,
        spec: Optional[Dict[str, Any]] = None,
    ) -> GenerationContext:
        """
        Create context for domain processing.

        Args:
            config: Configuration
            domain: Domain configuration
            logger: Logger instance
            spec: Optional OpenAPI spec (will be loaded from bundled_path if not provided)

        Returns:
            Generation context
        """
        return GenerationContext(
            config=config,
            domain=domain,
            logger=logger,
            spec=spec,
        )

    @staticmethod
    def create_with_spec(
        config: Config,
        domain: DomainConfig,
        logger: Logger,
        spec_path: Path,
    ) -> GenerationContext:
        """
        Create context and load spec from file.

        Args:
            config: Configuration
            domain: Domain configuration
            logger: Logger instance
            spec_path: Path to bundled OpenAPI spec JSON file

        Returns:
            Generation context with loaded spec
        """
        spec = load_openapi_spec(spec_path)
        return ContextFactory.create_domain_context(config, domain, logger, spec)

    @staticmethod
    def create_post_processing_context(
        config: Config,
        logger: Logger,
    ) -> GenerationContext:
        """
        Create context for post-processing generators (main index, shared types).

        Args:
            config: Configuration
            logger: Logger instance

        Returns:
            Generation context (without domain/spec)
        """
        # Create a dummy domain config for post-processing
        # Post-processing generators don't need a real domain
        from cuur_codegen.core.config import DomainConfig

        dummy_domain = DomainConfig(
            name="post-processing",
            enabled=True,
        )

        return GenerationContext(
            config=config,
            domain=dummy_domain,
            logger=logger,
            spec=None,
        )
