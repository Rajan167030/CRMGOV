import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import T from "../constants/tokens";
import useIsMobile from "../hooks/useIsMobile";
import {
  continueModelComplaintChat,
  saveComplaintRequest,
  startModelComplaintChat,
} from "../services/api";

const INITIAL_ASSISTANT_MESSAGE =
  "Namaste! Apni complaint likhiye. Main missing details poochhkar complaint complete karne mein madad karunga.";

const buildModelReply = (response) =>
  response?.final_message ||
  response?.question ||
  "I processed your complaint update.";

const buildLocationFromModelResponse = (response) => {
  const locationFromSlots = response?.slots?.LOCATION?.trim();
  if (locationFromSlots) {
    return locationFromSlots;
  }

  const struct = response?.location_struct;
  if (!struct || typeof struct !== "object") {
    return "";
  }

  const parts = [
    struct.area,
    struct.landmark,
    struct.city,
    struct.pincode,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());

  return [...new Set(parts)].join(", ");
};

function DBFile() {
  const isMobile = useIsMobile(768);
  const [modelSessionId, setModelSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: INITIAL_ASSISTANT_MESSAGE,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [complaintId, setComplaintId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [savedTicketId, setSavedTicketId] = useState("");
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

  const resetConversation = () => {
    setModelSessionId(null);
    setInput("");
    setComplaintId("");
    setTicket(null);
    setSavedTicketId("");
    setError("");
    setMessages([
      {
        role: "assistant",
        content: INITIAL_ASSISTANT_MESSAGE,
      },
    ]);
  };

  const submitMessage = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    const previousMessages = messages;
    const nextMessages = [...messages, { role: "user", content: trimmedMessage }];
    setMessages(nextMessages);
    setInput("");

    try {
      const response = modelSessionId
        ? await continueModelComplaintChat({
            sessionId: modelSessionId,
            text: trimmedMessage,
            conversationHistory: nextMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          })
        : await startModelComplaintChat({
            text: trimmedMessage,
          });

      if (response?.session_id) {
        setModelSessionId(response.session_id);
      }

      const assistantReply = buildModelReply(response);

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", content: assistantReply },
      ]);

      if (
        response?.ticket_id &&
        response.ticket_id !== savedTicketId
      ) {
        const complaintPayload = {
          complaint:
            response?.slots?.DESCRIPTION?.trim() || trimmedMessage,
          department: response?.department || "General",
          location: buildLocationFromModelResponse(response),
          priority: "Medium",
          ticketId: response.ticket_id,
        };

        const savedComplaint = await saveComplaintRequest(complaintPayload);
        const complaintRecord = savedComplaint.complaint;

        setSavedTicketId(response.ticket_id);
        setComplaintId(complaintRecord.ticketId || complaintRecord._id);
        setTicket(complaintRecord);
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
              <div style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>This chat talks directly to the grievance model on localhost:8000 and saves the complaint after a ticket is generated.</div>
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

          {ticket && (
            <div style={{ marginTop: 16, background: T.white, border: `1px solid ${T.border}`, borderRadius: 18, padding: isMobile ? "18px" : "22px", boxShadow: T.shadow }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div>
                  <div style={{ color: T.green, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Ticket Generated</div>
                  <div style={{ color: T.text, fontSize: 22, fontWeight: 900, fontFamily: "'Poppins',sans-serif", marginTop: 4 }}>Complaint Filed</div>
                </div>
                <Link to="/dashboard/my-complaints" style={{ ...btnStyle, padding: "10px 16px", fontSize: 13 }}>
                  Track Status
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                <div style={{ background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Complaint ID</div>
                  <div style={{ color: T.primary, fontSize: 17, fontWeight: 900, fontFamily: "monospace" }}>{complaintId}</div>
                </div>
                <div style={{ background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Department</div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>{ticket?.department || "General"}</div>
                </div>
                <div style={{ background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Location</div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>{ticket?.location || "Not provided"}</div>
                </div>
                <div style={{ background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Priority</div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>{ticket?.priority || "Medium"}</div>
                </div>
                <div style={{ background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Status</div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>{ticket?.status || "Pending"}</div>
                </div>
                <div style={{ background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Created</div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>
                    {ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString() : "Just now"}
                  </div>
                </div>
              </div>

              <div style={{ background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 12, padding: "14px 16px", marginTop: 12 }}>
                <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Complaint Summary</div>
                <div style={{ color: T.text, fontSize: 15, lineHeight: 1.6 }}>{ticket?.complaint || "Your complaint has been registered successfully."}</div>
              </div>

              <button onClick={resetConversation} style={{ ...btnStyle, marginTop: 16, background: T.white, color: T.text, border: `1px solid ${T.border}`, boxShadow: "none" }}>
                File Another
              </button>
            </div>
          )}

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
              placeholder="Describe the issue and exact location"
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
              disabled={isSubmitting}
            />
            <button onClick={submitMessage} style={btnStyle} disabled={isSubmitting}>
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
