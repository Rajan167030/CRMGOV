/* ═══════════════════════════════════════════════════════════════
   NAVIGATION ITEMS — Admin vs User
═══════════════════════════════════════════════════════════════ */
export const ADMIN_NAV = [
  { id: "dashboard",    icon: "📊", label: "Dashboard" },
  { id: "complaints",   icon: "📋", label: "All Complaints" },
  { id: "departments",  icon: "🏛️", label: "Departments" },
  { id: "analytics",    icon: "📈", label: "Analytics" },
  { id: "escalations",  icon: "🚨", label: "Escalations" },
  { id: "officers",     icon: "👮", label: "Officers" },
  { id: "settings",     icon: "⚙️", label: "Settings" },
];

export const USER_NAV = [
  { id: "dashboard",    icon: "🏠", label: "Home" },
  { id: "file",         icon: "✏️", label: "File Complaint" },
  { id: "track",        icon: "🔍", label: "Track Complaint" },
  { id: "my-complaints",icon: "📂", label: "My Complaints" },
  { id: "departments",  icon: "🏛️", label: "Departments" },
  { id: "profile",      icon: "👤", label: "My Profile" },
];
