#!/bin/bash
# Execute migration SQL with error handling for existing objects

MIGRATION_FILE="$1"
DATABASE_URL="${DATABASE_URL:-postgresql://quub:quub123@localhost:5432/quub_identity}"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "Executing migration: $MIGRATION_FILE"

# Use node to execute SQL via Prisma
node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const sql = fs.readFileSync('$MIGRATION_FILE', 'utf8');

// Split SQL into individual statements
const statements = sql.split(';').filter(s => s.trim().length > 0);

async function execute() {
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const statement of statements) {
    const trimmed = statement.trim();
    if (!trimmed) continue;

    try {
      await prisma.\$executeRawUnsafe(trimmed);
      success++;
    } catch (error) {
      // Ignore errors for existing objects
      if (error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.code === '42P07' || // duplicate_table
          error.code === '42710') { // duplicate_object
        skipped++;
      } else {
        console.error('Error:', error.message);
        errors++;
      }
    }
  }

  await prisma.\$disconnect();
  console.log(\`✅ Success: \${success}, ⏭️  Skipped: \${skipped}, ❌ Errors: \${errors}\`);
}

execute().catch(console.error);
" --env DATABASE_URL="$DATABASE_URL"
