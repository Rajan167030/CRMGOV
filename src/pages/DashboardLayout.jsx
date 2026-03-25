import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import T from "../constants/tokens";
import { ADMIN_NAV, USER_NAV } from "../constants/navItems";
import { useAuth } from "../context/AuthContext";
import useIsMobile from "../hooks/useIsMobile";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  const { user, role, switchRole, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();

  const nav = isAdmin ? ADMIN_NAV : USER_NAV;
  const currentPage = location.pathname.split("/dashboard/")[1] || "dashboard";

  const titles = {
    dashboard: isAdmin ? "Admin Dashboard" : "Welcome Home",
    complaints: "All Complaints",
    file: "File a Complaint",
    track: "Track Complaint",
    "my-complaints": "My Complaints",
    departments: "Departments",
    analytics: "Analytics & Reports",
    escalations: "Escalations",
    officers: "Officers",
    settings: "Settings",
    profile: "My Profile",
  };

  const handleNav = (id) => {
    if (id === "dashboard") navigate("/dashboard");
    else navigate(`/dashboard/${id}`);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, minHeight: "100vh", color: T.text }}>
      <Sidebar
        nav={nav}
        page={currentPage}
        onNavigate={handleNav}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
        user={user}
        role={role}
      />
      <div style={{ marginLeft: isMobile ? 0 : 250, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: isMobile ? "10px 16px" : "12px 30px",
          borderBottom: `1px solid ${T.border}`, background: T.white,
          position: "sticky", top: 0, zIndex: 100, gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>
              <span /><span /><span />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ color: T.text, fontSize: isMobile ? 16 : 20, fontWeight: 800, margin: 0, fontFamily: "'Poppins',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {titles[currentPage] || "Dashboard"}
              </h1>
              {!isMobile && <p style={{ color: T.sub, margin: "2px 0 0", fontSize: 12 }}>PS-CRM · Smart Public Service Platform</p>}
            </div>
          </div>
          <div style={{ display: "flex", gap: isMobile ? 6 : 12, alignItems: "center", flexShrink: 0 }}>
            {/* Role Switch */}
            <div className="role-switch">
              <button className={role === "admin" ? "active" : ""} onClick={() => { if (role !== "admin") { switchRole(); navigate("/dashboard"); } }}>
                👮 {isMobile ? "" : "Admin"}
              </button>
              <button className={role === "user" ? "active" : ""} onClick={() => { if (role !== "user") { switchRole(); navigate("/dashboard"); } }}>
                👤 {isMobile ? "" : "User"}
              </button>
            </div>
            {/* Notification */}
            <div style={{ width: 36, height: 36, borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", fontSize: 15 }}>
              🔔<span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: T.red, border: `2px solid ${T.white}` }} />
            </div>
            {/* User avatar */}
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => handleNav("profile")}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: isAdmin ? T.gradientRed : T.gradientBlue, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12 }}>{user?.avatar}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{user?.name}</div>
                  <div style={{ fontSize: 10, color: T.sub }}>{user?.designation}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
