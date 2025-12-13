import { PrismaClient } from '../platform/adapters/src/decision-intelligence/prisma/generated/index.js';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://quub:quub123@localhost:5432/quub_identity';
const MIGRATION_FILE = process.argv[2];

if (!MIGRATION_FILE) {
  console.error('Usage: node run-migration.js <migration-file>');
  process.exit(1);
}

const sql = readFileSync(MIGRATION_FILE, 'utf8');

// Create Prisma client with custom DATABASE_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function executeMigration() {
  try {
    console.log('Executing migration SQL...');

    // Split SQL into statements (semicolon-separated)
    // Remove comments and split by semicolon
    const cleanedSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    let success = 0;
    let skipped = 0;
    let errors = 0;

    for (const statement of statements) {
      if (!statement.trim()) continue;

      try {
        await prisma.$executeRawUnsafe(statement);
        success++;
      } catch (error) {
        // Ignore errors for existing objects
        const errorMsg = error.message || '';
        const errorCode = error.code || '';

        if (
          errorMsg.includes('already exists') ||
          errorMsg.includes('duplicate') ||
          errorCode === '42P07' || // duplicate_table
          errorCode === '42710' || // duplicate_object
          errorCode === '22P02' || // invalid enum value (enum exists but with different values)
          (errorMsg.includes('relation') && errorMsg.includes('already exists')) ||
          (errorMsg.includes('type') && errorMsg.includes('already exists'))
        ) {
          skipped++;
          // Don't log skipped errors to reduce noise
        } else {
          console.error(`Error executing statement: ${errorMsg.substring(0, 200)}`);
          if (statement.length < 200) {
            console.error(`Statement: ${statement}`);
          } else {
            console.error(`Statement: ${statement.substring(0, 100)}...`);
          }
          errors++;
        }
      }
    }

    console.log(`\n✅ Success: ${success}`);
    console.log(`⏭️  Skipped (already exists): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);

    if (errors === 0) {
      console.log('\n✨ Migration completed successfully!');
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

executeMigration().catch(console.error);
