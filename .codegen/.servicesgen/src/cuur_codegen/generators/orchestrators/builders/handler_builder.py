"""
Handler Builder - Generates handler.ts
"""

from pathlib import Path
from typing import Optional, Dict, Any
from cuur_codegen.utils.file import write_file


class HandlerBuilder:
    """Builds handler.ts file"""

    @staticmethod
    def build_handler(domain_name: str) -> str:
        """Build handler.ts content"""
        return f'''/**
 * Lambda entrypoint for {domain_name} orchestrator
 *
 * This is the main handler that receives API Gateway events
 * and routes them to the appropriate flow handlers.
 *
 * Security: Extracts orgId from JWT token, never from URL parameters.
 */

import type {{ APIGatewayProxyEvent, APIGatewayProxyResult }} from "aws-lambda";
import {{ routes }} from "./routes.js";
import {{ createDependencies }} from "./deps.js";
import {{ extractContext }} from "./context.js";
import {{ FlowError }} from "./errors/flow-error.js";
import {{ logger }} from "./logger.js";

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {{
  const requestId = event.requestContext?.requestId || "unknown";

  try {{
    // Extract context from JWT token (orgId, accountId)
    const context = extractContext(event);

    logger.info({{
      requestId,
      orgId: context.orgId,
      accountId: context.accountId,
      method: event.httpMethod,
      path: event.path,
    }}, "Processing request");

    const deps = createDependencies();
    const route = routes.find((r) => r.matches(event));

    if (!route) {{
      logger.warn({{ requestId, path: event.path }}, "Route not found");
      return {{
        statusCode: 404,
        headers: {{
          "Content-Type": "application/json",
        }},
        body: JSON.stringify({{ error: "ROUTE_NOT_FOUND", message: "Route not found" }}),
      }};
    }}

    // Pass context to route handler
    const result = await route.handler(event, context, deps);

    return {{
      statusCode: 200,
      headers: {{
        "Content-Type": "application/json",
      }},
      body: JSON.stringify(result),
    }};
  }} catch (error) {{
    logger.error({{
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }}, "Handler error");

    // Handle FlowError with appropriate status code
    if (error instanceof FlowError) {{
      return {{
        statusCode: error.statusCode,
        headers: {{
          "Content-Type": "application/json",
        }},
        body: JSON.stringify(error.toJSON()),
      }};
    }}

    // Handle authentication errors with 401
    if (error instanceof Error && (
      error.message.includes("Authorization") ||
      error.message.includes("JWT") ||
      error.message.includes("Unauthorized")
    )) {{
      return {{
        statusCode: 401,
        headers: {{
          "Content-Type": "application/json",
        }},
        body: JSON.stringify({{
          error: "UNAUTHORIZED",
          message: error.message,
        }}),
      }};
    }}

    return {{
      statusCode: 500,
      headers: {{
        "Content-Type": "application/json",
      }},
      body: JSON.stringify({{
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      }}),
    }};
  }}
}}
'''

    @staticmethod
    def generate_handler(output_dir: Path, domain_name: str, spec: Dict[str, Any]) -> Optional[Path]:
        """Generate handler.ts"""
        handler_file = output_dir / "handler.ts"
        write_file(handler_file, HandlerBuilder.build_handler(domain_name))
        return handler_file
