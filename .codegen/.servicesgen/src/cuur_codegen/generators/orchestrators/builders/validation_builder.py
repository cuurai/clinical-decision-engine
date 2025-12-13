"""
Validation Builder - Generates validation schemas
"""

from pathlib import Path
from typing import List, Dict, Any
from cuur_codegen.utils.file import ensure_directory, write_file


class ValidationBuilder:
    """Builds validation schema files"""

    @staticmethod
    def build_validation_common() -> str:
        """Build common validation utilities"""
        return '''/**
 * Common validation utilities
 *
 * Shared validation functions and schemas used across flows.
 *
 * TODO: Generate Zod schemas from OpenAPI requestBody schemas.
 * This requires parsing OpenAPI spec and converting JSON Schema to Zod.
 */

import { z } from "zod";

export const orderIdSchema = z.string().uuid();
export const marketIdSchema = z.string().min(1);
export const accountIdSchema = z.string().min(1);
export const orgIdSchema = z.string().min(1);

export function validateOrderId(orderId: unknown): string {
  return orderIdSchema.parse(orderId);
}

export function validateMarketId(marketId: unknown): string {
  return marketIdSchema.parse(marketId);
}

export function validateAccountId(accountId: unknown): string {
  return accountIdSchema.parse(accountId);
}

export function validateOrgId(orgId: unknown): string {
  return orgIdSchema.parse(orgId);
}
'''

    @staticmethod
    def generate_validation_files(output_dir: Path, domain_name: str, spec: Dict[str, Any]) -> List[Path]:
        """Generate validation schema files"""
        validation_dir = output_dir / "validation"
        ensure_directory(validation_dir)

        files = []
        # TODO: Extract schemas from OpenAPI spec and generate Zod validators
        # For now, create a placeholder
        common_file = validation_dir / "common.ts"
        write_file(common_file, ValidationBuilder.build_validation_common())
        files.append(common_file)

        return files
