import T from "../constants/tokens";

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

export default DBProfile;
