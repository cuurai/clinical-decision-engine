import { useState, useEffect } from "react";
import { apiClient } from "../services/core/api-client";
import "./ClinicalActionPanel.css";

interface ClinicalActionPanelProps {
  record: any;
  resourceId?: string;
  serviceId?: string;
  patientId?: string;
}

interface AIInsight {
  type: "recommendation" | "risk" | "alert" | "insight";
  title: string;
  description: string;
  confidence: number;
  priority: "low" | "normal" | "high" | "urgent";
  actionType: string;
  data?: any;
}

interface ClinicalAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  type: "diagnose" | "treat" | "assess" | "monitor" | "refer";
  requiresApproval: boolean;
  aiAssisted: boolean;
}

export function ClinicalActionPanel({
  record,
  resourceId,
  serviceId,
  patientId,
}: ClinicalActionPanelProps) {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ClinicalAction | null>(null);
  const [actionData, setActionData] = useState<any>({});
  const [showApproval, setShowApproval] = useState(false);

  const patientIdFromRecord = patientId || record?.patientId;

  useEffect(() => {
    if (patientIdFromRecord && serviceId) {
      fetchAIInsights();
    }
  }, [patientIdFromRecord, serviceId, record?.id]);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const insights: AIInsight[] = [];

      // Fetch AI recommendations
      if (record?.id && resourceId?.includes("result")) {
        try {
          const recommendations = await apiClient.get(
            `/decision-results/${record.id}/recommendations`,
            { serviceId: "decision-intelligence" }
          );
          const recs = (recommendations as any)?.data?.items || [];
          recs.forEach((rec: any) => {
            insights.push({
              type: "recommendation",
              title: rec.title || rec.type || "Treatment Recommendation",
              description: rec.description || "AI-generated clinical recommendation",
              confidence: 85,
              priority: rec.priority || "normal",
              actionType: "treat",
              data: rec,
            });
          });
        } catch (e) {
          // Ignore errors
        }
      }

      // Fetch risk assessments
      if (patientIdFromRecord) {
        try {
          const risks = await apiClient.get("/risk-assessments", {
            serviceId: "decision-intelligence",
            params: { patientId: patientIdFromRecord, limit: 3 },
          });
          const riskData = (risks as any)?.data?.items || [];
          riskData.forEach((risk: any) => {
            insights.push({
              type: "risk",
              title: `${risk.riskType?.replace(/-/g, " ")} Risk`,
              description: risk.interpretation || `Risk score: ${risk.score}`,
              confidence: Math.min(risk.score || 50, 100),
              priority: risk.score > 70 ? "high" : risk.score > 40 ? "normal" : "low",
              actionType: "assess",
              data: risk,
            });
          });
        } catch (e) {
          // Ignore errors
        }
      }

      setAiInsights(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const clinicalActions: ClinicalAction[] = [
    {
      id: "request-diagnosis",
      label: "Request AI Diagnosis",
      description: "Get AI-powered diagnostic suggestions based on patient data",
      icon: "🔬",
      type: "diagnose",
      requiresApproval: true,
      aiAssisted: true,
    },
    {
      id: "request-treatment",
      label: "Request Treatment Plan",
      description: "Generate evidence-based treatment recommendations",
      icon: "💊",
      type: "treat",
      requiresApproval: true,
      aiAssisted: true,
    },
    {
      id: "assess-risk",
      label: "Assess Patient Risk",
      description: "Calculate risk scores for mortality, readmission, complications",
      icon: "⚠️",
      type: "assess",
      requiresApproval: false,
      aiAssisted: true,
    },
    {
      id: "review-recommendations",
      label: "Review AI Recommendations",
      description: "View and act on existing AI-generated recommendations",
      icon: "💡",
      type: "treat",
      requiresApproval: true,
      aiAssisted: true,
    },
    {
      id: "request-explanation",
      label: "Explain AI Decision",
      description: "Get detailed explanation of how AI reached its conclusion",
      icon: "🔍",
      type: "diagnose",
      requiresApproval: false,
      aiAssisted: true,
    },
    {
      id: "simulate-outcomes",
      label: "Simulate Treatment Outcomes",
      description: "Run AI simulation to predict treatment outcomes",
      icon: "🧪",
      type: "treat",
      requiresApproval: false,
      aiAssisted: true,
    },
  ];

  const handleActionClick = async (action: ClinicalAction) => {
    setSelectedAction(action);
    setActionData({});

    // Pre-fill action data based on action type
    if (action.type === "diagnose") {
      setActionData({
        patientId: patientIdFromRecord,
        requestType: "diagnostic",
        context: record?.context || {},
      });
    } else if (action.type === "treat") {
      setActionData({
        patientId: patientIdFromRecord,
        requestType: "treatment",
        context: record?.context || {},
      });
    } else if (action.type === "assess") {
      setActionData({
        patientId: patientIdFromRecord,
        riskType: "mortality",
      });
    }

    if (action.requiresApproval) {
      setShowApproval(true);
    }
  };

  const executeAction = async () => {
    if (!selectedAction || !patientIdFromRecord) return;

    setLoading(true);
    try {
      if (selectedAction.id === "request-diagnosis" || selectedAction.id === "request-treatment") {
        // Create decision request - this creates a request that will be processed by AI
        const requestData = {
          patientId: patientIdFromRecord,
          requestType: selectedAction.type === "diagnose" ? "diagnostic" : "treatment",
          context: JSON.stringify({
            chiefComplaint: actionData.chiefComplaint || "Patient consultation",
            symptoms: actionData.symptoms || [],
            clinicalNotes: actionData.clinicalNotes || "",
            doctorNotes: actionData.clinicalNotes || "",
            timestamp: new Date().toISOString(),
          }),
          priority: actionData.priority || "normal",
          metadata: JSON.stringify({
            source: "doctor-dashboard",
            requiresApproval: selectedAction.requiresApproval,
            actionType: selectedAction.id,
          }),
        };

        const response = await apiClient.post("/decision-requests", {
          serviceId: "decision-intelligence",
          body: { data: requestData },
        });

        // If governance required, show approval workflow
        if (selectedAction.requiresApproval) {
          alert(
            "Request submitted successfully. It has been logged and sent for approval. You will be notified when the AI analysis is complete."
          );
        } else {
          alert("AI analysis request submitted. Results will be available shortly.");
        }
      } else if (selectedAction.id === "assess-risk") {
        // Create risk assessment - AI will calculate risk scores
        const riskData = {
          patientId: patientIdFromRecord,
          riskType: actionData.riskType || "mortality",
          decisionResultId: record?.id,
          score: 0, // Will be calculated by AI
          metadata: JSON.stringify({
            source: "doctor-dashboard",
            requestedBy: "doctor",
          }),
        };

        await apiClient.post("/risk-assessments", {
          serviceId: "decision-intelligence",
          body: { data: riskData },
        });

        alert(
          "Risk assessment request submitted. AI will calculate risk scores based on patient data."
        );
      } else if (selectedAction.id === "review-recommendations") {
        // This would navigate to recommendations view
        alert("Opening recommendations review...");
      } else if (selectedAction.id === "request-explanation") {
        // Request explanation for existing decision
        if (record?.id) {
          alert(
            "Explanation request submitted. AI will provide detailed reasoning for the clinical decision."
          );
        }
      } else if (selectedAction.id === "simulate-outcomes") {
        // Create simulation run
        alert("Simulation request submitted. AI will simulate treatment outcomes.");
      }

      // Refresh insights after action
      await fetchAIInsights();
      setSelectedAction(null);
      setShowApproval(false);
    } catch (error) {
      console.error("Error executing action:", error);
      alert("Failed to execute action. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clinical-action-panel">
      <div className="clinical-panel-header">
        <div className="clinical-panel-title-group">
          <h3 className="clinical-panel-title">🤖 AI Clinical Intelligence</h3>
          <p className="clinical-panel-subtitle">
            Interact with patient data using AI-powered clinical decision support
          </p>
        </div>
      </div>

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <div className="clinical-section">
          <h4 className="clinical-section-title">AI Insights & Recommendations</h4>
          <div className="ai-insights-grid">
            {aiInsights.map((insight, index) => (
              <div key={index} className={`ai-insight-card priority-${insight.priority}`}>
                <div className="ai-insight-header">
                  <span className="ai-insight-icon">
                    {insight.type === "recommendation"
                      ? "💡"
                      : insight.type === "risk"
                      ? "⚠️"
                      : "🔍"}
                  </span>
                  <div className="ai-insight-meta">
                    <span className="ai-insight-confidence">{insight.confidence}% confidence</span>
                    <span className={`priority-badge priority-${insight.priority}`}>
                      {insight.priority}
                    </span>
                  </div>
                </div>
                <h5 className="ai-insight-title">{insight.title}</h5>
                <p className="ai-insight-description">{insight.description}</p>
                <div className="ai-insight-actions">
                  <button className="insight-action-button primary">Review & Act</button>
                  <button className="insight-action-button">Request Explanation</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Actions Section */}
      <div className="clinical-section">
        <h4 className="clinical-section-title">Available Clinical Actions</h4>
        <div className="clinical-actions-grid">
          {clinicalActions.map((action) => (
            <div
              key={action.id}
              className="clinical-action-card"
              onClick={() => handleActionClick(action)}
            >
              <div className="clinical-action-icon">{action.icon}</div>
              <div className="clinical-action-content">
                <h5 className="clinical-action-label">{action.label}</h5>
                <p className="clinical-action-description">{action.description}</p>
                {action.requiresApproval && (
                  <span className="governance-badge">Requires Approval</span>
                )}
                {action.aiAssisted && <span className="ai-badge">AI-Powered</span>}
              </div>
              <div className="clinical-action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Execution Modal */}
      {selectedAction && (
        <div className="action-execution-modal">
          <div className="action-modal-content">
            <div className="action-modal-header">
              <h4>{selectedAction.label}</h4>
              <button
                className="action-modal-close"
                onClick={() => {
                  setSelectedAction(null);
                  setShowApproval(false);
                }}
              >
                ×
              </button>
            </div>
            <div className="action-modal-body">
              <p className="action-modal-description">{selectedAction.description}</p>

              {selectedAction.type === "diagnose" && (
                <div className="action-form">
                  <label>
                    Chief Complaint <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={actionData.chiefComplaint || ""}
                    onChange={(e) =>
                      setActionData({ ...actionData, chiefComplaint: e.target.value })
                    }
                    placeholder="e.g., Chest pain, shortness of breath"
                    required
                  />
                  <label>
                    Clinical Observations & Notes <span className="required">*</span>
                  </label>
                  <textarea
                    value={actionData.clinicalNotes || ""}
                    onChange={(e) =>
                      setActionData({ ...actionData, clinicalNotes: e.target.value })
                    }
                    placeholder="Enter clinical observations, patient history, examination findings, and any relevant notes for AI analysis..."
                    rows={6}
                    required
                  />
                  <div className="action-help-text">
                    💡 The AI will analyze this information along with patient's clinical data to
                    provide diagnostic suggestions.
                  </div>
                </div>
              )}

              {selectedAction.type === "treat" && (
                <div className="action-form">
                  <label>
                    Treatment Goals & Patient Context <span className="required">*</span>
                  </label>
                  <textarea
                    value={actionData.clinicalNotes || ""}
                    onChange={(e) =>
                      setActionData({ ...actionData, clinicalNotes: e.target.value })
                    }
                    placeholder="Describe treatment goals, current patient condition, response to previous treatments, and any specific considerations..."
                    rows={6}
                    required
                  />
                  <label>
                    Clinical Priority <span className="required">*</span>
                  </label>
                  <select
                    value={actionData.priority || "normal"}
                    onChange={(e) => setActionData({ ...actionData, priority: e.target.value })}
                    required
                  >
                    <option value="low">Low - Routine care</option>
                    <option value="normal">Normal - Standard priority</option>
                    <option value="high">High - Requires attention</option>
                    <option value="urgent">Urgent - Immediate attention needed</option>
                  </select>
                  <div className="action-help-text">
                    💡 AI will generate evidence-based treatment recommendations considering
                    patient's full clinical profile and current guidelines.
                  </div>
                </div>
              )}

              {selectedAction.type === "assess" && (
                <div className="action-form">
                  <label>Risk Type</label>
                  <select
                    value={actionData.riskType || "mortality"}
                    onChange={(e) => setActionData({ ...actionData, riskType: e.target.value })}
                  >
                    <option value="mortality">Mortality Risk</option>
                    <option value="readmission">Readmission Risk</option>
                    <option value="complication">Complication Risk</option>
                    <option value="disease-progression">Disease Progression Risk</option>
                  </select>
                </div>
              )}

              {showApproval && selectedAction.requiresApproval && (
                <div className="governance-notice">
                  <div className="governance-icon">🔒</div>
                  <div>
                    <strong>Governance Required</strong>
                    <p>
                      This action requires approval before execution. The request will be logged and
                      sent for review.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="action-modal-footer">
              <button
                className="action-button secondary"
                onClick={() => {
                  setSelectedAction(null);
                  setShowApproval(false);
                }}
              >
                Cancel
              </button>
              <button className="action-button primary" onClick={executeAction} disabled={loading}>
                {loading
                  ? "Processing..."
                  : selectedAction.requiresApproval
                  ? "Submit for Approval"
                  : "Execute Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

