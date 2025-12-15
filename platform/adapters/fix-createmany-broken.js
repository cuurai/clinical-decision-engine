#!/usr/bin/env node
/**
 * Script to fix broken createMany methods
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

  // Check if file has the broken pattern
  if (!content.includes("Note: createMany doesn't return created records")) {
    return false;
  }

  // Extract entity name and DAO model name
  const entityMatch = content.match(/async createMany\([^)]+\): Promise<(\w+)\[\]>/);
  const daoMatch = content.match(/await this\.dao\.(\w+)\.createMany/);

  if (!entityMatch || !daoMatch) {
    console.log(`Skipping ${filePath} - couldn't extract types`);
    return false;
  }

  const entityName = entityMatch[1];
  const daoModel = daoMatch[1];

  // Find and replace the broken createMany implementation
  const brokenPattern = new RegExp(
    `(async createMany\\([^)]+\\): Promise<${entityName}\\[\\]> \\{[^}]*try \\{[^}]*await this\\.dao\\.${daoModel}\\.createMany\\(\\{[^}]+\\}\\);\\s*// Fetch created records\\s*// Note: createMany doesn't return created records[^}]*// Query recently created records[^}]*// if \\(ids\\.length === 0\\) \\{[^}]*return \\[\\];\\s*\\}\\s*const records = await this\\.dao\\.${daoModel}\\.findMany\\(\\{[^}]*where: \\{ id: \\{ in: ids \\}, orgId \\}[^}]*\\}\\);\\s*return records\\.map\\([^)]+\\);\\s*\\} catch \\(error\\) \\{[^}]+\\}\\s*\\})`,
    's'
  );

  const replacement = `async createMany(orgId: OrgId, items: Array<${entityName.replace(/Repository$/, '').replace(/Dao$/, '')}Input>): Promise<${entityName}[]> {
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

  // Try a simpler pattern match
  const simplePattern = /(\/\/ Fetch created records\s*\/\/ Note: createMany doesn't return created records[^\n]*\n[^\n]*\n[^\n]*\n\s*return \[\];\s*\n\s*\}\s*\n\s*const records = await this\.dao\.\w+\.findMany\(\{\s*where: \{ id: \{ in: ids \}, orgId \},\s+\}\);)/s;

  if (simplePattern.test(content)) {
    // Find the input type name
    const inputTypeMatch = content.match(/Array<(\w+Input)>/);
    const inputType = inputTypeMatch ? inputTypeMatch[1] : `${entityName.replace(/Repository$/, '').replace(/Dao$/, '')}Input`;

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

    content = content.replace(simplePattern, newCode);
    modified = true;
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
