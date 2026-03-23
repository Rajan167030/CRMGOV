import T from "../constants/tokens";
import NAV from "../constants/navItems";

function Sidebar({ page, setPage, onBackToLanding, isOpen, onClose, isMobile }) {
  const handleNav = (id) => {
    setPage(id);
    if (isMobile && onClose) onClose();
  };

  return (
    <>
      {isMobile && <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={onClose} />}
      <aside style={{
        width: isMobile ? 260 : 230,
        minHeight: "100vh",
        background: T.surf,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 200,
        transform: isMobile ? (isOpen ? "translateX(0)" : "translateX(-100%)") : "none",
        transition: "transform .3s ease",
      }}>
        <div style={{ padding: "20px 18px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: `linear-gradient(135deg,${T.cyan},${T.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: `0 0 16px ${T.cyan}44` }}>🏛️</div>
            <div>
              <div style={{ color: T.text, fontWeight: 900, fontSize: 14, fontFamily: "'Syne',sans-serif", letterSpacing: .5 }}>PS-CRM</div>
              <div style={{ color: T.sub, fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>Gov Platform</div>
            </div>
            {isMobile && (
              <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: T.sub, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
            )}
          </div>
          <button onClick={() => { onBackToLanding(); if (isMobile && onClose) onClose(); }} style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, color: T.sub, borderRadius: 8, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.cyan + "44"; e.currentTarget.style.color = T.cyan; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.sub; }}>
            ← Back to Home
          </button>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV.map(n => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => handleNav(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: active ? `linear-gradient(90deg,${T.cyan}18,transparent)` : "transparent",
                color: active ? T.cyan : T.sub, fontSize: 13, fontWeight: active ? 700 : 500,
                marginBottom: 2, textAlign: "left",
                borderLeft: active ? `2px solid ${T.cyan}` : "2px solid transparent",
                transition: "all .15s",
              }}>
                <span style={{ width: 18, textAlign: "center", fontSize: 15, opacity: active ? 1 : .6 }}>{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "0 14px 18px" }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#A78BFA,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>AC</div>
            <div>
              <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>Admin Central</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.green, display: "inline-block" }} />
                <span style={{ color: T.green, fontSize: 10, fontWeight: 600 }}>Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
