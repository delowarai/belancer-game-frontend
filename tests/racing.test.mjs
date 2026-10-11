import test from 'node:test';
import assert from 'node:assert/strict';
import {raceLevels,raceCars,createRace,stepRace,finishDrive,freshRaceProgress,readRaceProgress,buyCar,upgradeCar,recordRace} from '../.test-build/racing.js';
const gas={steer:0,accelerate:true,brake:false};
test('twelve competitive levels increase distance, traffic and rival pace',()=>{
 assert.equal(raceLevels.length,12);for(let i=1;i<12;i++){assert.ok(raceLevels[i].distance>raceLevels[i-1].distance);assert.ok(raceLevels[i].traffic>raceLevels[i-1].traffic);assert.ok(raceLevels[i].rivalSpeed>raceLevels[i-1].rivalSpeed)}
 for(let i=0;i<12;i++)assert.equal(createRace(i,'career').rivals.length,4);
});
test('accelerator, brakes, steering and damage work at a fixed timestep',()=>{
 const p=freshRaceProgress(),s=createRace(0,'career');s.traffic=[];s.rivals=[];
 for(let i=0;i<120;i++)stepRace(s,gas,p,1/60);assert.ok(s.speed>15);assert.ok(s.distance>10);
 const speed=s.speed;stepRace(s,{steer:1,accelerate:false,brake:true},p,.05);assert.ok(s.x>0);assert.ok(s.speed<speed);
 s.traffic=[{id:0,x:s.x,distance:s.distance+1,speed:0,passed:false,color:'#fff'}];stepRace(s,gas,p,.01);assert.equal(s.health,75);const health=s.health;stepRace(s,gas,p,.01);assert.equal(s.health,health,'collision cooldown prevents duplicate hits');
});
test('finish position and challenge deadline determine advancement',()=>{
 const p=freshRaceProgress(),s=createRace(0,'career');s.traffic=[];s.elapsed=13;s.distance=649;s.speed=40;s.rivals[0].finish=12;s.rivals[0].distance=650;
 stepRace(s,gas,p,.05);assert.equal(s.status,'finished');assert.equal(s.position,2);assert.equal(s.success,true);const distance=s.distance;stepRace(s,gas,p,.05);assert.equal(s.distance,distance);
 const late=createRace(0,'challenge');late.elapsed=35;stepRace(late,gas,p,.01);assert.equal(late.status,'finished');assert.equal(late.success,false);
});
test('best podium rewards cannot be farmed by replaying the same result',()=>{
 const p=freshRaceProgress(),s=createRace(0,'career');s.status='finished';s.success=true;s.position=2;s.distance=650;
 const first=recordRace(p,s);assert.equal(first.earned,360);assert.equal(first.progress.stars[0],2);
 const repeat=recordRace(first.progress,s);assert.equal(repeat.earned,0);s.position=1;const improved=recordRace(repeat.progress,s);assert.equal(improved.earned,180);assert.equal(improved.progress.stars[0],3);
 s.mode='challenge';assert.equal(recordRace(improved.progress,s).earned,540,'challenge progression is separate');
});
test('garage purchases, upgrade limits and corrupted saves are safe',()=>{
 let p=freshRaceProgress();assert.equal(buyCar(p,2),p);p={...p,coins:5000};p=buyCar(p,1);assert.equal(p.car,1);assert.equal(p.coins,4100);assert.equal(buyCar(p,1),p);
 for(let i=0;i<10;i++)p=upgradeCar(p,0);assert.equal(p.upgrades[0],4);
 for(const raw of ['null','false','[]','{broken'])assert.deepEqual(readRaceProgress(raw),freshRaceProgress());
 const loaded=readRaceProgress(JSON.stringify({...p,car:99,coins:-200,stars:[999,-8],settings:{volume:8}}));assert.equal(loaded.car,0);assert.equal(loaded.coins,0);assert.deepEqual(loaded.stars.slice(0,2),[3,0]);assert.equal(loaded.settings.volume,1);
});
test('open highway traffic recycles and ending a drive records no podium coins',()=>{
 const p=freshRaceProgress(),s=createRace(0,'endless');s.distance=500;s.traffic[0].distance=0;stepRace(s,gas,p,.01);assert.ok(s.traffic[0].distance>s.distance);finishDrive(s);assert.equal(s.status,'finished');const result=recordRace(p,s);assert.equal(result.earned,0);assert.ok(result.progress.bestEndless>=500);
});
test('all districts are winnable with skilled driving and an upgraded car',()=>{
 const p={...freshRaceProgress(),car:2,owned:[0,1,2],upgrades:[4,4,4]};
 for(let level=0;level<12;level++){
  const s=createRace(level,'challenge');
  for(let frame=0;frame<7000&&s.status==='running';frame++){
   const obstacles=[...s.traffic,...s.rivals.filter(r=>r.finish===null)].filter(t=>t.distance-s.distance>-6&&t.distance-s.distance<55);
   const lanes=[-3.2,0,3.2],clear=lanes.filter(x=>!obstacles.some(t=>Math.abs(t.x-x)<1.6));
   const target=clear.sort((a,b)=>Math.abs(a-s.x)-Math.abs(b-s.x))[0];
   stepRace(s,{steer:target===undefined?0:Math.abs(target-s.x)<.08?0:Math.sign(target-s.x),accelerate:true,brake:target===undefined&&obstacles.some(t=>t.distance-s.distance<16)},p,1/60);
  }
  assert.equal(s.status,'finished',`level ${level+1}`);assert.equal(s.success,true,`level ${level+1}: ${s.reason}`);
 }
});
