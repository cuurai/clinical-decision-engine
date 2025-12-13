import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Timestamps = z
  .object({
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const Coding = z
  .object({
    system: z.string(),
    code: z.string(),
    display: z.string(),
    version: z.string(),
  })
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
    use: z.enum([
      "usual",
      "official",
      "temp",
      "nickname",
      "anonymous",
      "old",
      "maiden",
    ]),
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
  .object({
    value: z.number(),
    unit: z.string(),
    system: z.string(),
    code: z.string(),
  })
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
      class: z
        .enum(["inpatient", "outpatient", "emergency", "ambulatory", "virtual"])
        .optional(),
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
        .enum([
          "active",
          "recurrence",
          "relapse",
          "inactive",
          "remission",
          "resolved",
        ])
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
  .object({
    value: z.number(),
    unit: z.string(),
    system: z.string(),
    code: z.string(),
  })
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
    class: z.enum([
      "inpatient",
      "outpatient",
      "emergency",
      "ambulatory",
      "virtual",
    ]),
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
      .enum([
        "active",
        "recurrence",
        "relapse",
        "inactive",
        "remission",
        "resolved",
      ])
      .optional()
      .default("active"),
  })
  .passthrough();
const ConditionUpdate = z
  .object({
    code: CodeableConcept,
    severity: CodeableConcept,
    abatementDateTime: z.string().datetime({ offset: true }),
    status: z.enum([
      "active",
      "recurrence",
      "relapse",
      "inactive",
      "remission",
      "resolved",
    ]),
  })
  .partial()
  .passthrough();
const AllergyInput = z
  .object({
    patientId: z.string(),
    code: CodeableConcept,
    reaction: z.array(AllergyReaction).optional(),
    criticality: z.enum(["low", "high", "unable-to-assess"]).optional(),
    status: z
      .enum(["active", "inactive", "resolved"])
      .optional()
      .default("active"),
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
    status: z
      .enum(["completed", "entered-in-error", "not-done"])
      .optional()
      .default("completed"),
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
      status: z.enum([
        "registered",
        "available",
        "cancelled",
        "entered-in-error",
        "unknown",
      ]),
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
      .enum([
        "registered",
        "available",
        "cancelled",
        "entered-in-error",
        "unknown",
      ])
      .optional()
      .default("registered"),
  })
  .passthrough();
const ImagingStudyUpdate = z
  .object({
    status: z.enum([
      "registered",
      "available",
      "cancelled",
      "entered-in-error",
      "unknown",
    ]),
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
      status: z.enum([
        "proposed",
        "active",
        "suspended",
        "inactive",
        "entered-in-error",
      ]),
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
    status: z.enum([
      "proposed",
      "active",
      "suspended",
      "inactive",
      "entered-in-error",
    ]),
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
    status: z
      .enum(["current", "superseded", "entered-in-error"])
      .optional()
      .default("current"),
  })
  .passthrough();
const DocumentReferenceUpdate = z
  .object({
    status: z.enum(["current", "superseded", "entered-in-error"]),
    content: z.array(DocumentContent),
  })
  .partial()
  .passthrough();

