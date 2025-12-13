"""
Config Builder - Generates config/index.ts
"""

from pathlib import Path
from typing import Optional, Dict, Any
from cuur_codegen.utils.file import ensure_directory, write_file
from cuur_codegen.utils.string import pascal_case


class ConfigBuilder:
    """Builds config/index.ts file"""

    @staticmethod
    def build_config(domain_name: str) -> str:
        """Build config/index.ts content"""
        service_urls = []

        return f'''/**
 * Environment/Config Loaders
 *
 * Loads configuration for the {domain_name} orchestrator.
 */

export interface {pascal_case(domain_name.replace('-', '_'))}Config {{
{chr(10).join(service_urls)}
  defaultTimeout: number;
}}

export function loadConfig(): {pascal_case(domain_name.replace('-', '_'))}Config {{
  return {{
{chr(10).join(service_urls)}
    defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || "30000", 10),
  }};
}}
'''

    @staticmethod
    def generate_config(output_dir: Path, domain_name: str, spec: Dict[str, Any]) -> Optional[Path]:
        """Generate config/index.ts"""
        config_dir = output_dir / "config"
        ensure_directory(config_dir)

        config_file = config_dir / "index.ts"
        write_file(config_file, ConfigBuilder.build_config(domain_name))
        return config_file
