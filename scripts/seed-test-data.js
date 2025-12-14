#!/usr/bin/env node
/**
 * Seed test data into the database using Faker
 *
 * Usage: node scripts/seed-test-data.js [count]
 * Example: node scripts/seed-test-data.js 10
 */

import { faker } from '@faker-js/faker';
import { PrismaClient as DecisionIntelligencePrisma } from '../platform/adapters/src/decision-intelligence/prisma/generated/index.js';
import { PrismaClient as PatientClinicalDataPrisma } from '../platform/adapters/src/patient-clinical-data/prisma/generated/index.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const DECISION_INTELLIGENCE_PRISMA = new DecisionIntelligencePrisma();
const PATIENT_CLINICAL_DATA_PRISMA = new PatientClinicalDataPrisma();

// Helper to generate ULID-like ID (format: XX_<ULID>)
function generateId(prefix = 'PT') {
  // Simple ULID-like generation (in production, use actual ULID library)
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}${random}`.substring(0, 33);
}

// Generate test patients
async function createPatients(count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} patients...`);
  const patients = [];

  for (let i = 0; i < count; i++) {
    const patientId = generateId('PT');
    const gender = faker.helpers.arrayElement(['male', 'female', 'other', 'unknown']);

    const patient = {
      id: patientId,
      orgId,
      patientId: patientId, // Self-reference
      identifiers: [
        JSON.stringify({
          system: 'http://hospital.example.com/patients',
          value: faker.string.numeric(8)
        })
      ],
      name: JSON.stringify({
        given: [faker.person.firstName()],
        family: faker.person.lastName(),
        prefix: [],
        suffix: []
      }),
      gender: gender,
      birthDate: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }),
      address: [
        JSON.stringify({
          use: 'home',
          type: 'both',
          line: [faker.location.streetAddress()],
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          postalCode: faker.location.zipCode(),
          country: 'USA'
        })
      ],
      telecom: [
        JSON.stringify({
          system: 'phone',
          value: faker.phone.number(),
          use: 'home'
        })
      ]
    };

    try {
      const created = await PATIENT_CLINICAL_DATA_PRISMA.patientInput.create({
        data: patient
      });
      patients.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating patient ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${patients.length} patients`);
  return patients;
}

// Generate test encounters
async function createEncounters(patients, count = 20, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} encounters...`);
  const encounters = [];

  for (let i = 0; i < count; i++) {
    const patient = faker.helpers.arrayElement(patients);
    const encounterId = generateId('EN');
    const startDate = faker.date.recent({ days: 30 });
    const endDate = faker.date.between({ from: startDate, to: new Date() });

    const encounter = {
      id: encounterId,
      orgId,
      patientId: patient.id,
      status: faker.helpers.arrayElement(['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled']),
      class: faker.helpers.arrayElement(['inpatient', 'outpatient', 'emergency', 'ambulatory', 'virtual']),
      type: [
        JSON.stringify({
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: faker.helpers.arrayElement(['AMB', 'EMER', 'IMP', 'ACUTE', 'NONAC']),
              display: faker.helpers.arrayElement(['Ambulatory', 'Emergency', 'Inpatient', 'Acute Care'])
            }
          ]
        })
      ],
      period: JSON.stringify({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      })
    };

    try {
      const created = await PATIENT_CLINICAL_DATA_PRISMA.encounterInput.create({
        data: encounter
      });
      encounters.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating encounter ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${encounters.length} encounters`);
  return encounters;
}

// Generate test observations (vitals, labs)
async function createObservations(patients, count = 30, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} observations...`);
  const observations = [];

  const observationTypes = [
    { code: '85354-9', display: 'Blood Pressure', value: () => `${faker.number.int({ min: 90, max: 180 })}/${faker.number.int({ min: 60, max: 120 })}` },
    { code: '8867-4', display: 'Heart Rate', value: () => faker.number.int({ min: 60, max: 100 }) },
    { code: '9279-1', display: 'Respiratory Rate', value: () => faker.number.int({ min: 12, max: 20 }) },
    { code: '8310-5', display: 'Body Temperature', value: () => faker.number.float({ min: 96.0, max: 99.5, fractionDigits: 1 }) },
    { code: '718-7', display: 'Hemoglobin', value: () => faker.number.float({ min: 10.0, max: 16.0, fractionDigits: 1 }) },
    { code: '777-3', display: 'Platelet Count', value: () => faker.number.int({ min: 150000, max: 450000 }) }
  ];

  for (let i = 0; i < count; i++) {
    const patient = faker.helpers.arrayElement(patients);
    const observationId = generateId('OB');
    const type = faker.helpers.arrayElement(observationTypes);

    const observation = {
      id: observationId,
      orgId,
      patientId: patient.id,
      status: faker.helpers.arrayElement(['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error']),
      category: [
        JSON.stringify({
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: faker.helpers.arrayElement(['vital-signs', 'laboratory', 'exam']),
              display: faker.helpers.arrayElement(['Vital Signs', 'Laboratory', 'Exam'])
            }
          ]
        })
      ],
      code: JSON.stringify({
        coding: [
          {
            system: 'http://loinc.org',
            code: type.code,
            display: type.display
          }
        ]
      }),
      valueQuantity: JSON.stringify({
        value: type.value(),
        unit: faker.helpers.arrayElement(['mmHg', 'bpm', '/min', '°F', 'g/dL', '/μL']),
        system: 'http://unitsofmeasure.org',
        code: faker.helpers.arrayElement(['mm[Hg]', '/min', '[degF]', 'g/dL'])
      }),
      effectiveDateTime: faker.date.recent({ days: 7 })
    };

    try {
      const created = await PATIENT_CLINICAL_DATA_PRISMA.observationInput.create({
        data: observation
      });
      observations.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating observation ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${observations.length} observations`);
  return observations;
}

// Generate test conditions (diagnoses)
async function createConditions(patients, count = 20, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} conditions...`);
  const conditions = [];

  const commonConditions = [
    { code: 'I10', display: 'Essential hypertension' },
    { code: 'E11', display: 'Type 2 diabetes mellitus' },
    { code: 'J44', display: 'Chronic obstructive pulmonary disease' },
    { code: 'I25', display: 'Chronic ischemic heart disease' },
    { code: 'M79', display: 'Fibromyalgia' },
    { code: 'K21', display: 'Gastroesophageal reflux disease' }
  ];

  for (let i = 0; i < count; i++) {
    const patient = faker.helpers.arrayElement(patients);
    const conditionId = generateId('CN');
    const condition = faker.helpers.arrayElement(commonConditions);

    const conditionData = {
      id: conditionId,
      orgId,
      patientId: patient.id,
      clinicalStatus: faker.helpers.arrayElement(['active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved']),
      verificationStatus: faker.helpers.arrayElement(['unconfirmed', 'provisional', 'differential', 'confirmed', 'refuted', 'entered-in-error']),
      category: [
        JSON.stringify({
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: faker.string.numeric(8),
              display: condition.display
            }
          ]
        })
      ],
      code: JSON.stringify({
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: condition.code,
            display: condition.display
          }
        ]
      }),
      onsetDateTime: faker.date.past({ years: 2 })
    };

    try {
      const created = await PATIENT_CLINICAL_DATA_PRISMA.conditionInput.create({
        data: conditionData
      });
      conditions.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating condition ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${conditions.length} conditions`);
  return conditions;
}

// Generate test decision requests
async function createDecisionRequests(patients, count = 15, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} decision requests...`);
  const requests = [];

  for (let i = 0; i < count; i++) {
    const patient = faker.helpers.arrayElement(patients);
    const requestId = generateId('DR');

    // Create a decision session first (required FK)
    const sessionId = generateId('DS');
    try {
      await DECISION_INTELLIGENCE_PRISMA.decisionSessionInput.create({
        data: {
          id: sessionId,
          orgId,
          patientId: patient.id,
          status: 'active',
          metadata: JSON.stringify({ source: 'test-data' })
        }
      });
    } catch (e) {
      // Session might already exist, continue
    }

    const request = {
      id: requestId,
      orgId,
      decisionSessionId: sessionId,
      patientId: patient.id,
      requestType: faker.helpers.arrayElement(['diagnostic', 'treatment', 'risk_assessment', 'pathway_selection']),
      context: JSON.stringify({
        chiefComplaint: faker.helpers.arrayElement([
          'Chest pain',
          'Shortness of breath',
          'Headache',
          'Abdominal pain',
          'Fever',
          'Fatigue'
        ]),
        symptoms: faker.helpers.arrayElements([
          'Pain', 'Nausea', 'Dizziness', 'Weakness', 'Cough'
        ], { min: 1, max: 3 }),
        urgency: faker.helpers.arrayElement(['low', 'medium', 'high'])
      }),
      priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent']),
      metadata: JSON.stringify({ source: 'test-data', createdBy: 'seed-script' })
    };

    try {
      const created = await DECISION_INTELLIGENCE_PRISMA.decisionRequestInput.create({
        data: request
      });
      requests.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating decision request ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${requests.length} decision requests`);
  return requests;
}

// Generate test decision results
async function createDecisionResults(requests, patients, count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} decision results...`);
  const results = [];

  for (let i = 0; i < count && i < requests.length; i++) {
    const request = requests[i];
    const patient = patients.find(p => p.id === request.patientId) || faker.helpers.arrayElement(patients);
    const resultId = generateId('DS');

    const result = {
      id: resultId,
      orgId,
      decisionRequestId: request.id,
      decisionSessionId: request.decisionSessionId,
      status: 'active',
      result: JSON.stringify({
        confidence: faker.number.float({ min: 0.5, max: 1.0, fractionDigits: 2 }),
        reasoning: faker.lorem.sentence(),
        diagnosis: faker.helpers.arrayElement(['Hypertension', 'Diabetes', 'COPD', 'Heart Disease'])
      }),
      metadata: JSON.stringify({ source: 'test-data', model: 'test-model-v1' })
    };

    try {
      const created = await DECISION_INTELLIGENCE_PRISMA.decisionResultInput.create({
        data: result
      });
      results.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating decision result ${i + 1}:`, error.message);
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
    'Monitor vital signs every 4 hours'
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
      status: 'active',
      metadata: JSON.stringify({ source: 'test-data' })
    };

    try {
      const created = await DECISION_INTELLIGENCE_PRISMA.recommendationInput.create({
        data: recommendation
      });
      recommendations.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating recommendation ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${recommendations.length} recommendations`);
  return recommendations;
}

// Generate test risk assessments
async function createRiskAssessments(patients, count = 10, orgId = 'test-org') {
  console.log(`\n📝 Creating ${count} risk assessments...`);
  const assessments = [];

  for (let i = 0; i < count; i++) {
    const patient = faker.helpers.arrayElement(patients);
    const assessmentId = generateId('RA');

    const assessment = {
      id: assessmentId,
      orgId,
      patientId: patient.id,
      riskType: faker.helpers.arrayElement(['mortality', 'readmission', 'complication', 'disease_progression', 'other']),
      score: faker.number.float({ min: 0.0, max: 1.0, fractionDigits: 3 }),
      scoreInterpretation: faker.helpers.arrayElement(['low', 'moderate', 'high', 'critical']),
      factors: faker.helpers.arrayElements([
        'Age', 'Comorbidities', 'Lab values', 'Vital signs', 'Medication history'
      ], { min: 2, max: 4 }),
      metadata: JSON.stringify({ source: 'test-data', model: 'risk-model-v1' })
    };

    try {
      const created = await DECISION_INTELLIGENCE_PRISMA.riskAssessmentInput.create({
        data: assessment
      });
      assessments.push(created);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error creating risk assessment ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${assessments.length} risk assessments`);
  return assessments;
}

// Main function
async function main() {
  const count = parseInt(process.argv[2]) || 10;
  const orgId = process.env.ORG_ID || 'test-org';

  console.log('🌱 Starting test data seeding...');
  console.log(`   Count: ${count} entities per type`);
  console.log(`   Org ID: ${orgId}`);
  console.log(`   Database: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);

  try {
    // Test database connection
    await DECISION_INTELLIGENCE_PRISMA.$connect();
    await PATIENT_CLINICAL_DATA_PRISMA.$connect();
    console.log('✅ Database connections established');

    // Create test data
    const patients = await createPatients(count, orgId);
    const encounters = await createEncounters(patients, count * 2, orgId);
    const observations = await createObservations(patients, count * 3, orgId);
    const conditions = await createConditions(patients, count * 2, orgId);
    const decisionRequests = await createDecisionRequests(patients, count, orgId);
    const decisionResults = await createDecisionResults(decisionRequests, patients, Math.floor(count * 0.7), orgId);
    const recommendations = await createRecommendations(decisionResults, count, orgId);
    const riskAssessments = await createRiskAssessments(patients, count, orgId);

    console.log('\n✨ Test data seeding completed!');
    console.log(`\n📊 Summary:`);
    console.log(`   Patients: ${patients.length}`);
    console.log(`   Encounters: ${encounters.length}`);
    console.log(`   Observations: ${observations.length}`);
    console.log(`   Conditions: ${conditions.length}`);
    console.log(`   Decision Requests: ${decisionRequests.length}`);
    console.log(`   Decision Results: ${decisionResults.length}`);
    console.log(`   Recommendations: ${recommendations.length}`);
    console.log(`   Risk Assessments: ${riskAssessments.length}`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  } finally {
    await DECISION_INTELLIGENCE_PRISMA.$disconnect();
    await PATIENT_CLINICAL_DATA_PRISMA.$disconnect();
  }
}

main();

