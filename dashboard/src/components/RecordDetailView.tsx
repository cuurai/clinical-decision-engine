import { useState, useEffect } from "react";
import { apiClient } from "../services/core/api-client";
import { AIIntelligencePanel } from "./AIIntelligencePanel";
import { ClinicalActionPanel } from "./ClinicalActionPanel";
import "./RecordDetailView.css";

// Avatar component
function Avatar({
  name,
  size = "md",
  type = "patient",
}: {
  name?: string;
  size?: "sm" | "md" | "lg";
  type?: "patient" | "session" | "request" | "result";
}) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(/[\s_-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getColor = () => {
    const colors = {
      patient: "#3b82f6",
      session: "#10b981",
      request: "#6366f1",
      result: "#f59e0b",
    };
    return colors[type] || colors.patient;
  };

  const sizeMap = {
    sm: "24px",
    md: "40px",
    lg: "64px",
  };

  return (
    <div
      className="record-avatar"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        backgroundColor: getColor(),
        fontSize: size === "sm" ? "10px" : size === "md" ? "14px" : "20px",
      }}
      title={name || "Unknown"}
    >
      {getInitials(name)}
    </div>
  );
}

interface RecordDetailViewProps {
  record: any;
  resourceId?: string;
  serviceId?: string;
  onEnrich?: () => void;
  onNavigate?: () => void; // Callback when navigation occurs
}

