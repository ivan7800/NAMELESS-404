'use strict';
const assert=require('node:assert/strict');
const E=require('../.testbuild/engine.js').NamelessEngine;
let passed=0;
function test(label,fn){fn();passed++;console.log('OK día 5:',label);}
const directions={'0,-1':0,'1,0':1,'0,1':2,'-1,0':3};
const buttons={'0,-1':'ArrowUp','1,0':'ArrowRight','0,1':'ArrowDown','-1,0':'ArrowLeft'};
function goReal(g,x,y){const s=g.state();let safety=0;
 while(E.distance(s.rx,s.ry,x+.5,y+.5)>.28&&safety++<120){
  const path=E.bfs(E.realMap(s),s.rx,s.ry,x,y);
  assert(path.length>1,`Sin salida real a ${x},${y}`);
  const [tx,ty]=path[1],[ox,oy]=path[0];
  const need=directions[`${tx-ox},${ty-oy}`];
  for(let j=0;j<4&&s.dir!==need;j++)g.move('ArrowRight');
  for(let j=0;j<5&&E.distance(s.rx,s.ry,tx+.5,ty+.5)>.28;j++)assert(g.move('ArrowUp'),'Colisión inesperada');
 }
 assert(E.distance(s.rx,s.ry,x+.5,y+.5)<.29,`No se alcanzó ${x},${y}`);
}
function goRPG(g,x,y){const s=g.state();const path=E.bfs(E.rpgMap(s),s.px,s.py,x,y);
 assert(path.length>0,`Sin camino RPG ${x},${y}`);
 for(let i=1;i<path.length;i++){
  const [ox,oy]=path[i-1],[tx,ty]=path[i];assert(g.move(buttons[`${tx-ox},${ty-oy}`]));
 }
 assert.equal(s.px,x);assert.equal(s.py,y);
}
function enter5(){const g=E.newGame(),s=g.state();s.day=4;s.d4File=true;s.won=true;s.endingStage=3;
 g.interact();assert.equal(s.day,5);return g;}
test('dos mapas nuevos con dimensiones coherentes y objetivos accesibles',()=>{
 assert.equal(E.REAL_5.length,14);assert(E.REAL_5.every(v=>v.length===16));
 assert.equal(E.RPG_5.length,13);assert(E.RPG_5.every(v=>v.length===16));
 const g=enter5(),s=g.state();
 for(const o of E.REAL_ITEMS_5)assert(E.bfs(E.realMap(s),2,2,o.x,o.y).length>0,`Real: ${o.id}`);
 for(const o of E.RPG_ITEMS_5)assert(E.bfs(E.rpgMap(s),1,1,o.x,o.y).length>0,`RPG: ${o.id}`);
});
test('la transición conserva la historia anterior y restaura el capítulo nuevo',()=>{
 const g=E.newGame(),s=g.state();s.day=4;s.d4Reel=true;s.won=true;s.endingStage=3;g.interact();
 assert.equal(s.day,5);assert.equal(s.d4Reel,true);assert.equal(s.d5Sign,false);
 assert.equal(s.room,'CALLE DE LOS AUSENTES');assert.equal(s.mode,'real');
});
test('las acciones prematuras no saltan pasos y la calle cambia el mapa',()=>{
 const g=enter5(),s=g.state();
 assert(E.wall(E.realMap(s),8.5,6.5));
 s.rx=12.5;s.ry=3.5;g.interact();assert.equal(s.d5Plot,false);
 g.swap();s.px=4;s.py=4;g.interact();assert.equal(s.d5Address,false);
 s.px=11;s.py=5;g.interact();assert.equal(s.d5Street,false);
 g.swap();s.rx=11.5;s.ry=10.5;g.interact();assert.equal(s.d5House,false);
 s.rx=4.5;s.ry=3.5;g.interact();assert.equal(s.d5Sign,true);
 g.swap();s.px=4;s.py=4;g.interact();assert.equal(s.d5Address,true);
 g.swap();s.rx=12.5;s.ry=3.5;g.interact();assert(s.d5Plot&&s.chase);
 g.swap();s.px=11;s.py=5;g.interact();assert(s.d5Street&&!s.chase);
 assert(!E.wall(E.realMap(s),8.5,6.5));
 g.swap();s.rx=11.5;s.ry=10.5;g.interact();assert(s.d5House);
 g.swap();s.px=13;s.py=9;g.move('ArrowDown');assert(s.won);
 for(let i=0;i<3;i++)g.interact();assert(E.objective(s).includes('DIA 6'));
});
test('recorrido completo con movimiento normal, colisiones y persecución',()=>{
 const g=enter5(),s=g.state();
 goReal(g,4,3);g.interact();assert(s.d5Sign);
 g.swap();goRPG(g,4,4);g.interact();assert(s.d5Address);
 g.swap();goReal(g,12,3);g.interact();assert(s.d5Plot&&s.chase);
 g.swap();goRPG(g,11,5);g.interact();assert(s.d5Street&&!s.chase);
 g.swap();goReal(g,11,10);g.interact();assert(s.d5House);
 g.swap();goRPG(g,13,10);assert(s.won,'Día 5 debe ser terminable');
 assert.equal(s.day,5);
});
test('guardado v0.10 recuperable y rechazo del día corrupto',()=>{
 const g=enter5(),s=g.state();goReal(g,4,3);g.interact();
 const save=JSON.parse(JSON.stringify(s));const other=E.newGame();
 assert(other.load(save));assert(other.state().d5Sign);
 assert(!other.load({...save,day:8}));assert(other.state().d5Sign,'El rechazo no modifica progreso');
 const previous={...E.initial(),version:9,day:4,d4Reel:true,won:true,endingStage:3};
 delete previous.d5Sign;delete previous.d5Street;delete previous.d5House;delete previous.d5Address;delete previous.d5Plot;
 assert(other.load(previous));other.interact();assert.equal(other.state().day,5);
});
test('salida del edificio no permite pasar por el muro no restaurado',()=>{
 const g=enter5(),s=g.state();s.rx=8.5;s.ry=5.5;s.dir=2;
 assert.equal(g.move('ArrowUp'),false);
 s.d5Street=true;assert.equal(g.move('ArrowUp'),true);
});
console.log(`DÍA 5: ${passed} pruebas superadas`);
