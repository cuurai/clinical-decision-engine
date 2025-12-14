import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { services } from "../types/services";
import "./Dashboard.css";

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredServices = selectedCategory
    ? services.filter((s) => s.category === selectedCategory)
    : services;

  const categories = [
    { id: "core", name: "Core Services" },
    { id: "data", name: "Data Services" },
    { id: "workflow", name: "Workflow Services" },
    { id: "integration", name: "Integration Services" },
  ];

  return (
    <div className="dashboard">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="dashboard-main">
          <div className="dashboard-content">
            <div className="dashboard-header">
              <h1 className="dashboard-title">All products</h1>
              <p className="dashboard-subtitle">
                Explore products from cuur.ai and recommended partners at a glance
              </p>
            </div>

            {/* Marketplace Card */}
            <div className="marketplace-card">
              <div className="marketplace-content">
                <div>
                  <h3 className="marketplace-title">
                    Find and deploy over 4,500 products in Marketplace
                  </h3>
                </div>
                <div className="marketplace-actions">
                  <button className="marketplace-link">Visit Marketplace</button>
                  <button className="marketplace-icon-button" aria-label="Notifications">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Services by Category */}
            {categories.map((category) => {
              const categoryServices = filteredServices.filter((s) => s.category === category.id);
              if (categoryServices.length === 0) return null;

              return (
                <section key={category.id} className="service-category">
                  <div className="category-header">
                    <h2 className="category-title">{category.name}</h2>
                    <p className="category-description">
                      {category.id === "core" &&
                        "AI-powered decision support and knowledge management"}
                      {category.id === "data" && "Patient data management and clinical records"}
                      {category.id === "workflow" && "Care pathways and workflow automation"}
                      {category.id === "integration" && "System integration and interoperability"}
                    </p>
                  </div>
                  <div className="service-list">
                    {categoryServices.map((service) => (
                      <Link
                        key={service.id}
                        to={`/service/${service.id}`}
                        className="service-list-item"
                      >
                        <div className="service-list-icon">
                          <span className="service-icon-emoji">{service.icon}</span>
                        </div>
                        <div className="service-list-content">
                          <div className="service-list-name">{service.name}</div>
                          <div className="service-list-description">{service.description}</div>
                        </div>
                        <div className="service-list-actions">
                          <button
                            className="service-list-action-button"
                            onClick={(e) => {
                              e.preventDefault();
                              // TODO: Open documentation
                            }}
                            aria-label="Documentation"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                          </button>
                          <button
                            className="service-list-action-button"
                            onClick={(e) => {
                              e.preventDefault();
                              // TODO: Open menu
                            }}
                            aria-label="More options"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
