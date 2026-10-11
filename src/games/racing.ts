export type RaceMode='career'|'challenge'|'endless'|'free';
export type RaceSettings={auto:boolean;sound:boolean;volume:number;units:'km'|'mi'};
export const raceCars=[
 {name:'Swift',cost:0,speed:46,acceleration:8,handling:5.2,brake:20},
 {name:'Pulse GT',cost:900,speed:50,acceleration:9,handling:5.6,brake:22},
 {name:'Apex',cost:2100,speed:54,acceleration:10,handling:6,brake:24},
];
export const racePaints=['#d6fa35','#36b5cf','#f06b49','#ae8fff','#f1f3ef'];
export const raceLevels=Array.from({length:12},(_,i)=>({
 id:i,name:['Greenway','City Lights','Coastal Run','Desert Gold'][i%4],theme:i%4,
 tier:i<4?'Easy':i<8?'Medium':'Hard',distance:650+i*70,time:35+i*1.9,
 rivalSpeed:30+i*.95,traffic:8+i*2,reward:180+i*35,
}));
export type RaceProgress={coins:number;car:number;owned:number[];paint:number;upgrades:number[];stars:number[];challengeStars:number[];races:number;distance:number;overtakes:number;maxSpeed:number;xp:number;bestEndless:number;settings:RaceSettings};
export const freshRaceProgress=():RaceProgress=>({coins:500,car:0,owned:[0],paint:0,upgrades:[0,0,0],stars:Array(12).fill(0),challengeStars:Array(12).fill(0),races:0,distance:0,overtakes:0,maxSpeed:0,xp:0,bestEndless:0,settings:{auto:true,sound:false,volume:.35,units:'km'}});
const finite=(v:unknown,max=1e8)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,v)):0;
export function readRaceProgress(raw:string|null):RaceProgress{
 const base=freshRaceProgress();try{const p=JSON.parse(raw||'null');if(!p||typeof p!=='object'||Array.isArray(p))return base;
 const stars=(v:unknown)=>Array.from({length:12},(_,i)=>Array.isArray(v)?Math.floor(finite(v[i],3)):0);
 const owned=Array.isArray(p.owned)?[...new Set([0,...p.owned.filter((i:unknown)=>Number.isInteger(i)&&Number(i)>=0&&Number(i)<3)])] as number[]:[0];
 return {...base,coins:finite(p.coins),owned,car:owned.includes(p.car)?p.car:0,paint:Math.floor(finite(p.paint,4)),upgrades:Array.from({length:3},(_,i)=>Array.isArray(p.upgrades)?Math.floor(finite(p.upgrades[i],4)):0),stars:stars(p.stars),challengeStars:stars(p.challengeStars),races:Math.floor(finite(p.races)),distance:finite(p.distance),overtakes:Math.floor(finite(p.overtakes)),maxSpeed:finite(p.maxSpeed,300),xp:finite(p.xp),bestEndless:finite(p.bestEndless),settings:{auto:p.settings?.auto!==false,sound:p.settings?.sound===true,volume:typeof p.settings?.volume==='number'?finite(p.settings.volume,1):.35,units:p.settings?.units==='mi'?'mi':'km'}};
 }catch{return base}
}
export function carStats(p:RaceProgress){const car=raceCars[p.car];return {...car,speed:car.speed+p.upgrades[0]*1.8,handling:car.handling+p.upgrades[1]*.35,brake:car.brake+p.upgrades[2]*2}}
export function buyCar(p:RaceProgress,index:number){const car=raceCars[index];if(!car||p.owned.includes(index)||p.coins<car.cost)return p;return {...p,coins:p.coins-car.cost,owned:[...p.owned,index],car:index}}
export function upgradeCar(p:RaceProgress,index:number){if(!Number.isInteger(index)||index<0||index>2||p.upgrades[index]>=4)return p;const cost=150+p.upgrades[index]*120;if(p.coins<cost)return p;return {...p,coins:p.coins-cost,upgrades:p.upgrades.map((v,i)=>i===index?v+1:v)}}
export type Racer={id:number;name:string;x:number;distance:number;speed:number;finish:number|null;color:string};
export type Traffic={id:number;x:number;distance:number;speed:number;passed:boolean;color:string};
export type RaceInput={steer:number;accelerate:boolean;brake:boolean};
export type RaceState={mode:RaceMode;level:number;elapsed:number;distance:number;x:number;speed:number;health:number;hits:number;overtakes:number;maxSpeed:number;cooldown:number;rivals:Racer[];traffic:Traffic[];status:'running'|'finished';position:number;success:boolean;reason:string};
export function createRace(level:number,mode:RaceMode):RaceState{
 const config=raceLevels[level];return {mode,level,elapsed:0,distance:0,x:0,speed:0,health:100,hits:0,overtakes:0,maxSpeed:0,cooldown:0,status:'running',position:1,success:false,reason:'',
 rivals:Array.from({length:4},(_,i)=>({id:i,name:['Nova','Echo','Blaze','Vega'][i],x:[-3.2,3.2,-1.6,1.6][i],distance:4+i*5,speed:0,finish:null,color:['#ed775a','#6fc4ea','#b69ced','#f2f0e5'][i]})),
 traffic:Array.from({length:config.traffic},(_,i)=>({id:i,x:[-3.2,0,3.2][(i*7+level)%3],distance:110+i*(65-level*1.7),speed:17+(i%4)*2.5,passed:false,color:['#407f98','#a9493f','#a39a76'][i%3]}))};
}
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function stepRace(s:RaceState,input:RaceInput,p:RaceProgress,dt:number){
 if(s.status!=='running')return;dt=clamp(dt,0,.05);const config=raceLevels[s.level],stats=carStats(p),previous=s.distance;
 s.elapsed+=dt;s.cooldown=Math.max(0,s.cooldown-dt);
 const acceleration=input.brake?-stats.brake:input.accelerate?stats.acceleration:-4;
 s.speed=clamp(s.speed+acceleration*dt,0,stats.speed);s.x=clamp(s.x+input.steer*stats.handling*dt*(.35+.65*s.speed/stats.speed),-5,5);
 if(Math.abs(s.x)>4.25)s.speed=Math.max(0,s.speed-12*dt);
 s.distance+=s.speed*dt;s.maxSpeed=Math.max(s.maxSpeed,s.speed*3.6);
 for(const rival of s.rivals){
  if(rival.finish!==null)continue;
  const target=config.rivalSpeed+(rival.id-1.5)*1.2;
  const obstacle=s.traffic.find(t=>t.distance>rival.distance&&t.distance-rival.distance<35&&Math.abs(t.x-rival.x)<1.4);
  if(obstacle){const alternatives=[-3.2,0,3.2].filter(x=>Math.abs(x-obstacle.x)>1.5&&!s.traffic.some(t=>Math.abs(t.distance-rival.distance)<30&&Math.abs(t.x-x)<1.4));if(alternatives.length)rival.x+=clamp(alternatives[rival.id%alternatives.length]-rival.x,-dt*2,dt*2)}
  rival.speed=clamp(rival.speed+((obstacle&&Math.abs(obstacle.x-rival.x)<1.4)?-10:6.8)*dt,0,target);
  const start=rival.distance;rival.distance+=rival.speed*dt;
  if((s.mode==='career'||s.mode==='challenge')&&rival.distance>=config.distance)rival.finish=s.elapsed-dt+(config.distance-start)/Math.max(1,rival.speed);
 }
 const collide=(x:number,distance:number)=>{
  if(s.cooldown||Math.abs(s.x-x)>1.35)return;
  if(Math.abs(distance-s.distance)<3.7||(distance>=previous&&distance<=s.distance)){s.health=Math.max(0,s.health-25);s.hits++;s.speed*=.42;s.cooldown=1.4}
 };
 for(const t of s.traffic){t.distance+=t.speed*dt;collide(t.x,t.distance);if(!t.passed&&t.distance<s.distance-5){t.passed=true;s.overtakes++}if((s.mode==='free'||s.mode==='endless')&&t.distance<s.distance-50){t.distance=s.distance+250+t.id*25;t.passed=false}}
 for(const rival of s.rivals)if(rival.finish===null)collide(rival.x,rival.distance);
 s.position=1+s.rivals.filter(r=>r.distance>s.distance).length;
 const timed=s.mode==='career'||s.mode==='challenge';
 if(s.health===0){s.status='finished';s.reason='Car damaged. Try braking earlier.'}
 else if(timed&&s.distance>=config.distance){
  const finish=s.elapsed-dt+(config.distance-previous)/Math.max(1,s.speed);s.elapsed=finish;s.distance=config.distance;
  s.position=1+s.rivals.filter(r=>r.finish!==null&&r.finish<=finish).length;
  s.success=s.position<=3&&(s.mode!=='challenge'||s.elapsed<=config.time);s.status='finished';s.reason=s.success?'Podium finish!':s.position>3?'Finish in the top three to advance.':'Time target missed. Try again.';
 }else if(s.mode==='challenge'&&s.elapsed>=config.time){s.status='finished';s.reason='Time is up. Finish before the countdown ends.'}
}
export function finishDrive(s:RaceState){if(s.status==='running'){s.status='finished';s.reason='Drive complete.';s.success=false}}
export function recordRace(p:RaceProgress,s:RaceState){
 if(s.status!=='finished')return {progress:p,earned:0};
 const key=s.mode==='challenge'?'challengeStars':'stars',stars=s.success?4-s.position:0,previous=p[key][s.level];
 const earned=s.success?Math.max(0,stars-previous)*raceLevels[s.level].reward:0;
 const progress={...p,coins:p.coins+earned,races:p.races+1,distance:p.distance+s.distance,overtakes:p.overtakes+s.overtakes,maxSpeed:Math.max(p.maxSpeed,s.maxSpeed),xp:p.xp+Math.floor(s.distance/10)+s.overtakes*5+(s.success?100:0),bestEndless:s.mode==='endless'?Math.max(p.bestEndless,s.distance):p.bestEndless};
 if(s.success)progress[key]=p[key].map((v,i)=>i===s.level?Math.max(v,stars):v);
 return {progress,earned};
}
