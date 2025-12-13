import fs from 'fs';
import path from 'path';

const CONFIGS = {
  'openapi/openapi-decision-intelligence.yaml': {
    responseSchema: 'DecApiResponse',
    listResponseSchema: 'DecApiListResponse',
  },
  'openapi/openapi-integration-interoperability.yaml': {
    responseSchema: 'IntApiResponse',
    listResponseSchema: 'IntApiListResponse',
  },
  'openapi/openapi-knowledge-evidence.yaml': {
    responseSchema: 'KnoApiResponse',
    listResponseSchema: 'KnoApiListResponse',
  },
  'openapi/openapi-patient-clinical-data.yaml': {
    responseSchema: 'PatApiResponse',
    listResponseSchema: 'PatApiListResponse',
  },
  'openapi/openapi-workflow-care-pathways.yaml': {
    responseSchema: 'WorApiResponse',
    listResponseSchema: 'WorApiListResponse',
  },
};

function wrapResponses(filePath, config) {
  console.log(`Processing ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let wrapped = 0;
  
  // Pattern 1: List responses - type: array with items: $ref
  const listPattern = /(\s+)schema:\s*\n\s+type:\s*array\s*\n\s+items:\s*\n\s+(\$ref:.*?)(?=\n\s{2,}(?:404|400|500|"|\w+:))/gm;
  
  content = content.replace(listPattern, (match, indent, itemsRef) => {
    wrapped++;
    return `${indent}schema:
${indent}  allOf:
${indent}    - $ref: "#/components/schemas/${config.listResponseSchema}"
${indent}    - type: object
${indent}      properties:
${indent}        data:
${indent}          type: array
${indent}          items:
${indent}            ${itemsRef}`;
  });
  
  // Pattern 2: Single object responses - $ref at schema level
  const singlePattern = /(\s+)schema:\s*\n\s+(\$ref:\s*"#\/components\/schemas\/\w+")(?=\n\s{2,}(?:404|400|500|"|\w+:))/gm;
  
  content = content.replace(singlePattern, (match, indent, ref) => {
    // Don't wrap if already wrapped (contains allOf)
    if (match.includes('allOf')) return match;
    
    wrapped++;
    const schemaName = ref.match(/#\/components\/schemas\/(\w+)/)[1];
    return `${indent}schema:
${indent}  allOf:
${indent}    - $ref: "#/components/schemas/${config.responseSchema}"
${indent}    - type: object
${indent}      properties:
${indent}        data:
${indent}          $ref: "#/components/schemas/${schemaName}"`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ Wrapped ${wrapped} responses\n`);
}

// Process all files
console.log('Wrapping OpenAPI responses...\n');
for (const [filePath, config] of Object.entries(CONFIGS)) {
  try {
    wrapResponses(filePath, config);
  } catch (err) {
    console.error(`✗ Error processing ${filePath}: ${err.message}`);
  }
}

console.log('✓ All OpenAPI files wrapped');
