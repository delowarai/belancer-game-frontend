import {FormEvent,useEffect,useState} from 'react';
import {categoryColors} from '../games/practiceGames';

type Mode='sequence-recall'|'color-match'|'odd-one-out'|'word-scramble';
type ColorQuestion={word:number;ink:number};
type OddQuestion={different:number;common:number;odd:number};
const colors=['Teal','Mint','Clay','Lime'];
const words=['puzzle','memory','focus','bright','pattern','curious','quick','play'];
const roundCount=8;

function nextColorQuestion():ColorQuestion{
  const word=Math.floor(Math.random()*colors.length),offset=Math.floor(Math.random()*(colors.length-1))+1;
  return {word,ink:(word+offset)%colors.length};
}
function shuffledWord(word:string){
  const letters=word.split('');
  for(let i=letters.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[letters[i],letters[j]]=[letters[j],letters[i]]}
  return letters.join('')===word?`${letters.slice(1).join('')}${letters[0]}`:letters.join('');
}
function nextWordQuestion(index:number){
  const word=words[index%words.length];
  return {word,scrambled:shuffledWord(word)};
}
function nextOddQuestion():OddQuestion{
  const different=Math.floor(Math.random()*16),common=Math.floor(Math.random()*2);
  return {different,common,odd:1-common};
}
function instructionsFor(mode:Mode){
  if(mode==='sequence-recall')return 'Watch the tiles light up, then repeat the sequence in the same order.';
  if(mode==='color-match')return 'Read the color word, then choose the color it is printed in.';
  if(mode==='odd-one-out')return 'Find the one symbol that is different from the rest.';
  return 'Unscramble the letters to find the hidden word.';
}
function titleFor(mode:Mode){
  if(mode==='sequence-recall')return 'Sequence Recall';
  if(mode==='color-match')return 'Color Match';
  if(mode==='odd-one-out')return 'Odd One Out';
  return 'Word Scramble';
}

