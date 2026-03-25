import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import T from "../constants/tokens";
import useIsMobile from "../hooks/useIsMobile";
import { useAuth } from "../context/AuthContext";
import { createChatSession, sendChatMessage } from "../services/api";

function DBFile() {
  const isMobile = useIsMobile(768);
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Please describe your complaint in one message. Include the issue and location if possible.",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [complaintId, setComplaintId] = useState("");
  const [done, setDone] = useState(false);
  const listRef = useRef(null);

  const btnStyle = {
    background: T.gradientRed,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 24px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .2s",
    boxShadow: `0 6px 20px ${T.primary}33`,
  };

  const p = isMobile ? "16px" : "28px 34px";

  const ensureSession = async () => {
    if (sessionId) {
      return sessionId;
    }

    const response = await createChatSession(user.id);
    setSessionId(response.sessionId);
    return response.sessionId;
  };

  const resetConversation = () => {
    setSessionId(null);
    setInput("");
    setDone(false);
    setComplaintId("");
    setError("");
    setMessages([
      {
        role: "assistant",
        content:
          "Please describe your complaint in one message. Include the issue and location if possible.",
      },
    ]);
  };

  const submitMessage = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || !user || isSubmitting || done) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    const previousMessages = messages;
    const nextMessages = [...messages, { role: "user", content: trimmedMessage }];
    setMessages(nextMessages);
    setInput("");

    try {
      const activeSessionId = await ensureSession();
      const response = await sendChatMessage({
        sessionId: activeSessionId,
        message: trimmedMessage,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", content: response.reply },
      ]);

      if (response.complaintId) {
        setComplaintId(response.complaintId);
        setDone(true);
      }
    } catch (requestError) {
      setMessages(previousMessages);
      setError(requestError.message || "Unable to process your message");
    } finally {
      setIsSubmitting(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  };

  if (done) return (
    <div style={{ padding: p, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 24, padding: isMobile ? "32px 24px" : "48px 56px", textAlign: "center", maxWidth: 460, boxShadow: T.shadowLg }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: T.greenBg, color: T.green, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>✓</div>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 900, margin: "0 0 12px", fontFamily: "'Poppins',sans-serif" }}>Complaint Filed</h2>
        <p style={{ color: T.textSecondary, fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>Your complaint has been registered successfully. The assigned department will be notified immediately.</p>
        <div style={{ background: T.bg, padding: "16px", borderRadius: 12, marginBottom: 32, border: `1px solid ${T.borderLight}` }}>
          <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Complaint ID</div>
          <div style={{ color: T.primary, fontSize: 18, fontWeight: 900, fontFamily: "monospace" }}>{complaintId}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link to="/dashboard/my-complaints" style={btnStyle}>Track Status</Link>
          <button onClick={resetConversation} style={{ ...btnStyle, background: T.white, color: T.text, border: `1px solid ${T.border}`, boxShadow: "none" }}>File Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: p, maxWidth: 840, margin: "0 auto" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>Complaint Assistant</h1>
        <p style={{ color: T.sub, fontSize: 15, margin: 0 }}>Chat with the complaint bot to register your grievance.</p>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 24, padding: isMobile ? "20px" : "28px", boxShadow: T.shadow }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: T.text, fontSize: 18, fontWeight: 800, fontFamily: "'Poppins',sans-serif" }}>Live Complaint Chat</div>
              <div style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>The Node backend stores the session and routes AI requests to FastAPI.</div>
            </div>
            <button onClick={resetConversation} style={{ ...btnStyle, padding: "10px 16px", fontSize: 13 }}>
              New Chat
            </button>
          </div>

          <div ref={listRef} style={{ background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 18, padding: "16px", minHeight: 360, maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: isMobile ? "88%" : "72%",
                  background: message.role === "user" ? T.gradientRed : T.white,
                  color: message.role === "user" ? "#fff" : T.text,
                  border: message.role === "user" ? "none" : `1px solid ${T.border}`,
                  borderRadius: 18,
                  padding: "12px 14px",
                  boxShadow: message.role === "user" ? `0 8px 18px ${T.primary}22` : "none",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.content}
              </div>
            ))}
            {isSubmitting && (
              <div style={{ alignSelf: "flex-start", background: T.white, border: `1px solid ${T.border}`, borderRadius: 18, padding: "12px 14px", color: T.sub }}>
                Assistant is reviewing your complaint...
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16, flexDirection: isMobile ? "column" : "row" }}>
            <input
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitMessage();
                }
              }}
              placeholder="Describe the issue and location"
              style={{
                flex: 1,
                padding: "14px 16px",
                background: T.white,
                border: `1px solid ${error ? T.red : T.border}`,
                borderRadius: 12,
                color: T.text,
                fontSize: 15,
                outline: "none",
              }}
              disabled={isSubmitting || done}
            />
            <button onClick={submitMessage} style={btnStyle} disabled={isSubmitting || done}>
              Send
            </button>
          </div>
          {error && <div style={{ color: T.red, fontSize: 13, marginTop: 10, fontWeight: 600 }}>{error}</div>}
        </div>
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 24, padding: isMobile ? "20px" : "28px", boxShadow: T.shadow }}>
          <div style={{ color: T.text, fontSize: 18, fontWeight: 800, fontFamily: "'Poppins',sans-serif", marginBottom: 12 }}>Suggested prompts</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              "There is a water leakage near Sector 12 market.",
              "A pothole on MG Road is causing traffic issues.",
              "Garbage is not being collected in Ward 8.",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                style={{
                  border: `1px solid ${T.border}`,
                  background: T.bg,
                  color: T.text,
                  borderRadius: 999,
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DBFile;
