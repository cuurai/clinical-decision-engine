import { Service } from "../types/services";
import "./ServiceCard.css";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="service-card">
      <div className="service-card-header">
        <div className="service-icon" style={{ backgroundColor: `${service.color}15` }}>
          <span style={{ color: service.color }}>{service.icon}</span>
        </div>
        <div className="service-card-info">
          <h3 className="service-name">{service.name}</h3>
          <p className="service-description">{service.description}</p>
        </div>
      </div>
      <div className="service-card-footer">
        <span className="resource-count">{service.resources.length} resources</span>
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
