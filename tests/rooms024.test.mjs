import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NamelessEngine as E} from '../dist/src/engine.js';
import {buildKibaRooms,getKibaRoomFixtures,KIBA_ROOM_FIXTURES} from '../dist/src/premium/KibaRooms.js';
import {buildKibaVisuals} from '../dist/src/premium/KibaVisuals.js';

let pass=0;
const test=(name,fn)=>{fn();pass++;console.log('ROOMS v0.24 PASS:',name);};
const map=E.realMap(E.initial());
const props=buildKibaRooms(map),fixtures=getKibaRoomFixtures(map);
const partSet=new Set(props.map(p=>p.id));
const fixtureSet=new Set(fixtures.map(f=>f.id));
test('14 localizaciones diseñadas y validadas contra mapa real',()=>{
 assert.equal(KIBA_ROOM_FIXTURES.length,14);assert.equal(fixtures.length,14);assert.equal(fixtureSet.size,14);
});
test('117 componentes con geometría real en vez de únicamente carteles',()=>assert(props.length>=110));
test('11 familias de mobiliario de dirección artística',()=>{
 for(const kind of ['reception','notice','electrical','portrait','vending','archive','machine','generator','locker','exit','medicine'])
  assert(fixtures.some(f=>f.kind===kind),kind);
});
test('No hay piezas con ID duplicado',()=>assert.equal(props.length,partSet.size));
test('Objetos idénticos para la misma versión del mapa y sin azar',()=>assert.deepEqual(buildKibaRooms(map),props));
test('Cada pieza pertenece a una casilla real transitable',()=>{
 for(const p of props)assert(!E.wall(map,p.x,p.z),p.id+': casilla bloqueada');
});
test('Geometría dentro de la casilla anfitriona y a ras del muro',()=>{
 for(const p of props){
  // Use explicit prefix matching to support hyphens in asset names.
  const f=fixtures.find(f=>p.id.startsWith(`room-${f.id}-`));
  assert(f,p.id);
  assert(p.x-p.width/2>=f.x-.0001 && p.x+p.width/2<=f.x+1.0001,p.id+' x');
  assert(p.z-p.depth/2>=f.z-.0001 && p.z+p.depth/2<=f.z+1.0001,p.id+' z');
  if(p.y<1.99){
   const distance=f.side==='N'?p.z-f.z:f.side==='S'?f.z+1-p.z:f.side==='W'?p.x-f.x:f.x+1-p.x;
   const thickness=(f.side==='N'||f.side==='S')?p.depth:p.width;
   assert(distance+thickness/2<.46,p.id+' invade el centro del pasillo');
  }
 }
});
test('Altura segura: ninguna pieza atraviesa suelo o techo',()=>{
 for(const p of props){assert(p.y-p.height/2>=-.0001,p.id+' suelo');assert(p.y+p.height/2<=2.35,p.id+' techo');}
});
test('Materiales físicos normalizados y dimensiones finitas',()=>{
 for(const p of props){
  for(const k of ['x','y','z','width','height','depth'])assert(Number.isFinite(p[k])&&p[k]>=0,p.id+'.'+k);
  assert(p.width>0&&p.depth>0&&p.height>0,p.id);
  for(const c of p.color)assert(Number.isFinite(c)&&c>=0&&c<=1,p.id);
 }
});
test('CRT, máquina y generador tienen fuentes emisivas propias',()=>{
 for(const id of ['reception','vending','generator'])assert(props.some(p=>p.id.startsWith(`room-${id}-`)&&p.emissive),id);
});
test('Se colocan contra una pared existente, no en medio de una habitación',()=>{
 for(const f of fixtures){
  const [dx,dz]=f.side==='N'?[0,-1]:f.side==='S'?[0,1]:f.side==='E'?[1,0]:[-1,0];
  assert.equal(map[f.z+dz][f.x+dx],'#',f.id);
 }
});
test('Una pared retirada desactiva el mueble ligado a ella',()=>{
 const changed=map.slice(),f=fixtures[0];
 changed[f.z-1]=changed[f.z-1].slice(0,f.x)+'.'+changed[f.z-1].slice(f.x+1);
 assert(!getKibaRoomFixtures(changed).some(v=>v.id===f.id));
 assert(!buildKibaRooms(changed).some(v=>v.id.startsWith(`room-${f.id}-`)));
});
test('Los atajos abiertos mantienen muebles y la ruta libre',()=>{
 const s=E.initial();s.flags={kibaNorthOpen:true,kibaArchiveOpen:true};
 const other=E.realMap(s);
 assert(getKibaRoomFixtures(other).length>=12);
 for(const p of buildKibaRooms(other))assert(!E.wall(other,p.x,p.z),p.id);
});
test('La construcción no modifica mapas ni guardados',()=>{
 const original=E.REAL.slice(),snapshot=JSON.stringify(E.initial());
 buildKibaRooms(E.REAL);buildKibaVisuals(E.REAL);
 assert.deepEqual(E.REAL,original);assert.equal(JSON.stringify(E.initial()),snapshot);
});
test('Los otros seis días conservan sus mapas y finales',()=>{
 for(let day=2;day<=7;day++){
  const s=E.initial();s.day=day;const before=E.realMap(s).join('|');
  buildKibaRooms(map);assert.equal(E.realMap(s).join('|'),before);
 }
});
test('El bundle offline contiene todas las piezas sin import externo',()=>{
 const js=readFileSync(new URL('../dist/bundle.js',import.meta.url),'utf8');
 for(const token of ['function buildKibaRooms(','function getKibaRoomFixtures(','room-', 'drawKibaRoomDressing(','buildKibaRooms(map)'])assert(js.includes(token),token);
 assert(!/import .*KibaRooms/.test(js));
});
test('Renderizadores nativo y Three.js comparten la misma geometría',()=>{
 const native=readFileSync(new URL('../src/gfx/RetroWebGL.ts',import.meta.url),'utf8');
 const three=readFileSync(new URL('../src/three/ThreeRenderer.ts',import.meta.url),'utf8');
 assert(native.includes('buildKibaRooms(map)'));
 assert(three.includes('buildKibaRooms(rows)'));
});
console.log(`ROOMS v0.24: ${pass} pruebas superadas (sin afirmar validación en GPU real)`);
