import { ListParams, ListResponse } from "../../core/resource-service";
import type {
  Patient,
  PatientInput,
  PatientUpdate,
  Encounter,
  EncounterInput,
  EncounterUpdate,
  Observation,
  ObservationInput,
  ObservationUpdate,
  Condition,
  ConditionInput,
  ConditionUpdate,
  MedicationStatement,
  MedicationStatementInput,
  MedicationStatementUpdate,
  DiagnosticReport,
  DiagnosticReportInput,
  DiagnosticReportUpdate,
  Procedure,
  ProcedureInput,
  ProcedureUpdate,
  Immunization,
  ImmunizationInput,
  ImmunizationUpdate,
  DocumentReference,
  DocumentReferenceInput,
  DocumentReferenceUpdate,
  ListPatientsParams,
  ListEncountersParams,
  ListObservationsParams,
  ListConditionsParams,
  ListMedicationStatementsParams,
  ListDiagnosticReportsParams,
  ListProceduresParams,
  ListImmunizationsParams,
  ListDocumentsParams,
} from "@cuur/core/patient-clinical-data/types";

// Re-export types from core
export type {
  Patient,
  Encounter,
  Observation,
  Condition,
  MedicationStatement,
  Procedure,
  Immunization,
  DocumentReference,
};

// Input types
export type CreatePatientInput = PatientInput;
export type UpdatePatientInput = PatientUpdate;
export type CreateEncounterInput = EncounterInput;
export type UpdateEncounterInput = EncounterUpdate;
export type CreateObservationInput = ObservationInput;
export type UpdateObservationInput = ObservationUpdate;
export type CreateConditionInput = ConditionInput;
export type UpdateConditionInput = ConditionUpdate;
export type CreateMedicationInput = MedicationStatementInput;
export type UpdateMedicationInput = MedicationStatementUpdate;
export type CreateDiagnosticReportInput = DiagnosticReportInput;
export type UpdateDiagnosticReportInput = DiagnosticReportUpdate;
export type CreateProcedureInput = ProcedureInput;
export type UpdateProcedureInput = ProcedureUpdate;
export type CreateImmunizationInput = ImmunizationInput;
export type UpdateImmunizationInput = ImmunizationUpdate;
export type CreateDocumentInput = DocumentReferenceInput;
export type UpdateDocumentInput = DocumentReferenceUpdate;

// List params and response types
export type PatientListParams = ListPatientsParams & ListParams;
export type PatientListResponse = ListResponse<Patient>;
export type EncounterListParams = ListEncountersParams & ListParams;
export type EncounterListResponse = ListResponse<Encounter>;
export type ObservationListParams = ListObservationsParams & ListParams;
export type ObservationListResponse = ListResponse<Observation>;
export type ConditionListParams = ListConditionsParams & ListParams;
export type ConditionListResponse = ListResponse<Condition>;
export type MedicationListParams = ListMedicationStatementsParams & ListParams;
export type MedicationListResponse = ListResponse<MedicationStatement>;
export type DiagnosticReportListParams = ListDiagnosticReportsParams & ListParams;
export type DiagnosticReportListResponse = ListResponse<DiagnosticReport>;
export type ProcedureListParams = ListProceduresParams & ListParams;
export type ProcedureListResponse = ListResponse<Procedure>;
export type ImmunizationListParams = ListImmunizationsParams & ListParams;
export type ImmunizationListResponse = ListResponse<Immunization>;
export type DocumentListParams = ListDocumentsParams & ListParams;
export type DocumentListResponse = ListResponse<DocumentReference>;
