import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import T from "../constants/tokens";
import useIsMobile from "../hooks/useIsMobile";

/* ═══════════════════════════════════════════════════════════════
   LOGIN PAGE — Role Selection (Admin / Citizen)
═══════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signin");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    if (!selectedRole) return;
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        await login({
          email: form.email,
          password: form.password,
          role: selectedRole,
        });
      } else {
        if (!form.name.trim()) {
          throw new Error("Name is required");
        }

        if (selectedRole !== "user") {
          throw new Error("Self-registration is available only for citizen accounts");
        }

        await register({
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          role: selectedRole,
        });
      }

      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
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
              {mode === "signin" ? "Secure Sign In" : "Create Account"}
            </div>
            <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: T.text, margin: "0 0 8px" }}>
              Welcome to PS-CRM
            </h1>
            <p style={{ color: T.sub, fontSize: 15, maxWidth: 460, margin: "0 auto" }}>
              Choose your portal and authenticate with your real account
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ display: "inline-flex", background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 4, boxShadow: T.shadow }}>
              {[
                ["signin", "Sign In"],
                ["signup", "Register"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setMode(value);
                    setError("");
                  }}
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 16px",
                    background: mode === value ? T.primaryBg : "transparent",
                    color: mode === value ? T.primary : T.textSecondary,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
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

          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "22px" : "26px", boxShadow: T.shadow, marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : mode === "signup" ? "1fr 1fr" : "1fr", gap: 16 }}>
              {mode === "signup" && (
                <>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Full name"
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`, outline: "none", fontSize: 14 }}
                  />
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Phone number"
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`, outline: "none", fontSize: 14 }}
                  />
                </>
              )}
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email address"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`, outline: "none", fontSize: 14 }}
              />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`, outline: "none", fontSize: 14 }}
              />
            </div>
            {error && <div style={{ color: T.red, fontSize: 13, fontWeight: 600, marginTop: 12 }}>{error}</div>}
            {mode === "signin" && (
              <div style={{ color: T.sub, fontSize: 12, marginTop: 12 }}>
                Seeded accounts: admin `admin@pscrm.gov.in` / `Admin@123`, user `rajesh.kumar@gmail.com` / `User@123`
              </div>
            )}
            {mode === "signup" && (
              <div style={{ color: T.sub, fontSize: 12, marginTop: 12 }}>
                New registrations create citizen accounts only. Admin accounts are seeded from the backend.
              </div>
            )}
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
              {loading ? "Please wait…" : mode === "signin" ? "Sign In →" : "Create Account →"}
            </button>
            <div style={{ marginTop: 16, fontSize: 12, color: T.muted }}>
              Admin portal access requires an admin account. Citizen pages require a signed-in user account.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
