import test from 'node:test';
import assert from 'node:assert/strict';
import Matter from 'matter-js';
import {aimPosition,dragAim,trajectory,BIRD_ANCHOR,BIRD_SPEED,BIRD_AIR,BIRD_GRAVITY} from '../.test-build/birdAim.js';

test('drag and slider aiming agree across the supported angles and powers',()=>{
  for(const angle of [5,20,45,65])for(const power of [30,90,100]){
    assert.deepEqual(dragAim(aimPosition(angle,power)),{angle,power});
  }
  assert.equal(dragAim({x:BIRD_ANCHOR.x,y:500}).angle,65);
});

test('aim dots match the actual Matter trajectory at low and high angles',()=>{
  for(const angle of [5,20,45,65]){
    const position=aimPosition(angle,90),dots=trajectory(position);
    const engine=Matter.Engine.create();engine.gravity.y=BIRD_GRAVITY;
    const bird=Matter.Bodies.circle(position.x,position.y,23,{frictionAir:BIRD_AIR});
    Matter.Body.setStatic(bird,true);Matter.Body.setStatic(bird,false);
    Matter.Body.setVelocity(bird,{x:(BIRD_ANCHOR.x-position.x)*BIRD_SPEED,y:(BIRD_ANCHOR.y-position.y)*BIRD_SPEED});
    Matter.Composite.add(engine.world,bird);
    for(const dot of dots){
      for(let i=0;i<4;i++)Matter.Engine.update(engine,1000/60);
      assert.ok(Math.abs(bird.position.x-dot.x)<1e-6);
      assert.ok(Math.abs(bird.position.y-dot.y)<1e-6);
    }
    Matter.Engine.clear(engine);
  }
});
