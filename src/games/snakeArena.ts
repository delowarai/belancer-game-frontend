export type Point={x:number;y:number};
export type SnakeMode='survival'|'sprint'|'endless';
export type Snake={id:number;name:string;points:Point[];angle:number;mass:number;alive:boolean;color:number;respawn:number};
export type Food=Point&{id:number;value:number;kind:number};
export type SnakeState={snakes:Snake[];food:Food[];time:number;seed:number;nextFood:number;mode:SnakeMode;finished:boolean;reason:string;eaten:number;kills:number;maxMass:number;boosting:boolean};
export const arenaSize=2600;
export const snakeSkins=[{name:'Jade dragon',color:'#65db64',cost:0},{name:'Berry blast',color:'#ef6891',cost:180},{name:'Ocean pearl',color:'#55cde5',cost:280},{name:'Solar gold',color:'#ffce59',cost:400},{name:'Cosmic violet',color:'#b996ff',cost:550},{name:'Candy stripe',color:'#ff8465',cost:700}];
export type SnakeProgress={coins:number;xp:number;owned:number[];skin:number;theme:number;best:number;matches:number;totalFood:number;totalKills:number;giftDay:string;spinDay:string;chest:boolean;sound:boolean;volume:number;control:'pointer'|'joystick'};
export const freshSnakeProgress=():SnakeProgress=>({coins:200,xp:0,owned:[0],skin:0,theme:0,best:0,matches:0,totalFood:0,totalKills:0,giftDay:'',spinDay:'',chest:false,sound:true,volume:.55,control:'pointer'});
const finite=(v:unknown,max=1e8)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,v)):0;
export function readSnakeProgress(raw:string|null){const base=freshSnakeProgress();try{const p=JSON.parse(raw||'null');if(!p||typeof p!=='object'||Array.isArray(p))return base;const owned=Array.isArray(p.owned)?[...new Set([0,...p.owned.filter((v:unknown)=>Number.isInteger(v)&&Number(v)>=0&&Number(v)<snakeSkins.length)])] as number[]:[0];return {...base,coins:typeof p.coins==='number'?Math.floor(finite(p.coins)):base.coins,xp:finite(p.xp),owned,skin:owned.includes(p.skin)?p.skin:0,theme:Math.floor(finite(p.theme,3)),best:finite(p.best),matches:Math.floor(finite(p.matches)),totalFood:finite(p.totalFood),totalKills:finite(p.totalKills),giftDay:typeof p.giftDay==='string'?p.giftDay:'',spinDay:typeof p.spinDay==='string'?p.spinDay:'',chest:p.chest===true,sound:p.sound!==false,volume:typeof p.volume==='number'?finite(p.volume,1):base.volume,control:p.control==='joystick'?'joystick':'pointer'} as SnakeProgress}catch{return base}}
export function buySnakeSkin(p:SnakeProgress,id:number){if(!Number.isInteger(id)||!snakeSkins[id])return p;if(p.owned.includes(id))return {...p,skin:id};if(p.coins<snakeSkins[id].cost)return p;return {...p,coins:p.coins-snakeSkins[id].cost,owned:[...p.owned,id],skin:id}}
export function claimSnakeGift(p:SnakeProgress,day:string){return p.giftDay===day?p:{...p,coins:p.coins+150,giftDay:day}}
export const spinPrizes=[40,60,100,80,120,50,200,70];
export function spinSnakeWheel(p:SnakeProgress,day:string,value:number){if(p.spinDay===day)return {progress:p,prize:0,index:-1};const index=Math.min(7,Math.max(0,Math.floor((Number.isFinite(value)?value:0)*8)));const prize=spinPrizes[index];return {progress:{...p,coins:p.coins+prize,spinDay:day},prize,index}}
export function claimSnakeChest(p:SnakeProgress){return p.chest||p.totalFood<30?p:{...p,chest:true,coins:p.coins+250}}
function random(s:SnakeState){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const snakeRadius=(snake:Snake)=>Math.min(26,11+Math.sqrt(snake.mass)*.36);
function addFood(s:SnakeState,x?:number,y?:number,value=8){s.food.push({id:s.nextFood++,x:x??60+random(s)*(arenaSize-120),y:y??60+random(s)*(arenaSize-120),value,kind:Math.floor(random(s)*8)})}
function spawn(s:SnakeState,id:number):Snake{const player=id===0;let candidate:Snake;let attempts=0;do{const x=player?arenaSize/2:100+random(s)*(arenaSize-200),y=player?arenaSize/2:100+random(s)*(arenaSize-200),angle=random(s)*Math.PI*2,mass=player?90:100+Math.floor(random(s)*360);candidate={id,name:player?'You':['Mango','Pixel','Clover','Nova','Bubbles','Comet','Pepper','Luna','Bolt','Willow','Echo','Coral','Juno','Orbit','Moss','Sunny'][id-1],points:Array.from({length:Math.floor(mass/7)+8},(_,i)=>({x:x-Math.cos(angle)*i*6,y:y-Math.sin(angle)*i*6})),angle,mass,alive:true,color:id%6,respawn:0};attempts++}while(!player&&attempts<40&&(candidate.points.some(p=>p.x<30||p.y<30||p.x>arenaSize-30||p.y>arenaSize-30||s.snakes.some(other=>other.id!==id&&other.alive&&distance(p,other.points[0])<(other.id===0?300:70)))));return candidate}
export function createSnakeArena(mode:SnakeMode,seed=Date.now()>>>0,skin=0):SnakeState{const s:SnakeState={snakes:[],food:[],time:0,seed,nextFood:0,mode,finished:false,reason:'',eaten:0,kills:0,maxMass:90,boosting:false};for(let i=0;i<17;i++)s.snakes.push(spawn(s,i));s.snakes[0].color=skin;for(let i=0;i<440;i++)addFood(s);for(let i=0;i<25;i++)addFood(s,arenaSize/2-220+random(s)*440,arenaSize/2-220+random(s)*440);return s}
function kill(s:SnakeState,snake:Snake){snake.alive=false;snake.respawn=s.time+4;snake.points.forEach((p,i)=>{if(i%3===0)addFood(s,p.x,p.y,10)});if(snake.id===0){s.finished=true;s.reason='Knocked out! Your head touched another snake.'}}
export function stepSnakeArena(s:SnakeState,angle:number,boost:boolean,dt:number){
 if(s.finished)return;dt=Math.max(0,Math.min(dt,1/30));s.time+=dt;const player=s.snakes[0];s.boosting=boost&&player.mass>65;
 for(const snake of s.snakes){if(!snake.alive){if(snake.id>0&&s.time>=snake.respawn)s.snakes[snake.id]=spawn(s,snake.id);continue}const head=snake.points[0];let target=angle;
  if(snake.id>0){const nearest=s.food.reduce<Food|null>((best,f)=>!best||distance(head,f)<distance(head,best)?f:best,null);target=nearest?Math.atan2(nearest.y-head.y,nearest.x-head.x):snake.angle;
   if(head.x<100||head.x>arenaSize-100||head.y<100||head.y>arenaSize-100)target=Math.atan2(arenaSize/2-head.y,arenaSize/2-head.x);
   const danger=s.snakes.find(other=>other.alive&&other.id!==snake.id&&other.points.some((p,i)=>i%4===0&&distance(head,p)<75));if(danger){const p=danger.points.reduce((best,p)=>distance(head,p)<distance(head,best)?p:best);target=Math.atan2(head.y-p.y,head.x-p.x)}
  }
  const turn=Math.atan2(Math.sin(target-snake.angle),Math.cos(target-snake.angle));snake.angle+=Math.max(-2.5*dt,Math.min(2.5*dt,turn));const accelerating=snake.id===0&&s.boosting,speed=accelerating?230:125;const next={x:head.x+Math.cos(snake.angle)*speed*dt,y:head.y+Math.sin(snake.angle)*speed*dt};snake.points[0]=next;
  for(let i=1;i<snake.points.length;i++){const previous=snake.points[i-1],point=snake.points[i],gap=distance(previous,point);if(gap>6){point.x=previous.x+(point.x-previous.x)*6/gap;point.y=previous.y+(point.y-previous.y)*6/gap}}
  if(accelerating){const old=snake.mass;snake.mass=Math.max(65,snake.mass-dt*12);if(Math.floor(old/8)>Math.floor(snake.mass/8)){const tail=snake.points[snake.points.length-1];addFood(s,tail.x,tail.y,5)}}
  const radius=snakeRadius(snake);if(next.x<radius||next.y<radius||next.x>arenaSize-radius||next.y>arenaSize-radius){kill(s,snake);if(snake.id===0)s.reason='Arena boundary reached. Turn before the glowing edge.';continue}
  for(let i=s.food.length-1;i>=0;i--){if(distance(next,s.food[i])<radius+9){snake.mass+=s.food[i].value;s.food.splice(i,1);if(snake.id===0)s.eaten++}}
  const length=Math.min(340,8+Math.floor(snake.mass/7));while(snake.points.length<length)snake.points.push({...snake.points[snake.points.length-1]});snake.points.length=length;
 }
 // Snapshot collisions before applying knockouts so head-on outcomes are symmetric.
 const victims=new Map<number,number>();for(const snake of s.snakes){if(!snake.alive)continue;const head=snake.points[0];for(const other of s.snakes){if(!other.alive||other.id===snake.id||s.time<3&&(snake.id===0||other.id===0))continue;if(other.points.some(p=>distance(head,p)<(snakeRadius(snake)+snakeRadius(other))*.82)){victims.set(snake.id,other.id);break}}}
 for(const [id,killer] of victims){if(killer===0&&id!==0)s.kills++;kill(s,s.snakes[id])}
 while(s.food.length<440)addFood(s);if(s.food.length>1100)s.food.splice(0,s.food.length-1100);s.maxMass=Math.max(s.maxMass,player.mass);
 const limit=s.mode==='sprint'?90:s.mode==='survival'?180:Infinity;if(!s.finished&&s.time>=limit){s.finished=true;s.reason=s.mode==='sprint'?(s.maxMass>=800?'Growth target achieved!':'Time is up. Aim for 800 weight next time.'):'Survival complete!'}
}
export function endSnakeArena(s:SnakeState){if(!s.finished){s.finished=true;s.reason='Run ended.'}}
export function recordSnakeArena(p:SnakeProgress,s:SnakeState){if(!s.finished)return {progress:p,coins:0,xp:0};const coins=Math.floor(s.eaten/3)+s.kills*20+(s.time>=180&&s.mode==='survival'?60:s.mode==='sprint'&&s.maxMass>=800?50:0),xp=Math.floor(s.eaten*2+s.time/10)+s.kills*15;return {coins,xp,progress:{...p,coins:p.coins+coins,xp:p.xp+xp,best:Math.max(p.best,s.maxMass),matches:p.matches+1,totalFood:p.totalFood+s.eaten,totalKills:p.totalKills+s.kills}}}
