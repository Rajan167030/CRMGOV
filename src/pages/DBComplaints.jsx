import { useState } from "react";
import T from "../constants/tokens";
import Badge from "../components/Badge";
import PriorityDot from "../components/PriorityDot";
import { COMPLAINTS } from "../data/mockData";
import useIsMobile from "../hooks/useIsMobile";

function DBComplaints() {
  const isMobile = useIsMobile(768);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = COMPLAINTS.filter(c => (filter === "All" || c.status === filter) && (c.id + c.citizen + c.dept + c.location).toLowerCase().includes(search.toLowerCase()));

  const p = isMobile ? "16px" : "28px 34px";

  if (selected) return (
    <div style={{ padding: p }}>
      <button onClick={() => setSelected(null)} style={{ background: T.white, border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", marginBottom: 24, fontWeight: 700, boxShadow: T.shadow }}>← Back to List</button>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: 24 }}>
        
        {/* Detail Main */}
        <div>
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "20px" : "28px", marginBottom: 16, boxShadow: T.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span style={{ color: T.primary, fontFamily: "monospace", fontSize: 14, fontWeight: 800 }}>{selected.id}</span>
                <h2 style={{ color: T.text, fontSize: isMobile ? 20 : 24, fontWeight: 800, margin: "6px 0 4px", fontFamily: "'Poppins',sans-serif" }}>{selected.dept} Complaint</h2>
                <span style={{ color: T.sub, fontSize: 13, fontWeight: 500 }}>Filed by {selected.citizen} · {selected.created}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Badge status={selected.status} /><PriorityDot p={selected.priority} />
              </div>
            </div>
            
            <div style={{ background: T.bg, borderRadius: 12, padding: "16px", marginBottom: 20, border: `1px solid ${T.borderLight}` }}>
              <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Description</div>
              <p style={{ color: T.text, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{selected.desc}</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              {[["📍 Location", selected.location], ["🏛️ Department", selected.dept], ["👮 Assigned To", selected.assigned], ["📱 Phone", selected.phone]].map(([k, v]) => (
                <div key={k} style={{ background: T.bg, borderRadius: 12, padding: "12px 16px", border: `1px solid ${T.borderLight}` }}>
                  <div style={{ color: T.sub, fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{k}</div>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: isMobile ? "20px" : "28px", boxShadow: T.shadow }}>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 16, fontFamily: "'Poppins',sans-serif", marginBottom: 20 }}>Activity Timeline</div>
            {[
              { time: "Mar 07, 09:14", action: "Complaint Filed", note: "Submitted via Web Portal", col: T.primary },
              { time: "Mar 07, 09:15", action: "Auto-routed", note: `Assigned to ${selected.dept} department`, col: T.accent },
              { time: "Mar 07, 11:30", action: "Acknowledged", note: `${selected.assigned} picked up`, col: T.amber },
              ...(selected.status === "Resolved" ? [{ time: "Mar 08, 15:00", action: "Resolved", note: "Issue resolved. Citizen notified via SMS.", col: T.green }] : []),
              ...(selected.status === "Escalated" ? [{ time: "Mar 08, 09:00", action: "SLA Breached", note: "Auto-escalated to supervisor", col: T.red }] : []),
            ].map((t, i, arr) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.col, flexShrink: 0, marginTop: 4, border: `2px solid ${T.white}`, boxShadow: `0 0 0 2px ${t.col}44` }} />
                  {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: T.borderLight, marginTop: 4 }} />}
                </div>
                <div>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 800 }}>{t.action}</div>
                  <div style={{ color: T.textSecondary, fontSize: 13, marginTop: 4 }}>{t.note}</div>
                  <div style={{ color: T.muted, fontSize: 12, marginTop: 4, fontWeight: 600 }}>{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Detail Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px", boxShadow: T.shadow }}>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 15, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>SLA Status</div>
            <div style={{ textAlign: "center", padding: "16px 0", background: T.bg, borderRadius: 12, border: `1px solid ${T.borderLight}` }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: selected.sla < 0 ? T.red : selected.sla <= 1 ? T.amber : T.green, fontFamily: "'Poppins',sans-serif", lineHeight: 1 }}>
                {selected.sla < 0 ? `${Math.abs(selected.sla)}d` : `${selected.sla}d`}
              </div>
              <div style={{ color: T.textSecondary, fontSize: 13, marginTop: 6, fontWeight: 700 }}>
                {selected.sla < 0 ? "Overdue" : "Remaining"}
              </div>
              <div style={{ marginTop: 20, height: 8, background: T.border, borderRadius: 4, margin: "20px 20px 0" }}>
                <div style={{ height: "100%", width: selected.sla < 0 ? "100%" : `${Math.max(10, (5 - selected.sla) / 5 * 100)}%`, background: selected.sla < 0 ? T.red : selected.sla <= 1 ? T.amber : T.green, borderRadius: 4 }} />
              </div>
            </div>
          </div>
          
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px", boxShadow: T.shadow }}>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 15, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>Quick Actions</div>
            {["Reassign Officer", "Escalate to Supervisor", "Add Internal Note", "Mark Resolved", "Send SMS Update"].map((a, i) => (
              <button key={i} style={{ display: "block", width: "100%", padding: "12px 14px", marginBottom: 10, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: 600, transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: p }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["All", "Pending", "In Progress", "Resolved", "Escalated"].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "8px 18px", borderRadius: 100, border: `1px solid ${filter === s ? T.primary : T.border}`, cursor: "pointer", fontSize: 13, fontWeight: 700, background: filter === s ? T.primaryBg : T.white, color: filter === s ? T.primary : T.textSecondary, transition: "all .2s" }}>
              {s}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID, name, dept…" style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 16px", color: T.text, fontSize: 14, outline: "none", width: isMobile ? "100%" : 240, boxShadow: T.shadow }} />
      </div>

      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: T.shadow }}>
        {isMobile ? (
          <>
            {filtered.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: T.sub, fontWeight: 600 }}>No complaints found</div>}
            {filtered.map((c, i) => (
              <div key={c.id} onClick={() => setSelected(c)} style={{ padding: "16px", cursor: "pointer", borderBottom: i < filtered.length - 1 ? `1px solid ${T.borderLight}` : "none", background: T.white }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: T.primary, fontFamily: "monospace", fontSize: 13, fontWeight: 800 }}>{c.id}</span>
                  <Badge status={c.status} />
                </div>
                <div style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{c.citizen}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: T.textSecondary, fontSize: 13, fontWeight: 500 }}>{c.dept} · {c.location.split(",")[0]}</span>
                  <PriorityDot p={c.priority} />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "100px 140px 120px 1fr 110px 96px 90px", padding: "14px 24px", borderBottom: `1px solid ${T.border}`, background: T.bg, color: T.sub, fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
              <span>ID</span><span>Citizen</span><span>Dept</span><span>Location</span><span>Status</span><span>Priority</span><span>SLA</span>
            </div>
            {filtered.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: T.sub, fontSize: 15, fontWeight: 600 }}>No complaints found matching criteria</div>}
            {filtered.map((c, i) => (
              <div key={c.id} onClick={() => setSelected(c)} style={{ display: "grid", gridTemplateColumns: "100px 140px 120px 1fr 110px 96px 90px", alignItems: "center", padding: "16px 24px", gap: 10, cursor: "pointer", borderBottom: i < filtered.length - 1 ? `1px solid ${T.borderLight}` : "none", transition: "background .15s", background: T.white }}
                onMouseEnter={e => e.currentTarget.style.background = T.bg} onMouseLeave={e => e.currentTarget.style.background = T.white}>
                <span style={{ color: T.primary, fontFamily: "monospace", fontSize: 13, fontWeight: 800 }}>{c.id}</span>
                <span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{c.citizen}</span>
                <span style={{ color: T.textSecondary, fontSize: 13 }}>{c.dept}</span>
                <span style={{ color: T.textSecondary, fontSize: 13 }}>{c.location}</span>
                <Badge status={c.status} />
                <PriorityDot p={c.priority} />
                <span style={{ color: c.sla < 0 ? T.red : c.sla <= 1 ? T.amber : T.green, fontSize: 13, fontWeight: 800 }}>{c.sla < 0 ? `${Math.abs(c.sla)}d over` : `${c.sla}d left`}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default DBComplaints;
