import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import T from "../constants/tokens";
import { DEPTS } from "../data/mockData";
import useIsMobile from "../hooks/useIsMobile";
import { useAuth } from "../context/AuthContext";

function DBFile() {
  const isMobile = useIsMobile(768);
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [fd, setFd] = useState({ 
    n: user?.name || "", 
    p: user?.phone || "", 
    d: "", 
    l: "", 
    desc: "" 
  });
  
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [err, setErr] = useState({});

  const validate1 = () => {
    let e = {};
    if (!fd.d) e.d = "Select a department";
    if (!fd.l.trim()) e.l = "Location is required";
    if (!fd.desc.trim()) e.desc = "Description is required";
    else if (fd.desc.length < 10) e.desc = "Provide more details (min 10 chars)";
    if (!fd.n.trim()) e.n = "Name is required";
    if (!fd.p.trim()) e.p = "Phone is required";
    else if (!/^\+?[\d\s-]{10,}$/.test(fd.p)) e.p = "Invalid phone format";
    setErr(e);
    if (Object.keys(e).length === 0) setStep(2);
  };

  const submit = () => {
    // TODO: Create a FormData payload here to handle both text fields and binary file selection
    // Example:
    // const payload = new FormData();
    // payload.append('evidence', fileInputRef.current?.files[0]);
    // payload.append('department', fd.d);
    // ...
    // await axios.post('/api/complaints', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    setTimeout(() => setDone(true), 600);
  };

  const steps = [
    { n: 1, title: "Complaint Details", desc: "Evidence & Issue" },
    { n: 2, title: "Review", desc: "Confirm submission" }
  ];

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Speech Recognition. Please type your description.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-IN';
    
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = (e) => {
      setIsListening(false);
      if (e.error === 'not-allowed') {
        alert("Microphone access denied! Wait, are you on a mobile device testing over HTTP? Mobile browsers block mic access on non-HTTPS network IPs. You must run a secure dev server or use localhost.");
      } else {
        alert("Microphone error: " + e.error);
      }
    };
    
    rec.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        setFd(prev => ({ ...prev, desc: prev.desc ? prev.desc + " " + transcript.trim() : transcript.trim() }));
        setErr(prev => ({ ...prev, desc: null }));
      }
    };
    
    rec.start();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const inputStyle = (errField) => ({
    width: "100%", padding: "14px 16px", background: T.white, 
    border: `1px solid ${err[errField] ? T.red : T.border}`,
    borderRadius: 12, color: T.text, fontSize: 15, outline: "none",
    boxShadow: "inset 0 1px 4px rgba(0,0,0,0.02)",
    transition: "border .2s"
  });

  const btnStyle = {
    background: T.gradientRed, color: "#fff", border: "none", borderRadius: 12, 
    padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", 
    transition: "all .2s", boxShadow: `0 6px 20px ${T.primary}33`
  };

  const p = isMobile ? "16px" : "28px 34px";

  if (done) return (
    <div style={{ padding: p, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 24, padding: isMobile ? "32px 24px" : "48px 56px", textAlign: "center", maxWidth: 460, boxShadow: T.shadowLg }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: T.greenBg, color: T.green, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "pulse 2s infinite" }}>✓</div>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 900, margin: "0 0 12px", fontFamily: "'Poppins',sans-serif" }}>Complaint Filed</h2>
        <p style={{ color: T.textSecondary, fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>Your complaint has been registered successfully. The assigned department will be notified immediately.</p>
        <div style={{ background: T.bg, padding: "16px", borderRadius: 12, marginBottom: 32, border: `1px solid ${T.borderLight}` }}>
          <div style={{ color: T.sub, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Tracking ID</div>
          <div style={{ color: T.primary, fontSize: 28, fontWeight: 900, fontFamily: "monospace", letterSpacing: 2 }}>{`CMP-26-${Math.floor(100+Math.random()*900)}`}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link to="/dashboard/my-complaints" style={btnStyle}>Track Status</Link>
          <button onClick={() => { setStep(1); setDone(false); setFd({n:user?.name||"", p:user?.phone||"", d:"", l:"", desc:""}); setFile(null); }} style={{ ...btnStyle, background: T.white, color: T.text, border: `1px solid ${T.border}`, boxShadow: "none" }}>File Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: p, maxWidth: 840, margin: "0 auto" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>File a Complaint</h1>
        <p style={{ color: T.sub, fontSize: 15, margin: 0 }}>Register your grievance for quick resolution</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 36, position: "relative", maxWidth: 400, margin: "0 auto 40px" }}>
        <div style={{ position: "absolute", top: 18, left: 30, right: 30, height: 3, background: T.borderLight, zIndex: 0 }}>
          <div style={{ height: "100%", width: `${(step - 1) * 100}%`, background: T.primary, transition: "width .3s" }} />
        </div>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: step >= s.n ? T.primary : T.white, border: `3px solid ${step >= s.n ? T.primary : T.borderLight}`, color: step >= s.n ? "#fff" : T.sub, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, marginBottom: 10, transition: "all .3s", boxShadow: step === s.n ? `0 0 0 4px ${T.primary}22` : "none" }}>{step > s.n ? "✓" : s.n}</div>
            <div style={{ color: step >= s.n ? T.text : T.sub, fontSize: 12, fontWeight: 700 }}>{s.title}</div>
          </div>
        ))}
      </div>

      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 24, padding: isMobile ? "24px 20px" : "40px", boxShadow: T.shadow }}>
        {step === 1 && (
          <div style={{ animation: "fadeIn .3s" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px", color: T.text, fontFamily: "'Poppins',sans-serif" }}>Provide Evidence</h2>
            <p style={{ color: T.sub, fontSize: 14, margin: "0 0 24px" }}>Upload a photo or record your complaint via voice before filling the details.</p>
            
            <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
              
              <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px", background: file ? T.greenBg : T.bg, border: `2px dashed ${file ? T.green : T.border}`, borderRadius: 16, cursor: "pointer", transition: "all .2s", color: file ? T.green : T.textSecondary }}>
                <span style={{ fontSize: 32 }}>📸</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{file ? "Photo Uploaded" : "Upload Image"}</span>
                <span style={{ fontSize: 11, marginTop: -4, opacity: 0.8 }}>Camera or Folder</span>
              </button>
              
              <button onClick={toggleMic} style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px", background: isListening ? T.redBg : T.bg, border: `2px dashed ${isListening ? T.primary : T.border}`, borderRadius: 16, cursor: "pointer", transition: "all .2s", color: isListening ? T.primary : T.textSecondary }}>
                <span style={{ fontSize: 32, animation: isListening ? "pulse 1s infinite" : "none" }}>{isListening ? "🛑" : "🎙️"}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{isListening ? "Stop Recording" : "Record Voice"}</span>
                <span style={{ fontSize: 11, marginTop: -4, opacity: 0.8 }}>Voice to Text</span>
              </button>
            </div>

            <hr style={{ border: "none", borderTop: `1px solid ${T.borderLight}`, margin: "0 0 24px" }} />
            
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 24px", color: T.text, fontFamily: "'Poppins',sans-serif" }}>Details</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Department <span style={{ color: T.red }}>*</span></label>
                <select value={fd.d} onChange={e => { setFd({...fd, d: e.target.value}); setErr({...err, d: null}) }} style={inputStyle("d")}>
                  <option value="">Select Department...</option>
                  {DEPTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
                {err.d && <div style={{ color: T.red, fontSize: 12, marginTop: 6 }}>{err.d}</div>}
              </div>
              <div>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Location / Address <span style={{ color: T.red }}>*</span></label>
                <input value={fd.l} onChange={e => { setFd({...fd, l: e.target.value}); setErr({...err, l: null}) }} placeholder="Street, Area, Ward no." style={inputStyle("l")} />
                {err.l && <div style={{ color: T.red, fontSize: 12, marginTop: 6 }}>{err.l}</div>}
              </div>
            </div>
            
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "inline-flex", justifyContent: "space-between", width: "100%", color: T.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                <span>Description <span style={{ color: T.red }}>*</span></span>
                {isListening && <span style={{ color: T.primary, fontSize: 11, animation: "pulse 1s infinite" }}>🎙️ Recording...</span>}
              </label>
              <textarea value={fd.desc} onChange={e => { setFd({...fd, desc: e.target.value}); setErr({...err, desc: null}) }} placeholder="Please describe the issue in detail. You can use the microphone above to speak." rows={4} style={{ ...inputStyle("desc"), resize: "vertical", minHeight: 120 }} />
              {err.desc && <div style={{ color: T.red, fontSize: 12, marginTop: 6 }}>{err.desc}</div>}
            </div>

            <hr style={{ border: "none", borderTop: `1px solid ${T.borderLight}`, margin: "0 0 24px" }} />
            
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 24px", color: T.text, fontFamily: "'Poppins',sans-serif" }}>Citizen Info (Auto-filled)</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Full Name <span style={{ color: T.red }}>*</span></label>
                <input value={fd.n} onChange={e => { setFd({...fd, n: e.target.value}); setErr({...err, n: null}) }} placeholder="Enter name" style={inputStyle("n")} />
                {err.n && <div style={{ color: T.red, fontSize: 12, marginTop: 6 }}>{err.n}</div>}
              </div>
              <div>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Phone Number <span style={{ color: T.red }}>*</span></label>
                <input value={fd.p} onChange={e => { setFd({...fd, p: e.target.value}); setErr({...err, p: null}) }} placeholder="+91 98765 43210" style={inputStyle("p")} />
                {err.p && <div style={{ color: T.red, fontSize: 12, marginTop: 6 }}>{err.p}</div>}
              </div>
            </div>

            <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={validate1} style={btnStyle}>Review Details →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: "fadeIn .3s" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 24px", color: T.text, fontFamily: "'Poppins',sans-serif" }}>Review & Submit</h2>
            <div style={{ background: T.bg, padding: "24px", borderRadius: 16, border: `1px solid ${T.borderLight}`, display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              
              {file && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: T.sub, fontWeight: 700, marginBottom: 8 }}>EVIDENCE</div>
                  <img src={file} alt="Evidence" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12, border: `1px solid ${T.border}` }} />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <div><div style={{ fontSize: 11, color: T.sub, fontWeight: 700, marginBottom: 4 }}>NAME</div><div style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>{fd.n}</div></div>
                <div><div style={{ fontSize: 11, color: T.sub, fontWeight: 700, marginBottom: 4 }}>PHONE</div><div style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>{fd.p}</div></div>
                <div><div style={{ fontSize: 11, color: T.sub, fontWeight: 700, marginBottom: 4 }}>DEPARTMENT</div><div style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>{fd.d}</div></div>
                <div><div style={{ fontSize: 11, color: T.sub, fontWeight: 700, marginBottom: 4 }}>LOCATION</div><div style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>{fd.l}</div></div>
              </div>
              <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 16 }}>
                <div style={{ fontSize: 11, color: T.sub, fontWeight: 700, marginBottom: 6 }}>DESCRIPTION</div>
                <div style={{ fontSize: 15, color: T.text, lineHeight: 1.6 }}>{fd.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: T.cyanBg, padding: 16, borderRadius: 12, marginBottom: 32, border: `1px solid ${T.cyan}33` }}>
              <span style={{ fontSize: 20 }}>ℹ️</span>
              <p style={{ margin: 0, fontSize: 13, color: T.cyan, lineHeight: 1.6, fontWeight: 600 }}>By submitting, you confirm that the information provided is true to the best of your knowledge.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={{ ...btnStyle, background: T.white, color: T.text, border: `1px solid ${T.border}`, boxShadow: "none" }}>← Edit</button>
              <button onClick={submit} style={{ ...btnStyle, background: T.green, boxShadow: `0 6px 20px ${T.green}33` }}>Submit Complaint ✓</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DBFile;
