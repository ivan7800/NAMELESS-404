import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NamelessEngine as E} from '../dist/src/engine.js';
import {castGridRay,sceneGeometryKey} from '../dist/src/premium/FastRaycaster.js';
import {buildSignatureRoom,isSignatureRoomValid,KIBA_SIGNATURE} from '../dist/src/premium/KibaSignatureRoom.js';
let done=0;
const test=(name,cb)=>{cb();done++;console.log('v0.27 PASS:',name)};
const state=E.initial(),map=E.realMap(state),parts=buildSignatureRoom(map);
const classic=(map,px,py,ang)=>{
 const dx=Math.sin(ang),dy=-Math.cos(ang);
 for(let t=.041;t<16.81;t+=.041)if(E.wall(map,px+dx*t,py+dy*t))return t;
 return 16.81;
};
test('DDA coincide con la colisión de referencia en las cuatro direcciones',()=>{
 for(const ang of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const a=castGridRay(map,2.5,2.5,ang),b=classic(map,2.5,2.5,ang);
  assert(Math.abs(a.dist-b)<.043,`${ang} ${a.dist} vs ${b}`);
 }
});
test('DDA preciso en rayos oblicuos y diferentes mapas',()=>{
 for(let day=1;day<=7;day++){
  const s=E.initial();s.day=day;const rows=E.realMap(s);
  for(let j=0;j<24;j++){
   const ang=j*Math.PI/12+.015;
   const a=castGridRay(rows,s.rx,s.ry,ang),b=classic(rows,s.rx,s.ry,ang);
   assert(Math.abs(a.dist-b)<.043,`día=${day} ángulo=${ang}, got=${a.dist}, expected=${b}`);
  }
 }
});
test('Intersecciones DDA conservan textura dentro del muro',()=>{
 for(let j=0;j<32;j++){
  const a=castGridRay(map,2.5,2.5,j*Math.PI/16);
  assert(a.dist>0&&a.dist<16.81);
  assert(a.u>=0&&a.u<1);
  assert(Number.isFinite(a.x)&&Number.isFinite(a.y));
 }
});
test('Rayos cardinales no producen infinito ni NaN',()=>{
 for(const ang of [0,Math.PI/2,Math.PI,Math.PI*1.5,Math.PI*2]){
  const a=castGridRay(map,2.5,2.5,ang);
  assert(Number.isFinite(a.dist)&&Number.isFinite(a.u));
 }
});
test('Geometría estática solo se reutiliza si es el mismo escenario',()=>{
 const orig=sceneGeometryKey(state);
 assert.equal(sceneGeometryKey({...state}),orig);
 assert.notEqual(sceneGeometryKey({...state,rx:state.rx+.1}),orig);
 assert.notEqual(sceneGeometryKey({...state,dir:(state.dir+1)%4}),orig);
 assert.notEqual(sceneGeometryKey({...state,light:!state.light}),orig);
 assert.notEqual(sceneGeometryKey({...state,day:2}),orig);
 assert.notEqual(sceneGeometryKey({...state,flags:{...state.flags,kibaNorthOpen:true}}),orig);
 assert.notEqual(sceneGeometryKey({...state,flags:{...state.flags,kibaArchiveOpen:true}}),orig);
});
test('La sala de vigilancia aparece en mapa transitable, detrás de pared norte',()=>{
 assert(isSignatureRoomValid(map));
 assert(!E.wall(map,KIBA_SIGNATURE.x,KIBA_SIGNATURE.z));
 assert.equal(map[0][2],'#');
 assert(parts.length>=40);
});
test('Todos los elementos del escenario premium tienen ID único',()=>{
 assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);
});
test('La sala mantiene pasillo libre, no toca techo ni atraviesa el suelo',()=>{
 for(const p of parts){
  assert(p.x-p.width/2>=2-.001&&p.x+p.width/2<=3+.001,p.id+' en x');
  assert(p.z-p.depth/2>=.999&&p.z+p.depth/2<1.46,p.id+' en z');
  assert(p.y-p.height/2>=-.001&&p.y+p.height/2<=2.35,p.id+' en y');
  assert(p.width>0&&p.height>0&&p.depth>0,p.id);
 }
});
test('Monitores, grabación, biblioteca documental, ventilación y escritorio están presentes',()=>{
 for(const prefix of ['signature-screen-glass-0','signature-screen-glass-1','signature-screen-glass-2','signature-cassette-deck','signature-log-book','signature-vent-0','signature-desk'])
  assert(parts.some(p=>p.id===prefix),prefix);
});
test('La pantalla central, los leds y la cinta incluyen componentes emisivos',()=>{
 assert(parts.filter(p=>p.emissive).length>=5);
});
test('Geometría determinista, color normalizado y sin azar de ejecución',()=>{
 assert.deepEqual(buildSignatureRoom(map),parts);
 for(const p of parts)for(const v of p.color)assert(v>=0&&v<=1);
});
test('Si desaparece la pared norte no aparece mobiliario flotante',()=>{
 const rows=map.slice();rows[0]=rows[0].slice(0,2)+'.'+rows[0].slice(3);
 assert(!isSignatureRoomValid(rows));assert.equal(buildSignatureRoom(rows).length,0);
});
test('La sala no modifica los mapas, los guardados ni los finales',()=>{
 const before=JSON.stringify(state),beforeMap=map.join('/');
 buildSignatureRoom(map);assert.equal(JSON.stringify(state),before);assert.equal(map.join('/'),beforeMap);
 for(let day=2;day<=7;day++){const s=E.initial();s.day=day;const rows=E.realMap(s);buildSignatureRoom(map);assert.equal(E.realMap(s).join('/'),rows.join('/'));}
});
test('WebGL2 nativo y Three.js incluyen exactamente el mismo modelo geométrico',()=>{
 for(const [path,token] of [['gfx/RetroWebGL.ts','buildSignatureRoom(map)'],['three/ThreeRenderer.ts','buildSignatureRoom(rows)']])
  assert(readFileSync(new URL('../src/'+path,import.meta.url),'utf8').includes(token),path);
});
test('El juego offline incluye raycaster, sala, textura y caché sin importaciones externas',()=>{
 const code=readFileSync(new URL('../dist/bundle.js',import.meta.url),'utf8');
 for(const marker of ['function castGridRay(', 'function buildSignatureRoom(', 'function signatureTexture(', 'function drawSignatureRoom(', 'let backgroundKey'])
  assert(code.includes(marker),marker);
 assert(!/from ['"]\.\/FastRaycaster/.test(code));
});
console.log(`v0.27: ${done} pruebas nuevas superadas`);
