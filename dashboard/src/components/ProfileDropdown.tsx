import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileDropdown.css";

interface ProfileDropdownProps {
  onClose?: () => void;
}

export function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate("/settings");
    onClose?.();
  };

  return (
    <div className="profile-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="profile-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <div className="user-avatar">
          <span className="user-initial">M</span>
        </div>
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-user-info">
              <div className="profile-dropdown-avatar-large">
                <span className="user-initial">M</span>
              </div>
              <div className="profile-dropdown-user-details">
                <div className="profile-dropdown-user-name">User Name</div>
                <div className="profile-dropdown-user-email">user@example.com</div>
              </div>
            </div>
          </div>

          <div className="profile-dropdown-divider"></div>

          <div className="profile-dropdown-items">
            <button className="profile-dropdown-item" onClick={handleSettingsClick}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0L5.636 18.364m12.728-12.728l-4.243 4.243m-4.242 0L5.636 5.636"></path>
              </svg>
              <span>Settings</span>
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
        </div>
      )}
    </div>
  );
}
