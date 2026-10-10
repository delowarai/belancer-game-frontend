export const categoryColors=['#1F7A70','#9ED8CF','#C2532D','#D2F53C'];

export const additionalPracticeGames=[
  {slug:'bird-launch',name:'Belancer Bird Launch',category:'Problem Solving',icon:'➶',description:'Pull, aim and launch your bird to topple towers and clear three targets.',color:'var(--game-memory-bg)',ink:'var(--game-memory-fg)'},
  {slug:'number-recall',name:'Number Recall',category:'Memory',icon:'123',description:'Remember a short number sequence, then enter it in order.',color:'var(--game-memory-bg)',ink:'var(--game-memory-fg)'},
  {slug:'quick-count',name:'Quick Count',category:'Speed',icon:'#',description:'Count the matching symbols before moving to the next quick round.',color:'var(--game-speed-bg)',ink:'var(--game-speed-fg)'},
  {slug:'rapid-sums',name:'Rapid Sums',category:'Speed',icon:'+',description:'Solve short addition and subtraction questions as quickly as you can.',color:'var(--game-math-bg)',ink:'var(--game-math-fg)'},
  {slug:'symbol-sprint',name:'Symbol Sprint',category:'Speed',icon:'=',description:'Decide whether each pair of symbols is the same or different.',color:'var(--game-focus-bg)',ink:'var(--game-focus-fg)'},
  {slug:'spot-target',name:'Spot the Target',category:'Attention',icon:'⌕',description:'Find the one target symbol hiding among similar shapes.',color:'var(--game-focus-bg)',ink:'var(--game-focus-fg)'},
  {slug:'direction-check',name:'Direction Check',category:'Attention',icon:'↑',description:'Scan a grid and spot the arrow pointing the other way.',color:'var(--game-pairs-bg)',ink:'var(--game-pairs-fg)'},
  {slug:'rule-switch',name:'Rule Switch',category:'Flexibility',icon:'↔',description:'Switch between rules and choose the number that fits this round.',color:'var(--game-math-bg)',ink:'var(--game-math-fg)'},
  {slug:'shape-shift',name:'Shape Shift',category:'Flexibility',icon:'◇',description:'Match the shape or color named in each changing prompt.',color:'var(--game-pairs-bg)',ink:'var(--game-pairs-fg)'},
  {slug:'word-color-switch',name:'Word Color Switch',category:'Flexibility',icon:'Aa',description:'Ignore the word and identify the color used to print it.',color:'var(--game-focus-bg)',ink:'var(--game-focus-fg)'},
  {slug:'number-patterns',name:'Number Patterns',category:'Problem Solving',icon:'…',description:'Work out the pattern and choose which number comes next.',color:'var(--game-memory-bg)',ink:'var(--game-memory-fg)'},
  {slug:'logic-pick',name:'Logic Pick',category:'Problem Solving',icon:'∴',description:'Use a short clue to pick the conclusion that must be true.',color:'var(--game-speed-bg)',ink:'var(--game-speed-fg)'},
  {slug:'equation-builder',name:'Equation Builder',category:'Problem Solving',icon:'□',description:'Find the missing value that makes each equation work.',color:'var(--game-math-bg)',ink:'var(--game-math-fg)'},
  {slug:'missing-letter',name:'Missing Letter',category:'Word',icon:'_a_',description:'Fill the blank to complete a familiar word.',color:'var(--game-pairs-bg)',ink:'var(--game-pairs-fg)'},
  {slug:'word-match',name:'Word Match',category:'Word',icon:'Aa',description:'Choose the word with the closest meaning.',color:'var(--game-focus-bg)',ink:'var(--game-focus-fg)'},
  {slug:'letter-order',name:'Letter Order',category:'Word',icon:'ABC',description:'Follow the alphabet and choose which letter comes next.',color:'var(--game-speed-bg)',ink:'var(--game-speed-fg)'},
  {slug:'number-bonds',name:'Number Bonds',category:'Math',icon:'10',description:'Find the missing number that completes the total.',color:'var(--game-math-bg)',ink:'var(--game-math-fg)'},
  {slug:'greater-number',name:'Greater Number',category:'Math',icon:'>',description:'Compare two numbers and pick the larger one.',color:'var(--game-pairs-bg)',ink:'var(--game-pairs-fg)'},
  {slug:'math-patterns',name:'Math Patterns',category:'Math',icon:'∑',description:'Spot the number pattern and work out the next step.',color:'var(--game-speed-bg)',ink:'var(--game-speed-fg)'},
].map(game=>({...game,practiceOnly:true}));
