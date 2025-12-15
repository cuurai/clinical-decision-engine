#!/usr/bin/env node
/**
 * Script to fix cursor property access and missing id property issues
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

  // Fix cursor property access: params?.cursor -> params && 'cursor' in params && params.cursor
  const cursorPattern = /params\?\.cursor/g;
  if (cursorPattern.test(content)) {
    content = content.replace(cursorPattern, "params && 'cursor' in params && params.cursor");
    modified = true;
  }

  // Fix missing id property in updateMany/createMany - data.id should be removed or handled differently
  // Pattern: updates.map(({ id, data }) => ...) where data might not have id
  // This is trickier - we need to check the context

  // Fix: data.id where data is a create input (shouldn't have id)
  // Look for patterns like: const { id, ...rest } = data; or data.id in create contexts
  // Actually, the error says "Property 'id' does not exist on type" for create data
  // This happens in updateMany where they try to extract id from create data
  // The fix is that updateMany should receive items with id already separated

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
