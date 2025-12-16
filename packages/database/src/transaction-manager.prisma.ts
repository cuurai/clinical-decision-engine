/**
 * Prisma Transaction Manager Implementation
 *
 * Adapter implementation of TransactionManager for Prisma.
 * This is created at the service composition root and injected into adapters.
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
 * This wraps Prisma's transaction and handles the client type internally.
 *
 * Note: Operations inside the transaction callback should use the transaction client
 * passed by Prisma. The implementation bridges Prisma's transaction pattern with
 * the core TransactionManager interface.
 */
export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly prisma: Prisma.PrismaClient) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    // Prisma's $transaction requires passing the transaction client to operations
    // The interface doesn't allow passing tx to fn(), so operations inside fn()
    // will need to use a mechanism to access the transaction client (e.g., context)
    // For now, we execute fn() within Prisma's transaction context
    return this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Note: Operations inside fn() that need transaction isolation should use
      // a transaction-aware client accessed via context or dependency injection
      return fn();
    });
  }
}
