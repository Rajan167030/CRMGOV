import { useNavigate } from "react-router-dom";
import T from "../constants/tokens";
import Badge from "../components/Badge";
import PriorityDot from "../components/PriorityDot";
import { COMPLAINTS, DEPTS } from "../data/mockData";
import useIsMobile from "../hooks/useIsMobile";
import { useAuth } from "../context/AuthContext";

function DBDashboard() {
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const { role, user } = useAuth();
  
  const stats = role === "admin" ? [
    { label: "Total Complaints", value: "12,847", delta: "+8.3%", icon: "📋", col: T.primary },
    { label: "Resolved Today", value: "284", delta: "+12%", icon: "✅", col: T.green },
    { label: "Avg Resolution", value: "2.4d", delta: "-0.3d", icon: "⏱️", col: T.accent },
    { label: "SLA Breached", value: "47", delta: "-23%", icon: "🚨", col: T.amber },
  ] : [
    { label: "My Complaints", value: "4", delta: "Active", icon: "📂", col: T.primary },
    { label: "Resolved", value: "3", delta: "Completed", icon: "✅", col: T.green },
    { label: "In Progress", value: "1", delta: "Pending", icon: "⏳", col: T.amber },
    { label: "Drafts", value: "0", delta: "Unsaved", icon: "📝", col: T.sub },
  ];

  const channels = [
    { ch: "Web Portal", n: 4821, pct: 37.5, col: T.primary }, 
    { ch: "Mobile App", n: 3912, pct: 30.4, col: T.accent },
    { ch: "WhatsApp", n: 2341, pct: 18.2, col: T.green }, 
    { ch: "Voice / IVR", n: 1773, pct: 13.8, col: T.amber },
  ];
  
  const p = isMobile ? "16px" : "28px 34px";
  
  return (
    <div style={{ padding: p }}>
      <div style={{ marginBottom: isMobile ? 18 : 26 }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 22 : 28, fontWeight: 800, margin: 0, fontFamily: "'Poppins',sans-serif" }}>
          {role === "admin" ? "Command Center" : `Welcome back, ${user?.name}`}
        </h1>
        <p style={{ color: T.sub, margin: "4px 0 0", fontSize: isMobile ? 12 : 14 }}>
          {role === "admin" ? "Real-time civic infrastructure overview" : "Your personal civic services dashboard"} 
          · {new Date().toLocaleDateString("en-IN", { weekday: isMobile ? "short" : "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* ── Stats Strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 12 : 16, marginBottom: isMobile ? 20 : 26 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "16px" : "24px", position: "relative", overflow: "hidden", boxShadow: T.shadow }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.col}15` }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: isMobile ? 8 : 12 }}>
              <span style={{ fontSize: isMobile ? 22 : 26 }}>{s.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 100, background: T.borderLight, color: T.textSecondary }}>{s.delta}</span>
            </div>
            <div style={{ color: T.text, fontSize: isMobile ? 24 : 32, fontWeight: 900, letterSpacing: -1, fontFamily: "'Poppins',sans-serif" }}>{s.value}</div>
            <div style={{ color: T.sub, fontSize: isMobile ? 11 : 13, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            <div style={{ height: 4, background: T.borderLight, borderRadius: 2, marginTop: isMobile ? 12 : 16 }}>
              <div style={{ height: "100%", width: role === "admin" ? `${62 + i * 8}%` : "100%", background: s.col, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Live Feed & Intake Channels ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: isMobile ? 16 : 24, marginBottom: isMobile ? 16 : 24 }}>
        
        {/* Live Feed */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: T.shadow }}>
          <div style={{ padding: isMobile ? "14px 16px" : "18px 24px", borderBottom: `1px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15, fontFamily: "'Poppins',sans-serif" }}>Recent Complaints</div>
            <button onClick={() => navigate(role === "admin" ? "/dashboard/complaints" : "/dashboard/my-complaints")} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.accent, borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
              View All →
            </button>
          </div>
          <div className="table-scroll">
            {COMPLAINTS.slice(0, isMobile ? 4 : 5).map((c, i) => (
              <div key={c.id} style={{ display: "flex", flexWrap: isMobile ? "wrap" : "nowrap", alignItems: "center", padding: isMobile ? "12px 16px" : "14px 24px", gap: isMobile ? 8 : 12, borderBottom: i < 4 ? `1px solid ${T.borderLight}` : "none" }}>
                <span style={{ color: T.primary, fontFamily: "monospace", fontSize: 13, fontWeight: 700, minWidth: isMobile ? "auto" : 96 }}>{c.id}</span>
                <span style={{ color: T.text, fontSize: 13, fontWeight: 600, minWidth: isMobile ? "auto" : 130 }}>{role === "admin" ? c.citizen : c.title || "Water issue"}</span>
                {!isMobile && <span style={{ color: T.sub, fontSize: 12, flex: 1 }}>{c.dept} · {c.location.split(",")[0]}</span>}
                <Badge status={c.status} />
                <PriorityDot p={c.priority} />
              </div>
            ))}
          </div>
        </div>

        {/* Intake / Quick Actions */}
        {role === "admin" ? (
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "18px" : "24px", boxShadow: T.shadow }}>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15, fontFamily: "'Poppins',sans-serif", marginBottom: 4 }}>Intake Channels</div>
            <div style={{ color: T.sub, fontSize: 12, marginBottom: 22 }}>Complaint source distribution</div>
            {channels.map((ch, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{ch.ch}</span>
                  <span style={{ color: T.sub, fontSize: 12 }}>{ch.n.toLocaleString()} ({ch.pct}%)</span>
                </div>
                <div style={{ height: 6, background: T.borderLight, borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${ch.pct}%`, background: ch.col, borderRadius: 3 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 24, padding: 14, background: T.cyanBg, borderRadius: 10, border: `1px solid ${T.cyan}33` }}>
              <div style={{ color: T.cyan, fontSize: 12, fontWeight: 800, marginBottom: 4 }}>🌐 Multilingual Active</div>
              <div style={{ color: T.textSecondary, fontSize: 12 }}>Hindi · English · Tamil + 9 more</div>
            </div>
          </div>
        ) : (
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "18px" : "24px", boxShadow: T.shadow }}>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15, fontFamily: "'Poppins',sans-serif", marginBottom: 16 }}>Quick Actions</div>
            <button onClick={() => navigate("/dashboard/file")} style={{ width: "100%", padding: "14px", background: T.gradientRed, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12, boxShadow: `0 4px 12px ${T.primary}33` }}>
              ➕ File New Complaint
            </button>
            <button onClick={() => navigate("/dashboard/track")} style={{ width: "100%", padding: "14px", background: T.white, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              🔍 Track Status
            </button>
            <div style={{ marginTop: 24, padding: 14, background: T.accentLight, borderRadius: 10, border: `1px solid ${T.accent}33` }}>
              <div style={{ color: T.accent, fontSize: 12, fontWeight: 800, marginBottom: 4 }}>ℹ️ Need Help?</div>
              <div style={{ color: T.textSecondary, fontSize: 12 }}>Call helpline 1800-444-5555</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Department Performance (Admin only) ── */}
      {role === "admin" && (
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "18px" : "24px", boxShadow: T.shadow }}>
          <div style={{ color: T.text, fontWeight: 700, fontSize: 15, fontFamily: "'Poppins',sans-serif", marginBottom: 20 }}>Department Performance</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(6,1fr)", gap: 14 }}>
            {DEPTS.map((d, i) => {
              const rate = Math.round((d.resolved / d.complaints) * 100);
              const circ = 2 * Math.PI * 20, fill = circ * (rate / 100);
              return (
                <div key={i} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: isMobile ? "14px 10px" : "18px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 8 }}>{d.icon}</div>
                  <div style={{ color: T.text, fontSize: 12, fontWeight: 800, marginBottom: 12, fontFamily: "'Poppins',sans-serif" }}>{d.name}</div>
                  <svg width="50" height="50" viewBox="0 0 50 50" style={{ marginBottom: 6 }}>
                    <circle cx="25" cy="25" r="20" fill="none" stroke={T.borderLight} strokeWidth="4" />
                    <circle cx="25" cy="25" r="20" fill="none" stroke={T.primary} strokeWidth="4"
                      strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round" transform="rotate(-90 25 25)" />
                    <text x="25" y="29" textAnchor="middle" fill={T.primary} fontSize="10" fontWeight="800" fontFamily="sans-serif">{rate}%</text>
                  </svg>
                  <div style={{ color: T.sub, fontSize: 11, fontWeight: 600 }}>{d.complaints} Total</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DBDashboard;
