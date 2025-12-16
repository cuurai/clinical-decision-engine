/**
 * DAO Client Type Definition
 *
 * This type represents the Prisma client interface used by DAO repositories.
 * It's a type-safe wrapper around PrismaClient that provides access to all
 * domain models (e.g., alertEvaluation, decisionSession, etc.)
 */

import type { PrismaClient } from "@prisma/client";

/**
 * DaoClient is an alias for PrismaClient
 * DAO repositories use this type to ensure type safety when working with the database
 */
export type DaoClient = PrismaClient;
