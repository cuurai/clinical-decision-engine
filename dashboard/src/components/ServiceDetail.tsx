import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ResourceNav } from "./ResourceNav";
import { ResourceCard } from "./ResourceCard";
import { getServiceById } from "../types/services";
import "./ServiceDetail.css";

export function ServiceDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { serviceId } = useParams<{ serviceId: string }>();
  const service = serviceId ? getServiceById(serviceId) : null;

  if (!service) {
    return (
      <div className="dashboard">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="dashboard-layout">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="dashboard-main">
            <div className="error-state">
              <h2>Service not found</h2>
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
        <ResourceNav />
        <main className={`dashboard-main has-resource-nav ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="service-detail-content">
            <div className="service-detail-header">
              <Link to="/" className="back-link">
                ← Back to Services
              </Link>
              <div className="service-detail-title-section">
                <div
                  className="service-detail-icon"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <span style={{ color: service.color }}>{service.icon}</span>
                </div>
                <div>
                  <h1 className="service-detail-title">{service.name}</h1>
                  <p className="service-detail-description">{service.description}</p>
                </div>
              </div>
            </div>

            <div className="resources-section">
              <h2 className="resources-title">Resources</h2>
              <div className="resources-grid">
                {service.resources.map((resource) => (
                  <Link
                    key={resource.id}
                    to={`/service/${serviceId}/resource/${resource.id}`}
                    className="resource-link"
                  >
                    <ResourceCard resource={resource} serviceColor={service.color} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
