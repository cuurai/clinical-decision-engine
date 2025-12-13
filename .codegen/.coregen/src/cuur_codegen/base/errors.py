"""
Custom exception classes for code generation
"""


class CodeGenError(Exception):
    """Base exception for all code generation errors"""

    def __init__(self, message: str, domain: str | None = None, generator: str | None = None):
        super().__init__(message)
        self.message = message
        self.domain = domain
        self.generator = generator

    def __str__(self) -> str:
        parts = []
        if self.domain:
            parts.append(f"Domain: {self.domain}")
        if self.generator:
            parts.append(f"Generator: {self.generator}")
        parts.append(self.message)
        return " | ".join(parts)


class ValidationError(CodeGenError):
    """Raised when validation fails"""

    pass


class GenerationError(CodeGenError):
    """Raised when code generation fails"""

    pass


class ConfigurationError(CodeGenError):
    """Raised when configuration is invalid"""

    pass


class OpenAPIError(CodeGenError):
    """Raised when OpenAPI spec parsing fails"""

    pass


class FileSystemError(CodeGenError):
    """Raised when file system operations fail"""

    pass
