# Clinical Decision Engine

A comprehensive clinical decision support system designed to provide intelligent healthcare decision-making capabilities through a structured REST API. This engine integrates patient data, clinical knowledge, evidence-based guidelines, and AI-driven decision intelligence to support healthcare providers in delivering optimal patient care.

## Overview

The Clinical Decision Engine is part of the CuurAI MCP ecosystem, providing a standardized interface for clinical decision support operations. It enables healthcare applications to leverage structured clinical data, evidence-based rules, and AI models to generate diagnostic suggestions, treatment recommendations, risk scores, and care pathway guidance.

## Architecture

The system is organized into five core domains:

### 1. Patient & Clinical Data Domain
Manages patient information and clinical observations:
- **Patient** - Core patient demographics and records
- **Encounter** - Clinical visits and interactions
- **Observation** - Labs, vitals, and clinical measurements
- **Condition** - Diagnoses and health conditions
- **Medication** - Prescribed medications
- **Allergy** - Patient allergies and adverse reactions
- **Procedure** - Clinical procedures performed
- **Imaging** - Medical imaging studies

### 2. Knowledge & Evidence Domain
Stores and manages clinical knowledge and evidence:
- **ClinicalRule** - Rule-based decision logic
- **ClinicalGuideline** - Evidence-based clinical guidelines
- **ModelDefinition** - AI/ML model definitions and versions
- **OntologyTerm** - Medical terminology and coding systems

### 3. Decision Intelligence Domain
Generates clinical decision outputs:
- **DecisionRequest** - Immutable decision request records
- **RiskScore** - Calculated risk assessments
- **DiagnosticSuggestion** - AI-generated diagnostic recommendations
- **TreatmentRecommendation** - Evidence-based treatment suggestions

### 4. Workflow & Care Pathways Domain
Manages clinical workflows and care coordination:
- **Alert** - Clinical alerts and notifications
- **CarePlan** - Structured care plans
- **Task** - Clinical tasks and action items
- **ClinicalPathway** - Standardized care pathways

### 5. Integration & Interoperability Domain
Handles external integrations and data exchange:
- **FHIRBundle** - FHIR-compliant data bundles
- **HL7Message** - HL7 message processing
- **ExternalDataSource** - External data source configurations
- **ImportJob** - Data import job management
- **AuditEvent** - System audit and compliance logging

## API Design

The API follows RESTful conventions with consistent patterns:

- **POST /entity** → Create new resource
- **PATCH /entity/:id** → Update existing resource
- **DELETE /entity/:id** → Delete resource
- **GET /entity/:id/sub-entity** → List child resources

All endpoints are prefixed with `/api/v1/`.

### Example Endpoints

```bash
# Patient management
POST   /api/v1/patients
PATCH  /api/v1/patients/:id
DELETE /api/v1/patients/:id
GET    /api/v1/patients/:id/encounters

# Decision intelligence
POST   /api/v1/decision-requests
GET    /api/v1/decision-requests/:id/responses
GET    /api/v1/decision-requests/:id/explanations

# Knowledge management
POST   /api/v1/rules
POST   /api/v1/guidelines
POST   /api/v1/models
```

For complete API documentation, see [Domain Models Documentation](.docs/domain-models.md).

## Getting Started

### Prerequisites

- Python 3.9+ (or Node.js 18+ for JavaScript implementation)
- PostgreSQL 13+ (or compatible database)
- Docker and Docker Compose (for containerized deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd clinical-decision-engine

# Install dependencies
# For Python:
pip install -r requirements.txt

# For Node.js:
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Configuration

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/clinical_decision_engine

# API
API_PORT=8000
API_HOST=0.0.0.0

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# External Services
FHIR_SERVER_URL=https://fhir.example.com
HL7_ENDPOINT=https://hl7.example.com
```

### Running the Application

```bash
# Development mode
python -m uvicorn main:app --reload --port 8000

# Or with Node.js
npm run dev

# Production mode
docker-compose up -d
```

## Development

### Project Structure

```
clinical-decision-engine/
├── .docs/
│   └── domain-models.md      # Complete API domain models
├── src/                      # Source code (to be implemented)
│   ├── domains/              # Domain-specific modules
│   ├── api/                  # API routes and handlers
│   ├── models/               # Data models
│   └── services/             # Business logic
├── tests/                    # Test suite
├── docker-compose.yml        # Docker configuration
└── README.md                 # This file
```

### Contributing

1. Create a feature branch from `main`
2. Implement your changes following the domain model conventions
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Testing

```bash
# Run tests
pytest  # or npm test

# Run with coverage
pytest --cov=src --cov-report=html
```

## Standards & Compliance

- **FHIR R4** - Healthcare data interoperability
- **HL7 v2/v3** - Clinical messaging standards
- **HIPAA** - Healthcare data privacy compliance
- **HL7 CDA** - Clinical document architecture

## License

[Specify your license here]

## Support

For questions, issues, or contributions, please open an issue in the repository or contact the development team.

## Related Projects

- [CuurAI MCP](https://github.com/cuurai/mcp-cuur-ai) - Main MCP framework
- [Other related projects...]

---

**Note**: This project is in active development. API specifications are subject to change. Please refer to the [Domain Models Documentation](.docs/domain-models.md) for the most up-to-date API structure.
