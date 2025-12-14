#!/usr/bin/env node
/**
 * Seed test data for Decision Intelligence service using Faker
 *
 * Usage: node scripts/seed-decision-data.js [count]
 * Example: node scripts/seed-decision-data.js 10
 */

import { faker } from '@faker-js/faker';
import { PrismaClient } from '../platform/adapters/src/decision-intelligence/prisma/generated/index.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Helper to generate ULID-like ID (format: XX_<ULID>)
function generateId(prefix = 'DR') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}${random}`.substring(0, 33);
}

// Generate test decision sessions
async function createDecisionSessions(count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} decision sessions...`);
  const sessions = [];

  for (let i = 0; i < count; i++) {
    const sessionId = generateId('DS');
    const patientId = generateId('PT'); // Mock patient ID

    const session = {
      id: sessionId,
      orgId,
      patientId,
      encounterId: generateId('EN'), // Mock encounter ID
      status: faker.helpers.arrayElement(['active', 'completed', 'cancelled']),
      metadata: JSON.stringify({ source: 'test-data', createdBy: 'seed-script' })
    };

    try {
      const created = await prisma.decisionSessionInput.create({
        data: session
      });
      sessions.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating session ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${sessions.length} decision sessions`);
  return sessions;
}

// Generate test decision requests
async function createDecisionRequests(sessions, count = 15, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} decision requests...`);
  const requests = [];

  for (let i = 0; i < count; i++) {
    const session = faker.helpers.arrayElement(sessions);
    const requestId = generateId('DR');

    const request = {
      id: requestId,
      orgId,
      decisionSessionId: session.id,
      patientId: session.patientId,
      requestType: faker.helpers.arrayElement(['diagnostic', 'treatment', 'risk_assessment', 'pathway_selection']),
      context: JSON.stringify({
        chiefComplaint: faker.helpers.arrayElement([
          'Chest pain',
          'Shortness of breath',
          'Headache',
          'Abdominal pain',
          'Fever',
          'Fatigue',
          'Dizziness',
          'Nausea'
        ]),
        symptoms: faker.helpers.arrayElements([
          'Pain', 'Nausea', 'Dizziness', 'Weakness', 'Cough', 'Fever', 'Chills'
        ], { min: 1, max: 3 }),
        urgency: faker.helpers.arrayElement(['low', 'medium', 'high']),
        age: faker.number.int({ min: 25, max: 85 }),
        gender: faker.helpers.arrayElement(['male', 'female', 'other'])
      }),
      priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent']),
      metadata: JSON.stringify({ source: 'test-data', createdBy: 'seed-script' })
    };

    try {
      const created = await prisma.decisionRequestInput.create({
        data: request
      });
      requests.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating request ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${requests.length} decision requests`);
  return requests;
}

// Generate test decision results
async function createDecisionResults(requests, sessions, count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} decision results...`);
  const results = [];

  for (let i = 0; i < count && i < requests.length; i++) {
    const request = requests[i];
    const session = sessions.find(s => s.id === request.decisionSessionId) || sessions[0];
    const resultId = generateId('DS');

    const result = {
      id: resultId,
      orgId,
      decisionRequestId: request.id,
      decisionSessionId: session.id,
      status: faker.helpers.arrayElement(['active', 'resolved', 'overridden']),
      result: JSON.stringify({
        confidence: faker.number.float({ min: 0.5, max: 1.0, fractionDigits: 2 }),
        reasoning: faker.lorem.sentence(),
        diagnosis: faker.helpers.arrayElement([
          'Essential hypertension',
          'Type 2 diabetes mellitus',
          'Chronic obstructive pulmonary disease',
          'Chronic ischemic heart disease',
          'Acute myocardial infarction',
          'Pneumonia',
          'Urinary tract infection'
        ]),
        severity: faker.helpers.arrayElement(['mild', 'moderate', 'severe']),
        recommendations: [
          faker.helpers.arrayElement(['Order lab tests', 'Prescribe medication', 'Schedule follow-up'])
        ]
      }),
      metadata: JSON.stringify({ source: 'test-data', model: 'test-model-v1', version: '1.0.0' })
    };

    try {
      const created = await prisma.decisionResultInput.create({
        data: result
      });
      results.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating result ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${results.length} decision results`);
  return results;
}

// Generate test recommendations
async function createRecommendations(results, count = 15, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} recommendations...`);
  const recommendations = [];

  const recommendationTypes = ['diagnostic', 'treatment', 'monitoring', 'follow_up', 'documentation', 'other'];
  const recommendationsList = [
    'Order complete blood count',
    'Prescribe antibiotic therapy',
    'Schedule follow-up in 2 weeks',
    'Order chest X-ray',
    'Start blood pressure medication',
    'Refer to cardiology',
    'Monitor vital signs every 4 hours',
    'Order ECG',
    'Start statin therapy',
    'Schedule stress test'
  ];

  for (let i = 0; i < count; i++) {
    const result = i < results.length ? results[i] : null;
    const recommendationId = generateId('RC');

    const recommendation = {
      id: recommendationId,
      orgId,
      decisionResultId: result?.id || null,
      recommendationType: faker.helpers.arrayElement(recommendationTypes),
      title: faker.helpers.arrayElement(recommendationsList),
      description: faker.lorem.sentence(),
      suggestion: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['active', 'accepted', 'rejected', 'overridden']),
      metadata: JSON.stringify({ source: 'test-data', evidenceLevel: faker.helpers.arrayElement(['A', 'B', 'C', 'D']) })
    };

    try {
      const created = await prisma.recommendationInput.create({
        data: recommendation
      });
      recommendations.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating recommendation ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${recommendations.length} recommendations`);
  return recommendations;
}

// Generate test risk assessments
async function createRiskAssessments(sessions, count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} risk assessments...`);
  const assessments = [];

  for (let i = 0; i < count; i++) {
    const session = faker.helpers.arrayElement(sessions);
    const assessmentId = generateId('RA');

    const assessment = {
      id: assessmentId,
      orgId,
      patientId: session.patientId,
      riskType: faker.helpers.arrayElement(['mortality', 'readmission', 'complication', 'disease_progression', 'other']),
      score: faker.number.float({ min: 0.0, max: 1.0, fractionDigits: 3 }),
      scoreInterpretation: faker.helpers.arrayElement(['low', 'moderate', 'high', 'critical']),
      factors: faker.helpers.arrayElements([
        'Age', 'Comorbidities', 'Lab values', 'Vital signs', 'Medication history', 'Previous admissions'
      ], { min: 2, max: 5 }),
      metadata: JSON.stringify({ source: 'test-data', model: 'risk-model-v1', version: '2.0.0' })
    };

    try {
      const created = await prisma.riskAssessmentInput.create({
        data: assessment
      });
      assessments.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating risk assessment ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${assessments.length} risk assessments`);
  return assessments;
}

// Generate test explanations
async function createExplanations(results, count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} explanations...`);
  const explanations = [];

  for (let i = 0; i < count && i < results.length; i++) {
    const result = results[i];
    const explanationId = generateId('EX');

    const explanation = {
      id: explanationId,
      orgId,
      explanationType: faker.helpers.arrayElement(['feature_importance', 'rule_trace', 'evidence_summary', 'model_reasoning']),
      content: JSON.stringify({
        summary: faker.lorem.paragraph(),
        features: [
          { name: 'Age', importance: faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 2 }) },
          { name: 'Blood Pressure', importance: faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 2 }) },
          { name: 'Lab Values', importance: faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 2 }) }
        ],
        reasoning: faker.lorem.sentences(3)
      }),
      metadata: JSON.stringify({ source: 'test-data' })
    };

    try {
      const created = await prisma.explanationInput.create({
        data: explanation
      });
      explanations.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating explanation ${i + 1}:`, error.message.substring(0, 100));
    }
  }

  console.log(`\n✅ Created ${explanations.length} explanations`);
  return explanations;
}

// Main function
async function main() {
  const count = parseInt(process.argv[2]) || 10;
  const orgId = process.env.ORG_ID || 'test-org';

  console.log('🌱 Starting Decision Intelligence test data seeding...');
  console.log(`   Count: ${count} entities per type`);
  console.log(`   Org ID: ${orgId}`);
  console.log(`   Database: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Create test data
    const sessions = await createDecisionSessions(count, orgId);
    const decisionRequests = await createDecisionRequests(sessions, count, orgId);
    const decisionResults = await createDecisionResults(decisionRequests, sessions, Math.floor(count * 0.7), orgId);
    const recommendations = await createRecommendations(decisionResults, count, orgId);
    const riskAssessments = await createRiskAssessments(sessions, count, orgId);
    const explanations = await createExplanations(decisionResults, count, orgId);

    console.log('\n✨ Test data seeding completed!');
    console.log(`\n📊 Summary:`);
    console.log(`   Decision Sessions: ${sessions.length}`);
    console.log(`   Decision Requests: ${decisionRequests.length}`);
    console.log(`   Decision Results: ${decisionResults.length}`);
    console.log(`   Recommendations: ${recommendations.length}`);
    console.log(`   Risk Assessments: ${riskAssessments.length}`);
    console.log(`   Explanations: ${explanations.length}`);

    console.log('\n✅ Test data is ready! You can now query the APIs:');
    console.log('   curl http://localhost:3001/decision-requests -H "X-Org-Id: test-org"');
    console.log('   curl http://localhost:3001/decision-results -H "X-Org-Id: test-org"');
    console.log('   curl http://localhost:3001/recommendations -H "X-Org-Id: test-org"');

  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
