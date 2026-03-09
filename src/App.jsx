import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════ */
const T = {
  bg: "#04060D", surf: "#080C18", card: "#0C1220", border: "#151F35",
  cyan: "#00E5FF", blue: "#0057FF", green: "#00F5A0", amber: "#FFB800",
  red: "#FF3860", purple: "#9B6DFF", text: "#EDF2FF", sub: "#7A8BA8", muted: "#2A3A55",
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const COMPLAINTS = [
  { id:"CMP-2401", citizen:"Rajesh Kumar",  phone:"9876543210", dept:"Water Supply",  status:"In Progress", priority:"High",     sla:2,  location:"Sector 14, Delhi",        desc:"No water supply for 3 days in the entire block. Residents are suffering badly.", created:"2025-03-06", assigned:"Officer Mehta" },
  { id:"CMP-2400", citizen:"Priya Sharma",  phone:"9812345678", dept:"Road Works",    status:"Resolved",    priority:"Medium",   sla:0,  location:"MG Road, Bangalore",      desc:"Large pothole near signal causing accidents. Multiple vehicles damaged.", created:"2025-03-05", assigned:"Officer Das" },
  { id:"CMP-2399", citizen:"Ahmed Khan",    phone:"9988776655", dept:"Electricity",   status:"Escalated",   priority:"Critical", sla:-1, location:"HITEC City, Hyderabad",   desc:"Transformer blown. Entire colony without power for 36 hours.", created:"2025-03-04", assigned:"Officer Rao" },
  { id:"CMP-2398", citizen:"Sunita Patel",  phone:"9765432109", dept:"Sanitation",    status:"Pending",     priority:"Low",      sla:5,  location:"Andheri West, Mumbai",    desc:"Garbage not collected for 5 days. Foul smell affecting all residents.", created:"2025-03-07", assigned:"Unassigned" },
  { id:"CMP-2397", citizen:"Vikram Singh",  phone:"9654321098", dept:"Transport",     status:"In Progress", priority:"Medium",   sla:1,  location:"Sector 22, Chandigarh",   desc:"Bus route 44C discontinued without notice. Daily commuters affected.", created:"2025-03-05", assigned:"Officer Gill" },
  { id:"CMP-2396", citizen:"Meena Reddy",   phone:"9543210987", dept:"Public Health", status:"Resolved",    priority:"High",     sla:0,  location:"Jubilee Hills, Hyderabad",desc:"Stagnant water causing mosquito breeding near park. Dengue risk.", created:"2025-03-03", assigned:"Officer Kumar" },
  { id:"CMP-2395", citizen:"Arjun Nair",    phone:"9432109876", dept:"Water Supply",  status:"Pending",     priority:"Medium",   sla:3,  location:"Koramangala, Bangalore",  desc:"Water pressure extremely low. Cannot fill tanks for last 2 days.", created:"2025-03-07", assigned:"Unassigned" },
  { id:"CMP-2394", citizen:"Divya Iyer",    phone:"9321098765", dept:"Road Works",    status:"Escalated",   priority:"Critical", sla:-3, location:"T Nagar, Chennai",        desc:"Road cave-in near school. Emergency situation. Children at risk.", created:"2025-03-01", assigned:"Officer Suresh" },
];

const DEPTS = [
  { id:1, name:"Water Supply",  icon:"💧", complaints:342, resolved:298, pending:44,  color:T.cyan,   officer:"Suresh Mehta",   email:"water@pscrm.gov" },
  { id:2, name:"Road Works",    icon:"🛣️", complaints:521, resolved:401, pending:120, color:T.amber,  officer:"Priti Das",      email:"roads@pscrm.gov" },
  { id:3, name:"Electricity",   icon:"⚡", complaints:189, resolved:175, pending:14,  color:"#FBBF24", officer:"Ravi Rao",       email:"elec@pscrm.gov"  },
  { id:4, name:"Sanitation",    icon:"🗑️", complaints:267, resolved:230, pending:37,  color:T.green,  officer:"Anil Sharma",    email:"sanit@pscrm.gov" },
  { id:5, name:"Public Health", icon:"🏥", complaints:98,  resolved:91,  pending:7,   color:T.red,    officer:"Dr. Lata Singh", email:"health@pscrm.gov"},
  { id:6, name:"Transport",     icon:"🚌", complaints:445, resolved:378, pending:67,  color:T.purple, officer:"Harjit Gill",    email:"trans@pscrm.gov" },
];

const MONTHLY = [
  {m:"Aug",v:820},{m:"Sep",v:940},{m:"Oct",v:1120},{m:"Nov",v:980},
  {m:"Dec",v:870},{m:"Jan",v:1240},{m:"Feb",v:1380},{m:"Mar",v:1190},
];

/* ═══════════════════════════════════════════════════════════════
   SHARED HELPERS
═══════════════════════════════════════════════════════════════ */
const Badge = ({ status }) => {
  const m = { "Resolved":["#00F5A0","#00F5A022"], "In Progress":["#00E5FF","#00E5FF22"], "Escalated":["#FF3860","#FF386022"], "Pending":["#FFB800","#FFB80022"] };
  const [fg, bg] = m[status] || [T.sub, T.muted+"22"];
  return <span style={{ background:bg, color:fg, padding:"3px 11px", borderRadius:100, fontSize:11, fontWeight:700 }}>{status}</span>;
};

const PriorityDot = ({ p }) => {
  const c = { Critical:T.red, High:T.amber, Medium:T.cyan, Low:T.green };
  return <span style={{ display:"flex", alignItems:"center", gap:5, color:c[p]||T.sub, fontSize:12, fontWeight:600 }}>
    <span style={{ width:6, height:6, borderRadius:"50%", background:c[p], display:"inline-block" }}/>{p}
  </span>;
};

/* ═══════════════════════════════════════════════════════════════
   LANDING — PARTICLES
═══════════════════════════════════════════════════════════════ */
function Particles() {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth, H = canvas.height = window.innerHeight;
    window.addEventListener("resize", () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3,
      r: Math.random()*1.4+.5,
      col: [T.cyan, T.blue, T.purple, T.green][Math.floor(Math.random()*4)],
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.col+"99"; ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<110){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=T.cyan+Math.floor((1-d/110)*38).toString(16).padStart(2,"0");
          ctx.lineWidth=.4; ctx.stroke(); }
      }));
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}/>;
}

/* ─── SCROLL REVEAL ──────────────────────────────────────────── */
function Reveal({ children, delay=0 }) {
  const ref = useRef(); const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting){setV(true);obs.disconnect();} },{threshold:.12});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[]);
  return <div ref={ref} style={{ opacity:v?1:0, transform:v?"translateY(0)":"translateY(28px)", transition:`opacity .65s ease ${delay}s, transform .65s ease ${delay}s` }}>{children}</div>;
}

