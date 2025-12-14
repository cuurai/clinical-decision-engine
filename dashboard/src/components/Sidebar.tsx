import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { services } from "../types/services";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const generalNavItems = [
  {
    id: "cloud-hub",
    name: "Cloud Hub",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
  },
  {
    id: "cloud-overview",
    name: "Cloud overview",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    id: "solutions",
    name: "Solutions",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    id: "recently-visited",
    name: "Recently visited",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Sidebar close handler called");
    onClose();
  };
  const [pinnedServices] = useState<string[]>([
    "decision-intelligence",
    "knowledge-evidence",
    "patient-clinical-data",
    "workflow-care-pathways",
    "integration-interoperability",
  ]);
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [submenuPositions, setSubmenuPositions] = useState<
    Record<string, { top: number; left: number }>
  >({});
  const submenuRefs = useRef<Record<string, HTMLElement | null>>({});
  const sidebarRef = useRef<HTMLElement>(null);

  const pinnedProducts = services.filter((service) => pinnedServices.includes(service.id));

  const getSubmenuPosition = useCallback(
    (serviceId: string, element: HTMLElement | null) => {
      if (!element) return { top: 0, left: 280 };

      const rect = element.getBoundingClientRect();
      const gap = 8;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const submenuMaxHeight = viewportHeight - 100;

      // Find the service to calculate submenu height
      const currentService = pinnedProducts.find((s) => s.id === serviceId);
      const estimatedItemHeight = 40;
      const headerHeight = 50;
      const submenuHeight = currentService
        ? Math.min(
            currentService.resources.length * estimatedItemHeight + headerHeight,
            submenuMaxHeight
          )
        : submenuMaxHeight;

      // Calculate top position, ensuring submenu doesn't go off screen
      let top = rect.top;

      // Adjust if submenu would go below viewport
      if (top + submenuHeight > viewportHeight - 20) {
        top = viewportHeight - submenuHeight - 20;
      }

      // Ensure submenu doesn't go above viewport
      if (top < 20) {
        top = 20;
      }

      // Calculate left position
      let left = rect.left + rect.width + gap;

      // Adjust if submenu would go off right edge of viewport
      const submenuWidth = 280;
      if (left + submenuWidth > viewportWidth - 20) {
        // Position to the left of the item instead
        left = rect.left - submenuWidth - gap;
      }

      return {
        top: Math.max(20, top),
        left: Math.max(20, left),
      };
    },
    [pinnedProducts]
  );

  // Update submenu positions when they should be shown
  useEffect(() => {
    const updatePositions = () => {
      const newPositions: Record<string, { top: number; left: number }> = {};
      pinnedProducts.forEach((service) => {
        const itemRef = submenuRefs.current[service.id];
        if (itemRef) {
          newPositions[service.id] = getSubmenuPosition(service.id, itemRef);
        }
      });
      setSubmenuPositions(newPositions);
    };

    const serviceIdToCheck = hoveredServiceId || openSubmenuId;
    if (serviceIdToCheck) {
      // Small delay to ensure refs are set
      const timer = setTimeout(updatePositions, 0);

      // Update positions on scroll
      const sidebarElement = sidebarRef.current;
      const handleScroll = () => {
        updatePositions();
      };

      if (sidebarElement) {
        sidebarElement.addEventListener("scroll", handleScroll, { passive: true });
      }

      // Update on window resize
      window.addEventListener("resize", updatePositions, { passive: true });

      return () => {
        clearTimeout(timer);
        if (sidebarElement) {
          sidebarElement.removeEventListener("scroll", handleScroll);
        }
        window.removeEventListener("resize", updatePositions);
      };
    }
  }, [hoveredServiceId, openSubmenuId, getSubmenuPosition, pinnedProducts]);

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openSubmenuId &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        // Check if click is on submenu
        const target = event.target as HTMLElement;
        const submenu = target.closest(".sidebar-submenu");
        if (!submenu) {
          setOpenSubmenuId(null);
        }
      }
    };

    if (openSubmenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openSubmenuId]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleServiceClick = (serviceId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (openSubmenuId === serviceId) {
      setOpenSubmenuId(null);
    } else {
      setOpenSubmenuId(serviceId);
    }
  };

  const handleServiceMouseEnter = (serviceId: string) => {
    setHoveredServiceId(serviceId);
  };

  const handleServiceMouseLeave = () => {
    // Don't close if submenu is explicitly opened
    if (!openSubmenuId) {
      setHoveredServiceId(null);
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside ref={sidebarRef} className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header" onClick={(e) => e.stopPropagation()}>
          <button
            className="sidebar-close-button"
            onClick={handleClose}
            aria-label="Close sidebar"
            type="button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              pointerEvents="none"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="sidebar-branding">
            <div className="sidebar-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#sidebarLogoGradient)" />
                <path
                  d="M2 17L12 22L22 17M2 12L12 17L22 12"
                  stroke="url(#sidebarLogoGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8ab4f8" />
                    <stop offset="100%" stopColor="#c58af9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="sidebar-brand-text">cuur.ai</span>
          </div>
        </div>

        <div className="sidebar-content">
          {/* General Navigation */}
          <nav className="sidebar-nav">
            {generalNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.id === "solutions" ? "/" : `#${item.id}`}
                className="sidebar-nav-item"
              >
                <span className="sidebar-nav-icon-wrapper">{item.icon}</span>
                <span className="sidebar-nav-text">{item.name}</span>
                <svg
                  className="sidebar-nav-arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            ))}
          </nav>

          {/* Pinned Products Section */}
          <div className="sidebar-pinned-section">
            <div className="sidebar-pinned-header">
              <span className="sidebar-pinned-title">Pinned products</span>
              <button className="sidebar-edit-button" aria-label="Edit pinned products">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
            <nav className="sidebar-pinned-nav">
              {pinnedProducts.map((service) => {
                const isHovered = hoveredServiceId === service.id;
                const isSubmenuOpen = openSubmenuId === service.id;
                const showSubmenu = isHovered || isSubmenuOpen;

                return (
                  <div
                    key={service.id}
                    className="sidebar-pinned-item-wrapper"
                    onMouseEnter={() => handleServiceMouseEnter(service.id)}
                    onMouseLeave={handleServiceMouseLeave}
                  >
                    <div
                      ref={(el) => {
                        if (el) {
                          submenuRefs.current[service.id] = el;
                        } else {
                          delete submenuRefs.current[service.id];
                        }
                      }}
                      className={`sidebar-pinned-item ${
                        isActive(`/service/${service.id}`) ? "active" : ""
                      } ${isSubmenuOpen ? "submenu-open" : ""}`}
                      onClick={(e) => handleServiceClick(service.id, e)}
                    >
                      <span className="sidebar-pinned-icon">{service.icon}</span>
                      <span className="sidebar-pinned-text">{service.name}</span>
                      <svg
                        className="sidebar-pinned-pin"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <svg
                        className={`sidebar-pinned-arrow ${isSubmenuOpen ? "rotated" : ""}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>

                    {/* Submenu - rendered via portal to float above everything */}
                    {showSubmenu &&
                      service.resources.length > 0 &&
                      createPortal(
                        <div
                          className="sidebar-submenu"
                          style={{
                            top: `${submenuPositions[service.id]?.top || 0}px`,
                            left: `${submenuPositions[service.id]?.left || 280}px`,
                          }}
                          onMouseEnter={() => {
                            handleServiceMouseEnter(service.id);
                          }}
                          onMouseLeave={() => {
                            // Only close on mouse leave if not explicitly opened
                            if (!openSubmenuId) {
                              handleServiceMouseLeave();
                            }
                          }}
                        >
                          <div className="sidebar-submenu-header">
                            <span className="sidebar-submenu-title">{service.name}</span>
                          </div>
                          <nav className="sidebar-submenu-nav">
                            {service.resources.map((resource) => (
                              <Link
                                key={resource.id}
                                to={`/service/${service.id}/resource/${resource.id}`}
                                className={`sidebar-submenu-item ${
                                  isActive(`/service/${service.id}/resource/${resource.id}`)
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() => setOpenSubmenuId(null)}
                              >
                                <span className="sidebar-submenu-text">{resource.name}</span>
                              </Link>
                            ))}
                          </nav>
                        </div>,
                        document.body
                      )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* View All Products Button */}
        <div className="sidebar-footer">
          <Link to="/" className="sidebar-view-all-button">
            View all products
          </Link>
        </div>
      </aside>
    </>
  );
}
