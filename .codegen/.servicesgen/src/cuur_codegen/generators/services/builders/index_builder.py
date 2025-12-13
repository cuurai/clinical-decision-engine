"""
Index Builder

Generates index.ts Fastify server setup
"""

from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import kebab_case


class IndexBuilder:
    """Builds index.ts file content"""

    @staticmethod
    def build_index(
        context: GenerationContext,
        header: str
    ) -> str:
        """Generate index.ts content"""
        domain_name = context.domain_name
        service_version = context.spec.get("info", {}).get("version", "0.0.1")
        service_name_kebab = kebab_case(domain_name)

        return f"""{header}import Fastify from "fastify";
import type {{ FastifyInstance }} from "fastify";
import {{ registerRoutes }} from "./routes/index.js";
import {{ createDependencies }} from "./dependencies/{domain_name}.dependencies.js";
import type {{ Dependencies }} from "./dependencies/{domain_name}.dependencies.js";

/**
 * Service configuration
 */
export interface ServiceConfig {{
  host?: string;
  port?: number;
  logger?: boolean;
}}

/**
 * Create and configure Fastify server
 */
export async function createServer(
  deps: Dependencies,
  config: ServiceConfig = {{}}
): Promise<FastifyInstance> {{
  const fastify = Fastify({{
    logger: config.logger ?? true,
  }});

  // Register routes
  await registerRoutes(fastify, deps);

  // Health check
  fastify.get("/health", async () => {{
    return {{
      status: "ok",
      service: "{service_name_kebab}",
      version: "{service_version}",
      timestamp: new Date().toISOString(),
    }};
  }});

  return fastify;
}}

/**
 * Start the service
 */
export async function startService(
  deps: Dependencies,
  config: ServiceConfig = {{}}
) {{
  const host = config.host ?? "0.0.0.0";
  const port = config.port ?? 3000;

  const server = await createServer(deps, config);

  try {{
    await server.listen({{ host, port }});
    console.log(`🚀 {domain_name} service listening on http://${{host}}:${{port}}`);
  }} catch (err) {{
    server.log.error(err);
    process.exit(1);
  }}

  return server;
}}

// Re-export types
export type {{ Dependencies }} from "./dependencies/{domain_name}.dependencies.js";
export {{ createDependencies }} from "./dependencies/{domain_name}.dependencies.js";
"""
