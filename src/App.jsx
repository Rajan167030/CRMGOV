import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

/* ═══════════════════════════════════════════════════════════════
   ROOT APP — ROUTING
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState("landing");

  const goToDashboard = () => setView("dashboard");
  const goToLanding   = () => setView("landing");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {view === "landing"
        ? <LandingPage onEnter={goToDashboard} />
        : <Dashboard   onBackToLanding={goToLanding} />
      }
    </>
  );
}
