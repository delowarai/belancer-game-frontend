import {useEffect,useRef,useState} from 'react';
import {Bodies,Body,Composite,Engine,Events} from 'matter-js';
import './BirdLaunch.css';

const W=1000,H=540,anchor={x:180,y:365},MAX_PULL=105;
type View={shots:number;hits:number;phase:'ready'|'flying'|'won'|'lost'};
export default function BirdLaunch(){
  const canvas=useRef<HTMLCanvasElement>(null),control=useRef<{launch:()=>void;aim:(angle:number,power:number)=>void}|null>(null);
  const [generation,setGeneration]=useState(0),[view,setView]=useState<View>({shots:3,hits:0,phase:'ready'});
  const [angle,setAngle]=useState(20),[power,setPower]=useState(90);
  useEffect(()=>{
    const element=canvas.current!,ctx=element.getContext('2d')!,engine=Engine.create();
    engine.gravity.y=.9;
    const picture=new Image();picture.src='/belancer-bird.png';
    const ground=Bodies.rectangle(W/2,510,W+200,60,{isStatic:true,friction:.8});
    const wood:Body[]=[],targets:Body[]=[];
    for(const x of [670,785,900]){
      wood.push(Bodies.rectangle(x-29,445,16,70,{label:'wood',density:.002,friction:.7}),Bodies.rectangle(x+29,445,16,70,{label:'wood',density:.002,friction:.7}),Bodies.rectangle(x,402,90,16,{label:'wood',density:.002,friction:.7}));
      targets.push(Bodies.circle(x,374,18,{label:'target',density:.001,friction:.6,restitution:.25}));
    }
    function newBird(){const body=Bodies.circle(anchor.x,anchor.y,23,{label:'bird',frictionAir:.002,restitution:.35,density:.004,friction:.4});Body.setStatic(body,true);return body}
    let bird=newBird();
    Composite.add(engine.world,[ground,...wood,...targets,bird]);
    let shots=3,hits=0,phase:View['phase']='ready',drag=false,pointer:number|null=null,shotAt=0,last=performance.now(),accumulator=0,frame=0;
    const destroyed=new Set<number>(),queued=new Set<Body>(),sparks:{x:number;y:number;life:number}[]=[];
    const publish=()=>setView({shots,hits,phase});publish();
    function aim(degrees:number,strength:number){if(phase!=='ready')return;const a=degrees*Math.PI/180;Body.setPosition(bird,{x:anchor.x-Math.cos(a)*MAX_PULL*strength/100,y:anchor.y+Math.sin(a)*MAX_PULL*strength/100})}
    function launch(){
      if(phase!=='ready')return;
      const dx=anchor.x-bird.position.x,dy=anchor.y-bird.position.y;
      if(Math.hypot(dx,dy)<12)return;
      Body.setStatic(bird,false);Body.setVelocity(bird,{x:dx*.21,y:dy*.21});shots--;phase='flying';shotAt=performance.now();drag=false;publish();
    }
    control.current={launch,aim};aim(20,90);
    function hit(target:Body){if(destroyed.has(target.id))return;destroyed.add(target.id);queued.add(target);hits++;sparks.push({x:target.position.x,y:target.position.y,life:45});publish()}
    Events.on(engine,'collisionStart',event=>{
      if(phase!=='flying')return;
      for(const pair of event.pairs){
        const target=pair.bodyA.label==='target'?pair.bodyA:pair.bodyB.label==='target'?pair.bodyB:null;
        if(!target)continue;const other=target===pair.bodyA?pair.bodyB:pair.bodyA;
        if((other.label==='bird'||other.label==='wood'||other===ground)&&Math.hypot(other.velocity.x-target.velocity.x,other.velocity.y-target.velocity.y)>2.4)hit(target);
      }
    });
    function point(event:PointerEvent){const r=element.getBoundingClientRect();return {x:(event.clientX-r.left)*W/r.width,y:(event.clientY-r.top)*H/r.height}}
    function down(event:PointerEvent){
      if(phase!=='ready')return;const p=point(event);
      if(Math.hypot(p.x-bird.position.x,p.y-bird.position.y)>65)return;
      pointer=event.pointerId;drag=true;element.setPointerCapture(pointer);event.preventDefault();
    }
    function move(event:PointerEvent){if(!drag||event.pointerId!==pointer)return;const p=point(event);let dx=Math.min(-10,p.x-anchor.x),dy=Math.max(-15,Math.min(100,p.y-anchor.y));const distance=Math.hypot(dx,dy);if(distance>MAX_PULL){dx*=MAX_PULL/distance;dy*=MAX_PULL/distance}Body.setPosition(bird,{x:anchor.x+dx,y:anchor.y+dy});event.preventDefault()}
    function up(event:PointerEvent){if(!drag||event.pointerId!==pointer)return;move(event);launch();pointer=null}
    function cancel(){drag=false;pointer=null;aim(20,90)}
    element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);element.addEventListener('pointerup',up);element.addEventListener('pointercancel',cancel);
    function circle(x:number,y:number,r:number,color:string){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
    function draw(now:number){
      accumulator+=Math.min(now-last,50);last=now;
      while(accumulator>=1000/60){Engine.update(engine,1000/60);accumulator-=1000/60}
      for(const target of queued)Composite.remove(engine.world,target);queued.clear();
      if(phase==='flying'){
        for(const target of targets)if(!destroyed.has(target.id)&&(target.position.y>505||target.position.x<0||target.position.x>W))hit(target);
        if(hits===3){phase='won';publish()}
        else if(now-shotAt>5500||bird.position.x>W+80||bird.position.y>H+80){
          if(shots===0){phase='lost';publish()}
          else{Composite.remove(engine.world,bird);bird=newBird();Composite.add(engine.world,bird);phase='ready';setAngle(20);setPower(90);aim(20,90);publish()}
        }
      }
      ctx.clearRect(0,0,W,H);const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#CEEDE5');sky.addColorStop(1,'#F4F8DC');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      circle(880,90,42,'#D2F53C');ctx.fillStyle='#B4D8AE';ctx.beginPath();ctx.moveTo(0,480);ctx.quadraticCurveTo(280,230,600,480);ctx.quadraticCurveTo(810,295,1000,455);ctx.lineTo(1000,H);ctx.lineTo(0,H);ctx.fill();
      ctx.fillStyle='#709B75';ctx.fillRect(0,480,W,60);ctx.fillStyle='#416A53';ctx.fillRect(0,480,W,8);
      ctx.lineWidth=12;ctx.strokeStyle='#80552F';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(180,480);ctx.lineTo(180,392);ctx.moveTo(180,410);ctx.lineTo(158,355);ctx.moveTo(180,410);ctx.lineTo(201,355);ctx.stroke();
      for(const block of wood){ctx.save();ctx.translate(block.position.x,block.position.y);ctx.rotate(block.angle);ctx.fillStyle='#C78A4C';// Preserve the original wood proportions while rotating.
        const horizontal=block.area>1200;const bw=horizontal?90:16,bh=horizontal?16:70;ctx.fillRect(-bw/2,-bh/2,bw,bh);ctx.strokeStyle='#87592F';ctx.lineWidth=2;ctx.strokeRect(-bw/2,-bh/2,bw,bh);ctx.restore();
      }
      for(const target of targets)if(!destroyed.has(target.id)){circle(target.position.x,target.position.y,18,'#C2532D');circle(target.position.x,target.position.y,11,'#FFF4D6');circle(target.position.x,target.position.y,5,'#C2532D')}
      if(phase==='ready'){
        ctx.strokeStyle='#173D36';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(158,355);ctx.lineTo(bird.position.x,bird.position.y);ctx.lineTo(201,355);ctx.stroke();
        const vx=(anchor.x-bird.position.x)*.21,vy=(anchor.y-bird.position.y)*.21;
        for(let t=4;t<45;t+=4)circle(bird.position.x+vx*t,bird.position.y+vy*t+.25*t*t,3,'#4B8B79');
      }
      ctx.save();ctx.translate(bird.position.x,bird.position.y);ctx.rotate(bird.angle);
      if(picture.complete&&picture.naturalWidth)ctx.drawImage(picture,-32,-32,64,64);else circle(0,0,23,'#D2F53C');ctx.restore();
      for(let i=sparks.length-1;i>=0;i--){const spark=sparks[i];spark.life--;for(let n=0;n<8;n++){const a=n*Math.PI/4,r=(45-spark.life)*1.3;circle(spark.x+Math.cos(a)*r,spark.y+Math.sin(a)*r,Math.max(1,spark.life/10),'#D2F53C')}if(!spark.life)sparks.splice(i,1)}
      frame=requestAnimationFrame(draw);
    }
    frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);control.current=null;element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',up);element.removeEventListener('pointercancel',cancel);Events.off(engine,'collisionStart');Composite.clear(engine.world,false);Engine.clear(engine)};
  },[generation]);
  return <section className="bird-launch panel"><div className="eyebrow">FREE PRACTICE · YOUR BIRD, YOUR SHOT</div><div className="section-heading"><div><h1>Belancer Bird Launch</h1><p>Pull the bird back, aim at the towers, and release.</p></div><button className="secondary" onClick={()=>{setAngle(20);setPower(90);setGeneration(value=>value+1)}}>Restart level ↻</button></div>
    <div className="game-top"><strong>{view.shots} / 3 shots remaining</strong><strong>{view.hits} / 3 targets hit</strong><span>{view.hits*100} points</span></div>
    <canvas ref={canvas} width={W} height={H} aria-label="Bird launch playfield. Drag the bird to aim and release to shoot. You can also use the angle, power and launch controls below."/>
    <p role="status" className="feedback">{view.phase==='ready'?'Your turn — drag the bird or use the controls below.':view.phase==='flying'?'Bird in flight…':view.phase==='won'?'Great shot! All three targets cleared.':'Out of shots. Restart and try another angle.'}</p>
    {(view.phase==='won'||view.phase==='lost')&&<div className="bird-result"><h2>{view.phase==='won'?'Level complete!':'Try again!'}</h2><p>{view.hits===3?'★★★':view.hits===2?'★★☆':view.hits===1?'★☆☆':'☆☆☆'} · {view.hits*100} practice points</p></div>}
    <div className="bird-controls"><label>Angle · {angle}°<input type="range" min="5" max="65" value={angle} disabled={view.phase!=='ready'} onChange={e=>{const next=Number(e.target.value);setAngle(next);control.current?.aim(next,power)}}/></label><label>Power · {power}%<input type="range" min="30" max="100" value={power} disabled={view.phase!=='ready'} onChange={e=>{const next=Number(e.target.value);setPower(next);control.current?.aim(angle,next)}}/></label><button disabled={view.phase!=='ready'} onClick={()=>{control.current?.aim(angle,power);control.current?.launch()}}>Launch bird ↗</button></div>
    <p className="muted">One practice level · Mouse, touch or keyboard controls · Scores stay in this session.</p>
  </section>;
}




