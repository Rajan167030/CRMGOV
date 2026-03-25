import { useAuth } from "../context/AuthContext";
import T from "../constants/tokens";
import useIsMobile from "../hooks/useIsMobile";

function DBProfile() {
  const isMobile = useIsMobile(768);
  const { user, role, logout } = useAuth();
  const p = isMobile ? "16px" : "28px 34px";

  if (!user) return null;

  return (
    <div style={{ padding: p, maxWidth: 840, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>My Profile</h1>
        <p style={{ color: T.sub, fontSize: 15, margin: 0 }}>Manage your account settings and preferences</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "320px 1fr", gap: 24, marginBottom: 24 }}>
        
        {/* Left Col - Card */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: "32px 24px", textAlign: "center", boxShadow: T.shadow, height: "fit-content" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: role === "admin" ? T.gradientRed : T.gradientBlue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, margin: "0 auto 16px", boxShadow: `0 8px 24px ${role === "admin" ? T.primary : T.accent}33` }}>
            {user.avatar}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: "0 0 4px", fontFamily: "'Poppins',sans-serif" }}>{user.name}</h2>
          <div style={{ display: "inline-block", background: role === "admin" ? T.primaryBg : T.accentLight, color: role === "admin" ? T.primary : T.accent, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 800, border: `1px solid ${role === "admin" ? T.primary : T.accent}22`, marginBottom: 16 }}>
            {user.designation}
          </div>
          <p style={{ color: T.textSecondary, fontSize: 14, margin: "0 0 24px" }}>{user.role === "admin" ? "System Administrator with full access to civic dashboard and reports." : "Registered citizen user."}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button style={{ background: T.bg, border: `1px solid ${T.borderLight}`, color: T.text, borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.border} onMouseLeave={e => e.currentTarget.style.borderColor = T.borderLight}>
              Edit Profile
            </button>
            <button onClick={logout} style={{ background: T.white, border: `1px solid ${T.red}`, color: T.red, borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = T.redBg; }} onMouseLeave={e => { e.currentTarget.style.background = T.white; }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Col - Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: isMobile ? "24px 20px" : "32px", boxShadow: T.shadow }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: "0 0 24px", fontFamily: "'Poppins',sans-serif" }}>Personal Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
              {[
                { l: "Full Name", v: user.name },
                { l: "Email Address", v: user.email },
                { l: "Phone Number", v: user.phone },
                { l: "Platform Role", v: role === "admin" ? "Administrative Officer" : "Citizen" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 4 : 24, paddingBottom: 16, borderBottom: i < 3 ? `1px solid ${T.borderLight}` : "none" }}>
                  <div style={{ width: 140, color: T.sub, fontSize: 13, fontWeight: 700 }}>{f.l}</div>
                  <div style={{ flex: 1, color: T.text, fontSize: 15, fontWeight: 600 }}>{f.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: isMobile ? "24px 20px" : "32px", boxShadow: T.shadow }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: "0 0 24px", fontFamily: "'Poppins',sans-serif" }}>Preferences</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { title: "Email Notifications", desc: "Receive daily summary reports and critical alerts", toggle: true },
                { title: "SMS Updates", desc: "Get text messages for important status changes", toggle: true },
                { title: "Language", desc: "Preferred interface language", toggle: false, val: "English (US)" },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: i < 2 ? `1px solid ${T.borderLight}` : "none" }}>
                  <div>
                    <div style={{ color: T.text, fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{p.title}</div>
                    <div style={{ color: T.textSecondary, fontSize: 13 }}>{p.desc}</div>
                  </div>
                  {p.toggle ? (
                    <div style={{ width: 36, height: 20, background: T.green, borderRadius: 10, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                      <div style={{ width: 16, height: 16, background: T.white, borderRadius: "50%", position: "absolute", top: 2, right: 2, boxShadow: T.shadow }} />
                    </div>
                  ) : (
                    <div style={{ color: T.text, fontSize: 13, fontWeight: 700, background: T.bg, padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}` }}>
                      {p.val}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DBProfile;
