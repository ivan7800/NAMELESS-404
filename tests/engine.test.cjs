'use strict';
const assert=require('node:assert/strict');
const E=require('../.testbuild/engine.js').NamelessEngine;
let count=0;function test(title,fn){fn();count++;console.log('OK',title);}
function plan(map,from,to){let path=E.bfs(map,from[0],from[1],to[0],to[1]);assert(path.length>0,'Ruta imposible a '+to);return path;}
function goRpg(g,x,y){const s=g.state();const dirs={'0,-1':'ArrowUp','1,0':'ArrowRight','0,1':'ArrowDown','-1,0':'ArrowLeft'};const path=plan(E.RPG,[s.px,s.py],[x,y]);for(let i=1;i<path.length;i++){const dx=path[i][0]-path[i-1][0],dy=path[i][1]-path[i-1][1];assert(g.move(dirs[`${dx},${dy}`]),'Falló el paso RPG '+dx+','+dy);}assert.deepEqual([s.px,s.py],[x,y]);}
function near(x1,y1,x2,y2,r){return E.distance(x1,y1,x2,y2)<r;}
test('mapas originales coherentes (bloqueados y dimensiones)',()=>{assert.equal(E.REAL.length,14);assert.equal(E.RPG.length,13);assert(E.REAL.every(x=>x.length===16));assert(E.RPG.every(x=>x.length===16));});
test('zonas del Día 1 accesibles en RPG',()=>{let s=E.initial();for(let o of E.RPG_ITEMS){plan(E.RPG,[s.px,s.py],[o.x,o.y]);}});
test('zonas principales accesibles en edificio',()=>{let s=E.initial();for(let o of E.REAL_ITEMS){plan(E.REAL,[s.rx,s.ry],[o.x,o.y]);}});
test('secuencias de pista y sello entre mundos',()=>{const g=E.newGame();g.swap();goRpg(g,4,3);g.interact();assert.equal(g.state().note,true);goRpg(g,9,8);g.interact();assert.equal(g.state().seal,true);g.swap();g.state().rx=13.5;g.state().ry=2.5;g.interact();assert.equal(g.state().photo,true);g.swap();goRpg(g,10,4);g.interact();assert.equal(g.state().echo,true);g.swap();g.state().rx=3.5;g.state().ry=9.5;g.interact();assert.equal(g.state().key,false);g.state().rx=10.5;g.state().ry=9.5;g.interact();assert.equal(g.state().tape,true);g.state().rx=3.5;g.state().ry=9.5;g.interact();assert.equal(g.state().key,true);g.swap();goRpg(g,13,10);assert.equal(g.state().won,true);assert.equal(g.state().scene,'ending');assert.equal(g.state().endingStage,0);g.interact();g.interact();g.interact();assert.equal(g.state().endingStage,3);});
test('cinta activa la persecución y la entidad no atraviesa paredes',()=>{let g=E.newGame(),s=g.state();s.echo=true;s.rx=10.5;s.ry=9.5;g.interact();assert.equal(s.tape,true);assert.equal(s.chase,true);s.rx=13.5;s.ry=10.5;for(let i=0;i<5;i++){g.move('ArrowLeft');g.move('ArrowRight');}assert(E.wall(E.REAL,s.entityX,s.entityY)===false);});
test('el escondite desactiva la persecución inmediata',()=>{let g=E.newGame(),s=g.state();s.rx=12.5;s.ry=4.5;s.chase=true;s.threat=72;g.interact();assert.equal(s.hidden,true);assert(s.threat<72);});
test('espejo y teléfono: eventos únicos y diario',()=>{let g=E.newGame(),s=g.state();s.rx=8.5;s.ry=3.5;g.interact();g.interact();assert.equal(s.call,true);assert.equal(s.scares.filter(x=>x==='phone').length,1);s.rx=5.5;s.ry=4.5;g.interact();assert.equal(s.mirror,true);assert(s.journal.length>=2);});
test('guardado validado y rechazo de estados corruptos',()=>{const g=E.newGame();g.swap();g.move('ArrowRight');let saved=JSON.parse(JSON.stringify(g.state()));const b=E.newGame();assert.equal(b.load(saved),true);assert.equal(b.state().px,g.state().px);saved.rx=-300;assert.equal(b.load(saved),false);assert.equal(b.state().px,g.state().px);assert.equal(b.load({...E.initial(),version:3}),false);const fromOld={...E.initial(),version:4};delete fromOld.echo;delete fromOld.photo;assert.equal(b.load(fromOld),true);assert.equal(b.state().version,E.VERSION);assert.equal(b.state().echo,false);});
test('la amenaza puede atrapar sin borrar progreso',()=>{let g=E.newGame(),s=g.state();s.note=true;s.seal=true;s.chase=true;s.rx=13.5;s.ry=11.5;g.move('ArrowRight');g.move('ArrowLeft');g.move('ArrowUp');assert.equal(s.note,true);assert.equal(s.seal,true);});
test('recorrido físico desde el inicio con controles reales hasta cada objeto',()=>{
  const directions={'0,-1':0,'1,0':1,'0,1':2,'-1,0':3};
  for(const target of E.REAL_ITEMS){
    const g=E.newGame(),s=g.state(),p=plan(E.REAL,[s.rx,s.ry],[target.x,target.y]);
    for(let i=1;i<p.length;i++){
      const [tx,ty]=p[i],[ox,oy]=p[i-1],d=directions[`${tx-ox},${ty-oy}`];
      for(let k=0;s.dir!==d&&k<4;k++)g.move('ArrowRight');
      let n=0;
      while((Math.floor(s.rx)!==tx||Math.floor(s.ry)!==ty||E.distance(s.rx,s.ry,tx+.5,ty+.5)>.28)&&n++<4){
        assert(g.move('ArrowUp'),'Obstáculo en ruta a '+target.id+' -> '+tx+','+ty);
      }
      assert(E.distance(s.rx,s.ry,tx+.5,ty+.5)<.29,'Desalineación en '+target.id);
    }
    assert(E.distance(s.rx,s.ry,target.x,target.y)<target.r,'Interacción fuera de rango en '+target.id);
  }
});
test('orden del nuevo enigma: foto y pozo imprescindibles',()=>{
  const g=E.newGame(),s=g.state();s.rx=13.5;s.ry=2.5;g.interact();assert.equal(s.photo,false);
  g.swap();goRpg(g,10,4);g.interact();assert.equal(s.echo,false);
  s.note=true;s.seal=true;g.swap();g.interact();assert.equal(s.photo,true);g.swap();g.interact();assert.equal(s.echo,true);
});
test('la cinta no activa persecucion antes de recuperar el nombre',()=>{
  const g=E.newGame(),s=g.state();s.rx=10.5;s.ry=9.5;g.interact();assert.equal(s.tape,false);assert.equal(s.chase,false);
  s.echo=true;g.interact();assert.equal(s.tape,true);assert.equal(s.chase,true);
});
test('epilogo se puede avanzar y no se borran objetos',()=>{
  const g=E.newGame(),s=g.state();s.key=true;s.echo=true;g.swap();goRpg(g,13,10);
  assert.equal(s.won,true);for(let i=0;i<3;i++)g.interact();assert.equal(s.endingStage,3);assert.equal(s.key,true);
});
test('las cuatro zonas y el objetivo progresivo son legibles',()=>{
  const g=E.newGame(),s=g.state();assert.equal(E.roomAt(2.5,2.5),'VESTIBULO');assert.equal(E.roomAt(13.5,2.5),'ALA ESTE');
  assert.equal(E.roomAt(3.5,9.5),'ALA DE ARCHIVOS');assert.equal(E.roomAt(10.5,9.5),'SOTANO TECNICO');
  assert(E.objective(s).includes('NOTA'));s.note=true;s.seal=true;assert(E.objective(s).includes('FOTO'));
  s.photo=true;assert(E.objective(s).includes('POZO'));s.echo=true;assert(E.objective(s).includes('CINTA'));
});

