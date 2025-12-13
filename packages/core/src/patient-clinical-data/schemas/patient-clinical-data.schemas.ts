import { z, type ZodTypeAny } from "zod";

const Timestamps = z
  .object({
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const Coding = z
  .object({ system: z.string(), code: z.string(), display: z.string(), version: z.string() })
  .partial()
  .passthrough();
const CodeableConcept = z
  .object({ coding: z.array(Coding), text: z.string() })
  .partial()
  .passthrough();
const Identifier = z
  .object({ system: z.string(), value: z.string(), type: CodeableConcept })
  .partial()
  .passthrough();
const HumanName = z
  .object({
    use: z.enum(["usual", "official", "temp", "nickname", "anonymous", "old", "maiden"]),
    family: z.string(),
    given: z.array(z.string()),
    prefix: z.array(z.string()),
    suffix: z.array(z.string()),
  })
  .partial()
  .passthrough();
const Address = z
  .object({
    use: z.enum(["home", "work", "temp", "old"]),
    type: z.enum(["postal", "physical", "both"]),
    line: z.array(z.string()),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  })
  .partial()
  .passthrough();
const ContactPoint = z
  .object({
    system: z.enum(["phone", "fax", "email", "pager", "url", "sms", "other"]),
    value: z.string(),
    use: z.enum(["home", "work", "temp", "old", "mobile"]),
  })
  .partial()
  .passthrough();
const Patient = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      identifiers: z.array(Identifier).optional(),
      name: HumanName.optional(),
      gender: z.enum(["male", "female", "other", "unknown"]).optional(),
      birthDate: z.string().optional(),
      address: z.array(Address).optional(),
      telecom: z.array(ContactPoint).optional(),
      maritalStatus: z.string().optional(),
      deceasedBoolean: z.boolean().optional(),
      deceasedDateTime: z.string().datetime({ offset: true }).optional(),
    })
    .passthrough()
);
const Pagination = z
  .object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  })
  .partial()
  .passthrough();
const PatientList = z
  .object({ data: z.array(Patient), pagination: Pagination })
  .partial()
  .passthrough();
const PatientInput = z
  .object({
    patientId: z.string(),
    identifiers: z.array(Identifier).optional(),
    name: HumanName.optional(),
    gender: z.enum(["male", "female", "other", "unknown"]).optional(),
    birthDate: z.string().optional(),
    address: z.array(Address).optional(),
    telecom: z.array(ContactPoint).optional(),
  })
  .passthrough();
const Error = z
  .object({
    error: z.string(),
    message: z.string(),
    details: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const PatientUpdate = z
  .object({
    name: HumanName,
    gender: z.enum(["male", "female", "other", "unknown"]),
    address: z.array(Address),
    telecom: z.array(ContactPoint),
  })
  .partial()
  .passthrough();
const PatientSummary = z
  .object({
    patient: Patient,
    activeConditions: z.number().int(),
    activeMedications: z.number().int(),
    recentEncounters: z.number().int(),
    lastEncounterDate: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const Period = z
  .object({
    start: z.string().datetime({ offset: true }),
    end: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const Duration = z
  .object({ value: z.number(), unit: z.string(), system: z.string(), code: z.string() })
  .partial()
  .passthrough();
const Encounter = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      status: z.enum([
        "planned",
        "arrived",
        "triaged",
        "in-progress",
        "onleave",
        "finished",
        "cancelled",
      ]),
      class: z.enum(["inpatient", "outpatient", "emergency", "ambulatory", "virtual"]).optional(),
      type: z.array(CodeableConcept).optional(),
      period: Period.optional(),
      length: Duration.optional(),
    })
    .passthrough()
);
const Condition = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      code: CodeableConcept,
      severity: CodeableConcept.optional(),
      onsetDateTime: z.string().datetime({ offset: true }).optional(),
      abatementDateTime: z.string().datetime({ offset: true }).optional(),
      recordedDate: z.string().datetime({ offset: true }).optional(),
      status: z
        .enum(["active", "recurrence", "relapse", "inactive", "remission", "resolved"])
        .optional(),
    })
    .passthrough()
);
const AllergyReaction = z
  .object({
    substance: CodeableConcept,
    manifestation: z.array(CodeableConcept),
    severity: z.enum(["mild", "moderate", "severe"]),
    onset: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const Allergy = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      code: CodeableConcept,
      reaction: z.array(AllergyReaction).optional(),
      criticality: z.enum(["low", "high", "unable-to-assess"]).optional(),
      status: z.enum(["active", "inactive", "resolved"]).optional(),
    })
    .passthrough()
);
const Quantity = z
  .object({ value: z.number(), unit: z.string(), system: z.string(), code: z.string() })
  .partial()
  .passthrough();
