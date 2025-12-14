import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { getServiceById } from "../types/services";
import { getResourceIcon } from "../config/resourceIcons";
import "./ResourceNav.css";

export function ResourceNav() {
  // Start minimized on mobile, expanded on desktop
  const [isMinimized, setIsMinimized] = useState(() => {
    return window.innerWidth <= 1024;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const { serviceId, resourceId } = useParams<{ serviceId: string; resourceId: string }>();
  const location = useLocation();
  const service = serviceId ? getServiceById(serviceId) : null;

  // Determine if nav should be expanded (either not minimized, or minimized but hovered)
  const isExpanded = !isMinimized || (isMinimized && isHovered);

  // Update minimized state based on window size (only on initial mount and resize)
  useEffect(() => {
    const handleResize = () => {
      // On mobile (<=1024px), force minimized; on desktop, respect current state
      if (window.innerWidth <= 1024) {
        setIsMinimized(true);
      }
      // Don't auto-expand on desktop resize - let user control it
    };

    // Set initial state based on window size
    if (window.innerWidth <= 1024) {
      setIsMinimized(true);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Collapse on route change if starting from collapsed mode
  useEffect(() => {
    // If minimized, collapse back to icon-only on route change
    if (isMinimized) {
      setIsCollapsing(true);
      setIsHovered(false);
      // Reset collapsing flag after a short delay
      setTimeout(() => setIsCollapsing(false), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Trigger on route change

  // ResourceNav always pushes content - update margin classes based on state
  useEffect(() => {
    const mainElement = document.querySelector(".dashboard-main.has-resource-nav");
    if (!mainElement) return;

    // Use requestAnimationFrame to batch DOM updates and prevent visual glitches
    requestAnimationFrame(() => {
      // Always apply margin classes to push content (never overlay)
      if (isMinimized && isHovered) {
        // Minimized but hover-expanded: push with full width
        mainElement.classList.remove("has-resource-nav-minimized");
        mainElement.classList.add("has-resource-nav-hover-expanded");
      } else if (isMinimized && !isHovered) {
        // Minimized: push with minimized width
        mainElement.classList.add("has-resource-nav-minimized");
        mainElement.classList.remove("has-resource-nav-hover-expanded");
      } else if (!isMinimized) {
        // Expanded: push with full width
        mainElement.classList.remove("has-resource-nav-minimized");
        mainElement.classList.remove("has-resource-nav-hover-expanded");
      }
    });
  }, [isExpanded, isMinimized, isHovered]);

  // ResourceNav is independent - no need to track sidebar state
  // Sidebar overlays on top, ResourceNav stays in place

  if (!service) {
    return null;
  }

  const isActive = (resourceIdToCheck: string) => {
    return resourceId === resourceIdToCheck;
  };

  return (
    <>
      <div
        id="resource-nav-container"
        className={`resource-nav ${isMinimized ? "resource-nav-minimized" : ""} ${
          isExpanded ? "resource-nav-expanded" : ""
        }`}
        onMouseEnter={() => {
          // Expand on hover if minimized (works on both mobile and desktop)
          // Don't expand if we're in the process of collapsing
          if (isMinimized && !isCollapsing) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          // Collapse hover expansion if minimized
          if (isMinimized) {
            setIsHovered(false);
          }
        }}
      >
        {/* Fixed service label at top */}
        <div className="resource-nav-fixed-top">
          <Link
            to={`/service/${serviceId}`}
            className="resource-nav-item resource-nav-service-label"
            title={isMinimized ? service.name : undefined}
            onClick={() => {
              // If starting from collapsed mode and user clicks, collapse back to icon-only
              if (isMinimized) {
                setIsCollapsing(true);
                setIsHovered(false);
                // Reset collapsing flag after a short delay
                setTimeout(() => setIsCollapsing(false), 300);
              }
            }}
          >
            <span className="resource-nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </span>
            {isExpanded && <span className="resource-nav-label">{service.name}</span>}
          </Link>
        </div>

        {/* Scrollable resources list */}
        <nav className="resource-nav-list">
          {service.resources.map((resource) => (
            <Link
              key={resource.id}
              to={`/service/${serviceId}/resource/${resource.id}`}
              className={`resource-nav-item ${isActive(resource.id) ? "active" : ""}`}
              title={isMinimized ? resource.name : undefined}
              onClick={() => {
                // If starting from collapsed mode and user clicks an item, collapse back to icon-only
                if (isMinimized) {
                  setIsCollapsing(true);
                  setIsHovered(false);
                  // Reset collapsing flag after a short delay
                  setTimeout(() => setIsCollapsing(false), 300);
                }
              }}
            >
              <span className="resource-nav-icon">
                {serviceId ? (
                  getResourceIcon(serviceId, resource.id).content
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                )}
              </span>
              {isExpanded && <span className="resource-nav-label">{resource.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Fixed items at bottom - like GCP */}
        <div className="resource-nav-fixed">
          <Link
            to={`/service/${serviceId}`}
            className="resource-nav-item resource-nav-fixed-item"
            title={isMinimized ? "Manage Resources" : undefined}
            onClick={() => {
              // If starting from collapsed mode and user clicks, collapse back to icon-only
              if (isMinimized) {
                setIsCollapsing(true);
                setIsHovered(false);
                // Reset collapsing flag after a short delay
                setTimeout(() => setIsCollapsing(false), 300);
              }
            }}
          >
            <span className="resource-nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="1"></circle>
              </svg>
            </span>
            {isExpanded && <span className="resource-nav-label">Manage Resources</span>}
          </Link>
          <Link
            to="/settings"
            className="resource-nav-item resource-nav-fixed-item"
            title={isMinimized ? "Release Notes" : undefined}
            onClick={() => {
              // If starting from collapsed mode and user clicks, collapse back to icon-only
              if (isMinimized) {
                setIsCollapsing(true);
                setIsHovered(false);
                // Reset collapsing flag after a short delay
                setTimeout(() => setIsCollapsing(false), 300);
              }
            }}
          >
            <span className="resource-nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            {isExpanded && <span className="resource-nav-label">Release Notes</span>}
          </Link>
          {/* Toggle button as part of fixed items */}
          <button
            className="resource-nav-item resource-nav-toggle"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Use a single state update to prevent race conditions
              setIsHovered(false);
              setIsMinimized((prev) => !prev);
            }}
            onMouseDown={(e) => {
              // Prevent event bubbling but allow click
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-label={isMinimized ? "Expand navigation" : "Collapse navigation"}
            title={isMinimized ? "Expand navigation" : "Collapse navigation"}
            type="button"
          >
            <span className="resource-nav-icon">
              {isMinimized ? (
                // When minimized, show right arrow to indicate expansion
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              ) : (
                // When expanded, show left arrow to indicate collapse
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              )}
            </span>
            {/* Always show label when nav is visible (expanded), showing the action that will happen */}
            {isExpanded && (
              <span className="resource-nav-label">
                {/* Show "Expand" when currently minimized (action: expand), "Collapse" when currently expanded (action: collapse) */}
                {isMinimized ? "Expand" : "Collapse"}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