test('campana del Dia 1 realizable solo con movimientos fisicos y encuentros activos',()=>{
  const g=E.newGame(),s=g.state();
  const dirs={'0,-1':0,'1,0':1,'0,1':2,'-1,0':3};
  const buttons={'0,-1':'ArrowUp','1,0':'ArrowRight','0,1':'ArrowDown','-1,0':'ArrowLeft'};
  function goR(x,y){const path=plan(E.REAL,[s.rx,s.ry],[x,y]);for(let i=1;i<path.length;i++){
    const [ox,oy]=path[i-1],[tx,ty]=path[i],want=dirs[`${tx-ox},${ty-oy}`];
    for(let j=0;j<4&&s.dir!==want;j++)g.move('ArrowRight');
    for(let j=0;j<5&&E.distance(s.rx,s.ry,tx+.5,ty+.5)>.28;j++)assert(g.move('ArrowUp'));
    assert(E.distance(s.rx,s.ry,tx+.5,ty+.5)<.29);
  }}
  function goP(x,y){const path=plan(E.RPG,[s.px,s.py],[x,y]);for(let i=1;i<path.length;i++){
    const [ox,oy]=path[i-1],[tx,ty]=path[i];assert(g.move(buttons[`${tx-ox},${ty-oy}`]));
  }}
  g.swap();goP(4,3);g.interact();assert(s.note);goP(9,8);g.interact();assert(s.seal);
  g.swap();goR(13,2);g.interact();assert(s.photo);
  g.swap();goP(10,4);g.interact();assert(s.echo);
  g.swap();goR(10,9);g.interact();assert(s.tape&&s.chase);
  goR(3,9);g.interact();assert(s.key);assert.equal(s.encounter,0);
  g.swap();goP(13,10);assert(s.won);g.interact();g.interact();g.interact();assert.equal(s.endingStage,3);
});


