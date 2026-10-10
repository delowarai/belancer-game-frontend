import {useEffect,useRef,useState} from 'react';
import {Bodies,Body,Composite,Engine,Events} from 'matter-js';
import './BirdLaunch.css';
import {birdLevels,readBirdProgress,completeBirdLevel,birdCoins,birdPoints,birdDifficulty} from '../games/birdLevels';
import {aimPosition,dragAim,trajectory,BIRD_SPEED,BIRD_AIR,BIRD_GRAVITY} from '../games/birdAim';

const W=1000,H=540,anchor={x:180,y:365};
type View={shots:number;hits:number;phase:'ready'|'flying'|'won'|'lost'};
export default function BirdLaunch(){
  const canvas=useRef<HTMLCanvasElement>(null),control=useRef<{launch:()=>void;aim:(angle:number,power:number)=>void}|null>(null);
  const [generation,setGeneration]=useState(0),[view,setView]=useState<View>({shots:3,hits:0,phase:'ready'});
  const [levelIndex,setLevelIndex]=useState(0);
  const resultDialog=useRef<HTMLDialogElement>(null);
  const [showResult,setShowResult]=useState(false),[earnedCoins,setEarnedCoins]=useState(0);
  const progressRef=useRef(readBirdProgress(null));
  const [progress,setProgress]=useState(()=>{try{return readBirdProgress(localStorage.getItem('belancer-bird-progress-v1'))}catch{return readBirdProgress(null)}});
  const level=birdLevels[levelIndex],difficulty=birdDifficulty(levelIndex);
  progressRef.current=progress;
  useEffect(()=>{const dialog=resultDialog.current;if(showResult&&!dialog?.open)dialog?.showModal();else if(!showResult&&dialog?.open)dialog.close()},[showResult]);
  useEffect(()=>{try{localStorage.setItem('belancer-bird-progress-v1',JSON.stringify(progress))}catch{/* Progress still works for this session. */}},[progress]);
  useEffect(()=>{
    const element=canvas.current!,ctx=element.getContext('2d')!,engine=Engine.create();
    engine.gravity.y=BIRD_GRAVITY;
    const picture=new Image();picture.src='/belancer-bird.png';
    const ground=Bodies.rectangle(W/2,510,W+200,60,{isStatic:true,friction:.8});
    const wood:Body[]=[],targets:Body[]=[];
    for(const [x,height] of level.towers){
      wood.push(Bodies.rectangle(x-29,480-height/2,16,height,{label:'wood',density:difficulty.density,friction:.8}),Bodies.rectangle(x+29,480-height/2,16,height,{label:'wood',density:difficulty.density,friction:.8}),Bodies.rectangle(x,472-height,90,16,{label:'wood',density:difficulty.density,friction:.8}));
      targets.push(Bodies.circle(x,446-height,18,{label:'target',density:.001,friction:.6,restitution:.25}));
    }
    for(let i=0;i<difficulty.shield;i++)wood.push(Bodies.rectangle(375+i*62,480-(75+levelIndex*6)/2,20,75+levelIndex*6,{isStatic:true,label:'shield'}));
    function newBird(){const body=Bodies.circle(anchor.x,anchor.y,23,{label:'bird',frictionAir:BIRD_AIR,restitution:.35,density:.004,friction:.4});Body.setStatic(body,true);return body}
    let bird=newBird();
    Composite.add(engine.world,[ground,...wood,...targets,bird]);
    let shots=level.shots,hits=0,phase:View['phase']='ready',drag=false,pointer:number|null=null,shotAt=0,last=performance.now(),accumulator=0,frame=0;
    const destroyed=new Set<number>(),queued=new Set<Body>(),sparks:{x:number;y:number;life:number}[]=[];
    setShowResult(false);
    const publish=()=>setView({shots,hits,phase});publish();
    let aimAngle=20,aimPower=90;
    function aim(degrees:number,strength:number){if(phase!=='ready')return;aimAngle=degrees;aimPower=strength;Body.setPosition(bird,aimPosition(degrees,strength))}
    function key(event:KeyboardEvent){if(phase!=='ready')return;const keys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','-','=',' '];if(!keys.includes(event.key))return;event.preventDefault();if(event.key===' '){launch();return}aim(Math.max(5,Math.min(65,aimAngle+(event.key==='ArrowUp'||event.key==='ArrowLeft'?2:event.key==='ArrowDown'||event.key==='ArrowRight'?-2:0))),Math.max(30,Math.min(100,aimPower+(event.key==='+'||event.key==='='?5:event.key==='-'?-5:0))))}
    function launch(){
      if(phase!=='ready')return;
      const dx=anchor.x-bird.position.x,dy=anchor.y-bird.position.y;
      if(Math.hypot(dx,dy)<12)return;
      Body.setStatic(bird,false);Body.setVelocity(bird,{x:dx*BIRD_SPEED,y:dy*BIRD_SPEED});shots--;phase='flying';shotAt=0;drag=false;publish();
    }
    control.current={launch,aim};aim(20,90);
    function hit(target:Body){if(destroyed.has(target.id))return;destroyed.add(target.id);queued.add(target);hits++;sparks.push({x:target.position.x,y:target.position.y,life:45});publish()}
    Events.on(engine,'collisionStart',event=>{
      if(phase!=='flying')return;
      for(const pair of event.pairs){
        const target=pair.bodyA.label==='target'?pair.bodyA:pair.bodyB.label==='target'?pair.bodyB:null;
        if(!target)continue;const other=target===pair.bodyA?pair.bodyB:pair.bodyA;
        if((other.label==='bird'||other.label==='wood'||other===ground)&&Math.hypot(other.velocity.x-target.velocity.x,other.velocity.y-target.velocity.y)>difficulty.impact)hit(target);
      }
    });
    function point(event:PointerEvent){const r=element.getBoundingClientRect();return {x:(event.clientX-r.left)*W/r.width,y:(event.clientY-r.top)*H/r.height}}
    function down(event:PointerEvent){
      if(phase!=='ready')return;const p=point(event);
      if(Math.hypot(p.x-bird.position.x,p.y-bird.position.y)>65)return;
      pointer=event.pointerId;drag=true;element.setPointerCapture(pointer);event.preventDefault();
    }
    function move(event:PointerEvent){if(!drag||event.pointerId!==pointer)return;const next=dragAim(point(event));aim(next.angle,next.power);event.preventDefault()}
    function up(event:PointerEvent){if(!drag||event.pointerId!==pointer)return;move(event);launch();pointer=null}
    function cancel(){drag=false;pointer=null;aim(20,90)}
    element.addEventListener('keydown',key);element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);element.addEventListener('pointerup',up);element.addEventListener('pointercancel',cancel);
    function circle(x:number,y:number,r:number,color:string){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
    function draw(now:number){
      accumulator+=Math.min(now-last,50);last=now;
      while(accumulator>=1000/60){Engine.update(engine,1000/60);if(phase==='flying')shotAt+=1000/60;accumulator-=1000/60}
      for(const target of queued)Composite.remove(engine.world,target);queued.clear();
      if(phase==='flying'){
        for(const target of targets)if(!destroyed.has(target.id)&&(target.position.y>505||target.position.x<0||target.position.x>W))hit(target);
        if(hits===targets.length){phase='won';setEarnedCoins(progressRef.current.stars[levelIndex]>0?0:level.coins);setProgress(previous=>completeBirdLevel(previous,levelIndex,shots));setShowResult(true);publish()}
        else if(shotAt>5500||bird.position.x>W+80||bird.position.y>H+80){
          if(shots===0){phase='lost';setEarnedCoins(0);setShowResult(true);publish()}
          else{Composite.remove(engine.world,bird);bird=newBird();Composite.add(engine.world,bird);phase='ready';aim(20,90);publish()}
        }
      }
      ctx.clearRect(0,0,W,H);
      const themes=[['#8BD5EB','#F6E4BE','#D8EFF0','#759FAF','#416A80'],['#9369AC','#F3B27A','#D5B2BB','#806785','#4F4567'],['#172845','#40516B','#687993','#364B67','#243650']];
      const colors=themes[difficulty.theme],sky=ctx.createLinearGradient(0,0,0,480);sky.addColorStop(0,colors[0]);sky.addColorStop(1,colors[1]);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      circle(850,80,38,difficulty.theme===2?'#EDF3D7':'#FFD37C');
      if(difficulty.theme===2)for(let i=0;i<35;i++)circle((i*137)%W,20+(i*43)%200,1.5,'#F2F6FF');
      for(let layer=0;layer<3;layer++)for(let i=0;i<16;i++){
        const x=i*75-layer*23,height=80+((i*47+layer*59)%160),top=480-height-layer*30;
        ctx.fillStyle=colors[2+layer];ctx.fillRect(x,top,62,480-top);
        if(i%3===0){ctx.fillRect(x+12,top-14,38,14);ctx.fillRect(x+30,top-30,3,16)}
        ctx.fillStyle=difficulty.theme===2?'#F5CC87':layer===2?'#ACCFD2':'#FFFFFF35';
        for(let row=0;row<height/24;row++)for(let column=0;column<3;column++)if((row+column+i)%4!==0)ctx.fillRect(x+9+column*16,top+13+row*24,7,10);
      }
      ctx.fillStyle='#445965';ctx.fillRect(0,480,W,60);ctx.fillStyle='#B3C5BF';ctx.fillRect(0,480,W,8);ctx.fillStyle='#F8DB86';for(let x=10;x<W;x+=65)ctx.fillRect(x,520,32,3);
      ctx.lineWidth=12;ctx.strokeStyle='#80552F';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(180,480);ctx.lineTo(180,392);ctx.moveTo(180,410);ctx.lineTo(158,355);ctx.moveTo(180,410);ctx.lineTo(201,355);ctx.stroke();
      for(const block of wood){
        ctx.save();ctx.translate(block.position.x,block.position.y);ctx.rotate(block.angle);
        const bw=Math.hypot(block.vertices[1].x-block.vertices[0].x,block.vertices[1].y-block.vertices[0].y),bh=block.area/bw,metal=block.label==='shield';
        ctx.shadowColor='#102A3550';ctx.shadowBlur=6;ctx.shadowOffsetY=4;
        const finish=ctx.createLinearGradient(-bw/2,0,bw/2,0);finish.addColorStop(0,metal?'#567685':'#A45D32');finish.addColorStop(.45,metal?'#AECBD4':'#F0BC77');finish.addColorStop(1,metal?'#476370':'#B56F3B');ctx.fillStyle=finish;ctx.fillRect(-bw/2,-bh/2,bw,bh);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
        ctx.strokeStyle=metal?'#263E4B':'#794426';ctx.lineWidth=2;ctx.strokeRect(-bw/2,-bh/2,bw,bh);
        if(!metal){ctx.strokeStyle='#8F542755';ctx.lineWidth=1;for(let line=0;line<3;line++){ctx.beginPath();ctx.moveTo(-bw/2+3,-bh/2+4+line*3);ctx.lineTo(bw/2-3,-bh/2+4+line*3);ctx.stroke()}}
        ctx.fillStyle=metal?'#D3E3E9':'#435C62';ctx.fillRect(-bw/2+2,-bh/2+2,bw-4,4);ctx.fillRect(-bw/2+2,bh/2-6,bw-4,4);
        circle(-bw/2+5,-bh/2+4,1.5,'#E4EEF0');circle(bw/2-5,bh/2-4,1.5,'#E4EEF0');ctx.restore();
      }
      const flock=['#EA6D83','#A985E7','#46C3CD','#FFAB50','#6BAAF1'];
      for(let index=0;index<targets.length;index++){
        const target=targets[index];if(destroyed.has(target.id))continue;
        ctx.save();ctx.translate(target.position.x,target.position.y);ctx.rotate(target.angle);
        ctx.fillStyle='#132D3B20';ctx.beginPath();ctx.ellipse(0,20,21,4,0,0,Math.PI*2);ctx.fill();
        circle(0,0,18,flock[index%flock.length]);circle(-11,4,8,'#FFFFFF40');circle(2,9,11,'#FFF5DB');
        ctx.fillStyle=flock[index%flock.length];ctx.beginPath();ctx.moveTo(-5,-15);ctx.lineTo(-2,-27);ctx.lineTo(4,-15);ctx.fill();
        for(const x of [-6,7]){circle(x,-3,6,'#FFF');circle(x+1,-2,3,'#153645');circle(x+2,-3,1,'#FFF')}
        ctx.fillStyle='#F5A13E';ctx.beginPath();ctx.moveTo(-4,3);ctx.lineTo(5,3);ctx.lineTo(1,10);ctx.fill();ctx.restore();
      }
      if(phase==='ready'){
        ctx.strokeStyle='#173D36';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(158,355);ctx.lineTo(bird.position.x,bird.position.y);ctx.lineTo(201,355);ctx.stroke();
        for(const point of trajectory(bird.position))circle(point.x,point.y,3,'#4B8B79');
      }
      ctx.save();ctx.translate(bird.position.x,bird.position.y);ctx.rotate(bird.angle);
      if(picture.complete&&picture.naturalWidth)ctx.drawImage(picture,-32,-32,64,64);else circle(0,0,23,'#D2F53C');ctx.restore();
      for(let i=sparks.length-1;i>=0;i--){const spark=sparks[i];spark.life--;for(let n=0;n<8;n++){const a=n*Math.PI/4,r=(45-spark.life)*1.3;circle(spark.x+Math.cos(a)*r,spark.y+Math.sin(a)*r,Math.max(1,spark.life/10),'#D2F53C')}if(!spark.life)sparks.splice(i,1)}
      frame=requestAnimationFrame(draw);
    }
    frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);control.current=null;element.removeEventListener('keydown',key);element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',up);element.removeEventListener('pointercancel',cancel);Events.off(engine,'collisionStart');Composite.clear(engine.world,false);Engine.clear(engine)};
  },[generation,levelIndex]);
  return <section className="bird-launch panel"><div className="eyebrow">LEVEL {levelIndex+1} / {birdLevels.length} · {level.name}</div><div className="section-heading"><div><h1>Belancer Bird Launch</h1><p>Clear the city flock. Pull back, find your arc, and fly.</p></div><button className="secondary" onClick={()=>{setGeneration(value=>value+1)}}>Restart level ↻</button></div>
    <div className="game-top"><strong>{view.shots} / {level.shots} shots remaining</strong><strong>{view.hits} / {level.towers.length} birds cleared</strong><span>🪙 {birdCoins(progress)} coins · {birdPoints(progress)} total points</span></div>
    <canvas tabIndex={0} ref={canvas} width={W} height={H} aria-label="Bird launch playfield. Drag the bird to aim and release to shoot. Use arrow keys to aim, plus or minus to adjust pull, and Space to launch."/>
    <p role="status" className="feedback">{view.phase==='ready'?'Pull back to aim, then release to fly.':view.phase==='flying'?'Bird in flight…':view.phase==='won'?'Great shot! The city flock is cleared.':'Out of shots. Restart and try another angle.'}</p>
    {(view.phase==='won'||view.phase==='lost')&&<button className="secondary" onClick={()=>setShowResult(true)}>View level result →</button>}
    <dialog ref={resultDialog} className="bird-reward-modal" aria-labelledby="bird-result-title" onCancel={()=>setShowResult(false)} onClose={()=>setShowResult(false)}>
      <button className="bird-modal-close secondary" aria-label="Close level result" onClick={()=>setShowResult(false)}>×</button>
      <div className="bird-medal">{view.phase==='won'?'🏆':'🪶'}</div>
      <div className="eyebrow">LEVEL {levelIndex+1} · {level.name}</div>
      <h2 id="bird-result-title">{view.phase==='won'?'City skies, conquered!':'One more flight?'}</h2>
      <div className="bird-stars">{view.phase==='won'?'★'.repeat(view.shots>=2?3:view.shots===1?2:1):'☆☆☆'}</div>
      <p>{view.phase==='won'?level.badge:'Try a higher arc to pass the city barriers.'}</p>
      <div className="bird-reward-grid"><div><small>Coins earned</small><strong>+{earnedCoins}</strong></div><div><small>Level points</small><strong>{view.hits*100+(view.phase==='won'?view.shots*50:0)}</strong></div><div><small>Saved coins</small><strong>🪙 {birdCoins(progress)}</strong></div><div><small>Saved points</small><strong>{birdPoints(progress)}</strong></div></div>
      <p className="muted">{view.phase==='won'?(earnedCoins?'Reward collected! Your best result is saved.':'Coins already collected. Your best points and stars are kept.'):'Clear every bird target to collect the level reward.'}</p>
      <div className="bird-modal-actions">{view.phase==='won'&&levelIndex<birdLevels.length-1?<button onClick={()=>{setShowResult(false);setLevelIndex(index=>index+1)}}>Next level →</button>:view.phase==='won'?<p>All 11 levels cleared · Bird Champion!</p>:null}<button className="secondary" onClick={()=>{setShowResult(false);setGeneration(value=>value+1)}}>{view.phase==='won'?'Replay level ↻':'Try again ↻'}</button></div>
    </dialog>
    <div className="bird-levels" aria-label="Bird launch levels">{birdLevels.map((item,index)=>{const unlocked=index===0||progress.stars[index-1]>0||progress.stars[index]>0;return <button key={item.name} className={index===levelIndex?'selected':'secondary'} disabled={!unlocked} aria-current={index===levelIndex?'step':undefined} onClick={()=>{if(index===levelIndex)setGeneration(value=>value+1);else setLevelIndex(index)}}>{index+1} {unlocked?progress.stars[index]>0?'★'.repeat(progress.stars[index]):'':'🔒'}</button>})}</div>
    <p className="bird-reward-preview"><strong>{levelIndex<3?'City rookie':levelIndex<7?'Urban expert':'Champion difficulty'}</strong> · {difficulty.shield} steel barriers · Clear {level.name} to earn 🪙 {level.coins} coins and the {level.badge} badge.</p>
    <p className="muted">Drag and release to launch. Keyboard: arrows to aim, +/− to adjust pull, Space to launch. Rewards save on this browser for practice only.</p>

  </section>;
}
