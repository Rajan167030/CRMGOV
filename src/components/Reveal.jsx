import { useState, useEffect, useRef } from "react";

function Reveal({ children, delay=0 }) {
  const ref = useRef(); const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting){setV(true);obs.disconnect();} },{threshold:.12});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[]);
  return <div ref={ref} style={{ opacity:v?1:0, transform:v?"translateY(0)":"translateY(28px)", transition:`opacity .65s ease ${delay}s, transform .65s ease ${delay}s` }}>{children}</div>;
}

export default Reveal;