test('mapas del Día 2: dimensiones y accesibilidad de objetivos',()=>{
  assert(E.REAL_2.every(r=>r.length===16));assert.equal(E.REAL_2.length,14);
  assert(E.RPG_2.every(r=>r.length===16));assert.equal(E.RPG_2.length,13);
  for(let o of E.REAL_ITEMS_2)plan(E.REAL_2,[2,2],[o.x,o.y]);
  for(let o of E.RPG_ITEMS_2)plan(E.RPG_2,[1,1],[o.x,o.y]);
});
test('transición controlada desde epílogo del Día 1 al Día 2',()=>{
  const g=E.newGame(),s=g.state();s.won=true;s.endingStage=3;
  assert(E.objective(s).includes('DIA 2'));g.interact();
  assert.equal(s.day,2);assert.equal(s.won,false);assert.equal(s.mode,'real');
  assert.equal(s.d2Register,false);assert.equal(s.room,'RECEPCION');
});
test('cadena de enigmas del Día 2 no se puede saltar',()=>{
  const g=E.newGame(),s=g.state();s.won=true;s.endingStage=3;g.interact();
  s.rx=12.5;s.ry=3.5;g.interact();assert.equal(s.d2Frequency,false);
  g.swap();s.px=11;s.py=4;g.interact();assert.equal(s.d2Reflection,false);
  g.swap();s.rx=11.5;s.ry=9.5;g.interact();assert.equal(s.d2Door,false);
  s.rx=3.5;s.ry=3.5;g.interact();assert.equal(s.d2Register,true);
  g.swap();s.px=4;s.py=3;g.interact();assert.equal(s.d2Bell,true);
  g.swap();s.rx=12.5;s.ry=3.5;g.interact();assert.equal(s.d2Frequency,true);assert.equal(s.chase,true);
  g.swap();s.px=11;s.py=4;g.interact();assert.equal(s.d2Reflection,true);assert.equal(s.chase,false);
  g.swap();s.rx=11.5;s.ry=9.5;g.interact();assert.equal(s.d2Door,true);assert.equal(s.chase,false);
  g.swap();s.px=13;s.py=9;g.move('ArrowDown');assert.equal(s.won,true);assert.equal(s.day,2);
});
test('el Día 2 admite guardar y recuperar en ambos mundos',()=>{
  const g=E.newGame();g.state().won=true;g.state().endingStage=3;g.interact();
  g.state().rx=3.5;g.state().ry=3.5;g.interact();g.swap();
  const save=JSON.parse(JSON.stringify(g.state()));const other=E.newGame();
  assert.equal(other.load(save),true);assert.equal(other.state().day,2);
  assert.equal(other.state().d2Register,true);assert.equal(other.state().mode,'rpg');
  assert.equal(other.load({...save,rx:1.2,ry:1.1}),false);
});
test('el Día 2 usa el mapa propio y la IA no atraviesa muros',()=>{
  const g=E.newGame(),s=g.state();s.won=true;s.endingStage=3;g.interact();
  s.chase=true;s.rx=11.5;s.ry=9.5;
  for(let i=0;i<11;i++){g.move('ArrowLeft');g.move('ArrowRight');}
  assert(!E.wall(E.REAL_2,s.entityX,s.entityY));
  assert(s.encounter>=0);
});
test('migración desde guardado 0.5 tras terminar Día 1',()=>{
  const g=E.newGame(),p={...E.initial(),version:5,won:true,endingStage:3};
  delete p.d2Register;delete p.d2Bell;delete p.d2Frequency;
  delete p.d2Reflection;delete p.d2Door;
  assert(g.load(p));assert.equal(g.state().version,E.VERSION);g.interact();assert.equal(g.state().day,2);
});

