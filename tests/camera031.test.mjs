import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CinematicCamera,CAMERA_LIMITS} from '../dist/src/premium/CinematicCamera.js';
import {NamelessEngine} from '../dist/src/engine.js';
let done=0;
function test(description,fn){fn();done++;console.log('PASS v0.31:',description);}
const base=()=>({day:1,mode:'real',dir:0,rx:2.5,ry:2.5,won:false,steps:0});
test('La cámara empieza exactamente sobre la posición y el rumbo de la partida',()=>{
 const c=new CinematicCamera();const s=base();assert.deepEqual(c.sample(s,100),{cameraYaw:0,cameraPitch:0,cameraHeight:1.35,rx:2.5,ry:2.5});
});
test('Los giros de 90° tienen transición y convergen al rumbo correcto',()=>{
 const c=new CinematicCamera(),s=base();c.sample(s,100);s.dir=1;
 const mid=c.sample(s,116);assert(mid.cameraYaw>0&&mid.cameraYaw<Math.PI/2);
 let end;for(let t=132;t<2300;t+=16)end=c.sample(s,t);
 assert(Math.abs(end.cameraYaw-Math.PI/2)<.001);
});
test('Se toma el giro corto de 270° a 0° y nunca una vuelta de 270°',()=>{
 const c=new CinematicCamera(),s={...base(),dir:3};c.sample(s,100);s.dir=0;const first=c.sample(s,116);
 assert(first.cameraYaw>3*Math.PI/2,'debe girar en sentido positivo el recorrido corto');
});
test('La mirada libre respeta topes horizontales y verticales',()=>{
 const c=new CinematicCamera(),s=base();c.sample(s,100);c.look(50,60);
 assert.equal(c.offsets.yaw,CAMERA_LIMITS.yaw);assert.equal(c.offsets.pitch,CAMERA_LIMITS.pitch);
 c.look(-100,-200);assert.equal(c.offsets.yaw,-CAMERA_LIMITS.yaw);assert.equal(c.offsets.pitch,-CAMERA_LIMITS.pitch);
});
test('El modo clásico anula transiciones y el desplazamiento adicional',()=>{
 const c=new CinematicCamera(),s=base();c.sample(s,100);c.look(.4,.1);c.setEnabled(false);s.dir=1;s.rx=3.5;
 const v=c.sample(s,116);assert.equal(v.cameraYaw,Math.PI/2);assert.equal(v.cameraPitch,0);assert.equal(v.rx,3.5);assert.equal(v.ry,2.5);
});
test('Mirar no altera las coordenadas del motor ni los datos de guardado',()=>{
 const c=new CinematicCamera(),engine=NamelessEngine.newGame();const s=engine.state();
 const initial=JSON.stringify(s);c.sample(s,100);c.look(.3,-.1);c.sample(s,116);
 assert.equal(JSON.stringify(s),initial);assert(!('cameraYaw' in s));
});
test('La cámara sigue al jugador con suavidad sin cambiar su posición lógica',()=>{
 const c=new CinematicCamera(),s=base();c.sample(s,100);s.rx=3.5;s.steps=1;
 const v=c.sample(s,116);assert(v.rx>2.5&&v.rx<3.5);assert.equal(s.rx,3.5);
 for(let t=132;t<1900;t+=16)c.sample(s,t);
 assert(Math.abs(c.sample(s,1916).rx-3.5)<.001);
});
test('Un cambio a RPG y vuelta sincroniza el punto de vista',()=>{
 const c=new CinematicCamera(),s=base();c.sample(s,100);c.look(.6,.2);c.sample(s,116);
 s.mode='rpg';c.sample(s,132);s.mode='real';s.day=2;s.rx=4.5;s.dir=2;
 const v=c.sample(s,148);assert.equal(v.cameraPitch,0);assert.equal(v.rx,4.5);assert.equal(v.cameraYaw,Math.PI);
});
test('Modo movimiento reducido elimina interpolaciones',()=>{
 const c=new CinematicCamera(),s=base();c.sample(s,100);s.dir=2;
 assert(Math.abs(Math.abs(c.sample(s,116,true).cameraYaw)-Math.PI)<1e-9);
});
test('El botón centrar elimina el giro relativo, sin girar al jugador',()=>{
 const c=new CinematicCamera(),s=base();c.sample(s,100);c.look(.5,-.2);c.center();
 assert.deepEqual(c.offsets,{yaw:0,pitch:0});assert.equal(s.dir,0);
});
test('Proyección Canvas, GLSL y Three.js consume la misma vista',()=>{
 for(const f of ['src/premium/BookMode.ts','src/gfx/RetroWebGL.ts','src/three/ThreeRenderer.ts']){
  const code=readFileSync(f,'utf8');assert(code.includes('cameraYaw'),f);assert(code.includes('cameraPitch'),f);
 }
});
test('El motor narrativo de los siete días sigue idéntico al anterior',()=>{
 assert.equal(createHash('sha256').update(readFileSync('src/engine.ts')).digest('hex'),'e20e0b66304bceafe4e2c50cb3db2c4fbd649602b507cb22192e29a169277fd0');
});
test('El compilado contiene controles de cámara y no deja imports huérfanos',()=>{
 const js=readFileSync('dist/bundle.js','utf8'),html=readFileSync('dist/index.html','utf8');
 assert(js.includes('class CinematicCamera'));assert(html.includes('id="lookCenter"'));assert(!html.includes('src="./src/main.ts"'));
});
console.log(`v0.31: ${done} nuevas pruebas de cámara`);
