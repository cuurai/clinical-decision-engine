#!/usr/bin/env node
/**
 * Fix duplicate catch blocks - simple pattern match
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

  // Simple pattern: } catch (error) { ... } catch (error) { ... }
  // Replace with just one catch block
  content = content.replace(
    /(\} catch \(error\) \{[\s\S]*?handleDatabaseError\(error\);[\s\S]*?throw error;[\s\S]*?\})\s*\} catch \(error\) \{[\s\S]*?handleDatabaseError\(error\);[\s\S]*?throw error;[\s\S]*?\}/g,
    '$1'
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
