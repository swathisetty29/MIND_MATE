import { Link, Navigate } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import QuotePanel from "../components/QuotePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-shell">
      <section className="landing-hero container">
        <div className="landing-copy">
          <div className="brand-hero">
            <div className="brand-badge">
              <BrandMark size={96} />
            </div>
            <div>
              <p className="eyebrow">Student Wellness Platform</p>
              <h1>
                <span className="brand-word-blue">Mind</span>
                <span className="brand-word-green">Mate</span>
              </h1>
            </div>
          </div>

          <p className="hero-text">
            A softer digital space for students to pause, reflect, track wellness, and feel
            supported through everyday emotional ups and downs.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: "none" }}>
              Enter MindMate
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ textDecoration: "none" }}>
              Create account
            </Link>
          </div>

          <div className="hero-points">
            <div className="feature-chip">AI support chat</div>
            <div className="feature-chip">Sleep tracker</div>
            <div className="feature-chip">Anonymous peer support</div>
          </div>
        </div>

        <div className="hero-visual card">
          <div className="hero-visual-art">
            <BrandMark size={220} />
          </div>
          <QuotePanel
            quote="You do not have to fix everything today. You only need one honest breath, one kind thought, and one gentle next step."
            author="MindMate opening note"
          />
        </div>
      </section>

      <section className="container landing-grid">
        <div className="card soft-card">
          <p className="card-kicker">Reflect</p>
          <h2>Speak freely in a calm AI space</h2>
          <p>Let your thoughts out without pressure and receive warm, steady responses.</p>
        </div>
        <div className="card soft-card">
          <p className="card-kicker">Notice</p>
          <h2>Track small wellness patterns</h2>
          <p>Keep an eye on sleep and mood so progress feels visible, not invisible.</p>
        </div>
        <div className="card soft-card">
          <p className="card-kicker">Connect</p>
          <h2>Meet a peer when you need one</h2>
          <p>Find another student for an anonymous conversation when human support matters.</p>
        </div>
      </section>
    </div>
  );
}
