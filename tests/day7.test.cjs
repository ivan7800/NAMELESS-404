'use strict';
const assert=require('node:assert/strict');
const E=require('../.testbuild/engine.js').NamelessEngine;
let passed=0;
function test(name,fn){fn();passed++;console.log('OK día 7:',name);}
const dirs={'0,-1':0,'1,0':1,'0,1':2,'-1,0':3};
const keys={'0,-1':'ArrowUp','1,0':'ArrowRight','0,1':'ArrowDown','-1,0':'ArrowLeft'};
function goReal(g,x,y){const s=g.state();let safety=0;
  while(E.distance(s.rx,s.ry,x+.5,y+.5)>.28&&safety++<240){
    const path=E.bfs(E.realMap(s),s.rx,s.ry,x,y);
    assert(path.length>1,`Sin salida real a ${x},${y}: ${s.rx},${s.ry}`);
    const [tx,ty]=path[1],[ox,oy]=path[0],need=dirs[`${tx-ox},${ty-oy}`];
    for(let j=0;j<4&&s.dir!==need;j++)g.move('ArrowRight');
    for(let j=0;j<5&&E.distance(s.rx,s.ry,tx+.5,ty+.5)>.28;j++)assert(g.move('ArrowUp'),'Colisión imprevista');
  }
  assert(E.distance(s.rx,s.ry,x+.5,y+.5)<.29,`Destino inaccesible ${x},${y}`);
}
function goRpg(g,x,y){const s=g.state(),path=E.bfs(E.rpgMap(s),s.px,s.py,x,y);
  assert(path.length>0,`Sin camino RPG ${x},${y}`);
  for(let i=1;i<path.length;i++){
    const [ox,oy]=path[i-1],[tx,ty]=path[i];
    assert(g.move(keys[`${tx-ox},${ty-oy}`]),'Error RPG movimiento');
  }
  assert.equal(s.px,x);assert.equal(s.py,y);
}
function enter7(){const g=E.newGame(),s=g.state();s.day=6;s.won=true;s.endingStage=3;s.d6Negative=true;g.interact();assert.equal(s.day,7);return g;}
function fullRun(choice='free'){
  const g=enter7(),s=g.state();
  goReal(g,4,3);g.interact();assert(s.d7Terminal);
  g.swap();goRpg(g,4,4);g.interact();assert(s.d7Portrait);
  g.swap();goReal(g,12,3);g.interact();assert(s.d7Voice&&s.chase);
  g.swap();goRpg(g,11,5);g.interact();assert(s.d7Name&&!s.chase);
  g.swap();goReal(g,11,10);g.interact();assert(s.d7Original);
  g.swap();const loc={keep:[2,10],free:[8,10],replace:[12,7]}[choice];
  goRpg(g,...loc);g.interact();assert.equal(s.d7Choice,choice);
  goRpg(g,13,10);assert(s.won,`Día 7 final ${choice}`);assert.equal(s.endingId,choice);
  return g;
}
test('transición Día 6→7 y nuevo objetivo',()=>{const g=enter7(),s=g.state();assert.equal(s.room,'ARCHIVO DE ORIGEN');assert(E.objective(s).includes('TERMINAL'));assert(!s.won);});
test('mapas y objetos, muro sólido hasta escribir el nombre',()=>{
 const s=enter7().state();assert.equal(E.REAL_7.length,14);assert(E.REAL_7.every(row=>row.length===16));
 assert.equal(E.RPG_7.length,13);assert(E.RPG_7.every(row=>row.length===16));
 assert.equal(E.bfs(E.realMap(s),2,2,11,10).length,0);
 for(const o of E.REAL_ITEMS_7.filter(v=>v.id!=='originalPhoto'))assert(E.bfs(E.realMap(s),2,2,o.x,o.y).length>0,o.id);
 for(const o of E.RPG_ITEMS_7)assert(E.bfs(E.rpgMap(s),1,1,o.x,o.y).length>0,o.id);
 s.d7Name=true;assert(E.bfs(E.realMap(s),2,2,11,10).length>0);
});
test('orden estricto y decisión no disponible antes de foto',()=>{
 const g=enter7(),s=g.state();s.rx=12.5;s.ry=3.5;g.interact();assert(!s.d7Voice);
 g.swap();s.px=4;s.py=4;g.interact();assert(!s.d7Portrait);
 s.px=11;s.py=5;g.interact();assert(!s.d7Name);
 s.px=8;s.py=10;g.interact();assert.equal(s.d7Choice,'none');
 s.px=13;s.py=9;g.move('ArrowDown');assert(!s.won);
});
test('final CONSERVAR con recorrido y colisiones normales',()=>{const g=fullRun('keep');assert.equal(g.state().endingId,'keep');});
test('final LIBERAR con recorrido y colisiones normales',()=>{const g=fullRun('free');assert.equal(g.state().endingId,'free');});
test('final RELEVO con recorrido y colisiones normales',()=>{const g=fullRun('replace');assert.equal(g.state().endingId,'replace');});
test('guardado anterior, final cerrado y JSON incompatible',()=>{
 const g=fullRun('free'),s=g.state();for(let i=0;i<3;i++)g.interact();assert.equal(s.endingStage,3);assert(E.objective(s).includes('FIN'));
 g.interact();assert.equal(s.day,7);assert.equal(s.endingId,'free');
 const clone=JSON.parse(JSON.stringify(s)), other=E.newGame();assert(other.load(clone));assert.equal(other.state().endingId,'free');
 assert(!other.load({...clone,d7Choice:'dangerous'}));assert.equal(other.state().endingId,'free');
 const legacy={...E.initial(),version:11,day:6,won:true,endingStage:3,d6Negative:true};
 for(const key of ['d7Terminal','d7Portrait','d7Voice','d7Name','d7Original','d7Choice','endingId'])delete legacy[key];
 assert(other.load(legacy));other.interact();assert.equal(other.state().day,7);
});
console.log(`DÍA 7: ${passed} pruebas superadas`);
