import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import QuotePanel from "../components/QuotePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function sleepBarColor(hours) {
  if (hours >= 7) return "var(--good)";
  if (hours >= 6) return "var(--warn)";
  return "var(--danger)";
}

function lastNDaysLabels(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    out.push(d);
  }
  return out;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [mental, setMental] = useState(null);
  const [sleepEntries, setSleepEntries] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    const id = user.id;
    Promise.all([api(`/mental-state/${id}`), api(`/sleep/${id}`)])
      .then(([m, s]) => {
        setMental(m);
        setSleepEntries(s.entries || []);
      })
      .catch((e) => setErr(e.message));
  }, [user]);

  const days = lastNDaysLabels(7);
  const byDate = Object.fromEntries(
    sleepEntries.map((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return [d.getTime(), e.hours];
    })
  );

  const maxH = Math.max(8, ...days.map((d) => byDate[d.getTime()] || 0), 1);

  const stateColor =
    mental?.mentalState === "Good" ? "var(--good)" : mental?.mentalState === "Poor" ? "var(--danger)" : "var(--warn)";

  return (
    <div className="container" style={{ paddingTop: "1.5rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Hello, {user?.name}</h1>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>Your wellness snapshot</p>

      {err && <p className="error-text">{err}</p>}

      <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div className="card">
          <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Mental state (simple estimate)</h2>
          {mental ? (
            <>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, color: stateColor, margin: "0.5rem 0" }}>{mental.mentalState}</p>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Avg sleep (last 7 days): <strong>{mental.avgSleepHours}</strong> hrs · {mental.chatMoodSummary}
              </p>
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{mental.suggestion.title}</p>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--muted)" }}>
                  {mental.suggestion.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p>Loading…</p>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Weekly sleep</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: 180, paddingTop: "0.5rem" }}>
            {days.map((d) => {
              const h = byDate[d.getTime()];
              const hours = typeof h === "number" ? h : null;
              const pct = hours == null ? 0 : Math.min(100, (hours / maxH) * 100);
              const label = d.toLocaleDateString(undefined, { weekday: "short" });
              return (
                <div key={d.getTime()} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 48,
                      height: `${pct}%`,
                      minHeight: hours == null ? 4 : 8,
                      background: hours == null ? "#ddeef2" : sleepBarColor(hours),
                      borderRadius: 6,
                      transition: "height 0.2s ease",
                    }}
                    title={hours != null ? `${hours} hrs` : "No data"}
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{label}</span>
                  {hours != null && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{hours}h</span>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 0 }}>
            Green ≥7h · Orange 6–7h · Red &lt;6h
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1.5rem" }}>
        <Link to="/chat" className="btn btn-primary" style={{ textDecoration: "none" }}>
          Talk to AI
        </Link>
        <Link to="/peer" className="btn btn-secondary" style={{ textDecoration: "none" }}>
          Connect with peer
        </Link>
        <Link to="/sleep" className="btn btn-ghost" style={{ textDecoration: "none", border: "1px solid #c5dde3" }}>
          Log sleep
        </Link>
      </div>

      <QuotePanel
        compact
        quote="This snapshot is a gentle reflection, not a diagnosis. If distress keeps growing, reaching out to a counselor or doctor is a strong next step."
      />
    </div>
  );
}
