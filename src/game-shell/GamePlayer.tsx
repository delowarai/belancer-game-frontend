import {useEffect,useRef,useState} from 'react';
import {api} from '../api/client';
import {Payload,practicePayload,practiceScore} from '../games/engine';
const symbols=['●','◆','▲','■','★','✚','☀','♥'];
export default function GamePlayer({game,ranked}:{game:string,ranked:boolean}) {
  const [phase,setPhase]=useState('instructions'),[payload,setPayload]=useState<Payload>({}),[sid,setSid]=useState('');
  const [round,setRound]=useState(0),[answers,setAnswers]=useState<any[]>([]),[selected,setSelected]=useState<number[]>([]),[show,setShow]=useState(false),[found,setFound]=useState<number[]>([]),[number,setNumber]=useState(''),[result,setResult]=useState<any>(null),[error,setError]=useState('');
  const startTime=useRef(0),timers=useRef<ReturnType<typeof setTimeout>[]>([]),locked=useRef(false),pending=useRef<any>(null);
  function clearTimers(){timers.current.forEach(clearTimeout);timers.current=[]}
  useEffect(()=>()=>clearTimers(),[]);
  useEffect(()=>{clearTimers();setRound(0);setPhase('instructions');setResult(null);setError('')},[game,ranked]);
  useEffect(()=>{if(phase==='playing'&&game==='memory-grid'){setShow(true);timers.current.push(setTimeout(()=>setShow(false),2000))}},[phase,round,game]);
  async function start(){
    setError('');setPhase('loading');clearTimers();locked.current=false;
    try{let p:Payload;if(ranked){const session=await api('/sessions',{game});p=session.payload;setSid(session.id)}else p=practicePayload(game);
      setPayload(p);setRound(0);setAnswers([]);setSelected([]);setFound([]);setResult(null);setNumber('');startTime.current=Date.now();setPhase('playing');
    }catch(e){setError((e as Error).message);setPhase('instructions')}
  }
  async function finish(all:any[]){
    clearTimers();setPhase('submitting');pending.current={answers:all,duration:Math.max(1,Date.now()-startTime.current)};
    try{const r=ranked?await api(`/sessions/${sid}/submit`,pending.current):{...practiceScore(game,payload,all),duration:pending.current.duration};setResult(r);setPhase('results')}
    catch(e){setError((e as Error).message);setPhase('error')}
  }
  async function retry(){try{setPhase('submitting');setResult(await api(`/sessions/${sid}/submit`,pending.current));setPhase('results');setError('')}catch(e){setError((e as Error).message);setPhase('error')}}
  function answer(value:any){if(locked.current||phase!=='playing')return;locked.current=true;const next=[...answers,value];setAnswers(next);setSelected([]);setNumber('');if(next.length===10){void finish(next)}else{setRound(round+1);locked.current=false}}
  function reveal(i:number){
    if(locked.current||found.includes(i)||selected.includes(i))return;
    const all=[...answers,i];setAnswers(all);const next=[...selected,i];setSelected(next);
    if(next.length===2){locked.current=true;const matched=payload.cards![next[0]]===payload.cards![i];const done=matched?[...found,...next]:found;
      timers.current.push(setTimeout(()=>{setFound(done);setSelected([]);locked.current=false;if(done.length===16)void finish(all)},matched?350:850))}
  }
  return <section className="player panel"><div className="eyebrow">{ranked?'DAILY CHALLENGE · 3 ATTEMPTS · UTC':'FREE PRACTICE'}</div><h1>{game.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ')}</h1>
    {error&&<p role="alert" className="error">{error}</p>}
    {phase==='instructions'&&<><p>{game==='memory-grid'?'Remember three highlighted cells. After two seconds, select the same three cells. Complete ten rounds.':game==='pair-finder'?'Reveal two cards at a time. Match all eight pairs in as few moves as possible.':game==='quick-match'?'Choose Same or Different for each pair of symbols. Complete ten rounds.':game==='focus-finder'?'Select the different symbol in each grid. Complete ten rounds.':'Enter the sum for each question. Complete ten rounds.'}</p><p className="muted">{ranked?'Starting consumes one attempt. Sessions expire after ten minutes. Refreshing interrupts the session. Scores are calculated by the server.':'Practice results stay in this browser session. This demo uses a fixed difficulty.'}</p><button onClick={start}>Start {ranked?'challenge':'practice'} →</button></>}
    {(phase==='loading'||phase==='submitting')&&<p aria-live="polite">{phase==='loading'?'Preparing game…':'Validating result…'}</p>}
    {phase==='playing'&&<><div className="game-top"><span>{game==='pair-finder'?`${found.length/2} / 8 pairs`:`Round ${round+1} / 10`}</span><span>{ranked?'Ranked':'Practice'}</span></div>
      {(game==='memory-grid'||game==='focus-finder'||game==='pair-finder')&&<><p aria-live="polite">{game==='memory-grid'?(show?'Remember this pattern':'Select three cells'):game==='pair-finder'?'Find matching pairs':'Find the different symbol'}</p><div className="grid-board">{Array.from({length:16},(_,i)=>{
        const lit=game==='memory-grid'?(show?payload.rounds![round].includes(i):selected.includes(i)):game==='pair-finder'?(selected.includes(i)||found.includes(i)):false;
        return <button key={i} aria-label={`Cell ${i+1}${game==='pair-finder'&&lit?`, ${symbols[payload.cards![i]]}`:''}`} aria-pressed={game==='memory-grid'?lit:undefined} className={`cell ${lit?'lit':''} ${found.includes(i)?'matched':''}`} disabled={game==='memory-grid'&&show} onClick={()=>{if(game==='pair-finder')reveal(i);else if(game==='focus-finder')answer(i);else if(selected.includes(i))setSelected(selected.filter(x=>x!==i));else if(selected.length<3)setSelected([...selected,i])}}>{game==='focus-finder'?(payload.rounds![round]===i?'◆':'●'):game==='pair-finder'?(lit?symbols[payload.cards![i]]:'?'):''}</button>
      })}</div>{game==='memory-grid'&&<button disabled={show||selected.length!==3} onClick={()=>answer(selected)}>Confirm selection</button>}</>}
      {game==='quick-match'&&<><div className="symbols">{symbols[payload.rounds![round][0]]} <span>·</span> {symbols[payload.rounds![round][1]]}</div><div className="actions"><button onClick={()=>answer(1)}>Same</button><button className="secondary" onClick={()=>answer(0)}>Different</button></div></>}
      {game==='math-sprint'&&<form onSubmit={e=>{e.preventDefault();if(number.trim())answer(Number(number))}}><div className="symbols">{payload.rounds![round][0]} + {payload.rounds![round][1]}</div><input aria-label="Your answer" type="number" value={number} onChange={e=>setNumber(e.target.value)} autoFocus required/><button>Submit answer</button></form>}
    </>}
    {phase==='results'&&result&&<><h2>{result.status==='validated'?'Result validated':'Practice complete'}</h2><div className="stats"><div><strong>{result.score}</strong>points</div><div><strong>{result.accuracy}%</strong>accuracy</div><div><strong>{(result.duration/1000).toFixed(1)}s</strong>duration</div></div><p>{result.correct} correct · {result.errors} errors</p><div className="actions"><button onClick={start}>Play again</button><a className="button secondary" href={`/leaderboards?game=${game}`}>Leaderboard</a></div></>}
    {phase==='error'&&<><button onClick={retry}>Retry same submission</button><a href="/games">Back to games</a></>}
  </section>
}
