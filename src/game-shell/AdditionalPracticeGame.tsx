import {FormEvent,useEffect,useRef,useState} from 'react';

import {questionFor} from '../games/practiceQuestions';
import type {Question} from '../games/practiceQuestions';
type Props={slug:string;name:string};
const memorySequence=()=>Array.from({length:4},()=>Math.floor(Math.random()*10)).join('');

export default function AdditionalPracticeGame({slug,name}:Props){
  const submitted=useRef(false);
  const [phase,setPhase]=useState<'instructions'|'playing'|'results'>('instructions');
  const [round,setRound]=useState(0),[score,setScore]=useState(0),[feedback,setFeedback]=useState('');
  const [question,setQuestion]=useState<Question>(()=>questionFor(slug,0)),[answered,setAnswered]=useState(false);
  const [sequence,setSequence]=useState(''),[sequenceVisible,setSequenceVisible]=useState(false),[entry,setEntry]=useState('');

  useEffect(()=>{
    if(slug!=='number-recall'||phase!=='playing'||!sequenceVisible)return;
    const timer=setTimeout(()=>setSequenceVisible(false),1800);
    return()=>clearTimeout(timer);
  },[slug,phase,sequenceVisible,sequence]);

  useEffect(()=>{start()},[]);
  function start(){
    submitted.current=false;setRound(0);setScore(0);setFeedback('');setAnswered(false);setEntry('');
    setQuestion(questionFor(slug,0));setPhase('playing');
    if(slug==='number-recall'){setSequence(memorySequence());setSequenceVisible(true)}
  }
  function nextRound(){
    if(round===7){setPhase('results');return}
    submitted.current=false;const next=round+1;setRound(next);setFeedback('');setAnswered(false);setEntry('');setQuestion(questionFor(slug,next));
    if(slug==='number-recall'){setSequence(memorySequence());setSequenceVisible(true)}
  }
  function submit(correct:boolean){
    if(submitted.current||answered)return;submitted.current=true;
    setAnswered(true);setFeedback(correct?'Correct — nice work!':'Not quite — keep going.');
    if(correct)setScore(value=>value+1);
  }
  function submitSequence(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(entry.trim())submit(entry.replace(/\s/g,'')===sequence);
  }

  return <section className="player panel additional-practice">
    <div className="eyebrow">{slug==='number-recall'?'MEMORY PRACTICE':'FREE PRACTICE · NO ACCOUNT NEEDED'}</div><h1>{name}</h1>
    {phase==='instructions'&&<><p>{slug==='number-recall'?'Remember each four-digit number, then type it back after it disappears.':'Play eight short rounds and see how many you can answer correctly.'}</p><p className="muted">This is a local practice game. Your score is not submitted to ranked leaderboards.</p><button onClick={start}>Start practice →</button></>}
    {phase==='playing'&&<><div className="game-top"><span>Round {round+1} / 8</span><span>Score: {score}</span></div><p className="feedback" role="status" aria-live="polite">{feedback||'Take your time and choose your answer.'}</p>
      {slug==='number-recall'?<>{sequenceVisible?<div className="recall-sequence" role="status" aria-label="Remember this number">{sequence.split('').join('  ')}</div>:<form className="word-form" onSubmit={submitSequence}><label>Enter the four-digit sequence<input aria-label="Four-digit sequence" autoComplete="off" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" value={entry} onChange={event=>setEntry(event.target.value)} disabled={answered} required/></label><button disabled={answered}>Check sequence</button></form>}</>:<>
        <p className="additional-prompt" style={question.promptColor?{color:question.promptColor}:undefined}>{question.prompt}</p>
        {question.grid?<><div className={`additional-grid${slug==='quick-count'?' count-grid':''}`} role="group" aria-label={slug==='quick-count'?'Symbols to count':'Choose the matching tile'}>{question.grid.map((symbol,index)=><button key={index} className="additional-grid-cell" aria-label={`Tile ${index+1}${slug==='quick-count'?' '+symbol:''}`} disabled={answered||slug==='quick-count'} onClick={()=>submit(index===question.answer)}>{symbol}</button>)}</div>{slug==='quick-count'&&<div className="additional-options">{question.options.map((option,index)=><button className="secondary" key={`${option}-${index}`} disabled={answered} onClick={()=>submit(index===question.answer)}>{option}</button>)}</div>}</>:<div className="additional-options">{question.options.map((option,index)=><button className="secondary" key={`${option}-${index}`} style={question.optionColors?{borderBottom:`5px solid ${question.optionColors[index]}`}:{}} disabled={answered} onClick={()=>submit(index===question.answer)}>{option}</button>)}</div>}
      </>}
      {answered&&<button onClick={nextRound}>{round===7?'See results':'Next round →'}</button>}
    </>}
    {phase==='results'&&<><h2>Practice complete</h2><div className="stats"><div><strong>{score}/8</strong>correct</div><div><strong>{Math.round(score/8*100)}%</strong>accuracy</div></div><p>Your result stays in this practice session and is not saved to a leaderboard.</p><button onClick={start}>Play again →</button></>}
  </section>;
}
