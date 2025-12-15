#!/usr/bin/env node
/**
 * Fix duplicate catch blocks
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

  // Fix duplicate catch blocks: } catch (error) { ... } catch (error) { ... }
  const duplicateCatchPattern = /(\} catch \(error\) \{[\s\S]*?handleDatabaseError\(error\);[\s\S]*?throw error;[\s\S]*?\})\s+\} catch \(error\) \{[\s\S]*?handleDatabaseError\(error\);[\s\S]*?throw error;[\s\S]*?\}/g;
  
  if (duplicateCatchPattern.test(content)) {
    content = content.replace(duplicateCatchPattern, '$1');
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
