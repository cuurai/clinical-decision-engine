#!/usr/bin/env node

/**
 * Route Audit Script
 *
 * Tests all UI routes defined in dashboard/src/types/services.ts
 * Generates a comprehensive gap analysis report
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://34.136.153.216/api';
const ORG_ID = process.env.ORG_ID || 'test-org';
const REPORT_FILE = process.env.REPORT_FILE || `/tmp/route-audit-report-${Date.now()}.txt`;

// Read services configuration
const servicesPath = join(rootDir, 'dashboard/src/types/services.ts');
const servicesContent = readFileSync(servicesPath, 'utf-8');

// Extract services array using regex (simple approach)
const servicesMatch = servicesContent.match(/export const services: Service\[\] = (\[[\s\S]*?\]);/);
if (!servicesMatch) {
  console.error('❌ Could not parse services.ts');
  process.exit(1);
}

// Parse services (simplified - assumes valid TypeScript)
const servicesCode = servicesMatch[1];
const routes = [];

// Extract service IDs and resource paths
const serviceMatches = [...servicesCode.matchAll(/id:\s*"([^"]+)",[\s\S]*?resources:\s*\[([\s\S]*?)\]/g)];

for (const serviceMatch of serviceMatches) {
  const serviceId = serviceMatch[1];
  const resourcesCode = serviceMatch[2];

  // Extract resource paths
  const resourceMatches = [...resourcesCode.matchAll(/id:\s*"([^"]+)",[\s\S]*?path:\s*"([^"]+)"/g)];

  for (const resourceMatch of resourceMatches) {
    const resourceId = resourceMatch[1];
    const resourcePath = resourceMatch[2];
    routes.push({
      serviceId,
      resourceId,
      path: resourcePath,
      fullPath: `${serviceId}${resourcePath}`,
    });
  }
}

console.log(`Found ${routes.length} routes to test\n`);

// Test each route
const results = {
  success: [],
  notFound: [],
  serverError: [],
  otherError: [],
};

let report = `=== Clinical Decision Engine Route Audit ===
Date: ${new Date().toISOString()}
Base URL: ${BASE_URL}
Total Routes: ${routes.length}

`;

console.log(`Testing ${routes.length} routes...\n`);

for (let i = 0; i < routes.length; i++) {
  const route = routes[i];
  const url = `${BASE_URL}/${route.fullPath}`;
  const progress = `[${i + 1}/${routes.length}]`;

  process.stdout.write(`${progress} Testing: ${route.fullPath}... `);

  try {
    const curlCmd = `curl -s -w "\\n%{http_code}" -H "X-Org-Id: ${ORG_ID}" "${url}" 2>&1`;
    const response = execSync(curlCmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    const lines = response.trim().split('\n');
    const httpCode = parseInt(lines[lines.length - 1], 10);
    const body = lines.slice(0, -1).join('\n');

    if (httpCode === 200) {
      if (body.includes('"items"') || body.includes('"data"')) {
        console.log('✅ OK');
        report += `✅ ${route.fullPath} - HTTP ${httpCode}\n`;
        results.success.push(route);
      } else {
        console.log('⚠️  OK (no data structure)');
        report += `⚠️  ${route.fullPath} - HTTP ${httpCode} (no data structure)\n`;
        results.success.push(route);
      }
    } else if (httpCode === 404) {
      console.log('❌ NOT FOUND');
      report += `❌ ${route.fullPath} - HTTP ${httpCode}\n`;
      results.notFound.push(route);
    } else if (httpCode === 500) {
      let errorMsg = 'Unknown error';
      try {
        const json = JSON.parse(body);
        errorMsg = json.message || json.error || errorMsg;
      } catch (e) {
        errorMsg = body.substring(0, 100);
      }
      console.log(`💥 SERVER ERROR: ${errorMsg.substring(0, 50)}`);
      report += `💥 ${route.fullPath} - HTTP ${httpCode} - ${errorMsg}\n`;
      results.serverError.push(route);
    } else {
      console.log(`⚠️  HTTP ${httpCode}`);
      report += `⚠️  ${route.fullPath} - HTTP ${httpCode}\n`;
      results.otherError.push(route);
    }

    // Rate limiting
    if (i < routes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
    report += `💥 ${route.fullPath} - ERROR: ${error.message}\n`;
    results.otherError.push(route);
  }
}

// Generate summary
const total = routes.length;
const success = results.success.length;
const notFound = results.notFound.length;
const serverError = results.serverError.length;
const otherError = results.otherError.length;

report += `\n=== Summary ===
Total Routes: ${total}
✅ Success (200): ${success} (${Math.round(success * 100 / total)}%)
❌ Not Found (404): ${notFound} (${Math.round(notFound * 100 / total)}%)
💥 Server Error (500): ${serverError} (${Math.round(serverError * 100 / total)}%)
⚠️  Other Errors: ${otherError} (${Math.round(otherError * 100 / total)}%)

`;

if (results.notFound.length > 0) {
  report += `=== Routes Not Found (404) ===\n`;
  results.notFound.forEach(route => {
    report += `  - ${route.fullPath} (${route.serviceId}/${route.resourceId})\n`;
  });
  report += '\n';
}

if (results.serverError.length > 0) {
  report += `=== Routes with Server Errors (500) ===\n`;
  results.serverError.forEach(route => {
    report += `  - ${route.fullPath} (${route.serviceId}/${route.resourceId})\n`;
  });
  report += '\n';
}

if (results.otherError.length > 0) {
  report += `=== Routes with Other Errors ===\n`;
  results.otherError.forEach(route => {
    report += `  - ${route.fullPath} (${route.serviceId}/${route.resourceId})\n`;
  });
  report += '\n';
}

// Write report
const fs = await import('fs');
fs.writeFileSync(REPORT_FILE, report);

console.log(`\n=== Summary ===`);
console.log(`Total Routes: ${total}`);
console.log(`✅ Success (200): ${success} (${Math.round(success * 100 / total)}%)`);
console.log(`❌ Not Found (404): ${notFound} (${Math.round(notFound * 100 / total)}%)`);
console.log(`💥 Server Error (500): ${serverError} (${Math.round(serverError * 100 / total)}%)`);
console.log(`⚠️  Other Errors: ${otherError} (${Math.round(otherError * 100 / total)}%)`);
console.log(`\nFull report saved to: ${REPORT_FILE}`);
