"""
Quub CodeGen - Enterprise-grade OpenAPI code generator for TypeScript

A unified code generation framework that combines:
- Core generators (handlers, repositories, types, validators, converters)
- Service generators (Fastify routes, dependencies, server setup)
- Test generators (mock repositories, test files, test infrastructure)

Enhanced with:
- Modular configuration system
- Plugin architecture
- Improved error handling
- Configuration validation
"""

__version__ = "1.0.0"
__author__ = "Quub"

from cuur_codegen.core.config import Config, DomainConfig, GeneratorConfig
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.core.logger import Logger, create_logger
from cuur_codegen.core.errors import (
    CodeGenError,
    ValidationError,
    GenerationError,
    ConfigurationError,
    OpenAPIError,
    FileSystemError,
)
from cuur_codegen.core.config_loader import ConfigLoader
from cuur_codegen.core.config_validator import ConfigValidator
from cuur_codegen.pipeline.pipeline import Pipeline, PipelineResult
from cuur_codegen.base.generator_registry import GeneratorRegistry
from cuur_codegen.base.plugin_system import PluginRegistry, PluginMetadata, PluginLoader
from cuur_codegen.base.builder import Builder, BaseBuilder

__all__ = [
    # Core
    "Config",
    "DomainConfig",
    "GeneratorConfig",
    "GenerationContext",
    "Logger",
    "create_logger",
    # Errors
    "CodeGenError",
    "ValidationError",
    "GenerationError",
    "ConfigurationError",
    "OpenAPIError",
    "FileSystemError",
    # Configuration
    "ConfigLoader",
    "ConfigValidator",
    # Pipeline
    "Pipeline",
    "PipelineResult",
    # Registry & Plugins
    "GeneratorRegistry",
    "PluginRegistry",
    "PluginMetadata",
    "PluginLoader",
    # Builders
    "Builder",
    "BaseBuilder",
]
