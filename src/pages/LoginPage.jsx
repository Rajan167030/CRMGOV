import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import T from "../constants/tokens";
import useIsMobile from "../hooks/useIsMobile";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!selectedRole) return;
    setLoading(true);
    // TODO: Replace with actual auth API provider (Firebase/Auth0/Custom JWT)
    // e.g. await axios.post('/api/auth', { email, password })
    // If successful, push user object into context and redirect
    setTimeout(() => {
      login(selectedRole);
      navigate("/dashboard");
    }, 600);
  };

  const roles = [
    {
      id: "admin",
      title: "Government Officer",
      subtitle: "Admin / Department Head",
      desc: "Access all complaints, analytics, escalations, department management, and system settings.",
      icon: "🏛️",
      features: ["View all complaints", "Manage departments", "Analytics & reports", "Escalation handling", "System settings"],
      color: T.primary,
      bg: T.primaryBg,
    },
    {
      id: "user",
      title: "Citizen",
      subtitle: "Public User",
      desc: "File new complaints, track existing ones, view department info, and manage your profile.",
      icon: "👤",
      features: ["File new complaint", "Track complaint status", "View departments", "My complaints history", "Profile management"],
      color: T.accent,
      bg: T.accentLight,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.gradientRed, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>🏛️</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'Poppins',sans-serif", color: T.text }}>PS-CRM</div>
          <div style={{ fontSize: 10, color: T.sub, letterSpacing: 2, textTransform: "uppercase" }}>Public Service Platform</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "24px 16px" : "40px" }}>
        <div style={{ maxWidth: 780, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-block", background: T.primaryBg, color: T.primary, padding: "6px 18px", borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
              Select Your Role
            </div>
            <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: T.text, margin: "0 0 8px" }}>
              Welcome to PS-CRM
            </h1>
            <p style={{ color: T.sub, fontSize: 15, maxWidth: 460, margin: "0 auto" }}>
              Choose how you'd like to access the platform
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 28 }}>
            {roles.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                style={{
                  background: T.white,
                  border: `2px solid ${selectedRole === r.id ? r.color : T.border}`,
                  borderRadius: 16,
                  padding: isMobile ? "22px" : "28px",
                  cursor: "pointer",
                  transition: "all .25s",
                  boxShadow: selectedRole === r.id ? `0 8px 28px ${r.color}20` : T.shadow,
                  transform: selectedRole === r.id ? "translateY(-2px)" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {selectedRole === r.id && (
                  <div style={{ position: "absolute", top: 14, right: 14, width: 24, height: 24, borderRadius: "50%", background: r.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>✓</div>
                )}
                <div style={{ fontSize: 40, marginBottom: 14 }}>{r.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: "0 0 2px" }}>{r.title}</h3>
                <div style={{ fontSize: 12, fontWeight: 600, color: r.color, marginBottom: 10 }}>{r.subtitle}</div>
                <p style={{ color: T.sub, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>{r.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {r.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.textSecondary }}>
                      <span style={{ color: r.color, fontSize: 10 }}>●</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleLogin}
              disabled={!selectedRole || loading}
              style={{
                background: selectedRole ? T.gradientRed : T.border,
                color: selectedRole ? "#fff" : T.muted,
                border: "none",
                borderRadius: 12,
                padding: "14px 48px",
                fontSize: 15,
                fontWeight: 700,
                cursor: selectedRole ? "pointer" : "not-allowed",
                transition: "all .2s",
                boxShadow: selectedRole ? `0 6px 20px ${T.primary}33` : "none",
                minWidth: isMobile ? "100%" : 220,
              }}
            >
              {loading ? "Signing in…" : "Continue →"}
            </button>
            <div style={{ marginTop: 16, fontSize: 12, color: T.muted }}>
              This is a demo. In production, this would use proper authentication.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
