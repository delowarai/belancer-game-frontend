export type Bottles=number[][];
export const CAPACITY=4,LEVELS=24;
export function solved(board:Bottles){return board.every(b=>!b.length||(b.length===4&&b.every(c=>c===b[0])))}
export function pour(board:Bottles,from:number,to:number):Bottles|null{
 const a=board[from],b=board[to];if(!a||!b||from===to||!a.length||b.length===4||(b.length&&b.at(-1)!==a.at(-1)))return null;
 const color=a.at(-1)!;let count=1;while(count<a.length&&a[a.length-1-count]===color)count++;
 count=Math.min(count,4-b.length);const next=board.map(b=>[...b]);next[from].splice(a.length-count,count);next[to].push(...Array(count).fill(color));return next;
}
export function solution(board:Bottles,limit=60000):[number,number][]|null{
 const seen=new Set<string>();let visits=0;
 function search(state:Bottles,path:[number,number][]):[number,number][]|null{
  if(solved(state))return path;if(++visits>limit||path.length>100)return null;
  const key=state.map(b=>b.join(',')).sort().join('|');if(seen.has(key))return null;seen.add(key);
  for(let i=0;i<state.length;i++){
   const a=state[i];if(!a.length||(a.length===4&&a.every(c=>c===a[0])))continue;let empty=false;
   for(let j=0;j<state.length;j++){
    if(!state[j].length){if(empty||a.every(c=>c===a[0]))continue;empty=true}
    const next=pour(state,i,j);if(next){const result=search(next,[...path,[i,j]]);if(result)return result}
   }
  }return null;
 }return search(board,[]);
}
export function levelBoard(level:number):Bottles{
 const colors=Math.min(6,3+Math.floor((level-1)/6));let seed=level*7919;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let attempt=0;attempt<35;attempt++){
  const values=Array.from({length:colors*4},(_,i)=>Math.floor(i/4));
  for(let i=values.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}
  const board=Array.from({length:colors},(_,i)=>values.slice(i*4,i*4+4)).concat([[],[]]);if(!solved(board)&&solution(board,18000))return board;
 }
 return [[0,1,2,0],[1,2,0,1],[2,0,1,2],[],[]];
}
