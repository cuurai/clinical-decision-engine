import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const mappings = {
  'openapi-decision-intelligence.yaml': {
    response: 'DecApiResponse',
    listResponse: 'DecApiListResponse',
  },
  'openapi-integration-interoperability.yaml': {
    response: 'IntApiResponse',
    listResponse: 'IntApiListResponse',
  },
  'openapi-knowledge-evidence.yaml': {
    response: 'KnoApiResponse',
    listResponse: 'KnoApiListResponse',
  },
  'openapi-patient-clinical-data.yaml': {
    response: 'PatApiResponse',
    listResponse: 'PatApiListResponse',
  },
  'openapi-workflow-care-pathways.yaml': {
    response: 'WorApiResponse',
    listResponse: 'WorApiListResponse',
  },
};

function isListResponse(schema) {
  return schema && (schema.type === 'array' || (schema.items && schema.items.$ref));
}

function wrapSchema(schema, responseName, listResponseName) {
  // Already wrapped
  if (schema.allOf) {
    return schema;
  }

  // List response
  if (isListResponse(schema)) {
    return {
      allOf: [
        { $ref: `#/components/schemas/${listResponseName}` },
        {
          type: 'object',
          properties: {
            data: schema.type === 'array' ? { type: 'array', items: schema.items } : schema,
          },
        },
      ],
    };
  }

  // Single response
  if (schema.$ref) {
    return {
      allOf: [
        { $ref: `#/components/schemas/${responseName}` },
        {
          type: 'object',
          properties: { data: schema },
        },
      ],
    };
  }

  return schema;
}

async function fixFile(filename, config) {
  const filepath = path.join('openapi', filename);
  console.log(`Processing ${filename}...`, '');

  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    let spec = YAML.parse(content);

    let count = 0;
    for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (method.startsWith('x-') || method === 'parameters' || typeof operation !== 'object') {
          continue;
        }

        const responses = operation.responses || {};
        for (const status of ['200', '201', '204']) {
          if (!responses[status]) continue;

          const response = responses[status];
          if (!response.content?.['application/json']?.schema) continue;

          const schema = response.content['application/json'].schema;
          const wrapped = wrapSchema(schema, config.response, config.listResponse);

          if (wrapped !== schema) {
            response.content['application/json'].schema = wrapped;
            count++;
          }
        }
      }
    }

    // Write back as YAML
    const output = YAML.stringify(spec, { defaultKeyType: 'block', blockQuote: 'strip' });
    fs.writeFileSync(filepath, output);

    console.log(`✓ Wrapped ${count} responses`);
    return true;
  } catch (err) {
    console.log(`✗ Error: ${err.message.substring(0, 60)}`);
    return false;
  }
}

async function main() {
  for (const [filename, config] of Object.entries(mappings)) {
    await fixFile(filename, config);
  }
}

main().catch(console.error);
