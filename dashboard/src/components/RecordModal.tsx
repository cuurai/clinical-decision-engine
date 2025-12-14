import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { RecordDetailView } from "./RecordDetailView";
import { ClinicalActionPanel } from "./ClinicalActionPanel";
import "./RecordModal.css";

interface CollapsibleSectionProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ label, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button
        className="collapsible-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        type="button"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <path d="M4 2 L8 6 L4 10" />
        </svg>
        <span className="collapsible-label">{label}</span>
      </button>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
}

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  title?: string;
  resourceId?: string;
  serviceId?: string;
}

export function RecordModal({
  isOpen,
  onClose,
  data,
  title = "Record Details",
  resourceId,
  serviceId,
}: RecordModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "actions">("view");
  const location = useLocation();
  const previousLocationRef = useRef(location.pathname);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      previousLocationRef.current = location.pathname;

      // Focus trap
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose, location.pathname]);

  // Close modal when route changes
  useEffect(() => {
    if (isOpen && location.pathname !== previousLocationRef.current) {
      onClose();
      previousLocationRef.current = location.pathname;
    }
  }, [location.pathname, isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const copyToClipboard = async () => {
    if (data) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const formatValue = (value: any, depth: number = 0, key?: string): JSX.Element => {
    if (value === null) {
      return <span className="json-null">null</span>;
    }
    if (value === undefined) {
      return <span className="json-undefined">undefined</span>;
    }
    if (typeof value === "string") {
      // Check if it's a JSON string (common in database fields like content, metadata, context)
      if (value.trim().startsWith("{") || value.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(value);
          return (
            <div className="json-nested">
              <CollapsibleSection
                label={`${key || "JSON"} (${value.length} chars)`}
                defaultOpen={depth < 2}
              >
                {formatValue(parsed, depth + 1)}
              </CollapsibleSection>
            </div>
          );
        } catch {
          // Not valid JSON, show as string
        }
      }
      // Check if it's a date string
      if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return (
              <span className="json-date">
                {date.toLocaleString()}
                <span className="json-date-raw"> ({value})</span>
              </span>
            );
          }
        } catch {
          // Not a valid date
        }
      }
      return <span className="json-string">"{value}"</span>;
    }
    if (typeof value === "number") {
      return <span className="json-number">{value}</span>;
    }
    if (typeof value === "boolean") {
      return <span className="json-boolean">{value.toString()}</span>;
    }
    if (value instanceof Date) {
      return (
        <span className="json-date">
          {value.toLocaleString()}
          <span className="json-date-raw"> ({value.toISOString()})</span>
        </span>
      );
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="json-empty">[]</span>;
      }
      return (
        <CollapsibleSection
          label={`Array (${value.length} items)`}
          defaultOpen={depth < 2 && value.length <= 10}
        >
          <div className="json-array">
            <span className="json-bracket">[</span>
            <div className="json-array-items">
              {value.map((item, index) => (
                <div key={index} className="json-array-item">
                  <span className="json-index">{index}:</span>
                  {formatValue(item, depth + 1)}
                  {index < value.length - 1 && <span className="json-comma">,</span>}
                </div>
              ))}
            </div>
            <span className="json-bracket">]</span>
          </div>
        </CollapsibleSection>
      );
    }
    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span className="json-empty">{"{}"}</span>;
      }
      return (
        <CollapsibleSection label={`Object (${entries.length} properties)`} defaultOpen={depth < 2}>
          <div className="json-object">
            <span className="json-brace">{"{"}</span>
            <div className="json-object-items">
              {entries.map(([k, val], index) => (
                <div key={k} className="json-object-item">
                  <span className="json-key">"{k}"</span>
                  <span className="json-colon">: </span>
                  {formatValue(val, depth + 1, k)}
                  {index < entries.length - 1 && <span className="json-comma">,</span>}
                </div>
              ))}
            </div>
            <span className="json-brace">{"}"}</span>
          </div>
        </CollapsibleSection>
      );
    }
    return <span>{String(value)}</span>;
  };

  return (
    <div className="record-modal-backdrop" ref={modalRef} onClick={handleBackdropClick}>
      <div className="record-modal" onClick={(e) => e.stopPropagation()}>
        <div className="record-modal-header">
          <div className="record-modal-header-left">
            <h2 className="record-modal-title">{title}</h2>
            <div className="record-modal-tabs">
              <button
                className={`record-modal-tab ${viewMode === "view" ? "active" : ""}`}
                onClick={() => {
                  setViewMode("view");
                  setShowForm(false);
                }}
              >
                👁️ View
              </button>
              <button
                className={`record-modal-tab ${viewMode === "actions" ? "active" : ""}`}
                onClick={() => {
                  setViewMode("actions");
                }}
              >
                🤖 AI Clinical Actions
              </button>
            </div>
          </div>
          <div className="record-modal-actions">
            {viewMode === "view" && (
              <button
                className={`record-modal-button ${copySuccess ? "success" : ""}`}
                onClick={copyToClipboard}
                title="Copy JSON"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            )}
            <button className="record-modal-close" onClick={onClose} title="Close">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div className="record-modal-content" ref={contentRef}>
          {viewMode === "actions" ? (
            <ClinicalActionPanel
              record={data}
              resourceId={resourceId}
              serviceId={serviceId}
              patientId={data?.patientId}
            />
          ) : data ? (
            <RecordDetailView
              record={data}
              resourceId={resourceId}
              serviceId={serviceId}
              onNavigate={onClose}
            />
          ) : (
            <div className="record-modal-empty">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
