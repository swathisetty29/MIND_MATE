import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import QuotePanel from "../components/QuotePanel.jsx";
import { getDailyChatComfortQuote } from "../data/dailyQuotes.js";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [replySource, setReplySource] = useState("");
  const [modelError, setModelError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    api("/chat/history")
      .then((d) => {
        setMessages(
          (d.messages || []).map((m) => ({
            role: m.role,
            content: m.content,
            sentiment: m.sentiment,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    setModelError("");

    try {
      const data = await api("/chat", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setReplySource(data.source || "");
      setModelError(data.modelError || "");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          risky: data.risky,
          sentiment: data.sentiment,
        },
      ]);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
      setReplySource("");
      setModelError("Could not reach the chat API.");
    } finally {
      setLoading(false);
    }
  }

  function handleComposerKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="container" style={{ paddingTop: "1.5rem", maxWidth: 640 }}>
      <h1 style={{ marginTop: 0 }}>AI support chat</h1>
      <p style={{ color: "var(--muted)" }}>
        Chat in a calm space. Press Enter to send and Shift+Enter to start a new line.
      </p>
      {replySource ? (
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "-0.35rem" }}>
          Reply source: <strong>{replySource}</strong>
          {modelError ? ` - ${modelError}` : ""}
        </p>
      ) : null}

      <div
        className="card"
        style={{
          minHeight: 360,
          maxHeight: "60vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        {loadingHistory && <p style={{ color: "var(--muted)" }}>Loading history...</p>}
        {!loadingHistory && messages.length === 0 && (
          <p style={{ color: "var(--muted)" }}>Say hello. What's on your mind today?</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              padding: "0.65rem 1rem",
              borderRadius: 12,
              background: m.role === "user" ? "#d4eef4" : "#f0fafc",
              border: m.risky ? "2px solid var(--primary-light)" : "1px solid #c5dde3",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
              {m.role === "user" ? "You" : "Haven"}
              {m.sentiment && m.role === "user" && (
                <span style={{ marginLeft: "0.5rem" }}>mood: {m.sentiment}</span>
              )}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Thinking...
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <textarea
          className="input"
          rows={2}
          style={{ flex: "1 1 200px", resize: "vertical" }}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleComposerKeyDown}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Send
        </button>
      </form>

      <QuotePanel quote={getDailyChatComfortQuote()} highlight />
    </div>
  );
}
