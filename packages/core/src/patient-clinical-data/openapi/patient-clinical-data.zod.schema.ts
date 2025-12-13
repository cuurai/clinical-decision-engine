import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const PatApiMeta = z
  .object({
    correlationId: z.string(),
    timestamp: z.string().datetime({ offset: true }),
    totalCount: z.number().int(),
    pageSize: z.number().int(),
    pageNumber: z.number().int(),
  })
  .partial()
  .passthrough();
const PatApiResponse = z
  .object({ data: z.object({}).partial().passthrough(), meta: PatApiMeta })
  .partial()
  .passthrough();
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
const createPatient_Body = PatApiResponse.and(
  z.object({ data: PatientInput }).partial().passthrough()
);
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
const updatePatient_Body = PatApiResponse.and(
  z.object({ data: PatientUpdate }).partial().passthrough()
);
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
const PatApiListResponse = z
  .object({ data: z.array(z.any()), meta: PatApiMeta })
  .partial()
  .passthrough();
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
const createEncounter_Body = PatApiResponse.and(
  z.object({ data: EncounterInput }).partial().passthrough()
);
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
const updateEncounter_Body = PatApiResponse.and(
  z.object({ data: EncounterUpdate }).partial().passthrough()
);
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
const createCondition_Body = PatApiResponse.and(
  z.object({ data: ConditionInput }).partial().passthrough()
);
const ConditionUpdate = z
  .object({
    code: CodeableConcept,
    severity: CodeableConcept,
    abatementDateTime: z.string().datetime({ offset: true }),
    status: z.enum(["active", "recurrence", "relapse", "inactive", "remission", "resolved"]),
  })
  .partial()
  .passthrough();
const updateCondition_Body = PatApiResponse.and(
  z.object({ data: ConditionUpdate }).partial().passthrough()
);
const AllergyInput = z
  .object({
    patientId: z.string(),
    code: CodeableConcept,
    reaction: z.array(AllergyReaction).optional(),
    criticality: z.enum(["low", "high", "unable-to-assess"]).optional(),
    status: z.enum(["active", "inactive", "resolved"]).optional().default("active"),
  })
  .passthrough();
const createAllergy_Body = PatApiResponse.and(
  z.object({ data: AllergyInput }).partial().passthrough()
);
const AllergyUpdate = z
  .object({
    reaction: z.array(AllergyReaction),
    criticality: z.enum(["low", "high", "unable-to-assess"]),
    status: z.enum(["active", "inactive", "resolved"]),
  })
  .partial()
  .passthrough();
const updateAllergy_Body = PatApiResponse.and(
  z.object({ data: AllergyUpdate }).partial().passthrough()
);
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
const createMedicationStatement_Body = PatApiResponse.and(
  z.object({ data: MedicationStatementInput }).partial().passthrough()
);
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
const updateMedicationStatement_Body = PatApiResponse.and(
  z.object({ data: MedicationStatementUpdate }).partial().passthrough()
);
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
const createMedicationOrder_Body = PatApiResponse.and(
  z.object({ data: MedicationOrderInput }).partial().passthrough()
);
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
const updateMedicationOrder_Body = PatApiResponse.and(
  z.object({ data: MedicationOrderUpdate }).partial().passthrough()
);
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
const createImmunization_Body = PatApiResponse.and(
  z.object({ data: ImmunizationInput }).partial().passthrough()
);
const ImmunizationUpdate = z
  .object({
    occurrenceDateTime: z.string().datetime({ offset: true }),
    status: z.enum(["completed", "entered-in-error", "not-done"]),
    lotNumber: z.string(),
  })
  .partial()
  .passthrough();
const updateImmunization_Body = PatApiResponse.and(
  z.object({ data: ImmunizationUpdate }).partial().passthrough()
);
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
const createObservation_Body = PatApiResponse.and(
  z.object({ data: ObservationInput }).partial().passthrough()
);
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
const updateObservation_Body = PatApiResponse.and(
  z.object({ data: ObservationUpdate }).partial().passthrough()
);
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
const createDiagnosticReport_Body = PatApiResponse.and(
  z.object({ data: DiagnosticReportInput }).partial().passthrough()
);
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
const updateDiagnosticReport_Body = PatApiResponse.and(
  z.object({ data: DiagnosticReportUpdate }).partial().passthrough()
);
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
const createImagingStudy_Body = PatApiResponse.and(
  z.object({ data: ImagingStudyInput }).partial().passthrough()
);
const ImagingStudyUpdate = z
  .object({
    status: z.enum(["registered", "available", "cancelled", "entered-in-error", "unknown"]),
  })
  .partial()
  .passthrough();