const Dosage = z
  .object({
    text: z.string(),
    timing: z.object({}).partial().passthrough(),
    route: CodeableConcept,
    doseQuantity: Quantity,
  })
  .partial()
  .passthrough();
const MedicationStatement = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      medicationCodeableConcept: CodeableConcept,
      effectivePeriod: Period.optional(),
      dosage: z.array(Dosage).optional(),
      status: z
        .enum([
          "active",
          "completed",
          "entered-in-error",
          "intended",
          "stopped",
          "on-hold",
          "unknown",
        ])
        .optional(),
    })
    .passthrough()
);
const Immunization = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      vaccineCode: CodeableConcept,
      status: z.enum(["completed", "entered-in-error", "not-done"]).optional(),
      occurrenceDateTime: z.string().datetime({ offset: true }).optional(),
      primarySource: z.boolean().optional(),
      lotNumber: z.string().optional(),
    })
    .passthrough()
);
const Observation = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      code: CodeableConcept,
      category: z.array(CodeableConcept).optional(),
      effectiveDateTime: z.string().datetime({ offset: true }).optional(),
      valueQuantity: Quantity.optional(),
      valueString: z.string().optional(),
      valueBoolean: z.boolean().optional(),
      valueDateTime: z.string().datetime({ offset: true }).optional(),
      interpretation: z.array(CodeableConcept).optional(),
      status: z.enum([
        "registered",
        "preliminary",
        "final",
        "amended",
        "corrected",
        "cancelled",
        "entered-in-error",
        "unknown",
      ]),
    })
    .passthrough()
);
const DiagnosticReport = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      code: CodeableConcept,
      effectiveDateTime: z.string().datetime({ offset: true }).optional(),
      issued: z.string().datetime({ offset: true }).optional(),
      status: z.enum([
        "registered",
        "partial",
        "preliminary",
        "final",
        "amended",
        "corrected",
        "appended",
        "cancelled",
        "entered-in-error",
        "unknown",
      ]),
      conclusion: z.string().optional(),
    })
    .passthrough()
);
const Procedure = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      code: CodeableConcept,
      performedPeriod: Period.optional(),
      status: z.enum([
        "preparation",
        "in-progress",
        "not-done",
        "on-hold",
        "stopped",
        "completed",
        "entered-in-error",
        "unknown",
      ]),
    })
    .passthrough()
);
const ClinicalNote = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      noteType: z.enum([
        "history-physical",
        "progress",
        "discharge",
        "consultation",
        "procedure",
        "other",
      ]),
      author: z.string().optional(),
      authored: z.string().datetime({ offset: true }).optional(),
      content: z.string(),
      title: z.string().optional(),
    })
    .passthrough()
);
const CareTeamMember = z
  .object({
    id: z.string(),
    careTeamId: z.string(),
    practitionerId: z.string(),
    role: CodeableConcept,
    period: Period,
  })
  .partial()
  .passthrough();
const Attachment = z
  .object({
    contentType: z.string(),
    url: z.string().url(),
    title: z.string(),
    size: z.number().int(),
    hash: z.string(),
  })
  .partial()
  .passthrough();
const DocumentContent = z
  .object({ attachment: Attachment, format: Coding })
  .partial()
  .passthrough();
