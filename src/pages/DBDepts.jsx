import { useState } from "react";
import T from "../constants/tokens";
import Badge from "../components/Badge";
import PriorityDot from "../components/PriorityDot";
import { COMPLAINTS, DEPTS } from "../data/mockData";
import useIsMobile from "../hooks/useIsMobile";

function DBDepts() {
  const isMobile = useIsMobile(768);
  const [sel, setSel] = useState(null);
  const p = isMobile ? "16px" : "28px 34px";

  if (sel) {
    const dc = COMPLAINTS.filter(c => c.dept === sel.name);
    return (
      <div style={{ padding: p }}>
        <button onClick={() => setSel(null)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.sub, borderRadius: 7, padding: "7px 15px", fontSize: 13, cursor: "pointer", marginBottom: 22, fontWeight: 600 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ fontSize: 44 }}>{sel.icon}</div>
          <div><h2 style={{ color: T.text, fontSize: isMobile ? 18 : 22, fontWeight: 900, margin: 0, fontFamily: "'Syne',sans-serif" }}>{sel.name}</h2><div style={{ color: T.sub, fontSize: 13, marginTop: 3 }}>{sel.officer} · {sel.email}</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[["Total", sel.complaints, sel.color], ["Resolved", sel.resolved, T.green], ["Pending", sel.pending, T.amber], ["Rate", `${Math.round(sel.resolved / sel.complaints * 100)}%`, sel.color]].map(([k, v, col]) => (
            <div key={k} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 11, padding: isMobile ? "12px 14px" : "16px 18px" }}>
              <div style={{ color: T.sub, fontSize: 11, marginBottom: 6 }}>{k}</div>
              <div style={{ color: col, fontSize: isMobile ? 20 : 24, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, overflow: "hidden" }}>
          {dc.length === 0 && <div style={{ padding: "22px", color: T.sub, textAlign: "center" }}>No complaints in preview data for this department</div>}
          {dc.map((c, i) => (
            isMobile ? (
              <div key={c.id} style={{ padding: "12px 16px", borderBottom: i < dc.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: T.cyan, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{c.id}</span>
                  <Badge status={c.status} />
                </div>
                <div style={{ color: T.text, fontSize: 13, marginBottom: 2 }}>{c.citizen}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.sub, fontSize: 12 }}>{c.location.split(",")[0]}</span>
                  <PriorityDot p={c.priority} />
                </div>
              </div>
            ) : (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "92px 136px 1fr 108px 86px", alignItems: "center", padding: "12px 20px", gap: 10, borderBottom: i < dc.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <span style={{ color: T.cyan, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{c.id}</span>
                <span style={{ color: T.text, fontSize: 13 }}>{c.citizen}</span>
                <span style={{ color: T.sub, fontSize: 12 }}>{c.location}</span>
                <Badge status={c.status} /><PriorityDot p={c.priority} />
              </div>
            )
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: p }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16 }}>
        {DEPTS.map((d, i) => {
          const rate = Math.round((d.resolved / d.complaints) * 100);
          return (
            <div key={i} onClick={() => setSel(d)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: isMobile ? "18px" : "24px", cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = d.color + "77"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 14px 36px ${d.color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div style={{ fontSize: 34 }}>{d.icon}</div>
                <span style={{ background: `${d.color}18`, color: d.color, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>{rate}% resolved</span>
              </div>
              <div style={{ color: T.text, fontSize: 17, fontWeight: 800, marginBottom: 3, fontFamily: "'Syne',sans-serif" }}>{d.name}</div>
              <div style={{ color: T.sub, fontSize: 12, marginBottom: 14 }}>{d.officer}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div style={{ background: T.surf, borderRadius: 8, padding: "10px 12px" }}><div style={{ color: T.sub, fontSize: 10 }}>Total</div><div style={{ color: T.text, fontWeight: 800, fontSize: 17, fontFamily: "'Syne',sans-serif" }}>{d.complaints}</div></div>
                <div style={{ background: T.surf, borderRadius: 8, padding: "10px 12px" }}><div style={{ color: T.sub, fontSize: 10 }}>Pending</div><div style={{ color: T.amber, fontWeight: 800, fontSize: 17, fontFamily: "'Syne',sans-serif" }}>{d.pending}</div></div>
              </div>
              <div style={{ height: 5, background: T.border, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${rate}%`, background: `linear-gradient(90deg,${d.color},${d.color}88)`, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DBDepts;
