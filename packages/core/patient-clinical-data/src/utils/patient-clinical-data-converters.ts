/**
 * Patient Clinical Data Domain Converters
 *
 * Thin wrappers around centralized converters (packages/core/src/shared/helpers/core-converters.ts)
 * Converts between domain types (with Date objects) and API types (with ISO strings)
 *
 * Naming convention: {entity}ToApi (camelCase)
 */

import { ConverterPresets } from "../../../_shared/src/helpers/core-converters.js";
import type {
  Address,
  AllergyInput,
  AllergyReaction,
  AllergyUpdate,
  Attachment,
  CareTeamInput,
  CareTeamMember,
  CareTeamParticipant,
  CareTeamUpdate,
  ClinicalNoteInput,
  ClinicalNoteUpdate,
  CodeableConcept,
  Coding,
  ConditionInput,
  ConditionUpdate,
  ContactPoint,
  DiagnosticReportInput,
  DiagnosticReportUpdate,
  DocumentContent,
  DocumentReferenceInput,
  DocumentReferenceUpdate,
  Dosage,
  Duration,
  EncounterInput,
  EncounterUpdate,
  HumanName,
  ImagingSeries,
  ImagingStudyInput,
  ImagingStudyUpdate,
  ImmunizationInput,
  ImmunizationUpdate,
  MedicationOrderInput,
  MedicationOrderUpdate,
  MedicationStatementInput,
  MedicationStatementUpdate,
  ObservationInput,
  ObservationUpdate,
  Pagination,
  PatientInput,
  PatientList,
  PatientSummary,
  PatientUpdate,
  Period,
  ProcedureInput,
  ProcedureUpdate,
  Quantity,
  Timestamps,
} from "../types/index.js";

