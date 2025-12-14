// Shared form field definitions for resources
export interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "number" | "json" | "boolean";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
  validation?: (value: any) => string | null;
}

export function getFormFields(resourceId: string, existingData?: any): FormField[] {
  const commonFields: FormField[] = [
    {
      id: "patientId",
      label: "Patient ID",
      type: "text",
      required: true,
      placeholder: "Enter patient ID",
      helpText: "The unique identifier for the patient",
    },
  ];

  switch (resourceId) {
    case "decision-sessions":
      return [
        ...commonFields,
        {
          id: "encounterId",
          label: "Encounter ID",
          type: "text",
          required: false,
          placeholder: "Optional encounter ID",
        },
        {
          id: "status",
          label: "Status",
          type: "select",
          required: false,
          options: [
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ],
        },
        {
          id: "metadata",
          label: "Metadata",
          type: "json",
          required: false,
          placeholder: '{"key": "value"}',
          helpText: "Additional metadata as JSON",
        },
      ];

    case "decision-requests":
      return [
        ...commonFields,
        {
          id: "requestType",
          label: "Request Type",
          type: "select",
          required: true,
          options: [
            { value: "diagnostic", label: "Diagnostic" },
            { value: "treatment", label: "Treatment" },
            { value: "risk-assessment", label: "Risk Assessment" },
            { value: "pathway-selection", label: "Pathway Selection" },
          ],
        },
        {
          id: "priority",
          label: "Priority",
          type: "select",
          required: false,
          options: [
            { value: "low", label: "Low" },
            { value: "normal", label: "Normal" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ],
        },
        {
          id: "context",
          label: "Clinical Context",
          type: "json",
          required: true,
          placeholder: '{"chiefComplaint": "...", "symptoms": []}',
          helpText: "Clinical context and input data as JSON",
        },
        {
          id: "metadata",
          label: "Metadata",
          type: "json",
          required: false,
        },
      ];

    case "recommendations":
      return [
        {
          id: "decisionResultId",
          label: "Decision Result ID",
          type: "text",
          required: true,
        },
        ...commonFields,
        {
          id: "type",
          label: "Recommendation Type",
          type: "select",
          required: true,
          options: [
            { value: "diagnostic", label: "Diagnostic" },
            { value: "treatment", label: "Treatment" },
            { value: "monitoring", label: "Monitoring" },
            { value: "follow-up", label: "Follow-up" },
          ],
        },
        {
          id: "title",
          label: "Title",
          type: "text",
          required: true,
        },
        {
          id: "description",
          label: "Description",
          type: "textarea",
          required: true,
        },
        {
          id: "priority",
          label: "Priority",
          type: "select",
          required: false,
          options: [
            { value: "low", label: "Low" },
            { value: "normal", label: "Normal" },
            { value: "high", label: "High" },
          ],
        },
      ];

    case "risk-assessments":
      return [
        ...commonFields,
        {
          id: "riskType",
          label: "Risk Type",
          type: "select",
          required: true,
          options: [
            { value: "mortality", label: "Mortality" },
            { value: "readmission", label: "Readmission" },
            { value: "complication", label: "Complication" },
            { value: "disease-progression", label: "Disease Progression" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "score",
          label: "Risk Score",
          type: "number",
          required: true,
          placeholder: "0-100",
          validation: (value: number) => {
            if (value < 0 || value > 100) {
              return "Score must be between 0 and 100";
            }
            return null;
          },
        },
        {
          id: "interpretation",
          label: "Interpretation",
          type: "textarea",
          required: false,
        },
      ];

    default:
      return [
        ...commonFields,
        {
          id: "metadata",
          label: "Metadata",
          type: "json",
          required: false,
          placeholder: '{"key": "value"}',
        },
      ];
  }
}
