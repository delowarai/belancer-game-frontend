import test from 'node:test';
import assert from 'node:assert/strict';
import {birdLevels,readBirdProgress,completeBirdLevel,birdCoins,birdPoints,birdDifficulty} from '../.test-build/birdLevels.js';
test('11 distinct tower layouts have rewards and enough shots',()=>{
  assert.equal(birdLevels.length,11);
  assert.equal(new Set(birdLevels.map(level=>JSON.stringify(level.towers))).size,11);
  for(const level of birdLevels){
    assert.ok(level.coins>0&&level.badge&&level.shots>=level.towers.length);
    for(const [x,height] of level.towers)assert.ok(x>400&&x<950&&height>=70&&height<=220);
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

test('difficulty increases on every level while shot allowance tightens',()=>{
  for(let i=1;i<birdLevels.length;i++){
    assert.ok(birdDifficulty(i).density>birdDifficulty(i-1).density);
    assert.ok(birdDifficulty(i).impact>birdDifficulty(i-1).impact);
    assert.ok(birdDifficulty(i).shield>=birdDifficulty(i-1).shield);
    assert.ok(birdLevels[i].shots/birdLevels[i].towers.length<=birdLevels[i-1].shots/birdLevels[i-1].towers.length);
  }
});
test('saved points keep the best result and migrate older star-only saves',()=>{
  let progress=readBirdProgress('{"stars":[2]}');
  assert.equal(birdPoints(progress),200);
  progress=completeBirdLevel(progress,0,2);
  assert.equal(birdPoints(progress),300);
  progress=completeBirdLevel(progress,0,0);
  assert.equal(birdPoints(progress),300);
  assert.equal(birdCoins(progress),50);
});
