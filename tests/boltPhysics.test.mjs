import test from 'node:test';
import assert from 'node:assert/strict';
import {BoltPhysics} from '../.test-build/boltPhysics.js';
const level={name:'Fixture',tier:'Easy',parking:2,coins:30,plates:[{id:0,holes:[0,1],color:'#a86'}]};
test('released wood falls slowly instead of disappearing',()=>{const world=new BoltPhysics(level);world.sync({occupied:[],removed:[0],moves:1});const start=world.planks.get(0).position.y;for(let i=0;i<30;i++)world.step();assert.ok(world.planks.get(0).position.y>start+10);assert.ok(world.planks.get(0).position.y<start+100);assert.equal(world.fallen.size,0);for(let i=0;i<600;i++)world.step();assert.equal(world.fallen.size,1);world.dispose()});
test('nuts catch a plank until the obstruction is removed',()=>{const world=new BoltPhysics(level);world.sync({occupied:[4,5],removed:[0],moves:1});for(let i=0;i<360;i++)world.step();assert.equal(world.fallen.size,0);assert.ok(world.planks.get(0).position.y<170);assert.ok(world.blockingPins().length>0);world.sync({occupied:[],removed:[0],moves:2});for(let i=0;i<600;i++)world.step();assert.equal(world.fallen.size,1);world.dispose()});
test('undo restores an already fallen plank to its original pose',()=>{const world=new BoltPhysics(level);world.sync({occupied:[],removed:[0],moves:1});for(let i=0;i<600;i++)world.step();world.sync({occupied:[0,1],removed:[],moves:0});assert.equal(world.fallen.size,0);assert.equal(world.planks.get(0).isStatic,true);assert.equal(world.planks.get(0).position.y,70);world.dispose()});
test('a narrow plank passes through a sufficiently wide gap',()=>{const narrow={...level,plates:[{id:0,holes:[1,5],color:'#a86'}]},world=new BoltPhysics(narrow);world.sync({occupied:[4,6],removed:[0],moves:1});for(let i=0;i<600;i++)world.step();assert.equal(world.fallen.size,1);world.dispose()});