const DocumentReference = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      type: CodeableConcept,
      status: z.enum(["current", "superseded", "entered-in-error"]),
      content: z.array(DocumentContent).optional(),
      date: z.string().datetime({ offset: true }).optional(),
    })
    .passthrough()
);
const EncounterInput = z
  .object({
    patientId: z.string(),
    status: z.enum([
      "planned",
      "arrived",
      "triaged",
      "in-progress",
      "onleave",
      "finished",
      "cancelled",
    ]),
    class: z.enum(["inpatient", "outpatient", "emergency", "ambulatory", "virtual"]),
    type: z.array(CodeableConcept).optional(),
    period: Period.optional(),
  })
  .passthrough();
const EncounterUpdate = z
  .object({
    status: z.enum([
      "planned",
      "arrived",
      "triaged",
      "in-progress",
      "onleave",
      "finished",
      "cancelled",
    ]),
    period: Period,
  })
  .partial()
  .passthrough();
const ConditionInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    code: CodeableConcept,
    severity: CodeableConcept.optional(),
    onsetDateTime: z.string().datetime({ offset: true }).optional(),
    status: z
      .enum(["active", "recurrence", "relapse", "inactive", "remission", "resolved"])
      .optional()
      .default("active"),
  })
  .passthrough();
const ConditionUpdate = z
  .object({
    code: CodeableConcept,
    severity: CodeableConcept,
    abatementDateTime: z.string().datetime({ offset: true }),
    status: z.enum(["active", "recurrence", "relapse", "inactive", "remission", "resolved"]),
  })
  .partial()
  .passthrough();
const AllergyInput = z
  .object({
    patientId: z.string(),
    code: CodeableConcept,
    reaction: z.array(AllergyReaction).optional(),
    criticality: z.enum(["low", "high", "unable-to-assess"]).optional(),
    status: z.enum(["active", "inactive", "resolved"]).optional().default("active"),
  })
  .passthrough();
const AllergyUpdate = z
  .object({
    reaction: z.array(AllergyReaction),
    criticality: z.enum(["low", "high", "unable-to-assess"]),
    status: z.enum(["active", "inactive", "resolved"]),
  })
  .partial()
  .passthrough();
const MedicationStatementInput = z
  .object({
    patientId: z.string(),
    medicationCodeableConcept: CodeableConcept,
    effectivePeriod: Period.optional(),
    dosage: z.array(Dosage).optional(),
    status: z
      .enum([
        "active",
        "completed",
        "entered-in-error",
        "intended",
        "stopped",
        "on-hold",
        "unknown",
      ])
      .optional()
      .default("active"),
  })
  .passthrough();
const MedicationStatementUpdate = z
  .object({
    effectivePeriod: Period,
    dosage: z.array(Dosage),
    status: z.enum([
      "active",
      "completed",
      "entered-in-error",
      "intended",
      "stopped",
      "on-hold",
      "unknown",
    ]),
  })
  .partial()
  .passthrough();
const MedicationOrder = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      medicationCodeableConcept: CodeableConcept,
      authoredOn: z.string().datetime({ offset: true }).optional(),
      dosageInstruction: z.array(Dosage).optional(),
      status: z
        .enum([
          "active",
          "on-hold",
          "cancelled",
          "completed",
          "entered-in-error",
          "stopped",
          "draft",
          "unknown",
        ])
        .optional(),
    })
    .passthrough()
);
const MedicationOrderInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    medicationCodeableConcept: CodeableConcept,
    dosageInstruction: z.array(Dosage).optional(),
    status: z
      .enum([
        "active",
        "on-hold",
        "cancelled",
        "completed",
        "entered-in-error",
        "stopped",
        "draft",
        "unknown",
      ])
      .optional()
      .default("draft"),
  })
  .passthrough();
const MedicationOrderUpdate = z
  .object({
    dosageInstruction: z.array(Dosage),
    status: z.enum([
      "active",
      "on-hold",
      "cancelled",
      "completed",
      "entered-in-error",
      "stopped",
      "draft",
      "unknown",
    ]),
  })
  .partial()
  .passthrough();
