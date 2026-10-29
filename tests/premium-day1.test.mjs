import assert from 'node:assert/strict';
import {NamelessEngine as E} from '../dist/src/engine.js';
import {decideCopyist} from '../dist/src/premium/CopyistBrain.js';
import {projectedDecoration} from '../dist/src/premium/DayOneArt.js';
import {DayOneSoundscape} from '../dist/src/premium/DayOneAudio.js';
import {DAY_ONE_EVIDENCE,nearestEvidence,evidenceCount,nextChaseBeat} from '../dist/src/premium/DayOneStory.js';
let count=0;
function test(name,fn){fn();count++;console.log('PREMIUM PASS:',name);}
const base={playerX:5.5,playerY:5.5,entityX:5.5,entityY:8.5,light:true,hidden:false,steps:8,visible:true};
test('caza cuando hay visión directa y luz',()=>{
 const a=decideCopyist(base);assert.equal(a.phase,'hunt');assert.equal(a.goalX,5.5);assert.equal(a.goalY,5.5);assert.equal(a.memory.lastSeenStep,8);
});
test('sin visión, deja de conocer mágicamente la posición actual',()=>{
 const m=decideCopyist(base).memory;
 const b=decideCopyist({...base,playerX:10.5,playerY:6.5,visible:false,steps:10,memory:m});
 assert.equal(b.phase,'search');assert.equal(b.goalX,5.5);assert.equal(b.goalY,5.5);
});
test('la ocultación impide detección incluso con luz encendida',()=>{
 const b=decideCopyist({...base,hidden:true});assert.equal(b.phase,'search');assert(b.threatDelta<0);
});
test('la oscuridad reduce el alcance perceptivo',()=>{
 assert.equal(decideCopyist({...base,light:false}).phase,'search');
 assert.equal(decideCopyist({...base,light:false,entityY:6.5}).phase,'hunt');
});
test('los pasos cercanos provocan investigación, no telepatía',()=>{
 const b=decideCopyist({...base,visible:false,steps:9,playerX:5.1,playerY:5.4});
 assert.equal(b.phase,'investigate');assert.equal(b.goalX,5.5);assert.equal(b.goalY,5.5);
});
test('la IA es determinista y nunca genera NaN en estados válidos',()=>{
 const a=decideCopyist(base),b=decideCopyist(base);assert.deepEqual(a,b);
 for(let step=1;step<20;step++){const o=decideCopyist({...base,steps:step});for(const n of [o.goalX,o.goalY,o.speed,o.threatDelta])assert(Number.isFinite(n));}
});
test('integración: persecución almacena memoria y no atraviesa muro',()=>{
 const g=E.newGame(),s=g.state();s.rx=10.5;s.ry=9.5;s.echo=true;g.interact();assert(s.chase);
 s.rx=10.5;s.ry=9.5;s.dir=2;assert(g.move('ArrowUp'));
 assert.equal(typeof s.flags.copyistMemory?.phase,'string');assert(!E.wall(E.realMap(s),s.entityX,s.entityY));
});
test('salvar y restaurar la percepción del monstruo conserva el esquema',()=>{
 const g=E.newGame(),s=g.state();s.echo=true;s.rx=10.5;s.ry=9.5;g.interact();s.rx=10.5;s.ry=9.5;s.dir=2;assert(g.move('ArrowUp'));
 const copy=JSON.parse(JSON.stringify(s)),other=E.newGame();assert(other.load(copy));
 assert.deepEqual(other.state().flags.copyistMemory,s.flags.copyistMemory);
});
test('guardado malicioso con memoria inválida se sanea sin perder la partida',()=>{
 const g=E.newGame(),save=E.initial();save.flags={copyistMemory:{x:NaN,y:99,lastSeenStep:'bad',phase:'teleport'}};
 assert(g.load(save));assert.equal(g.state().flags.copyistMemory,undefined);
});
test('se conserva el acceso al capítulo 2',()=>{
 const g=E.newGame(),s=g.state();s.won=true;s.endingStage=3;g.interact();assert.equal(s.day,2);
});
test('las escenas Kiba están alineadas con proyección física y oclusión',()=>{
 const s=E.initial();const near=projectedDecoration(s,{x:4.5,y:2.5,kind:'placard'},E.REAL);
 assert(near&&near.x>120&&near.x<256);
 assert.equal(projectedDecoration(s,{x:4.5,y:2.5,kind:'placard'},E.REAL.map(()=> '################')),null);
 assert.equal(projectedDecoration(s,{x:2.5,y:11.5,kind:'portrait'},E.REAL),null);
});
test('audio no inicializa ni registra fuentes hasta una acción explícita',()=>{
 const audio=new DayOneSoundscape();assert.equal(audio.isRunning(),false);audio.update(E.initial(),0);assert.equal(audio.isRunning(),false);
});
test('audio multicapas se inicia una vez, se actualiza y se desconecta',()=>{
 let starts=0,stops=0;
 const prop=()=>({value:0,setTargetAtTime(v){this.value=v}});
 const node=()=>({connect(){return this},disconnect(){},start(){starts++},stop(){stops++},frequency:prop(),gain:prop(),pan:prop(),type:''});
 const ctx={currentTime:1,sampleRate:8000,destination:node(),createGain:node,createOscillator:node,createBiquadFilter:node,createStereoPanner:node,
   createBuffer(_n,size){return {getChannelData(){return new Float32Array(size)}}},createBufferSource:node};
 const audio=new DayOneSoundscape();audio.start(ctx);audio.start(ctx);assert(audio.isRunning());assert.equal(starts,4);
 audio.update(E.initial(),120);audio.update({...E.initial(),day:7},300);audio.stop();audio.stop();assert.equal(stops,4);assert(!audio.isRunning());
});

