#!/usr/bin/env node
/**
 * Remove redundant throw statements after handleDatabaseError calls
 * Since handleDatabaseError already throws (returns never), the throw after it is unreachable
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Remove redundant throw error; after handleDatabaseError(error);
  // Pattern: handleDatabaseError(error);\n      throw error;
  content = content.replace(
    /handleDatabaseError\(error\);\s*\n\s*throw error;/g,
    'handleDatabaseError(error);'
  );

  if (content !== originalContent) {
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
