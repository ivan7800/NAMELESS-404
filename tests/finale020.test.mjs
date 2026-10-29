import assert from 'node:assert/strict';
import {NamelessEngine as E} from '../dist/src/engine.js';
import {canStartFinale,finaleTarget,atFinaleTarget,sanitizeFinale,tensionLevel,FINALE_OBJECTIVES} from '../dist/src/premium/DayOneFinale.js';
let passed=0;
function test(label,run){run();passed++;console.log('FINAL DÍA 1 PASS:',label);}
const rotations=new Map([['0,-1',0],['1,0',1],['0,1',2],['-1,0',3]]);
function walk(g,x,y,shield=false){
 const s=g.state(),path=E.bfs(E.realMap(s),s.rx,s.ry,x,y);
 assert(path.length,'no existe ruta '+x+','+y);
 for(let j=1;j<path.length;j++){
  const [ax,ay]=path[j-1],[bx,by]=path[j],want=rotations.get(`${bx-ax},${by-ay}`);
  while(s.dir!==want)g.move('ArrowRight');
  let n=0;while((Math.floor(s.rx)!==bx||Math.floor(s.ry)!==by)&&n++<7){
   if(shield){s.entityX=13.5;s.entityY=11.5;s.light=false;}
   assert(g.move('ArrowUp'),'marcha bloqueada '+bx+','+by);
  }
  assert.equal(Math.floor(s.rx),bx);assert.equal(Math.floor(s.ry),by);
 }
}
function prepared(){const g=E.newGame(),s=g.state();s.note=s.seal=s.photo=s.echo=s.tape=s.key=true;return g;}
function start(){const g=prepared(),s=g.state();walk(g,10.5,9.5);g.interact();return g;}

