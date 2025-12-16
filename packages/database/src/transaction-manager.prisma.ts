/**
 * Prisma Transaction Manager Implementation
 *
 * Adapter implementation of TransactionManager for Prisma.
 * This is the concrete implementation that adapters will use.
 */

import Prisma from "@prisma/client";
import type { TransactionManager } from "@cuur-cde/core/_shared";

/**
 * Transaction client type - Prisma's transaction client omits certain methods
 * This is the type that Prisma passes to the transaction callback
 */
type PrismaTransactionClient = Omit<
  Prisma.PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

/**
 * Prisma Transaction Manager
 *
 * Implements the TransactionManager interface using Prisma's transaction functionality.
 */
export class PrismaTransactionManager implements TransactionManager<PrismaTransactionClient> {
  constructor(private readonly prisma: Prisma.PrismaClient) {}

  async run<T>(fn: (tx: PrismaTransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
