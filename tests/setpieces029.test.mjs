import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {KIBA_SETPIECES,visibleKibaSetpieces,buildKibaSetpieces,validKibaSetpiece,legacyRoomFixtureShadowed} from '../dist/src/premium/KibaSetpieces.js';
import {NamelessEngine as E} from '../dist/src/engine.js';
let count=0;
function test(msg,fn){fn();count++;console.log('PASS v0.29:',msg);}
const s=E.initial(),map=E.realMap(s);
test('Cuatro áreas autorales colocadas sobre muros físicos',()=>{
 assert.equal(KIBA_SETPIECES.length,4);
 assert.equal(visibleKibaSetpieces(map).length,4);
 for(const p of KIBA_SETPIECES)assert.equal(validKibaSetpiece(map,p),true,p.id);
});
test('Cuatro diseños diferentes y un único identificador por pieza',()=>{
 assert.deepEqual(KIBA_SETPIECES.map(s=>s.id),['lobby','east','archive','basement']);
 const ids=buildKibaSetpieces(map).map(p=>p.id);
 assert.equal(ids.length,new Set(ids).size);
});
test('Piezas finitas, dimensiones positivas y alturas correctas',()=>{
 const props=buildKibaSetpieces(map);assert(props.length>=65);
 for(const p of props){for(const k of ['x','y','z','width','height','depth'])assert(Number.isFinite(p[k]),p.id+': '+k);
  assert(p.width>0&&p.height>0&&p.depth>0,p.id);
  assert(p.y-p.height/2>=-.02 && p.y+p.height/2<=2.4,p.id);
 }
});
test('Todos los muebles permanecen en la banda de 0.46m desde el muro',()=>{
 const props=buildKibaSetpieces(map);
 for(const p of KIBA_SETPIECES){
  const subset=props.filter(v=>v.id.startsWith('set-'+p.id+'-'));assert(subset.length>12);
  for(const v of subset){
   if(p.side==='N')assert(v.z-v.depth/2>=p.cellZ-.002 && v.z+v.depth/2 <p.cellZ+.46,v.id);
   if(p.side==='E')assert(v.x-v.width/2>p.cellX+.54 && v.x+v.width/2<=p.cellX+1.002,v.id);
   if(p.side==='W')assert(v.x-v.width/2>=p.cellX-.002 && v.x+v.width/2<p.cellX+.46,v.id);
   if(p.side==='S')assert(v.z-v.depth/2>p.cellZ+.54 && v.z+v.depth/2<=p.cellZ+1.002,v.id);
  }
 }
});
test('Al abrir atajos las áreas siguen siendo válidas y deterministas',()=>{
 const first=buildKibaSetpieces(map);s.flags.kibaNorthOpen=true;s.flags.kibaArchiveOpen=true;
 const after=buildKibaSetpieces(E.realMap(s));
 assert.deepEqual(first,after);
 assert.deepEqual(after,buildKibaSetpieces(E.realMap(s)));
});
test('Siete mapas y los tres finales permanecen en el motor',()=>{
 for(let d=1;d<=7;d++){const ss=E.initial();ss.day=d;assert(E.realMap(ss).length>1);assert(E.rpgMap(ss).length>1);}
 assert(readFileSync('src/engine.ts','utf8').includes('d7Choice'));
});
test('Motor narrativo idéntico al archivo de v0.28',()=>{
 assert.equal(createHash('sha256').update(readFileSync('src/engine.ts')).digest('hex'),'e20e0b66304bceafe4e2c50cb3db2c4fbd649602b507cb22192e29a169277fd0');
});
test('Las cuatro áreas se dibujan por el proyector de libro con oclusión',()=>{
 const src=readFileSync('src/premium/BookMode.ts','utf8');
 for(const t of ['drawKibaSetpieces(s,map,depth)','lineOfSight(map,s.rx,s.ry,wx,wy)','depth[clamp(Math.floor(sx),0,BW-1)]','kibaSetpieceTexture(p.id)'])assert(src.includes(t),t);
});
test('La misma geometría se consume por WebGL2 nativo y Three.js',()=>{
 for(const path of ['src/gfx/RetroWebGL.ts','src/three/ThreeRenderer.ts'])assert(readFileSync(path,'utf8').includes('buildKibaSetpieces('),path);
});
test('Mobiliario antiguo solapado oculto, sin afectar al resto',()=>{
 for(const id of ['evacuation','vending','archive-left','generator'])assert(legacyRoomFixtureShadowed(id));
 for(const id of ['reception','medicine','archive-right','exit-sign'])assert(!legacyRoomFixtureShadowed(id));
});
test('El ZIP offline incluye el atlas, la geometría y los cuatro espacios',()=>{
 const src=readFileSync('dist/bundle.js','utf8');
 for(const term of ['function kibaSetpieceTexture(','function buildKibaSetpieces(','function drawKibaSetpieces(','ARCHIVO / 1988','KIBA / REGISTRO'])assert(src.includes(term),term);
});
console.log('v0.29: '+count+' nuevas pruebas');
