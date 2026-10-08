import {useEffect,useRef,useState} from 'react';
import {api} from '../api/client';
import {Payload,limits,pattern,practicePayload,practiceScore,advanceMemory} from '../games/engine';
const symbols=['●','◆','▲','■','★','✚','☀','♥'];
type Ranked={id:string;sequence:number;round:number;serverNow:number;deadline:number;attempt:number;prompt:any;result:any;feedback?:any};
export default function GamePlayer({game,ranked}:{game:string,ranked:boolean}){
  const [phase,setPhase]=useState('instructions'),[countdown,setCountdown]=useState(3),[payload,setPayload]=useState<Payload>({});
  const [session,setSession]=useState<Ranked|null>(null),[round,setRound]=useState(0),[answers,setAnswers]=useState<any[]>([]);
  const [selected,setSelected]=useState<number[]>([]),[found,setFound]=useState<number[]>([]),[cards,setCards]=useState<Record<number,number>>({});
  const [number,setNumber]=useState(''),[result,setResult]=useState<any>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [clock,setClock]=useState(Date.now()),[showUntil,setShowUntil]=useState(0),[deadline,setDeadline]=useState(0),[busy,setBusy]=useState(false),[resumeId,setResumeId]=useState(''),[lastPair,setLastPair]=useState<number[]>([]);
  const running=useRef(false),pending=useRef<{path:string;body:any}|null>(null),offset=useRef(0),startTime=useRef(0),timers=useRef<ReturnType<typeof setTimeout>[]>([]),practiceFailures=useRef(0),successes=useRef(0),cellCount=useRef(3),pairAvailable=useRef(0),mounted=useRef(true),finishRef=useRef<()=>void>(()=>{});
  const storageKey=`belancer-ranked-${game}`,numberInput=useRef<HTMLInputElement>(null);
  function clearTimers(){timers.current.forEach(clearTimeout);timers.current=[]}
  useEffect(()=>{mounted.current=true;setResumeId(ranked?sessionStorage.getItem(storageKey)||'':'');return()=>{mounted.current=false;clearTimers()}},[game,ranked]);
  useEffect(()=>{if(phase!=='countdown')return;if(countdown===0){void begin();return}const t=setTimeout(()=>setCountdown(c=>c-1),1000);return()=>clearTimeout(t)},[phase,countdown]);
  useEffect(()=>{if(phase!=='playing')return;const t=setInterval(()=>{const now=Date.now()+offset.current;setClock(now);if(now>=deadline&&!running.current)finishRef.current()},100);return()=>clearInterval(t)},[phase,deadline]);
  useEffect(()=>{if(phase==='playing'&&game==='math-sprint'&&!busy)numberInput.current?.focus()},[phase,round,busy,game]);
  function accept(s:Ranked){
    offset.current=s.serverNow-Date.now();setClock(s.serverNow);setDeadline(s.deadline);setSession(s);setRound(s.round);setSelected([]);setNumber('');
    if(game==='memory-grid')setShowUntil(s.prompt?.showUntil||0);
    if(game==='pair-finder'){
      setFound(s.prompt?.found||[]);setSelected((s.prompt?.open||[]).map((x:any)=>x.index));
      setCards(c=>{const next={...c};for(const x of s.prompt?.open||[])next[x.index]=x.symbol;if(s.feedback?.revealed)next[s.feedback.revealed.index]=s.feedback.revealed.symbol;return next});
      pairAvailable.current=s.prompt?.availableAt||0;
    }
    if(s.result){setResult(s.result);setPhase('results');sessionStorage.removeItem(storageKey);setResumeId('')}else setPhase('playing');
  }
  async function begin(){
    if(running.current)return;running.current=true;setBusy(true);setPhase('loading');setError('');clearTimers();
    setAnswers([]);setSelected([]);setFound([]);setCards({});setLastPair([]);setRound(0);setNumber('');setResult(null);setNotice('');pending.current=null;practiceFailures.current=0;successes.current=0;cellCount.current=3;
    try{if(ranked){const s=await api<Ranked>('/sessions',{game});if(!mounted.current)return;sessionStorage.setItem(storageKey,s.id);setResumeId(s.id);accept(s)}
      else{setPayload(practicePayload(game));startTime.current=Date.now();offset.current=0;setDeadline(startTime.current+limits[game]);setClock(startTime.current);setShowUntil(startTime.current+2000);pairAvailable.current=0;setPhase('playing')}
    }catch(e){setError((e as Error).message);setPhase('instructions')}finally{running.current=false;setBusy(false)}
  }
  async function resumeSession(id:string){if(running.current)return;running.current=true;setBusy(true);try{accept(await api<Ranked>(`/sessions/${id}`));setError('');pending.current=null}catch(e){setError((e as Error).message);if(phase==='instructions'){sessionStorage.removeItem(storageKey);setResumeId('')}}finally{running.current=false;setBusy(false)}}
  async function request(path:string,body:any){
    if(running.current)return;running.current=true;setBusy(true);pending.current={path,body};
    try{const s=await api<Ranked>(path,body);if(!mounted.current)return;setError('');pending.current=null;if(s.feedback)setNotice(s.feedback.matched!==undefined?(s.feedback.matched?'Pair found!':'Try another pair.'):s.feedback.correct?'Good answer!':'Keep going.');accept(s)}
    catch(e){setError((e as Error).message);setPhase('error')}finally{running.current=false;setBusy(false)}
  }
  function practiceFinish(all:any[]){clearTimers();running.current=false;setBusy(false);setResult({...practiceScore(game,payload,all),duration:Math.min(Date.now()-startTime.current,limits[game])});setPhase('results')}
  function finish(){if(ranked&&session)void request(`/sessions/${session.id}/finish`,{});else practiceFinish(answers)}
  finishRef.current=finish;
  function answer(value:any){
    if(running.current||phase!=='playing'||Date.now()+offset.current>=deadline)return;
    if(game==='memory-grid'&&Date.now()+offset.current<showUntil)return;
    if(ranked&&session){void request(`/sessions/${session.id}/actions`,{sequence:session.sequence,answer:value});return}
    const next=[...answers,value];setAnswers(next);setSelected([]);setNumber('');
    if(game==='memory-grid'){
      const good=value.every((v:number)=>payload.rounds![round].includes(v));setNotice(good?'Pattern remembered!':'Next round — take another look.');
      const nextMemory=advanceMemory({cells:cellCount.current,successes:successes.current,failures:practiceFailures.current},good);
      successes.current=nextMemory.successes;cellCount.current=nextMemory.cells;practiceFailures.current=nextMemory.failures;
      if(nextMemory.ended||next.length===10){practiceFinish(next);return}
      const updated={rounds:[...payload.rounds!]};updated.rounds[round+1]=pattern(cellCount.current);setPayload(updated);setShowUntil(Date.now()+2000);
    }
    if(next.length===payload.rounds!.length){practiceFinish(next);return}setRound(round+1);
  }
  function reveal(i:number){
    if(running.current||phase!=='playing'||Date.now()+offset.current>=deadline||found.includes(i)||selected.includes(i)||Date.now()+offset.current<pairAvailable.current)return;
    if(ranked&&session){void request(`/sessions/${session.id}/actions`,{sequence:session.sequence,answer:i});return}
    const all=[...answers,i],next=[...selected,i];setAnswers(all);setSelected(next);setCards(c=>({...c,[i]:payload.cards![i]}));
    if(next.length===2){running.current=true;setBusy(true);const matched=payload.cards![next[0]]===payload.cards![next[1]];const done=matched?[...found,...next]:found;setNotice(matched?'Pair found!':'Try another pair.');timers.current.push(setTimeout(()=>{setFound(done);setSelected([]);running.current=false;setBusy(false);if(done.length===16)practiceFinish(all)},matched?350:850))}
  }
  useEffect(()=>{if(game!=='pair-finder'||!ranked||!session?.feedback?.revealed)return;const reveal=session.feedback.revealed.index;
    if(session.feedback.matched!==undefined){setLastPair(current=>[...current,reveal].slice(-2));const t=setTimeout(()=>setLastPair([]),session.feedback.matched?350:850);return()=>clearTimeout(t)}setLastPair([reveal]);
  },[session]);
  const show=clock<showUntil,question=ranked?session?.prompt?.question:payload.rounds?.[round],required=ranked?3:cellCount.current;
  const remaining=Math.max(0,Math.ceil((deadline-clock)/1000));
  return <section className="player panel"><div className="eyebrow">{ranked?'DAILY CHALLENGE · RULES V2 · UTC':'FREE PRACTICE'}</div><h1>{game.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ')}</h1>
    {error&&<p role="alert" className="error">{error}</p>}
    {phase==='instructions'&&<><p>{game==='memory-grid'?`Remember the highlighted cells for two seconds. ${ranked?'Ten rounds, three cells per round.':'Start with three cells; increase after two successful rounds. End after three failed rounds or ten rounds.'}`:game==='pair-finder'?'Find eight matching pairs within three minutes.':game==='quick-match'?'Choose Same or Different. Score as many correct answers as possible in 60 seconds (maximum 120 questions).':game==='focus-finder'?'Select the different symbol. Complete ten rounds within two minutes.':'Solve as many sums as possible in 60 seconds (maximum 120 questions).'}</p><p className="muted">{ranked?'Starting consumes one of three daily attempts. The timer continues if you leave this tab. Resume on this browser after refresh. The server controls rounds, reveals and scoring.':'Practice results are temporary. Keyboard and touch controls are supported.'}</p>{resumeId?<button onClick={()=>resumeSession(resumeId)} disabled={busy}>Resume started challenge</button>:<button onClick={()=>{setCountdown(3);setPhase('countdown')}}>Start {ranked?'challenge':'practice'} →</button>}</>}
    {phase==='countdown'&&<div role="status" className="symbols">{countdown||'Go!'}</div>}
    {phase==='loading'&&<p role="status">Preparing game…</p>}
    {phase==='playing'&&<><div className="game-top"><span>{game==='pair-finder'?`${found.length/2} / 8 pairs`:game==='math-sprint'||game==='quick-match'?`Question ${round+1}`:`Round ${round+1} / 10`}</span><span role="timer">{remaining}s left{ranked?` · Attempt ${session?.attempt}/3`:''}</span></div><p className="feedback" aria-live="polite">{notice||'You’ve got this.'}</p>
      {(game==='memory-grid'||game==='focus-finder'||game==='pair-finder')&&<><p>{game==='memory-grid'?(show?'Remember this pattern':`Select ${required} cells`):game==='pair-finder'?'Find matching pairs':'Find the different symbol'}</p><div className="grid-board">{Array.from({length:16},(_,i)=>{
        const lit=game==='memory-grid'?(show?(question||[]).includes(i):selected.includes(i)):game==='pair-finder'?(selected.includes(i)||found.includes(i)||lastPair.includes(i)):false;
        return <button key={i} aria-label={game==='focus-finder'?`Cell ${i+1}: ${question===i?'diamond':'circle'}`:`Cell ${i+1}${game==='pair-finder'&&lit&&cards[i]!==undefined?`, ${symbols[cards[i]]}`:''}`} aria-pressed={game==='memory-grid'?lit:undefined} className={`cell ${lit?'lit':''} ${found.includes(i)?'matched':''}`} disabled={busy||remaining===0||(game==='memory-grid'&&show)||(game==='pair-finder'&&(found.includes(i)||clock<pairAvailable.current))} onClick={()=>{if(game==='pair-finder')reveal(i);else if(game==='focus-finder')answer(i);else if(selected.includes(i))setSelected(selected.filter(x=>x!==i));else if(selected.length<required)setSelected([...selected,i])}}>{game==='focus-finder'?(question===i?'◆':'●'):game==='pair-finder'?(lit?(cards[i]!==undefined?symbols[cards[i]]:'✓'):'?'):''}</button>
      })}</div>{game==='memory-grid'&&<button disabled={busy||show||selected.length!==required} onClick={()=>answer(selected)}>Confirm selection</button>}</>}
      {game==='quick-match'&&question&&<><div className="symbols">{symbols[question[0]]} <span>·</span> {symbols[question[1]]}</div><div className="actions"><button disabled={busy} onClick={()=>answer(1)}>Same</button><button disabled={busy} className="secondary" onClick={()=>answer(0)}>Different</button></div></>}
      {game==='math-sprint'&&question&&<form onSubmit={e=>{e.preventDefault();if(number.trim()&&Number.isSafeInteger(Number(number)))answer(Number(number))}}><div className="symbols">{question[0]} + {question[1]}</div><input ref={numberInput} aria-label="Your answer" type="number" step="1" value={number} onChange={e=>setNumber(e.target.value)} disabled={busy} autoFocus required/><button disabled={busy}>Submit answer</button></form>}
      {busy&&<p role="status">Checking answer…</p>}
    </>}
    {phase==='results'&&result&&<><h2>{result.status==='validated'?'Result validated':'Practice complete'}</h2><div className="stats"><div><strong>{result.score}</strong>points</div><div><strong>{result.accuracy}%</strong>accuracy</div><div><strong>{((result.playDuration||result.duration)/1000).toFixed(1)}s</strong>play time</div></div><p>{result.correct} correct · {result.errors} errors{game==='memory-grid'?` · ${result.correctRounds} complete patterns`:''}</p><div className="actions"><button onClick={()=>{setResumeId('');setPhase('instructions')}}>Play again</button><a className="button secondary" href={`/leaderboards?game=${game}`}>Leaderboard</a></div></>}
    {phase==='error'&&<div className="actions"><button disabled={busy||!pending.current} onClick={()=>{if(pending.current)void request(pending.current.path,pending.current.body)}}>Retry same action</button><button className="secondary" disabled={busy||!session} onClick={()=>{if(session)void resumeSession(session.id)}}>Reload session</button></div>}
  </section>;
}
