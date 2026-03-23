import T from "../constants/tokens";

const Badge = ({ status }) => {
  const m = { "Resolved":["#00F5A0","#00F5A022"], "In Progress":["#00E5FF","#00E5FF22"], "Escalated":["#FF3860","#FF386022"], "Pending":["#FFB800","#FFB80022"] };
  const [fg, bg] = m[status] || [T.sub, T.muted+"22"];
  return <span style={{ background:bg, color:fg, padding:"3px 11px", borderRadius:100, fontSize:11, fontWeight:700 }}>{status}</span>;
};

export default Badge;
