/**
 * Patient Clinical Data Domain Types
 *
 * Auto-generated from OpenAPI spec
 * Generator: types-generator v2.0.0
 *
 * This file re-exports types from generated OpenAPI types and adds
 * convenient type aliases for handlers (response types, etc.)
 *
 * ⚠️ DO NOT EDIT MANUALLY - this file is auto-generated
 */

import type { components, operations } from "@cuur-cde/core/patient-clinical-data/openapi/patient-clinical-data.openapi.types";

// ============================================================================
// Re-export all generated types
// ============================================================================
// Note: components and operations are exported here but should be accessed via namespace
// in main index.ts to avoid duplicate export errors (e.g., blockchain.types.components)

export type { components, operations };

// ============================================================================
// Convenient Type Aliases for Schemas
// ============================================================================

export type Address = components["schemas"]["Address"];
export type Allergy = components["schemas"]["Allergy"];
export type AllergyInput = components["schemas"]["AllergyInput"];
export type AllergyReaction = components["schemas"]["AllergyReaction"];
export type AllergyUpdate = components["schemas"]["AllergyUpdate"];
export type Attachment = components["schemas"]["Attachment"];
export type CareTeam = components["schemas"]["CareTeam"];
export type CareTeamInput = components["schemas"]["CareTeamInput"];
export type CareTeamMember = components["schemas"]["CareTeamMember"];
export type CareTeamParticipant = components["schemas"]["CareTeamParticipant"];
export type CareTeamUpdate = components["schemas"]["CareTeamUpdate"];
export type ClinicalNote = components["schemas"]["ClinicalNote"];
export type ClinicalNoteInput = components["schemas"]["ClinicalNoteInput"];
export type ClinicalNoteUpdate = components["schemas"]["ClinicalNoteUpdate"];
export type CodeableConcept = components["schemas"]["CodeableConcept"];
export type Coding = components["schemas"]["Coding"];
export type Condition = components["schemas"]["Condition"];
export type ConditionInput = components["schemas"]["ConditionInput"];
export type ConditionUpdate = components["schemas"]["ConditionUpdate"];
export type ContactPoint = components["schemas"]["ContactPoint"];
export type DiagnosticReport = components["schemas"]["DiagnosticReport"];
export type DiagnosticReportInput = components["schemas"]["DiagnosticReportInput"];
export type DiagnosticReportUpdate = components["schemas"]["DiagnosticReportUpdate"];
export type DocumentContent = components["schemas"]["DocumentContent"];
export type DocumentReference = components["schemas"]["DocumentReference"];
export type DocumentReferenceInput = components["schemas"]["DocumentReferenceInput"];
export type DocumentReferenceUpdate = components["schemas"]["DocumentReferenceUpdate"];
export type Dosage = components["schemas"]["Dosage"];
export type Duration = components["schemas"]["Duration"];
export type Encounter = components["schemas"]["Encounter"];
export type EncounterInput = components["schemas"]["EncounterInput"];
export type EncounterUpdate = components["schemas"]["EncounterUpdate"];
export type HumanName = components["schemas"]["HumanName"];
export type Identifier = components["schemas"]["Identifier"];
export type ImagingSeries = components["schemas"]["ImagingSeries"];
export type ImagingStudy = components["schemas"]["ImagingStudy"];
export type ImagingStudyInput = components["schemas"]["ImagingStudyInput"];
export type ImagingStudyUpdate = components["schemas"]["ImagingStudyUpdate"];
export type Immunization = components["schemas"]["Immunization"];
export type ImmunizationInput = components["schemas"]["ImmunizationInput"];
export type ImmunizationUpdate = components["schemas"]["ImmunizationUpdate"];
export type MedicationAdministration = components["schemas"]["MedicationAdministration"];
export type MedicationOrder = components["schemas"]["MedicationOrder"];
export type MedicationOrderInput = components["schemas"]["MedicationOrderInput"];
export type MedicationOrderUpdate = components["schemas"]["MedicationOrderUpdate"];
export type MedicationStatement = components["schemas"]["MedicationStatement"];
export type MedicationStatementInput = components["schemas"]["MedicationStatementInput"];
export type MedicationStatementUpdate = components["schemas"]["MedicationStatementUpdate"];
export type Observation = components["schemas"]["Observation"];
export type ObservationInput = components["schemas"]["ObservationInput"];
export type ObservationUpdate = components["schemas"]["ObservationUpdate"];
export type Pagination = components["schemas"]["Pagination"];
export type Patient = components["schemas"]["Patient"];
export type PatientInput = components["schemas"]["PatientInput"];
export type PatientList = components["schemas"]["PatientList"];
export type PatientSummary = components["schemas"]["PatientSummary"];
export type PatientUpdate = components["schemas"]["PatientUpdate"];
export type Period = components["schemas"]["Period"];
export type Procedure = components["schemas"]["Procedure"];
export type ProcedureInput = components["schemas"]["ProcedureInput"];
export type ProcedureUpdate = components["schemas"]["ProcedureUpdate"];
export type Quantity = components["schemas"]["Quantity"];
export type Timestamps = components["schemas"]["Timestamps"];
export type PatientEncounter =
  operations["listPatientEncounters"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientCondition =
  operations["listPatientConditions"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientAllergy =
  operations["listPatientAllergies"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientMedication =
  operations["listPatientMedications"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientImmunization =
  operations["listPatientImmunizations"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientObservation =
  operations["listPatientObservations"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientVital =
  operations["listPatientVitals"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientLab =
  operations["listPatientLabs"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientDiagnosticReport =
  operations["listPatientDiagnosticReports"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientProcedure =
  operations["listPatientProcedures"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientNote =
  operations["listPatientNotes"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientCareTeam =
  operations["listPatientCareTeam"]["responses"]["200"]["content"]["application/json"]["data"];
export type PatientDocument =
  operations["listPatientDocuments"]["responses"]["200"]["content"]["application/json"]["data"];
export type EncounterCondition =
  operations["listEncounterConditions"]["responses"]["200"]["content"]["application/json"]["data"];
export type EncounterObservation =
  operations["listEncounterObservations"]["responses"]["200"]["content"]["application/json"]["data"];
export type EncounterDiagnosticReport =
  operations["listEncounterDiagnosticReports"]["responses"]["200"]["content"]["application/json"]["data"];
export type EncounterProcedure =
  operations["listEncounterProcedures"]["responses"]["200"]["content"]["application/json"]["data"];
export type EncounterNote =
  operations["listEncounterNotes"]["responses"]["200"]["content"]["application/json"]["data"];
export type ConditionNote =
  operations["listConditionNotes"]["responses"]["200"]["content"]["application/json"]["data"];
export type DiagnosticReportObservation =
  operations["listDiagnosticReportObservations"]["responses"]["200"]["content"]["application/json"]["data"];
export type DiagnosticReportImagingStudy =
  operations["listDiagnosticReportImagingStudies"]["responses"]["200"]["content"]["application/json"]["data"];
export type ImagingStudySeries =
  operations["listImagingStudySeries"]["responses"]["200"]["content"]["application/json"]["data"];
export type Note =
  operations["listNotes"]["responses"]["200"]["content"]["application/json"]["data"];
export type Document =
  operations["listDocuments"]["responses"]["200"]["content"]["application/json"]["data"];

// ============================================================================
// Operation Input Types (Request Bodies)
// ============================================================================

// These types represent the input data for create/update operations

export type CreatePatientInput = NonNullable<
  operations["createPatient"]["requestBody"]
>["content"]["application/json"];
export type UpdatePatientInput = NonNullable<
  operations["updatePatient"]["requestBody"]
>["content"]["application/json"];
export type CreateEncounterInput = NonNullable<
  operations["createEncounter"]["requestBody"]
>["content"]["application/json"];
export type UpdateEncounterInput = NonNullable<
  operations["updateEncounter"]["requestBody"]
>["content"]["application/json"];
export type CreateConditionInput = NonNullable<
  operations["createCondition"]["requestBody"]
>["content"]["application/json"];
export type UpdateConditionInput = NonNullable<
  operations["updateCondition"]["requestBody"]
>["content"]["application/json"];
export type CreateAllergyInput = NonNullable<
  operations["createAllergy"]["requestBody"]
>["content"]["application/json"];
export type UpdateAllergyInput = NonNullable<
  operations["updateAllergy"]["requestBody"]
>["content"]["application/json"];
export type CreateMedicationStatementInput = NonNullable<
  operations["createMedicationStatement"]["requestBody"]
>["content"]["application/json"];
export type UpdateMedicationStatementInput = NonNullable<
  operations["updateMedicationStatement"]["requestBody"]
>["content"]["application/json"];
export type CreateMedicationOrderInput = NonNullable<
  operations["createMedicationOrder"]["requestBody"]
>["content"]["application/json"];
export type UpdateMedicationOrderInput = NonNullable<
  operations["updateMedicationOrder"]["requestBody"]
>["content"]["application/json"];
export type CreateImmunizationInput = NonNullable<
  operations["createImmunization"]["requestBody"]
>["content"]["application/json"];
export type UpdateImmunizationInput = NonNullable<
  operations["updateImmunization"]["requestBody"]
>["content"]["application/json"];
export type CreateObservationInput = NonNullable<
  operations["createObservation"]["requestBody"]
>["content"]["application/json"];
export type UpdateObservationInput = NonNullable<
  operations["updateObservation"]["requestBody"]
>["content"]["application/json"];
export type CreateDiagnosticReportInput = NonNullable<
  operations["createDiagnosticReport"]["requestBody"]
>["content"]["application/json"];
export type UpdateDiagnosticReportInput = NonNullable<
  operations["updateDiagnosticReport"]["requestBody"]
>["content"]["application/json"];
export type CreateImagingStudyInput = NonNullable<
  operations["createImagingStudy"]["requestBody"]
>["content"]["application/json"];
export type UpdateImagingStudyInput = NonNullable<
  operations["updateImagingStudy"]["requestBody"]
>["content"]["application/json"];
export type CreateProcedureInput = NonNullable<
  operations["createProcedure"]["requestBody"]
>["content"]["application/json"];
export type UpdateProcedureInput = NonNullable<
  operations["updateProcedure"]["requestBody"]
>["content"]["application/json"];
export type CreateNoteInput = NonNullable<
  operations["createNote"]["requestBody"]
>["content"]["application/json"];
export type UpdateNoteInput = NonNullable<
  operations["updateNote"]["requestBody"]
>["content"]["application/json"];
export type CreateCareTeamInput = NonNullable<
  operations["createCareTeam"]["requestBody"]
>["content"]["application/json"];
export type UpdateCareTeamInput = NonNullable<
  operations["updateCareTeam"]["requestBody"]
>["content"]["application/json"];
export type CreateDocumentInput = NonNullable<
  operations["createDocument"]["requestBody"]
>["content"]["application/json"];
export type UpdateDocumentInput = NonNullable<
  operations["updateDocument"]["requestBody"]
>["content"]["application/json"];

// ============================================================================
// Type Aliases for Repository Interfaces (Update*Request → Update*Input)
// ============================================================================

// These aliases provide backward compatibility for repository interfaces
// that use Update*Request naming convention instead of Update*Input

export type UpdateAllergyRequest = UpdateAllergyInput;
export type UpdateCareTeamRequest = UpdateCareTeamInput;
export type UpdateClinicalNoteRequest = UpdateNoteInput;
export type UpdateConditionRequest = UpdateConditionInput;
export type UpdateDiagnosticReportRequest = UpdateDiagnosticReportInput;
export type UpdateDocumentReferenceRequest = UpdateDocumentInput;
export type UpdateEncounterRequest = UpdateEncounterInput;
export type UpdateImagingStudyRequest = UpdateImagingStudyInput;
export type UpdateImmunizationRequest = UpdateImmunizationInput;
export type UpdateMedicationOrderRequest = UpdateMedicationOrderInput;
export type UpdateMedicationStatementRequest = UpdateMedicationStatementInput;
export type UpdateObservationRequest = UpdateObservationInput;
export type UpdatePatientRequest = UpdatePatientInput;
export type UpdateProcedureRequest = UpdateProcedureInput;

// ============================================================================
// Operation Parameter Types (Query Parameters)
// ============================================================================

// These types represent query parameters for list/search operations

export type ListPatientsParams = operations["listPatients"]["parameters"]["query"];
export type ListPatientObservationsParams =
  operations["listPatientObservations"]["parameters"]["query"];
export type ListEncountersParams = operations["listEncounters"]["parameters"]["query"];
export type ListConditionsParams = operations["listConditions"]["parameters"]["query"];
export type ListAllergiesParams = operations["listAllergies"]["parameters"]["query"];
export type ListMedicationStatementsParams =
  operations["listMedicationStatements"]["parameters"]["query"];
export type ListMedicationOrdersParams = operations["listMedicationOrders"]["parameters"]["query"];
export type ListImmunizationsParams = operations["listImmunizations"]["parameters"]["query"];
export type ListObservationsParams = operations["listObservations"]["parameters"]["query"];
export type ListDiagnosticReportsParams =
  operations["listDiagnosticReports"]["parameters"]["query"];
export type ListImagingStudiesParams = operations["listImagingStudies"]["parameters"]["query"];
export type ListProceduresParams = operations["listProcedures"]["parameters"]["query"];
export type ListNotesParams = operations["listNotes"]["parameters"]["query"];
export type ListCareTeamsParams = operations["listCareTeams"]["parameters"]["query"];
export type ListDocumentsParams = operations["listDocuments"]["parameters"]["query"];

// ============================================================================
// Operation Response Types
// ============================================================================

// These types are used by handlers for type-safe response envelopes

export type ListPatientsResponse =
  operations["listPatients"]["responses"]["200"]["content"]["application/json"];
export type CreatePatientResponse =
  operations["createPatient"]["responses"]["201"]["content"]["application/json"];
export type GetPatientResponse =
  operations["getPatient"]["responses"]["200"]["content"]["application/json"];
export type UpdatePatientResponse =
  operations["updatePatient"]["responses"]["200"]["content"]["application/json"];
export type GetPatientSummaryResponse =
  operations["getPatientSummary"]["responses"]["200"]["content"]["application/json"];
export type ListPatientEncountersResponse =
  operations["listPatientEncounters"]["responses"]["200"]["content"]["application/json"];
export type ListPatientConditionsResponse =
  operations["listPatientConditions"]["responses"]["200"]["content"]["application/json"];
export type ListPatientAllergiesResponse =
  operations["listPatientAllergies"]["responses"]["200"]["content"]["application/json"];
export type ListPatientMedicationsResponse =
  operations["listPatientMedications"]["responses"]["200"]["content"]["application/json"];
export type ListPatientImmunizationsResponse =
  operations["listPatientImmunizations"]["responses"]["200"]["content"]["application/json"];
export type ListPatientObservationsResponse =
  operations["listPatientObservations"]["responses"]["200"]["content"]["application/json"];
export type ListPatientVitalsResponse =
  operations["listPatientVitals"]["responses"]["200"]["content"]["application/json"];
export type ListPatientLabsResponse =
  operations["listPatientLabs"]["responses"]["200"]["content"]["application/json"];
export type ListPatientDiagnosticReportsResponse =
  operations["listPatientDiagnosticReports"]["responses"]["200"]["content"]["application/json"];
export type ListPatientProceduresResponse =
  operations["listPatientProcedures"]["responses"]["200"]["content"]["application/json"];
export type ListPatientNotesResponse =
  operations["listPatientNotes"]["responses"]["200"]["content"]["application/json"];
export type ListPatientCareTeamResponse =
  operations["listPatientCareTeam"]["responses"]["200"]["content"]["application/json"];
export type ListPatientDocumentsResponse =
  operations["listPatientDocuments"]["responses"]["200"]["content"]["application/json"];
export type ListEncountersResponse =
  operations["listEncounters"]["responses"]["200"]["content"]["application/json"];
export type CreateEncounterResponse =
  operations["createEncounter"]["responses"]["201"]["content"]["application/json"];
export type GetEncounterResponse =
  operations["getEncounter"]["responses"]["200"]["content"]["application/json"];
export type UpdateEncounterResponse =
  operations["updateEncounter"]["responses"]["200"]["content"]["application/json"];
export type ListEncounterConditionsResponse =
  operations["listEncounterConditions"]["responses"]["200"]["content"]["application/json"];
export type ListEncounterObservationsResponse =
  operations["listEncounterObservations"]["responses"]["200"]["content"]["application/json"];
export type ListEncounterDiagnosticReportsResponse =
  operations["listEncounterDiagnosticReports"]["responses"]["200"]["content"]["application/json"];
export type ListEncounterProceduresResponse =
  operations["listEncounterProcedures"]["responses"]["200"]["content"]["application/json"];
export type ListEncounterNotesResponse =
  operations["listEncounterNotes"]["responses"]["200"]["content"]["application/json"];
export type ListConditionsResponse =
  operations["listConditions"]["responses"]["200"]["content"]["application/json"];
export type CreateConditionResponse =
  operations["createCondition"]["responses"]["201"]["content"]["application/json"];
export type GetConditionResponse =
  operations["getCondition"]["responses"]["200"]["content"]["application/json"];
export type UpdateConditionResponse =
  operations["updateCondition"]["responses"]["200"]["content"]["application/json"];
export type ListConditionNotesResponse =
  operations["listConditionNotes"]["responses"]["200"]["content"]["application/json"];
export type ListAllergiesResponse =
  operations["listAllergies"]["responses"]["200"]["content"]["application/json"];
export type CreateAllergyResponse =
  operations["createAllergy"]["responses"]["201"]["content"]["application/json"];
export type GetAllergyResponse =
  operations["getAllergy"]["responses"]["200"]["content"]["application/json"];
export type UpdateAllergyResponse =
  operations["updateAllergy"]["responses"]["200"]["content"]["application/json"];
export type ListMedicationStatementsResponse =
  operations["listMedicationStatements"]["responses"]["200"]["content"]["application/json"];
export type CreateMedicationStatementResponse =
  operations["createMedicationStatement"]["responses"]["201"]["content"]["application/json"];
export type GetMedicationStatementResponse =
  operations["getMedicationStatement"]["responses"]["200"]["content"]["application/json"];
export type UpdateMedicationStatementResponse =
  operations["updateMedicationStatement"]["responses"]["200"]["content"]["application/json"];
export type ListMedicationOrdersResponse =
  operations["listMedicationOrders"]["responses"]["200"]["content"]["application/json"];
export type CreateMedicationOrderResponse =
  operations["createMedicationOrder"]["responses"]["201"]["content"]["application/json"];
export type GetMedicationOrderResponse =
  operations["getMedicationOrder"]["responses"]["200"]["content"]["application/json"];
export type UpdateMedicationOrderResponse =
  operations["updateMedicationOrder"]["responses"]["200"]["content"]["application/json"];
export type ListMedicationAdministrationsResponse =
  operations["listMedicationAdministrations"]["responses"]["200"]["content"]["application/json"];
export type ListImmunizationsResponse =
  operations["listImmunizations"]["responses"]["200"]["content"]["application/json"];
export type CreateImmunizationResponse =
  operations["createImmunization"]["responses"]["201"]["content"]["application/json"];
export type GetImmunizationResponse =
  operations["getImmunization"]["responses"]["200"]["content"]["application/json"];
export type UpdateImmunizationResponse =
  operations["updateImmunization"]["responses"]["200"]["content"]["application/json"];
export type ListObservationsResponse =
  operations["listObservations"]["responses"]["200"]["content"]["application/json"];
export type CreateObservationResponse =
  operations["createObservation"]["responses"]["201"]["content"]["application/json"];
export type GetObservationResponse =
  operations["getObservation"]["responses"]["200"]["content"]["application/json"];
export type UpdateObservationResponse =
  operations["updateObservation"]["responses"]["200"]["content"]["application/json"];
export type ListDiagnosticReportsResponse =
  operations["listDiagnosticReports"]["responses"]["200"]["content"]["application/json"];
export type CreateDiagnosticReportResponse =
  operations["createDiagnosticReport"]["responses"]["201"]["content"]["application/json"];
export type GetDiagnosticReportResponse =
  operations["getDiagnosticReport"]["responses"]["200"]["content"]["application/json"];
export type UpdateDiagnosticReportResponse =
  operations["updateDiagnosticReport"]["responses"]["200"]["content"]["application/json"];
export type ListDiagnosticReportObservationsResponse =
  operations["listDiagnosticReportObservations"]["responses"]["200"]["content"]["application/json"];
export type ListDiagnosticReportImagingStudiesResponse =
  operations["listDiagnosticReportImagingStudies"]["responses"]["200"]["content"]["application/json"];
export type ListImagingStudiesResponse =
  operations["listImagingStudies"]["responses"]["200"]["content"]["application/json"];
export type CreateImagingStudyResponse =
  operations["createImagingStudy"]["responses"]["201"]["content"]["application/json"];
export type GetImagingStudyResponse =
  operations["getImagingStudy"]["responses"]["200"]["content"]["application/json"];
export type UpdateImagingStudyResponse =
  operations["updateImagingStudy"]["responses"]["200"]["content"]["application/json"];
export type ListImagingStudySeriesResponse =
  operations["listImagingStudySeries"]["responses"]["200"]["content"]["application/json"];
export type ListProceduresResponse =
  operations["listProcedures"]["responses"]["200"]["content"]["application/json"];
export type CreateProcedureResponse =
  operations["createProcedure"]["responses"]["201"]["content"]["application/json"];
export type GetProcedureResponse =
  operations["getProcedure"]["responses"]["200"]["content"]["application/json"];
export type UpdateProcedureResponse =
  operations["updateProcedure"]["responses"]["200"]["content"]["application/json"];
export type ListNotesResponse =
  operations["listNotes"]["responses"]["200"]["content"]["application/json"];
export type CreateNoteResponse =
  operations["createNote"]["responses"]["201"]["content"]["application/json"];
export type GetNoteResponse =
  operations["getNote"]["responses"]["200"]["content"]["application/json"];
export type UpdateNoteResponse =
  operations["updateNote"]["responses"]["200"]["content"]["application/json"];
export type ListCareTeamsResponse =
  operations["listCareTeams"]["responses"]["200"]["content"]["application/json"];
export type CreateCareTeamResponse =
  operations["createCareTeam"]["responses"]["201"]["content"]["application/json"];
export type GetCareTeamResponse =
  operations["getCareTeam"]["responses"]["200"]["content"]["application/json"];
export type UpdateCareTeamResponse =
  operations["updateCareTeam"]["responses"]["200"]["content"]["application/json"];
export type ListDocumentsResponse =
  operations["listDocuments"]["responses"]["200"]["content"]["application/json"];
export type CreateDocumentResponse =
  operations["createDocument"]["responses"]["201"]["content"]["application/json"];
export type GetDocumentResponse =
  operations["getDocument"]["responses"]["200"]["content"]["application/json"];
export type UpdateDocumentResponse =
  operations["updateDocument"]["responses"]["200"]["content"]["application/json"];
