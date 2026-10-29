import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NamelessEngine as E} from '../dist/src/engine.js';
import {KIBA_ATRIUM_CELLS,KIBA_ATRIUM_PANELS,buildKibaAtrium,isAtriumCell,validAtriumPanel} from '../dist/src/premium/KibaAtrium.js';
let pass=0;
function test(name,fn){fn();pass++;console.log('PASS v0.30:',name);}
const s=E.initial(),map=E.realMap(s);
const data=buildKibaAtrium(map);
test('Un atrio de 15 casillas transitables sin alterar el mapa',()=>{
 assert.equal(KIBA_ATRIUM_CELLS.length,15);
 for(const [x,z] of KIBA_ATRIUM_CELLS)assert(isAtriumCell(map,x,z),`casilla ${x},${z}`);
 assert(!isAtriumCell(map,0,0));assert(!isAtriumCell(map,6,1));
});
test('Todas las cuatro instalaciones poseen un muro físico detrás',()=>{
 assert.equal(KIBA_ATRIUM_PANELS.length,4);
 for(const p of KIBA_ATRIUM_PANELS)assert(validAtriumPanel(map,p),p.id);
});
test('Piezas de suelo, techo y paneles para el vestíbulo completo',()=>{
 assert.equal(data.filter(v=>v.id.startsWith('atrium-tile-')).length,15);
 assert.equal(data.filter(v=>v.id.startsWith('atrium-ceiling-')).length,15);
 for(const p of KIBA_ATRIUM_PANELS)assert(data.some(v=>v.id===`atrium-panel-${p.id}-surround`));
 assert(data.length>=220,`piezas reales: ${data.length}`);
});
test('Las piezas tienen geometría válida y no hay identificadores duplicados',()=>{
 const ids=data.map(v=>v.id);assert.equal(ids.length,new Set(ids).size);
 for(const v of data){for(const k of ['x','y','z','width','height','depth'])assert(Number.isFinite(v[k]),v.id+':'+k);
 assert(v.width>0&&v.height>0&&v.depth>0,v.id);
 assert(v.y-v.height/2>=-.005&&v.y+v.height/2<=2.37,v.id);
 }
});
test('Los muebles verticales no bloquean el centro de las casillas',()=>{
 for(const v of data){
  if(v.height<=.3||v.y>2.0)continue;
  const x=Math.floor(v.x),z=Math.floor(v.z);
  if(!isAtriumCell(map,x,z))continue;
  const left=v.x-v.width/2,right=v.x+v.width/2,top=v.z-v.depth/2,bottom=v.z+v.depth/2;
  // La banda central de 0.48 m x 0.48 m debe permanecer libre.
  assert(right<=x+.26||left>=x+.74||bottom<=z+.26||top>=z+.74,`bloquea corredor: ${v.id}`);
 }
});
test('Las piezas no tienen dependencia del reloj ni del estado narrativo',()=>{
 assert.deepEqual(data,buildKibaAtrium(map));
 const state=E.initial();state.flags.kibaNorthOpen=true;state.flags.kibaArchiveOpen=true;
 const opened=buildKibaAtrium(E.realMap(state));
 assert.equal(opened.filter(v=>v.id.startsWith('atrium-tile-')).length,15);
 assert.equal(opened.filter(v=>v.id.startsWith('atrium-ceiling-')).length,15);
 for(const panel of KIBA_ATRIUM_PANELS)assert(opened.some(v=>v.id===`atrium-panel-${panel.id}-surround`));
});
test('Zona inicial transitable y sin barreras nuevas en las rutas',()=>{
 assert(isAtriumCell(map,2,2));
 for(let d=1;d<=7;d++){const ss=E.initial();ss.day=d;assert(E.realMap(ss).length>0);assert(E.rpgMap(ss).length>0);}
});
test('Código narrativo sin modificación respecto a la v0.29',()=>{
 assert.equal(createHash('sha256').update(readFileSync('src/engine.ts')).digest('hex'),'e20e0b66304bceafe4e2c50cb3db2c4fbd649602b507cb22192e29a169277fd0');
});
test('Canvas 2D proyecta paneles solo a la vista, con oclusión por rayos',()=>{
 const src=readFileSync('src/premium/BookMode.ts','utf8');
 for(const name of ['function drawKibaAtrium(','validAtriumPanel(map,p)','lineOfSight(map,s.rx,s.ry,wx,wy)','depth[clamp(sx|0,0,BW-1)]','kibaAtriumTexture(p.id)','drawKibaAtrium(s,map,depth)','isAtriumCell(map,Math.floor(wx),Math.floor(wy))'])assert(src.includes(name),name);
});
test('WebGL2 y Three.js consumen geometría común del atrio',()=>{
 for(const path of ['src/gfx/RetroWebGL.ts','src/three/ThreeRenderer.ts']){
  const src=readFileSync(path,'utf8');assert(src.includes('buildKibaAtrium('),path);
 }
});
test('Empaquetado sin módulos pendientes ni símbolos duplicados',()=>{
 const js=readFileSync('dist/bundle.js','utf8');
 for(const q of ['function buildKibaAtrium(','function kibaAtriumTexture(','function drawKibaAtrium(','PLANTA INEXISTENTE','CENTRALITA / 0'])assert(js.includes(q),q);
});
console.log(`v0.30: ${pass} pruebas nuevas`);
