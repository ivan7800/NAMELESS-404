import assert from 'node:assert/strict';
import {HorrorDirector} from '../dist/src/horror/HorrorDirector.js';
const S={day:1,mode:'real',steps:0,rx:2.5,ry:2.5,room:'VESTIBULO',chase:false,threat:0,hidden:false,won:false};
const tests=[];
function test(name,fn){fn();tests.push(name);console.log('OK presagios: '+name);}
test('no altera la simulación ni la progresión narrativa',()=>{
 const h=new HorrorDirector();let prev={...S};let found=0;
 for(let i=1;i<70;i++){
  const next={...prev,steps:i,rx:2.5+(i%4)*.47};const copy=JSON.stringify(next);
  if(h.observe(prev,next,1000+i*250))found++;
  assert.equal(JSON.stringify(next),copy);prev=next;
 }
 assert.ok(found>=2,`found ${found}`);
});
test('se activa solo al avanzar por la realidad, nunca por render o turnos del RPG',()=>{
 const h=new HorrorDirector();let found=0;
 for(let i=1;i<70;i++){
  const before={...S,steps:i-1};const after={...S,steps:i};
  const c=h.observe(before,after,1000+i*100);if(c)found++;
  assert.equal(h.observe(after,after,1000+i*100),null);
 }
 assert.ok(found>0);
 const r={...S,mode:'rpg',steps:101};assert.equal(h.observe({...r,steps:100},r,9999),null);
});
test('respeta el intervalo mínimo entre presagios',()=>{
 const h=new HorrorDirector();let last=-100;
 for(let i=1;i<100;i++){
  const omen=h.observe({...S,steps:i-1},{...S,steps:i},i*50);
  if(omen){assert.ok(i-last>=8);last=i;}
 }
});
test('evita interrupciones durante persecución intensa, escondite y desenlace',()=>{
 const h=new HorrorDirector();
 for(let i=7;i<=40;i++){
  for(const conditions of [{chase:true,threat:80},{hidden:true},{won:true}]){
   const from={...S,steps:i-1,...conditions};const to={...S,steps:i,...conditions};
   assert.equal(h.observe(from,to,1000+i*100),null);
  }
 }
});
test('apagado accesible y expiración temporal sin alterar estado',()=>{
 const h=new HorrorDirector();let omen=null;
 for(let i=7;i<40&&!omen;i++)omen=h.observe({...S,steps:i-1},{...S,steps:i},i*100);
 assert.ok(omen);
 assert.ok(h.current(omen.started+20));
 assert.equal(h.current(omen.ends),null);
 h.setEnabled(false);assert.equal(h.getEnabled(),false);
 assert.equal(h.observe({...S,steps:50},{...S,steps:51},5000),null);
 h.setEnabled(true);assert.equal(h.getEnabled(),true);
});
test('variantes narrativas por día sin lecturas fuera de rango',()=>{
 for(let day=1;day<=7;day++){
  const h=new HorrorDirector();let omen;
  for(let i=7;i<50&&!omen;i++)omen=h.observe({...S,day,steps:i-1},{...S,day,steps:i},i*100);
  assert.ok(omen,`day ${day}`);assert.equal(omen.day,day);assert.ok(omen.text.length>8);
 }
});
console.log(`PRESAGIOS: ${tests.length}/${tests.length} PASS`);
