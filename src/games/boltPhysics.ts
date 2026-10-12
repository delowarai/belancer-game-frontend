import Matter from 'matter-js';
const {Bodies,Body,Composite,Engine,Query,Constraint,Events}=Matter;
type Body=Matter.Body;
import {boltPoint} from './bolts.js';
import type {BoltLevel,BoltState} from './bolts.js';
export type PlankPose={x:number;y:number;angle:number;originX:number;originY:number};
export type BoltSnapshot={bodies:{id:number;x:number;y:number;angle:number;vx:number;vy:number;angular:number;static:boolean}[];fallen:number[];released:number[];attached:[number,number[]][];hinges:[number,number][]};
export class BoltPhysics{
 readonly engine=Engine.create();
 readonly planks=new Map<number,Body>();
 readonly origins=new Map<number,{x:number;y:number}>();
 readonly fallen=new Set<number>();
 private pins=new Map<number,Body>();
 private released=new Set<number>();
 private hinges=new Map<number,{hole:number;joint:Matter.Constraint}>();
 private attached=new Map<number,number[]>();
 private lastMove=0;
 private balancedFrames=new Map<number,number>();
 private filterContacts:(pairs:Matter.Pair[])=>void=()=>{};
 constructor(readonly level:BoltLevel){
  this.engine.gravity.y=.22;
  const filter=(event:Matter.IEventCollision<Matter.Engine>)=>{for(const pair of event.pairs){pair.isSensor=false;const a=pair.bodyA.parent,b=pair.bodyB.parent;for(const [id,body] of this.planks){const other=a===body?b:b===body?a:null;if(!other)continue;const holes=this.attached.get(id)||[];if(holes.some(h=>this.pins.get(h)===other))pair.isSensor=true;for(const [otherId,otherBody] of this.planks)if(other===otherBody&&holes.some(h=>(this.attached.get(otherId)||[]).includes(h)))pair.isSensor=true}}};
  this.filterContacts=pairs=>filter({pairs} as Matter.IEventCollision<Matter.Engine>);
  Events.on(this.engine,'collisionStart',filter);Events.on(this.engine,'collisionActive',filter);
  for(const plate of level.plates){const parts:Body[]=[];for(let i=1;i<plate.holes.length;i++){const a=boltPoint(plate.holes[i-1]),b=boltPoint(plate.holes[i]);parts.push(Bodies.rectangle((a.x+b.x)/2,(a.y+b.y)/2,Math.hypot(b.x-a.x,b.y-a.y)+48,51,{angle:Math.atan2(b.y-a.y,b.x-a.x)}))}const body=Body.create({parts,friction:.65,frictionStatic:1,restitution:.025,frictionAir:.045,density:.002});this.origins.set(plate.id,{...body.position});Body.setStatic(body,true);this.planks.set(plate.id,body);Composite.add(this.engine.world,body)}
 }
 sync(state:BoltState){
  // Undo restores the initial physical poses rather than reviving a moved plank.
  if(state.moves<this.lastMove){for(const [id,body] of this.planks){if(this.fallen.has(id))Composite.add(this.engine.world,body);Body.setPosition(body,this.origins.get(id)!);Body.setAngle(body,0);Body.setVelocity(body,{x:0,y:0});Body.setAngularVelocity(body,0);Body.setStatic(body,true)}for(const {joint} of this.hinges.values())Composite.remove(this.engine.world,joint);this.hinges.clear();this.fallen.clear();this.released.clear();this.balancedFrames.clear()}
  this.lastMove=state.moves;
  for(const [hole,pin] of this.pins)if(!state.occupied.includes(hole)){Composite.remove(this.engine.world,pin);this.pins.delete(hole)}
  for(const hole of state.occupied)if(!this.pins.has(hole)){const p=boltPoint(hole),pin=Bodies.circle(p.x,p.y,17,{isStatic:true,friction:.7,restitution:.025});this.pins.set(hole,pin);Composite.add(this.engine.world,pin)}
  for(const plate of this.level.plates){if(state.broken?.includes(plate.id)){const hinge=this.hinges.get(plate.id);if(hinge)Composite.remove(this.engine.world,hinge.joint);this.hinges.delete(plate.id);this.attached.set(plate.id,[]);this.released.delete(plate.id);if(!this.fallen.has(plate.id)){Composite.remove(this.engine.world,this.planks.get(plate.id)!);this.fallen.add(plate.id)}continue}const body=this.planks.get(plate.id)!,holes=state.removed.includes(plate.id)?[]:plate.holes.filter(h=>{if(!state.occupied.includes(h))return false;if(body.isStatic||this.hinges.get(plate.id)?.hole===h)return true;const origin=this.origins.get(plate.id)!,p=boltPoint(h),x=p.x-origin.x,y=p.y-origin.y,c=Math.cos(body.angle),s=Math.sin(body.angle);return Math.hypot(body.position.x+c*x-s*y-p.x,body.position.y+s*x+c*y-p.y)<5});this.attached.set(plate.id,holes);const hinge=this.hinges.get(plate.id);
   if(hinge&&(holes.length!==1||holes[0]!==hinge.hole)){Composite.remove(this.engine.world,hinge.joint);this.hinges.delete(plate.id)}
   if(holes.length===1&&!this.hinges.has(plate.id)){if(body.isStatic)Body.setStatic(body,false);const origin=this.origins.get(plate.id)!,p=boltPoint(holes[0]),x=p.x-origin.x,y=p.y-origin.y,c=Math.cos(body.angle),s=Math.sin(body.angle);const joint=Constraint.create({pointA:p,bodyB:body,pointB:{x:c*x-s*y,y:s*x+c*y},length:0,stiffness:.9,damping:.01});this.hinges.set(plate.id,{hole:holes[0],joint});Composite.add(this.engine.world,joint);if(body.position.y<p.y&&Math.abs(body.position.x-p.x)<2)Body.setAngularVelocity(body,.025)}
   if(!holes.length&&!this.released.has(plate.id)){if(body.isStatic)Body.setStatic(body,false);this.released.add(plate.id)}
  }
 }
 private limitMotion(){for(const body of this.planks.values()){if(body.isStatic)continue;const speed=Math.hypot(body.velocity.x,body.velocity.y);if(speed>2.2)Body.setVelocity(body,{x:body.velocity.x*2.2/speed,y:body.velocity.y*2.2/speed});if(Math.abs(body.angularVelocity)>.018)Body.setAngularVelocity(body,Math.sign(body.angularVelocity)*.018)}}
 step(){this.limitMotion();this.filterContacts(this.engine.pairs.list);Engine.update(this.engine,1000/60);this.limitMotion();for(const id of this.released){const body=this.planks.get(id)!;
 // A loose plank cannot remain perfectly balanced on one rounded screw.
 const contacts=new Set<Body>();for(const pair of this.engine.pairs.list){if(!pair.isActive||pair.isSensor)continue;const a=pair.bodyA.parent,b=pair.bodyB.parent;if(a===body)contacts.add(b);else if(b===body)contacts.add(a)}
 const support=[...contacts][0],singlePin=contacts.size===1&&[...this.pins.values()].includes(support)&&support.position.y>body.position.y;
 const resting=singlePin&&body.speed<.25&&Math.abs(body.angularVelocity)<.01,count=resting?(this.balancedFrames.get(id)||0)+1:0;this.balancedFrames.set(id,count);
 if(count>=30){const direction=body.position.x<support.position.x?-1:1;Body.setVelocity(body,{x:direction*.6,y:body.velocity.y});Body.setAngularVelocity(body,direction*.025);this.balancedFrames.set(id,0)}
 if(!this.fallen.has(id)&&Math.min(...body.vertices.map(v=>v.y))>570){this.fallen.add(id);Composite.remove(this.engine.world,body)}}}
 canPlace(hole:number){const p=boltPoint(hole),bodies=[...this.planks.keys()].filter(id=>!this.fallen.has(id)).map(id=>this.planks.get(id)!);return [[0,0],[-18,0],[18,0],[0,-18],[0,18]].every(([x,y])=>Query.point(bodies,{x:p.x+x,y:p.y+y}).length===0)}
 canSelect(hole:number){const p=boltPoint(hole);for(const plate of [...this.level.plates].reverse()){if(this.fallen.has(plate.id))continue;const body=this.planks.get(plate.id)!;if(Query.point([body],p).length)return (this.attached.get(plate.id)||[]).includes(hole)}return true}
 pinSupportCount(hole:number){return [...this.attached.values()].filter(holes=>holes.includes(hole)).length}
 capture():BoltSnapshot{return {bodies:[...this.planks].map(([id,b])=>({id,x:b.position.x,y:b.position.y,angle:b.angle,vx:b.velocity.x,vy:b.velocity.y,angular:b.angularVelocity,static:b.isStatic})),fallen:[...this.fallen],released:[...this.released],attached:[...this.attached].map(([id,holes])=>[id,[...holes]]),hinges:[...this.hinges].map(([id,h])=>[id,h.hole])}}
 restore(snapshot:BoltSnapshot){
  for(const {joint} of this.hinges.values())Composite.remove(this.engine.world,joint);this.hinges.clear();
  for(const pose of snapshot.bodies){const body=this.planks.get(pose.id)!;if(this.fallen.has(pose.id)&&!snapshot.fallen.includes(pose.id))Composite.add(this.engine.world,body);if(!this.fallen.has(pose.id)&&snapshot.fallen.includes(pose.id))Composite.remove(this.engine.world,body);Body.setStatic(body,false);Body.setPosition(body,{x:pose.x,y:pose.y});Body.setAngle(body,pose.angle);Body.setVelocity(body,{x:pose.vx,y:pose.vy});Body.setAngularVelocity(body,pose.angular);Body.setStatic(body,pose.static)}
  this.fallen.clear();for(const id of snapshot.fallen)this.fallen.add(id);this.released=new Set(snapshot.released);this.attached=new Map(snapshot.attached.map(([id,holes])=>[id,[...holes]]));this.balancedFrames.clear();
  for(const [id,hole] of snapshot.hinges){const body=this.planks.get(id)!,origin=this.origins.get(id)!,p=boltPoint(hole),x=p.x-origin.x,y=p.y-origin.y,c=Math.cos(body.angle),s=Math.sin(body.angle);const joint=Constraint.create({pointA:p,bodyB:body,pointB:{x:c*x-s*y,y:s*x+c*y},length:0,stiffness:.9,damping:.01});this.hinges.set(id,{hole,joint});Composite.add(this.engine.world,joint)}Engine.clear(this.engine);
 }
 blockingPins(){const caught:number[]=[];for(const pair of this.engine.pairs.list){if(!pair.isActive)continue;for(const [hole,pin] of this.pins){const other=pair.bodyA===pin?pair.bodyB:pair.bodyB===pin?pair.bodyA:null;if(other&&[...this.released].some(id=>this.planks.get(id)===other.parent))caught.push(hole)}}return [...new Set(caught)]}
 poses(){return [...this.planks].map(([id,body])=>{const origin=this.origins.get(id)!;return [id,{x:body.position.x,y:body.position.y,angle:body.angle,originX:origin.x,originY:origin.y}] as const})}
 dispose(){Events.off(this.engine,'collisionStart');Events.off(this.engine,'collisionActive');Composite.clear(this.engine.world,false);Engine.clear(this.engine)}
}