export default function ExtraPracticeGames({mode}:{mode:Mode}){
  const [phase,setPhase]=useState<'instructions'|'playing'|'results'>('instructions');
  const [round,setRound]=useState(0);
  const [score,setScore]=useState(0);
  const [feedback,setFeedback]=useState('');
  const [roundDone,setRoundDone]=useState(false);
  const [colorQuestion,setColorQuestion]=useState(nextColorQuestion);
  const [oddQuestion,setOddQuestion]=useState(nextOddQuestion);
  const [wordQuestion,setWordQuestion]=useState(()=>nextWordQuestion(0));
  const [guess,setGuess]=useState('');
  const [sequence,setSequence]=useState<number[]>([]);
  const [selected,setSelected]=useState<number[]>([]);
  const [showing,setShowing]=useState(false);
  const [revealStep,setRevealStep]=useState(0);
  const [highlighted,setHighlighted]=useState<number|null>(null);

  useEffect(()=>{
    if(phase!=='playing'||mode!=='sequence-recall'||!showing)return;
    const timer=setTimeout(()=>{
      if(revealStep>=sequence.length){setShowing(false);setHighlighted(null);return}
      setHighlighted(sequence[revealStep]);setRevealStep(step=>step+1);
    },650);
    return()=>clearTimeout(timer);
  },[phase,mode,showing,revealStep,sequence]);

  function createSequence(roundIndex=round){
    const length=3+Math.min(roundIndex,3),values:number[]=[];
    while(values.length<length){const value=Math.floor(Math.random()*16);if(!values.includes(value))values.push(value)}
    setSequence(values);setSelected([]);setRevealStep(0);setHighlighted(null);setShowing(true);
  }
  function start(){
    setRound(0);setScore(0);setFeedback('');setRoundDone(false);setGuess('');
    setColorQuestion(nextColorQuestion());setOddQuestion(nextOddQuestion());setWordQuestion(nextWordQuestion(0));
    setPhase('playing');
    if(mode==='sequence-recall')createSequence(0);
  }
  function nextRound(){
    if(roundDone&&round===roundCount-1){setPhase('results');return}
    setRound(value=>value+1);setFeedback('');setRoundDone(false);setGuess('');
    if(mode==='sequence-recall')createSequence(round+1);
    if(mode==='color-match')setColorQuestion(nextColorQuestion());
    if(mode==='odd-one-out')setOddQuestion(nextOddQuestion());
    if(mode==='word-scramble')setWordQuestion(nextWordQuestion(round+1));
  }
  function markAnswer(correct:boolean){
    setFeedback(correct?'Nice work!':'Not quite — keep going!');
    if(correct)setScore(value=>value+1);
    setRoundDone(true);
  }
  function chooseSequenceCell(index:number){
    if(showing||roundDone)return;
    const next=[...selected,index],correct=sequence[next.length-1]===index;
    setSelected(next);
    if(!correct){markAnswer(false);return}
    if(next.length===sequence.length)markAnswer(true);
  }
  function submitWord(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!guess.trim())return;
    markAnswer(guess.trim().toLowerCase()===wordQuestion.word);
  }

  return <section className="player panel extra-practice">
    <div className="eyebrow">FREE PRACTICE · NO ACCOUNT NEEDED</div><h1>{titleFor(mode)}</h1>
    {phase==='instructions'&&<><p>{instructionsFor(mode)}</p><p className="muted">Play {roundCount} rounds. Results stay in this browser and are not added to ranked leaderboards.</p><button onClick={start}>Start practice →</button></>}
    {phase==='playing'&&<><div className="game-top"><span>Round {round+1} / {roundCount}</span><span>Score: {score}</span></div><p className="feedback" role="status" aria-live="polite">{feedback||instructionsFor(mode)}</p>
      {mode==='sequence-recall'&&<div className="extra-grid">{Array.from({length:16},(_,index)=><button key={index} className={`cell${highlighted===index?' lit':''}${selected.includes(index)?' matched':''}`} aria-label={`Tile ${index+1}${highlighted===index?' lit':''}`} disabled={showing||roundDone} onClick={()=>chooseSequenceCell(index)}>{highlighted===index?'✦':''}</button>)}</div>}
      {mode==='color-match'&&<><div className="color-prompt" style={{color:categoryColors[colorQuestion.ink]}}>{colors[colorQuestion.word]}</div><div className="color-options" aria-label="Choose the printed color">{colors.map((color,index)=><button key={color} className="color-option" aria-label={color} title={color} style={{background:categoryColors[index]}} disabled={roundDone} onClick={()=>markAnswer(index===colorQuestion.ink)}/>)}</div></>}
      {mode==='odd-one-out'&&<div className="extra-grid">{Array.from({length:16},(_,index)=>{const different=index===oddQuestion.different;return <button key={index} className="cell" aria-label={`Symbol ${index+1}${different?' different':''}`} disabled={roundDone} onClick={()=>markAnswer(different)}>{different?oddQuestion.odd===0?'◆':'●':oddQuestion.common===0?'◆':'●'}</button>})}</div>}
      {mode==='word-scramble'&&<form className="word-form" onSubmit={submitWord}><div className="scrambled-word" aria-label="Scrambled letters">{wordQuestion.scrambled.toUpperCase().split('').join(' ')}</div><label>Unscrambled word<input aria-label="Your word" autoComplete="off" value={guess} onChange={event=>setGuess(event.target.value)} disabled={roundDone} required/></label><button disabled={roundDone}>Check word</button></form>}
      {mode==='sequence-recall'&&showing&&<p role="status">Watch the sequence…</p>}
      {roundDone&&<button onClick={nextRound}>{round===roundCount-1?'See results':'Next round →'}</button>}
    </>}
    {phase==='results'&&<><h2>Practice complete</h2><div className="stats"><div><strong>{score}/{roundCount}</strong>correct</div><div><strong>{Math.round(score/roundCount*100)}%</strong>accuracy</div></div><p>Your practice result isn’t saved to a leaderboard.</p><button onClick={start}>Play again →</button></>}
  </section>;
}
