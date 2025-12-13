"""
WebSocket Builder - Builds WebSocket handlers
"""

from typing import Dict, Any, List
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, pascal_case


class WebSocketBuilder:
    """Builder for WebSocket handlers"""

    # Common WebSocket handler patterns
    WEBSOCKET_PATTERNS = {
        "market-data": {
            "name": "MarketDataHandler",
            "description": "WebSocket handler for real-time market data",
            "events": ["price_update", "trade_update", "orderbook_update"],
        },
        "notifications": {
            "name": "NotificationsHandler",
            "description": "WebSocket handler for real-time notifications",
            "events": ["notification", "alert", "system_message"],
        },
    }

    @staticmethod
    def build_handler(
        context: GenerationContext,
        handler_name: str,
        pattern: Dict[str, Any],
        header: str,
    ) -> str:
        """
        Build WebSocket handler.

        Args:
            context: Generation context
            handler_name: Name of the handler (e.g., "MarketDataHandler")
            pattern: Handler pattern definition
            header: File header comment

        Returns:
            Generated TypeScript code
        """
        events = pattern.get("events", [])

        # Build event handler methods
        event_handlers = []
        for event in events:
            event_handler = WebSocketBuilder._build_event_handler(event)
            event_handlers.append(event_handler)

        # Build class
        class_content = f"""{header}

/**
 * {pattern["description"]}
 *
 * Handles WebSocket connections and real-time event streaming.
 */

import type {{ SocketStream }} from "@fastify/websocket";

export class {handler_name} {{
  private connections: Map<string, SocketStream> = new Map();

  /**
   * Handle new WebSocket connection
   */
  handleConnection(connection: SocketStream, connectionId: string): void {{
    this.connections.set(connectionId, connection);
    connection.socket.on("close", () => {{
      this.connections.delete(connectionId);
    }});
  }}

  /**
   * Broadcast message to all connected clients
   */
  broadcast(event: string, data: any): void {{
    const message = JSON.stringify({{ event, data }});
    this.connections.forEach((connection) => {{
      if (connection.socket.readyState === 1) {{ // OPEN
        connection.socket.send(message);
      }}
    }});
  }}

  /**
   * Send message to specific connection
   */
  send(connectionId: string, event: string, data: any): void {{
    const connection = this.connections.get(connectionId);
    if (connection && connection.socket.readyState === 1) {{
      const message = JSON.stringify({{ event, data }});
      connection.socket.send(message);
    }}
  }}

{chr(10).join(event_handlers)}
}}
"""

        return class_content.strip()

    @staticmethod
    def _build_event_handler(event_name: str) -> str:
        """Build an event handler method"""
        method_name = camel_case(event_name)

        handler_code = f"""  /**
   * Handle {event_name} event
   */
  handle{method_name.capitalize()}(connectionId: string, data: any): void {{
    // Process {event_name} event
    this.send(connectionId, "{event_name}", data);
  }}"""

        return handler_code