test('one remaining screw acts as a hinge and the plank hangs below it',()=>{
 const world=new BoltPhysics(level);world.sync({occupied:[0,1],removed:[],moves:0});world.sync({occupied:[0],removed:[],moves:1});
 for(let i=0;i<600;i++)world.step();const body=world.planks.get(0),pose=world.poses()[0][1],x=75-pose.originX,y=70-pose.originY;
 const pivot={x:pose.x+Math.cos(pose.angle)*x-Math.sin(pose.angle)*y,y:pose.y+Math.sin(pose.angle)*x+Math.cos(pose.angle)*y};
 assert.ok(Math.hypot(pivot.x-75,pivot.y-70)<3);assert.ok(body.position.y>105);assert.ok(Math.abs(body.position.x-75)<10);assert.equal(world.fallen.size,0);
 world.sync({occupied:[],removed:[0],moves:2});for(let i=0;i<600;i++)world.step();assert.equal(world.fallen.size,1);world.dispose();
});
test('removing the upper screw tips an upright plank down around its lower screw',()=>{
 const upright={...level,plates:[{id:0,holes:[1,5],color:'#a86'}]},world=new BoltPhysics(upright);
 world.sync({occupied:[1,5],removed:[],moves:0});world.sync({occupied:[5],removed:[],moves:1});
 for(let i=0;i<900;i++)world.step();const body=world.planks.get(0);
 assert.ok(body.position.y>205,'wood must hang below its lower pivot');assert.ok(Math.abs(body.position.x-175)<10);assert.equal(world.fallen.size,0);
 world.dispose();
});
test('a vacated hole is reusable without attaching it to wood that has swung away',()=>{
 const world=new BoltPhysics(level);world.sync({occupied:[0,1],removed:[],moves:0});world.sync({occupied:[0,16],removed:[],moves:1});for(let i=0;i<600;i++)world.step();
 assert.equal(world.canPlace(1),true);world.sync({occupied:[0,1],removed:[],moves:2});for(let i=0;i<120;i++)world.step();assert.ok(world.planks.get(0).position.y>105);
 world.sync({occupied:[1,17],removed:[],moves:3});for(let i=0;i<600;i++)world.step();assert.equal(world.fallen.size,1);world.dispose();
});
test('loose upright wood slowly tips off one parking screw',()=>{
 const upright={...level,plates:[{id:0,holes:[1,5],color:'#a86'}]},world=new BoltPhysics(upright);
 world.sync({occupied:[16],removed:[0],moves:1});for(let i=0;i<120;i++)world.step();assert.equal(world.fallen.size,0);
 for(let i=0;i<1500;i++)world.step();assert.equal(world.fallen.size,1);world.dispose();
});
test('unlocked wood has controlled fall and rotation speeds',()=>{
 const world=new BoltPhysics(level);world.sync({occupied:[0],removed:[],moves:1});
 for(let i=0;i<200;i++){world.step();const body=world.planks.get(0);assert.ok(Math.hypot(body.velocity.x,body.velocity.y)<=2.201);assert.ok(Math.abs(body.angularVelocity)<=.01801)}
 world.sync({occupied:[],removed:[0],moves:2});for(let i=0;i<600;i++){world.step();assert.ok(Math.hypot(world.planks.get(0).velocity.x,world.planks.get(0).velocity.y)<=2.201)}assert.equal(world.fallen.size,1);world.dispose();
});
test('Undo restores the exact swinging pose and velocity, including its hinge',()=>{
 const world=new BoltPhysics(level);world.sync({occupied:[0,1],removed:[],moves:0});world.sync({occupied:[0,16],removed:[],moves:1});for(let i=0;i<70;i++)world.step();const snapshot=world.capture();
 world.sync({occupied:[16,17],removed:[0],moves:2});for(let i=0;i<400;i++)world.step();world.sync({occupied:[0,16],removed:[],moves:1});world.restore(snapshot);
 assert.deepEqual(world.capture(),snapshot);for(let i=0;i<600;i++)world.step();assert.equal(world.fallen.size,0);assert.ok(world.planks.get(0).position.y>105);world.dispose();
});
test('hammer removes physical wood and undo restores its body and supports',()=>{const world=new BoltPhysics(level),state={occupied:[0,1],removed:[],moves:0};world.sync(state);const snapshot=world.capture();world.sync({...state,removed:[0],broken:[0],moves:1});assert.equal(world.fallen.has(0),true);assert.equal(world.canPlace(0),true);world.sync(state);world.restore(snapshot);assert.equal(world.fallen.size,0);assert.equal(world.pinSupportCount(0),1);assert.equal(world.canPlace(0),false);world.dispose()});
test('release caps actual displacement as well as velocity after solver corrections',()=>{const world=new BoltPhysics({...level,plates:[{id:0,holes:[1,5],color:'#a86'}]});world.sync({occupied:[1,5],removed:[],moves:0});world.sync({occupied:[5],removed:[],moves:1});for(let i=0;i<200;i++){const b=world.planks.get(0),previous={x:b.position.x,y:b.position.y,angle:b.angle};world.step();assert.ok(Math.hypot(b.position.x-previous.x,b.position.y-previous.y)<=6.001);assert.ok(Math.abs(b.angle-previous.angle)<=.05001)}world.dispose()});
test('wood remains until its entire body passes the full workbench bottom',()=>{const world=new BoltPhysics(level);world.setExitHeight(800);world.sync({occupied:[],removed:[0],moves:1});let passedOld=false;for(let i=0;i<900&&!world.fallen.size;i++){world.step();const top=Math.min(...world.planks.get(0).vertices.map(v=>v.y));if(top>570&&top<800){passedOld=true;assert.equal(world.fallen.size,0)}}assert.equal(passedOld,true);assert.equal(world.fallen.size,1);world.dispose()});
