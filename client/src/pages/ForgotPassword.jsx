import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import BrandMark from "../components/BrandMark.jsx";
import QuotePanel from "../components/QuotePanel.jsx";

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 5.3A11 11 0 0 1 12 5.2c6.5 0 10 6 10 6a17.9 17.9 0 0 1-4 4.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 6.8A17.7 17.7 0 0 0 2 12s3.5 6 10 6c1.5 0 2.9-.3 4.1-.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9A3 3 0 0 0 14 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const data = await api("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      setSuccess(data.message || "Password updated successfully");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Could not reset password");
    }
  }

  return (
    <div className="auth-shell container">
      <div className="auth-visual card">
        <div className="auth-brand">
          <BrandMark size={96} />
          <div>
            <p className="eyebrow">Reset access</p>
            <h1 className="auth-title">
              <span className="brand-word-blue">Haven:</span>{" "}
              <span className="brand-word-green">Your Mind Mate</span>
            </h1>
          </div>
        </div>
        <p className="auth-lead">
          Confirm your identity with your name and email, then choose a new password.
        </p>
        <QuotePanel highlight />
      </div>

      <div className="card auth-card">
        <p className="eyebrow">Forgot password</p>
        <h2 style={{ marginTop: 0, color: "var(--ink)" }}>Verify and set a new password</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="reset-name">
              Full name
            </label>
            <input
              id="reset-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="reset-email">
              Email
            </label>
            <input
              id="reset-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="reset-password">
              New password
            </label>
            <div className="password-field">
              <input
                id="reset-password"
                className="input password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="reset-confirm-password">
              Confirm new password
            </label>
            <div className="password-field">
              <input
                id="reset-confirm-password"
                className="input password-input"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          {success ? <p style={{ color: "var(--good)", fontWeight: 700 }}>{success}</p> : null}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            Update password
          </button>
        </form>
        <p style={{ marginTop: "1.25rem", textAlign: "center" }}>
          Back to <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
