import test from 'node:test';
import assert from 'node:assert/strict';
import {boltLevels,initialBolts,activePlates,moveBolt,boltHint} from '../.test-build/bolts.js';
test('every workshop has a complete legal solution',()=>{
 for(const level of boltLevels){let state=initialBolts(level),steps=0;while(activePlates(level,state).length&&steps++<100){const hint=boltHint(level,state);assert.ok(hint,level.name+' has a move');const next=moveBolt(level,state,hint.from,hint.to);assert.ok(next);assert.equal(new Set(next.occupied).size,next.occupied.length);state=next}assert.equal(activePlates(level,state).length,0,level.name)}
});
test('invalid screw transfers do not mutate the board',()=>{const level=boltLevels[0],state=initialBolts(level),copy=JSON.stringify(state);assert.equal(moveBolt(level,state,16,17),null);assert.equal(moveBolt(level,state,state.occupied[0],state.occupied[1]),null);assert.equal(moveBolt(level,state,state.occupied[0],15),null);assert.equal(JSON.stringify(state),copy)});
test('20 puzzles progress through three difficulty tiers',()=>{assert.equal(boltLevels.length,20);assert.equal(boltLevels[0].tier,'Easy');assert.equal(boltLevels[6].tier,'Medium');assert.equal(boltLevels[19].tier,'Hard')});
