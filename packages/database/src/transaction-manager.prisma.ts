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
 * This is the type that Prisma passes to the transaction callback.
 * Adapters use this type to type their transaction callbacks.
 */
export type PrismaTransactionClient = Omit<
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

  async run<T>(fn: (tx: PrismaTransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
