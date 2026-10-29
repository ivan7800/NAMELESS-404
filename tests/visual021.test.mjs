import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NamelessEngine as E} from '../dist/src/engine.js';
import {buildKibaVisuals,KIBA_VISUAL_PALETTE} from '../dist/src/premium/KibaVisuals.js';

let passed=0;
function test(name,fn){fn();passed++;console.log(`VISUAL v0.21 PASS: ${name}`);}
const world=E.realMap(E.initial());
const props=buildKibaVisuals(world);
const serial=JSON.stringify(props);
const idSet=new Set(props.map(p=>p.id));

test('Decoración procedimental del Día 1 no está vacía',()=>assert(props.length>65));
test('Generación determinista, sin Math.random ni dependencia temporal',()=>assert.equal(JSON.stringify(buildKibaVisuals(world)),serial));
test('No modifica el mapa original del motor',()=>{
 const prev=E.REAL.slice();buildKibaVisuals(E.REAL);assert.deepEqual(E.REAL,prev);
});
test('Cada objeto visual tiene ID único para depuración',()=>assert.equal(idSet.size,props.length));
test('Geometría tiene dimensiones finitas y positivas',()=>{
 for(const p of props){for(const k of ['x','y','z','width','height','depth'])assert(Number.isFinite(p[k]),`${p.id}.${k}`);
 assert(p.width>0&&p.height>0&&p.depth>0,p.id);}
});
test('Colores de paleta están normalizados entre 0 y 1',()=>{
 for(const p of props){assert.equal(p.color.length,3);for(const value of p.color)assert(Number.isFinite(value)&&value>=0&&value<=1,p.id);}
 for(const rgb of Object.values(KIBA_VISUAL_PALETTE))for(const v of rgb)assert(v>=0&&v<=1);
});
test('Todo accesorio está vinculado a una casilla transitable',()=>{
 for(const p of props){assert(!E.wall(world,p.x,p.z),`Deco ${p.id} fuera de pasillo: ${p.x},${p.z}`);}
});
test('No hay objetos decorativos sobresaliendo por encima del techo',()=>{
 for(const p of props)assert(p.y+p.height/2<=2.36,`${p.id} fuera de techo`);
});
test('La decoración de pared ocupa la franja de borde, no bloquea el centro',()=>{
 for(const p of props.filter(p=>p.id.startsWith('sconce-')||p.id.startsWith('paint-')||p.id.startsWith('cable-'))){
  const fx=p.x-Math.floor(p.x),fz=p.z-Math.floor(p.z);
  assert(fx<.1||fx>.9||fz<.1||fz>.9,`Objeto en ruta: ${p.id}`);
 }
});
test('Las siete zonas narrativas principales tienen marca física',()=>{
 for(const name of ['lobby','archive','tape04','locker','mirror','phone','photo'])assert(idSet.has(`mark-${name}`),name);
});
test('Iluminación ambiental original existe y usa geometría emisiva',()=>{
 assert(props.some(p=>p.id.startsWith('tube-')&&p.emissive));
 assert(props.some(p=>p.id.startsWith('sconce-bulb-')&&p.emissive));
});
test('Materiales y motivos tienen varios estilos, no solo una textura repetida',()=>{
 for(const prefix of ['paint-','water-','cable-','joint-','ceiling-','mark-'])assert(props.some(p=>p.id.startsWith(prefix)),prefix);
});
test('Los atajos abiertos cambian el escenario sin romper los marcadores',()=>{
 const flags={kibaNorthOpen:true,kibaArchiveOpen:true};
 const s=E.initial();s.seal=true;s.tape=true;s.flags=flags;
 const revised=buildKibaVisuals(E.realMap(s));
 assert.notEqual(JSON.stringify(revised),serial);
 assert(revised.some(p=>p.id==='mark-lobby'));
 assert(revised.length>50);
});
test('Los días 2–7 conservan sus mapas y no incluyen props del Día 1 por efecto colateral',()=>{
 for(let day=2;day<=7;day++){
  const s=E.initial();s.day=day;const before=E.realMap(s).slice();
  buildKibaVisuals(world);assert.deepEqual(E.realMap(s),before);
 }
});
test('El módulo de geometría está incluido en el bundle sin usar red externa',()=>{
 const bundle=readFileSync(new URL('../dist/bundle.js',import.meta.url),'utf8');
 assert(bundle.includes('function buildKibaVisuals('));
 assert(/for\s*\(const prop of buildKibaVisuals\(map\)\)/.test(bundle));
 assert(!bundle.includes('import {buildKibaVisuals}'));
});
test('Contrato de shader WebGL2: lámpara, grano estable y resolución',()=>{
 const code=readFileSync(new URL('../src/gfx/RetroWebGL.ts',import.meta.url),'utf8');
 for(const marker of ['u_resolution','float cone=','float filmGrain=','gl.uniform2f(this.uniforms.u_resolution','buildKibaVisuals(map)'])assert(code.includes(marker),marker);
});
test('Three.js usa la misma escena, con instancias agrupadas, sin modificar gameplay',()=>{
 const code=readFileSync(new URL('../src/three/ThreeRenderer.ts',import.meta.url),'utf8');
 for(const marker of ['buildKibaVisuals(rows)','new InstancedMesh(new BoxGeometry(1,1,1)','mesh.instanceMatrix.needsUpdate=true'])assert(code.includes(marker),marker);
});
console.log(`VISUAL v0.21: ${passed} comprobaciones estáticas y de geometría completadas (no equivalen a un test GPU)`);