/**
 * Convert Address domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function addressToApi(address: Address): Address {
  return ConverterPresets.standardApiResponse(address, { dateFields: [] }) as Address;
}

/**
 * Convert AllergyInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function allergyInputToApi(allergyInput: AllergyInput): AllergyInput {
  return ConverterPresets.standardApiResponse(allergyInput, { dateFields: [] }) as AllergyInput;
}

/**
 * Convert AllergyReaction domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `onset`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function allergyReactionToApi(allergyReaction: AllergyReaction): AllergyReaction {
  return ConverterPresets.standardApiResponse(allergyReaction, { dateFields: ["onset"] }) as AllergyReaction;
}

/**
 * Convert AllergyUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function allergyUpdateToApi(allergyUpdate: AllergyUpdate): AllergyUpdate {
  return ConverterPresets.standardApiResponse(allergyUpdate, { dateFields: [] }) as AllergyUpdate;
}

/**
 * Convert Attachment domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function attachmentToApi(attachment: Attachment): Attachment {
  return ConverterPresets.standardApiResponse(attachment, { dateFields: [] }) as Attachment;
}

/**
 * Convert CareTeamInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function careTeamInputToApi(careTeamInput: CareTeamInput): CareTeamInput {
  return ConverterPresets.standardApiResponse(careTeamInput, { dateFields: [] }) as CareTeamInput;
}

/**
 * Convert CareTeamMember domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function careTeamMemberToApi(careTeamMember: CareTeamMember): CareTeamMember {
  return ConverterPresets.standardApiResponse(careTeamMember, { dateFields: [] }) as CareTeamMember;
}

/**
 * Convert CareTeamParticipant domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function careTeamParticipantToApi(careTeamParticipant: CareTeamParticipant): CareTeamParticipant {
  return ConverterPresets.standardApiResponse(careTeamParticipant, { dateFields: [] }) as CareTeamParticipant;
}

/**
 * Convert CareTeamUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function careTeamUpdateToApi(careTeamUpdate: CareTeamUpdate): CareTeamUpdate {
  return ConverterPresets.standardApiResponse(careTeamUpdate, { dateFields: [] }) as CareTeamUpdate;
}

/**
 * Convert ClinicalNoteInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function clinicalNoteInputToApi(clinicalNoteInput: ClinicalNoteInput): ClinicalNoteInput {
  return ConverterPresets.standardApiResponse(clinicalNoteInput, { dateFields: [] }) as ClinicalNoteInput;
}

/**
 * Convert ClinicalNoteUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function clinicalNoteUpdateToApi(clinicalNoteUpdate: ClinicalNoteUpdate): ClinicalNoteUpdate {
  return ConverterPresets.standardApiResponse(clinicalNoteUpdate, { dateFields: [] }) as ClinicalNoteUpdate;
}

/**
 * Convert CodeableConcept domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function codeableConceptToApi(codeableConcept: CodeableConcept): CodeableConcept {
  return ConverterPresets.standardApiResponse(codeableConcept, { dateFields: [] }) as CodeableConcept;
}

/**
 * Convert Coding domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function codingToApi(coding: Coding): Coding {
  return ConverterPresets.standardApiResponse(coding, { dateFields: [] }) as Coding;
}

/**
 * Convert ConditionInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `onsetDateTime`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function conditionInputToApi(conditionInput: ConditionInput): ConditionInput {
  return ConverterPresets.standardApiResponse(conditionInput, { dateFields: ["onsetDateTime"] }) as ConditionInput;
}

/**
 * Convert ConditionUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `abatementDateTime`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function conditionUpdateToApi(conditionUpdate: ConditionUpdate): ConditionUpdate {
  return ConverterPresets.standardApiResponse(conditionUpdate, { dateFields: ["abatementDateTime"] }) as ConditionUpdate;
}

/**
 * Convert ContactPoint domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function contactPointToApi(contactPoint: ContactPoint): ContactPoint {
  return ConverterPresets.standardApiResponse(contactPoint, { dateFields: [] }) as ContactPoint;
}

/**
 * Convert DiagnosticReportInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `effectiveDateTime`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function diagnosticReportInputToApi(diagnosticReportInput: DiagnosticReportInput): DiagnosticReportInput {
  return ConverterPresets.standardApiResponse(diagnosticReportInput, { dateFields: ["effectiveDateTime"] }) as DiagnosticReportInput;
}

/**
 * Convert DiagnosticReportUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function diagnosticReportUpdateToApi(diagnosticReportUpdate: DiagnosticReportUpdate): DiagnosticReportUpdate {
  return ConverterPresets.standardApiResponse(diagnosticReportUpdate, { dateFields: [] }) as DiagnosticReportUpdate;
}

/**
 * Convert DocumentContent domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function documentContentToApi(documentContent: DocumentContent): DocumentContent {
  return ConverterPresets.standardApiResponse(documentContent, { dateFields: [] }) as DocumentContent;
}

/**
 * Convert DocumentReferenceInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function documentReferenceInputToApi(documentReferenceInput: DocumentReferenceInput): DocumentReferenceInput {
  return ConverterPresets.standardApiResponse(documentReferenceInput, { dateFields: [] }) as DocumentReferenceInput;
}

/**
 * Convert DocumentReferenceUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function documentReferenceUpdateToApi(documentReferenceUpdate: DocumentReferenceUpdate): DocumentReferenceUpdate {
  return ConverterPresets.standardApiResponse(documentReferenceUpdate, { dateFields: [] }) as DocumentReferenceUpdate;
}

/**
 * Convert Dosage domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function dosageToApi(dosage: Dosage): Dosage {
  return ConverterPresets.standardApiResponse(dosage, { dateFields: [] }) as Dosage;
}

/**
 * Convert Duration domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function durationToApi(duration: Duration): Duration {
  return ConverterPresets.standardApiResponse(duration, { dateFields: [] }) as Duration;
}

/**
 * Convert EncounterInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function encounterInputToApi(encounterInput: EncounterInput): EncounterInput {
  return ConverterPresets.standardApiResponse(encounterInput, { dateFields: [] }) as EncounterInput;
}

/**
 * Convert EncounterUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function encounterUpdateToApi(encounterUpdate: EncounterUpdate): EncounterUpdate {
  return ConverterPresets.standardApiResponse(encounterUpdate, { dateFields: [] }) as EncounterUpdate;
}

/**
 * Convert HumanName domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function humanNameToApi(humanName: HumanName): HumanName {
  return ConverterPresets.standardApiResponse(humanName, { dateFields: [] }) as HumanName;
}

/**
 * Convert ImagingSeries domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `started`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function imagingSeriesToApi(imagingSeries: ImagingSeries): ImagingSeries {
  return ConverterPresets.standardApiResponse(imagingSeries, { dateFields: ["started"] }) as ImagingSeries;
}

/**
 * Convert ImagingStudyInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `started`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function imagingStudyInputToApi(imagingStudyInput: ImagingStudyInput): ImagingStudyInput {
  return ConverterPresets.standardApiResponse(imagingStudyInput, { dateFields: ["started"] }) as ImagingStudyInput;
}

/**
 * Convert ImagingStudyUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function imagingStudyUpdateToApi(imagingStudyUpdate: ImagingStudyUpdate): ImagingStudyUpdate {
  return ConverterPresets.standardApiResponse(imagingStudyUpdate, { dateFields: [] }) as ImagingStudyUpdate;
}

/**
 * Convert ImmunizationInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `occurrenceDateTime`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function immunizationInputToApi(immunizationInput: ImmunizationInput): ImmunizationInput {
  return ConverterPresets.standardApiResponse(immunizationInput, { dateFields: ["occurrenceDateTime"] }) as ImmunizationInput;
}

/**
 * Convert ImmunizationUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `occurrenceDateTime`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function immunizationUpdateToApi(immunizationUpdate: ImmunizationUpdate): ImmunizationUpdate {
  return ConverterPresets.standardApiResponse(immunizationUpdate, { dateFields: ["occurrenceDateTime"] }) as ImmunizationUpdate;
}

/**
 * Convert MedicationOrderInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function medicationOrderInputToApi(medicationOrderInput: MedicationOrderInput): MedicationOrderInput {
  return ConverterPresets.standardApiResponse(medicationOrderInput, { dateFields: [] }) as MedicationOrderInput;
}

/**
 * Convert MedicationOrderUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function medicationOrderUpdateToApi(medicationOrderUpdate: MedicationOrderUpdate): MedicationOrderUpdate {
  return ConverterPresets.standardApiResponse(medicationOrderUpdate, { dateFields: [] }) as MedicationOrderUpdate;
}

/**
 * Convert MedicationStatementInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function medicationStatementInputToApi(medicationStatementInput: MedicationStatementInput): MedicationStatementInput {
  return ConverterPresets.standardApiResponse(medicationStatementInput, { dateFields: [] }) as MedicationStatementInput;
}

/**
 * Convert MedicationStatementUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function medicationStatementUpdateToApi(medicationStatementUpdate: MedicationStatementUpdate): MedicationStatementUpdate {
  return ConverterPresets.standardApiResponse(medicationStatementUpdate, { dateFields: [] }) as MedicationStatementUpdate;
}

/**
 * Convert ObservationInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `effectiveDateTime`, `valueDateTime`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function observationInputToApi(observationInput: ObservationInput): ObservationInput {
  return ConverterPresets.standardApiResponse(observationInput, { dateFields: ["effectiveDateTime", "valueDateTime"] }) as ObservationInput;
}

/**
 * Convert ObservationUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `valueDateTime`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function observationUpdateToApi(observationUpdate: ObservationUpdate): ObservationUpdate {
  return ConverterPresets.standardApiResponse(observationUpdate, { dateFields: ["valueDateTime"] }) as ObservationUpdate;
}

/**
 * Convert Pagination domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function paginationToApi(pagination: Pagination): Pagination {
  return ConverterPresets.standardApiResponse(pagination, { dateFields: [] }) as Pagination;
}

/**
 * Convert PatientInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function patientInputToApi(patientInput: PatientInput): PatientInput {
  return ConverterPresets.standardApiResponse(patientInput, { dateFields: [] }) as PatientInput;
}

/**
 * Convert PatientList domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function patientListToApi(patientList: PatientList): PatientList {
  return ConverterPresets.standardApiResponse(patientList, { dateFields: [] }) as PatientList;
}

/**
 * Convert PatientSummary domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `lastEncounterDate`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function patientSummaryToApi(patientSummary: PatientSummary): PatientSummary {
  return ConverterPresets.standardApiResponse(patientSummary, { dateFields: ["lastEncounterDate"] }) as PatientSummary;
}

/**
 * Convert PatientUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function patientUpdateToApi(patientUpdate: PatientUpdate): PatientUpdate {
  return ConverterPresets.standardApiResponse(patientUpdate, { dateFields: [] }) as PatientUpdate;
}

/**
 * Convert Period domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `end`, `start`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function periodToApi(period: Period): Period {
  return ConverterPresets.standardApiResponse(period, { dateFields: ["end", "start"] }) as Period;
}

/**
 * Convert ProcedureInput domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function procedureInputToApi(procedureInput: ProcedureInput): ProcedureInput {
  return ConverterPresets.standardApiResponse(procedureInput, { dateFields: [] }) as ProcedureInput;
}

/**
 * Convert ProcedureUpdate domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function procedureUpdateToApi(procedureUpdate: ProcedureUpdate): ProcedureUpdate {
  return ConverterPresets.standardApiResponse(procedureUpdate, { dateFields: [] }) as ProcedureUpdate;
}

/**
 * Convert Quantity domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * No date-time fields detected in OpenAPI schema - no date conversion performed
 */
export function quantityToApi(quantity: Quantity): Quantity {
  return ConverterPresets.standardApiResponse(quantity, { dateFields: [] }) as Quantity;
}

/**
 * Convert Timestamps domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *
 *
 * Date fields converted: `createdAt`, `updatedAt`
 *
 * Error handling:
 * - Invalid Date objects are converted to null
 * - Non-Date values are left unchanged (with console warnings in development mode)
 * - String values are assumed to already be in ISO format and are left unchanged
 */
export function timestampsToApi(timestamps: Timestamps): Timestamps {
  return ConverterPresets.standardApiResponse(timestamps, { dateFields: ["createdAt", "updatedAt"] }) as Timestamps;
}
