"""
Package.json Builder

Generates package.json files for services
"""

from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import pascal_case


class PackageJsonBuilder:
    """Builds package.json file content"""

    @staticmethod
    def build_package_json(
        context: GenerationContext,
        header: str = ""
    ) -> str:
        """Generate package.json content"""
        domain_name = context.domain_name
        service_name = pascal_case(domain_name)
        package_name = f"@quub/service-{domain_name}"

        return f"""{header}{{
  "name": "{package_name}",
  "version": "1.0.0",
  "description": "Quub Exchange - {service_name} API",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {{
    "dev": "tsx watch src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js",
    "test": "vitest"
  }},
  "dependencies": {{
    "@cuur/core": "workspace:*",
    "@quub/adapters": "workspace:*",
    "fastify": "^4.28.0",
    "@prisma/client": "^6.0.1"
  }},
  "devDependencies": {{
    "@types/node": "^20.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "vitest": "^1.0.0"
  }}
}}
"""

