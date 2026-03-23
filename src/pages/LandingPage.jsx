import { useState, useEffect } from "react";
import T from "../constants/tokens";
import { DEPTS } from "../data/mockData";
import Reveal from "../components/Reveal";
import Counter from "../components/Counter";
import useIsMobile from "../hooks/useIsMobile";

function LandingPage({ onEnter }) {
  const isMobile = useIsMobile(768);
  const isTablet = useIsMobile(1024);

  /* typewriter */
  const words = ["Grievances.", "Complaints.", "Requests.", "Feedback."];
  const [typed, setTyped] = useState(""); const [wi, setWi] = useState(0);
  useEffect(() => {
    let i = 0, del = false;
    const iv = setInterval(() => {
      const w = words[wi % words.length];
      if (!del) { setTyped(w.slice(0, i + 1)); i++; if (i === w.length) del = true; }
      else { setTyped(w.slice(0, i - 1)); i--; if (i === 0) { del = false; setWi(x => x + 1); } }
    }, del ? 80 : 120);
    return () => clearInterval(iv);
  }, [wi]);

  /* sticky nav */
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => {
    try {
      const h = () => { try { setScrolled(window.scrollY > 40); } catch (e) { } };
      window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
    } catch (e) { }
  }, []);

  const btn = (label, primary, onClick) => (
    <button onClick={onClick} style={{
      background: primary ? `linear-gradient(135deg,${T.cyan},${T.blue})` : "transparent",
      border: primary ? "none" : `1px solid ${T.border}`,
      color: primary ? "#fff" : T.text, borderRadius: 12, padding: isMobile ? "12px 24px" : "15px 36px",
      fontSize: isMobile ? 13 : 15, fontWeight: 800, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
      boxShadow: primary ? `0 8px 32px ${T.cyan}44` : "none",
      transition: "all .2s", width: isMobile ? "100%" : "auto",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; if (primary) e.currentTarget.style.boxShadow = `0 16px 48px ${T.cyan}66`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; if (primary) e.currentTarget.style.boxShadow = `0 8px 32px ${T.cyan}44`; }}>
      {label}
    </button>
  );

  const sectionTag = (label, col) => (
    <div style={{ display: "inline-block", background: col + "12", border: `1px solid ${col}33`, borderRadius: 100, padding: "5px 18px", color: col, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>{label}</div>
  );

  const features = [
    { icon: "⚡", title: "Auto-Routing Engine", desc: "AI classifies and routes every complaint to the exact department and officer within seconds.", col: T.cyan },
    { icon: "⏱️", title: "SLA Enforcement", desc: "Configurable deadlines per priority. Auto-escalation fires the moment a breach is detected.", col: T.amber },
    { icon: "📡", title: "Real-Time Tracking", desc: "Citizens get live SMS and WhatsApp updates at every status change. Full transparency.", col: T.green },
    { icon: "🌐", title: "12 Language Support", desc: "Hindi, English, Tamil, Telugu, Kannada, Bengali and more. Voice IVR for all citizens.", col: T.purple },
    { icon: "🗺️", title: "Geographic Heatmaps", desc: "Complaint density overlays show where problems cluster — enabling proactive governance.", col: T.blue },
    { icon: "📊", title: "Predictive Analytics", desc: "Historical patterns surface before issues become crises. Full KPI dashboards.", col: T.red },
    { icon: "🔐", title: "Role-Based Security", desc: "Granular RBAC for Citizens, Officers, Supervisors and Admins. All actions audit-logged.", col: T.cyan },
    { icon: "📱", title: "Omni-Channel Intake", desc: "Web portal, mobile app, WhatsApp, and voice IVR — citizens reach PS-CRM from anywhere.", col: T.green },
  ];

  const steps = [
    { n: "01", title: "Citizen Files Complaint", desc: "Via web, mobile app, WhatsApp, or voice IVR. In any of 12 languages.", icon: "📝", col: T.cyan },
    { n: "02", title: "AI Auto-Routes", desc: "NLP classifies the complaint, matches to the correct department, assigns priority and SLA.", icon: "🤖", col: T.purple },
    { n: "03", title: "Officer Assigned", desc: "Department officer is notified instantly. Complaint appears on their dashboard.", icon: "👮", col: T.blue },
    { n: "04", title: "Real-Time Updates", desc: "Every status change triggers SMS + WhatsApp to the citizen. Full transparency.", icon: "📲", col: T.green },
    { n: "05", title: "SLA Monitored", desc: "Engine tracks deadlines continuously. Breach triggers auto-escalation to supervisor.", icon: "⏱️", col: T.amber },
    { n: "06", title: "Resolved & Rated", desc: "Citizen rates the resolution. Feedback feeds performance dashboards and officer KPIs.", icon: "⭐", col: T.red },
  ];

  const px = isMobile ? "20px" : "60px";

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: T.bg, color: T.text, overflowX: "hidden" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled || mobileNav ? T.surf + "EE" : "transparent",
        backdropFilter: scrolled || mobileNav ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
        transition: "all .4s", padding: isMobile ? "0 20px" : "0 60px", height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${T.cyan},${T.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 0 20px ${T.cyan}55` }}>🏛️</div>
          <div>
            <div style={{ color: T.text, fontWeight: 900, fontSize: 16, fontFamily: "'Syne',sans-serif", letterSpacing: 1 }}>PS-CRM</div>
            <div style={{ color: T.sub, fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>Gov Platform</div>
          </div>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {["Features", "How It Works", "Departments", "Stats"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ color: T.sub, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = T.cyan} onMouseLeave={e => e.target.style.color = T.sub}>{l}</a>
            ))}
          </div>
        )}
        {isMobile ? (
          <button onClick={() => setMobileNav(!mobileNav)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 4 }}>
            <span style={{ display: "block", width: 22, height: 2, background: T.sub, borderRadius: 2, transition: "all .3s", transform: mobileNav ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ display: "block", width: 22, height: 2, background: T.sub, borderRadius: 2, transition: "all .3s", opacity: mobileNav ? 0 : 1 }} />
            <span style={{ display: "block", width: 22, height: 2, background: T.sub, borderRadius: 2, transition: "all .3s", transform: mobileNav ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.sub, borderRadius: 9, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Sign In</button>
            <button onClick={onEnter} style={{
              background: `linear-gradient(135deg,${T.cyan},${T.blue})`, border: "none", color: "#fff",
              borderRadius: 9, padding: "8px 22px", fontSize: 13, cursor: "pointer", fontWeight: 700,
              boxShadow: `0 4px 18px ${T.cyan}44`, transition: "all .2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${T.cyan}66`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 18px ${T.cyan}44`; }}>
              Open Dashboard →
            </button>
          </div>
        )}
      </nav>

      {/* ── MOBILE NAV DROPDOWN ── */}
      {isMobile && mobileNav && (
        <div style={{ position: "fixed", top: 68, left: 0, right: 0, zIndex: 999, background: T.surf + "F5", backdropFilter: "blur(16px)", borderBottom: `1px solid ${T.border}`, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {["Features", "How It Works", "Departments", "Stats"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMobileNav(false)} style={{ color: T.sub, fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "8px 0" }}>{l}</a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button style={{ flex: 1, background: "transparent", border: `1px solid ${T.border}`, color: T.sub, borderRadius: 9, padding: "10px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Sign In</button>
            <button onClick={() => { onEnter(); setMobileNav(false); }} style={{ flex: 1, background: `linear-gradient(135deg,${T.cyan},${T.blue})`, border: "none", color: "#fff", borderRadius: 9, padding: "10px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Dashboard →</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: T.bg }}>
        <div style={{ position: "relative", textAlign: "center", maxWidth: 860, padding: isMobile ? "0 20px" : "0 24px", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.cyan + "12", border: `1px solid ${T.cyan}33`, borderRadius: 100, padding: "6px 18px", marginBottom: isMobile ? 20 : 32, animation: "fadeUp .8s ease both" }}>
            <span style={{ color: T.cyan, fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Government Infrastructure · India 2025</span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? "28px" : "45px", fontWeight: 900, color: T.text, lineHeight: 1.05, margin: "0 0 14px", animation: "fadeUp .9s .1s ease both", letterSpacing: -2 }}>
            One Platform.<br />
            <span style={{ background: `linear-gradient(90deg,${T.cyan},${T.blue},${T.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: isMobile ? "26px" : "40px" }}>Every Civic&nbsp;</span>
            <span style={{ color: T.text }}>{typed}</span>
            <span style={{ color: T.cyan, animation: "blink 1s infinite" }}>|</span>
          </h1>
          <p style={{ color: T.sub, fontSize: isMobile ? 14 : "clamp(15px,2vw,18px)", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7, animation: "fadeUp 1s .2s ease both" }}>
            PS-CRM centralizes all citizen grievances across departments — with AI-powered routing, real-time SLA tracking, multilingual support, and a live command center.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 1s .3s ease both", flexDirection: isMobile ? "column" : "row", padding: isMobile ? "0 20px" : 0 }}>
            {btn("🚀 Launch Dashboard", true, onEnter)}
            {btn("📋 File a Complaint", false, onEnter)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 16 : 40, justifyContent: "center", marginTop: isMobile ? 40 : 60, animation: "fadeUp 1s .4s ease both" }}>
            {[["12,847+", "Complaints Filed"], ["94%", "Resolution Rate"], ["2.4d", "Avg Resolution Time"], ["6", "Departments"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ color: T.cyan, fontSize: isMobile ? 20 : 24, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{v}</div>
                <div style={{ color: T.sub, fontSize: 11, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {!isMobile && (
          <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "bounce 2s infinite" }}>
            <span style={{ color: T.sub, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Scroll</span>
            <div style={{ width: 1, height: 40, background: `linear-gradient(${T.cyan},transparent)` }} />
          </div>
        )}
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: T.cyan + "0D", borderTop: `1px solid ${T.cyan}22`, borderBottom: `1px solid ${T.cyan}22`, padding: "10px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 80, whiteSpace: "nowrap", animation: "ticker 35s linear infinite" }}>
          {[...Array(2)].flatMap(() => ["💧 Water Supply · Delhi — Resolved in 1.8d", "⚡ Electricity · Hyderabad — Escalated → Supervisor assigned", "🛣️ Road Works · Bangalore — Pothole repair completed", "🗑️ Sanitation · Mumbai — Garbage pickup scheduled", "🚌 Transport · Chandigarh — Route restored", "🏥 Public Health · Hyderabad — Mosquito fogging done"]).map((t, i) => (
            <span key={i} style={{ color: T.sub, fontSize: 12 }}><span style={{ color: T.cyan, marginRight: 6 }}>▸</span>{t}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: T.bg, padding: isMobile ? "60px 20px" : "100px 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 60 }}>
              {sectionTag("Platform Capabilities", T.cyan)}
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? "24px" : "clamp(30px,4vw,50px)", fontWeight: 900, color: T.text, margin: "0 0 14px", letterSpacing: -1 }}>Built for Scale. Designed for People.</h2>
              <p style={{ color: T.sub, fontSize: isMobile ? 13 : 15, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Every feature engineered to close the gap between citizens and their government.</p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 16 }}>
            {features.map((f, i) => (
              <Reveal key={i} delay={i * .06}>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "26px 22px", height: "100%", cursor: "default", transition: "all .25s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = f.col + "66"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${f.col}1A`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: f.col + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                  <div style={{ color: T.text, fontWeight: 800, fontSize: 14, marginBottom: 8, fontFamily: "'Syne',sans-serif" }}>{f.title}</div>
                  <div style={{ color: T.sub, fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: T.surf, padding: isMobile ? "60px 20px" : "100px 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 60 }}>
              {sectionTag("Workflow", T.green)}
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? "24px" : "clamp(30px,4vw,50px)", fontWeight: 900, color: T.text, margin: 0, letterSpacing: -1 }}>From Complaint to Resolution</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 20 }}>
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * .08}>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "22px" : "28px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -16, right: -10, fontSize: 76, fontWeight: 900, color: s.col + "0C", fontFamily: "'Syne',sans-serif", lineHeight: 1, userSelect: "none" }}>{s.n}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: s.col + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
                    <span style={{ color: s.col, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>STEP {s.n}</span>
                  </div>
                  <div style={{ color: T.text, fontWeight: 800, fontSize: 15, marginBottom: 8, fontFamily: "'Syne',sans-serif" }}>{s.title}</div>
                  <div style={{ color: T.sub, fontSize: 13, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS ── */}
      <section id="departments" style={{ background: T.bg, padding: isMobile ? "60px 20px" : "100px 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 60 }}>
              {sectionTag("Coverage", T.purple)}
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? "24px" : "clamp(30px,4vw,50px)", fontWeight: 900, color: T.text, margin: 0, letterSpacing: -1 }}>6 Departments. One Platform.</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : isTablet ? "repeat(3,1fr)" : "repeat(6,1fr)", gap: 14 }}>
            {DEPTS.map((d, i) => {
              const rate = Math.round((d.resolved / d.complaints) * 100);
              const circ = 2 * Math.PI * 22, fill = circ * (rate / 100);
              return (
                <Reveal key={i} delay={i * .07}>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 14px", textAlign: "center", transition: "all .25s", cursor: "default" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = d.color + "66"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 20px 50px ${d.color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ fontSize: 34, marginBottom: 10 }}>{d.icon}</div>
                    <div style={{ color: T.text, fontSize: 12, fontWeight: 800, marginBottom: 14, fontFamily: "'Syne',sans-serif" }}>{d.name}</div>
                    <svg width="58" height="58" viewBox="0 0 58 58" style={{ marginBottom: 8 }}>
                      <circle cx="29" cy="29" r="22" fill="none" stroke={T.border} strokeWidth="5" />
                      <circle cx="29" cy="29" r="22" fill="none" stroke={d.color} strokeWidth="5"
                        strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round" transform="rotate(-90 29 29)" />
                      <text x="29" y="34" textAnchor="middle" fill={d.color} fontSize="11" fontWeight="800" fontFamily="monospace">{rate}%</text>
                    </svg>
                    <div style={{ color: T.sub, fontSize: 10 }}>{d.complaints} complaints</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ background: `linear-gradient(135deg,${T.surf},${T.card})`, padding: isMobile ? "60px 20px" : "100px 60px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 60 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? "24px" : "clamp(30px,4vw,50px)", fontWeight: 900, color: T.text, margin: 0, letterSpacing: -1 }}>
                Numbers That <span style={{ background: `linear-gradient(90deg,${T.cyan},${T.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Matter.</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 20 }}>
            {[[12847, "+", "Total Complaints Filed", "Across all channels", T.cyan], [94, "%", "Resolution Rate", "This quarter", T.green], [6, "", "Active Departments", "More coming soon", T.purple], [12, "", "Languages Supported", "Including voice IVR", T.amber], [47, "k", "Citizens Served", "Unique users", T.blue], [284, "", "Resolved Today", "Live count", T.red]].map(([to, suf, label, sub, col], i) => (
              <Reveal key={i} delay={i * .08}>
                <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "24px 20px" : "36px 28px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", bottom: -20, right: -10, width: 80, height: 80, borderRadius: "50%", background: col + "0A" }} />
                  <div style={{ fontSize: isMobile ? "32px" : "clamp(38px,4vw,52px)", fontWeight: 900, color: col, fontFamily: "'Syne',sans-serif", letterSpacing: -2, lineHeight: 1 }}>
                    <Counter to={to} suffix={suf} />
                  </div>
                  <div style={{ color: T.text, fontSize: isMobile ? 14 : 16, fontWeight: 700, marginTop: 10, fontFamily: "'Syne',sans-serif" }}>{label}</div>
                  <div style={{ color: T.sub, fontSize: 12, marginTop: 5 }}>{sub}</div>
                  <div style={{ height: 2, background: T.border, borderRadius: 2, marginTop: 18 }}>
                    <div style={{ height: "100%", width: "60%", background: col, borderRadius: 2 }} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: T.bg, padding: isMobile ? "60px 20px" : "100px 60px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ background: `linear-gradient(135deg,${T.card},${T.surf})`, border: `1px solid ${T.border}`, borderRadius: isMobile ? 20 : 28, padding: isMobile ? "40px 20px" : "64px 48px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 400, height: 200, borderRadius: "50%", background: `radial-gradient(circle,${T.cyan}18,transparent)`, pointerEvents: "none" }} />
              {sectionTag("Get Started", T.cyan)}
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? "22px" : "clamp(28px,4vw,50px)", fontWeight: 900, color: T.text, margin: "0 0 16px", letterSpacing: -1 }}>Ready to Transform<br />Civic Governance?</h2>
              <p style={{ color: T.sub, fontSize: isMobile ? 13 : 15, maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.7 }}>Join thousands of citizens and officers using PS-CRM to make public service faster, fairer, and fully transparent.</p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
                {btn("🚀 Open Dashboard", true, onEnter)}
                {btn("📋 File a Complaint", false, onEnter)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: T.surf, borderTop: `1px solid ${T.border}`, padding: isMobile ? "36px 20px 24px" : "48px 60px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? 28 : 40, marginBottom: isMobile ? 28 : 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg,${T.cyan},${T.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏛️</div>
                <div style={{ color: T.text, fontWeight: 900, fontSize: 14, fontFamily: "'Syne',sans-serif" }}>PS-CRM</div>
              </div>
              <p style={{ color: T.sub, fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>Smart Public Service CRM — building transparent, scalable civic infrastructure for modern India.</p>
            </div>
            {[["Platform", ["Dashboard", "File Complaint", "Track Complaint", "Analytics"]], ["Departments", ["Water Supply", "Road Works", "Electricity", "Sanitation"]], ["Support", ["Help Center", "API Docs", "Contact Us", "Status Page"]]].map(([h, links]) => (
              <div key={h}>
                <div style={{ color: T.text, fontWeight: 800, fontSize: 13, marginBottom: 16, fontFamily: "'Syne',sans-serif" }}>{h}</div>
                {links.map(l => (
                  <div key={l} style={{ color: T.sub, fontSize: 13, marginBottom: 10, cursor: "pointer", transition: "color .15s" }}
                    onMouseEnter={e => e.target.style.color = T.cyan} onMouseLeave={e => e.target.style.color = T.sub}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 0 }}>
            <div style={{ color: T.muted, fontSize: 12, textAlign: isMobile ? "center" : "left" }}>© 2025 PS-CRM · Government of India · All rights reserved</div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ background: T.green + "18", color: T.green, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>System Operational</span>
              <span style={{ background: T.muted + "22", color: T.sub, padding: "3px 10px", borderRadius: 100, fontSize: 11 }}>v2.1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
