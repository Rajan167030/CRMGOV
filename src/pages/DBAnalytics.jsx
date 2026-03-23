import T from "../constants/tokens";
import { DEPTS, MONTHLY } from "../data/mockData";

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

export default DBAnalytics;