test('las cuatro pistas opcionales ocupan suelo navegable',()=>{
 assert.equal(DAY_ONE_EVIDENCE.length,4);
 for(const item of DAY_ONE_EVIDENCE){
  assert(!E.wall(E.REAL,item.x,item.y),item.id);
  assert(E.bfs(E.REAL,2.5,2.5,item.x,item.y).length>1,'sin ruta a '+item.id);
 }
});
test('pistas opcionales: cercanía, preferencia y coleccionismo único',()=>{
 assert.equal(nearestEvidence(2.5,3.5,[])?.id,'lobby');
 assert.equal(nearestEvidence(2.5,3.5,['lobby']),null);
 assert.equal(nearestEvidence(14.5,1.5,[]),null);
 assert.equal(evidenceCount(['glass','lobby','lobby']),2);
});
test('se pueden recoger las cuatro pistas con movimiento normal y sin saltos de posición',()=>{
 const g=E.newGame(),s=g.state();
 function goTo(x,y){
  const route=E.bfs(E.REAL,s.rx,s.ry,x,y);assert(route.length>0);
  const desiredFor=new Map([["0,-1",0],["1,0",1],["0,1",2],["-1,0",3]]);
  for(let i=1;i<route.length;i++){
   const [ax,ay]=route[i-1],[bx,by]=route[i];const desired=desiredFor.get(`${bx-ax},${by-ay}`);
   assert.notEqual(desired,undefined);
   while(s.dir!==desired)g.move('ArrowRight');
   let guard=0;while((Math.floor(s.rx)!==bx||Math.floor(s.ry)!==by)&&guard++<4)assert(g.move('ArrowUp'),`colisión al recorrer ${bx},${by}`);
   assert.equal(Math.floor(s.rx),bx);assert.equal(Math.floor(s.ry),by);
  }
 }
 for(const item of DAY_ONE_EVIDENCE){goTo(item.x,item.y);g.interact();
  assert(s.flags.kibaEvidence.includes(item.id),'no se registró '+item.id);
  assert(s.journal.some(entry=>entry===item.journal),'falta diario '+item.id);
  assert(s.scene==='kiba-evidence-'+item.id,'la escena no aparece');
 }
 assert.equal(evidenceCount(s.flags.kibaEvidence),4);
 const total=s.journal.length;g.interact();assert.equal(s.journal.length,total);
});
test('las pistas son opcionales y no impiden pasar al día 2',()=>{
 const g=E.newGame(),s=g.state();s.won=true;s.endingStage=3;g.interact();
 assert.equal(s.day,2);assert.equal(s.flags.kibaEvidence,undefined);
});
test('persecución dirigida: tres escenas sin repetición ni teletransporte',()=>{
 const done=[];const base={chase:true,tape:true,steps:20,room:'SOTANO TECNICO',threat:35,hidden:false,phase:'hunt',already:done};
 assert.equal(nextChaseBeat(base),'first-step');done.push('first-step');
 assert.equal(nextChaseBeat({...base,already:done} ),null);
 assert.equal(nextChaseBeat({...base,room:'ALA DE ARCHIVOS',already:done}),'crossing');done.push('crossing');
 assert.equal(nextChaseBeat({...base,hidden:true,phase:'search',already:done}),'escaped');
 assert.equal(nextChaseBeat({...base,chase:false,already:[]}),null);
});
test('el motor dispara el primer momento dirigido tras escuchar la cinta',()=>{
 const g=E.newGame(),s=g.state();s.echo=true;s.rx=10.5;s.ry=9.5;g.interact();
 assert(s.tape&&s.chase);
 s.dir=2;assert(g.move('ArrowUp'));
 assert(s.flags.kibaChaseBeats.includes('first-step'));
 assert(s.scares.includes('kiba-chase-first-step'));
 const before=s.scares.length;g.move('ArrowUp');assert.equal(s.scares.length,before);
});
test('cuatro documentos activan un testimonio secreto opcional en el RPG',()=>{
 const g=E.newGame(),s=g.state();s.flags.kibaEvidence=DAY_ONE_EVIDENCE.map(i=>i.id);
 s.mode='rpg';s.px=5;s.py=9;g.interact();
 assert(s.flags.kibaWitness);assert.equal(s.scene,'kiba-witness');
 assert(s.journal.at(-1).includes('cuatro testimonios'));
 const count=s.journal.length;g.interact();assert.equal(s.journal.length,count);
});
test('migración de flags premium sanea entradas manipuladas sin romper datos válidos',()=>{
 const s=E.initial();s.flags={kibaEvidence:['lobby','lobby','invalid','archives'],kibaChaseBeats:['escaped','fake','escaped']};
 const g=E.newGame();assert(g.load(JSON.parse(JSON.stringify(s))));
 assert.deepEqual(g.state().flags.kibaEvidence,['lobby','archives']);
 assert.deepEqual(g.state().flags.kibaChaseBeats,['escaped']);
});
test('el audio de tensión incluye cues opcionales y funciona desactivado',()=>{
 let starts=0;
 const prop=()=>({value:0,setTargetAtTime(v){this.value=v}});
 const node=()=>({connect(){return this},disconnect(){},start(){starts++},stop(){},frequency:prop(),gain:prop(),pan:prop(),type:''});
 const ctx={currentTime:1,sampleRate:4000,destination:node(),createGain:node,createOscillator:node,createBiquadFilter:node,createStereoPanner:node,
  createBuffer(_n,size){return {getChannelData(){return new Float32Array(size)}}},createBufferSource:node};
 const audio=new DayOneSoundscape();assert(!audio.cue('breath',E.initial()));
 audio.start(ctx);assert(audio.cue('breath',E.initial()));assert(audio.cue('glass',E.initial()));
 assert(!audio.cue('nonexistent',E.initial()));assert(!audio.cue('breath',{...E.initial(),day:7}));
 assert.equal(starts,6);audio.stop();assert(!audio.cue('paper',E.initial()));
});

console.log(`PREMIUM: ${count}/${count} pruebas superadas`);
