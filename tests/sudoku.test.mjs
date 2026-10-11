import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSudoku,countSolutions,conflicts,sudokuHint} from '../.test-build/sudoku.js';
test('all supported sizes and difficulties have one valid solution',()=>{
  for(const size of [6,8,10])for(const difficulty of ['Easy','Medium','Hard']){
    const puzzle=makeSudoku(size,difficulty,275);
    assert.equal(countSolutions(puzzle.givens,size),1);
    assert.ok(puzzle.givens.some(value=>!value));
    for(let i=0;i<size*size;i++){
      assert.ok(!conflicts(puzzle.solution,size,i,puzzle.solution[i]));
      assert.ok(!puzzle.givens[i]||puzzle.givens[i]===puzzle.solution[i]);
    }
  }
});
test('generation is reproducible and new seeds vary the puzzle',()=>{
  assert.deepEqual(makeSudoku(6,'Hard',12),makeSudoku(6,'Hard',12));
  assert.notDeepEqual(makeSudoku(6,'Hard',12).givens,makeSudoku(6,'Hard',13).givens);
  assert.ok(makeSudoku(6,'Hard',12).givens.filter(Boolean).length<makeSudoku(6,'Easy',12).givens.filter(Boolean).length);
});
test('conflicts detect row, column and rectangular box duplicates',()=>{
  const board=Array(36).fill(0);board[0]=1;
  for(const index of [1,6,8,30])assert.ok(conflicts(board,6,index,1));
  assert.ok(!conflicts(board,6,21,1));
  assert.ok(!conflicts(board,6,0,1));
});

test('hints identify a cell, explain a deduction and do not mutate the board',()=>{
  const puzzle=makeSudoku(6,'Easy',275),board=[...puzzle.solution];board[8]=0;
  const hint=sudokuHint(puzzle,board,8);
  assert.equal(hint.index,8);assert.equal(hint.value,puzzle.solution[8]);
  assert.match(hint.reason,/only digit/);assert.equal(board[8],0);
  assert.equal(sudokuHint(puzzle,puzzle.solution,0),null);
});
test('hints guide correction of a wrong entry before another deduction',()=>{
  const puzzle=makeSudoku(6,'Medium',275),board=[...puzzle.givens],index=board.findIndex(value=>!value);
  board[index]=puzzle.solution[index]%6+1;
  const hint=sudokuHint(puzzle,board,index);
  assert.equal(hint.index,index);assert.equal(hint.value,puzzle.solution[index]);
  assert.match(hint.reason,/Replace it/);
});
