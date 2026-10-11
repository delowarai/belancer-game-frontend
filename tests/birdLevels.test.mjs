import test from 'node:test';
import assert from 'node:assert/strict';
import {birdLevels,readBirdProgress,completeBirdLevel,birdCoins,birdPoints,birdDifficulty,birdRewardReady,birdShieldPositions,birdPhysicsActive} from '../.test-build/birdLevels.js';
test('30 distinct tower layouts have rewards and enough shots',()=>{
  assert.equal(birdLevels.length,30);
  assert.equal(new Set(birdLevels.map(level=>JSON.stringify(level.towers))).size,30);
  for(const level of birdLevels){
    assert.ok(level.coins>0&&level.badge&&level.shots>=level.towers.length);
    for(const [x,height] of level.towers)assert.ok(x>400&&x<950&&height>=70&&height<=260);
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

test('reward waits for all targets, the final flight and celebration',()=>{
  assert.equal(birdRewardReady(null,6000,true),false);
  assert.equal(birdRewardReady(1000,2399,true),false);
  assert.equal(birdRewardReady(1000,4000,false),false);
  assert.equal(birdRewardReady(1000,2400,true),true);
});

test('initial scene stays frozen until the first launch',()=>{
  for(const level of birdLevels){
    assert.equal(birdPhysicsActive(level.shots,level.shots),false);
    assert.equal(birdPhysicsActive(level.shots-1,level.shots),true);
  }
});
test('steel barriers never overlap tower supports or roofs',()=>{
  birdLevels.forEach((level,index)=>{
    const positions=birdShieldPositions(index);
    assert.equal(positions.length,birdDifficulty(index).shield);
    positions.forEach(x=>{
      assert.ok(x>230);
      level.towers.forEach(([tower])=>assert.ok(Math.abs(tower-x)>55));
    });
    for(let i=1;i<positions.length;i++)assert.ok(positions[i]-positions[i-1]>20);
  });
});

test('30 levels have safe themes and Easy to Medium to Hard chapters',()=>{
  assert.deepEqual([0,4,5,14,15,29].map(i=>birdDifficulty(i).tier),['Easy','Easy','Medium','Medium','Hard','Hard']);
  birdLevels.forEach((_,index)=>assert.ok(birdDifficulty(index).theme>=0&&birdDifficulty(index).theme<=2));
});
test('existing 11-level saves keep progress and unlock the extension',()=>{
  const saved=readBirdProgress(JSON.stringify({stars:Array(11).fill(3),points:Array(11).fill(500)}));
  assert.equal(saved.stars.length,30);
  assert.equal(saved.stars[10],3);
  assert.equal(saved.stars[11],0);
  assert.equal(saved.points[10],500);
  assert.equal(saved.points[11],0);
});
