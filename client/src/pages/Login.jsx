import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import BrandMark from "../components/BrandMark.jsx";
import QuotePanel from "../components/QuotePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="auth-shell container">
      <div className="auth-visual card">
        <div className="auth-brand">
          <BrandMark size={96} />
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1 className="auth-title">
              <span className="brand-word-blue">Mind</span>
              <span className="brand-word-green">Mate</span>
            </h1>
          </div>
        </div>
        <p className="auth-lead">
          Step back into your calm corner for reflection, wellness, and gentle support.
        </p>
        <QuotePanel
          quote="You are allowed to begin softly. Peace does not need a perfect entrance."
          author="Daily affirmation"
        />
      </div>

      <div className="card auth-card">
        <p className="eyebrow">Sign in</p>
        <h2 style={{ marginTop: 0, color: "var(--ink)" }}>Your calm space is waiting</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            Log in
          </button>
        </form>
        <p style={{ marginTop: "1.25rem", textAlign: "center" }}>
          No account? <Link to="/register">Register</Link>
        </p>
        <QuotePanel
          compact
          quote="MindMate is supportive, not clinical care. If you are in immediate danger, contact local emergency services or a crisis helpline."
        />
      </div>
    </div>
  );
}
