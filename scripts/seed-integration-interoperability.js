#!/usr/bin/env node
/**
 * Seed test data for Integration & Interoperability service using Faker
 *
 * Usage: node scripts/seed-integration-interoperability.js [count]
 * Example: node scripts/seed-integration-interoperability.js 10
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
function generateId(prefix = 'II') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}${random}`.substring(0, 33);
}

// Generate test external systems
async function createExternalSystems(count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} external systems...`);
  const systems = [];

  const systemTypes = ['ehr', 'lis', 'ris', 'pms', 'hie', 'payer', 'other'];
  const systemNames = [
    'Epic MyChart',
    'Cerner PowerChart',
    'Allscripts',
    'NextGen',
    'eClinicalWorks',
    'Athenahealth',
    'Meditech',
    'GE Centricity'
  ];

  for (let i = 0; i < count; i++) {
    const systemId = generateId('ES');

    const system = {
      id: systemId,
      orgId,
      name: faker.helpers.arrayElement(systemNames),
      description: faker.lorem.sentence(),
      systemType: faker.helpers.arrayElement(systemTypes),
      vendor: faker.company.name(),
      version: faker.system.semver(),
      metadata: JSON.stringify({
        status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
        integrationDate: faker.date.past().toISOString(),
        source: 'test-data'
      })
    };

    try {
      const created = await prisma.externalSystemInput.create({
        data: system
      });
      systems.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating system ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${systems.length} external systems`);
  return systems;
}

// Generate test API clients
async function createAPIClients(count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} API clients...`);
  const clients = [];

  for (let i = 0; i < count; i++) {
    const clientId = generateId('AC');

    const client = {
      id: clientId,
      orgId,
      name: `${faker.company.name()} API Client`,
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(['active', 'inactive']),
      rateLimit: faker.number.int({ min: 100, max: 10000 }),
      metadata: JSON.stringify({
        environment: faker.helpers.arrayElement(['production', 'staging', 'development']),
        createdBy: 'seed-script',
        source: 'test-data'
      })
    };

    try {
      const created = await prisma.aPIClientInput.create({
        data: client
      });
      clients.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating API client ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${clients.length} API clients`);
  return clients;
}

// Generate test connections
async function createConnections(systems, count = 15, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} connections...`);
  const connections = [];

  const protocols = ['fhir', 'hl7', 'rest', 'soap', 'other'];
  const profiles = ['FHIR R4', 'HL7 v2.5', 'HL7 v3', 'REST API v2', 'SOAP 1.2'];

  for (let i = 0; i < count; i++) {
    const system = faker.helpers.arrayElement(systems);
    const connectionId = generateId('CN');

    const connection = {
      id: connectionId,
      orgId,
      externalSystemId: system.id,
      name: `Connection to ${system.name}`,
      description: faker.lorem.sentence(),
      baseUrl: faker.internet.url(),
      protocol: faker.helpers.arrayElement(protocols),
      profile: faker.helpers.arrayElement(profiles),
      credentials: JSON.stringify({
        authType: faker.helpers.arrayElement(['basic', 'oauth2', 'api_key', 'certificate']),
        endpoint: faker.internet.url()
      }),
      status: faker.helpers.arrayElement(['active', 'snoozed', 'resolved']),
      metadata: JSON.stringify({
        lastTested: faker.date.recent().toISOString(),
        source: 'test-data'
      })
    };

    try {
      const created = await prisma.connectionInput.create({
        data: connection
      });
      connections.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating connection ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${connections.length} connections`);
  return connections;
}

// Generate test API credentials
async function createAPICredentials(clients, count = 15, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} API credentials...`);
  const credentials = [];

  const credentialTypes = ['api_key', 'oauth_client', 'certificate'];

  for (let i = 0; i < count; i++) {
    const client = faker.helpers.arrayElement(clients);
    const credentialId = generateId('CR');

    const credential = {
      id: credentialId,
      orgId,
      apiClientId: client.id,
      credentialType: faker.helpers.arrayElement(credentialTypes),
      keyId: generateId('KY'),
      secret: faker.string.alphanumeric(32),
      expiresAt: faker.date.future(),
      metadata: JSON.stringify({
        createdBy: 'seed-script',
        source: 'test-data'
      })
    };

    try {
      const created = await prisma.aPICredentialInput.create({
        data: credential
      });
      credentials.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating credential ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${credentials.length} API credentials`);
  return credentials;
}

// Main function
async function main() {
  const count = parseInt(process.argv[2]) || 10;
  const orgId = process.env.ORG_ID || 'test-org';

  console.log('🌱 Starting Integration & Interoperability test data seeding...');
  console.log(`   Count: ${count} entities per type`);
  console.log(`   Org ID: ${orgId}`);
  console.log(`   Database: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Create test data
    const systems = await createExternalSystems(count, orgId);
    const clients = await createAPIClients(count, orgId);
    const connections = await createConnections(systems, Math.floor(count * 1.5), orgId);
    const credentials = await createAPICredentials(clients, Math.floor(count * 1.5), orgId);

    console.log('\n✨ Test data seeding completed!');
    console.log(`\n📊 Summary:`);
    console.log(`   External Systems: ${systems.length}`);
    console.log(`   API Clients: ${clients.length}`);
    console.log(`   Connections: ${connections.length}`);
    console.log(`   API Credentials: ${credentials.length}`);

    console.log('\n✅ Test data is ready! You can now query the APIs:');
    console.log('   curl http://34.136.153.216/api/integration-interoperability/external-systems -H "X-Org-Id: test-org"');
    console.log('   curl http://34.136.153.216/api/integration-interoperability/api-clients -H "X-Org-Id: test-org"');

  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
