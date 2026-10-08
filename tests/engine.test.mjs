import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceMemory,practicePayload,practiceScore,limits,pattern,ticTacToeOutcome,bestTicTacToeMove} from '../.test-build/engine.js';
import {additionalPracticeGames} from '../.test-build/practiceGames.js';

test('memory increases only after two successes and stops after three failures',()=>{
  let state={cells:3,successes:0,failures:0};
  state=advanceMemory(state,true);assert.equal(state.cells,3);
  state=advanceMemory(state,false);assert.equal(state.cells,3);
  state=advanceMemory(state,true);assert.equal(state.cells,4);
  state=advanceMemory(state,false);assert.equal(state.ended,false);
  state=advanceMemory(state,false);assert.equal(state.ended,true);
});
test('memory partial result counts cells and full patterns separately',()=>{
  const r=practiceScore('memory-grid',{rounds:[[1,2,3],[1,2,3,4]]},[[1,2,3],[1,2,8,9]]);
  assert.equal(r.score,50);assert.equal(r.correctRounds,1);assert.equal(r.errors,2);
});
test('unfinished pair puzzle does not award eight pairs',()=>{
  const r=practiceScore('pair-finder',{cards:[0,0,1,2]},[0,1,2,3]);
  assert.equal(r.score,100);assert.equal(r.correct,1);assert.equal(r.errors,1);
  assert.equal(practiceScore('pair-finder',{cards:[0,0]},[0]).score,0);
});
test('timed games count only answered questions',()=>{
  const r=practiceScore('math-sprint',{rounds:[[1,2],[3,4],[5,6]]},[3,0]);
  assert.equal(r.correct,1);assert.equal(r.errors,1);assert.equal(r.accuracy,50);
  assert.equal(practiceScore('math-sprint',{rounds:[[1,2]]},[]).accuracy,0);
});
test('generators provide valid unique patterns and eight card pairs',()=>{
  for(let n=3;n<=8;n++){const p=pattern(n);assert.equal(new Set(p).size,n);assert.ok(p.every(x=>x>=0&&x<16))}
  const cards=practicePayload('pair-finder').cards;
  for(let symbol=0;symbol<8;symbol++)assert.equal(cards.filter(x=>x===symbol).length,2);
  const rounds=practicePayload('quick-match').rounds;
  assert.equal(rounds.filter(([a,b])=>a===b).length,60);
});
test('published timed rules are sixty seconds',()=>{
  assert.equal(limits['math-sprint'],60000);assert.equal(limits['quick-match'],60000);
});
test('Tic Tac Toe detects wins in rows, columns, diagonals and draws',()=>{
  assert.equal(ticTacToeOutcome(['X','X','X','O',null,'O',null,null,null]),'X');
  assert.equal(ticTacToeOutcome(['O','X',null,'O','X',null,'O',null,'X']),'O');
  assert.equal(ticTacToeOutcome(['X','O',null,'O','X',null,null,null,'X']),'X');
  assert.equal(ticTacToeOutcome(['X','O','X','X','O','O','O','X','X']),'draw');
  assert.equal(ticTacToeOutcome(['X',null,null,null,null,null,null,null,null]),null);
});
test('Tic Tac Toe computer takes wins, blocks losses and cannot be forced to lose',()=>{
  assert.equal(bestTicTacToeMove(['O','O',null,'X','X',null,null,null,null]),2);
  assert.equal(bestTicTacToeMove(['X','X',null,'O',null,null,null,null,null]),2);
  function humanCanWin(board){
    const result=ticTacToeOutcome(board);
    if(result)return result==='X';
    const computerMove=bestTicTacToeMove(board);
    assert.notEqual(computerMove,null);
    const afterComputer=[...board];afterComputer[computerMove]='O';
    if(ticTacToeOutcome(afterComputer))return ticTacToeOutcome(afterComputer)==='X';
    return afterComputer.some((cell,index)=>{
      if(cell)return false;
      const afterHuman=[...afterComputer];afterHuman[index]='X';
      return humanCanWin(afterHuman);
    });
  }
  assert.equal(humanCanWin(Array(9).fill(null)),false);
});
test('every skill category has at least four distinct playable games',()=>{
  const counts=new Map();
  for(const game of additionalPracticeGames){
    counts.set(game.category,(counts.get(game.category)||0)+1);
    assert.equal(game.practiceOnly,true);
  }
  const existing=[
    {category:'Memory',count:3},{category:'Speed',count:1},{category:'Attention',count:2},
    {category:'Flexibility',count:1},{category:'Problem Solving',count:1},{category:'Word',count:1},{category:'Math',count:1},
  ];
  for(const {category,count} of existing)assert.ok(count+(counts.get(category)||0)>=4,`${category} needs at least four games`);
  assert.equal(new Set(additionalPracticeGames.map(game=>game.slug)).size,additionalPracticeGames.length);
});
