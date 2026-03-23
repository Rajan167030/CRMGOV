import T from "../constants/tokens";
import Badge from "../components/Badge";
import PriorityDot from "../components/PriorityDot";
import { COMPLAINTS, DEPTS } from "../data/mockData";
import useIsMobile from "../hooks/useIsMobile";

function DBDashboard({ setPage }) {
  const isMobile = useIsMobile(768);
  const stats = [
    { label: "Total Complaints", value: "12,847", delta: "+8.3%", icon: "📋", col: T.cyan },
    { label: "Resolved Today", value: "284", delta: "+12%", icon: "✅", col: T.green },
    { label: "Avg Resolution", value: "2.4d", delta: "-0.3d", icon: "⏱️", col: T.purple },
    { label: "SLA Breached", value: "47", delta: "-23%", icon: "🚨", col: T.red },
  ];
  const channels = [
    { ch: "Web Portal", n: 4821, pct: 37.5, col: T.cyan }, { ch: "Mobile App", n: 3912, pct: 30.4, col: T.blue },
    { ch: "WhatsApp", n: 2341, pct: 18.2, col: T.green }, { ch: "Voice / IVR", n: 1773, pct: 13.8, col: T.purple },
  ];
  const p = isMobile ? "16px" : "28px 34px";
  return (
    <div style={{ padding: p }}>
      <div style={{ marginBottom: isMobile ? 18 : 26 }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 20 : 24, fontWeight: 900, margin: 0, fontFamily: "'Syne',sans-serif" }}>Command Center</h1>
        <p style={{ color: T.sub, margin: "4px 0 0", fontSize: isMobile ? 11 : 13 }}>Real-time civic infrastructure overview · {new Date().toLocaleDateString("en-IN", { weekday: isMobile ? "short" : "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 10 : 14, marginBottom: isMobile ? 14 : 22 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, padding: isMobile ? "14px" : "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.col}0D` }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: isMobile ? 8 : 12 }}>
              <span style={{ fontSize: isMobile ? 18 : 22 }}>{s.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 100, background: T.green + "22", color: T.green }}>{s.delta}</span>
            </div>
            <div style={{ color: T.text, fontSize: isMobile ? 20 : 26, fontWeight: 900, letterSpacing: -1, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
            <div style={{ color: T.sub, fontSize: isMobile ? 10 : 12, marginTop: 4 }}>{s.label}</div>
            <div style={{ height: 2, background: T.border, borderRadius: 2, marginTop: isMobile ? 8 : 12 }}>
              <div style={{ height: "100%", width: `${62 + i * 8}%`, background: s.col, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: isMobile ? 14 : 18, marginBottom: isMobile ? 14 : 18 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, overflow: "hidden" }}>
          <div style={{ padding: isMobile ? "12px 14px" : "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 14, fontFamily: "'Syne',sans-serif" }}>Live Complaint Feed</div>
            <button onClick={() => setPage("complaints")} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.cyan, borderRadius: 7, padding: "5px 13px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View All →</button>
          </div>
          <div className="table-scroll">
            {COMPLAINTS.slice(0, isMobile ? 4 : 6).map((c, i) => (
              <div key={c.id} style={{ display: "flex", flexWrap: isMobile ? "wrap" : "nowrap", alignItems: "center", padding: isMobile ? "10px 14px" : "12px 20px", gap: isMobile ? 6 : 10, borderBottom: i < (isMobile ? 3 : 5) ? `1px solid ${T.border}` : "none" }}>
                <span style={{ color: T.cyan, fontFamily: "monospace", fontSize: 12, fontWeight: 700, minWidth: isMobile ? "auto" : 92 }}>{c.id}</span>
                <span style={{ color: T.text, fontSize: 13, minWidth: isMobile ? "auto" : 126 }}>{c.citizen}</span>
                {!isMobile && <span style={{ color: T.sub, fontSize: 12, flex: 1 }}>{c.dept} · {c.location.split(",")[0]}</span>}
                <Badge status={c.status} />
                <PriorityDot p={c.priority} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, padding: isMobile ? "16px" : "20px" }}>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 14, fontFamily: "'Syne',sans-serif", marginBottom: 4 }}>Intake Channels</div>
          <div style={{ color: T.sub, fontSize: 12, marginBottom: 18 }}>Complaint source distribution</div>
          {channels.map((ch, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>{ch.ch}</span>
                <span style={{ color: T.sub, fontSize: 11 }}>{ch.n.toLocaleString()} ({ch.pct}%)</span>
              </div>
              <div style={{ height: 6, background: T.border, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${ch.pct}%`, background: `linear-gradient(90deg,${ch.col},${ch.col}88)`, borderRadius: 3 }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 18, padding: 12, background: T.cyan + "10", borderRadius: 9, border: `1px solid ${T.cyan}22` }}>
            <div style={{ color: T.cyan, fontSize: 11, fontWeight: 700, marginBottom: 3 }}>🌐 Multilingual Active</div>
            <div style={{ color: T.sub, fontSize: 11 }}>Hindi · English · Tamil · Telugu + 8 more</div>
          </div>
        </div>
      </div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, padding: isMobile ? "16px" : "20px" }}>
        <div style={{ color: T.text, fontWeight: 800, fontSize: 14, fontFamily: "'Syne',sans-serif", marginBottom: 16 }}>Department Performance</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(6,1fr)", gap: 12 }}>
          {DEPTS.map((d, i) => {
            const rate = Math.round((d.resolved / d.complaints) * 100);
            const circ = 2 * Math.PI * 18, fill = circ * (rate / 100);
            return (
              <div key={i} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 11, padding: isMobile ? "12px 8px" : "16px 10px", textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? 22 : 26, marginBottom: 7 }}>{d.icon}</div>
                <div style={{ color: T.text, fontSize: 11, fontWeight: 700, marginBottom: 10, fontFamily: "'Syne',sans-serif" }}>{d.name}</div>
                <svg width="48" height="48" viewBox="0 0 48 48" style={{ marginBottom: 5 }}>
                  <circle cx="24" cy="24" r="18" fill="none" stroke={T.border} strokeWidth="4" />
                  <circle cx="24" cy="24" r="18" fill="none" stroke={d.color} strokeWidth="4"
                    strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round" transform="rotate(-90 24 24)" />
                  <text x="24" y="28" textAnchor="middle" fill={d.color} fontSize="9" fontWeight="800" fontFamily="monospace">{rate}%</text>
                </svg>
                <div style={{ color: T.sub, fontSize: 10 }}>{d.complaints} total</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DBDashboard;