export const schemas = {
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

const endpoints = makeApi([
  {
    method: "get",
    path: "/allergies",
    alias: "listAllergies",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["active", "inactive", "resolved"]).optional(),
      },
    ],
    response: z.array(Allergy),
  },
  {
    method: "post",
    path: "/allergies",
    alias: "createAllergy",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AllergyInput,
      },
    ],
    response: Allergy,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/allergies/:id",
    alias: "getAllergy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Allergy,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/allergies/:id",
    alias: "updateAllergy",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AllergyUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Allergy,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/allergies/:id",
    alias: "deleteAllergy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/care-teams",
    alias: "listCareTeams",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "encounterId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "proposed",
            "active",
            "suspended",
            "inactive",
            "entered-in-error",
          ])
          .optional(),
      },
    ],
    response: z.array(CareTeam),
  },
  {
    method: "post",
    path: "/care-teams",
    alias: "createCareTeam",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CareTeamInput,
      },
    ],
    response: CareTeam,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/care-teams/:id",
    alias: "getCareTeam",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: CareTeam,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/care-teams/:id",
    alias: "updateCareTeam",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CareTeamUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: CareTeam,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/care-teams/:id",
    alias: "deleteCareTeam",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/conditions",
    alias: "listConditions",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "active",
            "recurrence",
            "relapse",
            "inactive",
            "remission",
            "resolved",
          ])
          .optional(),
      },
    ],
    response: z.array(Condition),
  },
  {
    method: "post",
    path: "/conditions",
    alias: "createCondition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConditionInput,
      },
    ],
    response: Condition,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/conditions/:id",
    alias: "getCondition",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Condition,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/conditions/:id",
    alias: "updateCondition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConditionUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Condition,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/conditions/:id",
    alias: "deleteCondition",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/conditions/:id/notes",
    alias: "listConditionNotes",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ClinicalNote),
  },
  {
    method: "get",
    path: "/diagnostic-reports",
    alias: "listDiagnosticReports",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "encounterId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
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
          .optional(),
      },
    ],
    response: z.array(DiagnosticReport),
  },
  {
    method: "post",
    path: "/diagnostic-reports",
    alias: "createDiagnosticReport",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DiagnosticReportInput,
      },
    ],
    response: DiagnosticReport,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/diagnostic-reports/:id",
    alias: "getDiagnosticReport",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DiagnosticReport,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/diagnostic-reports/:id",
    alias: "updateDiagnosticReport",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DiagnosticReportUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DiagnosticReport,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/diagnostic-reports/:id",
    alias: "deleteDiagnosticReport",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/diagnostic-reports/:id/imaging-studies",
    alias: "listDiagnosticReportImagingStudies",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ImagingStudy),
  },
  {
    method: "get",
    path: "/diagnostic-reports/:id/observations",
    alias: "listDiagnosticReportObservations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Observation),
  },
  {
    method: "get",
    path: "/documents",
    alias: "listDocuments",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum(["current", "superseded", "entered-in-error"])
          .optional(),
      },
    ],
    response: z.array(DocumentReference),
  },
  {
    method: "post",
    path: "/documents",
    alias: "createDocument",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DocumentReferenceInput,
      },
    ],
    response: DocumentReference,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/documents/:id",
    alias: "getDocument",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DocumentReference,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/documents/:id",
    alias: "updateDocument",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DocumentReferenceUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: DocumentReference,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/documents/:id",
    alias: "deleteDocument",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/encounters",
    alias: "listEncounters",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "planned",
            "arrived",
            "triaged",
            "in-progress",
            "onleave",
            "finished",
            "cancelled",
          ])
          .optional(),
      },
    ],
    response: z.array(Encounter),
  },
  {
    method: "post",
    path: "/encounters",
    alias: "createEncounter",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EncounterInput,
      },
    ],
    response: Encounter,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/encounters/:id",
    alias: "getEncounter",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Encounter,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/encounters/:id",
    alias: "updateEncounter",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EncounterUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Encounter,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/encounters/:id",
    alias: "deleteEncounter",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/encounters/:id/conditions",
    alias: "listEncounterConditions",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Condition),
  },
  {
    method: "get",
    path: "/encounters/:id/diagnostic-reports",
    alias: "listEncounterDiagnosticReports",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(DiagnosticReport),
  },
  {
    method: "get",
    path: "/encounters/:id/notes",
    alias: "listEncounterNotes",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ClinicalNote),
  },
  {
    method: "get",
    path: "/encounters/:id/observations",
    alias: "listEncounterObservations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Observation),
  },
  {
    method: "get",
    path: "/encounters/:id/procedures",
    alias: "listEncounterProcedures",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Procedure),
  },
  {
    method: "get",
    path: "/imaging-studies",
    alias: "listImagingStudies",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "modality",
        type: "Query",
        schema: z
          .enum(["CR", "CT", "MR", "US", "MG", "PT", "NM", "XR", "DX", "OT"])
          .optional(),
      },
    ],
    response: z.array(ImagingStudy),
  },
  {
    method: "post",
    path: "/imaging-studies",
    alias: "createImagingStudy",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ImagingStudyInput,
      },
    ],
    response: ImagingStudy,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/imaging-studies/:id",
    alias: "getImagingStudy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ImagingStudy,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/imaging-studies/:id",
    alias: "updateImagingStudy",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ImagingStudyUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ImagingStudy,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/imaging-studies/:id",
    alias: "deleteImagingStudy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/imaging-studies/:id/series",
    alias: "listImagingStudySeries",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ImagingSeries),
  },
  {
    method: "get",
    path: "/immunizations",
    alias: "listImmunizations",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum(["completed", "entered-in-error", "not-done"])
          .optional(),
      },
    ],
    response: z.array(Immunization),
  },
  {
    method: "post",
    path: "/immunizations",
    alias: "createImmunization",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ImmunizationInput,
      },
    ],
    response: Immunization,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/immunizations/:id",
    alias: "getImmunization",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Immunization,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/immunizations/:id",
    alias: "updateImmunization",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ImmunizationUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Immunization,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/immunizations/:id",
    alias: "deleteImmunization",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/medication-orders",
    alias: "listMedicationOrders",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
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
      },
    ],
    response: z.array(MedicationOrder),
  },
  {
    method: "post",
    path: "/medication-orders",
    alias: "createMedicationOrder",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MedicationOrderInput,
      },
    ],
    response: MedicationOrder,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/medication-orders/:id",
    alias: "getMedicationOrder",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: MedicationOrder,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/medication-orders/:id",
    alias: "updateMedicationOrder",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MedicationOrderUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: MedicationOrder,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/medication-orders/:id",
    alias: "deleteMedicationOrder",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/medication-orders/:id/administrations",
    alias: "listMedicationAdministrations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(MedicationAdministration),
  },
  {
    method: "get",
    path: "/medication-statements",
    alias: "listMedicationStatements",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
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
      },
    ],
    response: z.array(MedicationStatement),
  },
  {
    method: "post",
    path: "/medication-statements",
    alias: "createMedicationStatement",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MedicationStatementInput,
      },
    ],
    response: MedicationStatement,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/medication-statements/:id",
    alias: "getMedicationStatement",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: MedicationStatement,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/medication-statements/:id",
    alias: "updateMedicationStatement",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MedicationStatementUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: MedicationStatement,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/medication-statements/:id",
    alias: "deleteMedicationStatement",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/notes",
    alias: "listNotes",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "encounterId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "noteType",
        type: "Query",
        schema: z
          .enum([
            "history-physical",
            "progress",
            "discharge",
            "consultation",
            "procedure",
            "other",
          ])
          .optional(),
      },
    ],
    response: z.array(ClinicalNote),
  },
  {
    method: "post",
    path: "/notes",
    alias: "createNote",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ClinicalNoteInput,
      },
    ],
    response: ClinicalNote,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/notes/:id",
    alias: "getNote",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ClinicalNote,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/notes/:id",
    alias: "updateNote",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ClinicalNoteUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: ClinicalNote,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/notes/:id",
    alias: "deleteNote",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/observations",
    alias: "listObservations",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "encounterId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "category",
        type: "Query",
        schema: z
          .enum(["vital-sign", "laboratory", "exam", "survey"])
          .optional(),
      },
      {
        name: "code",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(Observation),
  },
  {
    method: "post",
    path: "/observations",
    alias: "createObservation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ObservationInput,
      },
    ],
    response: Observation,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/observations/:id",
    alias: "getObservation",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Observation,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/observations/:id",
    alias: "updateObservation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ObservationUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Observation,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/observations/:id",
    alias: "deleteObservation",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/patients",
    alias: "listPatients",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PatientList,
  },
  {
    method: "post",
    path: "/patients",
    alias: "createPatient",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatientInput,
      },
    ],
    response: Patient,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/patients/:id",
    alias: "getPatient",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Patient,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/patients/:id",
    alias: "updatePatient",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatientUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Patient,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/patients/:id",
    alias: "deletePatient",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/patients/:id/allergies",
    alias: "listPatientAllergies",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Allergy),
  },
  {
    method: "get",
    path: "/patients/:id/care-team",
    alias: "listPatientCareTeam",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(CareTeamMember),
  },
  {
    method: "get",
    path: "/patients/:id/conditions",
    alias: "listPatientConditions",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Condition),
  },
  {
    method: "get",
    path: "/patients/:id/diagnostic-reports",
    alias: "listPatientDiagnosticReports",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(DiagnosticReport),
  },
  {
    method: "get",
    path: "/patients/:id/documents",
    alias: "listPatientDocuments",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(DocumentReference),
  },
  {
    method: "get",
    path: "/patients/:id/encounters",
    alias: "listPatientEncounters",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Encounter),
  },
  {
    method: "get",
    path: "/patients/:id/immunizations",
    alias: "listPatientImmunizations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Immunization),
  },
  {
    method: "get",
    path: "/patients/:id/medications",
    alias: "listPatientMedications",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(MedicationStatement),
  },
  {
    method: "get",
    path: "/patients/:id/notes",
    alias: "listPatientNotes",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(ClinicalNote),
  },
  {
    method: "get",
    path: "/patients/:id/observations",
    alias: "listPatientObservations",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "category",
        type: "Query",
        schema: z
          .enum(["vital-sign", "laboratory", "exam", "survey"])
          .optional(),
      },
    ],
    response: z.array(Observation),
  },
  {
    method: "get",
    path: "/patients/:id/observations/labs",
    alias: "listPatientLabs",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Observation),
  },
  {
    method: "get",
    path: "/patients/:id/observations/vitals",
    alias: "listPatientVitals",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Observation),
  },
  {
    method: "get",
    path: "/patients/:id/procedures",
    alias: "listPatientProcedures",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: z.array(Procedure),
  },
  {
    method: "get",
    path: "/patients/:id/summary",
    alias: "getPatientSummary",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatientSummary,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/procedures",
    alias: "listProcedures",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
      {
        name: "patientId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
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
          .optional(),
      },
    ],
    response: z.array(Procedure),
  },
  {
    method: "post",
    path: "/procedures",
    alias: "createProcedure",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProcedureInput,
      },
    ],
    response: Procedure,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: Error,
      },
    ],
  },
  {
    method: "get",
    path: "/procedures/:id",
    alias: "getProcedure",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Procedure,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "patch",
    path: "/procedures/:id",
    alias: "updateProcedure",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProcedureUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: Procedure,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/procedures/:id",
    alias: "deleteProcedure",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
]);

export const api = new Zodios("https://api.cuurai.com/api/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
