import { useState } from "react";
import T from "../constants/tokens";
import Badge from "../components/Badge";
import PriorityDot from "../components/PriorityDot";
import { COMPLAINTS } from "../data/mockData";

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

export default DBTrack;
