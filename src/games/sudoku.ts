export type Difficulty='Easy'|'Medium'|'Hard';
export type Sudoku={size:number;boxRows:number;boxCols:number;givens:number[];solution:number[]};
export type SudokuHint={index:number;value:number;reason:string};
export function sudokuHint(puzzle:Sudoku,board:number[],selected:number):SudokuHint|null{
  const {size,solution,givens}=puzzle;
  const wrong=board.findIndex((value,i)=>value&&value!==solution[i]&&!givens[i]);
  if(wrong>=0)return {index:wrong,value:solution[wrong],reason:`The entered ${board[wrong]} does not match this puzzle's unique solution. Replace it with ${solution[wrong]} before looking for the next logical step.`};
  const candidates=(index:number)=>Array.from({length:size},(_,n)=>n+1).filter(value=>!conflicts(board,size,index,value));
  const empty=board.map((value,i)=>value? -1:i).filter(i=>i>=0);
  const ordered=[...empty].sort((a,b)=>a===selected?-1:b===selected?1:0);
  for(const index of ordered){const options=candidates(index);if(options.length===1)return {index,value:options[0],reason:`${options[0]} is the only digit missing from this cell's row, column and box. All other digits are already blocked.`}}
  for(const index of ordered){
    const row=Math.floor(index/size),col=index%size,value=solution[index];
    const units=[{name:'row',cells:empty.filter(i=>Math.floor(i/size)===row)},{name:'column',cells:empty.filter(i=>i%size===col)},{name:'box',cells:empty.filter(i=>Math.floor(Math.floor(i/size)/2)===Math.floor(row/2)&&Math.floor((i%size)/puzzle.boxCols)===Math.floor(col/puzzle.boxCols))}];
    for(const unit of units)if(unit.cells.every(i=>i===index||!candidates(i).includes(value)))return {index,value,reason:`${value} can only go here in this ${unit.name}. Every other empty cell in it is blocked by ${value} in its row, column or box.`};
  }
  const index=ordered[0];return index===undefined?null:{index,value:solution[index],reason:`No simple single-digit deduction is available yet. This is a solution reveal: the puzzle's unique solution places ${solution[index]} here.`};
}
export function conflicts(board:number[],size:number,index:number,value:number){
  if(!value)return false;
  const row=Math.floor(index/size),col=index%size,boxCols=size/2;
  return board.some((other,j)=>j!==index&&other===value&&(Math.floor(j/size)===row||j%size===col||(Math.floor(Math.floor(j/size)/2)===Math.floor(row/2)&&Math.floor((j%size)/boxCols)===Math.floor(col/boxCols))));
}
export function countSolutions(input:number[],size:number,limit=2){
  const board=[...input];let nodes=0;
  function solve():number{
    if(++nodes>100000)return limit;
    let index=-1,choices:number[]=[];
    for(let i=0;i<board.length;i++)if(!board[i]){
      const candidates=Array.from({length:size},(_,n)=>n+1).filter(value=>!conflicts(board,size,i,value));
      if(!candidates.length)return 0;
      if(index<0||candidates.length<choices.length){index=i;choices=candidates;if(choices.length===1)break}
    }
    if(index<0)return 1;
    let count=0;for(const value of choices){board[index]=value;count+=solve();if(count>=limit)break}board[index]=0;return Math.min(limit,count);
  }
  return solve();
}
export function makeSudoku(size:number,difficulty:Difficulty,seed:number):Sudoku{
  if(![6,8,10].includes(size))throw new Error('Unsupported board size');
  let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
  const shuffle=(values:number[])=>{for(let i=values.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}return values};
  const range=(length:number)=>Array.from({length},(_,i)=>i);
  const boxCols=size/2;
  const rows=shuffle(range(size/2)).flatMap(group=>shuffle([group*2,group*2+1]));
  const cols=shuffle([0,1]).flatMap(group=>shuffle(range(boxCols).map(col=>group*boxCols+col)));
  const digits=shuffle(range(size).map(i=>i+1));
  const solution=rows.flatMap(row=>cols.map(col=>digits[(boxCols*(row%2)+Math.floor(row/2)+col)%size]));
  const givens=[...solution],remove=Math.floor(size*size*({Easy:.38,Medium:.5,Hard:.64}[difficulty]));let removed=0;
  for(const index of shuffle(range(size*size))){const value=givens[index];givens[index]=0;if(countSolutions(givens,size)!==1)givens[index]=value;else removed++;if(removed>=remove)break}
  return {size,boxRows:2,boxCols,givens,solution};
}