/* ─── ANIMATED COUNTER ───────────────────────────────────────── */
function Counter({ to, suffix="" }) {
  const [val, setVal] = useState(0); const ref = useRef();
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){
        const s=Date.now(),d=1800,tick=()=>{
          const p=Math.min((Date.now()-s)/d,1),e2=1-Math.pow(1-p,3);
          setVal(Math.floor(e2*to)); if(p<1)requestAnimationFrame(tick);
        }; requestAnimationFrame(tick); obs.disconnect();
      }
    },{threshold:.5});
    if(ref.current)obs.observe(ref.current); return()=>obs.disconnect();
  },[to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════════ */
function LandingPage({ onEnter }) {

  /* typewriter */
  const words = ["Grievances.","Complaints.","Requests.","Feedback."];
  const [typed, setTyped] = useState(""); const [wi, setWi] = useState(0);
  useEffect(()=>{
    let i=0,del=false;
    const iv=setInterval(()=>{
      const w=words[wi%words.length];
      if(!del){setTyped(w.slice(0,i+1));i++;if(i===w.length)del=true;}
      else{setTyped(w.slice(0,i-1));i--;if(i===0){del=false;setWi(x=>x+1);}}
    },del?60:95);
    return()=>clearInterval(iv);
  },[wi]);

  /* sticky nav */
  const [scrolled, setScrolled]=useState(false);
  useEffect(()=>{
    try {
      const h=()=>{ try{setScrolled(window.scrollY>40);}catch(e){} };
      window.addEventListener("scroll",h); return()=>window.removeEventListener("scroll",h);
    } catch(e){}
  },[]);

  const btn = (label, primary, onClick) => (
    <button onClick={onClick} style={{
      background: primary ? `linear-gradient(135deg,${T.cyan},${T.blue})` : "transparent",
      border: primary ? "none" : `1px solid ${T.border}`,
      color: primary ? "#fff" : T.text, borderRadius:12, padding:"15px 36px",
      fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
      boxShadow: primary ? `0 8px 32px ${T.cyan}44` : "none",
      transition:"all .2s",
    }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; if(primary)e.currentTarget.style.boxShadow=`0 16px 48px ${T.cyan}66`; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform="none"; if(primary)e.currentTarget.style.boxShadow=`0 8px 32px ${T.cyan}44`; }}>
      {label}
    </button>
  );

  const sectionTag = (label, col) => (
    <div style={{ display:"inline-block", background:col+"12", border:`1px solid ${col}33`, borderRadius:100, padding:"5px 18px", color:col, fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>{label}</div>
  );

  const features = [
    {icon:"⚡",title:"Auto-Routing Engine",desc:"AI classifies and routes every complaint to the exact department and officer within seconds.",col:T.cyan},
    {icon:"⏱️",title:"SLA Enforcement",desc:"Configurable deadlines per priority. Auto-escalation fires the moment a breach is detected.",col:T.amber},
    {icon:"📡",title:"Real-Time Tracking",desc:"Citizens get live SMS and WhatsApp updates at every status change. Full transparency.",col:T.green},
    {icon:"🌐",title:"12 Language Support",desc:"Hindi, English, Tamil, Telugu, Kannada, Bengali and more. Voice IVR for all citizens.",col:T.purple},
    {icon:"🗺️",title:"Geographic Heatmaps",desc:"Complaint density overlays show where problems cluster — enabling proactive governance.",col:T.blue},
    {icon:"📊",title:"Predictive Analytics",desc:"Historical patterns surface before issues become crises. Full KPI dashboards.",col:T.red},
    {icon:"🔐",title:"Role-Based Security",desc:"Granular RBAC for Citizens, Officers, Supervisors and Admins. All actions audit-logged.",col:T.cyan},
    {icon:"📱",title:"Omni-Channel Intake",desc:"Web portal, mobile app, WhatsApp, and voice IVR — citizens reach PS-CRM from anywhere.",col:T.green},
  ];

  const steps = [
    {n:"01",title:"Citizen Files Complaint",desc:"Via web, mobile app, WhatsApp, or voice IVR. In any of 12 languages.",icon:"📝",col:T.cyan},
    {n:"02",title:"AI Auto-Routes",desc:"NLP classifies the complaint, matches to the correct department, assigns priority and SLA.",icon:"🤖",col:T.purple},
    {n:"03",title:"Officer Assigned",desc:"Department officer is notified instantly. Complaint appears on their dashboard.",icon:"👮",col:T.blue},
    {n:"04",title:"Real-Time Updates",desc:"Every status change triggers SMS + WhatsApp to the citizen. Full transparency.",icon:"📲",col:T.green},
    {n:"05",title:"SLA Monitored",desc:"Engine tracks deadlines continuously. Breach triggers auto-escalation to supervisor.",icon:"⏱️",col:T.amber},
    {n:"06",title:"Resolved & Rated",desc:"Citizen rates the resolution. Feedback feeds performance dashboards and officer KPIs.",icon:"⭐",col:T.red},
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:T.bg, color:T.text, overflowX:"hidden" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        background: scrolled ? T.surf+"EE" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
        transition:"all .4s", padding:"0 60px", height:68,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${T.cyan},${T.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:`0 0 20px ${T.cyan}55` }}>🏛️</div>
          <div>
            <div style={{ color:T.text, fontWeight:900, fontSize:16, fontFamily:"'Syne',sans-serif", letterSpacing:1 }}>PS-CRM</div>
            <div style={{ color:T.sub, fontSize:9, letterSpacing:3, textTransform:"uppercase" }}>Gov Platform</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:32, alignItems:"center" }}>
          {["Features","How It Works","Departments","Stats"].map(l=>(
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{ color:T.sub, fontSize:13, fontWeight:600, textDecoration:"none", transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color=T.cyan} onMouseLeave={e=>e.target.style.color=T.sub}>{l}</a>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub, borderRadius:9, padding:"8px 20px", fontSize:13, cursor:"pointer", fontWeight:600 }}>Sign In</button>
          <button onClick={onEnter} style={{
            background:`linear-gradient(135deg,${T.cyan},${T.blue})`, border:"none", color:"#fff",
            borderRadius:9, padding:"8px 22px", fontSize:13, cursor:"pointer", fontWeight:700,
            boxShadow:`0 4px 18px ${T.cyan}44`, transition:"all .2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 8px 28px ${T.cyan}66`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 18px ${T.cyan}44`;}}>
            Open Dashboard →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", background: T.bg }}>
        <div style={{ position:"relative", textAlign:"center", maxWidth:860, padding:"0 24px", zIndex:2 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:T.cyan+"12", border:`1px solid ${T.cyan}33`, borderRadius:100, padding:"6px 18px", marginBottom:32, animation:"fadeUp .8s ease both" }}>
            <span style={{ color:T.cyan, fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>Government Infrastructure · India 2025</span>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(42px,6vw,78px)", fontWeight:900, color:T.text, lineHeight:1.05, margin:"0 0 14px", animation:"fadeUp .9s .1s ease both", letterSpacing:-2 }}>
            One Platform.<br/>
            <span style={{ background:`linear-gradient(90deg,${T.cyan},${T.blue},${T.purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Every Civic&nbsp;</span>
            <span style={{ color:T.text }}>{typed}</span>
            <span style={{ color:T.cyan, animation:"blink 1s infinite" }}>|</span>
          </h1>
          <p style={{ color:T.sub, fontSize:"clamp(15px,2vw,18px)", maxWidth:600, margin:"0 auto 40px", lineHeight:1.7, animation:"fadeUp 1s .2s ease both" }}>
            PS-CRM centralizes all citizen grievances across departments — with AI-powered routing, real-time SLA tracking, multilingual support, and a live command center.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", animation:"fadeUp 1s .3s ease both" }}>
            {btn("🚀 Launch Dashboard", true, onEnter)}
            {btn("📋 File a Complaint", false, onEnter)}
          </div>
          <div style={{ display:"flex", gap:40, justifyContent:"center", marginTop:60, animation:"fadeUp 1s .4s ease both" }}>
            {[["12,847+","Complaints Filed"],["94%","Resolution Rate"],["2.4d","Avg Resolution Time"],["6","Departments"]].map(([v,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ color:T.cyan, fontSize:24, fontWeight:900, fontFamily:"'Syne',sans-serif" }}>{v}</div>
                <div style={{ color:T.sub, fontSize:11, marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:6, animation:"bounce 2s infinite" }}>
          <span style={{ color:T.sub, fontSize:11, letterSpacing:2, textTransform:"uppercase" }}>Scroll</span>
          <div style={{ width:1, height:40, background:`linear-gradient(${T.cyan},transparent)` }}/>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background:T.cyan+"0D", borderTop:`1px solid ${T.cyan}22`, borderBottom:`1px solid ${T.cyan}22`, padding:"10px 0", overflow:"hidden" }}>
        <div style={{ display:"flex", gap:80, whiteSpace:"nowrap", animation:"ticker 35s linear infinite" }}>
          {[...Array(2)].flatMap(()=>["💧 Water Supply · Delhi — Resolved in 1.8d","⚡ Electricity · Hyderabad — Escalated → Supervisor assigned","🛣️ Road Works · Bangalore — Pothole repair completed","🗑️ Sanitation · Mumbai — Garbage pickup scheduled","🚌 Transport · Chandigarh — Route restored","🏥 Public Health · Hyderabad — Mosquito fogging done"]).map((t,i)=>(
            <span key={i} style={{ color:T.sub, fontSize:12 }}><span style={{ color:T.cyan, marginRight:6 }}>▸</span>{t}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background:T.bg, padding:"100px 60px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              {sectionTag("Platform Capabilities", T.cyan)}
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(30px,4vw,50px)", fontWeight:900, color:T.text, margin:"0 0 14px", letterSpacing:-1 }}>Built for Scale. Designed for People.</h2>
              <p style={{ color:T.sub, fontSize:15, maxWidth:500, margin:"0 auto", lineHeight:1.7 }}>Every feature engineered to close the gap between citizens and their government.</p>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {features.map((f,i)=>(
              <Reveal key={i} delay={i*.06}>
                <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"26px 22px", height:"100%", cursor:"default", transition:"all .25s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=f.col+"66"; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 16px 40px ${f.col}1A`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                  <div style={{ width:46, height:46, borderRadius:12, background:f.col+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>{f.icon}</div>
                  <div style={{ color:T.text, fontWeight:800, fontSize:14, marginBottom:8, fontFamily:"'Syne',sans-serif" }}>{f.title}</div>
                  <div style={{ color:T.sub, fontSize:13, lineHeight:1.6 }}>{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background:T.surf, padding:"100px 60px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              {sectionTag("Workflow", T.green)}
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(30px,4vw,50px)", fontWeight:900, color:T.text, margin:0, letterSpacing:-1 }}>From Complaint to Resolution</h2>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {steps.map((s,i)=>(
              <Reveal key={i} delay={i*.08}>
                <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"28px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:-16, right:-10, fontSize:76, fontWeight:900, color:s.col+"0C", fontFamily:"'Syne',sans-serif", lineHeight:1, userSelect:"none" }}>{s.n}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:s.col+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
                    <span style={{ color:s.col, fontSize:11, fontWeight:800, letterSpacing:1 }}>STEP {s.n}</span>
                  </div>
                  <div style={{ color:T.text, fontWeight:800, fontSize:15, marginBottom:8, fontFamily:"'Syne',sans-serif" }}>{s.title}</div>
                  <div style={{ color:T.sub, fontSize:13, lineHeight:1.6 }}>{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS ── */}
      <section id="departments" style={{ background:T.bg, padding:"100px 60px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              {sectionTag("Coverage", T.purple)}
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(30px,4vw,50px)", fontWeight:900, color:T.text, margin:0, letterSpacing:-1 }}>6 Departments. One Platform.</h2>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:14 }}>
            {DEPTS.map((d,i)=>{
              const rate=Math.round((d.resolved/d.complaints)*100);
              const circ=2*Math.PI*22, fill=circ*(rate/100);
              return (
                <Reveal key={i} delay={i*.07}>
                  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"24px 14px", textAlign:"center", transition:"all .25s", cursor:"default" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=d.color+"66"; e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow=`0 20px 50px ${d.color}22`; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                    <div style={{ fontSize:34, marginBottom:10 }}>{d.icon}</div>
                    <div style={{ color:T.text, fontSize:12, fontWeight:800, marginBottom:14, fontFamily:"'Syne',sans-serif" }}>{d.name}</div>
                    <svg width="58" height="58" viewBox="0 0 58 58" style={{ marginBottom:8 }}>
                      <circle cx="29" cy="29" r="22" fill="none" stroke={T.border} strokeWidth="5"/>
                      <circle cx="29" cy="29" r="22" fill="none" stroke={d.color} strokeWidth="5"
                        strokeDasharray={`${fill} ${circ-fill}`} strokeLinecap="round" transform="rotate(-90 29 29)"/>
                      <text x="29" y="34" textAnchor="middle" fill={d.color} fontSize="11" fontWeight="800" fontFamily="monospace">{rate}%</text>
                    </svg>
                    <div style={{ color:T.sub, fontSize:10 }}>{d.complaints} complaints</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ background:`linear-gradient(135deg,${T.surf},${T.card})`, padding:"100px 60px", borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(30px,4vw,50px)", fontWeight:900, color:T.text, margin:0, letterSpacing:-1 }}>
                Numbers That <span style={{ background:`linear-gradient(90deg,${T.cyan},${T.blue})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Matter.</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {[[12847,"+","Total Complaints Filed","Across all channels",T.cyan],[94,"%","Resolution Rate","This quarter",T.green],[6,"","Active Departments","More coming soon",T.purple],[12,"","Languages Supported","Including voice IVR",T.amber],[47,"k","Citizens Served","Unique users",T.blue],[284,"","Resolved Today","Live count",T.red]].map(([to,suf,label,sub,col],i)=>(
              <Reveal key={i} delay={i*.08}>
                <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:16, padding:"36px 28px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", bottom:-20, right:-10, width:80, height:80, borderRadius:"50%", background:col+"0A" }}/>
                  <div style={{ fontSize:"clamp(38px,4vw,52px)", fontWeight:900, color:col, fontFamily:"'Syne',sans-serif", letterSpacing:-2, lineHeight:1 }}>
                    <Counter to={to} suffix={suf}/>
                  </div>
                  <div style={{ color:T.text, fontSize:16, fontWeight:700, marginTop:10, fontFamily:"'Syne',sans-serif" }}>{label}</div>
                  <div style={{ color:T.sub, fontSize:12, marginTop:5 }}>{sub}</div>
                  <div style={{ height:2, background:T.border, borderRadius:2, marginTop:18 }}>
                    <div style={{ height:"100%", width:"60%", background:col, borderRadius:2 }}/>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:T.bg, padding:"100px 60px" }}>
        <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
          <Reveal>
            <div style={{ background:`linear-gradient(135deg,${T.card},${T.surf})`, border:`1px solid ${T.border}`, borderRadius:28, padding:"64px 48px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-60, left:"50%", transform:"translateX(-50%)", width:400, height:200, borderRadius:"50%", background:`radial-gradient(circle,${T.cyan}18,transparent)`, pointerEvents:"none" }}/>
              {sectionTag("Get Started", T.cyan)}
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(28px,4vw,50px)", fontWeight:900, color:T.text, margin:"0 0 16px", letterSpacing:-1 }}>Ready to Transform<br/>Civic Governance?</h2>
              <p style={{ color:T.sub, fontSize:15, maxWidth:460, margin:"0 auto 36px", lineHeight:1.7 }}>Join thousands of citizens and officers using PS-CRM to make public service faster, fairer, and fully transparent.</p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                {btn("🚀 Open Dashboard", true, onEnter)}
                {btn("📋 File a Complaint", false, onEnter)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:T.surf, borderTop:`1px solid ${T.border}`, padding:"48px 60px 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:40 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${T.cyan},${T.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏛️</div>
                <div style={{ color:T.text, fontWeight:900, fontSize:14, fontFamily:"'Syne',sans-serif" }}>PS-CRM</div>
              </div>
              <p style={{ color:T.sub, fontSize:13, lineHeight:1.7, maxWidth:260 }}>Smart Public Service CRM — building transparent, scalable civic infrastructure for modern India.</p>
            </div>
            {[["Platform",["Dashboard","File Complaint","Track Complaint","Analytics"]],["Departments",["Water Supply","Road Works","Electricity","Sanitation"]],["Support",["Help Center","API Docs","Contact Us","Status Page"]]].map(([h,links])=>(
              <div key={h}>
                <div style={{ color:T.text, fontWeight:800, fontSize:13, marginBottom:16, fontFamily:"'Syne',sans-serif" }}>{h}</div>
                {links.map(l=>(
                  <div key={l} style={{ color:T.sub, fontSize:13, marginBottom:10, cursor:"pointer", transition:"color .15s" }}
                    onMouseEnter={e=>e.target.style.color=T.cyan} onMouseLeave={e=>e.target.style.color=T.sub}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ color:T.muted, fontSize:12 }}>© 2025 PS-CRM · Government of India · All rights reserved</div>
            <div style={{ display:"flex", gap:6 }}>
              <span style={{ background:T.green+"18", color:T.green, padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>System Operational</span>
              <span style={{ background:T.muted+"22", color:T.sub, padding:"3px 10px", borderRadius:100, fontSize:11 }}>v2.1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
const NAV = [
  {id:"dashboard",icon:"▦",label:"Dashboard"},
  {id:"complaints",icon:"≡",label:"Complaints"},
  {id:"file",icon:"+",label:"File Complaint"},
  {id:"track",icon:"◎",label:"Track Complaint"},
  {id:"depts",icon:"⊞",label:"Departments"},
  {id:"analytics",icon:"∿",label:"Analytics"},
  {id:"escalations",icon:"⚑",label:"Escalations"},
  {id:"profile",icon:"◉",label:"My Profile"},
];

function Sidebar({ page, setPage, onBackToLanding }) {
  return (
    <aside style={{ width:230, minHeight:"100vh", background:T.surf, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", position:"fixed", left:0, top:0, bottom:0, zIndex:200 }}>
      <div style={{ padding:"20px 18px 18px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:38, height:38, borderRadius:9, background:`linear-gradient(135deg,${T.cyan},${T.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, boxShadow:`0 0 16px ${T.cyan}44` }}>🏛️</div>
          <div>
            <div style={{ color:T.text, fontWeight:900, fontSize:14, fontFamily:"'Syne',sans-serif", letterSpacing:.5 }}>PS-CRM</div>
            <div style={{ color:T.sub, fontSize:9, letterSpacing:2, textTransform:"uppercase" }}>Gov Platform</div>
          </div>
        </div>
        <button onClick={onBackToLanding} style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, color:T.sub, borderRadius:8, padding:"6px 12px", fontSize:11, cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:6, transition:"all .15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.cyan+"44"; e.currentTarget.style.color=T.cyan; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.sub; }}>
          ← Back to Home
        </button>
      </div>
      <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
        {NAV.map(n=>{
          const active=page===n.id;
          return (
            <button key={n.id} onClick={()=>setPage(n.id)} style={{
              display:"flex", alignItems:"center", gap:10, width:"100%",
              padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer",
              background:active?`linear-gradient(90deg,${T.cyan}18,transparent)`:"transparent",
              color:active?T.cyan:T.sub, fontSize:13, fontWeight:active?700:500,
              marginBottom:2, textAlign:"left",
              borderLeft:active?`2px solid ${T.cyan}`:"2px solid transparent",
              transition:"all .15s",
            }}>
              <span style={{ width:18, textAlign:"center", fontSize:15, opacity:active?1:.6 }}>{n.icon}</span>
              {n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:"0 14px 18px" }}>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#A78BFA,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:13 }}>AC</div>
          <div>
            <div style={{ color:T.text, fontSize:12, fontWeight:700 }}>Admin Central</div>
            <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:T.green, display:"inline-block" }}/>
              <span style={{ color:T.green, fontSize:10, fontWeight:600 }}>Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── DASHBOARD PAGES ─────────────────────────────────────────── */
function DBDashboard({ setPage }) {
  const stats = [
    {label:"Total Complaints",value:"12,847",delta:"+8.3%",icon:"📋",col:T.cyan},
    {label:"Resolved Today",value:"284",delta:"+12%",icon:"✅",col:T.green},
    {label:"Avg Resolution",value:"2.4d",delta:"-0.3d",icon:"⏱️",col:T.purple},
    {label:"SLA Breached",value:"47",delta:"-23%",icon:"🚨",col:T.red},
  ];
  const channels=[
    {ch:"Web Portal",n:4821,pct:37.5,col:T.cyan},{ch:"Mobile App",n:3912,pct:30.4,col:T.blue},
    {ch:"WhatsApp",n:2341,pct:18.2,col:T.green},{ch:"Voice / IVR",n:1773,pct:13.8,col:T.purple},
  ];
  return (
    <div style={{ padding:"28px 34px" }}>
      <div style={{ marginBottom:26 }}>
        <h1 style={{ color:T.text, fontSize:24, fontWeight:900, margin:0, fontFamily:"'Syne',sans-serif" }}>Command Center</h1>
        <p style={{ color:T.sub, margin:"4px 0 0", fontSize:13 }}>Real-time civic infrastructure overview · {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {stats.map((s,i)=>(
          <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"20px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:`${s.col}0D` }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:100, background:T.green+"22", color:T.green }}>{s.delta}</span>
            </div>
            <div style={{ color:T.text, fontSize:26, fontWeight:900, letterSpacing:-1, fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
            <div style={{ color:T.sub, fontSize:12, marginTop:4 }}>{s.label}</div>
            <div style={{ height:2, background:T.border, borderRadius:2, marginTop:12 }}>
              <div style={{ height:"100%", width:`${62+i*8}%`, background:s.col, borderRadius:2 }}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:18, marginBottom:18 }}>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ color:T.text, fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif" }}>Live Complaint Feed</div>
            <button onClick={()=>setPage("complaints")} style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.cyan, borderRadius:7, padding:"5px 13px", fontSize:12, cursor:"pointer", fontWeight:600 }}>View All →</button>
          </div>
          {COMPLAINTS.slice(0,6).map((c,i)=>(
            <div key={c.id} style={{ display:"grid", gridTemplateColumns:"92px 126px 1fr 106px 86px", alignItems:"center", padding:"12px 20px", gap:10, borderBottom:i<5?`1px solid ${T.border}`:"none" }}>
              <span style={{ color:T.cyan, fontFamily:"monospace", fontSize:12, fontWeight:700 }}>{c.id}</span>
              <span style={{ color:T.text, fontSize:13 }}>{c.citizen}</span>
              <span style={{ color:T.sub, fontSize:12 }}>{c.dept} · {c.location.split(",")[0]}</span>
              <Badge status={c.status}/>
              <PriorityDot p={c.priority}/>
            </div>
          ))}
        </div>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"20px" }}>
          <div style={{ color:T.text, fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>Intake Channels</div>
          <div style={{ color:T.sub, fontSize:12, marginBottom:18 }}>Complaint source distribution</div>
          {channels.map((ch,i)=>(
            <div key={i} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ color:T.text, fontSize:12, fontWeight:600 }}>{ch.ch}</span>
                <span style={{ color:T.sub, fontSize:11 }}>{ch.n.toLocaleString()} ({ch.pct}%)</span>
              </div>
              <div style={{ height:6, background:T.border, borderRadius:3 }}>
                <div style={{ height:"100%", width:`${ch.pct}%`, background:`linear-gradient(90deg,${ch.col},${ch.col}88)`, borderRadius:3 }}/>
              </div>
            </div>
          ))}
          <div style={{ marginTop:18, padding:12, background:T.cyan+"10", borderRadius:9, border:`1px solid ${T.cyan}22` }}>
            <div style={{ color:T.cyan, fontSize:11, fontWeight:700, marginBottom:3 }}>🌐 Multilingual Active</div>
            <div style={{ color:T.sub, fontSize:11 }}>Hindi · English · Tamil · Telugu + 8 more</div>
          </div>
        </div>
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"20px" }}>
        <div style={{ color:T.text, fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif", marginBottom:16 }}>Department Performance</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
          {DEPTS.map((d,i)=>{
            const rate=Math.round((d.resolved/d.complaints)*100);
            const circ=2*Math.PI*18, fill=circ*(rate/100);
            return (
              <div key={i} style={{ background:T.surf, border:`1px solid ${T.border}`, borderRadius:11, padding:"16px 10px", textAlign:"center" }}>
                <div style={{ fontSize:26, marginBottom:7 }}>{d.icon}</div>
                <div style={{ color:T.text, fontSize:11, fontWeight:700, marginBottom:10, fontFamily:"'Syne',sans-serif" }}>{d.name}</div>
                <svg width="48" height="48" viewBox="0 0 48 48" style={{ marginBottom:5 }}>
                  <circle cx="24" cy="24" r="18" fill="none" stroke={T.border} strokeWidth="4"/>
                  <circle cx="24" cy="24" r="18" fill="none" stroke={d.color} strokeWidth="4"
                    strokeDasharray={`${fill} ${circ-fill}`} strokeLinecap="round" transform="rotate(-90 24 24)"/>
                  <text x="24" y="28" textAnchor="middle" fill={d.color} fontSize="9" fontWeight="800" fontFamily="monospace">{rate}%</text>
                </svg>
                <div style={{ color:T.sub, fontSize:10 }}>{d.complaints} total</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DBComplaints() {
  const [filter, setFilter]=useState("All");
  const [search, setSearch]=useState("");
  const [selected, setSelected]=useState(null);
  const filtered=COMPLAINTS.filter(c=>(filter==="All"||c.status===filter)&&(c.id+c.citizen+c.dept+c.location).toLowerCase().includes(search.toLowerCase()));

  if(selected) return (
    <div style={{ padding:"28px 34px" }}>
      <button onClick={()=>setSelected(null)} style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub, borderRadius:7, padding:"7px 15px", fontSize:13, cursor:"pointer", marginBottom:22, fontWeight:600 }}>← Back to List</button>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:18 }}>
        <div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"26px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
              <div>
                <span style={{ color:T.cyan, fontFamily:"monospace", fontSize:13, fontWeight:700 }}>{selected.id}</span>
                <h2 style={{ color:T.text, fontSize:20, fontWeight:900, margin:"6px 0 4px", fontFamily:"'Syne',sans-serif" }}>{selected.dept} Complaint</h2>
                <span style={{ color:T.sub, fontSize:13 }}>Filed by {selected.citizen} · {selected.created}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:7 }}>
                <Badge status={selected.status}/><PriorityDot p={selected.priority}/>
              </div>
            </div>
            <div style={{ background:T.surf, borderRadius:9, padding:"14px", marginBottom:14 }}>
              <div style={{ color:T.sub, fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:7 }}>Description</div>
              <p style={{ color:T.text, fontSize:14, lineHeight:1.7, margin:0 }}>{selected.desc}</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[["📍 Location",selected.location],["🏛️ Department",selected.dept],["👮 Assigned To",selected.assigned],["📱 Phone",selected.phone]].map(([k,v])=>(
                <div key={k} style={{ background:T.surf, borderRadius:9, padding:"11px 14px" }}>
                  <div style={{ color:T.sub, fontSize:11, marginBottom:3 }}>{k}</div>
                  <div style={{ color:T.text, fontSize:13, fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"20px" }}>
            <div style={{ color:T.text, fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif", marginBottom:16 }}>Activity Timeline</div>
            {[
              {time:"Mar 07, 09:14",action:"Complaint Filed",note:"Submitted via Web Portal",col:T.cyan},
              {time:"Mar 07, 09:15",action:"Auto-routed",note:`Assigned to ${selected.dept} department`,col:T.purple},
              {time:"Mar 07, 11:30",action:"Acknowledged",note:`${selected.assigned} picked up`,col:T.amber},
              ...(selected.status==="Resolved"?[{time:"Mar 08, 15:00",action:"Resolved",note:"Issue resolved. Citizen notified via SMS.",col:T.green}]:[]),
              ...(selected.status==="Escalated"?[{time:"Mar 08, 09:00",action:"SLA Breached",note:"Auto-escalated to supervisor",col:T.red}]:[]),
            ].map((t,i,arr)=>(
              <div key={i} style={{ display:"flex", gap:12, paddingBottom:14 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:t.col, flexShrink:0, marginTop:3 }}/>
                  {i<arr.length-1&&<div style={{ width:1, flex:1, background:T.border, marginTop:3 }}/>}
                </div>
                <div>
                  <div style={{ color:T.text, fontSize:13, fontWeight:700 }}>{t.action}</div>
                  <div style={{ color:T.sub, fontSize:12, marginTop:2 }}>{t.note}</div>
                  <div style={{ color:T.muted, fontSize:11, marginTop:2 }}>{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"18px" }}>
            <div style={{ color:T.text, fontWeight:800, fontSize:14, marginBottom:12, fontFamily:"'Syne',sans-serif" }}>SLA Status</div>
            <div style={{ textAlign:"center", padding:"16px 0" }}>
              <div style={{ fontSize:34, fontWeight:900, color:selected.sla<0?T.red:selected.sla<=1?T.amber:T.green, fontFamily:"'Syne',sans-serif" }}>
                {selected.sla<0?`${Math.abs(selected.sla)}d`:`${selected.sla}d`}
              </div>
              <div style={{ color:T.sub, fontSize:12, marginTop:3 }}>{selected.sla<0?"Overdue":"Remaining"}</div>
              <div style={{ marginTop:14, height:7, background:T.border, borderRadius:3 }}>
                <div style={{ height:"100%", width:selected.sla<0?"100%":`${Math.max(10,(5-selected.sla)/5*100)}%`, background:selected.sla<0?T.red:selected.sla<=1?T.amber:T.green, borderRadius:3 }}/>
              </div>
            </div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"18px" }}>
            <div style={{ color:T.text, fontWeight:800, fontSize:14, marginBottom:12, fontFamily:"'Syne',sans-serif" }}>Quick Actions</div>
            {["Reassign Officer","Escalate to Supervisor","Add Internal Note","Mark Resolved","Send SMS Update"].map((a,i)=>(
              <button key={i} style={{ display:"block", width:"100%", padding:"9px 12px", marginBottom:7, background:T.surf, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:12, cursor:"pointer", textAlign:"left", fontWeight:500 }}>{a}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding:"28px 34px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ display:"flex", gap:6 }}>
          {["All","Pending","In Progress","Resolved","Escalated"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{ padding:"7px 15px", borderRadius:100, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:filter===s?`linear-gradient(90deg,${T.cyan},${T.blue})`:T.card, color:filter===s?"#fff":T.sub }}>{s}</button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search complaints…" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 14px", color:T.text, fontSize:13, outline:"none", width:210 }}/>
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"92px 126px 96px 1fr 108px 86px 88px", padding:"10px 20px", borderBottom:`1px solid ${T.border}`, color:T.sub, fontSize:11, fontWeight:700, letterSpacing:.8, textTransform:"uppercase" }}>
          <span>ID</span><span>Citizen</span><span>Dept</span><span>Location</span><span>Status</span><span>Priority</span><span>SLA</span>
        </div>
        {filtered.length===0&&<div style={{ padding:"28px", textAlign:"center", color:T.sub }}>No complaints found</div>}
        {filtered.map((c,i)=>(
          <div key={c.id} onClick={()=>setSelected(c)} style={{ display:"grid", gridTemplateColumns:"92px 126px 96px 1fr 108px 86px 88px", alignItems:"center", padding:"13px 20px", gap:10, cursor:"pointer", borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none", transition:"background .15s" }}
            onMouseEnter={e=>e.currentTarget.style.background=T.surf} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{ color:T.cyan, fontFamily:"monospace", fontSize:12, fontWeight:700 }}>{c.id}</span>
            <span style={{ color:T.text, fontSize:13 }}>{c.citizen}</span>
            <span style={{ color:T.sub, fontSize:12 }}>{c.dept}</span>
            <span style={{ color:T.sub, fontSize:12 }}>{c.location}</span>
            <Badge status={c.status}/>
            <PriorityDot p={c.priority}/>
            <span style={{ color:c.sla<0?T.red:c.sla<=1?T.amber:T.green, fontSize:12, fontWeight:700 }}>{c.sla<0?`${Math.abs(c.sla)}d over`:`${c.sla}d left`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DBFile() {
  const [step,setStep]=useState(1);
  const [done,setDone]=useState(false);
  const [form,setForm]=useState({name:"",phone:"",email:"",dept:"",priority:"Medium",title:"",desc:"",location:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const ticketId=useRef(`CMP-${2410+Math.floor(Math.random()*90)}`).current;
  const inp={width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 13px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box"};
  const lbl={color:T.sub,fontSize:11,fontWeight:700,marginBottom:5,display:"block",letterSpacing:.8,textTransform:"uppercase"};
  if(done) return (
    <div style={{ padding:"28px 34px", display:"flex", justifyContent:"center" }}>
      <div style={{ maxWidth:520, width:"100%", textAlign:"center", paddingTop:30 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:T.green+"22", border:`2px solid ${T.green}`, margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>✅</div>
        <h2 style={{ color:T.text, fontSize:24, fontWeight:900, margin:"0 0 8px", fontFamily:"'Syne',sans-serif" }}>Complaint Registered!</h2>
        <p style={{ color:T.sub, marginBottom:24, fontSize:14 }}>Auto-routed to the {form.dept||"relevant"} department.</p>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:22, textAlign:"left", marginBottom:22 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["Ticket ID",ticketId],["Department",form.dept||"Water Supply"],["Priority",form.priority],["SLA","3 working days"],["Assigned","Auto-routing…"],["Updates","SMS + Email"]].map(([k,v])=>(
              <div key={k}><div style={{ color:T.sub, fontSize:11, marginBottom:3 }}>{k}</div><div style={{ color:k==="Ticket ID"?T.cyan:T.text, fontWeight:700, fontSize:13, fontFamily:k==="Ticket ID"?"monospace":"inherit" }}>{v}</div></div>
            ))}
          </div>
        </div>
        <button onClick={()=>{setDone(false);setStep(1);setForm({name:"",phone:"",email:"",dept:"",priority:"Medium",title:"",desc:"",location:""});}}
          style={{ background:`linear-gradient(90deg,${T.cyan},${T.blue})`, color:"#fff", border:"none", borderRadius:9, padding:"11px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>File Another</button>
      </div>
    </div>
  );
  return (
    <div style={{ padding:"28px 34px" }}>
      <div style={{ maxWidth:640, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", marginBottom:26, gap:0 }}>
          {["Citizen Info","Complaint Details","Review & Submit"].map((s,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:step>i+1?T.green:step===i+1?`linear-gradient(135deg,${T.cyan},${T.blue})`:T.border, color:step>=i+1?"#fff":T.sub, fontSize:12, fontWeight:800, boxShadow:step===i+1?`0 0 12px ${T.cyan}66`:"none" }}>{step>i+1?"✓":i+1}</div>
                <span style={{ color:step===i+1?T.text:T.sub, fontSize:10, fontWeight:600, whiteSpace:"nowrap" }}>{s}</span>
              </div>
              {i<2&&<div style={{ flex:1, height:1, background:step>i+1?T.cyan:T.border, margin:"0 6px", marginBottom:16 }}/>}
            </div>
          ))}
        </div>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:26 }}>
          {step===1&&(
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
              <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Full Name *</label><input style={inp} value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Your full name"/></div>
              <div><label style={lbl}>Mobile *</label><input style={inp} value={form.phone} onChange={e=>upd("phone",e.target.value)} placeholder="+91 98765 43210"/></div>
              <div><label style={lbl}>Email</label><input style={inp} value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="email@example.com"/></div>
              <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Address *</label><input style={inp} value={form.location} onChange={e=>upd("location",e.target.value)} placeholder="Street, Area, City, Pincode"/></div>
            </div>
          )}
          {step===2&&(
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
              <div><label style={lbl}>Department *</label>
                <select style={inp} value={form.dept} onChange={e=>upd("dept",e.target.value)}>
                  <option value="">Select Department</option>
                  {DEPTS.map(d=><option key={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Priority</label>
                <select style={inp} value={form.priority} onChange={e=>upd("priority",e.target.value)}>
                  {["Low","Medium","High","Critical"].map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e=>upd("title",e.target.value)} placeholder="Brief summary of the issue"/></div>
              <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Description *</label><textarea style={{...inp,minHeight:100,resize:"vertical"}} value={form.desc} onChange={e=>upd("desc",e.target.value)} placeholder="Describe the issue in detail…"/></div>
            </div>
          )}
          {step===3&&(
            <div>
              <div style={{ color:T.text, fontWeight:800, fontSize:15, marginBottom:18, fontFamily:"'Syne',sans-serif" }}>Review Your Submission</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:18 }}>
                {[["Name",form.name||"—"],["Phone",form.phone||"—"],["Department",form.dept||"—"],["Priority",form.priority],["Location",form.location||"—"],["Title",form.title||"—"]].map(([k,v])=>(
                  <div key={k} style={{ background:T.surf, borderRadius:9, padding:"11px 14px" }}>
                    <div style={{ color:T.sub, fontSize:11, marginBottom:3 }}>{k}</div>
                    <div style={{ color:T.text, fontWeight:600, fontSize:13 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:T.cyan+"0F", border:`1px solid ${T.cyan}22`, borderRadius:9, padding:"13px 15px", color:T.sub, fontSize:12, lineHeight:1.6 }}>ℹ️ Complaint will be auto-routed to the {form.dept||"selected"} department with SLA tracking active.</div>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:22, paddingTop:18, borderTop:`1px solid ${T.border}` }}>
            {step>1?<button onClick={()=>setStep(s=>s-1)} style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub, borderRadius:8, padding:"9px 20px", fontSize:13, cursor:"pointer", fontWeight:600 }}>← Back</button>:<div/>}
            <button onClick={()=>step<3?setStep(s=>s+1):setDone(true)} style={{ background:`linear-gradient(90deg,${T.cyan},${T.blue})`, color:"#fff", border:"none", borderRadius:8, padding:"9px 26px", fontSize:13, cursor:"pointer", fontWeight:700, boxShadow:`0 4px 14px ${T.cyan}44` }}>
              {step===3?"🚀 Submit Complaint":"Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DBTrack() {
  const [q,setQ]=useState(""); const [result,setResult]=useState(null); const [err,setErr]=useState("");
  const search=()=>{
    const f=COMPLAINTS.find(c=>c.id.toLowerCase()===q.toLowerCase().trim());
    if(f){setResult(f);setErr("");}else{setResult(null);setErr("Not found. Try: CMP-2401, CMP-2399, CMP-2398");}
  };
  return (
    <div style={{ padding:"28px 34px" }}>
      <div style={{ maxWidth:580, margin:"0 auto" }}>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:26, marginBottom:18 }}>
          <div style={{ color:T.text, fontWeight:800, fontSize:16, marginBottom:4, fontFamily:"'Syne',sans-serif" }}>Track Your Complaint</div>
          <div style={{ color:T.sub, fontSize:13, marginBottom:20 }}>Enter your complaint ID for real-time status</div>
          <div style={{ display:"flex", gap:10 }}>
            <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="e.g. CMP-2401" style={{ flex:1, background:T.surf, border:`1px solid ${T.border}`, borderRadius:8, padding:"11px 14px", color:T.text, fontSize:14, outline:"none", fontFamily:"monospace" }}/>
            <button onClick={search} style={{ background:`linear-gradient(90deg,${T.cyan},${T.blue})`, color:"#fff", border:"none", borderRadius:8, padding:"11px 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Track →</button>
          </div>
          {err&&<div style={{ color:T.red, fontSize:13, marginTop:10 }}>{err}</div>}
        </div>
        {result&&(
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"18px 22px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><span style={{ color:T.cyan, fontFamily:"monospace", fontWeight:700 }}>{result.id}</span><div style={{ color:T.text, fontWeight:700, fontSize:15, marginTop:3 }}>{result.dept} · {result.location}</div></div>
              <Badge status={result.status}/>
            </div>
            <div style={{ padding:"18px 22px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
                <div style={{ background:T.surf, borderRadius:9, padding:"11px 13px" }}><div style={{ color:T.sub, fontSize:11, marginBottom:5 }}>Citizen</div><div style={{ color:T.text, fontWeight:700, fontSize:13 }}>{result.citizen}</div></div>
                <div style={{ background:T.surf, borderRadius:9, padding:"11px 13px" }}><div style={{ color:T.sub, fontSize:11, marginBottom:5 }}>Priority</div><PriorityDot p={result.priority}/></div>
                <div style={{ background:T.surf, borderRadius:9, padding:"11px 13px" }}><div style={{ color:T.sub, fontSize:11, marginBottom:5 }}>SLA</div><div style={{ color:result.sla<0?T.red:result.sla<=1?T.amber:T.green, fontWeight:800, fontSize:13 }}>{result.sla<0?`${Math.abs(result.sla)}d overdue`:`${result.sla}d remaining`}</div></div>
              </div>
              <div style={{ background:T.surf, borderRadius:9, padding:"12px 14px", marginBottom:16 }}>
                <div style={{ color:T.sub, fontSize:11, marginBottom:5 }}>Issue</div>
                <div style={{ color:T.text, fontSize:13, lineHeight:1.6 }}>{result.desc}</div>
              </div>
              <div style={{ display:"flex", gap:0, alignItems:"center" }}>
                {["Filed","Routed","In Progress","Resolved"].map((s,i)=>{
                  const statusMap={"Pending":1,"In Progress":2,"Resolved":3,"Escalated":2};
                  const done=i<(statusMap[result.status]||1);
                  return (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                      <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
                        {i>0&&<div style={{ flex:1, height:2, background:done?T.cyan:T.border }}/>}
                        <div style={{ width:20, height:20, borderRadius:"50%", background:done?T.cyan:T.border, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:9, fontWeight:800, flexShrink:0 }}>{done?"✓":i+1}</div>
                        {i<3&&<div style={{ flex:1, height:2, background:T.border }}/>}
                      </div>
                      <span style={{ color:done?T.cyan:T.sub, fontSize:9, fontWeight:600 }}>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {!result&&!err&&<div style={{ textAlign:"center", padding:"20px 0", color:T.sub }}><div style={{ fontSize:36, marginBottom:10 }}>◎</div><div>Try: CMP-2401, CMP-2399, CMP-2398</div></div>}
      </div>
    </div>
  );
}

function DBDepts() {
  const [sel,setSel]=useState(null);
  if(sel){
    const dc=COMPLAINTS.filter(c=>c.dept===sel.name);
    return (
      <div style={{ padding:"28px 34px" }}>
        <button onClick={()=>setSel(null)} style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub, borderRadius:7, padding:"7px 15px", fontSize:13, cursor:"pointer", marginBottom:22, fontWeight:600 }}>← Back</button>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <div style={{ fontSize:44 }}>{sel.icon}</div>
          <div><h2 style={{ color:T.text, fontSize:22, fontWeight:900, margin:0, fontFamily:"'Syne',sans-serif" }}>{sel.name}</h2><div style={{ color:T.sub, fontSize:13, marginTop:3 }}>{sel.officer} · {sel.email}</div></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          {[["Total",sel.complaints,sel.color],["Resolved",sel.resolved,T.green],["Pending",sel.pending,T.amber],["Rate",`${Math.round(sel.resolved/sel.complaints*100)}%`,sel.color]].map(([k,v,col])=>(
            <div key={k} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:11, padding:"16px 18px" }}>
              <div style={{ color:T.sub, fontSize:11, marginBottom:6 }}>{k}</div>
              <div style={{ color:col, fontSize:24, fontWeight:900, fontFamily:"'Syne',sans-serif" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, overflow:"hidden" }}>
          {dc.length===0&&<div style={{ padding:"22px", color:T.sub, textAlign:"center" }}>No complaints in preview data for this department</div>}
          {dc.map((c,i)=>(
            <div key={c.id} style={{ display:"grid", gridTemplateColumns:"92px 136px 1fr 108px 86px", alignItems:"center", padding:"12px 20px", gap:10, borderBottom:i<dc.length-1?`1px solid ${T.border}`:"none" }}>
              <span style={{ color:T.cyan, fontFamily:"monospace", fontSize:12, fontWeight:700 }}>{c.id}</span>
              <span style={{ color:T.text, fontSize:13 }}>{c.citizen}</span>
              <span style={{ color:T.sub, fontSize:12 }}>{c.location}</span>
              <Badge status={c.status}/><PriorityDot p={c.priority}/>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding:"28px 34px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {DEPTS.map((d,i)=>{
          const rate=Math.round((d.resolved/d.complaints)*100);
          return (
            <div key={i} onClick={()=>setSel(d)} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"24px", cursor:"pointer", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=d.color+"77";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 14px 36px ${d.color}18`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                <div style={{ fontSize:34 }}>{d.icon}</div>
                <span style={{ background:`${d.color}18`, color:d.color, padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>{rate}% resolved</span>
              </div>
              <div style={{ color:T.text, fontSize:17, fontWeight:800, marginBottom:3, fontFamily:"'Syne',sans-serif" }}>{d.name}</div>
              <div style={{ color:T.sub, fontSize:12, marginBottom:14 }}>{d.officer}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                <div style={{ background:T.surf, borderRadius:8, padding:"10px 12px" }}><div style={{ color:T.sub, fontSize:10 }}>Total</div><div style={{ color:T.text, fontWeight:800, fontSize:17, fontFamily:"'Syne',sans-serif" }}>{d.complaints}</div></div>
                <div style={{ background:T.surf, borderRadius:8, padding:"10px 12px" }}><div style={{ color:T.sub, fontSize:10 }}>Pending</div><div style={{ color:T.amber, fontWeight:800, fontSize:17, fontFamily:"'Syne',sans-serif" }}>{d.pending}</div></div>
              </div>
              <div style={{ height:5, background:T.border, borderRadius:3 }}>
                <div style={{ height:"100%", width:`${rate}%`, background:`linear-gradient(90deg,${d.color},${d.color}88)`, borderRadius:3 }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DBAnalytics() {
  const maxV=Math.max(...MONTHLY.map(b=>b.v));
  return (
    <div style={{ padding:"28px 34px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"20px" }}>
          <div style={{ color:T.text, fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>Monthly Complaint Volume</div>
          <div style={{ color:T.sub, fontSize:12, marginBottom:20 }}>Aug 2024 – Mar 2025</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:7, height:150 }}>
            {MONTHLY.map((b,i)=>{
              const h=Math.round((b.v/maxV)*130), last=i===MONTHLY.length-1;
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  {last&&<div style={{ color:T.cyan, fontSize:10, fontWeight:700 }}>{b.v}</div>}
                  <div style={{ width:"100%", height:h, background:last?`linear-gradient(180deg,${T.cyan},${T.blue})`:`${T.cyan}3A`, borderRadius:"3px 3px 0 0", boxShadow:last?`0 0 10px ${T.cyan}55`:"none" }}/>
                  <span style={{ color:T.sub, fontSize:9 }}>{b.m}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"20px" }}>
          <div style={{ color:T.text, fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>SLA Compliance Rate</div>
          <div style={{ color:T.sub, fontSize:12, marginBottom:18 }}>By department</div>
          {DEPTS.map((d,i)=>{
            const rate=65+i*5, col=rate>=88?T.green:rate>=75?T.amber:T.red;
            return (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:T.text, fontSize:12 }}>{d.icon} {d.name}</span>
                  <span style={{ color:col, fontSize:12, fontWeight:700 }}>{rate}%</span>
                </div>
                <div style={{ height:5, background:T.border, borderRadius:3 }}>
                  <div style={{ height:"100%", width:`${rate}%`, background:col, borderRadius:3 }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"20px", marginBottom:18 }}>
        <div style={{ color:T.text, fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>Geographic Heatmap</div>
        <div style={{ color:T.sub, fontSize:12, marginBottom:14 }}>Complaint density by region</div>
        <div style={{ height:220, background:`linear-gradient(135deg,${T.bg},#0a1525)`, borderRadius:9, border:`1px solid ${T.border}`, position:"relative", overflow:"hidden" }}>
          {[...Array(8)].map((_,i)=><div key={i} style={{ position:"absolute", left:`${i*12.5}%`, top:0, bottom:0, borderLeft:`1px solid ${T.border}33` }}/>)}
          {[...Array(5)].map((_,i)=><div key={i} style={{ position:"absolute", top:`${i*25}%`, left:0, right:0, borderTop:`1px solid ${T.border}33` }}/>)}
          {[{x:28,y:38,r:70,col:T.red,label:"Delhi NCR",n:312},{x:58,y:62,r:52,col:T.amber,label:"Bangalore",n:187},{x:72,y:28,r:40,col:T.cyan,label:"Hyderabad",n:143},{x:18,y:68,r:34,col:T.purple,label:"Mumbai",n:112},{x:84,y:58,r:26,col:T.green,label:"Chandigarh",n:76}].map((b,i)=>(
            <div key={i} style={{ position:"absolute", left:`${b.x}%`, top:`${b.y}%`, transform:"translate(-50%,-50%)" }}>
              <div style={{ width:b.r, height:b.r, borderRadius:"50%", background:`radial-gradient(circle,${b.col}77,${b.col}15)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"#fff", fontSize:b.r>45?15:11, fontWeight:900, textShadow:"0 1px 6px #000" }}>{b.n}</span>
              </div>
              <div style={{ color:b.col, fontSize:9, fontWeight:700, textAlign:"center", marginTop:3, textShadow:"0 1px 4px #000" }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[["Citizen Satisfaction","78%","Avg 3.9/5",T.green],["First Response","4.2h","Target < 6h",T.cyan],["Repeat Complaints","12%","Down from 18%",T.amber],["Digital Adoption","68%","Web + Mobile",T.purple]].map(([l,v,s,col])=>(
          <div key={l} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:11, padding:"18px" }}>
            <div style={{ color:col, fontSize:28, fontWeight:900, fontFamily:"'Syne',sans-serif" }}>{v}</div>
            <div style={{ color:T.text, fontSize:13, fontWeight:700, marginTop:6 }}>{l}</div>
            <div style={{ color:T.sub, fontSize:11, marginTop:3 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DBEscalations() {
  const esc=COMPLAINTS.filter(c=>c.status==="Escalated"||c.sla<0);
  return (
    <div style={{ padding:"28px 34px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[["Active Escalations","3",T.red],["Avg Overdue","2.1 days",T.amber],["Supervisors Assigned","3",T.green]].map(([k,v,col])=>(
          <div key={k} style={{ background:T.card, border:`1px solid ${col}33`, borderRadius:11, padding:"18px 20px" }}>
            <div style={{ color:col, fontSize:24, fontWeight:900, fontFamily:"'Syne',sans-serif" }}>{v}</div>
            <div style={{ color:T.sub, fontSize:13, marginTop:4 }}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:T.red, fontSize:16 }}>⚑</span>
          <div style={{ color:T.text, fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif" }}>Active Escalations</div>
        </div>
        {esc.map((c,i)=>(
          <div key={c.id} style={{ padding:"16px 20px", borderBottom:i<esc.length-1?`1px solid ${T.border}`:"none" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ color:T.cyan, fontFamily:"monospace", fontSize:12, fontWeight:700 }}>{c.id}</span>
                <span style={{ color:T.text, fontSize:14, fontWeight:700 }}>{c.citizen}</span>
                <span style={{ background:T.red+"22", color:T.red, padding:"2px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>{c.sla<0?`${Math.abs(c.sla)}d overdue`:"SLA Critical"}</span>
              </div>
              <PriorityDot p={c.priority}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[["Department",c.dept],["Location",c.location],["Assigned To",c.assigned]].map(([k,v])=>(
                <div key={k} style={{ background:T.surf, borderRadius:7, padding:"9px 12px" }}>
                  <div style={{ color:T.sub, fontSize:10, marginBottom:2 }}>{k}</div>
                  <div style={{ color:T.text, fontSize:12, fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DBProfile() {
  return (
    <div style={{ padding:"28px 34px" }}>
      <div style={{ maxWidth:620, margin:"0 auto" }}>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"28px", marginBottom:16 }}>
          <div style={{ display:"flex", gap:18, alignItems:"flex-start", marginBottom:24 }}>
            <div style={{ width:68, height:68, borderRadius:"50%", background:"linear-gradient(135deg,#A78BFA,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:24, flexShrink:0 }}>AC</div>
            <div>
              <h2 style={{ color:T.text, fontSize:20, fontWeight:900, margin:"0 0 4px", fontFamily:"'Syne',sans-serif" }}>Admin Central</h2>
              <div style={{ color:T.sub, fontSize:13, marginBottom:10 }}>admin@pscrm.gov.in · +91 98765 00000</div>
              <div style={{ display:"flex", gap:7 }}>
                <span style={{ background:T.cyan+"22", color:T.cyan, padding:"3px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>Superadmin</span>
                <span style={{ background:T.green+"22", color:T.green, padding:"3px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>All Departments</span>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["Employee ID","GOV-ADM-0001"],["Joined","January 2023"],["Last Login","Today, 09:14 AM"],["Access Level","Full Admin"]].map(([k,v])=>(
              <div key={k} style={{ background:T.surf, borderRadius:9, padding:"11px 14px" }}>
                <div style={{ color:T.sub, fontSize:11, marginBottom:3 }}>{k}</div>
                <div style={{ color:T.text, fontWeight:700, fontSize:13 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"22px" }}>
          <div style={{ color:T.text, fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif", marginBottom:14 }}>My Activity</div>
          {[["Complaints Resolved","148",T.green],["Escalations Handled","23",T.amber],["Avg Response Time","3.2h",T.cyan],["Citizen Rating","4.2 / 5",T.purple]].map(([k,v,col])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:`1px solid ${T.border}` }}>
              <span style={{ color:T.sub, fontSize:13 }}>{k}</span>
              <span style={{ color:col, fontWeight:900, fontSize:16, fontFamily:"'Syne',sans-serif" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onBackToLanding }) {
  const [page, setPage] = useState("dashboard");
  const titles = { dashboard:"Command Center", complaints:"Complaints", file:"File a Complaint", track:"Track Complaint", depts:"Departments", analytics:"Analytics", escalations:"Escalations", profile:"My Profile" };
  const pages = { dashboard:<DBDashboard setPage={setPage}/>, complaints:<DBComplaints/>, file:<DBFile/>, track:<DBTrack/>, depts:<DBDepts/>, analytics:<DBAnalytics/>, escalations:<DBEscalations/>, profile:<DBProfile/> };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:T.bg, minHeight:"100vh", color:T.text }}>
      <Sidebar page={page} setPage={setPage} onBackToLanding={onBackToLanding}/>
      <div style={{ marginLeft:230, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        {/* topbar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 34px", borderBottom:`1px solid ${T.border}`, background:T.surf, position:"sticky", top:0, zIndex:100 }}>
          <div>
            <h1 style={{ color:T.text, fontSize:19, fontWeight:900, margin:0, fontFamily:"'Syne',sans-serif" }}>{titles[page]}</h1>
            <p style={{ color:T.sub, margin:"2px 0 0", fontSize:11 }}>Smart Public Service Management Platform</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 13px", background:T.green+"15", border:`1px solid ${T.green}33`, borderRadius:7, color:T.green, fontSize:12, fontWeight:600 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:T.green, display:"inline-block", animation:"blink 2s infinite" }}/>System Live
            </div>
            <div style={{ width:36, height:36, borderRadius:8, background:T.card, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative", fontSize:15 }}>
              🔔<span style={{ position:"absolute", top:7, right:7, width:7, height:7, borderRadius:"50%", background:T.red, border:`2px solid ${T.surf}` }}/>
            </div>
            <button onClick={()=>setPage("file")} style={{ padding:"7px 17px", borderRadius:8, border:"none", cursor:"pointer", background:`linear-gradient(90deg,${T.cyan},${T.blue})`, color:"#fff", fontSize:12, fontWeight:700 }}>+ New Complaint</button>
          </div>
        </div>
        <main style={{ flex:1, overflowY:"auto" }}>{pages[page]}</main>
      </div>
    </div>
  );
}

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