test('objetivos físicos accesibles sin cambiar el mapa de Kiba',()=>{
 const s=E.initial(),map=E.realMap(s);for(const stage of [1,2]){const target=finaleTarget(stage);assert(target&&!E.wall(map,target.x,target.y));assert(E.bfs(map,10.5,9.5,target.x,target.y).length>0);}
 assert.equal(finaleTarget(0),null);assert.equal(finaleTarget(3),null);
});
test('no se puede activar antes de obtener llave y cinta',()=>{
 const g=E.newGame(),s=g.state();s.tape=true;walk(g,10.5,9.5);g.interact();assert(!s.flags.kibaFinaleStage);
 assert(!canStartFinale(s));s.key=true;assert(canStartFinale(s));
});
test('cinta 04 inicia la secuencia con la llave, sin teletransporte',()=>{
 const g=start(),s=g.state();assert.equal(s.flags.kibaFinaleStage,1);assert.equal(s.mode,'real');assert.equal(Math.floor(s.rx),10);assert.equal(Math.floor(s.ry),9);assert(s.chase);
 assert.equal(s.flags.kibaFinaleStartedAt,s.steps);assert.equal(s.flags.kibaFinaleDone,undefined);
});
test('la interfaz puede expresar ambos hitos y la tensión aumenta al avanzar',()=>{
 const g=start(),s=g.state();assert.equal(E.objective(s),FINALE_OBJECTIVES[1]);assert(tensionLevel(2,55)>tensionLevel(1,55));assert.equal(tensionLevel(0,100),0);
 assert(atFinaleTarget(1,6.5,7.5));assert(!atFinaleTarget(1,2.5,2.5));
});
test('activar de nuevo la cinta durante la huida no reinicia el progreso',()=>{
 const g=start(),s=g.state(),at=s.flags.kibaFinaleStartedAt;g.interact();assert.equal(s.flags.kibaFinaleStage,1);assert.equal(s.flags.kibaFinaleStartedAt,at);
});
test('el primer checkpoint solo se alcanza caminando por colisiones reales',()=>{
 const g=start(),s=g.state();walk(g,6.5,7.5,true);assert.equal(s.flags.kibaFinaleStage,2);assert.equal(E.objective(s),FINALE_OBJECTIVES[2]);
 assert(s.journal.some(j=>j.includes('alcanzado los archivos')));
});
test('huida completa físicamente: dos hitos, conclusión y recompensa',()=>{
 const g=start(),s=g.state();walk(g,6.5,7.5,true);assert.equal(s.flags.kibaFinaleStage,2);
 walk(g,2.5,2.5,true);assert.equal(s.flags.kibaFinaleStage,3);assert.equal(s.flags.kibaFinaleDone,true);assert.equal(s.chase,false);assert.equal(s.threat,0);
 assert(s.journal.some(j=>j.includes('Sobreviví a la huida')));assert.match(E.objective(s),/HUIDA COMPLETADA/);
});
test('captura durante la huida reinicia solo la prueba y permite repetirla',()=>{
 const g=start(),s=g.state();s.entityX=s.rx+.1;s.entityY=s.ry;s.hidden=false;
 // La simulación de IA de este motor avanza por movimiento, no por eventos aleatorios.
 g.move('ArrowRight');g.move('ArrowUp');
 assert.equal(s.flags.kibaFinaleStage,0);assert.equal(s.flags.kibaFinaleFailures,1);assert.equal(s.key,true);
 walk(g,10.5,9.5);g.interact();assert.equal(s.flags.kibaFinaleStage,1);
});
test('durante la huida la IA avanza también si el jugador permanece inmóvil',()=>{
 const g=start(),s=g.state();const before=[s.entityX,s.entityY];
 s.light=false;s.flags.copyistMemory={x:s.rx,y:s.ry,lastSeenStep:s.steps-4,phase:'investigate'};
 for(let k=0;k<10;k++)g.tick();
 assert(Math.hypot(s.entityX-before[0],s.entityY-before[1])>.01,'la Copista debe moverse en modo huida');
});
test('una partida v0.19 (versión 14) se importa sin comenzar una huida fantasma',()=>{
 const old=E.initial();old.version=14;old.key=true;old.tape=true;
 const g=E.newGame();assert(g.load(old));assert.equal(g.state().version,15);assert.equal(g.state().flags.kibaFinaleStage,0);
});
test('guardar y recuperar durante la segunda etapa mantiene progreso',()=>{
 const g=start();walk(g,6.5,7.5,true);const save=JSON.parse(JSON.stringify(g.state()));
 const next=E.newGame();assert(next.load(save));assert.equal(next.state().flags.kibaFinaleStage,2);
 assert.equal(next.state().flags.kibaFinaleDone,false);
});
test('importación corrompida o falsificada no desbloquea secuencia',()=>{
 const s=E.initial();s.flags={kibaFinaleStage:3,kibaFinaleDone:true,kibaFinaleFailures:-30};const g=E.newGame();assert(g.load(s));assert.equal(g.state().flags.kibaFinaleStage,0);assert.equal(g.state().flags.kibaFinaleDone,false);
 const other=E.initial();other.key=true;other.tape=true;other.steps=10;other.flags={kibaFinaleStage:9,kibaFinaleDone:true,kibaFinaleStartedAt:100};assert(g.load(other));
 assert.equal(g.state().flags.kibaFinaleStage,0);assert.equal(g.state().flags.kibaFinaleDone,false);assert.equal(g.state().flags.kibaFinaleStartedAt,undefined);
});
test('la secuencia es opcional: el Día 2 y los finales de la campaña permanecen accesibles',()=>{
 const g=prepared(),s=g.state();s.won=true;s.endingStage=3;g.interact();assert.equal(s.day,2);
 for(let day=2;day<=7;day++){const ss=E.initial();ss.day=day;assert.equal(E.realMap(ss).length,14);}
});
test('se mantiene compatibilidad con los 3 finales del Día 7',()=>{
 for(const choice of ['keep','free','replace']){
  const g=E.newGame(),s=g.state();s.day=7;s.mode='rpg';s.d7Original=true;s.d7Choice=choice;s.px=12;s.py=10;
  g.move('ArrowRight');assert.equal(s.endingId,choice);assert.equal(s.won,true);
 }
});
console.log('FINALE v0.20:',passed,'pruebas completadas');
