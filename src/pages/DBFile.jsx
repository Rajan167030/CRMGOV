import { useState, useRef } from "react";
import T from "../constants/tokens";
import { DEPTS } from "../data/mockData";
import useIsMobile from "../hooks/useIsMobile";

function DBFile() {
  const isMobile = useIsMobile(768);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", dept: "", priority: "Medium", title: "", desc: "", location: "" });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const ticketId = useRef(`CMP-${2410 + Math.floor(Math.random() * 90)}`).current;
  const inp = { width: "100%", background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 13px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const lbl = { color: T.sub, fontSize: 11, fontWeight: 700, marginBottom: 5, display: "block", letterSpacing: .8, textTransform: "uppercase" };
  const p = isMobile ? "16px" : "28px 34px";

  if (done) return (
    <div style={{ padding: p, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center", paddingTop: 30 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.green + "22", border: `2px solid ${T.green}`, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>✅</div>
        <h2 style={{ color: T.text, fontSize: isMobile ? 20 : 24, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Syne',sans-serif" }}>Complaint Registered!</h2>
        <p style={{ color: T.sub, marginBottom: 24, fontSize: 14 }}>Auto-routed to the {form.dept || "relevant"} department.</p>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, padding: isMobile ? 16 : 22, textAlign: "left", marginBottom: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            {[["Ticket ID", ticketId], ["Department", form.dept || "Water Supply"], ["Priority", form.priority], ["SLA", "3 working days"], ["Assigned", "Auto-routing…"], ["Updates", "SMS + Email"]].map(([k, v]) => (
              <div key={k}><div style={{ color: T.sub, fontSize: 11, marginBottom: 3 }}>{k}</div><div style={{ color: k === "Ticket ID" ? T.cyan : T.text, fontWeight: 700, fontSize: 13, fontFamily: k === "Ticket ID" ? "monospace" : "inherit" }}>{v}</div></div>
            ))}
          </div>
        </div>
        <button onClick={() => { setDone(false); setStep(1); setForm({ name: "", phone: "", email: "", dept: "", priority: "Medium", title: "", desc: "", location: "" }); }}
          style={{ background: `linear-gradient(90deg,${T.cyan},${T.blue})`, color: "#fff", border: "none", borderRadius: 9, padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: isMobile ? "100%" : "auto" }}>File Another</button>
      </div>
    </div>
  );
  return (
    <div style={{ padding: p }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 26, gap: 0 }}>
          {["Citizen Info", "Complaint Details", "Review & Submit"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: step > i + 1 ? T.green : step === i + 1 ? `linear-gradient(135deg,${T.cyan},${T.blue})` : T.border, color: step >= i + 1 ? "#fff" : T.sub, fontSize: 12, fontWeight: 800, boxShadow: step === i + 1 ? `0 0 12px ${T.cyan}66` : "none" }}>{step > i + 1 ? "✓" : i + 1}</div>
                {!isMobile && <span style={{ color: step === i + 1 ? T.text : T.sub, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{s}</span>}
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? T.cyan : T.border, margin: "0 6px", marginBottom: isMobile ? 0 : 16 }} />}
            </div>
          ))}
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: isMobile ? 18 : 26 }}>
          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
              <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Full Name *</label><input style={inp} value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Your full name" /></div>
              <div><label style={lbl}>Mobile *</label><input style={inp} value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="+91 98765 43210" /></div>
              <div><label style={lbl}>Email</label><input style={inp} value={form.email} onChange={e => upd("email", e.target.value)} placeholder="email@example.com" /></div>
              <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Address *</label><input style={inp} value={form.location} onChange={e => upd("location", e.target.value)} placeholder="Street, Area, City, Pincode" /></div>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
              <div><label style={lbl}>Department *</label>
                <select style={inp} value={form.dept} onChange={e => upd("dept", e.target.value)}>
                  <option value="">Select Department</option>
                  {DEPTS.map(d => <option key={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Priority</label>
                <select style={inp} value={form.priority} onChange={e => upd("priority", e.target.value)}>
                  {["Low", "Medium", "High", "Critical"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e => upd("title", e.target.value)} placeholder="Brief summary of the issue" /></div>
              <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Description *</label><textarea style={{ ...inp, minHeight: 100, resize: "vertical" }} value={form.desc} onChange={e => upd("desc", e.target.value)} placeholder="Describe the issue in detail…" /></div>
            </div>
          )}
          {step === 3 && (
            <div>
              <div style={{ color: T.text, fontWeight: 800, fontSize: 15, marginBottom: 18, fontFamily: "'Syne',sans-serif" }}>Review Your Submission</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 11, marginBottom: 18 }}>
                {[["Name", form.name || "—"], ["Phone", form.phone || "—"], ["Department", form.dept || "—"], ["Priority", form.priority], ["Location", form.location || "—"], ["Title", form.title || "—"]].map(([k, v]) => (
                  <div key={k} style={{ background: T.surf, borderRadius: 9, padding: "11px 14px" }}>
                    <div style={{ color: T.sub, fontSize: 11, marginBottom: 3 }}>{k}</div>
                    <div style={{ color: T.text, fontWeight: 600, fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: T.cyan + "0F", border: `1px solid ${T.cyan}22`, borderRadius: 9, padding: "13px 15px", color: T.sub, fontSize: 12, lineHeight: 1.6 }}>ℹ️ Complaint will be auto-routed to the {form.dept || "selected"} department with SLA tracking active.</div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.border}`, gap: 10 }}>
            {step > 1 ? <button onClick={() => setStep(s => s - 1)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.sub, borderRadius: 8, padding: "9px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← Back</button> : <div />}
            <button onClick={() => step < 3 ? setStep(s => s + 1) : setDone(true)} style={{ background: `linear-gradient(90deg,${T.cyan},${T.blue})`, color: "#fff", border: "none", borderRadius: 8, padding: "9px 26px", fontSize: 13, cursor: "pointer", fontWeight: 700, boxShadow: `0 4px 14px ${T.cyan}44`, flex: isMobile ? 1 : "none" }}>
              {step === 3 ? "🚀 Submit Complaint" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DBFile;