const updateImagingStudy_Body = PatApiResponse.and(
  z.object({ data: ImagingStudyUpdate }).partial().passthrough()
);
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
const createProcedure_Body = PatApiResponse.and(
  z.object({ data: ProcedureInput }).partial().passthrough()
);
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
const updateProcedure_Body = PatApiResponse.and(
  z.object({ data: ProcedureUpdate }).partial().passthrough()
);
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
const createNote_Body = PatApiResponse.and(
  z.object({ data: ClinicalNoteInput }).partial().passthrough()
);
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
const updateNote_Body = PatApiResponse.and(
  z.object({ data: ClinicalNoteUpdate }).partial().passthrough()
);
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
const createCareTeam_Body = PatApiResponse.and(
  z.object({ data: CareTeamInput }).partial().passthrough()
);
const CareTeamUpdate = z
  .object({
    participant: z.array(CareTeamParticipant),
    status: z.enum(["proposed", "active", "suspended", "inactive", "entered-in-error"]),
    period: Period,
  })
  .partial()
  .passthrough();
const updateCareTeam_Body = PatApiResponse.and(
  z.object({ data: CareTeamUpdate }).partial().passthrough()
);
const DocumentReferenceInput = z
  .object({
    patientId: z.string(),
    encounterId: z.string().optional(),
    type: CodeableConcept,
    content: z.array(DocumentContent).optional(),
    status: z.enum(["current", "superseded", "entered-in-error"]).optional().default("current"),
  })
  .passthrough();
const createDocument_Body = PatApiResponse.and(
  z.object({ data: DocumentReferenceInput }).partial().passthrough()
);
const DocumentReferenceUpdate = z
  .object({
    status: z.enum(["current", "superseded", "entered-in-error"]),
    content: z.array(DocumentContent),
  })
  .partial()
  .passthrough();
const updateDocument_Body = PatApiResponse.and(
  z.object({ data: DocumentReferenceUpdate }).partial().passthrough()
);

