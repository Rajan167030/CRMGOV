import T from "../constants/tokens";

const Badge = ({ status }) => {
  const m = { 
    "Resolved":    [T.green, T.greenBg], 
    "In Progress": [T.accent, T.accentLight], 
    "Escalated":   [T.red, T.redBg], 
    "Pending":     [T.amber, T.amberBg] 
  };
  const [fg, bg] = m[status] || [T.sub, T.border];
  return (
    <span style={{ 
      background: bg, 
      color: fg, 
      border: `1px solid ${fg}33`,
      padding: "3px 10px", 
      borderRadius: 100, 
      fontSize: 11, 
      fontWeight: 700 
    }}>
      {status}
    </span>
  );
};

export default Badge;
