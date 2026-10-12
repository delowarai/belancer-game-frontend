import test from 'node:test';
import assert from 'node:assert/strict';
import {questionFor} from '../.test-build/practiceQuestions.js';
test('letter order gives the actual next letter across 1000 rounds',()=>{
 for(let i=0;i<1000;i++){const q=questionFor('letter-order',i),last=q.prompt.match(/, ([A-Z])\?$/)[1];assert.equal(q.options[q.answer],String.fromCharCode(last.charCodeAt(0)+1));assert.equal(new Set(q.options).size,4)}
});
test('rule switching has exactly one matching answer',()=>{
 for(let i=0;i<1000;i++){const q=questionFor('rule-switch',i),matching=q.options.map(Number).filter(n=>n%2===i%2);assert.equal(matching.length,1);assert.equal(Number(q.options[q.answer]),matching[0])}
});
test('comparison never ties and identifies the greater number',()=>{
 for(let i=0;i<1000;i++){const q=questionFor('greater-number',i);assert.notEqual(q.options[0],q.options[1]);assert.equal(Number(q.options[q.answer]),Math.max(...q.options.map(Number)))}
});
test('count answers match the visible diamonds',()=>{
 for(let i=0;i<1000;i++){const q=questionFor('quick-count',i);assert.equal(Number(q.options[q.answer]),q.grid.filter(x=>x==='◆').length)}
});
test('color switching prints the prompt in the correct answer color',()=>{
 for(let i=0;i<100;i++){const q=questionFor('word-color-switch',i);assert.ok(q.promptColor);assert.equal(q.promptColor,q.optionColors[q.answer])}
});
