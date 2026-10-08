export type Payload = {rounds?:any[],cards?:number[]};
export function practicePayload(game: string): Payload {
  const random = (n:number) => Math.floor(Math.random()*n);
  if(game==='memory-grid') return {rounds:Array.from({length:10},()=>Array.from({length:16},(_,i)=>i).sort(()=>Math.random()-.5).slice(0,3))};
  if(game==='pair-finder') return {cards:[...Array.from({length:8},(_,i)=>i),...Array.from({length:8},(_,i)=>i)].sort(()=>Math.random()-.5)};
  if(game==='quick-match') return {rounds:Array.from({length:10},()=>[random(4),random(4)])};
  if(game==='focus-finder') return {rounds:Array.from({length:10},()=>random(16))};
  return {rounds:Array.from({length:10},()=>[random(19)+1,random(19)+1])};
}
export function practiceScore(game:string,payload:Payload,answers:any[]) {
  let correct=0,errors=0;
  if(game==='pair-finder'){correct=8; errors=Math.max(0,answers.length/2-8)}
  else payload.rounds!.forEach((expected,i)=>{
    if(game==='memory-grid'){const hit=answers[i].filter((v:number)=>expected.includes(v)).length;correct+=hit;errors+=3-hit}
    else {const target=game==='quick-match'?Number(expected[0]===expected[1]):game==='math-sprint'?expected[0]+expected[1]:expected;correct+=Number(answers[i]===target);errors+=Number(answers[i]!==target)}
  });
  return {score:correct*(game==='memory-grid'?10:100),correct,errors,accuracy:Math.round(correct/(correct+errors)*100),status:'practice'};
}
