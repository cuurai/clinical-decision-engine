"""
TypeScript Config Builder

Generates tsconfig.json files for services
"""

from cuur_codegen.core.context import GenerationContext


class TsConfigBuilder:
    """Builds tsconfig.json file content"""

    @staticmethod
    def build_tsconfig(context: GenerationContext) -> str:
        """Generate tsconfig.json content"""
        return """{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "baseUrl": "../../../../",
    "paths": {
      "@cuur/core": ["packages/core/packages/core/dist/index.d.ts"],
      "@cuur/core/*": ["packages/core/packages/core/src/*"],
      "@quub/adapters": ["platform/adapters/src/index.ts"],
      "@quub/adapters/*": ["platform/adapters/src/*"]
    },
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/__tests__/**"],
  "references": [
    {
      "path": "../../../../packages/core/packages/core"
    }
  ]
}
"""


