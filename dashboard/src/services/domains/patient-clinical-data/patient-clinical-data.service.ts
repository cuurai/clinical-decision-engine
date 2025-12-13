import { createResourceService } from "../../core/resource-service";
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
} from "./patient-clinical-data.types";

export const patientsService = createResourceService<
  Patient,
  CreatePatientInput,
  UpdatePatientInput
>("/patients");
export const encountersService = createResourceService<
  Encounter,
  CreateEncounterInput,
  UpdateEncounterInput
>("/encounters");
export const observationsService = createResourceService<
  Observation,
  CreateObservationInput,
  UpdateObservationInput
>("/observations");
export const conditionsService = createResourceService<
  Condition,
  CreateConditionInput,
  UpdateConditionInput
>("/conditions");
export const medicationsService = createResourceService<
  MedicationStatement,
  CreateMedicationInput,
  UpdateMedicationInput
>("/medication-statements");
export const diagnosticReportsService = createResourceService<
  DiagnosticReport,
  CreateDiagnosticReportInput,
  UpdateDiagnosticReportInput
>("/diagnostic-reports");
export const proceduresService = createResourceService<
  Procedure,
  CreateProcedureInput,
  UpdateProcedureInput
>("/procedures");
export const immunizationsService = createResourceService<
  Immunization,
  CreateImmunizationInput,
  UpdateImmunizationInput
>("/immunizations");
export const documentsService = createResourceService<
  DocumentReference,
  CreateDocumentInput,
  UpdateDocumentInput
>("/documents");

export const patientClinicalDataServices = {
  patients: patientsService,
  encounters: encountersService,
  observations: observationsService,
  conditions: conditionsService,
  medications: medicationsService,
  diagnosticReports: diagnosticReportsService,
  procedures: proceduresService,
  immunizations: immunizationsService,
  documents: documentsService,
};
