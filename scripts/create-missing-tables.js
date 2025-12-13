import { PrismaClient } from '../platform/adapters/src/decision-intelligence/prisma/generated/index.js';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://quub:quub123@localhost:5432/quub_identity';
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

// Extract just the CREATE TABLE statements for AlertEvaluationInput
const migrationSql = readFileSync('platform/adapters/src/decision-intelligence/prisma/migrations/0_init/migration.sql', 'utf8');

// Find the CREATE TABLE statement for AlertEvaluationInput
const alertTableMatch = migrationSql.match(/CREATE TABLE "AlertEvaluationInput"[\s\S]*?\);/) ||
  migrationSql.match(/CREATE TABLE "AlertEvaluationInput"[\s\S]*?(?=CREATE TABLE|$)/);

if (alertTableMatch) {
  // Remove the DEFAULT 'active' from status field to avoid enum conflicts
  let createTableSql = alertTableMatch[0]
    .replace(/"status" "StatusEnum" NOT NULL DEFAULT 'active'/, '"status" "StatusEnum" NOT NULL')
    .replace(/"status" "StatusEnum" NOT NULL DEFAULT \'active\'/, '"status" "StatusEnum" NOT NULL');

  console.log('Creating AlertEvaluationInput table...');

  try {
    await prisma.$executeRawUnsafe(createTableSql);
    console.log('✅ AlertEvaluationInput table created successfully');

    // Now add the default constraint separately if needed
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "AlertEvaluationInput" ALTER COLUMN "status" SET DEFAULT 'active'::"StatusEnum"`);
    } catch (e) {
      // Ignore if default can't be set (enum value might not exist)
    }
  } catch (error) {
    if (error.message?.includes('already exists')) {
      console.log('⏭️  AlertEvaluationInput table already exists');
    } else {
      console.error('❌ Error:', error.message?.substring(0, 200));
    }
  }
} else {
  console.log('⚠️  Could not find CREATE TABLE statement for AlertEvaluationInput');
}

await prisma.$disconnect();
