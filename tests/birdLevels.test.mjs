import test from 'node:test';
import assert from 'node:assert/strict';
import {birdLevels,readBirdProgress,completeBirdLevel,birdCoins} from '../.test-build/birdLevels.js';
test('11 distinct tower layouts have rewards and enough shots',()=>{
  assert.equal(birdLevels.length,11);
  assert.equal(new Set(birdLevels.map(level=>JSON.stringify(level.towers))).size,11);
  for(const level of birdLevels){
    assert.ok(level.coins>0&&level.badge&&level.shots>=level.towers.length);
    for(const [x,height] of level.towers)assert.ok(x>400&&x<950&&height>=70&&height<=170);
  }
});
test('replays improve stars without farming additional coins',()=>{
  let progress=readBirdProgress(null);
  progress=completeBirdLevel(progress,0,0);
  assert.equal(progress.stars[0],1);
  assert.equal(birdCoins(progress),50);
  progress=completeBirdLevel(progress,0,2);
  assert.equal(progress.stars[0],3);
  assert.equal(birdCoins(progress),50);
  progress=completeBirdLevel(progress,0,0);
  assert.equal(progress.stars[0],3);
  progress=completeBirdLevel(progress,1,1);
  assert.equal(birdCoins(progress),115);
  assert.deepEqual(readBirdProgress(JSON.stringify(progress)),progress);
});
test('corrupt browser progress safely resets or clamps stars',()=>{
  assert.deepEqual(readBirdProgress('broken'),readBirdProgress(null));
  assert.deepEqual(readBirdProgress('{"stars":[9,-2,"3"]}').stars.slice(0,3),[3,0,0]);
});