test('Día 2 se completa con controles reales y sin teletransportes',()=>{
  const g=E.newGame(),s=g.state();s.won=true;s.endingStage=3;g.interact();
  const buttons={'0,-1':'ArrowUp','1,0':'ArrowRight','0,1':'ArrowDown','-1,0':'ArrowLeft'};
  const dirs={'0,-1':0,'1,0':1,'0,1':2,'-1,0':3};
  function realGo(x,y){let safety=0;
    while(E.distance(s.rx,s.ry,x+.5,y+.5)>.28&&safety++<70){
      const path=plan(E.REAL_2,[s.rx,s.ry],[x,y]);
      if(path.length<2)break;
      const [tx,ty]=path[1],[ox,oy]=path[0],want=dirs[`${tx-ox},${ty-oy}`];
      for(let j=0;j<4&&s.dir!==want;j++)g.move('ArrowRight');
      for(let j=0;j<5&&E.distance(s.rx,s.ry,tx+.5,ty+.5)>.28;j++)assert(g.move('ArrowUp'));
    }
    assert(E.distance(s.rx,s.ry,x+.5,y+.5)<.29,`No se llegó a ${x},${y}`);
  }
  function rpgGo(x,y){const path=plan(E.RPG_2,[s.px,s.py],[x,y]);for(let i=1;i<path.length;i++){
    const [ox,oy]=path[i-1],[tx,ty]=path[i];assert(g.move(buttons[`${tx-ox},${ty-oy}`]));
  }}
  realGo(3,3);g.interact();assert(s.d2Register);
  g.swap();rpgGo(4,3);g.interact();assert(s.d2Bell);
  g.swap();realGo(12,3);g.interact();assert(s.d2Frequency);
  g.swap();rpgGo(11,4);g.interact();assert(s.d2Reflection);
  g.swap();realGo(11,9);g.interact();assert(s.d2Door);
  g.swap();rpgGo(13,10);assert(s.won);assert.equal(s.day,2);
});
console.log(`${count} pruebas superadas`);



