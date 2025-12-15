#!/usr/bin/env node
/**
 * Script to fix all broken createMany methods
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');

  // Check if file has the broken pattern
  if (!content.includes("Note: createMany doesn't return created records")) {
    return false;
  }

  // Extract entity name, DAO model, and input type
  const entityMatch = content.match(/async createMany\([^)]+\): Promise<(\w+)\[\]>/);
  const daoMatch = content.match(/await this\.dao\.(\w+)\.createMany/);
  const inputMatch = content.match(/Array<(\w+Input)>/);

  if (!entityMatch || !daoMatch || !inputMatch) {
    console.log(`Skipping ${filePath} - couldn't extract types`);
    return false;
  }

  const entityName = entityMatch[1];
  const daoModel = daoMatch[1];
  const inputType = inputMatch[1];

  // Find the broken createMany block and replace it
  const brokenBlock = /(\s+async createMany\([^)]+\): Promise<[^>]+> \{[^}]*try \{[^}]*await this\.dao\.\w+\.createMany\([^}]+\}\);[\s\S]*?\/\/ Fetch created records[\s\S]*?\/\/ Note: createMany doesn't return created records[^\n]*\n[^\n]*\n[^\n]*\n\s*return \[\];\s*\n\s*\}\s*\n\s*const records = await this\.dao\.\w+\.findMany\([\s\S]*?where: \{ id: \{ in: ids \}, orgId \}[\s\S]*?\);[\s\S]*?return records\.map\([^)]+\);[\s\S]*?\} catch \(error\) \{[\s\S]*?\}\s*\})/;

  const replacement = `  async createMany(orgId: OrgId, items: Array<${inputType}>): Promise<${entityName}[]> {
    try {
      // Use transaction with individual creates to get created records with IDs
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
      });
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }`;

  if (brokenBlock.test(content)) {
    content = content.replace(brokenBlock, replacement);
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
