#!/usr/bin/env node
/**
 * Script to fix implicit any types in DAO repositories
 * Adds explicit type annotations to map callback parameters
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

  // Fix map callbacks: records.map((r) => -> records.map((r: any) =>
  // This is a common pattern in DAO repositories
  const mapPattern = /(\.map\(\(r\)\s*=>)/g;
  if (mapPattern.test(content)) {
    content = content.replace(mapPattern, '.map((r: any) =>');
    modified = true;
  }

  // Fix other common callback patterns
  // .map((item) => -> .map((item: any) =>
  const mapItemPattern = /(\.map\(\(item\)\s*=>)/g;
  if (mapItemPattern.test(content)) {
    content = content.replace(mapItemPattern, '.map((item: any) =>');
    modified = true;
  }

  // .map((record) => -> .map((record: any) =>
  const mapRecordPattern = /(\.map\(\(record\)\s*=>)/g;
  if (mapRecordPattern.test(content)) {
    content = content.replace(mapRecordPattern, '.map((record: any) =>');
    modified = true;
  }

  // Fix forEach callbacks too
  const forEachPattern = /(\.forEach\(\(r\)\s*=>)/g;
  if (forEachPattern.test(content)) {
    content = content.replace(forEachPattern, '.forEach((r: any) =>');
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
