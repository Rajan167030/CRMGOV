import T from "../constants/tokens";
import PriorityDot from "../components/PriorityDot";
import { COMPLAINTS } from "../data/mockData";

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

export default DBEscalations;
