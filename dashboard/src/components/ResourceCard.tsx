import { ServiceResource } from "../types/services";
import "./ResourceCard.css";

interface ResourceCardProps {
  resource: ServiceResource;
  serviceColor: string;
}

export function ResourceCard({ resource, serviceColor }: ResourceCardProps) {
  return (
    <div className="resource-card">
      <div className="resource-card-content">
        <div className="resource-header">
          <div className="resource-indicator" style={{ backgroundColor: serviceColor }}></div>
          <h3 className="resource-name">{resource.name}</h3>
        </div>
        <p className="resource-description">{resource.description}</p>
      </div>
      <div className="resource-card-footer">
        <span className="resource-path">{resource.path}</span>
        <svg
          className="arrow-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