export const schemas = {
  PatApiMeta,
  PatApiResponse,
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
  createPatient_Body,
  Error,
  PatientUpdate,
  updatePatient_Body,
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
  PatApiListResponse,
  EncounterInput,
  createEncounter_Body,
  EncounterUpdate,
  updateEncounter_Body,
  ConditionInput,
  createCondition_Body,
  ConditionUpdate,
  updateCondition_Body,
  AllergyInput,
  createAllergy_Body,
  AllergyUpdate,
  updateAllergy_Body,
  MedicationStatementInput,
  createMedicationStatement_Body,
  MedicationStatementUpdate,
  updateMedicationStatement_Body,
  MedicationOrder,
  MedicationOrderInput,
  createMedicationOrder_Body,
  MedicationOrderUpdate,
  updateMedicationOrder_Body,
  MedicationAdministration,
  ImmunizationInput,
  createImmunization_Body,
  ImmunizationUpdate,
  updateImmunization_Body,
  ObservationInput,
  createObservation_Body,
  ObservationUpdate,
  updateObservation_Body,
  DiagnosticReportInput,
  createDiagnosticReport_Body,
  DiagnosticReportUpdate,
  updateDiagnosticReport_Body,
  ImagingStudy,
  ImagingStudyInput,
  createImagingStudy_Body,
  ImagingStudyUpdate,
  updateImagingStudy_Body,
  ImagingSeries,
  ProcedureInput,
  createProcedure_Body,
  ProcedureUpdate,
  updateProcedure_Body,
  ClinicalNoteInput,
  createNote_Body,
  ClinicalNoteUpdate,
  updateNote_Body,
  CareTeamParticipant,
  CareTeam,
  CareTeamInput,
  createCareTeam_Body,
  CareTeamUpdate,
  updateCareTeam_Body,
  DocumentReferenceInput,
  createDocument_Body,
  DocumentReferenceUpdate,
  updateDocument_Body,
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
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(Allergy) })
        .partial()
        .passthrough()
    ),
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
        schema: createAllergy_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: Allergy }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: Allergy }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateAllergy_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: Allergy }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
          .enum(["proposed", "active", "suspended", "inactive", "entered-in-error"])
          .optional(),
      },
    ],
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(CareTeam) })
        .partial()
        .passthrough()
    ),
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
        schema: createCareTeam_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: CareTeam }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: CareTeam }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateCareTeam_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: CareTeam }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
          .enum(["active", "recurrence", "relapse", "inactive", "remission", "resolved"])
          .optional(),
      },
    ],
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(Condition) })
        .partial()
        .passthrough()
    ),
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
        schema: createCondition_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: Condition }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: Condition }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateCondition_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: Condition }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(DiagnosticReport) })
        .partial()
        .passthrough()
    ),
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
        schema: createDiagnosticReport_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: DiagnosticReport }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: DiagnosticReport }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateDiagnosticReport_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: DiagnosticReport }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: z.enum(["current", "superseded", "entered-in-error"]).optional(),
      },
    ],
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(DocumentReference) })
        .partial()
        .passthrough()
    ),
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
        schema: createDocument_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: DocumentReference }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: DocumentReference }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateDocument_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: DocumentReference }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(Encounter) })
        .partial()
        .passthrough()
    ),
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
        schema: createEncounter_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: Encounter }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: Encounter }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateEncounter_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: Encounter }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: z.enum(["CR", "CT", "MR", "US", "MG", "PT", "NM", "XR", "DX", "OT"]).optional(),
      },
    ],
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(ImagingStudy) })
        .partial()
        .passthrough()
    ),
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
        schema: createImagingStudy_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: ImagingStudy }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: ImagingStudy }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateImagingStudy_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: ImagingStudy }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: z.enum(["completed", "entered-in-error", "not-done"]).optional(),
      },
    ],
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(Immunization) })
        .partial()
        .passthrough()
    ),
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
        schema: createImmunization_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: Immunization }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: Immunization }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateImmunization_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: Immunization }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(MedicationOrder) })
        .partial()
        .passthrough()
    ),
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
        schema: createMedicationOrder_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: MedicationOrder }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: MedicationOrder }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateMedicationOrder_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: MedicationOrder }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(MedicationStatement) })
        .partial()
        .passthrough()
    ),
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
        schema: createMedicationStatement_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: MedicationStatement }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: MedicationStatement }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateMedicationStatement_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: MedicationStatement }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
          .enum(["history-physical", "progress", "discharge", "consultation", "procedure", "other"])
          .optional(),
      },
    ],
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(ClinicalNote) })
        .partial()
        .passthrough()
    ),
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
        schema: createNote_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: ClinicalNote }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: ClinicalNote }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateNote_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: ClinicalNote }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: z.enum(["vital-sign", "laboratory", "exam", "survey"]).optional(),
      },
      {
        name: "code",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(Observation) })
        .partial()
        .passthrough()
    ),
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
        schema: createObservation_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: Observation }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: Observation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateObservation_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: Observation }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: PatientList }).partial().passthrough()),
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
        schema: createPatient_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: Patient }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: Patient }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updatePatient_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: Patient }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: z.enum(["vital-sign", "laboratory", "exam", "survey"]).optional(),
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
    response: PatApiResponse.and(z.object({ data: PatientSummary }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiListResponse.and(
      z
        .object({ data: z.array(Procedure) })
        .partial()
        .passthrough()
    ),
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
        schema: createProcedure_Body,
      },
    ],
    response: PatApiResponse.and(z.object({ data: Procedure }).partial().passthrough()),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
    response: PatApiResponse.and(z.object({ data: Procedure }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: updateProcedure_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      },
    ],
    response: PatApiResponse.and(z.object({ data: Procedure }).partial().passthrough()),
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
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
        schema: PatApiResponse.and(z.object({ data: Error }).partial().passthrough()),
      },
    ],
  },
]);

export const api = new Zodios("https://api.cuurai.com/api/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