test('Día 3: mapas de estación originales y rutas accesibles',()=>{
  assert.equal(E.REAL_3.length,14);assert(E.REAL_3.every(r=>r.length===16));
  assert.equal(E.RPG_3.length,13);assert(E.RPG_3.every(r=>r.length===16));
  for(const it of E.REAL_ITEMS_3)plan(E.REAL_3,[2,2],[it.x,it.y]);
  for(const it of E.RPG_ITEMS_3)plan(E.RPG_3,[1,1],[it.x,it.y]);
  const g=E.newGame(),s=g.state();s.day=3;
  assert.equal(E.wall(E.realMap(s),8.5,6.5),true);
  s.d3Signal=true;
  assert.equal(E.wall(E.realMap(s),8.5,6.5),false);
  assert.equal(E.objective(s).includes('BILLETE'),true);
});
test('Día 3: transición tras cerrar el Día 2 y estado propio',()=>{
  const g=E.newGame(),s=g.state();s.day=2;s.won=true;s.endingStage=3;g.interact();
  assert.equal(s.day,3);assert.equal(s.won,false);assert.equal(s.mode,'real');
  assert.equal(s.d3Signal,false);assert.equal(s.room,'VESTIBULO DE ESTACION');
  assert.equal(s.px,1);assert.equal(s.rx,2.5);
});
test('Día 3: puzzles condicionados y cambio de ruta en la realidad',()=>{
  const g=E.newGame(),s=g.state();s.day=2;s.won=true;s.endingStage=3;g.interact();
  s.rx=12.5;s.ry=4.5;g.interact();assert.equal(s.d3Schedule,false);
  g.swap();s.px=3;s.py=4;g.interact();assert.equal(s.d3Clock,false);
  s.px=10;s.py=6;g.interact();assert.equal(s.d3Signal,false);
  g.swap();s.rx=10.5;s.ry=10.5;g.interact();assert.equal(s.d3Booth,false);
  s.rx=4.5;s.ry=2.5;g.interact();assert(s.d3Ticket);
  g.swap();s.px=3;s.py=4;g.interact();assert(s.d3Clock);
  g.swap();s.rx=12.5;s.ry=4.5;g.interact();assert(s.d3Schedule&&s.chase);
  g.swap();s.px=10;s.py=6;g.interact();assert(s.d3Signal);assert(!s.chase);
  assert.equal(E.wall(E.realMap(s),8.5,6.5),false);
  g.swap();s.rx=10.5;s.ry=10.5;g.interact();assert(s.d3Booth);
  g.swap();s.px=13;s.py=9;g.move('ArrowDown');assert(s.won);
  for(let i=0;i<3;i++)g.interact();assert.equal(s.endingStage,3);
  assert(E.objective(s).includes('DIA 4'));
});
test('Día 3: guardar, cargar y migrar desde v0.6',()=>{
  const g=E.newGame(),s=g.state();s.day=2;s.won=true;s.endingStage=3;g.interact();
  s.rx=4.5;s.ry=2.5;g.interact();
  const state=JSON.parse(JSON.stringify(s)),g2=E.newGame();
  assert(g2.load(state));assert(g2.state().d3Ticket);assert.equal(g2.state().day,3);
  assert(!g2.load({...state,rx:8.5,ry:6.5}));
  const old={...E.initial(),version:6,day:2,won:true,endingStage:3};
  for(const k of ['d3Ticket','d3Clock','d3Schedule','d3Signal','d3Booth'])delete old[k];
  assert(g2.load(old));g2.interact();assert.equal(g2.state().day,3);
});
test('Día 3: final alcanzable con movimientos reales en ambos mundos',()=>{
  const g=E.newGame(),s=g.state();s.day=2;s.won=true;s.endingStage=3;g.interact();
  const dirs={'0,-1':0,'1,0':1,'0,1':2,'-1,0':3};
  const keys={'0,-1':'ArrowUp','1,0':'ArrowRight','0,1':'ArrowDown','-1,0':'ArrowLeft'};
  function realGo(x,y){let safety=0;
    while(E.distance(s.rx,s.ry,x+.5,y+.5)>.28 && safety++<90){
      const path=plan(E.realMap(s),[s.rx,s.ry],[x,y]);
      assert(path.length>1,'Sin salida a '+x+','+y);
      const [tx,ty]=path[1],[ox,oy]=path[0],want=dirs[`${tx-ox},${ty-oy}`];
      for(let j=0;j<4&&s.dir!==want;j++)g.move('ArrowRight');
      for(let j=0;j<5&&E.distance(s.rx,s.ry,tx+.5,ty+.5)>.28;j++)assert(g.move('ArrowUp'));
    }
    assert(E.distance(s.rx,s.ry,x+.5,y+.5)<.29,'Sin llegar a '+x+','+y);
  }
  function rpgGo(x,y){const path=plan(E.rpgMap(s),[s.px,s.py],[x,y]);for(let i=1;i<path.length;i++){
    const [ox,oy]=path[i-1],[tx,ty]=path[i];assert(g.move(keys[`${tx-ox},${ty-oy}`]));
  }}
  realGo(4,2);g.interact();assert(s.d3Ticket);
  g.swap();rpgGo(3,4);g.interact();assert(s.d3Clock);
  g.swap();realGo(12,4);g.interact();assert(s.d3Schedule);
  g.swap();rpgGo(10,6);g.interact();assert(s.d3Signal);
  g.swap();realGo(10,10);g.interact();assert(s.d3Booth);
  g.swap();rpgGo(13,10);assert(s.won);
});
console.log('TOTAL FINAL:',count,'pruebas');

