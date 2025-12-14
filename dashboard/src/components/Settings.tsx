import { useTheme } from "../contexts/ThemeContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import "./Settings.css";

export function Settings() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="settings-page">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="settings-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`settings-main ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="settings-content">
            <div className="settings-header">
              <h1 className="settings-title">Settings</h1>
              <p className="settings-subtitle">Manage your account settings and preferences</p>
            </div>

            <div className="settings-section">
              <h2 className="settings-section-title">Appearance</h2>
              <p className="settings-section-description">Choose how cuur.ai looks to you</p>

              <div className="settings-option">
                <div className="settings-option-content">
                  <div className="settings-option-header">
                    <span className="settings-option-label">Theme</span>
                    <span className="settings-option-description">Select light or dark mode</span>
                  </div>
                </div>
                <div className="settings-option-control">
                  <div className="theme-toggle-group">
                    <button
                      className={`theme-toggle-button ${theme === "light" ? "active" : ""}`}
                      onClick={() => setTheme("light")}
                      aria-label="Light mode"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                      <span>Light</span>
                    </button>
                    <button
                      className={`theme-toggle-button ${theme === "dark" ? "active" : ""}`}
                      onClick={() => setTheme("dark")}
                      aria-label="Dark mode"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
