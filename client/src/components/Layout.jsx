import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import BrandMark from "./BrandMark.jsx";
import QuotePanel from "./QuotePanel.jsx";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container app-header-inner">
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            <span className="brand-lockup">
              <BrandMark size={46} compact />
              <span className="brand-name">
                <span className="brand-word-blue">Mind</span>
                <span className="brand-word-green">Mate</span>
              </span>
            </span>
          </Link>
          {user && (
            <nav className="app-nav">
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>
                Dashboard
              </NavLink>
              <NavLink to="/chat" className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>
                AI Chat
              </NavLink>
              <NavLink to="/sleep" className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>
                Sleep
              </NavLink>
              <NavLink to="/peer" className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>
                Peer
              </NavLink>
              <span className="nav-user">{user.name}</span>
              <button type="button" className="btn btn-secondary" onClick={logout} style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
                Log out
              </button>
            </nav>
          )}
        </div>
      </header>
      <main style={{ flex: 1, paddingBottom: "2rem" }}>
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container">
          <QuotePanel
            compact
            quote="Healing is often quiet. Sometimes it is just resting more, speaking kinder, and beginning again tomorrow."
            author="MindMate"
          />
        </div>
      </footer>
    </div>
  );
}
