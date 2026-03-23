import { useState } from "react";
import T from "../constants/tokens";
import Badge from "../components/Badge";
import PriorityDot from "../components/PriorityDot";
import { COMPLAINTS } from "../data/mockData";

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

export default DBComplaints;
