import assert from 'node:assert/strict';
import {NamelessEngine as E} from '../dist/src/engine.js';
import {decideCopyist} from '../dist/src/premium/CopyistBrain.js';
import {floorSurface,footstepNoise,decoyDestination,validNoiseMarker} from '../dist/src/premium/KibaStealth.js';
let count=0;
function test(name,fn){fn();count++;console.log('SIGILO PASS:',name)}
function ready(){const g=E.newGame(),s=g.state();s.echo=true;s.rx=10.5;s.ry=9.5;g.interact();assert(s.chase);return [g,s]}
test('Los terrenos tienen sonidos distinguibles y agacharse reduce las pisadas',()=>{
 assert.equal(floorSurface(10.5,9.5),'metal');assert.equal(floorSurface(3.5,9.5),'carpet');
 assert(footstepNoise(10.5,9.5,false)>footstepNoise(3.5,9.5,false));
 assert(footstepNoise(10.5,9.5,true)<footstepNoise(3.5,9.5,false));
});
test('El sigilo se limita a la realidad del Día 1',()=>{
 const g=E.newGame(),s=g.state();assert(g.toggleCrouch());assert(s.crouched);
 g.swap();assert(!s.crouched);assert(!g.toggleCrouch());g.swap();assert(g.toggleCrouch());
 s.day=2;assert(!g.toggleCrouch());
});
test('El jugador avanza menos distancia al agacharse',()=>{
 const a=E.newGame(),b=E.newGame();let aa=a.state(),bb=b.state();
 aa.rx=2.5;aa.ry=2.5;bb.rx=2.5;bb.ry=2.5;aa.dir=2;bb.dir=2;
 assert(b.toggleCrouch());assert(a.move('ArrowUp'));assert(b.move('ArrowUp'));
 assert(Math.abs(aa.ry-2.5)>Math.abs(bb.ry-2.5));
});
test('Sin visión y agachado no se oye al jugador; el ruido metálico sí atrae',()=>{
 const input={playerX:5.5,playerY:5.5,entityX:5.5,entityY:9.5,light:false,hidden:false,steps:9,visible:false};
 assert.equal(decideCopyist({...input,sneaking:true,noiseLevel:.12}).phase,'search');
 assert.equal(decideCopyist({...input,sneaking:false,noiseLevel:2.2}).phase,'investigate');
});
test('Un señuelo válido selecciona la última casilla libre y respeta paredes',()=>{
 const m=E.REAL;const q=decoyDestination(m,10.5,9.5,1);assert(q);assert(!E.wall(m,q.x,q.y));
 assert.equal(decoyDestination(m,1.5,1.5,3),null);
 assert.equal(decoyDestination(m,4.5,4.5,12),null);
});
test('No puede lanzarse el señuelo antes de la cinta ni durante el RPG',()=>{
 const g=E.newGame(),s=g.state();assert.equal(g.throwDecoy(),false);
 assert(!s.flags.kibaDecoy);const [h,r]=ready();h.swap();assert.equal(h.throwDecoy(),false);assert(!r.flags.kibaDecoy);
});
test('El señuelo no atraviesa una pared ni gasta una tuerca si falla',()=>{
 const [g,s]=ready();s.rx=1.5;s.ry=1.5;s.dir=3;
 assert.equal(g.throwDecoy(),false);assert.equal(s.flags.kibaDecoysUsed,undefined);
});
test('El señuelo cambia el objetivo sin revelar la ubicación del jugador',()=>{
 const input={playerX:3.5,playerY:9.5,entityX:11.5,entityY:10.5,light:false,hidden:false,steps:9,visible:false,
 decoy:{x:10.5,y:9.5,atStep:8}};
 const d=decideCopyist(input);assert.equal(d.phase,'investigate');assert.equal(d.goalX,10.5);assert.equal(d.goalY,9.5);
 assert.notEqual(d.goalX,input.playerX);
});
test('La visión directa siempre tiene prioridad sobre el señuelo',()=>{
 const d=decideCopyist({playerX:5.5,playerY:5.5,entityX:5.5,entityY:6.5,light:true,
 hidden:false,steps:9,visible:true,decoy:{x:9.5,y:9.5,atStep:8}});
 assert.equal(d.phase,'hunt');assert.equal(d.goalX,5.5);
});
test('Los señuelos se consumen, tienen enfriamiento y no se pueden acumular infinitamente',()=>{
 const [g,s]=ready();s.rx=9.5;s.ry=9.5;s.dir=1;
 assert(g.throwDecoy());assert.equal(s.flags.kibaDecoysUsed,1);assert(!g.throwDecoy());assert.equal(s.flags.kibaDecoysUsed,1);
 s.steps+=8;assert(g.throwDecoy());assert.equal(s.flags.kibaDecoysUsed,2);
 s.steps+=8;assert(!g.throwDecoy());assert.equal(s.flags.kibaDecoysUsed,2);
});
test('La IA usa el señuelo durante el movimiento sin colisiones',()=>{
 const [g,s]=ready();s.rx=9.5;s.ry=9.5;s.dir=1;assert(g.throwDecoy());
 s.rx=2.5;s.ry=2.5;s.dir=1;s.light=false;assert(g.move('ArrowUp'));
 assert.equal(s.flags.copyistMemory.phase,'investigate');assert(!E.wall(E.realMap(s),s.entityX,s.entityY));
});
test('Se preservan las decisiones de sigilo en guardado de nueva versión',()=>{
 const [g,s]=ready();s.rx=9.5;s.ry=9.5;s.dir=1;assert(g.toggleCrouch());assert(g.throwDecoy());
 const other=E.newGame();assert(other.load(JSON.parse(JSON.stringify(s))));
 assert(other.state().crouched);assert.equal(other.state().flags.kibaDecoysUsed,1);
 assert.deepEqual(other.state().flags.kibaDecoy,s.flags.kibaDecoy);
});
test('Guardado v0.17 migra correctamente sin campos de sigilo nuevos',()=>{
 const s=E.initial();s.version=12;delete s.crouched;const g=E.newGame();
 assert(g.load(s));assert.equal(g.state().crouched,false);assert.equal(g.state().version,E.VERSION);
});
test('Guardado malicioso: coordenadas y contadores de señuelos inválidos se sanea',()=>{
 const s=E.initial();s.steps=12;s.flags={kibaDecoysUsed:999,kibaDecoyStep:999,
 kibaDecoy:{x:-2000,y:9.5,atStep:999}};const g=E.newGame();assert(g.load(s));
 assert.equal(g.state().flags.kibaDecoysUsed,2);assert.equal(g.state().flags.kibaDecoy,undefined);
 assert.equal(g.state().flags.kibaDecoyStep,undefined);
 assert(!validNoiseMarker({x:Infinity,y:3,atStep:1},E.REAL,12));
});
test('Sigilo no rompe el paso desde el Día 1 al Día 2 ni los finales',()=>{
 const [g,s]=ready();assert(g.toggleCrouch());s.won=true;s.endingStage=3;g.interact();
 assert.equal(s.day,2);assert.equal(s.crouched,false);
});
console.log('SIGILO v0.18:',count,'pruebas superadas');
