import { useState, useMemo, useEffect } from "react";
import { apiClient } from "../services/core/api-client";
import "./RecordsTable.css";

// Avatar component for table
function TableAvatar({
  name,
  initials,
  type = "patient",
  size = "sm",
}: {
  name?: string;
  initials?: string;
  type?: "patient" | "session" | "request" | "result";
  size?: "sm" | "md";
}) {
  const getInitials = () => {
    if (initials) return initials;
    if (!name) return "?";
    const parts = name.split(/[\s_-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getColor = () => {
    // Generate consistent color based on name
    if (name) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash % 360);
      return `hsl(${hue}, 65%, 55%)`;
    }

    const colors = {
      patient: "#3b82f6",
      session: "#10b981",
      request: "#6366f1",
      result: "#f59e0b",
    };
    return colors[type] || colors.patient;
  };

  const sizeMap = {
    sm: "28px",
    md: "40px",
  };

  return (
    <div
      className="table-avatar"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        backgroundColor: getColor(),
        fontSize: size === "sm" ? "12px" : "16px",
      }}
      title={name || "Unknown"}
    >
      {getInitials()}
    </div>
  );
}

interface RecordsTableProps {
  data: any[];
  resourceId?: string;
  onViewRecord: (record: any) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalRecords?: number;
  pageSize?: number;
}

