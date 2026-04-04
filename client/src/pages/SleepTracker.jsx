import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function SleepTracker() {
  const { user } = useAuth();
  const [hours, setHours] = useState("7");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [entries, setEntries] = useState([]);

  function load() {
    if (!user?.id) return;
    api(`/sleep/${user.id}`)
      .then((d) => setEntries(d.entries || []))
      .catch((e) => setErr(e.message));
  }

  useEffect(() => {
    load();
  }, [user]);

  async function save(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const h = parseFloat(hours);
      if (Number.isNaN(h) || h < 0 || h > 24) {
        setErr("Enter hours between 0 and 24");
        return;
      }
      await api("/sleep", {
        method: "POST",
        body: JSON.stringify({ date, hours: h }),
      });
      setMsg("Saved.");
      load();
    } catch (e) {
      setErr(e.message || "Could not save");
    }
  }

  return (
    <div className="container" style={{ paddingTop: "1.5rem", maxWidth: 520 }}>
      <h1 style={{ marginTop: 0 }}>Sleep tracking</h1>
      <p style={{ color: "var(--muted)" }}>Log hours slept for a given night (daily or your best estimate).</p>

      <form className="card" onSubmit={save} style={{ marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="d">
            Date
          </label>
          <input id="d" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="h">
            Hours slept
          </label>
          <input
            id="h"
            className="input"
            type="number"
            step="0.25"
            min="0"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>
        {err && <p className="error-text">{err}</p>}
        {msg && <p style={{ color: "var(--accent)" }}>{msg}</p>}
        <button type="submit" className="btn btn-primary">
          Save entry
        </button>
      </form>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Recent entries</h2>
        {entries.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No entries yet. Add your first night above.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {[...entries]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 14)
              .map((e, i) => (
                <li key={i} style={{ marginBottom: "0.35rem" }}>
                  {new Date(e.date).toLocaleDateString()}: <strong>{e.hours}</strong> hrs
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
