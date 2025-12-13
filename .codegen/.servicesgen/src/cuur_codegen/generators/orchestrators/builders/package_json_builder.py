"""
Package.json Builder - Generates package.json
"""

from pathlib import Path
from typing import Optional, Dict, Any
from cuur_codegen.utils.file import write_file
from cuur_codegen.utils.string import pascal_case


class PackageJsonBuilder:
    """Builds package.json file"""

    @staticmethod
    def build_package_json(domain_name: str, spec: Dict[str, Any]) -> str:
        """Build package.json content"""
        info = spec.get("info", {})
        title = info.get("title", pascal_case(domain_name))
        version = info.get("version", "1.0.0")

        return f'''{{
  "name": "@quub/orchestrator-{domain_name}",
  "version": "{version}",
  "description": "{title} - Business-scenario-driven API aggregation layer",
  "type": "module",
  "main": "handler.js",
  "scripts": {{
    "build": "tsc",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }},
  "dependencies": {{
    "@cuur/core": "workspace:*",
    "@quub/adapters": "workspace:*",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "pino": "^8.16.0",
    "pino-pretty": "^10.2.3"
  }},
  "devDependencies": {{
    "@types/aws-lambda": "^8.10.130",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "vitest": "^1.0.4",
    "@types/pino-pretty": "^5.0.0"
  }}
}}
'''

    @staticmethod
    def generate_package_json(output_dir: Path, domain_name: str, spec: Dict[str, Any]) -> Optional[Path]:
        """Generate package.json"""
        package_file = output_dir / "package.json"
        write_file(package_file, PackageJsonBuilder.build_package_json(domain_name, spec))
        return package_file
