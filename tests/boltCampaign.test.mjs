import test from 'node:test';
import assert from 'node:assert/strict';
import {boltLevels,initialBolts,moveBolt,boltDestination} from '../.test-build/bolts.js';
import {BoltPhysics} from '../.test-build/boltPhysics.js';

test('every level can be cleared with actual wood and screw collisions',()=>{
 for(const [index,level] of boltLevels.entries()){
  let solved=false;
  for(let attempt=0;attempt<60&&!solved;attempt++){
   let seed=1+index*173+attempt*919;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
   const world=new BoltPhysics(level);let state=initialBolts(level);world.sync(state);
   for(let move=0;move<60;move++){
    for(let frame=0;frame<600;frame++)world.step();
    if(world.fallen.size===level.plates.length){solved=true;break}
    const blockers=world.blockingPins(),sources=state.occupied.filter(h=>world.canSelect(h)&&(world.pinSupportCount(h)||blockers.includes(h)));
    const destinations=Array.from({length:16+level.parking},(_,i)=>i).filter(h=>boltDestination(level,state,h,world.canPlace(h)));
    if(!sources.length||!destinations.length)break;
    const from=sources[Math.floor(random()*sources.length)],to=destinations[Math.floor(random()*destinations.length)];
    state=moveBolt(level,state,from,to,true,true);assert.ok(state);world.sync(state);
   }
   world.dispose();
  }
  assert.ok(solved,`Level ${index+1} must have a physically playable solution`);
 }
});
