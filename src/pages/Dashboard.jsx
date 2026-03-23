import { useState } from "react";
import T from "../constants/tokens";
import Sidebar from "../components/Sidebar";
import DBDashboard from "./DBDashboard";
import DBComplaints from "./DBComplaints";
import DBFile from "./DBFile";
import DBTrack from "./DBTrack";
import DBDepts from "./DBDepts";
import DBAnalytics from "./DBAnalytics";
import DBEscalations from "./DBEscalations";
import DBProfile from "./DBProfile";

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

export default Dashboard;
