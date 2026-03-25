import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import T from "../constants/tokens";
import { DEPTS } from "../data/mockData";
import Counter from "../components/Counter";
import Reveal from "../components/Reveal";
import useIsMobile from "../hooks/useIsMobile";

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE — Clean Government-style (Delhi Metro inspired)
═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const isMobile = useIsMobile(768);
  const isTablet = useIsMobile(1024);
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const quickLinks = [
    { icon: "✏️", label: "File Complaint", desc: "Submit a new civic complaint", color: T.primary },
    { icon: "🔍", label: "Track Status", desc: "Check your complaint progress", color: T.accent },
    { icon: "🏛️", label: "Departments", desc: "View department information", color: T.green },
    { icon: "📞", label: "Helpline", desc: "24×7 support: 1800-XXX-XXXX", color: T.amber },
  ];

  const features = [
    { icon: "⚡", title: "Auto-Routing", desc: "AI classifies and routes complaints to the correct department instantly.", color: T.primary, bg: T.primaryBg },
    { icon: "⏱️", title: "SLA Tracking", desc: "Configurable deadlines per priority with auto-escalation.", color: T.amber, bg: T.amberBg },
    { icon: "📡", title: "Live Updates", desc: "Citizens receive SMS and WhatsApp updates at every status change.", color: T.green, bg: T.greenBg },
    { icon: "🌐", title: "12 Languages", desc: "Hindi, English, Tamil, Telugu, and 8 more with voice IVR.", color: T.accent, bg: T.accentLight },
    { icon: "🗺️", title: "Heatmaps", desc: "Complaint density overlays for proactive governance insights.", color: T.purple, bg: T.purpleBg },
    { icon: "📊", title: "Analytics", desc: "Historical patterns and full KPI dashboards for decision-making.", color: T.cyan, bg: T.cyanBg },
  ];

  const steps = [
    { n: "01", title: "File Complaint", desc: "Submit via web, mobile, WhatsApp, or voice IVR in 12 languages.", icon: "📝", color: T.primary },
    { n: "02", title: "AI Auto-Routes", desc: "NLP classifies complaint, assigns department, priority, and SLA.", icon: "🤖", color: T.accent },
    { n: "03", title: "Officer Assigned", desc: "Department officer notified instantly with complaint details.", icon: "👮", color: T.green },
    { n: "04", title: "Real-Time Updates", desc: "Every status change triggers SMS + WhatsApp to the citizen.", icon: "📲", color: T.amber },
    { n: "05", title: "Resolved & Rated", desc: "Citizen rates satisfaction. Feeds performance dashboards.", icon: "⭐", color: T.purple },
  ];

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text }}>
      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled || mobileNav ? T.white : "rgba(255,255,255,0.95)",
        boxShadow: scrolled ? T.shadow : "none",
        transition: "all .3s", padding: isMobile ? "0 16px" : "0 48px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.gradientRed, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff" }}>🏛️</div>
          <div>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 16, fontFamily: "'Poppins',sans-serif" }}>PS-CRM</div>
            <div style={{ color: T.sub, fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>Public Service Platform</div>
          </div>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {["Services", "How It Works", "Departments", "About"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ color: T.textSecondary, fontSize: 14, fontWeight: 600, transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = T.primary} onMouseLeave={e => e.target.style.color = T.textSecondary}>{l}</a>
            ))}
          </div>
        )}
        {isMobile ? (
          <button onClick={() => setMobileNav(!mobileNav)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 4 }}>
            <span style={{ display: "block", width: 22, height: 2, background: T.textSecondary, borderRadius: 2, transition: "all .3s", transform: mobileNav ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ display: "block", width: 22, height: 2, background: T.textSecondary, borderRadius: 2, transition: "all .3s", opacity: mobileNav ? 0 : 1 }} />
            <span style={{ display: "block", width: 22, height: 2, background: T.textSecondary, borderRadius: 2, transition: "all .3s", transform: mobileNav ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/login" style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", transition: "all .2s" }}>Sign In</Link>
            <Link to="/login" style={{ background: T.gradientRed, border: "none", color: "#fff", borderRadius: 8, padding: "8px 22px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", boxShadow: `0 4px 14px ${T.primary}33` }}>Get Started →</Link>
          </div>
        )}
      </nav>

      {/* ── Mobile Nav Dropdown ── */}
      {isMobile && mobileNav && (
        <div style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 999, background: T.white, borderBottom: `1px solid ${T.border}`, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, boxShadow: T.shadow }}>
          {["Services", "How It Works", "Departments", "About"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMobileNav(false)} style={{ color: T.textSecondary, fontSize: 14, fontWeight: 600, padding: "8px 0" }}>{l}</a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Link to="/login" onClick={() => setMobileNav(false)} style={{ flex: 1, textAlign: "center", background: "transparent", border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600 }}>Sign In</Link>
            <Link to="/login" onClick={() => setMobileNav(false)} style={{ flex: 1, textAlign: "center", background: T.gradientRed, border: "none", color: "#fff", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700 }}>Get Started</Link>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ paddingTop: 64, background: `linear-gradient(180deg, ${T.white}, ${T.bg})` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 20px 36px" : "80px 48px 50px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.primaryBg, border: `1px solid ${T.primary}22`, borderRadius: 100, padding: "6px 18px", marginBottom: isMobile ? 18 : 28, animation: "fadeUp .8s ease both" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block" }} />
            <span style={{ color: T.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Government of India · Digital Initiative</span>
          </div>
          <h1 style={{ fontSize: isMobile ? "28px" : "clamp(36px,5vw,52px)", fontWeight: 900, color: T.text, lineHeight: 1.1, margin: "0 0 16px", animation: "fadeUp .9s .1s ease both" }}>
            Smart Public Service<br />
            <span style={{ color: T.primary }}>Complaint Management</span>
          </h1>
          <p style={{ color: T.sub, fontSize: isMobile ? 14 : 17, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.7, animation: "fadeUp 1s .2s ease both" }}>
            PS-CRM centralizes all citizen grievances across departments — with AI-powered routing, real-time SLA tracking, and multilingual support.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 1s .3s ease both", flexDirection: isMobile ? "column" : "row", padding: isMobile ? "0 10px" : 0 }}>
            <Link to="/login" style={{ background: T.gradientRed, color: "#fff", borderRadius: 12, padding: isMobile ? "14px 24px" : "14px 36px", fontSize: 15, fontWeight: 700, boxShadow: `0 6px 24px ${T.primary}33`, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
              📋 File a Complaint
            </Link>
            <Link to="/login" style={{ background: T.white, color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, padding: isMobile ? "14px 24px" : "14px 36px", fontSize: 15, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: T.shadow }}>
              🔍 Track Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS (like Delhi Metro service buttons) ── */}
      <section style={{ background: T.white, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0 16px" : "0 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 0 }}>
            {quickLinks.map((q, i) => (
              <div key={i} style={{ padding: isMobile ? "20px 14px" : "28px 20px", textAlign: "center", borderRight: i < quickLinks.length - 1 && !isMobile ? `1px solid ${T.border}` : "none", borderBottom: isMobile && i < 2 ? `1px solid ${T.border}` : "none", cursor: "pointer", transition: "all .2s" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{q.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: q.color, marginBottom: 4 }}>{q.label}</div>
                <div style={{ color: T.sub, fontSize: 12 }}>{q.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP (like Delhi Metro stats) ── */}
      <section style={{ background: T.gradientRed, padding: isMobile ? "36px 16px" : "48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 20 : 32 }}>
          {[
            ["12,847+", "Complaints Filed", "📋"],
            ["94%", "Resolution Rate", "✅"],
            ["2.4d", "Avg Resolution", "⏱️"],
            ["6", "Departments", "🏛️"],
          ].map(([v, l, icon]) => (
            <div key={l} style={{ textAlign: "center", color: T.textOnPrimary }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, fontFamily: "'Poppins',sans-serif", lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES / FEATURES ── */}
      <section id="services" style={{ padding: isMobile ? "48px 16px" : "80px 48px", background: T.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
              <div style={{ display: "inline-block", background: T.primaryBg, color: T.primary, padding: "5px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Our Services</div>
              <h2 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 900, color: T.text, margin: "0 0 10px" }}>Platform Capabilities</h2>
              <p style={{ color: T.sub, fontSize: 15, maxWidth: 500, margin: "0 auto" }}>Every feature engineered to close the gap between citizens and their government.</p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 20 }}>
            {features.map((f, i) => (
              <Reveal key={i} delay={i * .06}>
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 24px", height: "100%", transition: "all .25s", cursor: "default", boxShadow: T.shadow }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = T.shadowLg; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = T.shadow; }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>{f.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 8, fontFamily: "'Poppins',sans-serif" }}>{f.title}</div>
                  <div style={{ color: T.sub, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
                  <div style={{ marginTop: 16, color: f.color, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Learn More →</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: T.white, padding: isMobile ? "48px 16px" : "80px 48px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
              <div style={{ display: "inline-block", background: T.greenBg, color: T.green, padding: "5px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>How It Works</div>
              <h2 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 900, color: T.text, margin: 0 }}>From Complaint to Resolution</h2>
            </div>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 700, margin: "0 auto" }}>
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * .08}>
                <div style={{ display: "flex", gap: isMobile ? 14 : 20, padding: isMobile ? "18px 0" : "24px 0", borderBottom: i < steps.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `2px solid ${s.color}33` }}>{s.icon}</div>
                    {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: T.border, marginTop: 8 }} />}
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ color: s.color, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>STEP {s.n}</div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>{s.title}</div>
                    <div style={{ color: T.sub, fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS ── */}
      <section id="departments" style={{ background: T.bg, padding: isMobile ? "48px 16px" : "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
              <div style={{ display: "inline-block", background: T.accentLight, color: T.accent, padding: "5px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Departments</div>
              <h2 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 900, color: T.text, margin: "0 0 10px" }}>6 Departments. One Platform.</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : isTablet ? "repeat(3,1fr)" : "repeat(6,1fr)", gap: 16 }}>
            {DEPTS.map((d, i) => {
              const rate = Math.round((d.resolved / d.complaints) * 100);
              return (
                <Reveal key={i} delay={i * .06}>
                  <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 14px", textAlign: "center", transition: "all .2s", cursor: "default", boxShadow: T.shadow }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = T.shadowLg; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = T.shadow; }}>
                    <div style={{ fontSize: 34, marginBottom: 10 }}>{d.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: T.text, marginBottom: 8, fontFamily: "'Poppins',sans-serif" }}>{d.name}</div>
                    <div style={{ display: "inline-block", background: `${d.color}12`, color: d.color, padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>{rate}%</div>
                    <div style={{ color: T.sub, fontSize: 11, marginTop: 6 }}>{d.complaints} total</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ABOUT / CTA ── */}
      <section id="about" style={{ background: T.white, padding: isMobile ? "48px 16px" : "80px 48px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ background: T.bg, borderRadius: isMobile ? 20 : 24, padding: isMobile ? "36px 20px" : "56px 48px", border: `1px solid ${T.border}` }}>
              <h2 style={{ fontSize: isMobile ? 22 : 36, fontWeight: 900, color: T.text, margin: "0 0 14px" }}>Ready to Transform<br />Civic Governance?</h2>
              <p style={{ color: T.sub, fontSize: 15, maxWidth: 460, margin: "0 auto 32px", lineHeight: 1.7 }}>Join thousands of citizens and officers using PS-CRM for faster, fairer, and fully transparent public service.</p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
                <Link to="/login" style={{ background: T.gradientRed, color: "#fff", borderRadius: 12, padding: "14px 36px", fontSize: 15, fontWeight: 700, boxShadow: `0 6px 20px ${T.primary}33`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>🚀 Get Started</Link>
                <Link to="/login" style={{ background: T.white, color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 36px", fontSize: 15, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: T.shadow }}>📋 File a Complaint</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1A1A2E", padding: isMobile ? "36px 16px 24px" : "48px 48px 32px", color: "#CBD5E0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? 28 : 40, marginBottom: isMobile ? 28 : 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: T.gradientRed, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏛️</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Poppins',sans-serif" }}>PS-CRM</div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 260, color: "#A0AEC0" }}>Smart Public Service CRM — building transparent, scalable civic infrastructure for modern India.</p>
            </div>
            {[["Platform", ["Dashboard", "File Complaint", "Track Complaint", "Analytics"]], ["Departments", ["Water Supply", "Road Works", "Electricity", "Sanitation"]], ["Support", ["Help Center", "API Docs", "Contact Us", "Status Page"]]].map(([h, links]) => (
              <div key={h}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, fontFamily: "'Poppins',sans-serif" }}>{h}</div>
                {links.map(l => (
                  <div key={l} style={{ color: "#A0AEC0", fontSize: 13, marginBottom: 10, cursor: "pointer", transition: "color .15s" }}
                    onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#A0AEC0"}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #2D3748", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ color: "#718096", fontSize: 12 }}>© 2025 PS-CRM · Government of India · All rights reserved</div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ background: "#2E7D3222", color: "#2E7D32", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>System Online</span>
              <span style={{ background: "#2D3748", color: "#A0AEC0", padding: "3px 10px", borderRadius: 100, fontSize: 11 }}>v3.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
