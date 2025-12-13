"""
Logger Builder - Generates logger.ts
"""

from pathlib import Path
from typing import Optional


class LoggerBuilder:
    """Builds logger.ts file"""

    @staticmethod
    def build_logger(domain_name: str) -> str:
        """Build logger.ts content"""
        return '''/**
 * Structured Logger
 *
 * Uses pino for structured logging with request context.
 */

import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(process.env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  }),
});
'''
