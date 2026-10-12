import test from 'node:test';
import assert from 'node:assert/strict';
import {pour,solved,solution,levelBoard,LEVELS} from '../.test-build/bottleSort.js';
test('pours preserve colors, move only the top block and respect capacity',()=>{
 const board=[[0,1,1],[1,1,1],[]];assert.deepEqual(pour(board,0,1),[[0,1],[1,1,1,1],[]]);assert.deepEqual(board,[[0,1,1],[1,1,1],[]]);assert.equal(pour([[0],[1]],0,1),null);assert.equal(pour(board,0,0),null);assert.equal(pour(board,2,0),null);
});
test('all 24 seeded levels are distinct, balanced and solvable with legal pours',()=>{
 const boards=new Set();for(let n=1;n<=LEVELS;n++){
  let board=levelBoard(n);boards.add(JSON.stringify(board));assert.deepEqual(board,levelBoard(n));assert.ok(!solved(board));
  const counts=new Map();for(const c of board.flat())counts.set(c,(counts.get(c)||0)+1);assert.ok([...counts.values()].every(n=>n===4));
  const path=solution(board);assert.ok(path,'Level '+n);for(const [a,b] of path){board=pour(board,a,b);assert.ok(board)}assert.ok(solved(board));
 }assert.equal(boards.size,LEVELS);
});
test('partially filled uniform bottles do not win',()=>{assert.equal(solved([[0,0],[],[1,1,1,1]]),false);assert.equal(solved([[0,0,0,0],[],[1,1,1,1]]),true)});