const MedicationAdministration = Timestamps.and(
  z
    .object({
      id: z.string(),
      medicationOrderId: z.string(),
      status: z
        .enum([
          "in-progress",
          "not-done",
          "on-hold",
          "completed",
          "entered-in-error",
          "stopped",
          "unknown",
        ])
        .optional(),
      effectiveDateTime: z.string().datetime({ offset: true }).optional(),
      dosage: Dosage.optional(),
    })
    .passthrough()
);
const ImmunizationInput = z
  .object({
    patientId: z.string(),
    vaccineCode: CodeableConcept,
    occurrenceDateTime: z.string().datetime({ offset: true }).optional(),
    primarySource: z.boolean().optional().default(true),
    lotNumber: z.string().optional(),
    status: z.enum(["completed", "entered-in-error", "not-done"]).optional().default("completed"),
  })
  .passthrough();
const ImmunizationUpdate = z
  .object({
    occurrenceDateTime: z.string().datetime({ offset: true }),
    status: z.enum(["completed", "entered-in-error", "not-done"]),
    lotNumber: z.string(),
  })
  .partial()
  .passthrough();
const ObservationInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    code: CodeableConcept,
    category: z.array(CodeableConcept).optional(),
    effectiveDateTime: z.string().datetime({ offset: true }).optional(),
    valueQuantity: Quantity.optional(),
    valueString: z.string().optional(),
    valueBoolean: z.boolean().optional(),
    valueDateTime: z.string().datetime({ offset: true }).optional(),
    status: z
      .enum([
        "registered",
        "preliminary",
        "final",
        "amended",
        "corrected",
        "cancelled",
        "entered-in-error",
        "unknown",
      ])
      .optional()
      .default("preliminary"),
  })
  .passthrough();
const ObservationUpdate = z
  .object({
    valueQuantity: Quantity,
    valueString: z.string(),
    valueBoolean: z.boolean(),
    valueDateTime: z.string().datetime({ offset: true }),
    status: z.enum([
      "registered",
      "preliminary",
      "final",
      "amended",
      "corrected",
      "cancelled",
      "entered-in-error",
      "unknown",
    ]),
  })
  .partial()
  .passthrough();
const DiagnosticReportInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    code: CodeableConcept,
    effectiveDateTime: z.string().datetime({ offset: true }).optional(),
    status: z
      .enum([
        "registered",
        "partial",
        "preliminary",
        "final",
        "amended",
        "corrected",
        "appended",
        "cancelled",
        "entered-in-error",
        "unknown",
      ])
      .optional()
      .default("preliminary"),
    conclusion: z.string().optional(),
  })
  .passthrough();
const DiagnosticReportUpdate = z
  .object({
    conclusion: z.string(),
    status: z.enum([
      "registered",
      "partial",
      "preliminary",
      "final",
      "amended",
      "corrected",
      "appended",
      "cancelled",
      "entered-in-error",
      "unknown",
    ]),
  })
  .partial()
  .passthrough();
const ImagingStudy = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      modality: z.array(Coding).optional(),
      started: z.string().datetime({ offset: true }).optional(),
      status: z.enum(["registered", "available", "cancelled", "entered-in-error", "unknown"]),
      numberOfSeries: z.number().int().optional(),
      numberOfInstances: z.number().int().optional(),
    })
    .passthrough()
);
const ImagingStudyInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    modality: z.array(Coding).optional(),
    started: z.string().datetime({ offset: true }).optional(),
    status: z
      .enum(["registered", "available", "cancelled", "entered-in-error", "unknown"])
      .optional()
      .default("registered"),
  })
  .passthrough();
const ImagingStudyUpdate = z
  .object({
    status: z.enum(["registered", "available", "cancelled", "entered-in-error", "unknown"]),
  })
  .partial()
  .passthrough();
const ImagingSeries = z
  .object({
    id: z.string(),
    imagingStudyId: z.string(),
    uid: z.string(),
    modality: Coding,
    numberOfInstances: z.number().int(),
    started: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const ProcedureInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    code: CodeableConcept,
    performedPeriod: Period.optional(),
    status: z
      .enum([
        "preparation",
        "in-progress",
        "not-done",
        "on-hold",
        "stopped",
        "completed",
        "entered-in-error",
        "unknown",
      ])
      .optional()
      .default("preparation"),
  })
  .passthrough();
