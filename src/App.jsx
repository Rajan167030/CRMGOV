import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import DBDashboard from "./pages/DBDashboard";
import DBComplaints from "./pages/DBComplaints";
import DBFile from "./pages/DBFile";
import DBTrack from "./pages/DBTrack";
import DBDepts from "./pages/DBDepts";
import DBAnalytics from "./pages/DBAnalytics";
import DBEscalations from "./pages/DBEscalations";
import DBProfile from "./pages/DBProfile";
import DBMyComplaints from "./pages/DBMyComplaints";

/* ═══════════════════════════════════════════════════════════════
   PROTECTED ROUTE — redirects to /login if not authenticated
═══════════════════════════════════════════════════════════════ */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN-ONLY ROUTE — redirects regular users to dashboard
═══════════════════════════════════════════════════════════════ */
function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP — ROUTING
═══════════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={<DBDashboard />} />
            <Route path="complaints" element={<DBComplaints />} />
            <Route path="file" element={<DBFile />} />
            <Route path="track" element={<DBTrack />} />
            <Route path="my-complaints" element={<DBMyComplaints />} />
            <Route path="departments" element={<DBDepts />} />
            <Route path="analytics" element={
              <AdminRoute><DBAnalytics /></AdminRoute>
            } />
            <Route path="escalations" element={
              <AdminRoute><DBEscalations /></AdminRoute>
            } />
            <Route path="profile" element={<DBProfile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
