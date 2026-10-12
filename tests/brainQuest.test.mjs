import test from 'node:test';
import assert from 'node:assert/strict';
import {quests,questCorrect,readQuestProgress} from '../.test-build/brainQuest.js';
test('every quest has a reachable answer and rejects wrong actions',()=>{
 assert.equal(quests.length,12);
 for(const q of quests){
  assert.ok(q.hint&&q.lesson);
  assert.ok(q.items.some(i=>i.id===q.answer)||q.options?.includes(q.answer));
  assert.ok(questCorrect(q,q.answer,q.source||null,true));
  assert.equal(questCorrect(q,'wrong',q.source||null,true),false);
  if(q.kind==='pair'){assert.ok(q.items.some(i=>i.id===q.source));assert.equal(questCorrect(q,q.answer,null,true),false)}
  if(q.kind==='reveal')assert.equal(questCorrect(q,q.answer,null,false),false);
 }
});
test('invalid or old progress cannot unlock unavailable levels',()=>{
 assert.deepEqual(readQuestProgress('not json'),{unlocked:1,wins:[]});
 assert.deepEqual(readQuestProgress('null'),{unlocked:1,wins:[]});
 assert.deepEqual(readQuestProgress('{"unlocked":999,"wins":[1,1,0,13,"2"]}'),{unlocked:12,wins:[1]});
 assert.equal(readQuestProgress('{"unlocked":-2}').unlocked,1);
});
