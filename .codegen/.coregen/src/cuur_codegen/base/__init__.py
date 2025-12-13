"""Base framework components - foundational code generation infrastructure"""

from cuur_codegen.base.config import Config, DomainConfig, GeneratorConfig
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.logger import Logger, create_logger
from cuur_codegen.base.errors import CodeGenError, ValidationError, GenerationError
from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.builder import Builder, BaseBuilder
from cuur_codegen.base.generator_registry import GeneratorRegistry
from cuur_codegen.base.context_factory import ContextFactory
from cuur_codegen.base.generator_bases import FileGenerator, SingleFileGenerator, PostProcessingGenerator

__all__ = [
    "Config",
    "DomainConfig",
    "GeneratorConfig",
    "GenerationContext",
    "Logger",
    "create_logger",
    "CodeGenError",
    "ValidationError",
    "GenerationError",
    "BaseGenerator",
    "GenerateResult",
    "Builder",
    "BaseBuilder",
    "GeneratorRegistry",
    "ContextFactory",
    "FileGenerator",
    "SingleFileGenerator",
    "PostProcessingGenerator",
]
