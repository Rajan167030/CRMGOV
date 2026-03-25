import { useState } from "react";
import T from "../constants/tokens";
import { COMPLAINTS } from "../data/mockData";
import useIsMobile from "../hooks/useIsMobile";

function DBEscalations() {
  const isMobile = useIsMobile(768);
  const p = isMobile ? "16px" : "28px 34px";
  const esc = COMPLAINTS.filter(c => c.status === "Escalated" || c.priority === "Critical" || c.sla < 0);
  const [act, setAct] = useState(null);

  return (
    <div style={{ padding: p, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>Critical Escalations</h1>
          <p style={{ color: T.red, fontSize: 14, fontWeight: 700, margin: 0, padding: "4px 12px", background: T.redBg, borderRadius: 100, display: "inline-block", border: `1px solid ${T.red}33` }}>Requires Immediate Intervention</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: T.white, border: `1px solid ${T.red}`, color: T.red, borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.redBg; }} onMouseLeave={e => { e.currentTarget.style.background = T.white; }}>
            Notify Heads
          </button>
          <button style={{ background: T.gradientRed, border: "none", color: "#fff", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 12px ${T.primary}33` }}>
            Export Report
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { l: "Total Escalated", v: esc.length, i: "🚨", c: T.red },
          { l: "Overdue SLAs", v: esc.filter(c => c.sla < 0).length, i: "⏱️", c: T.amber },
          { l: "Critical Priority", v: esc.filter(c => c.priority === "Critical").length, i: "🔥", c: T.primary },
        ].map((s, i) => (
          <div key={i} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px", display: "flex", alignItems: "center", gap: 16, boxShadow: T.shadow }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `${s.c}15`, display: "flex", alignItems: "center", justifyItems: "center", fontSize: 24, flexShrink: 0 }}>{s.i}</div>
            <div>
              <div style={{ color: s.c, fontSize: 28, fontWeight: 900, lineHeight: 1, fontFamily: "'Poppins',sans-serif", marginBottom: 4 }}>{s.v}</div>
              <div style={{ color: T.sub, fontSize: 12, fontWeight: 700 }}>{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden", boxShadow: T.shadow }}>
        <div style={{ background: T.bg, padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, color: T.text, fontWeight: 800, margin: 0, fontFamily: "'Poppins',sans-serif" }}>Action Required ({esc.length})</h2>
          <span style={{ fontSize: 12, color: T.textSecondary, fontWeight: 600 }}>Sorted by: Days Overdue (Descending)</span>
        </div>
        
        {esc.map((e, i) => (
          <div key={e.id} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 24, padding: isMobile ? "20px" : "24px 32px", borderBottom: i < esc.length - 1 ? `1px solid ${T.borderLight}` : "none", alignItems: isMobile ? "flex-start" : "center", background: T.white, transition: "background .2s" }}
            onMouseEnter={ev => ev.currentTarget.style.background = T.bg} onMouseLeave={ev => ev.currentTarget.style.background = T.white}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
              <span style={{ color: T.primary, fontSize: 14, fontFamily: "monospace", fontWeight: 800 }}>{e.id}</span>
              <span style={{ background: T.redBg, color: T.red, padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 800, border: `1px solid ${T.red}33`, alignSelf: "flex-start" }}>
                {e.sla < 0 ? `${Math.abs(e.sla)} Days Overdue` : "SLA Breached"}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: "0 0 6px", fontFamily: "'Poppins',sans-serif" }}>{e.dept} Issue — {e.location.split(",")[0]}</h3>
              <p style={{ color: T.sub, fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>Filed by {e.citizen} on {e.created}. Currently assigned to {e.assigned}.</p>
            </div>

            <div style={{ display: "flex", gap: 10, width: isMobile ? "100%" : "auto" }}>
              <button onClick={() => setAct(e.id)} style={{ flex: isMobile ? 1 : "none", background: act === e.id ? T.redBg : "transparent", color: T.red, border: `1px solid ${T.red}`, borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>
                Take Action
              </button>
            </div>
            
            {act === e.id && (
              <div style={{ width: "100%", background: T.bg, padding: "20px", borderRadius: 12, marginTop: 16, border: `1px solid ${T.borderLight}`, animation: "fadeIn .3s" }}>
                <div style={{ fontWeight: 800, color: T.text, fontSize: 14, marginBottom: 12, fontFamily: "'Poppins',sans-serif" }}>Executive Override Protocols</div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  <button style={{ background: T.white, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 8, textAlign: "left", fontSize: 13, color: T.text, fontWeight: 600, cursor: "pointer", boxShadow: T.shadow }}>
                    <span style={{ color: T.amber, fontSize: 16, marginRight: 8 }}>🔄</span> Reassign to Rapid Response Team
                  </button>
                  <button style={{ background: T.white, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 8, textAlign: "left", fontSize: 13, color: T.text, fontWeight: 600, cursor: "pointer", boxShadow: T.shadow }}>
                    <span style={{ color: T.red, fontSize: 16, marginRight: 8 }}>📱</span> Call Assigned Officer Directly
                  </button>
                  <button style={{ background: T.white, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 8, textAlign: "left", fontSize: 13, color: T.text, fontWeight: 600, cursor: "pointer", boxShadow: T.shadow }}>
                    <span style={{ color: T.green, fontSize: 16, marginRight: 8 }}>✅</span> Force Mark Resolved
                  </button>
                  <button onClick={() => setAct(null)} style={{ background: "transparent", border: "none", color: T.sub, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {esc.length === 0 && <div style={{ padding: "48px", textAlign: "center", color: T.sub, fontWeight: 600, fontSize: 15 }}>No critical escalations at this time.</div>}
      </div>
    </div>
  );
}

export default DBEscalations;
