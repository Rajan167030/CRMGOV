import T from "../constants/tokens";

const PriorityDot = ({ p }) => {
  const c = { 
    Critical: T.red, 
    High: T.amber, 
    Medium: T.accent, 
    Low: T.green 
  };
  return (
    <span style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: 5, 
      color: c[p] || T.sub, 
      fontSize: 12, 
      fontWeight: 600 
    }}>
      <span style={{ 
        width: 6, 
        height: 6, 
        borderRadius: "50%", 
        background: c[p] || T.sub, 
        display: "inline-block" 
      }}/>
      {p}
    </span>
  );
};

export default PriorityDot;
