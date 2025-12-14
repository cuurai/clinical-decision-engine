import { useState, useEffect } from "react";
import "./InteractiveForm.css";

interface InteractiveFormProps {
  resourceId: string;
  serviceId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  fields: FormField[];
}

interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "number" | "json" | "boolean";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
  validation?: (value: any) => string | null;
}

interface FormState {
  [key: string]: any;
  errors: { [key: string]: string };
}

export function InteractiveForm({
  resourceId,
  serviceId,
  onSubmit,
  onCancel,
  initialData,
  fields,
}: InteractiveFormProps) {
  const [formData, setFormData] = useState<FormState>({
    errors: {},
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [points, setPoints] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Group fields into steps
  const steps = fields.reduce((acc: FormField[][], field, index) => {
    const stepIndex = Math.floor(index / 3); // 3 fields per step
    if (!acc[stepIndex]) acc[stepIndex] = [];
    acc[stepIndex].push(field);
    return acc;
  }, []);

  useEffect(() => {
    // Initialize form data
    const initial: FormState = { errors: {} };
    fields.forEach((field) => {
      initial[field.id] = initialData?.[field.id] || "";
    });
    setFormData(initial);
  }, [fields, initialData]);

  useEffect(() => {
    // Calculate progress
    const filledFields = fields.filter((field) => {
      const value = formData[field.id];
      return value !== undefined && value !== null && value !== "";
    }).length;
    const newProgress = (filledFields / fields.length) * 100;
    setProgress(newProgress);

    // Award points for progress milestones
    if (newProgress >= 25 && !achievements.includes("starter")) {
      setAchievements((prev) => [...prev, "starter"]);
      setPoints((prev) => prev + 10);
    }
    if (newProgress >= 50 && !achievements.includes("halfway")) {
      setAchievements((prev) => [...prev, "halfway"]);
      setPoints((prev) => prev + 25);
    }
    if (newProgress >= 75 && !achievements.includes("almost-there")) {
      setAchievements((prev) => [...prev, "almost-there"]);
      setPoints((prev) => prev + 50);
    }
    if (newProgress === 100 && !achievements.includes("complete")) {
      setAchievements((prev) => [...prev, "complete"]);
      setPoints((prev) => prev + 100);
    }
  }, [formData, fields, achievements]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === "")) {
      return `${field.label} is required`;
    }
    if (field.validation) {
      return field.validation(value);
    }
    return null;
  };

  const validateStep = (stepIndex: number): boolean => {
    const stepFields = steps[stepIndex];
    const errors: { [key: string]: string } = {};

    stepFields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        errors[field.id] = error;
      }
    });

    setFormData((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
      errors: { ...prev.errors, [fieldId]: undefined },
    }));

    // Award points for first interaction
    if (!achievements.includes("first-input")) {
      setAchievements((prev) => [...prev, "first-input"]);
      setPoints((prev) => prev + 5);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        // Award points for completing a step
        setPoints((prev) => prev + 15);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    const errors: { [key: string]: string } = {};
    fields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        errors[field.id] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      setCurrentStep(0); // Go to first step with errors
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare submission data
      const submissionData: any = {};
      fields.forEach((field) => {
        let value = formData[field.id];
        if (field.type === "json" && typeof value === "string") {
          try {
            value = JSON.parse(value);
          } catch {
            // Keep as string if invalid JSON
          }
        }
        submissionData[field.id] = value;
      });

      await onSubmit(submissionData);

      // Award completion points
      setPoints((prev) => prev + 200);
      if (!achievements.includes("submission-master")) {
        setAchievements((prev) => [...prev, "submission-master"]);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || "";
    const error = formData.errors[field.id];

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.id} className="form-field">
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              className={`form-input ${error ? "error" : ""}`}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
            {error && <div className="field-error">{error}</div>}
            {field.helpText && <div className="field-help">{field.helpText}</div>}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="form-field">
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              className={`form-input ${error ? "error" : ""}`}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <div className="field-error">{error}</div>}
            {field.helpText && <div className="field-help">{field.helpText}</div>}
          </div>
        );

      case "boolean":
        return (
          <div key={field.id} className="form-field form-field-checkbox">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                className="form-checkbox"
              />
              <span>{field.label}</span>
              {field.required && <span className="required">*</span>}
            </label>
            {error && <div className="field-error">{error}</div>}
            {field.helpText && <div className="field-help">{field.helpText}</div>}
          </div>
        );

      case "json":
        return (
          <div key={field.id} className="form-field">
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              className={`form-input form-input-json ${error ? "error" : ""}`}
              value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || '{"key": "value"}'}
              rows={6}
            />
            {error && <div className="field-error">{error}</div>}
            {field.helpText && <div className="field-help">{field.helpText}</div>}
          </div>
        );

      default:
        return (
          <div key={field.id} className="form-field">
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type={field.type}
              className={`form-input ${error ? "error" : ""}`}
              value={value}
              onChange={(e) =>
                handleFieldChange(
                  field.id,
                  field.type === "number" ? Number(e.target.value) : e.target.value
                )
              }
              placeholder={field.placeholder}
            />
            {error && <div className="field-error">{error}</div>}
            {field.helpText && <div className="field-help">{field.helpText}</div>}
          </div>
        );
    }
  };

  const getAchievementIcon = (achievement: string) => {
    const icons: Record<string, string> = {
      "first-input": "🎯",
      starter: "🌱",
      halfway: "⚡",
      "almost-there": "🔥",
      complete: "✅",
      "submission-master": "🏆",
    };
    return icons[achievement] || "⭐";
  };

  return (
    <div className="interactive-form">
      {/* Gamification Header */}
      <div className="form-gamification-header">
        <div className="gamification-stats">
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{points}</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{achievements.length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Achievements Banner */}
      {achievements.length > 0 && (
        <div className="achievements-banner">
          {achievements.map((achievement) => (
            <div key={achievement} className="achievement-badge">
              {getAchievementIcon(achievement)}
              <span>{achievement.replace(/-/g, " ")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step Indicator */}
      <div className="step-indicator">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`step-dot ${
              index === currentStep ? "active" : completedSteps.has(index) ? "completed" : ""
            }`}
            onClick={() => {
              if (completedSteps.has(index) || index === 0) {
                setCurrentStep(index);
              }
            }}
          >
            {completedSteps.has(index) ? "✓" : index + 1}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="form-content">
        <div className="form-step-header">
          <h3>
            Step {currentStep + 1} of {steps.length}
          </h3>
          <p>Complete all fields to proceed</p>
        </div>

        <div className="form-fields">{steps[currentStep]?.map((field) => renderField(field))}</div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button className="form-button secondary" onClick={onCancel}>
          Cancel
        </button>
        <div className="form-actions-group">
          {currentStep > 0 && (
            <button className="form-button secondary" onClick={handlePrevious}>
              ← Previous
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button className="form-button primary" onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button
              className="form-button primary submit-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                <>🚀 Submit & Earn {200 + completedSteps.size * 15} Points</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

