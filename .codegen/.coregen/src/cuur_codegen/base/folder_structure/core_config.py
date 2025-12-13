"""
Core Layer Folder Structure Configuration

Defines folder structure for the core layer (handlers, types, schemas_file, converters, schemas, repositories).
This layer generates the foundational API code for packages/core.
"""

from cuur_codegen.base.folder_structure.models import (
    LayerFolderStructure,
    GeneratorFolderConfig,
    ImportPathConfig,
)


def get_core_layer_config() -> LayerFolderStructure:
    """Get core layer folder structure configuration"""
    return LayerFolderStructure(
        base_path="packages/core/src",
        handlers=GeneratorFolderConfig(
            output_dir="handlers",
            subdirectory_pattern="{resource}/",
            imports=ImportPathConfig(
                types="../../types/index.js",
                repositories="../../repositories/index.js",
                handlers="../../handlers/index.js",
                schemas="../../models/index.js",
                schemas_file="../../schemas/{domain}.schemas",
                converters="../../utils/{domain}-converters.js",
                shared_helpers="../../../shared/helpers/id-generator.js",
                shared_repositories="../../../shared/repositories/_base-repository.js",
                shared_types="../../../shared/types",
            ),
        ),
        repositories=GeneratorFolderConfig(
            output_dir="repositories",
            main_file="index.ts",
            imports=ImportPathConfig(
                types="../types/index.js",
                repositories="../repositories/index.js",
                handlers="../handlers/index.js",
                schemas="../models/index.js",
                schemas_file="../schemas/{domain}.schemas",
                converters="../utils/{domain}-converters.js",
                shared_helpers="../../shared/helpers/id-generator.js",
                shared_repositories="../../shared/repositories/_base-repository.js",
                shared_types="../../shared/types",
            ),
        ),
        types=GeneratorFolderConfig(
            output_dir="types",
            main_file="index.ts",
            imports=ImportPathConfig(
                types="../types/index.js",
                repositories="../repositories/index.js",
                handlers="../handlers/index.js",
                schemas="../models/index.js",
                schemas_file="../schemas/{domain}.schemas",
                converters="../utils/{domain}-converters.js",
                shared_helpers="../../shared/helpers/id-generator.js",
                shared_repositories="../../shared/repositories/_base-repository.js",
                shared_types="../../shared/types",
            ),
        ),
        schemas=GeneratorFolderConfig(
            output_dir="models",
            subdirectory_pattern="{resource}/",
            imports=ImportPathConfig(
                types="../../types/index.js",
                repositories="../../repositories/index.js",
                handlers="../../handlers/index.js",
                schemas="../../models/index.js",
                schemas_file="../../schemas/{domain}.schemas",
                converters="../../utils/{domain}-converters.js",
                shared_helpers="../../../shared/helpers/id-generator.js",
                shared_repositories="../../../shared/repositories/_base-repository.js",
                shared_types="../../../shared/types",
            ),
        ),
        schemas_file=GeneratorFolderConfig(
            output_dir="schemas",
            main_file="{domain}.schemas.ts",
            imports=ImportPathConfig(
                types="../types/index.js",
                repositories="../repositories/index.js",
                handlers="../handlers/index.js",
                schemas="../models/index.js",
                schemas_file="../schemas/{domain}.schemas",
                converters="../utils/{domain}-converters.js",
                shared_helpers="../../shared/helpers/id-generator.js",
                shared_repositories="../../shared/repositories/_base-repository.js",
                shared_types="../../shared/types",
            ),
        ),
        converters=GeneratorFolderConfig(
            output_dir="utils",
            main_file="{domain}-converters.ts",
            imports=ImportPathConfig(
                types="../types/index.js",
                repositories="../repositories/index.js",
                handlers="../handlers/index.js",
                schemas="../models/index.js",
                schemas_file="../schemas/{domain}.schemas",
                converters="../utils/{domain}-converters.js",
                shared_helpers="../../shared/helpers/core-converters.js",
                shared_repositories="../../shared/repositories/_base-repository.js",
                shared_types="../../shared/types",
            ),
        ),
    )
