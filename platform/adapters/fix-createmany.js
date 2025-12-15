#!/usr/bin/env node
/**
 * Script to fix createMany methods that try to access item.id
 * Since create inputs don't have id, we need to use a different approach
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix the pattern: const ids = items.map(item => item.id).filter(Boolean) as string[];
  // Since create inputs don't have id, we need to use individual creates or query differently
  // For now, we'll use individual creates in a transaction for accuracy

  const createManyPattern = /(\s+)(\/\/ Fetch created records\s+const ids = items\.map\(item => item\.id\)\.filter\(Boolean\) as string\[\];\s+if \(ids\.length === 0\) \{\s+return \[\];\s+\}\s+const records = await this\.dao\.\w+\.findMany\(\{\s+where: \{ id: \{ in: ids \}, orgId \},\s+\}\);)/s;

  if (createManyPattern.test(content)) {
    // Replace with transaction-based individual creates
    const match = content.match(createManyPattern);
    if (match) {
      const indent = match[1];
      const oldCode = match[2];

      // Extract the DAO model name and entity name from context
      const daoMatch = content.match(/await this\.dao\.(\w+)\.createMany/);
      const entityMatch = content.match(/async createMany\([^)]+\): Promise<(\w+)\[\]>/);

      if (daoMatch && entityMatch) {
        const daoModel = daoMatch[1];
        const entityName = entityMatch[1];

        const newCode = `// Use transaction with individual creates to get created records with IDs
      return await this.transactionManager.executeInTransaction(async (tx) => {
        const results: ${entityName}[] = [];
        for (const item of items) {
          const record = await tx.${daoModel}.create({
            data: {
              ...item,
              orgId,
            },
          });
          results.push(this.toDomain(record));
        }
        return results;
      });`;

        // Find the createMany call and replace the entire block
        const fullPattern = new RegExp(
          `(await this\\.dao\\.${daoModel}\\.createMany\\(\\{[^}]+\\}\\);)\\s*${oldCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
          's'
        );

        if (fullPattern.test(content)) {
          content = content.replace(
            fullPattern,
            `return await this.transactionManager.executeInTransaction(async (tx) => {
        const results: ${entityName}[] = [];
        for (const item of items) {
          const record = await tx.${daoModel}.create({
            data: {
              ...item,
              orgId,
            },
          });
          results.push(this.toDomain(record));
        }
        return results;
      });`
          );
          modified = true;
        }
      }
    }
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

async function main() {
  const files = await glob('src/**/*.dao.repository.ts', {
    cwd: __dirname,
    absolute: true,
  });

  let fixedCount = 0;
  for (const file of files) {
    if (await fixFile(file)) {
      fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} files`);
}

main().catch(console.error);
