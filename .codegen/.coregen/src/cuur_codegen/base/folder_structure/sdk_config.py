"""
SDK Layer Folder Structure Configuration

Defines folder structure for the SDK layer (types, schemas extractors, and domain clients).
"""

from cuur_codegen.base.folder_structure.models import (
    LayerFolderStructure,
    GeneratorFolderConfig,
    ImportPathConfig,
)


def get_sdk_layer_config() -> LayerFolderStructure:
    """Get SDK layer folder structure configuration"""
    return LayerFolderStructure(
        base_path="packages/sdk/src/openapi",
        types=GeneratorFolderConfig(
            output_dir="types",
            main_file="{domain}.openapi.types.ts",
            imports=ImportPathConfig(
                types="../types/{domain}.openapi.types.js",
                schemas="../schemas/{domain}.zod.schema.js",
                shared_helpers="../../shared/helpers/id-generator.js",
                shared_repositories="../../shared/repositories/_base-repository.js",
                shared_types="../types",
            ),
        ),
        schemas=GeneratorFolderConfig(
            output_dir="schemas",
            main_file="{domain}.zod.schema.ts",
            imports=ImportPathConfig(
                types="../types/{domain}.openapi.types.js",
                schemas="../schemas/{domain}.zod.schema.js",
                shared_helpers="../../shared/helpers/id-generator.js",
                shared_repositories="../../shared/repositories/_base-repository.js",
                shared_types="../types",
            ),
        ),
        # Domain clients generator (outputs to packages/sdk/src/domains, not in openapi folder)
        # Note: This is a placeholder - actual output path is hardcoded in generator
        # but we need it in the config for import path resolution
        handlers=GeneratorFolderConfig(
            output_dir="domains",
            main_file="{domain}-client.ts",
            imports=ImportPathConfig(
                types="../openapi/types/{domain}.openapi.types.js",
                schemas="../openapi/schemas/{domain}.zod.schema.js",
                shared_helpers="../../shared/helpers/id-generator.js",
                shared_repositories="../../shared/repositories/_base-repository.js",
                shared_types="../openapi/types",
            ),
        ),
        repositories=None,
        validators=None,
        converters=None,
        index_builder=None,
    )
