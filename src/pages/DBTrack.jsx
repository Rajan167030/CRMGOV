import { useState } from "react";
import T from "../constants/tokens";
import Badge from "../components/Badge";
import PriorityDot from "../components/PriorityDot";
import useIsMobile from "../hooks/useIsMobile";
import { fetchComplaintById } from "../services/api";

function DBTrack() {
  const isMobile = useIsMobile(768);
  const [val, setVal] = useState("");
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!val.trim()) { setErr("Please enter a complaint ID"); setRes(null); return; }
    setErr("");
    setLoading(true);

    try {
      const response = await fetchComplaintById({
        complaintId: val.trim(),
      });
      setRes(response.complaint);
    } catch (requestError) {
      setRes(null);
      setErr(requestError.message || "No complaint found with that ID.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const p = isMobile ? "16px" : "28px 34px";

  return (
    <div style={{ padding: p, maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>Track Complaint</h1>
        <p style={{ color: T.sub, fontSize: 15, margin: 0 }}>Check the real-time status of your grievance</p>
      </div>

      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 24, padding: isMobile ? "24px 20px" : "40px", boxShadow: T.shadow, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px", color: T.text, fontFamily: "'Poppins',sans-serif" }}>Enter Details</h2>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{ position: "absolute", left: 18, top: 14, fontSize: 18, color: T.sub }}>🔍</span>
          <input 
            value={val} 
            onChange={e => { setVal(e.target.value); setErr(""); }} 
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Complaint ID" 
            style={{ width: "100%", padding: "14px 16px 14px 48px", background: T.bg, border: `1px solid ${err ? T.red : T.border}`, borderRadius: 12, color: T.text, fontSize: 15, outline: "none", transition: "border .2s" }} 
          />
        </div>
        {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>{err}</div>}
        <button onClick={search} style={{ background: T.gradientRed, color: "#fff", border: "none", borderRadius: 12, padding: "14px 24px", fontSize: 15, fontWeight: 700, width: "100%", cursor: "pointer", transition: "all .2s", boxShadow: `0 6px 20px ${T.primary}33` }}>
          {loading ? "Loading..." : "Track Status →"}
        </button>
      </div>

      {res && (
        <div style={{ background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 24, padding: isMobile ? "24px 20px" : "32px", animation: "fadeUp .4s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ color: T.primary, fontFamily: "monospace", fontSize: 14, fontWeight: 800 }}>{res._id}</span>
              <h3 style={{ color: T.text, fontSize: 20, fontWeight: 800, margin: "4px 0 4px", fontFamily: "'Poppins',sans-serif" }}>{res.department}</h3>
              <span style={{ color: T.textSecondary, fontSize: 13, fontWeight: 500 }}>Filed {formatDate(res.createdAt)}</span>
            </div>
            <Badge status={res.status} />
          </div>

          <div style={{ background: T.white, borderRadius: 16, padding: "20px", marginBottom: 24, border: `1px solid ${T.border}` }}>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 15, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>Status Timeline</div>
            {[
              { time: formatDate(res.createdAt), action: "Filed", note: "Complaint registered", col: T.primary },
              { time: formatDate(res.updatedAt), action: "Assigned", note: `Officer assigned in ${res.department}`, col: T.accent },
              ...(res.status === "In Progress" || res.status === "Resolved" || res.status === "Escalated" ? [{ time: "Day 2", action: "In Progress", note: "Investigation underway", col: T.amber }] : []),
              ...(res.status === "Resolved" ? [{ time: "Day 3", action: "Resolved", note: "Issue closed. SMS sent.", col: T.green }] : []),
            ].map((t, i, arr) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < arr.length - 1 ? 20 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.col, flexShrink: 0, marginTop: 4, border: `2px solid ${T.white}`, boxShadow: `0 0 0 2px ${t.col}44` }} />
                  {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: T.borderLight, marginTop: 4 }} />}
                </div>
                <div>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 800 }}>{t.action}</div>
                  <div style={{ color: T.textSecondary, fontSize: 13, marginTop: 2 }}>{t.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            <div style={{ background: T.white, borderRadius: 12, padding: "12px 16px", border: `1px solid ${T.border}` }}>
              <div style={{ color: T.sub, fontSize: 11, marginBottom: 4, fontWeight: 700 }}>PRIORITY</div>
              <PriorityDot p={res.priority || "Medium"} />
            </div>
            <div style={{ background: T.white, borderRadius: 12, padding: "12px 16px", border: `1px solid ${T.border}` }}>
              <div style={{ color: T.sub, fontSize: 11, marginBottom: 4, fontWeight: 700 }}>LOCATION</div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 800 }}>
                {res.location}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DBTrack;
