export type Payload = {rounds?:any[],cards?:number[]};
export type TicTacToePlayer = 'X'|'O';
export type TicTacToeMark = TicTacToePlayer|null;
export const limits:Record<string,number>={'memory-grid':180000,'pair-finder':180000,'quick-match':60000,'focus-finder':120000,'math-sprint':60000};
export function shuffle<T>(values:T[]):T[]{
  const list=[...values];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list;
}
export function pattern(cells=3){return shuffle(Array.from({length:16},(_,i)=>i)).slice(0,cells)}
export function advanceMemory(state:{cells:number;successes:number;failures:number},good:boolean){
  const successes=state.successes+Number(good),failures=state.failures+Number(!good);
  return {cells:state.cells+Number(good&&successes%2===0),successes,failures,ended:failures>=3};
}
export function ticTacToeOutcome(board:TicTacToeMark[]):'X'|'O'|'draw'|null{
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,b,c] of lines)if(board[a]&&board[a]===board[b]&&board[a]===board[c])return board[a];
  return board.every(Boolean)?'draw':null;
}
export function bestTicTacToeMove(board:TicTacToeMark[],computer:TicTacToePlayer='O'):number|null{
  if(board.length!==9||ticTacToeOutcome(board))return null;
  const opponent: TicTacToePlayer=computer==='X'?'O':'X';
  function score(position:TicTacToeMark[],turn:TicTacToePlayer,depth:number):number{
    const outcome=ticTacToeOutcome(position);
    if(outcome===computer)return 10-depth;
    if(outcome===opponent)return depth-10;
    if(outcome==='draw')return 0;
    const maximizing=turn===computer;
    let best=maximizing?-Infinity:Infinity;
    for(let i=0;i<position.length;i++){
      if(position[i])continue;
      position[i]=turn;
      const value=score(position,turn===computer?opponent:computer,depth+1);
      position[i]=null;
      best=maximizing?Math.max(best,value):Math.min(best,value);
    }
    return best;
  }
  let move:number|null=null,best=-Infinity;
  for(let i=0;i<board.length;i++){
    if(board[i])continue;
    const next=[...board];next[i]=computer;
    const value=score(next,opponent,1);
    if(value>best){best=value;move=i}
  }
  return move;
}
export function practicePayload(game:string):Payload{
  const random=(n:number)=>Math.floor(Math.random()*n);
  if(game==='memory-grid')return {rounds:Array.from({length:10},()=>pattern())};
  if(game==='pair-finder')return {cards:shuffle([...Array.from({length:8},(_,i)=>i),...Array.from({length:8},(_,i)=>i)])};
  if(game==='quick-match')return {rounds:shuffle(Array.from({length:120},(_,i)=>{const a=random(4);return [a,i%2===0?a:(a+1+random(3))%4]}))};
  if(game==='focus-finder')return {rounds:Array.from({length:10},()=>random(16))};
  return {rounds:Array.from({length:120},()=>[random(19)+1,random(19)+1])};
}
export function practiceScore(game:string,payload:Payload,answers:any[]){
  let correct=0,errors=0,correctRounds=0;
  if(game==='pair-finder'){
    let previous:number|null=null;
    for(const x of answers){if(previous===null)previous=x;else{if(payload.cards![previous]===payload.cards![x])correct++;else errors++;previous=null}}
  }else answers.forEach((answer,i)=>{
    const expected=payload.rounds![i];
    if(game==='memory-grid'){const hit=answer.filter((v:number)=>expected.includes(v)).length;correct+=hit;errors+=expected.length-hit;correctRounds+=Number(hit===expected.length)}
    else{const target=game==='quick-match'?Number(expected[0]===expected[1]):game==='math-sprint'?expected[0]+expected[1]:expected;correct+=Number(answer===target);errors+=Number(answer!==target)}
  });
  return {score:correct*(game==='memory-grid'?10:100),correct,errors,correctRounds,accuracy:Math.round(correct/Math.max(1,correct+errors)*100),status:'practice'};
}
