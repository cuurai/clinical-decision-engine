Under this convention:

- **POST /entity** → create
- **PATCH /entity/:id** → update
- **DELETE /entity/:id** → delete
- **GET /entity/:id/sub-entity** → list child resources

Here are the **revised API operations for every domain**, strictly matching the pattern.

---

# **1) Patient & Clinical Data Domain**

### **Entity: Patient**

- **POST /api/v1/patients**
- **PATCH /api/v1/patients/:id**
- **DELETE /api/v1/patients/:id**

**Children**

- **GET /api/v1/patients/:id/encounters**
- **GET /api/v1/patients/:id/conditions**
- **GET /api/v1/patients/:id/observations**
- **GET /api/v1/patients/:id/medications**
- **GET /api/v1/patients/:id/allergies**
- **GET /api/v1/patients/:id/procedures**
- **GET /api/v1/patients/:id/imaging**

---

### **Entity: Encounter**

- **POST /api/v1/encounters**
- **PATCH /api/v1/encounters/:id**
- **DELETE /api/v1/encounters/:id**

---

### **Entity: Observation**

(labs, vitals)

- **POST /api/v1/observations**
- **PATCH /api/v1/observations/:id**
- **DELETE /api/v1/observations/:id**

---

# **2) Knowledge & Evidence Domain**

### **Entity: ClinicalRule**

- **POST /api/v1/rules**
- **PATCH /api/v1/rules/:id**
- **DELETE /api/v1/rules/:id**

### **Entity: ClinicalGuideline**

- **POST /api/v1/guidelines**
- **PATCH /api/v1/guidelines/:id**
- **DELETE /api/v1/guidelines/:id**

### **Entity: ModelDefinition**

- **POST /api/v1/models**
- **PATCH /api/v1/models/:id**
- **DELETE /api/v1/models/:id**

**Children**

- **GET /api/v1/models/:id/versions**

### **Entity: OntologyTerm**

- **GET /api/v1/ontology/:id/children**
  (matches “child collection” convention)

---

# **3) Decision Intelligence Domain**

### **Entity: DecisionRequest**

(Immutable, so **only POST**)

- **POST /api/v1/decision-requests**

**Children**

- **GET /api/v1/decision-requests/:id/responses**
- **GET /api/v1/decision-requests/:id/explanations**

### **Entity: RiskScore**

- **POST /api/v1/risk-scores**

### **Entity: DiagnosticSuggestion**

- **POST /api/v1/diagnostic-suggestions**

### **Entity: TreatmentRecommendation**

- **POST /api/v1/treatment-recommendations**

---

# **4) Workflow & Care Pathways Domain**

### **Entity: Alert**

- **POST /api/v1/alerts**
- **PATCH /api/v1/alerts/:id**
- **DELETE /api/v1/alerts/:id**

### **Entity: CarePlan**

- **POST /api/v1/careplans**
- **PATCH /api/v1/careplans/:id**
- **DELETE /api/v1/careplans/:id**

**Children**

- **GET /api/v1/careplans/:id/tasks**

### **Entity: Task**

- **POST /api/v1/tasks**
- **PATCH /api/v1/tasks/:id**
- **DELETE /api/v1/tasks/:id**

### **Entity: ClinicalPathway**

- **POST /api/v1/pathways**
- **PATCH /api/v1/pathways/:id**
- **DELETE /api/v1/pathways/:id**

---

# **5) Integration & Interoperability Domain**

### **Entity: FHIRBundle**

- **POST /api/v1/fhir-bundles**

### **Entity: HL7Message**

- **POST /api/v1/hl7-messages**

### **Entity: ExternalDataSource**

- **POST /api/v1/data-sources**
- **PATCH /api/v1/data-sources/:id**
- **DELETE /api/v1/data-sources/:id**

**Children**

- **GET /api/v1/data-sources/:id/import-jobs**

### **Entity: ImportJob**

- **POST /api/v1/import-jobs**
- **PATCH /api/v1/import-jobs/:id**

### **Entity: AuditEvent**

- **POST /api/v1/audit-events**
- **PATCH /api/v1/audit-events/:id**

---

If you want, I can now generate:

✅ A **single, clean OpenAPI file** following this exact REST style
OR
✅ **MCP capability map** matching the entity–operations model

Just say which you want.
