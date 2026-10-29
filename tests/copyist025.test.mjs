import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NamelessEngine as Engine} from '../dist/src/engine.js';
import {buildCopyistModel} from '../dist/src/premium/CopyistModel.js';
import {kibaDoorStates,buildKibaDoorPanels} from '../dist/src/premium/KibaDoors.js';
import {buildKibaSurfaces} from '../dist/src/premium/KibaSurfaces.js';
let pass=0;
function test(name,fn){fn();pass++;console.log('v0.25 PASS:',name);}
const model=buildCopyistModel(12345,63);
test('La Copista tiene más de 80 piezas reales',()=>assert(model.length>80,model.length));
test('IDs únicos en todas las piezas',()=>assert.equal(new Set(model.map(p=>p.id)).size,model.length));
test('Geometría finita y dimensiones positivas',()=>{
 for(const p of model){for(const k of ['x','y','z','width','height','depth'])assert(Number.isFinite(p[k]),p.id+k);
  for(const k of ['width','height','depth'])assert(p[k]>0,p.id+k);}
});
test('Sin articulaciones ni manos fuera de escala',()=>{
 for(const p of model){assert(p.y>=.0&&p.y<2.35,p.id+' y');assert(Math.abs(p.x)<.7,p.id+' x');}
});
test('Paleta propia limitada y contrastes de máscara',()=>{
 const colors=new Set(model.map(p=>p.color.join(',')));
 assert(colors.size>=6&&colors.size<=12);
 for(const p of model)for(const c of p.color)assert(c>=0&&c<=1);
});
test('Máscara dividida, ojos, boca y costura identificables',()=>{
 for(const id of ['mask-left','mask-right','face-split','eye-left','eye-right','mouth-thread'])assert(model.some(p=>p.id===id),id);
});
test('Silueta con manos y dedos independientes',()=>{
 for(const side of ['left','right'])for(let i=0;i<5;i++)assert(model.some(p=>p.id===`${side}-finger-${i}`));
});
test('Silueta de papel trasera de nueve tiras',()=>assert.equal(model.filter(p=>p.id.startsWith('paper-strip-')).length,9));
test('El modelo es determinista al mismo instante y amenaza',()=>assert.deepEqual(buildCopyistModel(12345,63),model));
test('Animación independiente de extremidades frente a rostro',()=>{
 const before=buildCopyistModel(1000,40),after=buildCopyistModel(1600,40);
 const p=(a,id)=>a.find(x=>x.id===id);
 assert.notEqual(p(before,'left-hand').y,p(after,'left-hand').y);
 assert.notEqual(p(before,'right-shin').z,p(after,'right-shin').z);
 assert.equal(p(before,'mask-left').width,p(after,'mask-left').width);
});
test('Amenaza influye en movimiento sin alterar identidad',()=>{
 const a=buildCopyistModel(1400,0),b=buildCopyistModel(1400,100);
 assert.equal(a.length,b.length);assert.deepEqual(a.map(x=>x.id),b.map(x=>x.id));
 assert.notEqual(a.find(p=>p.id==='left-hand').y,b.find(p=>p.id==='left-hand').y);
});
test('Entradas no finitas no contaminan coordenadas',()=>{
 for(const p of buildCopyistModel(Number.NaN,Number.POSITIVE_INFINITY))assert(Number.isFinite(p.x+p.y+p.z));
});
const unopened=Engine.realMap(Engine.initial());
const openState=Engine.initial();openState.seal=true;openState.tape=true;
openState.flags.kibaNorthOpen=true;openState.flags.kibaArchiveOpen=true;
const opened=Engine.realMap(openState);
test('Dos compuertas cerradas al inicio',()=>assert.equal(kibaDoorStates(unopened).filter(g=>!g.open).length,2));
test('Ambas abren únicamente tras resolver acciones previas',()=>assert.equal(kibaDoorStates(opened).filter(g=>g.open).length,2));
test('Sin compuertas fantasma al usar el mapa original',()=>assert.equal(buildKibaDoorPanels(unopened,{}).length,0));
test('Marco físico persiste al abrir las compuertas',()=>{
 const p=buildKibaDoorPanels(opened,{north:2000,archive:2000});
 assert(p.some(p=>p.id==='door-north-lintel')&&p.some(p=>p.id==='door-archive-pillar-1'));
 assert(!p.some(p=>p.id.includes('leaf')));
});
test('Hojas se retraen con interpolación y desaparecen',()=>{
 const start=buildKibaDoorPanels(opened,{north:0,archive:0});
 const middle=buildKibaDoorPanels(opened,{north:550,archive:550});
 const finish=buildKibaDoorPanels(opened,{north:2000,archive:2000});
 const leaf=id=>a=>a.find(p=>p.id===id);
 assert(leaf('door-north-leaf-1')(start).height>leaf('door-north-leaf-1')(middle).height);
 assert(!leaf('door-north-leaf-1')(finish));
});
test('Las piezas animadas no dejan dimensiones negativas',()=>{
 for(const dt of [0,100,500,1000,1200,1300,9999]){
  for(const p of buildKibaDoorPanels(opened,{north:dt,archive:dt})){
   assert(p.width>0&&p.height>0&&p.depth>0,p.id);
  }
 }
});
test('No se altera ni el estado ni el mapa de partida',()=>{
 const before=JSON.stringify(openState),m=opened.slice();
 buildCopyistModel(23300,96);buildKibaDoorPanels(opened,{north:200,archive:50});
 assert.equal(JSON.stringify(openState),before);assert.deepEqual(opened,m);
});
test('Solo los dos accesos previstos pueden producir puertas',()=>{
 const p=buildKibaDoorPanels(opened,{north:200,archive:500});
 assert(p.every(x=>x.id.startsWith('door-north-')||x.id.startsWith('door-archive-')));
});
test('Modelos compartidos por WebGL2, Three.js y modo libro',()=>{
 const src=['src/gfx/RetroWebGL.ts','src/three/ThreeRenderer.ts','src/premium/BookMode.ts'];
 for(const file of src){assert(readFileSync(new URL('../'+file,import.meta.url),'utf8').includes('buildCopyistModel'),file);}
});
test('Compuertas compartidas por ambos motores 3D',()=>{
 for(const file of ['src/gfx/RetroWebGL.ts','src/three/ThreeRenderer.ts']){
  assert(readFileSync(new URL('../'+file,import.meta.url),'utf8').includes('buildKibaDoorPanels'),file);
 }
});
test('Bundle offline incluye ambos módulos y su sintaxis',()=>{
 const bundle=readFileSync(new URL('../dist/bundle.js',import.meta.url),'utf8');
 assert(bundle.includes('function buildCopyistModel('));assert(bundle.includes('function buildKibaDoorPanels('));
 assert(!/^import.*CopyistModel/gm.test(bundle));
});
test('Siete mapas y tres elecciones finales permanecen disponibles',()=>{
 for(let d=1;d<=7;d++){const s=Engine.initial();s.day=d;assert(Engine.realMap(s).length>2);assert(Engine.rpgMap(s).length>2);}
 const source=readFileSync(new URL('../src/engine.ts',import.meta.url),'utf8');
 for(const ending of ['keep','free','replace'])assert(source.includes(ending));
});
test('Superficies: detalle ambiental distinto de cero y sin repetición de IDs',()=>{
 const marks=buildKibaSurfaces(unopened);assert(marks.length>15);
 assert.equal(new Set(marks.map(p=>p.id)).size,marks.length);
});
test('Superficies: colocación en casillas transitables',()=>{
 for(const m of buildKibaSurfaces(unopened))assert(!Engine.wall(unopened,m.x,m.z),m.id);
});
test('Superficies: delgadas y no invaden el centro de los pasillos',()=>{
 for(const p of buildKibaSurfaces(unopened)){
  assert(Math.min(p.width,p.depth)<.03,p.id);
  assert(p.y-p.height/2>=-.0001,p.id+' suelo');
  assert(p.y+p.height/2<=2.35,p.id+' techo');
 }
});
test('Superficies: materiales originales válidos',()=>{
 for(const m of buildKibaSurfaces(unopened))for(const c of m.color)assert(Number.isFinite(c)&&c>=0&&c<=1,m.id);
});
test('Superficies: geometría estable sin azar temporal',()=>{
 assert.deepEqual(buildKibaSurfaces(unopened),buildKibaSurfaces(unopened));
});
test('Superficies: variantes de moho, goteos y yeso',()=>{
 const ids=buildKibaSurfaces(unopened).map(x=>x.id);
 for(const family of ['mold','drip','plaster'])assert(ids.some(x=>x.includes(family)),family);
});
test('Superficies: también se compilan en el juego offline',()=>{
 const js=readFileSync(new URL('../dist/bundle.js',import.meta.url),'utf8');
 assert(js.includes('function buildKibaSurfaces('));
});
test('Ambos motores 3D incorporan el detalle de superficies',()=>{
 for(const file of ['src/gfx/RetroWebGL.ts','src/three/ThreeRenderer.ts']){
  assert(readFileSync(new URL('../'+file,import.meta.url),'utf8').includes('buildKibaSurfaces'),file);
 }
});
console.log(`v0.25: ${pass} pruebas específicas completadas.`);
