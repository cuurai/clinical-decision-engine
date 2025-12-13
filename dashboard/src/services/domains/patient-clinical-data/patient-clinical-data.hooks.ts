import { useResourceHook } from "../../core/use-resource";
import { patientClinicalDataServices } from "./patient-clinical-data.service";
import type {
  Patient,
  CreatePatientInput,
  UpdatePatientInput,
  Encounter,
  CreateEncounterInput,
  UpdateEncounterInput,
  Observation,
  CreateObservationInput,
  UpdateObservationInput,
  Condition,
  CreateConditionInput,
  UpdateConditionInput,
  MedicationStatement,
  CreateMedicationInput,
  UpdateMedicationInput,
  DiagnosticReport,
  CreateDiagnosticReportInput,
  UpdateDiagnosticReportInput,
  Procedure,
  CreateProcedureInput,
  UpdateProcedureInput,
  Immunization,
  CreateImmunizationInput,
  UpdateImmunizationInput,
  DocumentReference,
  CreateDocumentInput,
  UpdateDocumentInput,
  PatientListParams,
  EncounterListParams,
  ObservationListParams,
  ConditionListParams,
  MedicationListParams,
  DiagnosticReportListParams,
  ProcedureListParams,
  ImmunizationListParams,
  DocumentListParams,
} from "./patient-clinical-data.types";

export function usePatients(autoFetch = true, params?: PatientListParams) {
  return useResourceHook<Patient, CreatePatientInput, UpdatePatientInput, PatientListParams>(
    patientClinicalDataServices.patients,
    autoFetch,
    params
  );
}

export function useEncounters(autoFetch = true, params?: EncounterListParams) {
  return useResourceHook<
    Encounter,
    CreateEncounterInput,
    UpdateEncounterInput,
    EncounterListParams
  >(patientClinicalDataServices.encounters, autoFetch, params);
}

export function useObservations(autoFetch = true, params?: ObservationListParams) {
  return useResourceHook<
    Observation,
    CreateObservationInput,
    UpdateObservationInput,
    ObservationListParams
  >(patientClinicalDataServices.observations, autoFetch, params);
}

export function useConditions(autoFetch = true, params?: ConditionListParams) {
  return useResourceHook<
    Condition,
    CreateConditionInput,
    UpdateConditionInput,
    ConditionListParams
  >(patientClinicalDataServices.conditions, autoFetch, params);
}

export function useMedications(autoFetch = true, params?: MedicationListParams) {
  return useResourceHook<
    MedicationStatement,
    CreateMedicationInput,
    UpdateMedicationInput,
    MedicationListParams
  >(patientClinicalDataServices.medications, autoFetch, params);
}

export function useDiagnosticReports(autoFetch = true, params?: DiagnosticReportListParams) {
  return useResourceHook<
    DiagnosticReport,
    CreateDiagnosticReportInput,
    UpdateDiagnosticReportInput,
    DiagnosticReportListParams
  >(patientClinicalDataServices.diagnosticReports, autoFetch, params);
}

export function useProcedures(autoFetch = true, params?: ProcedureListParams) {
  return useResourceHook<
    Procedure,
    CreateProcedureInput,
    UpdateProcedureInput,
    ProcedureListParams
  >(patientClinicalDataServices.procedures, autoFetch, params);
}

export function useImmunizations(autoFetch = true, params?: ImmunizationListParams) {
  return useResourceHook<
    Immunization,
    CreateImmunizationInput,
    UpdateImmunizationInput,
    ImmunizationListParams
  >(patientClinicalDataServices.immunizations, autoFetch, params);
}

export function useDocuments(autoFetch = true, params?: DocumentListParams) {
  return useResourceHook<
    DocumentReference,
    CreateDocumentInput,
    UpdateDocumentInput,
    DocumentListParams
  >(patientClinicalDataServices.documents, autoFetch, params);
}
