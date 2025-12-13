"""
Vitest Config Builder for Tests

Generates vitest.config.ts files for test packages with proper path resolution
"""

from cuur_codegen.core.context import GenerationContext


class VitestConfigBuilder:
    """Builds vitest.config.ts files for test packages"""

    @staticmethod
    def build_vitest_config(
        domain_name: str,
        header: str,
        context: GenerationContext
    ) -> str:
        """
        Build vitest.config.ts content for test package

        Args:
            domain_name: Domain name (e.g., "onboarding-identity")
            header: File header comment
            context: Generation context

        Returns:
            vitest.config.ts content
        """
        return f"""{header}
import {{ defineConfig }} from "vitest/config";
// @ts-expect-error - vite-tsconfig-paths is a runtime dependency, types may not be available
import tsconfigPaths from "vite-tsconfig-paths";
import {{ resolve, dirname }} from "path";
import {{ fileURLToPath }} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Calculate repo root by finding 'platform' in path and going one level up
const pathParts = __dirname.split("/");
const platformIdx = pathParts.indexOf("platform");
const rootDir =
  platformIdx > 0
    ? "/" + pathParts.slice(0, platformIdx).join("/")
    : resolve(__dirname, "../../../../..");

export default defineConfig({{
  plugins: [
    tsconfigPaths({{
      root: rootDir,
      projects: [resolve(__dirname, "tsconfig.json")],
      ignoreConfigErrors: true,
    }}),
  ],
  test: {{
    globals: true,
    environment: "node",
  }},
  resolve: {{
    // Try .ts extensions first, then .js
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: [
      {{
        // Match @cuur/core/*.js and strip .js extension to resolve to .ts files
        find: /^@quub\/core\/(.*)\.js$/,
        replacement: resolve(rootDir, "packages/core/packages/core/src/$1"),
      }},
      {{
        // Fallback for @cuur/core/* without extension
        find: /^@quub\/core\/(.*)$/,
        replacement: resolve(rootDir, "packages/core/packages/core/src/$1"),
      }},
      {{
        // Match @quub/adapters/*.js and strip .js extension to resolve to .ts files
        find: /^@quub\/adapters\/(.*)\.js$/,
        replacement: resolve(rootDir, "platform/adapters/src/$1"),
      }},
      {{
        // Fallback for @quub/adapters/* without extension
        find: /^@quub\/adapters\/(.*)$/,
        replacement: resolve(rootDir, "platform/adapters/src/$1"),
      }},
      {{
        find: /^@quub\/core$/,
        replacement: resolve(rootDir, "packages/core/packages/core/src"),
      }},
      {{
        find: /^@quub\/adapters$/,
        replacement: resolve(rootDir, "platform/adapters/src"),
      }},
      {{
        // Match @quub/orchestrators/*.js and strip .js extension to resolve to .ts files
        find: /^@quub\/orchestrators\/(.*)\.js$/,
        replacement: resolve(rootDir, "platform/orchestrators/domains/src/$1"),
      }},
      {{
        // Fallback for @quub/orchestrators/* without extension
        find: /^@quub\/orchestrators\/(.*)$/,
        replacement: resolve(rootDir, "platform/orchestrators/domains/src/$1"),
      }},
      {{
        // Match @quub/factories/*.js and strip .js extension to resolve to .ts files
        find: /^@quub\/factories\/(.*)\.js$/,
        replacement: resolve(rootDir, "platform/tests/src/core/$1"),
      }},
      {{
        // Fallback for @quub/factories/* without extension
        find: /^@quub\/factories\/(.*)$/,
        replacement: resolve(rootDir, "platform/tests/src/core/$1"),
      }},
    ],
  }},
}});
"""
