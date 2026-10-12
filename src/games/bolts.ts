export type BoltPlate={id:number;holes:number[];color:string};
export type BoltLevel={name:string;tier:string;plates:BoltPlate[];parking:number;coins:number};
export type BoltState={occupied:number[];removed:number[];moves:number;extraHoles?:number[];broken?:number[]};
const route=[0,1,5,4,8,9,10,6,2,3,7,11,15,14,13,12];
export const boltPoint=(hole:number)=>hole<16?{x:75+(hole%4)*100,y:70+Math.floor(hole/4)*100}:{x:hole===19?75:175+(hole-16)*100,y:490};
export const boltLevels:BoltLevel[]=Array.from({length:20},(_,index)=>{
  const path=route.map(h=>{let x=h%4,y=Math.floor(h/4);for(let i=0;i<index%4;i++){const next=3-y;y=x;x=next}if(index%2)x=3-x;return y*4+x});
  const count=3+Math.floor(index/2),hard=index>=12,plates:BoltPlate[]=[];
  for(let i=0;i<count;i++){const holes=path.slice(i,i+(hard&&i%3===0?3:2));plates.push({id:i,holes,color:['#45acc5','#d45873','#dda13b','#8b79c7'][i%4]})}
  return {name:['Workshop','Copper Lane','Blue Foundry','Sunset Works'][index%4]+' '+(index+1),tier:index<6?'Easy':index<12?'Medium':'Hard',plates,parking:hard?3:2,coins:30+index*10};
});
export function boltHoles(level:BoltLevel,state?:BoltState){const used=[...new Set(level.plates.flatMap(p=>p.holes))];return [...used,...(level.plates.length>=8?Array.from({length:16},(_,i)=>i).filter(h=>!used.includes(h)).slice(0,level.plates.length>=12?3:2):[]),...Array.from({length:level.parking},(_,i)=>16+i),...(state?.extraHoles||[])]}
export function initialBolts(level:BoltLevel):BoltState{return {occupied:[...new Set(level.plates.flatMap(p=>p.holes))],removed:[],moves:0}}
export function activePlates(level:BoltLevel,state:BoltState){return level.plates.filter(p=>!state.removed.includes(p.id))}
function onPlate(hole:number,plate:BoltPlate){const point=boltPoint(hole);for(let i=1;i<plate.holes.length;i++){const a=boltPoint(plate.holes[i-1]),b=boltPoint(plate.holes[i]),dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy)));if(Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy)<27)return true}return false}
export function boltExposed(level:BoltLevel,state:BoltState,hole:number){const covering=activePlates(level,state).filter(p=>onPlate(hole,p));return !covering.length||covering[covering.length-1].holes.includes(hole)}
export function boltDestination(level:BoltLevel,state:BoltState,hole:number,physicalClear?:boolean){return hole>=0&&hole<20&&boltHoles(level,state).includes(hole)&&!state.occupied.includes(hole)&&(physicalClear??!activePlates(level,state).some(p=>onPlate(hole,p)))}
export function moveBolt(level:BoltLevel,state:BoltState,from:number,to:number,physicalClear?:boolean,physicalExposed?:boolean):BoltState|null{
  if(!state.occupied.includes(from)||!(physicalExposed??boltExposed(level,state,from))||!boltDestination(level,state,to,physicalClear))return null;
  const occupied=state.occupied.filter(h=>h!==from).concat(to),removed=[...state.removed];
  for(const plate of activePlates(level,state))if(!plate.holes.some(h=>occupied.includes(h)))removed.push(plate.id);
  return {...state,occupied,removed,moves:state.moves+1};
}
export function boltHint(level:BoltLevel,state:BoltState):{from:number;to:number}|null{
  const plates=activePlates(level,state);if(!plates.length)return null;
  for(const plate of [...plates].reverse())for(const from of [...plate.holes].reverse())if(state.occupied.includes(from)&&boltExposed(level,state,from))for(let to=16;to<16+level.parking+16;to++){const destination=to<16+level.parking?to:to-(16+level.parking);if(boltDestination(level,state,destination))return {from,to:destination}}
  return null;
}

export const boltBoosterCost=50;
export type BoltBooster='unscrew'|'hammer'|'unlock';
export function useBoltBooster(level:BoltLevel,state:BoltState,kind:BoltBooster,target:number,balance:number,allowed=true):BoltState|null{
 if(balance<boltBoosterCost||!allowed)return null;
 if(kind==='unlock')return state.extraHoles?.includes(19)?null:{...state,extraHoles:[19],moves:state.moves+1};
 if(kind==='hammer')return !level.plates.some(p=>p.id===target)||state.broken?.includes(target)?null:{...state,broken:[...(state.broken||[]),target],removed:[...new Set([...state.removed,target])],moves:state.moves+1};
 if(!state.occupied.includes(target))return null;
 const occupied=state.occupied.filter(h=>h!==target),removed=[...state.removed];
 for(const plate of activePlates(level,state))if(!plate.holes.some(h=>occupied.includes(h)))removed.push(plate.id);
 return {...state,occupied,removed,moves:state.moves+1};
}
