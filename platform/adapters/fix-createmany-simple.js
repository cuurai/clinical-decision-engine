#!/usr/bin/env node
/**
 * Simple script to fix broken createMany methods
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');

  if (!content.includes("Note: createMany doesn't return created records")) {
    return false;
  }

  // Extract entity name, DAO model, and input type
  const entityMatch = content.match(/Promise<(\w+)\[\]>/);
  const daoMatch = content.match(/this\.dao\.(\w+)\.createMany/);
  const inputMatch = content.match(/Array<(\w+Input)>/);

  if (!entityMatch || !daoMatch || !inputMatch) {
    console.log(`Skipping ${filePath} - couldn't extract types`);
    return false;
  }

  const entity = entityMatch[1];
  const daoModel = daoMatch[1];
  const inputType = inputMatch[1];

  // Find the broken section - from "// Fetch created records" to "return records.map"
  const startMarker = "// Fetch created records";
  const endMarker = "return records.map((r: any) => this.toDomain(r));";

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.log(`Skipping ${filePath} - couldn't find markers`);
    return false;
  }

  // Find the start of the createMany method
  const methodStart = content.lastIndexOf("async createMany", startIdx);
  if (methodStart === -1) {
    console.log(`Skipping ${filePath} - couldn't find method start`);
    return false;
  }

  // Find where the try block starts
  const tryStart = content.indexOf("try {", methodStart);
  if (tryStart === -1) {
    console.log(`Skipping ${filePath} - couldn't find try block`);
    return false;
  }

  // Find the end of the catch block
  const catchEnd = content.indexOf("}", endIdx + endMarker.length);
  if (catchEnd === -1) {
    console.log(`Skipping ${filePath} - couldn't find catch end`);
    return false;
  }

  // Extract the method signature
  const methodSigMatch = content.substring(methodStart, tryStart).match(/async createMany\([^)]+\): Promise<[^>]+>/);
  if (!methodSigMatch) {
    console.log(`Skipping ${filePath} - couldn't find method signature`);
    return false;
  }

  // Replace the entire method body
  const beforeMethod = content.substring(0, tryStart);
  const afterMethod = content.substring(catchEnd + 1);

  const newMethodBody = `try {
      // Use transaction with individual creates to get created records with IDs
      return await this.transactionManager.executeInTransaction(async (tx) => {
        const results: ${entity}[] = [];
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
    }`;

  const newContent = beforeMethod + newMethodBody + afterMethod;

  writeFileSync(filePath, newContent, 'utf-8');
  console.log(`Fixed: ${filePath}`);
  return true;
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
