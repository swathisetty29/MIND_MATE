import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function PeerChat() {
  const { user, setUser } = useAuth();
  const [anon, setAnon] = useState(user?.anonymousUsername || "");
  const [phase, setPhase] = useState("idle");
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (user?.anonymousUsername != null) setAnon(user.anonymousUsername);
  }, [user]);
  const pollRef = useRef(null);
  const msgPollRef = useRef(null);
  const lastMsgTime = useRef(null);

  const saveAnon = async () => {
    try {
      const d = await api("/me", {
        method: "PATCH",
        body: JSON.stringify({ anonymousUsername: anon }),
      });
      setUser(d.user);
    } catch (e) {
      setError(e.message);
    }
  };

  const loadMessages = useCallback(async (sid) => {
    const q =
      lastMsgTime.current ? `?since=${encodeURIComponent(lastMsgTime.current)}` : "";
    const d = await api(`/peer/messages/${sid}${q}`);
    const list = d.messages || [];
    if (list.length) {
      lastMsgTime.current = list[list.length - 1].createdAt;
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const m of list) {
          if (!ids.has(m.id)) merged.push(m);
        }
        return merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function pollStatus() {
      try {
        const d = await api("/peer/status");
        if (cancelled) return;
        if (d.session) {
          setSessionId(d.session.sessionId);
          setStatus(d.session.status);
          setPhase(d.session.status === "active" ? "chat" : "consent");
          if (d.session.status === "active") {
            lastMsgTime.current = null;
            setMessages([]);
            loadMessages(d.session.sessionId);
          }
        } else if (d.waiting) {
          setPhase("waiting");
        } else if (phase === "waiting" && !d.waiting && !d.session) {
          setPhase("idle");
        }
      } catch {
        /* ignore */
      }
    }
    pollRef.current = setInterval(pollStatus, 2500);
    pollStatus();
    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [phase, loadMessages]);

  useEffect(() => {
    if (phase !== "chat" || !sessionId) {
      clearInterval(msgPollRef.current);
      return;
    }
    msgPollRef.current = setInterval(() => {
      loadMessages(sessionId).catch(() => {});
    }, 2000);
    return () => clearInterval(msgPollRef.current);
  }, [phase, sessionId, loadMessages]);

  async function findPeer() {
    setError("");
    setNotice("");
    try {
      const d = await api("/find-peer", { method: "POST", body: "{}" });
      if (d.matched) {
        setSessionId(d.sessionId);
        setStatus(d.status);
        setPhase(d.status === "active" ? "chat" : "consent");
        if (d.status === "active") {
          lastMsgTime.current = null;
          setMessages([]);
          loadMessages(d.sessionId);
        }
      } else {
        setPhase("waiting");
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function accept() {
    if (!sessionId) return;
    setError("");
    try {
      const d = await api("/accept-peer", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      setStatus(d.status);
      if (d.status === "active") {
        setPhase("chat");
        lastMsgTime.current = null;
        setMessages([]);
        loadMessages(sessionId);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function sendPeer(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !sessionId || status !== "active") return;
    setInput("");
    setNotice("");
    try {
      const d = await api("/send-message", {
        method: "POST",
        body: JSON.stringify({ sessionId, message: text }),
      });
      if (d.blocked) {
        setNotice(d.notice);
        return;
      }
      setMessages((prev) => [...prev, { ...d.message, id: d.message.id }]);
      lastMsgTime.current = d.message.createdAt;
    } catch (err) {
      setError(err.message);
    }
  }

  async function endChat() {
    if (!sessionId) return;
    try {
      await api("/peer/end", { method: "POST", body: JSON.stringify({ sessionId }) });
      setPhase("idle");
      setSessionId(null);
      setStatus(null);
      setMessages([]);
      lastMsgTime.current = null;
    } catch (e) {
      setError(e.message);
    }
  }

  const displayName = anon?.trim() || "Anonymous";

  return (
    <div className="container" style={{ paddingTop: "1.5rem", maxWidth: 560 }}>
      <h1 style={{ marginTop: 0 }}>Peer support</h1>
      <p style={{ color: "var(--muted)" }}>
        Anonymous text chat with another student. Both must agree before messaging. Be kind — no photos or video.
      </p>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <p style={{ marginTop: 0, fontWeight: 600 }}>Optional display name (peer sees this as your label)</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input className="input" style={{ maxWidth: 220 }} value={anon} onChange={(e) => setAnon(e.target.value)} placeholder="e.g. BlueJay42" />
          <button type="button" className="btn btn-secondary" onClick={saveAnon}>
            Save
          </button>
        </div>
      </div>

      {phase === "idle" && (
        <div className="card">
          <p>When you are ready, we will try to match you with someone else who is also looking for support.</p>
          <button type="button" className="btn btn-primary" onClick={findPeer}>
            Find support
          </button>
        </div>
      )}

      {phase === "waiting" && (
        <div className="card">
          <p>Looking for a peer… keep this tab open. This can take a minute if no one else is searching.</p>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Tip: open a second browser or ask a friend to log in and click Find support to test.</p>
        </div>
      )}

      {phase === "consent" && sessionId && (
        <div className="card">
          <p style={{ fontWeight: 600 }}>Connect with a peer?</p>
          <p>Another student is available. If you both accept, a private chat will open.</p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={accept}>
              Accept
            </button>
            <button type="button" className="btn btn-ghost" style={{ border: "1px solid #ccc" }} onClick={endChat}>
              Decline / cancel
            </button>
          </div>
          {status === "pending" && <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Waiting for the other person to accept…</p>}
        </div>
      )}

      {phase === "chat" && status === "active" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 600 }}>Chat as {displayName}</span>
            <button type="button" className="btn btn-secondary" onClick={endChat}>
              End chat
            </button>
          </div>
          <div
            className="card"
            style={{
              minHeight: 280,
              maxHeight: "50vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            {messages.length === 0 && <p style={{ color: "var(--muted)" }}>Say hello — you are both anonymous here.</p>}
            {messages.map((m) => {
              const mine = m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: mine ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "0.5rem 0.85rem",
                    borderRadius: 10,
                    background: mine ? "#d4eef4" : "#eef8f5",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{mine ? "You" : "Peer"}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                </div>
              );
            })}
          </div>
          {notice && (
            <div className="disclaimer" style={{ marginBottom: "0.75rem" }}>
              {notice}
            </div>
          )}
          <form onSubmit={sendPeer} style={{ display: "flex", gap: "0.5rem" }}>
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message…" />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="disclaimer" style={{ marginTop: "1.5rem" }}>
        Peer chat is moderated lightly by keyword filters only. It is not monitored in real time. Not a substitute for professional help.
      </div>
    </div>
  );
}
