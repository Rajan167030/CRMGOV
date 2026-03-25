import T from "../constants/tokens";

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR — Role-aware with Admin/User navigation
═══════════════════════════════════════════════════════════════ */
export default function Sidebar({ nav, page, onNavigate, onLogout, isOpen, onClose, isMobile, user, role }) {
  return (
    <>
      {isMobile && <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={onClose} />}
      <aside style={{
        width: isMobile ? 270 : 250,
        minHeight: "100vh",
        background: T.white,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0, top: 0, bottom: 0,
        zIndex: 200,
        transform: isMobile ? (isOpen ? "translateX(0)" : "translateX(-100%)") : "none",
        transition: "transform .3s ease",
        boxShadow: isMobile && isOpen ? T.shadowLg : "none",
      }}>
        {/* Logo */}
        <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.gradientRed, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>🏛️</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.text, fontWeight: 800, fontSize: 15, fontFamily: "'Poppins',sans-serif" }}>PS-CRM</div>
              <div style={{ color: T.sub, fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>
                {role === "admin" ? "Admin Panel" : "Citizen Portal"}
              </div>
            </div>
            {isMobile && (
              <button onClick={onClose} style={{ background: "none", border: "none", color: T.sub, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
            )}
          </div>
          {/* Role badge */}
          <div style={{ background: role === "admin" ? T.primaryBg : T.accentLight, color: role === "admin" ? T.primary : T.accent, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, textAlign: "center", border: `1px solid ${role === "admin" ? T.primary : T.accent}22` }}>
            {role === "admin" ? "👮 Government Officer" : "👤 Citizen User"}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "8px 12px 6px", marginBottom: 4 }}>
            {role === "admin" ? "Administration" : "Services"}
          </div>
          {nav.map(n => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => onNavigate(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                background: active ? T.primaryBg : "transparent",
                color: active ? T.primary : T.textSecondary, fontSize: 13, fontWeight: active ? 700 : 500,
                marginBottom: 2, textAlign: "left",
                borderLeft: active ? `3px solid ${T.primary}` : "3px solid transparent",
                transition: "all .15s",
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.surf; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; } }}>
                <span style={{ width: 20, textAlign: "center", fontSize: 16 }}>{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* User card in sidebar */}
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: role === "admin" ? T.gradientRed : T.gradientBlue, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12 }}>
                {user?.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: T.text, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
                <div style={{ color: T.sub, fontSize: 11 }}>{user?.designation}</div>
              </div>
            </div>
            <button onClick={onLogout} style={{
              width: "100%", padding: "8px", background: "transparent",
              border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.sub, fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = T.redBg; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red + "44"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.sub; e.currentTarget.style.borderColor = T.border; }}>
              ← Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