const ProcedureUpdate = z
  .object({
    performedPeriod: Period,
    status: z.enum([
      "preparation",
      "in-progress",
      "not-done",
      "on-hold",
      "stopped",
      "completed",
      "entered-in-error",
      "unknown",
    ]),
  })
  .partial()
  .passthrough();
const ClinicalNoteInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    noteType: z.enum([
      "history-physical",
      "progress",
      "discharge",
      "consultation",
      "procedure",
      "other",
    ]),
    author: z.string().optional(),
    content: z.string(),
    title: z.string().optional(),
  })
  .passthrough();
const ClinicalNoteUpdate = z
  .object({
    content: z.string(),
    title: z.string(),
    noteType: z.enum([
      "history-physical",
      "progress",
      "discharge",
      "consultation",
      "procedure",
      "other",
    ]),
  })
  .partial()
  .passthrough();
const CareTeamParticipant = z
  .object({ role: CodeableConcept, member: z.string() })
  .partial()
  .passthrough();
const CareTeam = Timestamps.and(
  z
    .object({
      id: z.string(),
      patientId: z.string(),
      encounterId: z.string().optional(),
      status: z.enum(["proposed", "active", "suspended", "inactive", "entered-in-error"]),
      participant: z.array(CareTeamParticipant).optional(),
      period: Period.optional(),
    })
    .passthrough()
);
const CareTeamInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    participant: z.array(CareTeamParticipant).optional(),
    status: z
      .enum(["proposed", "active", "suspended", "inactive", "entered-in-error"])
      .optional()
      .default("proposed"),
    period: Period.optional(),
  })
  .passthrough();
const CareTeamUpdate = z
  .object({
    participant: z.array(CareTeamParticipant),
    status: z.enum(["proposed", "active", "suspended", "inactive", "entered-in-error"]),
    period: Period,
  })
  .partial()
  .passthrough();
const DocumentReferenceInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    type: CodeableConcept,
    content: z.array(DocumentContent).optional(),
    status: z.enum(["current", "superseded", "entered-in-error"]).optional().default("current"),
  })
  .passthrough();
const DocumentReferenceUpdate = z
  .object({
    status: z.enum(["current", "superseded", "entered-in-error"]),
    content: z.array(DocumentContent),
  })
  .partial()
  .passthrough();

export const schemas: Record<string, ZodTypeAny> = {
  Timestamps,
  Coding,
  CodeableConcept,
  Identifier,
  HumanName,
  Address,
  ContactPoint,
  Patient,
  Pagination,
  PatientList,
  PatientInput,
  Error,
  PatientUpdate,
  PatientSummary,
  Period,
  Duration,
  Encounter,
  Condition,
  AllergyReaction,
  Allergy,
  Quantity,
  Dosage,
  MedicationStatement,
  Immunization,
  Observation,
  DiagnosticReport,
  Procedure,
  ClinicalNote,
  CareTeamMember,
  Attachment,
  DocumentContent,
  DocumentReference,
  EncounterInput,
  EncounterUpdate,
  ConditionInput,
  ConditionUpdate,
  AllergyInput,
  AllergyUpdate,
  MedicationStatementInput,
  MedicationStatementUpdate,
  MedicationOrder,
  MedicationOrderInput,
  MedicationOrderUpdate,
  MedicationAdministration,
  ImmunizationInput,
  ImmunizationUpdate,
  ObservationInput,
  ObservationUpdate,
  DiagnosticReportInput,
  DiagnosticReportUpdate,
  ImagingStudy,
  ImagingStudyInput,
  ImagingStudyUpdate,
  ImagingSeries,
  ProcedureInput,
  ProcedureUpdate,
  ClinicalNoteInput,
  ClinicalNoteUpdate,
  CareTeamParticipant,
  CareTeam,
  CareTeamInput,
  CareTeamUpdate,
  DocumentReferenceInput,
  DocumentReferenceUpdate,
};



