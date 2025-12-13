"""Utility functions"""

from cuur_codegen.utils.string import (
    camel_case,
    pascal_case,
    kebab_case,
    snake_case,
    pluralize,
    singularize,
    extract_resource_from_operation_id,
)
from cuur_codegen.utils.openapi import (
    load_openapi_spec,
    extract_operations,
    extract_schemas,
    get_operation_by_id,
    resolve_ref,
)
from cuur_codegen.utils.file import (
    ensure_directory,
    write_file,
    read_file,
    file_exists,
    clean_directory,
)

__all__ = [
    "camel_case",
    "pascal_case",
    "kebab_case",
    "snake_case",
    "pluralize",
    "singularize",
    "extract_resource_from_operation_id",
    "load_openapi_spec",
    "extract_operations",
    "extract_schemas",
    "get_operation_by_id",
    "resolve_ref",
    "ensure_directory",
    "write_file",
    "read_file",
    "file_exists",
    "clean_directory",
]
