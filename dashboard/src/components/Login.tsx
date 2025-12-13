import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    navigate("/");
  };

  const handleSSO = () => {
    // TODO: Implement SSO logic
    console.log("SSO login");
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google login");
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple OAuth
    console.log("Apple login");
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          {/* Logo and Branding */}
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-shape logo-shape-1"></div>
              <div className="logo-shape logo-shape-2"></div>
            </div>
            <h1 className="login-title">Welcome to cuur.ai</h1>
            <p className="login-subtitle">Log in or register with your email</p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Continue
            </button>
          </form>

          {/* SSO Button */}
          <button onClick={handleSSO} className="btn-secondary btn-sso">
            <svg
              className="sso-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2L10 6H14L11 9L13 13L8 10L3 13L5 9L2 6H6L8 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Single sign-on (SSO)
          </button>

          {/* Divider */}
          <div className="divider">
            <span className="divider-text">or</span>
          </div>

          {/* Social Login Buttons */}
          <div className="social-buttons">
            <button onClick={handleGoogleLogin} className="btn-secondary btn-social">
              <svg
                className="google-icon"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65454 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
                  fill="#34A853"
                />
                <path
                  d="M3.96409 10.71C3.78409 10.17 3.68182 9.59317 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95817H0.957273C0.347727 6.17317 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.57954C10.3214 3.57954 11.5077 4.03363 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01681 0.957275 4.95817L3.96409 7.29C4.67182 5.16272 6.65454 3.57954 9 3.57954Z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <button onClick={handleAppleLogin} className="btn-secondary btn-social">
              <svg
                className="apple-icon"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.845 4.155C13.605 6.24 11.79 7.125 11.79 7.125C11.79 7.125 12.6 4.29 11.4 2.205C10.35 0.36 8.7 0.36 8.7 0.36C8.7 0.36 7.95 0.36 7.2 0.9C6.45 1.44 5.85 2.4 5.85 2.4C5.85 2.4 4.5 1.515 3.15 2.4C1.8 3.285 1.2 4.8 1.2 6.315C1.2 7.83 1.8 9.345 3.15 10.23C4.5 11.115 5.85 10.23 5.85 10.23C5.85 10.23 6.45 11.19 7.2 11.73C7.95 12.27 8.7 12.27 8.7 12.27C8.7 12.27 10.35 12.27 11.4 10.425C12.6 8.34 11.79 5.505 11.79 5.505C11.79 5.505 13.605 6.39 13.845 4.155Z"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
