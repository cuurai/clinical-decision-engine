"""Core framework components"""

from cuur_codegen.core.config import Config, DomainConfig, GeneratorConfig
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.core.logger import Logger, create_logger
from cuur_codegen.core.errors import CodeGenError, ValidationError, GenerationError
from cuur_codegen.core.generator import BaseGenerator, GenerateResult

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
]
