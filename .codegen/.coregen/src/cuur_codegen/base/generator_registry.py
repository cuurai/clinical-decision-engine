"""
Generator Registry - Plugin architecture for generators
"""

from typing import Dict, Type, Optional, List
from cuur_codegen.base.generator import BaseGenerator
from cuur_codegen.base.logger import Logger


class GeneratorRegistry:
    """Registry for generators - enables plugin architecture"""

    def __init__(self, logger: Optional[Logger] = None):
        """
        Initialize the generator registry.

        Args:
            logger: Optional logger instance
        """
        self.logger = logger
        self._generators: Dict[str, BaseGenerator] = {}
        self._generator_classes: Dict[str, Type[BaseGenerator]] = {}

    def register(
        self,
        generator_type: str,
        generator_class: Type[BaseGenerator],
        instantiate: bool = True,
    ) -> None:
        """
        Register a generator class.

        Args:
            generator_type: Unique identifier for the generator (e.g., "handler", "repository")
            generator_class: Generator class (must inherit from BaseGenerator)
            instantiate: Whether to instantiate immediately (default: True)
        """
        self._generator_classes[generator_type] = generator_class
        if instantiate:
            self._generators[generator_type] = generator_class(self.logger)

    def get(self, generator_type: str) -> Optional[BaseGenerator]:
        """
        Get a generator instance.

        Args:
            generator_type: Generator type identifier

        Returns:
            Generator instance or None if not found
        """
        # Lazy instantiation if not already instantiated
        if generator_type not in self._generators:
            generator_class = self._generator_classes.get(generator_type)
            if generator_class:
                self._generators[generator_type] = generator_class(self.logger)

        return self._generators.get(generator_type)

    def get_all(self) -> Dict[str, BaseGenerator]:
        """
        Get all registered generator instances.

        Returns:
            Dictionary of generator_type -> generator_instance
        """
        # Ensure all registered classes are instantiated
        for generator_type, generator_class in self._generator_classes.items():
            if generator_type not in self._generators:
                self._generators[generator_type] = generator_class(self.logger)

        return self._generators.copy()

    def get_types(self) -> List[str]:
        """
        Get list of all registered generator types.

        Returns:
            List of generator type identifiers
        """
        return list(self._generator_classes.keys())

    def is_registered(self, generator_type: str) -> bool:
        """
        Check if a generator type is registered.

        Args:
            generator_type: Generator type identifier

        Returns:
            True if registered, False otherwise
        """
        return generator_type in self._generator_classes

