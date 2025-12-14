import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../services/core/api-client";
import { getServiceById } from "../types/services";
import "./AIIntelligencePanel.css";

interface AIIntelligencePanelProps {
  record: any;
  resourceId?: string;
  serviceId?: string;
  onNavigate?: () => void; // Callback to close modal when navigating
}

interface AIIntelligencePanelProps {
  record: any;
  resourceId?: string;
  serviceId?: string;
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: string;
  serviceId: string;
  resourceId: string;
  count?: number;
  available: boolean;
}

export function AIIntelligencePanel({
  record,
  resourceId,
  serviceId,
  onNavigate,
}: AIIntelligencePanelProps) {
  const navigate = useNavigate();
  const [aiCapabilities, setAiCapabilities] = useState<AICapability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAICapabilities = async () => {
      if (!record || !serviceId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const capabilities: AICapability[] = [];

      try {
        // Decision Intelligence AI Capabilities
        if (serviceId === "decision-intelligence") {
          // Model Invocations
          if (record.patientId) {
            try {
              const modelInvocations = await apiClient.get("/model-invocations", {
                serviceId: "decision-intelligence",
                params: { patientId: record.patientId, limit: 1 },
              });
              const count = (modelInvocations as any)?.data?.items?.length || 0;
              capabilities.push({
                id: "model-invocations",
                name: "AI Model Invocations",
                description: "ML model executions for this patient",
                icon: "🤖",
                serviceId: "decision-intelligence",
                resourceId: "model-invocations",
                count,
                available: true,
              });
            } catch (e) {
              capabilities.push({
                id: "model-invocations",
                name: "AI Model Invocations",
                description: "ML model executions for this patient",
                icon: "🤖",
                serviceId: "decision-intelligence",
                resourceId: "model-invocations",
                available: true,
              });
            }
          }

          // Recommendations
          if (record.id && (resourceId?.includes("result") || resourceId?.includes("request"))) {
            try {
              const recommendations = await apiClient.get(
                `/decision-results/${record.id}/recommendations`,
                { serviceId: "decision-intelligence" }
              );
              const count = (recommendations as any)?.data?.items?.length || 0;
              capabilities.push({
                id: "recommendations",
                name: "AI Recommendations",
                description: "AI-generated clinical recommendations",
                icon: "💡",
                serviceId: "decision-intelligence",
                resourceId: "recommendations",
                count,
                available: true,
              });
            } catch (e) {
              capabilities.push({
                id: "recommendations",
                name: "AI Recommendations",
                description: "AI-generated clinical recommendations",
                icon: "💡",
                serviceId: "decision-intelligence",
                resourceId: "recommendations",
                available: true,
              });
            }
          }

          // Risk Assessments
          if (record.patientId || record.id) {
            try {
              const riskAssessments = await apiClient.get("/risk-assessments", {
                serviceId: "decision-intelligence",
                params: {
                  patientId: record.patientId,
                  decisionResultId: record.id,
                  limit: 1,
                },
              });
              const count = (riskAssessments as any)?.data?.items?.length || 0;
              capabilities.push({
                id: "risk-assessments",
                name: "AI Risk Assessments",
                description: "AI-powered risk scoring and evaluation",
                icon: "⚠️",
                serviceId: "decision-intelligence",
                resourceId: "risk-assessments",
                count,
                available: true,
              });
            } catch (e) {
              capabilities.push({
                id: "risk-assessments",
                name: "AI Risk Assessments",
                description: "AI-powered risk scoring and evaluation",
                icon: "⚠️",
                serviceId: "decision-intelligence",
                resourceId: "risk-assessments",
                available: true,
              });
            }
          }

          // Explanations
          if (record.id) {
            try {
              const explanations = await apiClient.get(`/explanations`, {
                serviceId: "decision-intelligence",
                params: { relatedEntityId: record.id, limit: 1 },
              });
              const count = (explanations as any)?.data?.items?.length || 0;
              capabilities.push({
                id: "explanations",
                name: "AI Explanations",
                description: "Explainable AI insights and reasoning",
                icon: "🔍",
                serviceId: "decision-intelligence",
                resourceId: "explanations",
                count,
                available: true,
              });
            } catch (e) {
              capabilities.push({
                id: "explanations",
                name: "AI Explanations",
                description: "Explainable AI insights and reasoning",
                icon: "🔍",
                serviceId: "decision-intelligence",
                resourceId: "explanations",
                available: true,
              });
            }
          }
        }

        // Knowledge & Evidence AI Capabilities
        capabilities.push({
          id: "model-definitions",
          name: "AI Model Library",
          description: "Browse available ML models and definitions",
          icon: "📚",
          serviceId: "knowledge-evidence",
          resourceId: "model-definitions",
          available: true,
        });

        capabilities.push({
          id: "clinical-guidelines",
          name: "Evidence-Based Guidelines",
          description: "Clinical guidelines and evidence sources",
          icon: "📖",
          serviceId: "knowledge-evidence",
          resourceId: "clinical-guidelines",
          available: true,
        });

        // Patient Clinical Data - Cross-reference
        if (record.patientId) {
          capabilities.push({
            id: "patient-insights",
            name: "Patient Clinical Insights",
            description: "View comprehensive patient data and history",
            icon: "👤",
            serviceId: "patient-clinical-data",
            resourceId: "patients",
            available: true,
          });
        }

        // Workflow & Care Pathways
        capabilities.push({
          id: "care-pathways",
          name: "Care Pathway Intelligence",
          description: "AI-optimized care pathways and workflows",
          icon: "🛤️",
          serviceId: "workflow-care-pathways",
          resourceId: "care-pathways",
          available: true,
        });

        // Simulations & Experiments
        capabilities.push({
          id: "simulations",
          name: "AI Simulations",
          description: "Run AI-powered clinical simulations",
          icon: "🧪",
          serviceId: "decision-intelligence",
          resourceId: "simulation-runs",
          available: true,
        });

        capabilities.push({
          id: "experiments",
          name: "Model Experiments",
          description: "A/B testing and model experimentation",
          icon: "🔬",
          serviceId: "decision-intelligence",
          resourceId: "experiments",
          available: true,
        });
      } catch (error) {
        console.error("Error fetching AI capabilities:", error);
      }

      setAiCapabilities(capabilities);
      setLoading(false);
    };

    fetchAICapabilities();
  }, [record, resourceId, serviceId]);

  if (loading) {
    return (
      <div className="ai-intelligence-panel">
        <div className="ai-panel-loading">Loading AI capabilities...</div>
      </div>
    );
  }

  const availableCapabilities = aiCapabilities.filter((cap) => cap.available);
  const relatedCapabilities = availableCapabilities.filter(
    (cap) => cap.count !== undefined && cap.count > 0
  );
  const otherCapabilities = availableCapabilities.filter(
    (cap) => cap.count === undefined || cap.count === 0
  );

  return (
    <div className="ai-intelligence-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <span className="ai-panel-icon">🤖</span>
          <h3>AI Intelligence</h3>
        </div>
        <p className="ai-panel-subtitle">Cross-domain AI capabilities and insights</p>
      </div>

      {relatedCapabilities.length > 0 && (
        <div className="ai-capabilities-section">
          <h4 className="ai-section-title">Available for this Record</h4>
          <div className="ai-capabilities-grid">
            {relatedCapabilities.map((capability) => {
              const service = getServiceById(capability.serviceId);
              return (
                <Link
                  key={capability.id}
                  to={`/service/${capability.serviceId}/resource/${capability.resourceId}`}
                  className="ai-capability-card"
                  style={{ borderLeftColor: service?.color || "#6366f1" }}
                  onClick={() => {
                    // Close modal when navigating
                    onNavigate?.();
                  }}
                >
                  <div className="ai-capability-icon">{capability.icon}</div>
                  <div className="ai-capability-content">
                    <div className="ai-capability-name">{capability.name}</div>
                    <div className="ai-capability-description">{capability.description}</div>
                    {capability.count !== undefined && capability.count > 0 && (
                      <div className="ai-capability-count">
                        {capability.count} {capability.count === 1 ? "item" : "items"}
                      </div>
                    )}
                  </div>
                  <div className="ai-capability-arrow">→</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {otherCapabilities.length > 0 && (
        <div className="ai-capabilities-section">
          <h4 className="ai-section-title">AI Services & Capabilities</h4>
          <div className="ai-capabilities-grid">
            {otherCapabilities.map((capability) => {
              const service = getServiceById(capability.serviceId);
              return (
                <Link
                  key={capability.id}
                  to={`/service/${capability.serviceId}/resource/${capability.resourceId}`}
                  className="ai-capability-card"
                  style={{ borderLeftColor: service?.color || "#6366f1" }}
                  onClick={() => {
                    // Close modal when navigating
                    onNavigate?.();
                  }}
                >
                  <div className="ai-capability-icon">{capability.icon}</div>
                  <div className="ai-capability-content">
                    <div className="ai-capability-name">{capability.name}</div>
                    <div className="ai-capability-description">{capability.description}</div>
                  </div>
                  <div className="ai-capability-arrow">→</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {availableCapabilities.length === 0 && (
        <div className="ai-panel-empty">
          <p>No AI capabilities available for this record type.</p>
        </div>
      )}
    </div>
  );
}

