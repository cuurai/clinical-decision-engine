"""
Quub CodeGen - Enterprise-grade OpenAPI code generator for TypeScript

A Python-based code generation framework for generating core SDK code:
- Handlers - Business logic handler functions
- Repositories - Repository interface definitions
- Schemas - DTO and Entity schema files
- Types - TypeScript type exports
- Validators - Zod validation schemas
- Converters - Entity converter utilities
"""

__version__ = "1.0.0"
__author__ = "Quub"

from cuur_codegen.base.config import Config, DomainConfig, GeneratorConfig
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.logger import Logger, create_logger
from cuur_codegen.base.errors import CodeGenError, ValidationError, GenerationError
from cuur_codegen.pipeline.pipeline import Pipeline, PipelineResult

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
    "Pipeline",
    "PipelineResult",
]
