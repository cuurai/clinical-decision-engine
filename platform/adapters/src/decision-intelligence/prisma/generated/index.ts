/**
 * Prisma Client - Generated stub for testing
 *
 * This is a temporary stub to allow the service to start.
 * In production, this should be generated using: npx prisma generate
 */

// Create a minimal PrismaClient stub
export class PrismaClient {
  $connect = async () => Promise.resolve();
  $disconnect = async () => Promise.resolve();
  $transaction = async (callback: any) => callback(this);

  // Add stub properties for all models used by DAO repositories
  alertEvaluation = {
    findMany: async () => [],
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    updateMany: async () => ({ count: 0 }),
  };

  // Add other models as needed - this is a minimal stub
  [key: string]: any;
}
