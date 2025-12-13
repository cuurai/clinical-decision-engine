import { PrismaClient } from '../platform/adapters/src/decision-intelligence/prisma/generated/index.js';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://quub:quub123@localhost:5432/quub_identity';
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

const migrationSql = readFileSync('platform/adapters/src/decision-intelligence/prisma/migrations/0_init/migration.sql', 'utf8');

// Split SQL into statements and extract CREATE TABLE statements
const statements = migrationSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

const createTableStatements = [];
let currentTable = null;
let currentSql = '';

for (const statement of statements) {
  if (statement.startsWith('CREATE TABLE')) {
    // Save previous table if exists
    if (currentTable && currentSql) {
      createTableStatements.push({ name: currentTable, sql: currentSql + ';' });
    }
    // Start new table
    const match = statement.match(/CREATE TABLE "([^"]+)"/);
    currentTable = match ? match[1] : null;
    currentSql = statement;
  } else if (currentTable && (statement.startsWith('CREATE INDEX') || statement.startsWith('CREATE UNIQUE INDEX'))) {
    // Include indexes in the table creation
    currentSql += '; ' + statement;
  } else if (currentTable) {
    // Continue building the table statement
    currentSql += '; ' + statement;
  }
}

// Add the last table
if (currentTable && currentSql) {
  createTableStatements.push({ name: currentTable, sql: currentSql + ';' });
}

console.log(`Found ${createTableStatements.length} tables to create\n`);

let created = 0;
let skipped = 0;
let errors = 0;

for (const { name, sql } of createTableStatements) {
  // Remove DEFAULT values that might conflict with existing enums
  let createTableSql = sql
    .replace(/"status" "StatusEnum" NOT NULL DEFAULT 'active'/g, '"status" "StatusEnum" NOT NULL')
    .replace(/"status" "StatusEnum" NOT NULL DEFAULT \'active\'/g, '"status" "StatusEnum" NOT NULL');

  try {
    await prisma.$executeRawUnsafe(createTableSql);
    console.log(`✅ Created table: ${name}`);
    created++;
  } catch (error) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
      skipped++;
    } else {
      console.error(`❌ Error creating ${name}: ${errorMsg.substring(0, 150)}`);
      errors++;
    }
  }
}

console.log(`\n✨ Summary: ${created} created, ${skipped} skipped, ${errors} errors`);

await prisma.$disconnect();
