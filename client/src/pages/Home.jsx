import { Link, Navigate } from "react-router-dom";
import { BRAND_IMAGE_URL } from "../components/BrandMark.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-shell">
      <section className="landing-hero container">
        <div className="landing-copy landing-copy-centered card">
          <div className="hero-center-card">
            <div className="hero-poster hero-poster-large">
              <img
                className="hero-image"
                src={BRAND_IMAGE_URL}
                alt="Haven: Your Mind Mate poster"
              />
              <div>
                <p className="eyebrow">Your safe space to breathe</p>
                <h1>
                  <span className="brand-word-blue">Haven:</span>{" "}
                  <span className="brand-word-green">Your Mind Mate</span>
                </h1>
              </div>
            </div>
          </div>

          <div className="hero-quote">
            <p className="hero-text">
              Everyone trains the body, but who&apos;s looking out for the person inside?
              Consider this your safe space, no grades, no deadlines, just a place to
              breathe.
            </p>
            <p className="hero-signoff">
              Haven: Your Mind Mate.
              <br />
              Because your mind deserves a best friend, too.
            </p>
          </div>

          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: "none" }}>
              Enter Haven
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
