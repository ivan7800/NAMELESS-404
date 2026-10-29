'use strict';
const assert=require('node:assert/strict');
const E=require('../.testbuild/engine.js').NamelessEngine;
let passed=0;
function test(name,fn){fn();passed++;console.log('OK día 6:',name);}
const dirs={'0,-1':0,'1,0':1,'0,1':2,'-1,0':3};
const keys={'0,-1':'ArrowUp','1,0':'ArrowRight','0,1':'ArrowDown','-1,0':'ArrowLeft'};
function goReal(g,x,y){const s=g.state();let safety=0;
  while(E.distance(s.rx,s.ry,x+.5,y+.5)>.28 && safety++<140){
    const path=E.bfs(E.realMap(s),s.rx,s.ry,x,y);
    assert(path.length>1,`Sin salida real a ${x},${y} / ${s.rx},${s.ry}`);
    const [tx,ty]=path[1],[ox,oy]=path[0],need=dirs[`${tx-ox},${ty-oy}`];
    for(let j=0;j<4&&s.dir!==need;j++)g.move('ArrowRight');
    for(let j=0;j<5&&E.distance(s.rx,s.ry,tx+.5,ty+.5)>.28;j++)assert(g.move('ArrowUp'),'Colisión inesperada');
  }
  assert(E.distance(s.rx,s.ry,x+.5,y+.5)<.29,`No se alcanzó ${x},${y}`);
}
function goRpg(g,x,y){const s=g.state();const path=E.bfs(E.rpgMap(s),s.px,s.py,x,y);
  assert(path.length>0,`Sin camino RPG ${x},${y}`);
  for(let i=1;i<path.length;i++){
    const [ox,oy]=path[i-1],[tx,ty]=path[i];
    assert(g.move(keys[`${tx-ox},${ty-oy}`]));
  }
  assert.equal(s.px,x);assert.equal(s.py,y);
}
function enter6(){const g=E.newGame(),s=g.state();s.day=5;s.won=true;s.endingStage=3;s.d5House=true;g.interact();assert.equal(s.day,6);return g;}
test('nuevos mapas y objetos accesibles',()=>{
  assert.equal(E.REAL_6.length,14);assert(E.REAL_6.every(row=>row.length===16));
  assert.equal(E.RPG_6.length,13);assert(E.RPG_6.every(row=>row.length===16));
  const s=enter6().state();
  for(const i of E.REAL_ITEMS_6.filter(o=>o.id!=='negative'))assert(E.bfs(E.realMap(s),2,2,i.x,i.y).length>0,i.id);
  assert.equal(E.bfs(E.realMap(s),2,2,11,10).length,0,'El archivo negativo debe estar cerrado inicialmente');
  s.d6Vent=true;assert(E.bfs(E.realMap(s),2,2,11,10).length>0,'El archivo debe ser accesible tras la rueda');
  for(const i of E.RPG_ITEMS_6)assert(E.bfs(E.rpgMap(s),1,1,i.x,i.y).length>0,i.id);
});
test('transición y memoria narrativa de los cinco días',()=>{
  const g=enter6(),s=g.state();assert.equal(s.day,6);assert.equal(s.d5House,true);
  assert.equal(s.d6Label,false);assert.equal(s.room,'RECEPCION DE CENIZAS');
  assert.equal(s.mode,'real');assert(E.objective(s).includes('ETIQUETA'));
});
test('orden estricto, apertura física y desenlace',()=>{
  const g=enter6(),s=g.state();assert(E.wall(E.realMap(s),8.5,6.5));
  s.rx=12.5;s.ry=3.5;g.interact();assert(!s.d6Furnace);
  g.swap();s.px=4;s.py=4;g.interact();assert(!s.d6Index);
  s.px=11;s.py=5;g.interact();assert(!s.d6Vent);
  g.swap();s.rx=11.5;s.ry=10.5;g.interact();assert(!s.d6Negative);
  s.rx=4.5;s.ry=3.5;g.interact();assert(s.d6Label);
  g.swap();s.px=4;s.py=4;g.interact();assert(s.d6Index);
  g.swap();s.rx=12.5;s.ry=3.5;g.interact();assert(s.d6Furnace&&s.chase);
  g.swap();s.px=11;s.py=5;g.interact();assert(s.d6Vent&&!s.chase);assert(!E.wall(E.realMap(s),8.5,6.5));
  g.swap();s.rx=11.5;s.ry=10.5;g.interact();assert(s.d6Negative);
  g.swap();s.px=13;s.py=9;g.move('ArrowDown');assert(s.won);
  for(let i=0;i<3;i++)g.interact();assert(E.objective(s).includes('DIA 7'));
});
test('recorrido completo con controles y colisiones normales',()=>{
  const g=enter6(),s=g.state();
  goReal(g,4,3);g.interact();assert(s.d6Label);
  g.swap();goRpg(g,4,4);g.interact();assert(s.d6Index);
  g.swap();goReal(g,12,3);g.interact();assert(s.d6Furnace&&s.chase);
  g.swap();goRpg(g,11,5);g.interact();assert(s.d6Vent&&!s.chase);
  g.swap();goReal(g,11,10);g.interact();assert(s.d6Negative);
  g.swap();goRpg(g,13,10);assert(s.won,'El Día 6 debe poder terminarse');
});
test('migración v0.11, copia completa y rechazo de estados malformados',()=>{
  const g=enter6(),s=g.state();goReal(g,4,3);g.interact();
  const copy=JSON.parse(JSON.stringify(s)),other=E.newGame();
  assert(other.load(copy));assert(other.state().d6Label);assert.equal(other.state().day,6);
  const bad={...copy,day:8};assert(!other.load(bad));assert(other.state().d6Label);
  const previous={...E.initial(),version:10,day:5,won:true,endingStage:3,d5House:true};
  for(const flag of ['d6Label','d6Index','d6Furnace','d6Vent','d6Negative'])delete previous[flag];
  assert(other.load(previous));other.interact();assert.equal(other.state().day,6);
});
test('la compuerta respeta colisiones y solo se abre al girar la rueda',()=>{
  const g=enter6(),s=g.state();s.rx=8.5;s.ry=5.5;s.dir=2;
  assert.equal(g.move('ArrowUp'),false);
  s.d6Vent=true;assert.equal(g.move('ArrowUp'),true);
});
console.log(`DÍA 6: ${passed} pruebas superadas`);
