import {useEffect,useRef,useState} from 'react';
import {bestTicTacToeMove,ticTacToeOutcome} from '../games/engine';
import type {TicTacToeMark} from '../games/engine';

type Outcome='X'|'O'|'draw';
const emptyBoard=():TicTacToeMark[]=>Array(9).fill(null);

export default function TicTacToe(){
  const [phase,setPhase]=useState<'instructions'|'countdown'|'playing'|'results'>('instructions');
  const [countdown,setCountdown]=useState(3);
  const [board,setBoard]=useState<TicTacToeMark[]>(emptyBoard);
  const [outcome,setOutcome]=useState<Outcome|null>(null);
  const [thinking,setThinking]=useState(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
  useEffect(()=>{
    if(phase!=='countdown')return;
    if(countdown===0){setPhase('playing');return}
    const next=setTimeout(()=>setCountdown(value=>value-1),1000);
    return()=>clearTimeout(next);
  },[phase,countdown]);

  function start(){
    if(timer.current)clearTimeout(timer.current);
    setBoard(emptyBoard());setOutcome(null);setThinking(false);setCountdown(3);setPhase('countdown');
  }
  function finish(next:TicTacToeMark[]){
    const result=ticTacToeOutcome(next);
    if(result){setOutcome(result);setThinking(false);setPhase('results')}
    return result;
  }
  function play(index:number){
    if(phase!=='playing'||thinking||board[index])return;
    const next=[...board];next[index]='X';setBoard(next);
    if(finish(next))return;
    setThinking(true);
    timer.current=setTimeout(()=>{
      const move=bestTicTacToeMove(next);
      if(move===null){setThinking(false);return}
      const response=[...next];response[move]='O';setBoard(response);
      if(!finish(response))setThinking(false);
    },350);
  }

  return <section className="player panel tic-tac-toe">
    <div className="eyebrow">FREE PRACTICE · VS COMPUTER</div>
    <h1>Tic Tac Toe</h1>
    {phase==='instructions'&&<>
      <p>Get three Xs in a row before the computer. You play first, and the computer will block your wins.</p>
      <p className="muted">This is a local practice game; scores are not saved to leaderboards.</p>
      <button onClick={start}>Start practice →</button>
    </>}
    {phase==='countdown'&&<div role="status" className="symbols">{countdown||'Go!'}</div>}
    {phase==='playing'&&<>
      <p className="feedback" role="status" aria-live="polite">{thinking?'Computer is thinking…':'Your turn · You are X'}</p>
      <div className="tic-tac-toe-board" role="group" aria-label="Tic Tac Toe board">
        {board.map((mark,index)=><button key={index} className={`tic-tac-toe-cell${mark?` mark-${mark.toLowerCase()}`:''}`} aria-label={`Row ${Math.floor(index/3)+1}, column ${index%3+1}: ${mark||'empty'}`} disabled={thinking||Boolean(mark)} onClick={()=>play(index)}>{mark}</button>)}
      </div>
    </>}
    {phase==='results'&&<><h2>{outcome==='X'?'You win!':outcome==='O'?'Computer wins.':'It’s a draw!'}</h2><div className="tic-tac-toe-board result-board" aria-label="Final Tic Tac Toe board">{board.map((mark,index)=><div key={index} className={`tic-tac-toe-cell${mark?` mark-${mark.toLowerCase()}`:''}`}>{mark}</div>)}</div><button onClick={start}>Play again</button></>}
  </section>;
}
