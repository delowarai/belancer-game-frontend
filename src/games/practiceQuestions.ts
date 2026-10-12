import {categoryColors} from './practiceGames.js';
export type Question={prompt:string;options:string[];answer:number;grid?:string[];optionColors?:string[];promptColor?:string};
const colors=['Teal','Mint','Clay','Lime'];
const swatches=[categoryColors[0],categoryColors[1],categoryColors[2],categoryColors[3]];
const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const words=[
  {word:'bright',answer:'light',options:['light','quiet','rough','late']},
  {word:'quick',answer:'fast',options:['fast','deep','kind','wide']},
  {word:'begin',answer:'start',options:['start','finish','follow','pause']},
  {word:'calm',answer:'peaceful',options:['peaceful','noisy','bright','sharp']},
  {word:'large',answer:'big',options:['big','near','soft','slow']},
  {word:'happy',answer:'glad',options:['glad','tired','small','plain']},
];
const shuffle=<T,>(items:T[])=>{const next=[...items];for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]]}return next};
function choices(correct:number,values=[correct-2,correct-1,correct+1,correct+2]){
  const options=shuffle([...new Set([correct,...values])].slice(0,4));
  if(!options.includes(correct))options[0]=correct;
  return {options:options.map(String),answer:options.indexOf(correct)};
}
export function questionFor(slug:string,round:number):Question{
  if(slug==='quick-count'){
    const target='◆',distractors=['●','▲','■'],grid=Array.from({length:12},()=>Math.random()<.35?target:distractors[Math.floor(Math.random()*distractors.length)]);
    const count=grid.filter(item=>item===target).length;return {prompt:'How many diamonds are in the group?',...choices(count,[0,1,2,3]),grid};
  }
  if(slug==='rapid-sums'){
    const a=2+Math.floor(Math.random()*18),b=1+Math.floor(Math.random()*Math.min(a,12)),subtract=Math.random()<.5,answer=subtract?a-b:a+b;
    return {prompt:`${a} ${subtract?'−':'+'} ${b} = ?`,...choices(answer,[Math.max(0,answer-3),answer+1,answer+2])};
  }
  if(slug==='symbol-sprint'){
    const first=['◆','●','▲','■'][Math.floor(Math.random()*4)],same=Math.random()<.5,second=same?first:['◆','●','▲','■'].filter(item=>item!==first)[Math.floor(Math.random()*3)];
    const options=['Same','Different'];return {prompt:`${first}   ${second}`,options,answer:same?0:1};
  }
  if(slug==='spot-target'){
    const target='◆',grid=Array(16).fill('◇');
    grid[Math.floor(Math.random()*grid.length)]=target;
    const answer=grid.indexOf(target);return {prompt:'Find the solid diamond.',options:grid.map((_,index)=>`Tile ${index+1}`),answer,grid};
  }
  if(slug==='direction-check'){
    const arrows=['↑','→','↓','←'],direction=arrows[Math.floor(Math.random()*arrows.length)],different=arrows[(arrows.indexOf(direction)+2)%4],answer=Math.floor(Math.random()*16),grid=Array(16).fill(direction);grid[answer]=different;
    return {prompt:`Find the arrow pointing away from ${direction}.`,options:grid.map((_,index)=>`Tile ${index+1}`),answer,grid};
  }
  if(slug==='rule-switch'||slug==='shape-shift'){
    if(slug==='shape-shift'){
      const options=shuffle(['Circle','Triangle','Square','Diamond']),target=options[Math.floor(Math.random()*options.length)];
      return {prompt:`Shape shift: find the ${target.toLowerCase()}.`,options,answer:options.indexOf(target)};
    }
    const even=round%2===0,correct=2*(1+Math.floor(Math.random()*4))-(even?0:1),wrong=[2,4,6].map(n=>n-(even?1:0)),options=shuffle([correct,...wrong]);
    return {prompt:`Switch rule: choose an ${even?'even':'odd'} number.`,options:options.map(String),answer:options.indexOf(correct)};
  }
  if(slug==='word-color-switch'){
    const wordIndex=Math.floor(Math.random()*colors.length),colorIndex=(wordIndex+1+Math.floor(Math.random()*3))%colors.length;
    return {prompt:`What color is the word "${colors[wordIndex]}" printed in?`,options:colors,answer:colorIndex,optionColors:swatches,promptColor:swatches[colorIndex]};
  }
  if(slug==='number-patterns'||slug==='math-patterns'){
    const step=slug==='math-patterns'?2+Math.floor(Math.random()*4):2+Math.floor(Math.random()*5),start=1+Math.floor(Math.random()*12),sequence=[0,1,2].map(index=>start+step*index),answer=start+step*3;
    return {prompt:`${sequence.join(', ')}, …`,...choices(answer,[answer-step-1,answer+step,answer+step+1])};
  }
  if(slug==='logic-pick'){
    const cases=[
      {prompt:'All teal tiles are squares. This tile is teal. What must be true?',answer:'It is a square.',options:['It is a square.','It is a circle.','It is not teal.','Nothing can be known.']},
      {prompt:'Every round has a pattern. This is a round. What follows?',answer:'It has a pattern.',options:['It has a pattern.','It has no pattern.','It is the last round.','It is a square.']},
      {prompt:'Mina is taller than Lee. Lee is taller than Jo. Who is shortest?',answer:'Jo',options:['Mina','Lee','Jo','Cannot tell']},
      {prompt:'A card is either red or blue. It is not red. What color is it?',answer:'Blue',options:['Red','Blue','Green','Cannot tell']},
    ],item=cases[Math.floor(Math.random()*cases.length)];
    return {prompt:item.prompt,options:item.options,answer:item.options.indexOf(item.answer)};
  }
  if(slug==='equation-builder'){
    const a=2+Math.floor(Math.random()*10),b=1+Math.floor(Math.random()*10),sum=a+b;
    return {prompt:`${a} + □ = ${sum}`,...choices(b,[Math.max(0,b-2),b+1,b+2])};
  }
  if(slug==='missing-letter'){
    const entries=[['p_zzle','u'],['fo_us','c'],['pla_','y'],['min_','d'],['gam_','e'],['s_art','t']];
    const [prompt,answer]=entries[Math.floor(Math.random()*entries.length)],options=shuffle([answer,...'abcdefgilmnoprstuy'.replace(answer,'').split('').slice(0,3)]);
    return {prompt:`Complete the word: ${prompt}`,options,answer:options.indexOf(answer)};
  }
  if(slug==='word-match'){
    const item=words[Math.floor(Math.random()*words.length)],answer=item.options.indexOf(item.answer);
    return {prompt:`Choose a word closest in meaning to "${item.word}".`,options:item.options,answer};
  }
  if(slug==='letter-order'){
    const index=2+Math.floor(Math.random()*22),answer=letters[index+1],options=shuffle([answer,letters[index],letters[index+2],letters[index-1]]);
    return {prompt:`What letter comes next after ${letters[index-2]}, ${letters[index-1]}, ${letters[index]}?`,options,answer:options.indexOf(answer)};
  }
  if(slug==='number-bonds'){
    const total=10+Math.floor(Math.random()*11),first=1+Math.floor(Math.random()*total),answer=total-first;
    return {prompt:`${first} + ? = ${total}`,...choices(answer,[Math.max(0,answer-2),answer+1,answer+2])};
  }
  if(slug==='greater-number'){
    const first=10+Math.floor(Math.random()*90),second=10+(first-10+1+Math.floor(Math.random()*89))%90;
    return {prompt:'Choose the greater number.',options:[String(first),String(second)],answer:first>second?0:1};
  }
  return {prompt:'Choose an answer to continue.',options:['1','2','3','4'],answer:0};
}

