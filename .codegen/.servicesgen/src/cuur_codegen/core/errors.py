"""
Custom exception classes for code generation

Enhanced with:
- Better error context
- Error codes
- Helpful error messages
- Chainable error handling
"""

from typing import Optional, Dict, Any, List
from pathlib import Path


class CodeGenError(Exception):
    """Base exception for all code generation errors"""

    def __init__(
        self,
        message: str,
        domain: Optional[str] = None,
        generator: Optional[str] = None,
        error_code: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        cause: Optional[Exception] = None,
    ):
        """
        Initialize code generation error.

        Args:
            message: Error message
            domain: Optional domain name
            generator: Optional generator name
            error_code: Optional error code for programmatic handling
            context: Optional context dictionary with additional information
            cause: Optional underlying exception that caused this error
        """
        super().__init__(message)
        self.message = message
        self.domain = domain
        self.generator = generator
        self.error_code = error_code
        self.context = context or {}
        self.cause = cause

    def __str__(self) -> str:
        """Format error message with context"""
        parts = []
        if self.error_code:
            parts.append(f"[{self.error_code}]")
        if self.domain:
            parts.append(f"Domain: {self.domain}")
        if self.generator:
            parts.append(f"Generator: {self.generator}")
        parts.append(self.message)

        if self.context:
            context_str = ", ".join(f"{k}={v}" for k, v in self.context.items())
            parts.append(f"Context: {context_str}")

        if self.cause:
            parts.append(f"Caused by: {self.cause}")

        return " | ".join(parts)

    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for serialization"""
        return {
            "message": self.message,
            "domain": self.domain,
            "generator": self.generator,
            "error_code": self.error_code,
            "context": self.context,
            "cause": str(self.cause) if self.cause else None,
        }


class ValidationError(CodeGenError):
    """Raised when validation fails"""

    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        value: Optional[Any] = None,
        **kwargs,
    ):
        """
        Initialize validation error.

        Args:
            message: Error message
            field: Optional field name that failed validation
            value: Optional value that failed validation
            **kwargs: Additional arguments passed to CodeGenError
        """
        context = kwargs.pop("context", {})
        if field:
            context["field"] = field
        if value is not None:
            context["value"] = str(value)
        kwargs["context"] = context
        kwargs.setdefault("error_code", "VALIDATION_ERROR")
        super().__init__(message, **kwargs)
        self.field = field
        self.value = value


class GenerationError(CodeGenError):
    """Raised when code generation fails"""

    def __init__(
        self,
        message: str,
        file_path: Optional[Path] = None,
        line_number: Optional[int] = None,
        **kwargs,
    ):
        """
        Initialize generation error.

        Args:
            message: Error message
            file_path: Optional file path where error occurred
            line_number: Optional line number where error occurred
            **kwargs: Additional arguments passed to CodeGenError
        """
        context = kwargs.pop("context", {})
        if file_path:
            context["file_path"] = str(file_path)
        if line_number:
            context["line_number"] = line_number
        kwargs["context"] = context
        kwargs.setdefault("error_code", "GENERATION_ERROR")
        super().__init__(message, **kwargs)
        self.file_path = file_path
        self.line_number = line_number


class ConfigurationError(CodeGenError):
    """Raised when configuration is invalid"""

    def __init__(
        self,
        message: str,
        config_path: Optional[Path] = None,
        config_key: Optional[str] = None,
        **kwargs,
    ):
        """
        Initialize configuration error.

        Args:
            message: Error message
            config_path: Optional path to configuration file
            config_key: Optional configuration key that caused the error
            **kwargs: Additional arguments passed to CodeGenError
        """
        context = kwargs.pop("context", {})
        if config_path:
            context["config_path"] = str(config_path)
        if config_key:
            context["config_key"] = config_key
        kwargs["context"] = context
        kwargs.setdefault("error_code", "CONFIGURATION_ERROR")
        super().__init__(message, **kwargs)
        self.config_path = config_path
        self.config_key = config_key


class OpenAPIError(CodeGenError):
    """Raised when OpenAPI spec parsing fails"""

    def __init__(
        self,
        message: str,
        spec_path: Optional[Path] = None,
        operation_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Initialize OpenAPI error.

        Args:
            message: Error message
            spec_path: Optional path to OpenAPI spec file
            operation_id: Optional operation ID that caused the error
            **kwargs: Additional arguments passed to CodeGenError
        """
        context = kwargs.pop("context", {})
        if spec_path:
            context["spec_path"] = str(spec_path)
        if operation_id:
            context["operation_id"] = operation_id
        kwargs["context"] = context
        kwargs.setdefault("error_code", "OPENAPI_ERROR")
        super().__init__(message, **kwargs)
        self.spec_path = spec_path
        self.operation_id = operation_id


class FileSystemError(CodeGenError):
    """Raised when file system operations fail"""

    def __init__(
        self,
        message: str,
        file_path: Optional[Path] = None,
        operation: Optional[str] = None,
        **kwargs,
    ):
        """
        Initialize file system error.

        Args:
            message: Error message
            file_path: Optional file path where error occurred
            operation: Optional operation that failed (e.g., "read", "write", "delete")
            **kwargs: Additional arguments passed to CodeGenError
        """
        context = kwargs.pop("context", {})
        if file_path:
            context["file_path"] = str(file_path)
        if operation:
            context["operation"] = operation
        kwargs["context"] = context
        kwargs.setdefault("error_code", "FILESYSTEM_ERROR")
        super().__init__(message, **kwargs)
        self.file_path = file_path
        self.operation = operation