export function RecordsTable({
  data,
  resourceId,
  onViewRecord,
  onPageChange,
  currentPage = 1,
  totalRecords,
  pageSize = 10,
}: RecordsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(currentPage);
  const [patientCache, setPatientCache] = useState<
    Record<string, { name: string; initials: string }>
  >({});

  // Parse JSON strings
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

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = data.filter((item) => {
        const searchableText = JSON.stringify(item).toLowerCase();
        return searchableText.includes(query);
      });
    }

    // Sort
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        // Special handling for summary column
        if (sortColumn === "summary") {
          const aSummary = getRecordSummary(a);
          const bSummary = getRecordSummary(b);
          const aVal = aSummary.primary.toLowerCase();
          const bVal = bSummary.primary.toLowerCase();
          if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
          if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
          return 0;
        }

        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Parse if JSON string
        aVal = parseField(aVal);
        bVal = parseField(bVal);

        // Handle dates
        if (aVal && typeof aVal === "string" && /^\d{4}-\d{2}-\d{2}T/.test(aVal)) {
          aVal = new Date(aVal).getTime();
          bVal = bVal ? new Date(bVal as string).getTime() : 0;
        }

        // Compare
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  // Fetch patient data from database
  useEffect(() => {
    const fetchPatients = async () => {
      // Collect unique patient IDs from records
      const patientIds = new Set<string>();
      data.forEach((record) => {
        if (record.patientId) {
          patientIds.add(record.patientId);
        }
      });

      // Filter out already cached patients
      const uncachedIds = Array.from(patientIds).filter((id) => !patientCache[id]);

      if (uncachedIds.length === 0) return;

      try {
        // Fetch patients from patient-clinical-data service (port 3004)
        const patientPromises = uncachedIds.map(async (patientId) => {
          try {
            const response = await apiClient.get(`/patients/${patientId}`, {
              serviceId: "patient-clinical-data",
            });
            const patient = (response as any)?.data;
            if (patient?.name) {
              const givenNames = patient.name.given || [];
              const familyName = patient.name.family || "";
              const firstName = givenNames[0] || "";
              const fullName = `${firstName} ${familyName}`.trim() || "Unknown Patient";
              const initials =
                firstName && familyName
                  ? `${firstName[0]}${familyName[0]}`.toUpperCase()
                  : fullName.substring(0, 2).toUpperCase();
              return { patientId, name: fullName, initials };
            }
          } catch (error) {
            // Patient not found, will use mock data
            console.debug(`Patient ${patientId} not found, using mock data`);
          }
          return null;
        });

        const results = await Promise.all(patientPromises);
        const newCache: Record<string, { name: string; initials: string }> = {};

        results.forEach((result) => {
          if (result) {
            newCache[result.patientId] = { name: result.name, initials: result.initials };
          }
        });

        if (Object.keys(newCache).length > 0) {
          setPatientCache((prev) => ({ ...prev, ...newCache }));
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, [data, patientCache]);

  // Generate meaningful business object name from patient ID or context
  const getBusinessObjectName = (record: any): { name: string; initials: string } => {
    // Check cache first
    if (record.patientId && patientCache[record.patientId]) {
      return patientCache[record.patientId];
    }

    // Try to extract name from various sources
    let name = "";
    let initials = "?";

    // Check if there's a name in context or metadata
    const context = parseField(record.context);
    const metadata = parseField(record.metadata);

    if (context?.patientName || context?.name) {
      name = context.patientName || context.name;
    } else if (metadata?.patientName || metadata?.name) {
      name = metadata.patientName || metadata.name;
    } else if (record.patientId) {
      // Generate a meaningful mock name from patient ID
      // Use a deterministic approach to create consistent names
      const patientHash = record.patientId.split("").reduce((acc: number, char: string) => {
        return acc + char.charCodeAt(0);
      }, 0);

      const firstNames = [
        "James",
        "Mary",
        "John",
        "Patricia",
        "Robert",
        "Jennifer",
        "Michael",
        "Linda",
        "William",
        "Elizabeth",
        "David",
        "Barbara",
        "Richard",
        "Susan",
        "Joseph",
        "Jessica",
        "Thomas",
        "Sarah",
        "Charles",
        "Karen",
        "Emma",
        "Daniel",
        "Olivia",
        "Matthew",
        "Sophia",
        "Christopher",
        "Isabella",
        "Andrew",
        "Ava",
        "Joshua",
      ];
      const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
        "Hernandez",
        "Lopez",
        "Wilson",
        "Anderson",
        "Thomas",
        "Taylor",
        "Moore",
        "Jackson",
        "Martin",
        "Lee",
        "White",
        "Harris",
        "Clark",
        "Lewis",
        "Robinson",
        "Walker",
        "Young",
        "King",
        "Wright",
        "Scott",
      ];

      const firstName = firstNames[patientHash % firstNames.length];
      const lastName = lastNames[(patientHash * 7) % lastNames.length];
      name = `${firstName} ${lastName}`;
    } else if (record.title) {
      name = record.title;
    } else if (record.name) {
      name = record.name;
    }

    // Generate initials
    if (name) {
      const parts = name.split(/\s+/);
      if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else {
        initials = name.substring(0, 2).toUpperCase();
      }
    } else if (record.patientId) {
      // Fallback: use first two chars of patient ID
      initials = record.patientId.substring(0, 2).toUpperCase();
      name = `Patient ${record.patientId.substring(0, 8)}`;
    }

    return { name: name || "Patient", initials };
  };

  // Get user-friendly record summary with business objects
  const getRecordSummary = (record: any) => {
    const parsed = parseField;
    const businessObject = getBusinessObjectName(record);

    // Decision Session
    if (resourceId === "decision-sessions") {
      const context = parseField(record.context);
      const encounterInfo =
        context?.encounterType || context?.encounterId
          ? ` • ${context.encounterType || "Encounter"}`
          : "";
      return {
        primary: businessObject.name,
        secondary: `${record.status || "Active"} Session${encounterInfo}`,
        icon: "patient",
        avatarName: businessObject.name,
        avatarInitials: businessObject.initials,
      };
    }

    // Decision Request
    if (resourceId === "decision-requests") {
      const requestTypeLabel = record.requestType
        ? `${record.requestType.charAt(0).toUpperCase() + record.requestType.slice(1)}`
        : "Request";
      return {
        primary: businessObject.name,
        secondary: `${requestTypeLabel} Request`,
        icon: "patient",
        avatarName: businessObject.name,
        avatarInitials: businessObject.initials,
        badge: record.priority,
      };
    }

    // Decision Result
    if (resourceId === "decision-results") {
      const statusLabel = record.status
        ? `${record.status.charAt(0).toUpperCase() + record.status.slice(1)}`
        : "Result";
      return {
        primary: businessObject.name,
        secondary: `${statusLabel} Decision Result`,
        icon: "patient",
        avatarName: businessObject.name,
        avatarInitials: businessObject.initials,
      };
    }

    // Recommendation
    if (resourceId === "recommendations") {
      const recType = parsed(record.type) || record.type || "Recommendation";
      const recTitle = record.title || (typeof recType === "string" ? recType : "Recommendation");
      return {
        primary: businessObject.name,
        secondary: recTitle,
        icon: "patient",
        avatarName: businessObject.name,
        avatarInitials: businessObject.initials,
        badge: record.priority,
      };
    }

    // Risk Assessment
    if (resourceId === "risk-assessments") {
      const riskTypeLabel = record.riskType
        ? `${record.riskType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
        : "Risk Assessment";
      return {
        primary: businessObject.name,
        secondary: `${riskTypeLabel}${record.score ? ` • Score: ${record.score}` : ""}`,
        icon: "patient",
        avatarName: businessObject.name,
        avatarInitials: businessObject.initials,
      };
    }

    // Explanation
    if (resourceId === "explanations" || resourceId === "decision-result-explanations") {
      const explanationType =
        parsed(record.explanationType) || record.explanationType || "Explanation";
      const contentPreview = record.content
        ? String(parsed(record.content)).substring(0, 40) + "..."
        : "";
      return {
        primary: businessObject.name,
        secondary: `${typeof explanationType === "string" ? explanationType : "Explanation"}${
          contentPreview ? ` • ${contentPreview}` : ""
        }`,
        icon: "patient",
        avatarName: businessObject.name,
        avatarInitials: businessObject.initials,
      };
    }

    // Alert Evaluation
    if (resourceId === "alert-evaluations") {
      return {
        primary: businessObject.name,
        secondary: `${record.alertType || "Alert"}${record.status ? ` • ${record.status}` : ""}`,
        icon: "patient",
        avatarName: businessObject.name,
        avatarInitials: businessObject.initials,
        badge: record.severity || record.priority,
      };
    }

    // Default fallback
    return {
      primary: businessObject.name,
      secondary: record.status || "Record",
      icon: "patient",
      avatarName: businessObject.name,
      avatarInitials: businessObject.initials,
    };
  };

  // Get display columns based on resource type
  const getColumns = () => {
    if (!data || data.length === 0) return [];

    const sample = data[0];
    const columns: Array<{
      key: string;
      label: string;
      type: "text" | "date" | "status" | "badge" | "summary";
    }> = [];

    // Always add summary column first (replaces ID)
    columns.push({ key: "summary", label: "Record", type: "summary" });

    // Common columns (skip ID, we show it in summary)
    if (sample.patientId && resourceId !== "decision-sessions") {
      columns.push({ key: "patientId", label: "Patient", type: "text" });
    }
    if (sample.status) columns.push({ key: "status", label: "Status", type: "status" });
    if (sample.requestType) columns.push({ key: "requestType", label: "Type", type: "badge" });
    if (sample.priority) columns.push({ key: "priority", label: "Priority", type: "badge" });
    if (sample.riskType) columns.push({ key: "riskType", label: "Risk Type", type: "badge" });
    if (sample.score !== undefined) columns.push({ key: "score", label: "Score", type: "text" });
    if (sample.createdAt) columns.push({ key: "createdAt", label: "Created", type: "date" });
    if (sample.updatedAt) columns.push({ key: "updatedAt", label: "Updated", type: "date" });

    return columns;
  };

  const columns = getColumns();

  const renderCell = (record: any, column: { key: string; type: string }) => {
    const value = record[column.key];
    const parsed = parseField(value);

    switch (column.type) {
      case "summary":
        const summary = getRecordSummary(record);
        return (
          <div
            className="table-cell-summary"
            data-record-id={record.id}
            title={`Record ID: ${record.id}`}
          >
            <TableAvatar
              name={summary.avatarName || summary.primary}
              initials={summary.avatarInitials}
              type={summary.icon as any}
              size="md"
            />
            <div className="table-cell-summary-content">
              <div className="table-cell-summary-primary">{summary.primary}</div>
              {summary.secondary && (
                <div className="table-cell-summary-secondary">{summary.secondary}</div>
              )}
            </div>
            {summary.badge && (
              <span className={`priority-badge priority-${summary.badge}`}>{summary.badge}</span>
            )}
          </div>
        );

      case "date":
        if (!value) return <span className="table-cell-empty">—</span>;
        return (
          <div className="table-cell-date">
            {new Date(value).toLocaleDateString()}
            <span className="table-cell-time">{new Date(value).toLocaleTimeString()}</span>
          </div>
        );

      case "status":
        if (!value) return <span className="table-cell-empty">—</span>;
        return (
          <div className="table-cell-with-avatar">
            <TableAvatar name={value} type="session" size="sm" />
            <span className={`status-badge status-${value}`}>{value}</span>
          </div>
        );

      case "badge":
        if (!value) return <span className="table-cell-empty">—</span>;
        const badgeClass =
          column.key === "priority" ? `priority-badge priority-${value}` : "type-badge";
        return <span className={badgeClass}>{value}</span>;

      case "text":
        if (column.key === "patientId") {
          return (
            <div className="table-cell-with-avatar">
              <TableAvatar name={value} type="patient" size="sm" />
              <code className="table-cell-value">{value || "—"}</code>
            </div>
          );
        }
        if (column.key === "score") {
          return (
            <div className="table-cell-score">
              <span className="score-value">{value}</span>
              {record.scoreRange && (
                <span className="score-range">/ {record.scoreRange.max || 100}</span>
              )}
            </div>
          );
        }
        return <div className="table-cell-value">{String(parsed || "—")}</div>;

      default:
        return <div className="table-cell-value">{String(parsed || "—")}</div>;
    }
  };

  return (
    <div className="records-table-container">
      {/* Table Controls */}
      <div className="records-table-controls">
        <div className="records-table-search">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="records-table-search-input"
          />
          {searchQuery && (
            <button
              className="records-table-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="records-table-info">
          {filteredAndSortedData.length !== data.length ? (
            <span>
              Showing {filteredAndSortedData.length} of {data.length} records
            </span>
          ) : (
            <span>{data.length} records</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="records-table-wrapper">
        <table className="records-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={
                    sortColumn === col.key ? `sortable sorted-${sortDirection}` : "sortable"
                  }
                  onClick={() => handleSort(col.key)}
                >
                  <div className="table-header-content">
                    <span>{col.label}</span>
                    {sortColumn === col.key && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="sort-icon"
                      >
                        {sortDirection === "asc" ? (
                          <path d="M3 4 L6 1 L9 4" />
                        ) : (
                          <path d="M3 8 L6 11 L9 8" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              <th className="table-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="table-empty-cell">
                  <div className="table-empty-state">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>{searchQuery ? "No records match your search" : "No records found"}</p>
                    {searchQuery && (
                      <button
                        className="table-clear-search-button"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item: any, index: number) => (
                <tr key={item.id || index} className="table-row">
                  {columns.map((col) => (
                    <td key={col.key} className="table-cell">
                      {renderCell(item, col)}
                    </td>
                  ))}
                  <td className="table-actions-cell">
                    <div className="table-actions-group">
                      <button
                        className="table-action-button"
                        onClick={() => onViewRecord(item)}
                        title="View details"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View
                      </button>
                      {(item.patientId || item.id) && (
                        <button
                          className="table-action-button ai-action"
                          onClick={() => onViewRecord(item)}
                          title="AI Intelligence"
                        >
                          <span className="ai-action-icon">🤖</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="records-table-pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Previous
          </button>
          <div className="pagination-info">
            Page {page} of {totalPages}
          </div>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

