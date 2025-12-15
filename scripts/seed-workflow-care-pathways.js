#!/usr/bin/env node
/**
 * Seed test data for Workflow & Care Pathways service using Faker
 *
 * Usage: node scripts/seed-workflow-care-pathways.js [count]
 * Example: node scripts/seed-workflow-care-pathways.js 10
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
function generateId(prefix = 'WF') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}${random}`.substring(0, 33);
}

// Generate test workflow definitions
async function createWorkflowDefinitions(count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} workflow definitions...`);
  const definitions = [];

  const categories = [
    'chronic_disease_management',
    'acute_care',
    'preventive_care',
    'care_coordination',
    'medication_management',
    'diagnostic_pathway',
    'treatment_pathway',
    'discharge_planning'
  ];

  const workflowNames = [
    'Diabetes Management Pathway',
    'Hypertension Care Pathway',
    'Post-Surgical Recovery',
    'Chronic Pain Management',
    'Heart Failure Pathway',
    'COPD Management',
    'Cancer Treatment Pathway',
    'Mental Health Care Pathway',
    'Pediatric Growth Monitoring',
    'Elderly Fall Prevention'
  ];

  for (let i = 0; i < count; i++) {
    const definitionId = generateId('WD');

    const definition = {
      id: definitionId,
      orgId,
      name: faker.helpers.arrayElement(workflowNames),
      description: faker.lorem.paragraph(),
      category: faker.helpers.arrayElement(categories),
      version: faker.system.semver(),
      metadata: JSON.stringify({
        author: faker.person.fullName(),
        lastReviewed: faker.date.recent().toISOString(),
        evidenceLevel: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
        source: 'test-data'
      })
    };

    try {
      const created = await prisma.workflowDefinitionInput.create({
        data: definition
      });
      definitions.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating workflow definition ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${definitions.length} workflow definitions`);
  return definitions;
}

// Generate test workflow instances
async function createWorkflowInstances(definitions, count = 20, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} workflow instances...`);
  const instances = [];

  for (let i = 0; i < count; i++) {
    const definition = faker.helpers.arrayElement(definitions);
    const instanceId = generateId('WI');
    const patientId = generateId('PT');
    const encounterId = generateId('EN');
    const episodeId = generateId('EP');

    const instance = {
      id: instanceId,
      orgId,
      workflowDefinitionId: definition.id,
      patientId,
      encounterId,
      episodeOfCareId: episodeId,
      status: faker.helpers.arrayElement(['active', 'resolved', 'snoozed']),
      metadata: JSON.stringify({
        startedBy: faker.person.fullName(),
        startDate: faker.date.recent().toISOString(),
        source: 'test-data'
      })
    };

    try {
      const created = await prisma.workflowInstanceInput.create({
        data: instance
      });
      instances.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating workflow instance ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${instances.length} workflow instances`);
  return instances;
}

// Generate test tasks
async function createTasks(instances, count = 30, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} tasks...`);
  const tasks = [];

  const taskTypes = ['medication', 'procedure', 'lab_order', 'appointment', 'education', 'other'];
  const taskTitles = [
    'Schedule follow-up appointment',
    'Order lab tests',
    'Review medication list',
    'Patient education on condition',
    'Refer to specialist',
    'Update care plan',
    'Monitor vital signs',
    'Review imaging results'
  ];

  for (let i = 0; i < count; i++) {
    const instance = faker.helpers.arrayElement(instances);
    const taskId = generateId('TK');
    const carePlanId = generateId('CP');

    const task = {
      id: taskId,
      orgId,
      carePlanId,
      workflowInstanceId: instance.id,
      patientId: instance.patientId,
      title: faker.helpers.arrayElement(taskTitles),
      description: faker.lorem.sentence(),
      taskType: faker.helpers.arrayElement(taskTypes),
      status: faker.helpers.arrayElement(['active', 'resolved', 'snoozed']),
      priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent']),
      dueDate: faker.date.future(),
      assignedTo: faker.person.fullName(),
      metadata: JSON.stringify({
        createdBy: faker.person.fullName(),
        source: 'test-data'
      })
    };

    try {
      const created = await prisma.taskInput.create({
        data: task
      });
      tasks.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating task ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${tasks.length} tasks`);
  return tasks;
}

// Generate test care plans
async function createCarePlans(instances, definitions, count = 20, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} care plans...`);
  const carePlans = [];

  for (let i = 0; i < count; i++) {
    const instance = faker.helpers.arrayElement(instances);
    const definition = definitions.find(d => d.id === instance.workflowDefinitionId) || definitions[0];
    const carePlanId = generateId('CP');
    const episodeId = generateId('EP');

    const carePlan = {
      id: carePlanId,
      orgId,
      patientId: instance.patientId,
      episodeOfCareId: episodeId,
      carePathwayTemplateId: definition.id,
      title: `Care Plan for ${definition.name}`,
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['active', 'resolved', 'snoozed']),
      startDate: faker.date.recent(),
      metadata: JSON.stringify({
        createdBy: faker.person.fullName(),
        source: 'test-data'
      })
    };

    try {
      const created = await prisma.carePlanInput.create({
        data: carePlan
      });
      carePlans.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating care plan ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${carePlans.length} care plans`);
  return carePlans;
}

// Main function
async function main() {
  const count = parseInt(process.argv[2]) || 10;
  const orgId = process.env.ORG_ID || 'test-org';

  console.log('🌱 Starting Workflow & Care Pathways test data seeding...');
  console.log(`   Count: ${count} entities per type`);
  console.log(`   Org ID: ${orgId}`);
  console.log(`   Database: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Create test data
    const definitions = await createWorkflowDefinitions(count, orgId);
    const instances = await createWorkflowInstances(definitions, Math.floor(count * 2), orgId);
    const carePlans = await createCarePlans(instances, definitions, Math.floor(count * 2), orgId);
    const tasks = await createTasks(instances, Math.floor(count * 3), orgId);

    console.log('\n✨ Test data seeding completed!');
    console.log(`\n📊 Summary:`);
    console.log(`   Workflow Definitions: ${definitions.length}`);
    console.log(`   Workflow Instances: ${instances.length}`);
    console.log(`   Care Plans: ${carePlans.length}`);
    console.log(`   Tasks: ${tasks.length}`);

    console.log('\n✅ Test data is ready! You can now query the APIs:');
    console.log('   curl http://34.136.153.216/api/workflow-care-pathways/workflow-definitions -H "X-Org-Id: test-org"');
    console.log('   curl http://34.136.153.216/api/workflow-care-pathways/workflow-instances -H "X-Org-Id: test-org"');
    console.log('   curl http://34.136.153.216/api/workflow-care-pathways/tasks -H "X-Org-Id: test-org"');

  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
