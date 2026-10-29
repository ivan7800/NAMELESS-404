import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NamelessEngine as E} from '../dist/src/engine.js';
import {KIBA_LAMPS,kibaLampIntensity,activeKibaLamps,nearestKibaLamps} from '../dist/src/premium/KibaLighting.js';
import {DayOneSoundscape} from '../dist/src/premium/DayOneAudio.js';
let count=0;
function test(name,fn){fn();count++;console.log('LUZ 0.22 PASS: '+name);}
const scene=E.initial(),map=E.realMap(scene),ids=new Set(KIBA_LAMPS.map(l=>l.id));
test('cuatro luminarias únicas con coordenadas y colores válidos',()=>{
 assert.equal(KIBA_LAMPS.length,4);assert.equal(ids.size,4);
 for(const l of KIBA_LAMPS){for(const value of [l.x,l.y,l.z,l.color,l.strength,l.flicker])assert(Number.isFinite(value));assert(l.strength>0&&l.flicker>=0&&l.flicker<.25);}
});
test('anclas físicas transitables en Kiba',()=>{
 for(const l of KIBA_LAMPS)assert(!E.wall(map,l.x,l.z),'muro: '+l.id);
});
test('solo el día 1 recibe las luces decorativas',()=>{
 assert.equal(activeKibaLamps(1,map).length,4);for(let day=2;day<=7;day++)assert.equal(activeKibaLamps(day,E.realMap({...scene,day})).length,0);
});
test('una pared puede desactivar una luz sin alterar el mapa',()=>{
 const modified=map.slice(),l=KIBA_LAMPS[0],x=Math.floor(l.x),z=Math.floor(l.z);
 modified[z]=modified[z].slice(0,x)+'#'+modified[z].slice(x+1);
 assert.equal(activeKibaLamps(1,modified).length,3);assert(!E.wall(map,l.x,l.z));
});
test('priorización de luces cercana y estable sin aleatoriedad',()=>{
 const near=nearestKibaLamps(2.5,2.5,KIBA_LAMPS);assert.equal(near.length,3);assert.equal(near[0].id,'vestibulo');
 assert.deepEqual(near,nearestKibaLamps(2.5,2.5,KIBA_LAMPS));assert.equal(KIBA_LAMPS.length,4);
});
test('intensidad acotada, suave y determinista sin flashes',()=>{
 for(const l of KIBA_LAMPS)for(let now=0;now<120000;now+=51){
  const v=kibaLampIntensity(l,now,40);assert(Number.isFinite(v));assert(v>0&&v<l.strength*1.15);
  assert.equal(v,kibaLampIntensity(l,now,40));
  if(now>0){const before=kibaLampIntensity(l,now-51,40);assert(Math.abs(v-before)<.045,`${l.id} variación brusca`);}
 }
});
test('amenaza elevada nunca aumenta la iluminación',()=>{
 for(const l of KIBA_LAMPS)for(const now of [0,1500,10000])assert(kibaLampIntensity(l,now,99)<kibaLampIntensity(l,now,0));
});
test('shaders compilables a nivel de contrato: uniforms declarados y nombres locales únicos',()=>{
 const code=readFileSync(new URL('../src/gfx/RetroWebGL.ts',import.meta.url),'utf8');
 const fragment=code.split('const FRAGMENT = `')[1]?.split('`;')[0];
 const vertex=code.split('const VERTEX = `')[1]?.split('`;')[0];
 assert(fragment&&vertex);
 for(const name of ['u_resolution','u_kibaLamp0','u_kibaLamp1','u_kibaLamp2','u_kibaPower'])assert(fragment.includes('uniform ')&&new RegExp('uniform\\s+(?:vec2|vec3)\\s+'+name+'\\s*;').test(fragment),name);
 for(const varying of ['v_world','v_normal','v_depth','v_shade','v_color'])assert(new RegExp('out\\s+\\w+\\s+'+varying+'\\s*;').test(vertex));
 assert.equal((fragment.match(/float\s+(?:filmGrain|surfaceGrain|grain)\s*=/g)||[]).length,2);
 assert(!fragment.includes('float grain='),'reintroducción del fallo 0.21');
 for(const marker of ['gl.uniform2f(this.uniforms.u_resolution','gl.uniform3f(this.uniforms.u_kibaPower','checkFrame()'])assert(code.includes(marker),marker);
});
test('ambos renderizadores comparten fuente y anclajes de luz',()=>{
 const webgl=readFileSync(new URL('../src/gfx/RetroWebGL.ts',import.meta.url),'utf8');
 const three=readFileSync(new URL('../src/three/ThreeRenderer.ts',import.meta.url),'utf8');
 for(const marker of ['activeKibaLamps','kibaLampIntensity'])assert(webgl.includes(marker)&&three.includes(marker));
 assert(three.includes('new PointLight(lamp.color,lamp.strength'));
});
test('diagnóstico de framebuffer real disponible sin lectura automática por frame',()=>{
 const code=readFileSync(new URL('../src/gfx/RetroWebGL.ts',import.meta.url),'utf8');
 assert(code.includes('gl.readPixels('));assert(code.includes('gl.getError()'));
 const boot=readFileSync(new URL('../src/bootstrap.ts',import.meta.url),'utf8');
 assert(boot.includes('gfx.checkFrame()'));
});
test('guardados y siete mapas no son modificados por el plan de luces',()=>{
 const saved=JSON.stringify(scene);for(let day=1;day<=7;day++){const s={...scene,day};const before=JSON.stringify(E.realMap(s));activeKibaLamps(day,E.realMap(s));assert.equal(JSON.stringify(E.realMap(s)),before);}
 assert.equal(JSON.stringify(scene),saved);
});
test('audio ambiental no arranca sin consentimiento y contiene el nuevo zumbido adaptativo',()=>{
 const a=new DayOneSoundscape();assert(!a.isRunning());a.update({...scene,room:'VESTIBULO'},6000);assert(!a.isRunning());
 const code=readFileSync(new URL('../src/premium/DayOneAudio.ts',import.meta.url),'utf8');assert(code.includes('electric*.025'));
});
test('bundle autónomo incluye iluminación y no hace import de dependencias externas',()=>{
 const bundle=readFileSync(new URL('../dist/bundle.js',import.meta.url),'utf8');
 assert(/const\s+KIBA_LAMPS\s*=/.test(bundle));assert(bundle.includes('function nearestKibaLamps('));assert(!/\bimport\s*\(/.test(bundle));
});
console.log(`LUZ v0.22: ${count} pruebas`);
