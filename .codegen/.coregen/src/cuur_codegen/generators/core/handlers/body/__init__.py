"""
Handler body builders for different HTTP verbs
"""

from cuur_codegen.generators.core.handlers.body.orchestrator import HandlerBodyBuilder
from cuur_codegen.generators.core.handlers.body.create import CreateBodyBuilder
from cuur_codegen.generators.core.handlers.body.get import GetBodyBuilder
from cuur_codegen.generators.core.handlers.body.update import UpdateBodyBuilder

__all__ = [
    "HandlerBodyBuilder",
    "CreateBodyBuilder",
    "GetBodyBuilder",
    "UpdateBodyBuilder",
]
