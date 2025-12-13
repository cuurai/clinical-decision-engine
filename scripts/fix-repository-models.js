import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Mapping of incorrect model names to correct Prisma client model names
const MODEL_MAPPINGS = {
  // Decision Session related
  'decisionSessionAlert': 'alertEvaluationInput',
  'decisionSessionExplanation': 'explanationInput',
  'decisionSessionRiskAssessment': 'riskAssessmentInput',

  // Decision Request related
  'decisionRequest': 'decisionRequestInput',
  'decisionRequestResult': 'decisionResultInput',
  'decisionRequestExplanation': 'explanationInput',

  // Decision Result related
  'decisionResult': 'decisionResultInput',
  'decisionResultRecommendation': 'recommendationInput',
  'decisionResultRiskAssessment': 'riskAssessmentInput',
  'decisionResultExplanation': 'explanationInput',

  // Decision Session related
  'decisionSession': 'decisionSessionInput',
  'decisionSessionRequest': 'decisionRequestInput',
  'decisionSessionResult': 'decisionResultInput',

  // Other models
  'alertEvaluation': 'alertEvaluationInput',
  'decisionPolicy': 'decisionPolicyInput',
  'decisionMetric': 'decisionMetricSnapshotInput',
  'experiment': 'experimentInput',
  'experimentArm': 'experimentArm',
  'experimentResult': 'experimentResult',
  'explanation': 'explanationInput',
  'modelInvocation': 'modelInvocationInput',
  'recommendation': 'recommendationInput',
  'riskAssessment': 'riskAssessmentInput',
  'simulationScenario': 'simulationScenarioInput',
  'simulationRun': 'simulationRunInput',
  'thresholdProfile': 'thresholdProfileInput',
};

const repositoryDir = 'platform/adapters/src/decision-intelligence';
const repositoryFiles = readdirSync(repositoryDir)
  .filter(f => f.endsWith('.dao.repository.ts'))
  .map(f => join(repositoryDir, f));

console.log(`Found ${repositoryFiles.length} repository files to check\n`);

let totalFixed = 0;

for (const file of repositoryFiles) {
  let content = readFileSync(file, 'utf8');
  let fixed = false;
  let fileFixed = 0;

  for (const [incorrect, correct] of Object.entries(MODEL_MAPPINGS)) {
    const regex = new RegExp(`this\\.dao\\.${incorrect}\\.`, 'g');
    const matches = content.match(regex);

    if (matches) {
      content = content.replace(regex, `this.dao.${correct}.`);
      fixed = true;
      fileFixed += matches.length;
      console.log(`  Fixed ${matches.length} occurrence(s) of ${incorrect} -> ${correct}`);
    }
  }

  if (fixed) {
    writeFileSync(file, content);
    console.log(`✅ Fixed ${file} (${fileFixed} changes)\n`);
    totalFixed += fileFixed;
  }
}

console.log(`\n✨ Total fixes: ${totalFixed} model name corrections across ${repositoryFiles.length} files`);
