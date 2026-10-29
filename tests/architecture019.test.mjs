import assert from 'node:assert/strict';
import {NamelessEngine as E} from '../dist/src/engine.js';
import {kibaMap,KIBA_GATES,KIBA_SWITCHES,KIBA_HIDEOUTS,nearestKibaFeature,hideRisk,hideMayBeFound} from '../dist/src/premium/KibaArchitecture.js';
let count=0;
function test(name,fn){fn();count++;console.log('ARQUITECTURA PASS:',name);}
const expected=new Map([['0,-1',0],['1,0',1],['0,1',2],['-1,0',3]]);
function go(g,x,y){const s=g.state(),path=E.bfs(E.realMap(s),s.rx,s.ry,x,y);assert(path.length>0,'sin camino '+x+','+y);
 for(let j=1;j<path.length;j++){
  const [ax,ay]=path[j-1],[bx,by]=path[j],want=expected.get(`${bx-ax},${by-ay}`);
  while(s.dir!==want)g.move('ArrowRight');
  let attempts=0;while((Math.floor(s.rx)!==bx||Math.floor(s.ry)!==by)&&attempts++<6)assert(g.move('ArrowUp'),`colisión (${bx},${by})`);
  assert.equal(Math.floor(s.rx),bx);assert.equal(Math.floor(s.ry),by);
 }
}
test('Los dos atajos comienzan bloqueados y tienen entrada/salida libre',()=>{
 const m=E.realMap(E.initial());for(const gate of Object.values(KIBA_GATES)){
  assert(E.wall(m,gate.x,gate.y));assert(!E.wall(m,gate.x-1,gate.y));assert(!E.wall(m,gate.x+1,gate.y));
 }
});
test('Un nuevo mapa se deriva sin mutar el REAL original ni afectar los otros seis días',()=>{
 const original=E.REAL.map(row=>row);
 const a=kibaMap(E.REAL,{kibaNorthOpen:true,kibaArchiveOpen:true});
 assert.equal(a[2][6],'.');assert.equal(a[7][7],'.');assert.deepEqual(E.REAL,original);
 for(let day=2;day<=7;day++){const s=E.initial();s.day=day;const before=E.realMap(s);s.flags={kibaNorthOpen:true,kibaArchiveOpen:true};assert.deepEqual(E.realMap(s),before);}
});
test('Cuadro norte exige sello del RPG y después abre paso permanente',()=>{
 const g=E.newGame(),s=g.state();go(g,5.5,2.5);g.interact();assert(!s.flags.kibaNorthOpen);
 s.seal=true;g.interact();assert(s.flags.kibaNorthOpen);assert(!E.wall(E.realMap(s),6,2));
 const n=s.journal.length;g.interact();assert.equal(s.journal.length,n);
});
test('Atajo norte permite cruzar con movimientos reales y reduce distancia',()=>{
 const g=E.newGame(),s=g.state();s.seal=true;go(g,5.5,2.5);
 const oldRoute=E.bfs(E.realMap(s),5.5,2.5,7.5,2.5);
 g.interact();const newRoute=E.bfs(E.realMap(s),5.5,2.5,7.5,2.5);assert(newRoute.length<oldRoute.length);
 go(g,7.5,2.5);assert.equal(Math.floor(s.rx),7);
});
test('Atajo de archivo exige cinta y se mantiene abierto con el monstruo cerca',()=>{
 const g=E.newGame(),s=g.state();go(g,6.5,7.5);g.interact();assert(!s.flags.kibaArchiveOpen);
 s.tape=true;g.interact();assert(s.flags.kibaArchiveOpen);assert(!E.wall(E.realMap(s),7,7));
 assert(s.flags.kibaDecoy&&s.flags.kibaDecoy.x===6.5);
});
test('Atajo archivo: ruta alternativa navegable y ahorro de distancia',()=>{
 const s=E.initial();s.tape=true;const before=E.bfs(E.realMap(s),6.5,7.5,8.5,7.5);
 s.flags.kibaArchiveOpen=true;const after=E.bfs(E.realMap(s),6.5,7.5,8.5,7.5);
 assert(after.length<before.length);
 const g=E.newGame(),v=g.state();v.tape=true;go(g,6.5,7.5);g.interact();go(g,8.5,7.5);
 assert.equal(Math.floor(v.rx),8);
});
test('Conducto acústico: no atrae antes de persecución, se usa una única vez',()=>{
 const g=E.newGame(),s=g.state();s.rx=11.5;s.ry=5.5;g.interact();assert(!s.flags.kibaVentUsed);
 s.chase=true;s.tape=true;g.interact();assert(s.flags.kibaVentUsed);assert.equal(s.flags.kibaDecoy.x,11.5);
 const journal=s.journal.length;g.interact();assert.equal(s.journal.length,journal);
});
test('Los tres elementos de arquitectura y dos escondites están en suelo accesible',()=>{
 for(const f of [...KIBA_SWITCHES,...KIBA_HIDEOUTS]){assert(!E.wall(E.REAL,f.x,f.y),f.id);assert(E.bfs(E.REAL,2.5,2.5,f.x,f.y).length>1,f.id);}
 assert.equal(nearestKibaFeature(5.5,2.5,KIBA_SWITCHES)?.id,'kibaBreaker');
 assert.equal(nearestKibaFeature(1.5,1.5,KIBA_HIDEOUTS),null);
});
test('Escondites secundarios señalan riesgo y pueden abandonarse sin atasco',()=>{
 const g=E.newGame(),s=g.state();s.rx=3.5;s.ry=11.5;s.threat=80;g.interact();
 assert(s.hidden);assert(s.flags.kibaHideAlert);assert.equal(s.flags.kibaHideSpot,'kibaHideArchive');
 g.interact();assert(!s.hidden);assert.equal(s.flags.kibaHideSpot,undefined);
});
test('Esconderse lejos y con baja amenaza no causa captura automática',()=>{
 const g=E.newGame(),s=g.state();s.rx=9.5;s.ry=11.5;s.threat=0;g.interact();assert(s.hidden);assert.equal(s.flags.kibaHideAlert,false);
 assert(!hideRisk(10,false,1));assert(hideRisk(90,false,0));assert(hideMayBeFound(1,true,'search'));
 assert(!hideMayBeFound(2,true,'hunt'));assert(!hideMayBeFound(.4,false,'hunt'));
});
test('El escondite peligroso puede ser inspeccionado y provoca un encuentro',()=>{
 const g=E.newGame(),s=g.state();s.rx=9.5;s.ry=11.5;s.threat=90;s.chase=true;s.tape=true;s.entityX=10.5;s.entityY=11.5;
 s.flags.copyistMemory={x:9.5,y:11.5,lastSeenStep:0,phase:'search'};
 g.interact();assert(s.hidden);s.dir=0;s.rx=9.5;s.ry=11.5;s.steps=3;
 // La simulación avanza mientras se espera oculto. El escondite no congela la IA.
 let caught=false;for(let k=0;k<40;k++){g.tick();if(s.encounter>0){caught=true;break;}}
 assert(caught,'La Copista debería comprobar el escondite ruidoso');
 assert(!s.hidden);assert.equal(s.flags.kibaHideSpot,undefined);
});
test('Los flags de arquitectura y el escondite resisten guardado y migración v0.18',()=>{
 const g=E.newGame(),s=g.state();s.seal=true;s.rx=5.5;s.ry=2.5;g.interact();assert(s.flags.kibaNorthOpen);
 const restored=E.newGame();assert(restored.load(JSON.parse(JSON.stringify(s))));assert(restored.state().flags.kibaNorthOpen);
 const old=E.initial();old.version=13;const migrated=E.newGame();assert(migrated.load(old));assert.equal(migrated.state().version,E.VERSION);
});
test('Guardado manipulado con flags no booleanos no abre atajos',()=>{
 const s=E.initial();s.flags={kibaNorthOpen:'yes',kibaArchiveOpen:1,kibaVentUsed:'done',kibaHideSpot:'other',kibaHideAlert:'yes'};
 const g=E.newGame();assert(g.load(s));assert(E.wall(E.realMap(g.state()),6,2));assert(E.wall(E.realMap(g.state()),7,7));
 assert.equal(g.state().flags.kibaHideSpot,undefined);assert.equal(g.state().flags.kibaVentUsed,undefined);
});
test('Intentos de falsificar atajos sin resolver requisitos se descartan al cargar',()=>{
 const s=E.initial();s.flags={kibaNorthOpen:true,kibaArchiveOpen:true};
 const g=E.newGame();assert(g.load(s));assert.equal(g.state().flags.kibaNorthOpen,false);
 assert.equal(g.state().flags.kibaArchiveOpen,false);assert(E.wall(E.realMap(g.state()),6,2));
});
test('Escondite falsificado lejos de su posición se desactiva al cargar',()=>{
 const s=E.initial();s.hidden=true;s.flags={kibaHideSpot:'kibaHideBasement',kibaHideAlert:true};
 const g=E.newGame();assert(g.load(s));assert.equal(g.state().hidden,false);
 assert.equal(g.state().flags.kibaHideSpot,undefined);
});
test('Recursos premium no impiden transición al día 2',()=>{
 const g=E.newGame(),s=g.state();s.flags={kibaNorthOpen:true,kibaArchiveOpen:true,kibaVentUsed:true};s.won=true;s.endingStage=3;g.interact();
 assert.equal(s.day,2);assert.deepEqual(E.realMap(s),E.REAL_2);
});
console.log('ARQUITECTURA v0.19:',count,'pruebas superadas');