export function RecordDetailView({
  record,
  resourceId,
  serviceId,
  onNavigate,
}: RecordDetailViewProps) {
  const [complementaryData, setComplementaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Parse JSON strings from database
  const parseField = (value: any): any => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  };

  // Check for complementary data based on resource type
  useEffect(() => {
    if (!record || !serviceId) return;

    const fetchComplementaryData = async () => {
      setLoading(true);
      try {
        let data: any = {};

        // Decision Session - fetch requests, results, risk assessments
        if (resourceId === "decision-sessions" && record.id) {
          const [requests, results, riskAssessments] = await Promise.allSettled([
            apiClient.get(`/decision-sessions/${record.id}/decision-requests`, { serviceId }),
            apiClient.get(`/decision-sessions/${record.id}/decision-results`, { serviceId }),
            apiClient.get(`/decision-sessions/${record.id}/risk-assessments`, { serviceId }),
          ]);

          data.requests =
            requests.status === "fulfilled" ? (requests.value as any)?.data?.items || [] : [];
          data.results =
            results.status === "fulfilled" ? (results.value as any)?.data?.items || [] : [];
          data.riskAssessments =
            riskAssessments.status === "fulfilled"
              ? (riskAssessments.value as any)?.data?.items || []
              : [];
        }

        // Decision Result - fetch recommendations, risk assessments, explanations
        if (resourceId === "decision-results" && record.id) {
          const [recommendations, riskAssessments, explanations] = await Promise.allSettled([
            apiClient.get(`/decision-results/${record.id}/recommendations`, { serviceId }),
            apiClient.get(`/decision-results/${record.id}/risk-assessments`, { serviceId }),
            apiClient.get(`/decision-results/${record.id}/explanations`, { serviceId }),
          ]);

          data.recommendations =
            recommendations.status === "fulfilled"
              ? (recommendations.value as any)?.data?.items || []
              : [];
          data.riskAssessments =
            riskAssessments.status === "fulfilled"
              ? (riskAssessments.value as any)?.data?.items || []
              : [];
          data.explanations =
            explanations.status === "fulfilled"
              ? (explanations.value as any)?.data?.items || []
              : [];
        }

        // Decision Request - fetch results
        if (resourceId === "decision-requests" && record.id) {
          const resultsResponse = await apiClient
            .get(`/decision-requests/${record.id}/decision-results`, { serviceId })
            .catch(() => null);
          data.results = resultsResponse ? (resultsResponse as any)?.data?.items || [] : [];
        }

        setComplementaryData(data);
      } catch (error) {
        console.error("Error fetching complementary data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplementaryData();
  }, [record?.id, resourceId, serviceId]);

  const hasComplementaryData = () => {
    if (!complementaryData) return false;
    return (
      (complementaryData.requests && complementaryData.requests.length > 0) ||
      (complementaryData.results && complementaryData.results.length > 0) ||
      (complementaryData.recommendations && complementaryData.recommendations.length > 0) ||
      (complementaryData.riskAssessments && complementaryData.riskAssessments.length > 0) ||
      (complementaryData.explanations && complementaryData.explanations.length > 0)
    );
  };

  const renderField = (label: string, value: any, key?: string) => {
    const parsed = parseField(value);
    const isObject = typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
    const isArray = Array.isArray(parsed);

    if (isObject) {
      return (
        <div key={key} className="detail-field">
          <label className="detail-field-label">{label}</label>
          <div className="detail-field-object">
            {Object.entries(parsed).map(([k, v]) => renderField(k, v, k))}
          </div>
        </div>
      );
    }

    if (isArray) {
      return (
        <div key={key} className="detail-field">
          <label className="detail-field-label">{label}</label>
          <div className="detail-field-array">
            {parsed.map((item: any, idx: number) => (
              <div key={idx} className="detail-field-array-item">
                {typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="detail-field">
        <label className="detail-field-label">{label}</label>
        <div className="detail-field-value">{String(parsed)}</div>
      </div>
    );
  };

  if (!record) return null;

  const context = parseField(record.context);
  const metadata = parseField(record.metadata);
  const result = parseField(record.result);

  return (
    <div className="record-detail-view">
      {/* Header Section */}
      <div className="record-detail-header">
        <div className="record-detail-title-group">
          <div className="record-detail-title-with-avatar">
            <Avatar
              name={resourceId || "record"}
              type={
                resourceId === "decision-sessions"
                  ? "session"
                  : resourceId === "decision-requests"
                  ? "request"
                  : "result"
              }
              size="lg"
            />
            <div>
              <h3 className="record-detail-title">Clinical Record</h3>
              <span className="record-detail-id">{record.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Record Data */}
      <div className="record-detail-sections">
        {/* Basic Info */}
        <div className="record-detail-section">
          <h4 className="section-title">Basic Information</h4>
          <div className="detail-fields-grid">
            {record.patientId && (
              <div className="detail-field detail-field-with-avatar">
                <label className="detail-field-label">Patient</label>
                <div className="detail-field-value-with-avatar">
                  <Avatar name={record.patientId} type="patient" size="md" />
                  <div className="detail-field-value-group">
                    <div className="detail-field-value">{record.patientId}</div>
                    {record.patientId && (
                      <div className="detail-field-subtitle">Patient Record</div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {record.status && (
              <div className="detail-field">
                <label className="detail-field-label">Status</label>
                <div className="detail-field-value-with-avatar">
                  <Avatar name={record.status} type="session" size="sm" />
                  <span className={`status-badge status-${record.status}`}>{record.status}</span>
                </div>
              </div>
            )}
            {record.decisionSessionId && (
              <div className="detail-field detail-field-with-avatar">
                <label className="detail-field-label">Decision Session</label>
                <div className="detail-field-value-with-avatar">
                  <Avatar name={record.decisionSessionId} type="session" size="md" />
                  <div className="detail-field-value-group">
                    <div className="detail-field-value">{record.decisionSessionId}</div>
                    <div className="detail-field-subtitle">Session Record</div>
                  </div>
                </div>
              </div>
            )}
            {record.decisionRequestId && (
              <div className="detail-field detail-field-with-avatar">
                <label className="detail-field-label">Decision Request</label>
                <div className="detail-field-value-with-avatar">
                  <Avatar name={record.decisionRequestId} type="request" size="md" />
                  <div className="detail-field-value-group">
                    <div className="detail-field-value">{record.decisionRequestId}</div>
                    <div className="detail-field-subtitle">Request Record</div>
                  </div>
                </div>
              </div>
            )}
            {record.decisionResultId && (
              <div className="detail-field detail-field-with-avatar">
                <label className="detail-field-label">Decision Result</label>
                <div className="detail-field-value-with-avatar">
                  <Avatar name={record.decisionResultId} type="result" size="md" />
                  <div className="detail-field-value-group">
                    <div className="detail-field-value">{record.decisionResultId}</div>
                    <div className="detail-field-subtitle">Result Record</div>
                  </div>
                </div>
              </div>
            )}
            {record.requestType && (
              <div className="detail-field detail-field-with-avatar">
                <label className="detail-field-label">Request Type</label>
                <div className="detail-field-value-with-avatar">
                  <Avatar name={record.requestType} type="request" size="sm" />
                  <span className="type-badge">{record.requestType}</span>
                </div>
              </div>
            )}
            {record.priority && (
              <div className="detail-field">
                <label className="detail-field-label">Priority</label>
                <span className={`priority-badge priority-${record.priority}`}>
                  {record.priority}
                </span>
              </div>
            )}
            {record.createdAt && (
              <div className="detail-field">
                <label className="detail-field-label">Created</label>
                <div className="detail-field-value">
                  {new Date(record.createdAt).toLocaleString()}
                </div>
              </div>
            )}
            {record.updatedAt && (
              <div className="detail-field">
                <label className="detail-field-label">Updated</label>
                <div className="detail-field-value">
                  {new Date(record.updatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Context Section */}
        {context && Object.keys(context).length > 0 && (
          <div className="record-detail-section">
            <h4 className="section-title">Context</h4>
            <div className="detail-fields-grid">{renderField("", context)}</div>
          </div>
        )}

        {/* Result Section */}
        {result && Object.keys(result).length > 0 && (
          <div className="record-detail-section">
            <h4 className="section-title">Result</h4>
            <div className="detail-fields-grid">{renderField("", result)}</div>
          </div>
        )}

        {/* Metadata Section */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="record-detail-section">
            <h4 className="section-title">Metadata</h4>
            <div className="detail-fields-grid">{renderField("", metadata)}</div>
          </div>
        )}

        {/* Complementary Data Section */}
        {loading ? (
          <div className="record-detail-section">
            <div className="loading-indicator">Loading complementary data...</div>
          </div>
        ) : hasComplementaryData() ? (
          <div className="record-detail-section">
            <h4 className="section-title">Related Data</h4>
            <div className="complementary-data">
              {complementaryData.requests && complementaryData.requests.length > 0 && (
                <div className="complementary-group">
                  <h5 className="complementary-group-title">
                    Decision Requests ({complementaryData.requests.length})
                  </h5>
                  <div className="complementary-items">
                    {complementaryData.requests.slice(0, 3).map((req: any) => (
                      <div key={req.id} className="complementary-item">
                        <Avatar name={req.requestType} type="request" size="sm" />
                        <div className="complementary-item-content">
                          <span className="complementary-item-id">{req.id}</span>
                          <span className="complementary-item-type">{req.requestType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complementaryData.results && complementaryData.results.length > 0 && (
                <div className="complementary-group">
                  <h5 className="complementary-group-title">
                    Decision Results ({complementaryData.results.length})
                  </h5>
                  <div className="complementary-items">
                    {complementaryData.results.slice(0, 3).map((res: any) => (
                      <div key={res.id} className="complementary-item">
                        <Avatar name={res.status || "result"} type="result" size="sm" />
                        <div className="complementary-item-content">
                          <span className="complementary-item-id">{res.id}</span>
                          <span className={`status-badge status-${res.status}`}>{res.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complementaryData.recommendations &&
                complementaryData.recommendations.length > 0 && (
                  <div className="complementary-group">
                    <h5 className="complementary-group-title">
                      Recommendations ({complementaryData.recommendations.length})
                    </h5>
                    <div className="complementary-items">
                      {complementaryData.recommendations.slice(0, 3).map((rec: any) => (
                        <div key={rec.id} className="complementary-item">
                          <Avatar name={rec.type || "recommendation"} type="request" size="sm" />
                          <div className="complementary-item-content">
                            <span className="complementary-item-id">{rec.id}</span>
                            <span className="complementary-item-type">{rec.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {complementaryData.riskAssessments &&
                complementaryData.riskAssessments.length > 0 && (
                  <div className="complementary-group">
                    <h5 className="complementary-group-title">
                      Risk Assessments ({complementaryData.riskAssessments.length})
                    </h5>
                    <div className="complementary-items">
                      {complementaryData.riskAssessments.slice(0, 3).map((ra: any) => (
                        <div key={ra.id} className="complementary-item">
                          <Avatar name={ra.riskType || "risk"} type="result" size="sm" />
                          <div className="complementary-item-content">
                            <span className="complementary-item-id">{ra.id}</span>
                            <span className="complementary-item-type">{ra.riskType}</span>
                            <span className="complementary-item-score">Score: {ra.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ) : (
          <div className="record-detail-section">
            <div className="no-complementary-data">
              <p>No complementary clinical data available for this record.</p>
              <p className="clinical-note">
                Use AI Clinical Actions to request diagnostic analysis, treatment recommendations,
                or risk assessments.
              </p>
            </div>
          </div>
        )}

        {/* Clinical Action Panel - Doctor-focused AI interactions */}
        <ClinicalActionPanel
          record={record}
          resourceId={resourceId}
          serviceId={serviceId}
          patientId={record.patientId}
        />

        {/* AI Intelligence Panel */}
        <AIIntelligencePanel
          record={record}
          resourceId={resourceId}
          serviceId={serviceId}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

