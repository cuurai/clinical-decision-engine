import { PrismaClient } from '../platform/adapters/src/decision-intelligence/prisma/generated/index.js';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:cuurD%40v2025@db.skxcbvztdnhklffhwkdl.supabase.co:5432/postgres';
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

const migrationSql = readFileSync('platform/adapters/src/decision-intelligence/prisma/migrations/0_init/migration.sql', 'utf8');

const tablesToCreate = ['DecisionSessionInput', 'DecisionResultInput', 'RecommendationInput'];

for (const tableName of tablesToCreate) {
  const regex = new RegExp(`CREATE TABLE "${tableName}"[\\s\\S]*?\\);`, 'g');
  const match = migrationSql.match(regex);

  if (match) {
    let sql = match[0]
      .replace(/"status" "StatusEnum" NOT NULL DEFAULT 'active'/g, '"status" "StatusEnum" NOT NULL')
      .replace(/"status" "StatusEnum" NOT NULL DEFAULT \'active\'/g, '"status" "StatusEnum" NOT NULL');

    console.log(`Creating ${tableName}...`);
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`✅ ${tableName} created`);
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log(`⏭️  ${tableName} already exists`);
      } else {
        console.error(`❌ ${tableName}: ${error.message?.substring(0, 150)}`);
      }
    }
  }
}

await prisma.$disconnect();
