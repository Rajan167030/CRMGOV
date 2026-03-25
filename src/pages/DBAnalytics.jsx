import T from "../constants/tokens";
import { MONTHLY, DEPTS } from "../data/mockData";
import useIsMobile from "../hooks/useIsMobile";

function DBAnalytics() {
  const isMobile = useIsMobile(768);
  const p = isMobile ? "16px" : "28px 34px";
  const maxM = Math.max(...MONTHLY.map(m => m.v));

  return (
    <div style={{ padding: p, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>Analytics & Insights</h1>
        <p style={{ color: T.sub, fontSize: 15, margin: 0 }}>System-wide performance, trends, and compliance metrics</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20, marginBottom: 24 }}>
        {[
          { l: "System Health", v: "98.2%", d: "+0.4%", c: T.green },
          { l: "Citizen Satisfaction", v: "4.6/5", d: "+0.1", c: T.amber },
          { l: "Avg Response Time", v: "4.2 hrs", d: "-1.1 hrs", c: T.primary },
        ].map((s, i) => (
          <div key={i} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: "24px", boxShadow: T.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ color: T.sub, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{s.l}</div>
              <div style={{ background: `${s.c}15`, color: s.c, padding: "4px 10px", borderRadius: 100, fontSize: 12, fontWeight: 800 }}>{s.d}</div>
            </div>
            <div style={{ color: T.text, fontSize: 36, fontWeight: 900, fontFamily: "'Poppins',sans-serif", margin: "16px 0 8px" }}>{s.v}</div>
            <div style={{ height: 4, background: T.borderLight, borderRadius: 2 }}>
              <div style={{ height: "100%", width: "80%", background: s.c, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 24, marginBottom: 24 }}>
        
        {/* Monthly Volume Bar Chart */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: isMobile ? "20px" : "32px", boxShadow: T.shadow }}>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 18, marginBottom: 32, fontFamily: "'Poppins',sans-serif" }}>Complaints Volume (YTD)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 8 : 16, height: 260, paddingBottom: 30, borderBottom: `1px solid ${T.border}`, position: "relative" }}>
            {MONTHLY.map((m, i) => {
              const h = (m.v / maxM) * 100;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", group: "chart" }}>
                  <div style={{ height: 230, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative" }}>
                    <div style={{ width: isMobile ? 20 : 36, height: `${h}%`, background: T.gradientRed, borderRadius: "6px 6px 0 0", position: "relative", transition: "all .3s", cursor: "pointer", boxShadow: `0 0 10px ${T.primary}22` }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scaleY(1.05)"; e.currentTarget.style.filter = "brightness(1.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.filter = "none"; }}>
                      <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)", background: T.text, color: "#fff", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, opacity: 0, transition: "opacity .2s", pointerEvents: "none" }} className="tooltip">{m.v}</div>
                    </div>
                  </div>
                  <div style={{ color: T.textSecondary, fontSize: 12, marginTop: 12, fontWeight: 600 }}>{m.m}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA Compliance Rates */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: isMobile ? "20px" : "32px", boxShadow: T.shadow }}>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 18, marginBottom: 24, fontFamily: "'Poppins',sans-serif" }}>SLA Compliance</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {DEPTS.map((d, i) => {
              const sla = Math.round((d.resolved / d.complaints) * 100) - (Math.random() * 5);
              const c = sla > 90 ? T.green : sla > 80 ? T.amber : T.red;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{d.name}</span>
                    <span style={{ color: c, fontSize: 13, fontWeight: 800 }}>{sla.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 8, background: T.borderLight, borderRadius: 4 }}>
                    <div style={{ height: "100%", width: `${sla}%`, background: c, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
        
        {/* Heatmap Simulation */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: isMobile ? "20px" : "32px", boxShadow: T.shadow }}>
          <div style={{ flex: 1, display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 18, fontFamily: "'Poppins',sans-serif" }}>Geographic Heatmap</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[0.2, 0.4, 0.6, 0.8, 1].map(o => (
                <div key={o} style={{ width: 12, height: 12, background: T.red, opacity: o, borderRadius: 2 }} />
              ))}
              <span style={{ color: T.sub, fontSize: 11, marginLeft: 6, fontWeight: 600 }}>High Density</span>
            </div>
          </div>
          <div style={{ height: 240, background: T.bg, borderRadius: 16, position: "relative", overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(8,1fr)", gridTemplateRows: "repeat(5,1fr)", gap: 2, padding: 2, border: `1px solid ${T.borderLight}` }}>
            {Array.from({ length: 40 }).map((_, i) => {
              const x = i % 8, y = Math.floor(i / 8);
              const isHot = (x > 2 && x < 6 && y > 1 && y < 4) || (x === 1 && y === 1);
              const op = isHot ? Math.random() * 0.7 + 0.3 : Math.random() * 0.2;
              return (
                <div key={i} style={{ background: T.red, opacity: op, borderRadius: 4, transition: "opacity .3s", cursor: "crosshair" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = Math.min(1, op + 0.4)}
                  onMouseLeave={e => e.currentTarget.style.opacity = op}
                />
              );
            })}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.85)", padding: "10px 24px", borderRadius: 100, color: T.text, fontWeight: 800, fontSize: 13, border: `1px solid ${T.border}`, backdropFilter: "blur(4px)" }}>Central Zone - High Volume</div>
            </div>
          </div>
        </div>

        {/* Predictive Insights */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: isMobile ? "20px" : "32px", boxShadow: T.shadow }}>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 18, marginBottom: 24, fontFamily: "'Poppins',sans-serif" }}>AI Insights & Sentiment</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "📈", title: "Volume Surge Predicted", desc: "Expect 15% increase in Water Supply complaints due to upcoming maintenance works in South Zone.", col: T.amber },
              { icon: "📉", title: "Resolution Time Improved", desc: "Electricity department average SLA wait time reduced from 3.2 to 2.8 days.", col: T.green },
              { icon: "🚨", title: "Critical Escalations", desc: "Road Works department has 12 complaints breaching SLA thresholds in the last 48 hours.", col: T.red },
              { icon: "🗣️", title: "Citizen Sentiment", desc: "Overall language analysis shows 68% positive/neutral sentiment post-resolution.", col: T.accent },
            ].map((i, idx) => (
              <div key={idx} style={{ padding: "16px", background: T.bg, border: `1px solid ${T.borderLight}`, borderRadius: 16, display: "flex", gap: 16 }}>
                <div style={{ fontSize: 28, height: "fit-content", padding: "8px", background: T.white, borderRadius: 12, border: `1px solid ${T.borderLight}`, filter: `drop-shadow(0 4px 8px ${i.col}22)` }}>{i.icon}</div>
                <div>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{i.title}</div>
                  <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.5 }}>{i.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DBAnalytics;
