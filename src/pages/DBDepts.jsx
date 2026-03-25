import { useState } from "react";
import T from "../constants/tokens";
import { DEPTS } from "../data/mockData";
import useIsMobile from "../hooks/useIsMobile";

function DBDepts() {
  const isMobile = useIsMobile(768);
  const [selected, setSelected] = useState(null);

  const p = isMobile ? "16px" : "28px 34px";

  if (selected) return (
    <div style={{ padding: p }}>
      <button onClick={() => setSelected(null)} style={{ background: T.white, border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", marginBottom: 24, fontWeight: 700, boxShadow: T.shadow }}>← Back to Departments</button>
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 24, padding: isMobile ? "24px" : "32px", boxShadow: T.shadow }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: `${selected.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{selected.icon}</div>
          <div>
            <h2 style={{ color: T.text, fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: "0 0 4px", fontFamily: "'Poppins',sans-serif" }}>{selected.name}</h2>
            <div style={{ display: "inline-block", background: T.borderLight, color: T.textSecondary, padding: "4px 12px", borderRadius: 100, fontSize: 13, fontWeight: 600 }}>Headed by Director of {selected.name}</div>
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { l: "Total Complaints", v: selected.complaints, c: T.primary },
            { l: "Resolved", v: selected.resolved, c: T.green },
            { l: "Resolution Rate", v: Math.round(selected.resolved/selected.complaints*100) + "%", c: T.accent },
            { l: "Avg SLA", v: (Math.random()*3+1).toFixed(1) + " days", c: T.amber },
          ].map((s, i) => (
            <div key={i} style={{ background: T.bg, padding: "20px", borderRadius: 16, border: `1px solid ${T.borderLight}`, textAlign: "center" }}>
              <div style={{ color: s.c, fontSize: 28, fontWeight: 900, fontFamily: "'Poppins',sans-serif", lineHeight: 1, marginBottom: 8 }}>{s.v}</div>
              <div style={{ color: T.sub, fontSize: 12, fontWeight: 700 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ color: T.text, fontWeight: 800, fontSize: 18, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>Top Issue Categories</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["Maintenance Request", "Infrastructure Damage", "Service Outage", "Billing/Payment"].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, width: 140 }}>{c}</div>
              <div style={{ flex: 1, height: 8, background: T.borderLight, borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${80 - i*15}%`, background: selected.color, borderRadius: 4 }} />
              </div>
              <div style={{ color: T.sub, fontSize: 13, fontWeight: 700, width: 40, textAlign: "right" }}>{80 - i*15}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: p }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>Departments</h1>
        <p style={{ color: T.sub, fontSize: 15, margin: 0 }}>Civic branches managing specific public services</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 20 }}>
        {DEPTS.map((d, i) => {
          const rate = Math.round((d.resolved / d.complaints) * 100);
          return (
            <div key={i} onClick={() => setSelected(d)} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: "24px", cursor: "pointer", transition: "all .2s", boxShadow: T.shadow, display: "flex", alignItems: "flex-start", gap: 16 }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = T.shadowLg; e.currentTarget.style.borderColor = d.color + "55"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.borderColor = T.border; }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `${d.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{d.icon}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: T.text, fontSize: 18, fontWeight: 800, margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>{d.name}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ color: T.sub, fontSize: 13, fontWeight: 600 }}>{d.complaints} complaints</div>
                  <div style={{ color: d.color, fontSize: 13, fontWeight: 800, padding: "4px 10px", background: `${d.color}15`, borderRadius: 100 }}>{rate}% resolved</div>
                </div>
                <div style={{ height: 6, background: T.borderLight, borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${rate}%`, background: d.color, borderRadius: 3 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DBDepts;
