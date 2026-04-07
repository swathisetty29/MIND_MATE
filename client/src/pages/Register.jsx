import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import BrandMark from "../components/BrandMark.jsx";
import QuotePanel from "../components/QuotePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      const data = await api("/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Could not register");
    }
  }

  return (
    <div className="auth-shell container">
      <div className="auth-visual card">
        <div className="auth-brand">
          <BrandMark size={96} />
          <div>
            <p className="eyebrow">Create account</p>
            <h1 className="auth-title">
              <span className="brand-word-blue">Haven:</span>{" "}
              <span className="brand-word-green">Your Mind Mate</span>
            </h1>
          </div>
        </div>
        <p className="auth-lead">
          Build a space that feels lighter, steadier, and more human each time you return.
        </p>
        <QuotePanel highlight />
      </div>

      <div className="card auth-card">
        <p className="eyebrow">Join now</p>
        <h2 style={{ marginTop: 0, color: "var(--ink)" }}>Start your wellness space</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="password">
              Password (min 6 characters)
            </label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            Sign up
          </button>
        </form>
        <p style={{ marginTop: "1.25rem", textAlign: "center" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
