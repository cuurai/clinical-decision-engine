#!/usr/bin/env node
/**
 * Seed test data for Knowledge & Evidence service using Faker
 *
 * Usage: node scripts/seed-knowledge-evidence.js [count]
 * Example: node scripts/seed-knowledge-evidence.js 10
 */

import { faker } from '@faker-js/faker';
import { prisma } from '../packages/database/src/index.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Helper to generate ULID-like ID (format: XX_<ULID>)
function generateId(prefix = 'KE') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}${random}`.substring(0, 33);
}

// Generate test value sets
async function createValueSets(count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} value sets...`);
  const valueSets = [];

  const categories = [
    'diagnosis',
    'medication',
    'procedure',
    'lab_test',
    'vital_signs',
    'allergy',
    'condition',
    'observation'
  ];

  const valueSetNames = [
    'ICD-10-CM Diagnosis Codes',
    'SNOMED CT Clinical Terms',
    'RxNorm Medications',
    'CPT Procedure Codes',
    'LOINC Laboratory Tests',
    'UCUM Units of Measure',
    'HL7 Condition Codes',
    'FHIR Observation Codes'
  ];

  for (let i = 0; i < count; i++) {
    const valueSetId = generateId('VS');

    const valueSet = {
      id: valueSetId,
      orgId,
      name: faker.helpers.arrayElement(valueSetNames),
      description: faker.lorem.paragraph(),
      category: faker.helpers.arrayElement(categories),
      version: faker.system.semver(),
      metadata: JSON.stringify({
        source: faker.helpers.arrayElement(['HL7', 'SNOMED', 'LOINC', 'ICD', 'CPT']),
        lastUpdated: faker.date.recent().toISOString(),
        createdBy: 'seed-script'
      })
    };

    try {
      const created = await prisma.valueSetInput.create({
        data: valueSet
      });
      valueSets.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating value set ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${valueSets.length} value sets`);
  return valueSets;
}

// Generate test value set codes
async function createValueSetCodes(valueSets, count = 50, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} value set codes...`);
  const codes = [];

  const codeSystems = [
    'http://hl7.org/fhir/sid/icd-10-cm',
    'http://snomed.info/sct',
    'http://www.nlm.nih.gov/research/umls/rxnorm',
    'http://www.ama-assn.org/go/cpt',
    'http://loinc.org',
    'http://unitsofmeasure.org'
  ];

  for (let i = 0; i < count; i++) {
    const valueSet = faker.helpers.arrayElement(valueSets);
    const codeId = generateId('CD');

    const code = {
      id: codeId,
      orgId,
      valueSetId: valueSet.id,
      code: faker.string.alphanumeric({ length: { min: 4, max: 10 }, casing: 'upper' }),
      display: faker.lorem.words({ min: 2, max: 5 }),
      system: faker.helpers.arrayElement(codeSystems),
      metadata: JSON.stringify({
        definition: faker.lorem.sentence(),
        source: 'test-data',
        createdBy: 'seed-script'
      })
    };

    try {
      const created = await prisma.valueSetCode.create({
        data: code
      });
      codes.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating code ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${codes.length} value set codes`);
  return codes;
}

// Main function
async function main() {
  const count = parseInt(process.argv[2]) || 10;
  const orgId = process.env.ORG_ID || 'test-org';

  console.log('🌱 Starting Knowledge & Evidence test data seeding...');
  console.log(`   Count: ${count} entities per type`);
  console.log(`   Org ID: ${orgId}`);
  console.log(`   Database: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Create test data
    const valueSets = await createValueSets(count, orgId);
    const codes = await createValueSetCodes(valueSets, Math.floor(count * 5), orgId);

    console.log('\n✨ Test data seeding completed!');
    console.log(`\n📊 Summary:`);
    console.log(`   Value Sets: ${valueSets.length}`);
    console.log(`   Value Set Codes: ${codes.length}`);

    console.log('\n✅ Test data is ready! You can now query the APIs:');
    console.log('   curl http://34.136.153.216/api/knowledge-evidence/value-sets -H "X-Org-Id: test-org"');
    console.log('   curl http://34.136.153.216/api/knowledge-evidence/value-set-codes -H "X-Org-Id: test-org"');

  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
