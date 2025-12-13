import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { getServiceById, getResourceById } from "../types/services";
import { useResource } from "../hooks/useResource";
import "./ResourceDetail.css";

export function ResourceDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { serviceId, resourceId } = useParams<{ serviceId: string; resourceId: string }>();
  const service = serviceId ? getServiceById(serviceId) : null;
  const resource = serviceId && resourceId ? getResourceById(serviceId, resourceId) : null;

  const { data, loading, error, total, refresh } = useResource({
    serviceId: serviceId || "",
    resourceId: resourceId || "",
    autoFetch: true,
  });

  if (!service || !resource) {
    return (
      <div className="dashboard">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="dashboard-layout">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="dashboard-main">
            <div className="error-state">
              <h2>Resource not found</h2>
              <Link to="/" className="back-link">
                ← Back to Dashboard
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="dashboard-main">
          <div className="resource-detail-content">
            <div className="resource-detail-header">
              <Link to={`/service/${serviceId}`} className="back-link">
                ← Back to {service.name}
              </Link>
              <div className="resource-detail-title-section">
                <div
                  className="resource-detail-indicator"
                  style={{ backgroundColor: service.color }}
                ></div>
                <div>
                  <h1 className="resource-detail-title">{resource.name}</h1>
                  <p className="resource-detail-description">{resource.description}</p>
                </div>
              </div>
            </div>

            <div className="resource-detail-body">
              <div className="detail-section">
                <div className="detail-section-header">
                  <h2 className="detail-section-title">Overview</h2>
                  <button className="refresh-button" onClick={refresh} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                </div>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <span className="detail-label">Service</span>
                    <span className="detail-value">{service.name}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Resource ID</span>
                    <span className="detail-value">{resource.id}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">API Path</span>
                    <span className="detail-value code">{resource.path}</span>
                  </div>
                  {total !== undefined && (
                    <div className="detail-info-item">
                      <span className="detail-label">Total Records</span>
                      <span className="detail-value">{total}</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="detail-section error-section">
                  <div className="error-message">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {loading && data === null && (
                <div className="detail-section">
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading data...</p>
                  </div>
                </div>
              )}

              {data && data.length > 0 && (
                <div className="detail-section">
                  <h2 className="detail-section-title">Recent Records</h2>
                  <div className="records-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Details</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.slice(0, 10).map((item: any, index: number) => (
                          <tr key={item.id || index}>
                            <td className="record-id">{item.id || `#${index + 1}`}</td>
                            <td>
                              <div className="record-preview">
                                {JSON.stringify(item, null, 2).substring(0, 100)}
                                {JSON.stringify(item, null, 2).length > 100 ? "..." : ""}
                              </div>
                            </td>
                            <td>
                              <button className="action-button small">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {data && data.length === 0 && !loading && (
                <div className="detail-section">
                  <div className="empty-state">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <h3>No records found</h3>
                    <p>This resource doesn't have any records yet.</p>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h2 className="detail-section-title">Actions</h2>
                <div className="action-buttons">
                  <button className="action-button primary">Create New</button>
                  <button className="action-button">View API Documentation</button>
                  <button className="action-button">View Metrics</button>
                  <button className="action-button">View Logs</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
