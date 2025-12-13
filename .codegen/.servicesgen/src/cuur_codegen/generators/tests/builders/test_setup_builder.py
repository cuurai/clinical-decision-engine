"""
Test Setup Builder

Generates test setup files (vitest.setup.ts, test-db.setup.ts, e2e/setup.ts)
"""

from .test_constants import TEST_CONSTANTS


class TestSetupBuilder:
    """Builds test setup files"""

    @staticmethod
    def build_vitest_setup(_domain_name: str, header: str) -> str:
        """Build vitest.setup.ts content"""
        return f"""{header}
/**
 * Vitest Global Setup
 *
 * Configures test environment with:
 * - Testcontainers Postgres
 * - Frozen time
 * - Seeded faker
 * - Baseline data
 */

import {{ beforeAll, afterAll, beforeEach, afterEach, vi }} from "vitest";
import {{ startTestDb, stopTestDb, getPrismaClient }} from "./test-db.setup.js";
import {{ seedBaselineData }} from "./seed.js";

// Set required environment variables
process.env.TZ = "UTC";
process.env.TEST_FIXED_DATE = "{TEST_CONSTANTS.FIXED_DATE}";
process.env.TEST_FAKER_SEED = "{TEST_CONSTANTS.FAKER_SEED}";

/**
 * Global setup - runs once per worker
 */
beforeAll(async () => {{
  console.log("🚀 Starting test environment...");

  // Start Testcontainers (initializes prisma)
  const client = await startTestDb();

  // Make prisma available globally (AFTER initialization)
  (globalThis as any).prisma = client;

  // Seed baseline data (orgs, users)
  await seedBaselineData();

  console.log("✅ Test environment ready");
}}, 60000); // 60s timeout for container startup

/**
 * Global teardown - runs once per worker
 */
afterAll(async () => {{
  await stopTestDb();
}});

/**
 * Per-test setup
 */
beforeEach(() => {{
  // ⚠️ DO NOT use fake timers globally - breaks Fastify async operations!
  // Tests that need frozen time should opt-in explicitly with:
  //   vi.useFakeTimers(); vi.setSystemTime(new Date("2025-01-01"));
}});

/**
 * Per-test teardown
 */
afterEach(() => {{
  // Ensure real timers are restored (in case test used fake timers)
  vi.useRealTimers();
}});
"""

    @staticmethod
    def build_test_db_setup(_domain_name: str, header: str) -> str:
        """Build test-db.setup.ts content"""
        return f"""{header}
/**
 * Test Database Setup
 *
 * Manages Testcontainers Postgres instance for integration/E2E tests
 */

// @ts-expect-error - Prisma client will be generated when schema is added
import {{ PrismaClient }} from "@prisma/client";
import {{ PostgreSqlContainer, StartedPostgreSqlContainer }} from "@testcontainers/postgresql";
import {{ execSync }} from "child_process";
import path from "path";

let container: StartedPostgreSqlContainer | null = null;
let prisma: PrismaClient | null = null;

/**
 * Get Prisma client instance
 */
export function getPrismaClient(): PrismaClient {{
  if (!prisma) {{
    throw new Error("Prisma client not initialized. Call startTestDb() first.");
  }}
  return prisma;
}}

/**
 * Start test database container
 */
export async function startTestDb(): Promise<PrismaClient> {{
  if (container) {{
    return getPrismaClient();
  }}

  console.log("🐘 Starting Postgres container...");
  container = await new PostgreSqlContainer()
    .withDatabase("test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const connectionString = container.getConnectionString();

  // Set DATABASE_URL for Prisma
  process.env.DATABASE_URL = connectionString;

  // Run migrations
  console.log("📦 Running migrations...");
  execSync("npx prisma migrate deploy", {{
    stdio: "inherit",
    env: {{ ...process.env, DATABASE_URL: connectionString }},
  }});

  // Initialize Prisma
  prisma = new PrismaClient({{
    log: process.env.DEBUG ? ["query", "error"] : ["error"],
  }});

  await prisma.$connect();
  console.log("✅ Database ready");

  return prisma;
}}

/**
 * Stop test database container
 */
export async function stopTestDb(): Promise<void> {{
  if (prisma) {{
    await prisma.$disconnect();
    prisma = null;
  }}

  if (container) {{
    await container.stop();
    container = null;
    console.log("🛑 Database stopped");
  }}
}}
"""

    @staticmethod
    def build_e2e_setup(_domain_name: str, header: str) -> str:
        """Build e2e/setup.ts content"""
        return f"""{header}
/**
 * E2E Test Setup - Shared Configuration and Utilities
 */

import jwt from "jsonwebtoken";

// Test Configuration
export const TEST_JWT_SECRET = "{TEST_CONSTANTS.TEST_JWT_SECRET}";
export const TEST_ORG_ID = "{TEST_CONSTANTS.TEST_ORG_ID}"; // Domain-only format (ID_ prefix)
export const TEST_ACCOUNT_ID = "{TEST_CONSTANTS.TEST_ACCOUNT_ID}"; // Domain-only format (ID_ prefix)
export const TEST_USER_EMAIL = "{TEST_CONSTANTS.TEST_USER_EMAIL}";

// Set JWT_SECRET for auth middleware
process.env.JWT_SECRET = TEST_JWT_SECRET;

/**
 * Generate a valid JWT token for testing
 */
export function generateAuthToken(
  orgId: string = TEST_ORG_ID,
  email: string = TEST_USER_EMAIL
): string {{
  return jwt.sign(
    {{
      accountId: TEST_ACCOUNT_ID,
      orgIds: [orgId],
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }},
    TEST_JWT_SECRET
  );
}}

/**
 * Helper to parse JSON response
 */
export function parseJsonResponse(body: string) {{
  try {{
    return JSON.parse(body);
  }} catch {{
    return null;
  }}
}}
"""

