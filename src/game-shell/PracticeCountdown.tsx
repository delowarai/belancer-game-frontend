import {useEffect,useState,type ReactNode} from 'react';

export default function PracticeCountdown({enabled,name,children}:{enabled:boolean;name:string;children:ReactNode}){
  const [count,setCount]=useState(3);
  useEffect(()=>{
    if(!enabled||count===0)return;
    const timer=setTimeout(()=>setCount(value=>value-1),1000);
    return()=>clearTimeout(timer);
  },[enabled,count]);
  // Mount the player only after countdown, so its timer and memory reveals
  // begin when the player can actually see the game.
  if(!enabled||count===0)return <>{children}</>;
  return <section className="player panel"><div className="eyebrow">FREE PRACTICE</div><h1>{name}</h1><div role="status" aria-label={`Starting in ${count}`} className="symbols">{count}</div></section>;
}
