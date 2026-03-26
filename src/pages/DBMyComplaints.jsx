import { useEffect, useState } from "react";
import T from "../constants/tokens";
import Badge from "../components/Badge";
import PriorityDot from "../components/PriorityDot";
import useIsMobile from "../hooks/useIsMobile";
import { useAuth } from "../context/AuthContext";
import { fetchComplaints } from "../services/api";

function DBMyComplaints() {
  const isMobile = useIsMobile(768);
  const { user } = useAuth();
  const [myComplaints, setMyComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const p = isMobile ? "16px" : "28px 34px";

  useEffect(() => {
    const loadComplaints = async () => {
      if (!user) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await fetchComplaints();
        setMyComplaints(response.complaints || []);
      } catch (requestError) {
        setError(requestError.message || "Unable to load complaints");
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [user]);

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const displayComplaintId = (complaint) => complaint.ticketId || complaint._id;

  if (selected) return (
    <div style={{ padding: p }}>
      <button onClick={() => setSelected(null)} style={{ background: T.white, border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", marginBottom: 24, fontWeight: 700, boxShadow: T.shadow }}>← Back to List</button>
      
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "20px" : "32px", marginBottom: 24, boxShadow: T.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ color: T.primary, fontFamily: "monospace", fontSize: 14, fontWeight: 800 }}>{displayComplaintId(selected)}</span>
            <h2 style={{ color: T.text, fontSize: isMobile ? 20 : 26, fontWeight: 800, margin: "6px 0 6px", fontFamily: "'Poppins',sans-serif" }}>{selected.department} Issue</h2>
            <span style={{ color: T.sub, fontSize: 13, fontWeight: 500 }}>Filed on {formatDate(selected.createdAt)}</span>
          </div>
          <Badge status={selected.status} />
        </div>
        
        <div style={{ background: T.bg, borderRadius: 12, padding: "20px", marginBottom: 24, border: `1px solid ${T.borderLight}` }}>
          <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Description</div>
          <p style={{ color: T.text, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{selected.complaint}</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)", gap: 16 }}>
          {[["📍 Location", selected.location], ["🏛️ Department", selected.department], ["🚦 Priority", selected.priority || "Medium"], ["📝 Complaint ID", displayComplaintId(selected)]].map(([k, v]) => (
            <div key={k} style={{ background: T.white, borderRadius: 12, padding: "16px", border: `1px solid ${T.border}` }}>
              <div style={{ color: T.sub, fontSize: 11, marginBottom: 6, fontWeight: 700 }}>{k}</div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 800 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
          
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "20px" : "32px", boxShadow: T.shadow }}>
        <div style={{ color: T.text, fontWeight: 800, fontSize: 18, fontFamily: "'Poppins',sans-serif", marginBottom: 24 }}>Official Timeline</div>
        {[
          { time: formatDate(selected.createdAt), action: "Complaint Received", note: "Your complaint was successfully registered", col: T.primary },
          { time: formatDate(selected.updatedAt), action: "Under Review", note: `Assigned to ${selected.department} department for verification`, col: T.accent },
          { time: formatDate(selected.updatedAt), action: "Investigating", note: "An officer has been assigned to investigate", col: T.amber },
          ...(selected.status === "Resolved" ? [{ time: "Mar 08, 15:00", action: "Resolved", note: "Issue has been marked as resolved", col: T.green }] : []),
        ].map((t, i, arr) => (
          <div key={i} style={{ display: "flex", gap: 20, paddingBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: t.col, flexShrink: 0, marginTop: 4, border: `2px solid ${T.white}`, boxShadow: `0 0 0 3px ${t.col}33` }} />
              {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: T.borderLight, marginTop: 6 }} />}
            </div>
            <div>
              <div style={{ color: T.text, fontSize: 15, fontWeight: 800 }}>{t.action}</div>
              <div style={{ color: T.textSecondary, fontSize: 14, marginTop: 4 }}>{t.note}</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 6, fontWeight: 600 }}>{t.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: p }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: T.text, margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>My Complaints</h1>
        <p style={{ color: T.sub, fontSize: 14, margin: 0 }}>View and track the status of complaints you have filed.</p>
      </div>

      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: T.shadow }}>
        {loading && <div style={{ padding: "40px", textAlign: "center", color: T.sub, fontSize: 15, fontWeight: 600 }}>Loading complaints...</div>}
        {!loading && error && <div style={{ padding: "40px", textAlign: "center", color: T.red, fontSize: 15, fontWeight: 600 }}>{error}</div>}
        {!loading && !error && myComplaints.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: T.sub, fontSize: 15, fontWeight: 600 }}>You haven't filed any complaints yet.</div>}
        
        {!loading && !error && isMobile ? (
          myComplaints.map((c, i) => (
            <div key={c._id} onClick={() => setSelected(c)} style={{ padding: "18px 16px", cursor: "pointer", borderBottom: i < myComplaints.length - 1 ? `1px solid ${T.borderLight}` : "none", background: T.white }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: T.primary, fontFamily: "monospace", fontSize: 13, fontWeight: 800 }}>{displayComplaintId(c)}</span>
                <Badge status={c.status} />
              </div>
              <div style={{ color: T.text, fontSize: 16, fontWeight: 800, marginBottom: 8, fontFamily: "'Poppins',sans-serif" }}>{c.department} Issue</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: T.textSecondary, fontSize: 13, fontWeight: 500 }}>{formatDate(c.createdAt)}</span>
                <PriorityDot p={c.priority || "Medium"} />
              </div>
            </div>
          ))
        ) : (
          !loading && !error && <>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 140px 130px 110px", padding: "16px 28px", borderBottom: `1px solid ${T.border}`, background: T.bg, color: T.sub, fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
              <span>ID</span><span>Subject</span><span>Date Filed</span><span>Department</span><span>Status</span>
            </div>
            {myComplaints.map((c, i) => (
              <div key={c._id} onClick={() => setSelected(c)} style={{ display: "grid", gridTemplateColumns: "110px 1fr 140px 130px 110px", alignItems: "center", padding: "18px 28px", gap: 10, cursor: "pointer", borderBottom: i < myComplaints.length - 1 ? `1px solid ${T.borderLight}` : "none", transition: "all .15s", background: T.white }}
                onMouseEnter={e => e.currentTarget.style.background = T.bg} onMouseLeave={e => e.currentTarget.style.background = T.white}>
                <span style={{ color: T.primary, fontFamily: "monospace", fontSize: 14, fontWeight: 800 }}>{displayComplaintId(c)}</span>
                <span style={{ color: T.text, fontSize: 15, fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>{c.department} Issue</span>
                <span style={{ color: T.textSecondary, fontSize: 14 }}>{formatDate(c.createdAt)}</span>
                <span style={{ color: T.textSecondary, fontSize: 14 }}>{c.department}</span>
                <Badge status={c.status} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default DBMyComplaints;