test('Día 4: mapas hospitalarios originales y todos los objetivos accesibles',()=>{
  assert.equal(E.REAL_4.length,14);assert(E.REAL_4.every(row=>row.length===16));
  assert.equal(E.RPG_4.length,13);assert(E.RPG_4.every(row=>row.length===16));
  for(const o of E.REAL_ITEMS_4)plan(E.REAL_4,[2,2],[o.x,o.y]);
  for(const o of E.RPG_ITEMS_4)plan(E.RPG_4,[1,1],[o.x,o.y]);
  const s=E.initial();s.day=4;
  assert(E.wall(E.realMap(s),8.5,6.5));
  s.d4Fold=true;assert(!E.wall(E.realMap(s),8.5,6.5));
});
test('Día 4: transición desde Día 3, sin perder recuerdos anteriores',()=>{
  const g=E.newGame(),s=g.state();s.day=3;s.note=true;s.d3Ticket=true;s.won=true;s.endingStage=3;
  g.interact();assert.equal(s.day,4);assert.equal(s.mode,'real');assert.equal(s.won,false);
  assert.equal(s.note,true);assert.equal(s.d3Ticket,true);assert.equal(s.d4File,false);
  assert.equal(s.room,'ADMISION');assert(E.objective(s).includes('EXPEDIENTE'));
});
test('Día 4: secuencia bloqueada, amenaza y modificación del plano',()=>{
  const g=E.newGame(),s=g.state();s.day=3;s.won=true;s.endingStage=3;g.interact();
  s.rx=12.5;s.ry=3.5;g.interact();assert.equal(s.d4Xray,false);
  g.swap();s.px=4;s.py=4;g.interact();assert.equal(s.d4Ledger,false);
  s.px=11;s.py=5;g.interact();assert.equal(s.d4Fold,false);
  g.swap();s.rx=11.5;s.ry=10.5;g.interact();assert.equal(s.d4Reel,false);
  s.rx=4.5;s.ry=3.5;g.interact();assert(s.d4File);
  g.swap();s.px=4;s.py=4;g.interact();assert(s.d4Ledger);
  g.swap();s.rx=12.5;s.ry=3.5;g.interact();assert(s.d4Xray&&s.chase);
  g.swap();s.px=11;s.py=5;g.interact();assert(s.d4Fold&&!s.chase);
  assert(!E.wall(E.realMap(s),8.5,6.5));
  g.swap();s.rx=11.5;s.ry=10.5;g.interact();assert(s.d4Reel);
  g.swap();s.px=13;s.py=9;g.move('ArrowDown');assert(s.won);
  g.interact();g.interact();g.interact();assert.equal(s.endingStage,3);
  assert(E.objective(s).includes('DIA 5'));
});
test('Día 4: guardado, carga y migración desde v0.7',()=>{
  const g=E.newGame(),s=g.state();s.day=3;s.won=true;s.endingStage=3;g.interact();
  s.rx=4.5;s.ry=3.5;g.interact();const saved=JSON.parse(JSON.stringify(s));
  const x=E.newGame();assert(x.load(saved));assert.equal(x.state().day,4);assert(x.state().d4File);
  assert(!x.load({...saved,rx:8.5,ry:6.5}));
  const old={...E.initial(),version:7,day:3,won:true,endingStage:3};
  for(let k of ['d4File','d4Ledger','d4Xray','d4Fold','d4Reel'])delete old[k];
  assert(x.load(old));assert.equal(x.state().version,E.VERSION);x.interact();assert.equal(x.state().day,4);
});
test('Día 4: recorrido real hasta el final con movimientos y colisiones',()=>{
  const g=E.newGame(),s=g.state();s.day=3;s.won=true;s.endingStage=3;g.interact();
  const dirs={'0,-1':0,'1,0':1,'0,1':2,'-1,0':3};
  const keys={'0,-1':'ArrowUp','1,0':'ArrowRight','0,1':'ArrowDown','-1,0':'ArrowLeft'};
  function realGo(x,y){let safety=0;
    while(E.distance(s.rx,s.ry,x+.5,y+.5)>.28&&safety++<110){
      const path=plan(E.realMap(s),[s.rx,s.ry],[x,y]);
      assert(path.length>1,'No hay camino a '+x+','+y);
      const [tx,ty]=path[1],[ox,oy]=path[0],want=dirs[`${tx-ox},${ty-oy}`];
      for(let j=0;j<4&&s.dir!==want;j++)g.move('ArrowRight');
      for(let j=0;j<5&&E.distance(s.rx,s.ry,tx+.5,ty+.5)>.28;j++)assert(g.move('ArrowUp'));
    }
    assert(E.distance(s.rx,s.ry,x+.5,y+.5)<.29,'No se alcanzó '+x+','+y);
  }
  function rpgGo(x,y){const path=plan(E.rpgMap(s),[s.px,s.py],[x,y]);
    for(let i=1;i<path.length;i++){
      let [ox,oy]=path[i-1],[tx,ty]=path[i];assert(g.move(keys[`${tx-ox},${ty-oy}`]));
    }
  }
  realGo(4,3);g.interact();assert(s.d4File);
  g.swap();rpgGo(4,4);g.interact();assert(s.d4Ledger);
  g.swap();realGo(12,3);g.interact();assert(s.d4Xray);
  g.swap();rpgGo(11,5);g.interact();assert(s.d4Fold);
  g.swap();realGo(11,10);g.interact();assert(s.d4Reel);
  g.swap();rpgGo(13,10);assert(s.won);assert.equal(s.day,4);
});
console.log('TOTAL V0.8:',count,'pruebas');
