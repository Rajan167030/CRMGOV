import { useState, useEffect, useRef } from "react";

function Counter({ to, suffix="" }) {
  const [val, setVal] = useState(0); const ref = useRef();
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){
        const s=Date.now(),d=1800,tick=()=>{
          const p=Math.min((Date.now()-s)/d,1),e2=1-Math.pow(1-p,3);
          setVal(Math.floor(e2*to)); if(p<1)requestAnimationFrame(tick);
        }; requestAnimationFrame(tick); obs.disconnect();
      }
    },{threshold:.5});
    if(ref.current)obs.observe(ref.current); return()=>obs.disconnect();
  },[to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default Counter;
