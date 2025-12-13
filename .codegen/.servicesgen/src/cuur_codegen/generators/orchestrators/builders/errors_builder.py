"""
Errors Builder - Generates errors/flow-error.ts
"""

from pathlib import Path
from typing import Optional


class ErrorsBuilder:
    """Builds flow-error.ts file"""

    @staticmethod
    def build_flow_error(domain_name: str) -> str:
        """Build flow-error.ts content"""
        return '''/**
 * Flow Error
 *
 * Custom error class for orchestrator flow errors.
 * Provides structured error responses with status codes.
 */

export class FlowError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "FlowError";
    Object.setPrototypeOf(this, FlowError.prototype);
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}
'''
