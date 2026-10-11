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
